import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyOrderToken } from '@/lib/checkout/return-token'
import { alertOwnerOnce, hasPendingPayment, loadOrder, reconcileWithCashfree } from '@/lib/checkout/orders'
import { startCashfreePayment } from '@/lib/checkout/start-payment'
import { createAdminClient } from '@/lib/supabase/admin'
import { ORDER_NUMBER_RE } from '@/lib/checkout/order-number'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  orderNumber: z.string().regex(ORDER_NUMBER_RE),
  token: z.string().min(10).max(64),
  action: z.enum(['pay', 'pay_later']),
})

/**
 * From the order page: pay again after a failed or abandoned payment, or give up on paying
 * online and turn the order into a pay-later order the shop confirms on WhatsApp.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { orderNumber, token, action } = parsed.data
  if (!verifyOrderToken(orderNumber, token)) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  let order = await loadOrder(orderNumber)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // A payment may have gone through since the page loaded: never charge twice.
  order = await reconcileWithCashfree(order).catch(() => order!)
  if (order.payment_status === 'paid') return NextResponse.json({ paymentStatus: 'paid' })
  if (order.status === 'cancelled') return NextResponse.json({ error: 'This order was cancelled. Please WhatsApp us.' }, { status: 409 })

  if (action === 'pay_later') {
    const sb = createAdminClient()
    await sb
      .from('orders')
      .update({ payment_method: 'pay_later', payment_status: 'unpaid' })
      .eq('id', order.id)
      .neq('payment_status', 'paid')
    await alertOwnerOnce({ ...order, payment_method: 'pay_later', payment_status: 'unpaid' })
    return NextResponse.json({ paymentStatus: 'unpaid' })
  }

  // A UPI payment still confirming may yet succeed: a second attempt now could charge twice.
  if (await hasPendingPayment(order)) {
    return NextResponse.json(
      { paymentStatus: 'awaiting_payment', error: 'Your bank is still confirming the earlier payment. Please wait a few minutes before paying again.' },
      { status: 409 },
    )
  }

  const started = await startCashfreePayment(order, request)
  if (!started.ok) return NextResponse.json({ error: started.error }, { status: 502 })
  return NextResponse.json({ paymentSessionId: started.paymentSessionId, cashfreeMode: started.mode })
}
