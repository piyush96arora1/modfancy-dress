import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkoutSchema } from '@/lib/checkout/schema'
import { priceLines, type ProductRow } from '@/lib/checkout/pricing'
import { deliveryFee, isDeliveryAllowed } from '@/lib/delivery/config'
import { estimateDelivery, estimateLabel } from '@/lib/delivery/pincode'
import { newOrderNumber } from '@/lib/checkout/order-number'
import { orderToken } from '@/lib/checkout/return-token'
import { alertOwnerOnce, loadOrder } from '@/lib/checkout/orders'
import { startCashfreePayment } from '@/lib/checkout/start-payment'
import { getWholesaleDiscountPctCached } from '@/lib/supabase/cached-queries'

export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 16_000

/**
 * Place an order. Both checkout buttons come here:
 * - pay: 'later'  → order saved as pay-later, owner alerted, customer goes to the order page.
 * - pay: 'online' → order saved as awaiting_payment, a Cashfree order is created, and the
 *                   browser opens Cashfree checkout with the returned paymentSessionId.
 *
 * Every amount is computed here from the database; nothing from the browser is trusted.
 */
export async function POST(request: Request) {
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(json)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) fields[issue.path.join('.')] ??= issue.message
    return NextResponse.json({ error: 'Please check the highlighted details', fields }, { status: 400 })
  }
  const req = parsed.data
  if (req.website) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  if (req.pay === 'online' && req.pricingMode === 'wholesale') {
    return NextResponse.json(
      { error: 'Wholesale orders are confirmed on WhatsApp. Please use “Place order, pay later”.' },
      { status: 400 },
    )
  }
  if (!isDeliveryAllowed(req.delivery.method, req.delivery.pincode)) {
    return NextResponse.json(
      { error: 'That delivery option is not available for this pincode', fields: { 'delivery.method': 'Choose a delivery option' } },
      { status: 400 },
    )
  }

  const sb = createAdminClient()
  const productIds = [...new Set(req.items.map((i) => i.productId))]
  const { data: products, error: productsError } = await sb
    .from('products')
    .select('id, name, price, wholesale_price, is_active, deleted_at, variants:product_variants(id, size, color, price_override, wholesale_price_override)')
    .in('id', productIds)
  if (productsError) {
    console.error('checkout: product lookup failed', productsError)
    return NextResponse.json({ error: 'We could not reach our store right now. Please try again in a minute.' }, { status: 503 })
  }

  const wholesaleDiscountPct = req.pricingMode === 'wholesale' ? await getWholesaleDiscountPctCached().catch(() => 30) : 30
  const priced = priceLines(req.items, (products ?? []) as ProductRow[], { mode: req.pricingMode, wholesaleDiscountPct })
  if (!priced.ok) {
    const message =
      priced.reason === 'unavailable'
        ? 'One of the items in your cart is no longer available. Please remove it and try again.'
        : 'Please check the quantities in your cart.'
    return NextResponse.json({ error: message, reason: priced.reason, productId: priced.productId }, { status: 409 })
  }

  const fee = deliveryFee(req.delivery.method, priced.subtotal)
  const total = priced.subtotal + fee

  // Prices changed since the item went into the cart: show the customer before charging.
  if (req.expectedTotal != null && Math.abs(req.expectedTotal - total) >= 0.5) {
    return NextResponse.json(
      {
        error: `Some prices have changed since you added them. Your new total is ₹${Math.round(total)}. Please check and tap again.`,
        reason: 'price_changed',
        total,
        prices: priced.lines.map((l) => ({ productId: l.productId, variantId: l.variantId, price: l.unitPrice })),
      },
      { status: 409 },
    )
  }
  const estimate = estimateDelivery(req.delivery.pincode)
  const orderNumber = newOrderNumber()

  const shippingAddress = {
    pincode: req.delivery.pincode,
    ...(req.delivery.method !== 'pickup'
      ? {
          address: req.delivery.address1,
          ...(req.delivery.address2 ? { address2: req.delivery.address2 } : {}),
          city: req.delivery.city,
          ...(req.delivery.state ? { state: req.delivery.state } : {}),
        }
      : { city: req.delivery.city || undefined }),
    ...(req.eventDate ? { event_date: req.eventDate } : {}),
    ...(estimate.kind !== 'invalid' ? { delivery_estimate: estimateLabel(estimate) } : {}),
  }

  const { error: insertError } = await sb.rpc('create_order', {
    p: {
      order_number: orderNumber,
      customer_name: req.customer.name,
      customer_email: req.customer.email ?? '',
      customer_phone: req.customer.phone,
      shipping_address: shippingAddress,
      total_amount: total,
      items_subtotal: priced.subtotal,
      delivery_fee: fee,
      delivery_method: req.delivery.method,
      payment_method: req.pay === 'online' ? 'online' : 'pay_later',
      payment_status: req.pay === 'online' ? 'awaiting_payment' : 'unpaid',
      items: priced.lines.map((l) => ({
        product_id: l.productId,
        variant_id: l.variantId ?? '',
        product_name: l.name,
        size: l.size ?? '',
        color: l.color ?? '',
        quantity: l.quantity,
        price: l.unitPrice,
      })),
    },
  })
  if (insertError) {
    console.error('checkout: create_order failed', insertError)
    return NextResponse.json({ error: 'We could not save your order. Please try again, or WhatsApp us.' }, { status: 500 })
  }

  const token = orderToken(orderNumber)
  const order = await loadOrder(orderNumber)
  if (!order) return NextResponse.json({ error: 'We could not save your order. Please try again.' }, { status: 500 })

  const summary = {
    orderNumber,
    token,
    subtotal: priced.subtotal,
    deliveryFee: fee,
    total,
    items: priced.lines.map((l) => ({ productId: l.productId, name: l.name, quantity: l.quantity, price: l.unitPrice })),
  }

  if (req.pay === 'later') {
    await alertOwnerOnce(order)
    return NextResponse.json({ ...summary, pay: 'later' })
  }

  const started = await startCashfreePayment(order, request)
  if (!started.ok) {
    // The order exists; the customer can retry payment or switch to pay later from its page.
    return NextResponse.json({ ...summary, pay: 'online', paymentError: started.error }, { status: 502 })
  }
  return NextResponse.json({ ...summary, pay: 'online', paymentSessionId: started.paymentSessionId, cashfreeMode: started.mode })
}
