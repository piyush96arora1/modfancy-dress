import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { CashfreeError, cashfreeEnv, createCashfreeOrder } from '@/lib/payments/cashfree'
import { cashfreeAttempt, retryCashfreeOrderId } from '@/lib/checkout/order-number'
import { orderToken } from '@/lib/checkout/return-token'
import type { StoredOrder } from '@/lib/checkout/orders'

/**
 * Public origin for links Cashfree sends the customer back to. Production uses the canonical
 * site; previews and local dev use the origin they were reached on.
 */
export function publicOrigin(request: Request): string {
  if (process.env.CASHFREE_ENV === 'production') {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com').replace(/\/$/, '')
  }
  return new URL(request.url).origin
}

export type StartResult =
  | { ok: true; paymentSessionId: string; mode: 'sandbox' | 'production' }
  | { ok: false; error: string }

/**
 * Create a Cashfree order for a stored order and remember its id. Each call is a new
 * payment attempt (Cashfree order ids are single-use): MFD-…, then MFD-…-R2, -R3.
 */
export async function startCashfreePayment(order: StoredOrder, request: Request): Promise<StartResult> {
  const attempt = order.cf_order_id ? cashfreeAttempt(order.cf_order_id) + 1 : 1
  const cfOrderId = retryCashfreeOrderId(order.order_number, attempt)
  const origin = publicOrigin(request)
  const returnUrl = `${origin}/order/${order.order_number}?t=${orderToken(order.order_number)}`
  // Cashfree only posts webhooks to https. Local dev (http) relies on the order page and
  // the status poller asking Cashfree directly, which is the same code path as a lost webhook.
  const notifyUrl = origin.startsWith('https://') ? `${origin}/api/payments/cashfree/webhook` : undefined

  try {
    const cf = await createCashfreeOrder({
      orderId: cfOrderId,
      amount: order.total_amount,
      customer: { phone: order.customer_phone, name: order.customer_name, email: order.customer_email },
      returnUrl,
      notifyUrl,
      note: `Mod Fancy Dress order ${order.order_number}`,
      tags: { order_number: order.order_number },
      idempotencyKey: `${order.id}-${attempt}`,
    })
    const sb = createAdminClient()
    const { error } = await sb
      .from('orders')
      .update({ cf_order_id: cfOrderId, payment_status: 'awaiting_payment', payment_method: 'online' })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
    if (error) throw error
    return { ok: true, paymentSessionId: cf.payment_session_id, mode: cashfreeEnv() }
  } catch (error) {
    console.error('Cashfree create order failed', order.order_number, error instanceof CashfreeError ? `${error.status} ${error.code} ${error.message}` : error)
    return { ok: false, error: 'Online payment is not available right now. You can try again, or place the order and pay later.' }
  }
}
