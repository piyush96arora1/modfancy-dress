import { NextResponse } from 'next/server'
import { verifyOrderToken } from '@/lib/checkout/return-token'
import { loadOrder, paymentProgress, reconcileWithCashfree } from '@/lib/checkout/orders'
import { ORDER_NUMBER_RE } from '@/lib/checkout/order-number'

export const dynamic = 'force-dynamic'

/** Polled by the order page while a payment is confirming. Asks Cashfree directly, so it
 *  does not depend on the webhook having arrived. */
export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const token = new URL(request.url).searchParams.get('t')
  if (!ORDER_NUMBER_RE.test(orderNumber) || !verifyOrderToken(orderNumber, token)) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: { 'cache-control': 'no-store' } })
  }
  let order = await loadOrder(orderNumber)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: { 'cache-control': 'no-store' } })
  try {
    order = await reconcileWithCashfree(order)
  } catch (error) {
    console.error('status: Cashfree check failed', orderNumber, error)
  }
  const progress = await paymentProgress(order)
  return NextResponse.json(
    { paymentStatus: order.payment_status, status: order.status, paymentMethod: order.payment_method, ...progress },
    { headers: { 'cache-control': 'no-store' } },
  )
}
