import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ORDER_NUMBER_RE } from '@/lib/checkout/order-number'
import { verifyOrderToken } from '@/lib/checkout/return-token'
import { loadOrder, paymentProgress, publicOrderView, reconcileWithCashfree } from '@/lib/checkout/orders'
import { OrderStatusClient } from '@/components/checkout/OrderStatusClient'

// Per-customer, always fresh. No loading.tsx here: a Suspense boundary at the route level
// commits a 200 before notFound() can set 404 (see memory: loading-tsx-breaks-404-status).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
}

/**
 * Where Cashfree sends the customer back (return_url), and the link every order keeps.
 * `?t=` (an HMAC of the order number) proves the visitor placed it; without it, the visitor
 * is sent to /track to confirm with their mobile number.
 */
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { orderNumber } = await params
  const { t } = await searchParams
  if (!ORDER_NUMBER_RE.test(orderNumber)) notFound()
  if (!verifyOrderToken(orderNumber, t)) redirect(`/track?order=${encodeURIComponent(orderNumber)}`)

  let order = await loadOrder(orderNumber)
  if (!order) notFound()
  try {
    // Ask Cashfree now rather than wait for the webhook: most customers land here paid.
    order = await reconcileWithCashfree(order)
  } catch (error) {
    console.error('order page: Cashfree check failed', orderNumber, error)
  }

  const progress = await paymentProgress(order)
  return <OrderStatusClient initial={publicOrderView(order)} initialProgress={progress} token={t!} />
}
