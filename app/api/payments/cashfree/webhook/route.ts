import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCashfreeSignature } from '@/lib/payments/cashfree'
import { loadOrderByCashfreeId, reconcileWithCashfree } from '@/lib/checkout/orders'

export const dynamic = 'force-dynamic'

type WebhookBody = {
  type?: string
  data?: {
    order?: { order_id?: string }
    payment?: { cf_payment_id?: string | number; payment_status?: string }
  }
}

/**
 * Cashfree payment webhooks (sent to the notify_url given per order).
 *
 * The payload is only a nudge: after verifying the signature we ask Cashfree for the order's
 * real state (reconcileWithCashfree), so a forged, stale or out-of-order event can't mark
 * anything paid. Duplicates (Cashfree delivers at least once) are dropped on the
 * idempotency key. Always answers 200 for events we've recorded, so Cashfree stops retrying.
 */
export async function POST(request: Request) {
  const raw = await request.text()
  const ok = verifyCashfreeSignature(
    raw,
    request.headers.get('x-webhook-timestamp'),
    request.headers.get('x-webhook-signature'),
  )
  if (!ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 })

  let body: WebhookBody
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const type = body.type ?? 'UNKNOWN'
  const cfOrderId = body.data?.order?.order_id
  const cfPaymentId = body.data?.payment?.cf_payment_id
  const idempotencyKey =
    request.headers.get('x-idempotency-key') ?? `${type}:${cfOrderId ?? ''}:${cfPaymentId ?? ''}`

  const sb = createAdminClient()
  const order = cfOrderId ? await loadOrderByCashfreeId(cfOrderId) : null

  const { error: logError } = await sb.from('payment_events').insert({
    order_id: order?.id ?? null,
    cf_order_id: cfOrderId ?? null,
    event_type: type,
    cf_payment_id: cfPaymentId == null ? null : String(cfPaymentId),
    payment_status: body.data?.payment?.payment_status ?? null,
    idempotency_key: idempotencyKey,
    payload: body,
  })
  if (logError?.code === '23505') return NextResponse.json({ ok: true, duplicate: true })
  if (logError) console.error('webhook: could not log event', logError)

  if (!order) {
    // Not ours (e.g. a Payment Link) or an order id we don't know: recorded, nothing to do.
    return NextResponse.json({ ok: true, matched: false })
  }

  try {
    await reconcileWithCashfree(order, cfOrderId)
  } catch (error) {
    // Ask Cashfree to retry later; the order page poller will also catch up.
    console.error('webhook: reconcile failed', cfOrderId, error)
    await sb.from('payment_events').delete().eq('idempotency_key', idempotencyKey)
    return NextResponse.json({ error: 'retry' }, { status: 503 })
  }
  return NextResponse.json({ ok: true })
}
