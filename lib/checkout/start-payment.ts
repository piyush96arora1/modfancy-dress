import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { createRazorpayOrder, razorpayKeyId, RazorpayError, toPaise } from '@/lib/payments/razorpay'
import { orderToken } from '@/lib/checkout/return-token'
import type { StoredOrder } from '@/lib/checkout/orders'

/**
 * Public origin for links the gateway sends the customer back to. Production uses the
 * canonical site; previews and local dev use the origin they were reached on.
 */
export function publicOrigin(request: Request): string {
  if (process.env.VERCEL_ENV === 'production') {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com').replace(/\/$/, '')
  }
  return new URL(request.url).origin
}

/** Everything the browser needs to open Razorpay Checkout for one attempt. */
export type PaymentHandoff = {
  gateway: 'razorpay'
  keyId: string
  orderId: string
  amount: number // paise
  currency: 'INR'
  description: string
  callbackUrl: string
  prefill: { name: string; contact: string; email?: string }
}

export type StartResult = { ok: true; payment: PaymentHandoff } | { ok: false; error: string }

/**
 * Create a Razorpay order for a stored order and remember its id. Each call is a new payment
 * attempt with its own Razorpay order; the webhook and callback find our order again through
 * notes.order_number, so a late payment on an earlier attempt still lands.
 */
export async function startPayment(order: StoredOrder, request: Request): Promise<StartResult> {
  const origin = publicOrigin(request)
  const token = orderToken(order.order_number)

  try {
    const rzp = await createRazorpayOrder({
      amount: order.total_amount,
      receipt: order.order_number,
      notes: { order_number: order.order_number },
    })
    const sb = createAdminClient()
    const { error } = await sb
      .from('orders')
      .update({ cf_order_id: rzp.id, payment_status: 'awaiting_payment', payment_method: 'online' })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
    if (error) throw error
    return {
      ok: true,
      payment: {
        gateway: 'razorpay',
        keyId: razorpayKeyId(),
        orderId: rzp.id,
        amount: toPaise(order.total_amount),
        currency: 'INR',
        description: `Order ${order.order_number}`,
        callbackUrl: `${origin}/api/payments/razorpay/callback?n=${encodeURIComponent(order.order_number)}&t=${encodeURIComponent(token)}`,
        prefill: {
          name: order.customer_name,
          contact: `+91${order.customer_phone.slice(-10)}`,
          ...(order.customer_email ? { email: order.customer_email } : {}),
        },
      },
    }
  } catch (error) {
    console.error('Razorpay create order failed', order.order_number, error instanceof RazorpayError ? `${error.status} ${error.code} ${error.message}` : error)
    return { ok: false, error: 'Online payment is not available right now. You can try again, or place the order and pay later.' }
  }
}
