import { NextResponse } from 'next/server'
import { z } from 'zod'
import { loadOrder, publicOrderView, reconcileWithCashfree } from '@/lib/checkout/orders'
import { normaliseIndianMobile } from '@/lib/checkout/schema'
import { orderToken } from '@/lib/checkout/return-token'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({ orderNumber: z.string().trim().max(40), phone: z.string().max(20) })

/** Order lookup without an account: order number + the mobile number used at checkout.
 *  Any mismatch gets the same "not found", so the endpoint can't confirm an order exists. */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  const notFound = NextResponse.json(
    { error: 'We couldn’t find an order with that number and mobile. Check both, or WhatsApp us.' },
    { status: 404 },
  )
  if (!parsed.success) return notFound
  const orderNumber = parsed.data.orderNumber.toUpperCase().replace(/\s+/g, '')
  const phone = normaliseIndianMobile(parsed.data.phone)

  let order = await loadOrder(orderNumber).catch(() => null)
  if (!order || normaliseIndianMobile(order.customer_phone) !== phone) return notFound
  order = await reconcileWithCashfree(order).catch(() => order!)

  // The phone check proves ownership, so hand back the order page link too.
  return NextResponse.json({ order: publicOrderView(order), token: orderToken(order.order_number) })
}
