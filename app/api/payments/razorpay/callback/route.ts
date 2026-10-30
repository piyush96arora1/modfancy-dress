import { NextResponse } from 'next/server'
import { verifyOrderToken } from '@/lib/checkout/return-token'
import { ORDER_NUMBER_RE } from '@/lib/checkout/order-number'
import { loadOrder, reconcilePayment } from '@/lib/checkout/orders'
import { isRazorpayOrderId, verifyRazorpayPaymentSignature } from '@/lib/payments/razorpay'

export const dynamic = 'force-dynamic'

/**
 * Where Razorpay Checkout sends the customer (callback_url with redirect: true). It POSTs a
 * form: razorpay_payment_id / razorpay_order_id / razorpay_signature on success, or
 * error[...] fields on failure. A full-page redirect survives phones switching to the UPI app
 * and back, where an in-page handler would be lost.
 *
 * The form is only a hint: a valid signature tells us which Razorpay order to check, and
 * reconcilePayment asks Razorpay for the real state. Either way the customer lands on their
 * order page, which shows paid / pending / failed and polls until it settles.
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const orderNumber = url.searchParams.get('n') ?? ''
  const token = url.searchParams.get('t') ?? ''
  if (!ORDER_NUMBER_RE.test(orderNumber) || !verifyOrderToken(orderNumber, token)) {
    return NextResponse.redirect(new URL('/track', url), 303)
  }
  const orderPage = new URL(`/order/${orderNumber}?t=${encodeURIComponent(token)}`, url)

  const form = await request.formData().catch(() => null)
  const paymentId = String(form?.get('razorpay_payment_id') ?? '')
  const rzpOrderId = String(form?.get('razorpay_order_id') ?? '')
  const signature = String(form?.get('razorpay_signature') ?? '')

  try {
    const order = await loadOrder(orderNumber)
    if (order) {
      const signed = isRazorpayOrderId(rzpOrderId) && paymentId && verifyRazorpayPaymentSignature(rzpOrderId, paymentId, signature)
      await reconcilePayment(order, signed ? rzpOrderId : undefined)
    }
  } catch (error) {
    // The order page and its poller check again; never strand the customer here.
    console.error('razorpay callback: reconcile failed', orderNumber, error)
  }
  return NextResponse.redirect(orderPage, 303)
}
