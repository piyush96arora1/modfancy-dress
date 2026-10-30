import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay'
import { loadOrderByRazorpayId, reconcilePayment } from '@/lib/checkout/orders'

export const dynamic = 'force-dynamic'

type WebhookBody = {
  event?: string
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; status?: string } }
    order?: { entity?: { id?: string } }
  }
}

/**
 * Razorpay webhooks (payment.captured, payment.failed, order.paid), configured in the
 * dashboard with RAZORPAY_WEBHOOK_SECRET.
 *
 * Same contract as the Cashfree one: after verifying the signature we ask Razorpay for the
 * order's real state, so a forged or out-of-order event can't mark anything paid. Duplicates
 * (at-least-once delivery) are dropped on x-razorpay-event-id.
 */
export async function POST(request: Request) {
  const raw = await request.text()
  if (!verifyRazorpayWebhookSignature(raw, request.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let body: WebhookBody
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const type = body.event ?? 'unknown'
  const payment = body.payload?.payment?.entity
  const rzpOrderId = payment?.order_id ?? body.payload?.order?.entity?.id
  const idempotencyKey = request.headers.get('x-razorpay-event-id') ?? `${type}:${rzpOrderId ?? ''}:${payment?.id ?? ''}`

  const sb = createAdminClient()
  // Payment Links / QR payments have no order of ours: recorded below, nothing to reconcile.
  const order = rzpOrderId ? await loadOrderByRazorpayId(rzpOrderId).catch(() => null) : null

  const { error: logError } = await sb.from('payment_events').insert({
    order_id: order?.id ?? null,
    cf_order_id: rzpOrderId ?? null,
    event_type: type,
    cf_payment_id: payment?.id ?? null,
    payment_status: payment?.status ?? null,
    idempotency_key: idempotencyKey,
    payload: body,
  })
  if (logError?.code === '23505') return NextResponse.json({ ok: true, duplicate: true })
  if (logError) console.error('razorpay webhook: could not log event', logError)

  if (!order || !rzpOrderId) return NextResponse.json({ ok: true, matched: false })

  try {
    await reconcilePayment(order, rzpOrderId)
  } catch (error) {
    // Ask Razorpay to retry later; the order page poller will also catch up.
    console.error('razorpay webhook: reconcile failed', rzpOrderId, error)
    await sb.from('payment_events').delete().eq('idempotency_key', idempotencyKey)
    return NextResponse.json({ error: 'retry' }, { status: 503 })
  }
  return NextResponse.json({ ok: true })
}
