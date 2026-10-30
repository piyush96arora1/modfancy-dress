import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getCashfreeOrder,
  getCashfreePayments,
  paymentStatusFromCashfree,
  type CashfreePayment,
} from '@/lib/payments/cashfree'
import {
  getRazorpayOrder,
  getRazorpayPayments,
  isRazorpayOrderId,
  paymentStatusFromRazorpay,
  type RazorpayPayment,
} from '@/lib/payments/razorpay'
import { orderAlertText, sendOwnerAlert, type AlertOrder } from '@/lib/notify/telegram'
import { siteBaseUrl } from '@/lib/constants/contact'
import { orderNumberFromCashfreeId } from '@/lib/checkout/order-number'

export type OrderPaymentStatus = 'unpaid' | 'awaiting_payment' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'

export type StoredOrder = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  shipping_address: {
    address?: string
    address2?: string
    city?: string
    state?: string
    pincode?: string
    event_date?: string
  } | null
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  items_subtotal: number | null
  delivery_fee: number
  delivery_method: 'courier' | 'porter' | 'pickup' | null
  payment_method: 'online' | 'pay_later'
  payment_status: OrderPaymentStatus
  cf_order_id: string | null
  cf_payment_id: string | null
  payment_group: string | null
  paid_amount: number | null
  paid_at: string | null
  owner_alerted_at: string | null
  created_at: string
  deleted_at: string | null
  items: { product_id: string | null; product_name: string; size: string | null; color: string | null; quantity: number; price: number }[]
}

const ORDER_SELECT =
  'id, order_number, customer_name, customer_email, customer_phone, shipping_address, status, total_amount, items_subtotal, delivery_fee, delivery_method, payment_method, payment_status, cf_order_id, cf_payment_id, payment_group, paid_amount, paid_at, owner_alerted_at, created_at, deleted_at, items:order_items(product_id, product_name, size, color, quantity, price)'

function normalise(row: Record<string, unknown>): StoredOrder {
  const o = row as unknown as StoredOrder
  return {
    ...o,
    total_amount: Number(o.total_amount),
    items_subtotal: o.items_subtotal == null ? null : Number(o.items_subtotal),
    delivery_fee: Number(o.delivery_fee ?? 0),
    paid_amount: o.paid_amount == null ? null : Number(o.paid_amount),
    items: (o.items ?? []).map((i) => ({ ...i, price: Number(i.price) })),
  }
}

export async function loadOrder(orderNumber: string): Promise<StoredOrder | null> {
  const sb = createAdminClient()
  const { data, error } = await sb
    .from('orders')
    .select(ORDER_SELECT)
    .eq('order_number', orderNumber)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data ? normalise(data) : null
}

/** The order a Cashfree order id belongs to, including earlier retry attempts (MFD-…-R2). */
export async function loadOrderByCashfreeId(cfOrderId: string): Promise<StoredOrder | null> {
  return loadOrder(orderNumberFromCashfreeId(cfOrderId))
}

/** True while a UPI/bank payment on the current attempt is still confirming. */
export async function hasPendingPayment(order: StoredOrder): Promise<boolean> {
  return (await paymentProgress(order)).bankPending
}

/**
 * For an order waiting on payment: has the customer tried to pay on the current attempt, and
 * is a bank still confirming? Drives what the order page says (and whether it offers "Pay"
 * again, which it must not while a payment could still succeed).
 */
export async function paymentProgress(order: StoredOrder): Promise<{ attempted: boolean; bankPending: boolean }> {
  if (order.payment_status !== 'awaiting_payment' || !order.cf_order_id) return { attempted: false, bankPending: false }
  if (isRazorpayOrderId(order.cf_order_id)) {
    const payments = await getRazorpayPayments(order.cf_order_id).catch(() => [] as RazorpayPayment[])
    return {
      attempted: payments.length > 0,
      bankPending: payments.some((p) => p.status === 'authorized'),
    }
  }
  const payments = await getCashfreePayments(order.cf_order_id).catch(() => [] as CashfreePayment[])
  return {
    attempted: payments.some((p) => p.payment_status !== 'NOT_ATTEMPTED'),
    bankPending: payments.some((p) => p.payment_status === 'PENDING'),
  }
}

function adminUrl(order: Pick<StoredOrder, 'id'>): string {
  return `${siteBaseUrl()}/admin/orders/${order.id}`
}

/**
 * Send the owner one Telegram alert per order. The conditional update (owner_alerted_at IS
 * NULL) means a webhook retry, the return page and the poller racing each other still
 * produce exactly one alert.
 */
export async function alertOwnerOnce(order: StoredOrder): Promise<void> {
  const sb = createAdminClient()
  const { data } = await sb
    .from('orders')
    .update({ owner_alerted_at: new Date().toISOString() })
    .eq('id', order.id)
    .is('owner_alerted_at', null)
    .select('id')
  if (!data || data.length === 0) return
  const sent = await sendOwnerAlert(orderAlertText(order as AlertOrder, adminUrl(order)))
  if (!sent) {
    // Release the claim so the next webhook retry or page visit tries again.
    await sb.from('orders').update({ owner_alerted_at: null }).eq('id', order.id)
  }
}

/** The order a Razorpay order belongs to: we put our order number in its notes. */
export async function loadOrderByRazorpayId(rzpOrderId: string): Promise<StoredOrder | null> {
  const rzpOrder = await getRazorpayOrder(rzpOrderId)
  const notes = rzpOrder.notes as Record<string, string> | undefined
  const orderNumber = notes && !Array.isArray(notes) ? notes.order_number : undefined
  return orderNumber ? loadOrder(orderNumber) : null
}

type GatewayState = {
  next: 'paid' | 'awaiting_payment' | 'failed'
  success?: { paymentId: string; amount: number; paidAt: string; group: string | null }
}

/**
 * Ask the gateway that owns this id for the truth. Razorpay ids start with order_; anything
 * else is a Cashfree order id from before the switch (30 Oct 2026). Both live in cf_order_id /
 * cf_payment_id, which now mean "gateway order / payment id".
 */
async function gatewayState(gatewayOrderId: string): Promise<GatewayState> {
  if (isRazorpayOrderId(gatewayOrderId)) {
    const [rzpOrder, payments] = await Promise.all([
      getRazorpayOrder(gatewayOrderId),
      getRazorpayPayments(gatewayOrderId).catch(() => [] as RazorpayPayment[]),
    ])
    const next = paymentStatusFromRazorpay(rzpOrder, payments)
    const captured = payments.find((p) => p.status === 'captured')
    return {
      next,
      success: next === 'paid'
        ? {
            paymentId: captured?.id ?? '',
            amount: (captured?.amount ?? rzpOrder.amount_paid ?? rzpOrder.amount) / 100,
            paidAt: captured ? new Date(captured.created_at * 1000).toISOString() : new Date().toISOString(),
            group: captured?.method ?? null,
          }
        : undefined,
    }
  }
  const [cfOrder, payments] = await Promise.all([
    getCashfreeOrder(gatewayOrderId),
    getCashfreePayments(gatewayOrderId).catch(() => [] as CashfreePayment[]),
  ])
  const next = paymentStatusFromCashfree(cfOrder, payments)
  const success = payments.find((p) => p.payment_status === 'SUCCESS')
  return {
    next,
    success: next === 'paid'
      ? {
          paymentId: success ? String(success.cf_payment_id) : '',
          amount: success?.payment_amount ?? cfOrder.order_amount,
          paidAt: success?.payment_completion_time ?? success?.payment_time ?? new Date().toISOString(),
          group: success?.payment_group ?? null,
        }
      : undefined,
  }
}

/**
 * Bring an online order's payment_status in line with its payment gateway. Called by the
 * webhooks, the order page and the status poller, so a late or lost webhook never leaves a
 * paid customer looking at "pending". Never downgrades a paid order.
 */
export async function reconcilePayment(order: StoredOrder, gatewayOrderId?: string): Promise<StoredOrder> {
  const checkId = gatewayOrderId ?? order.cf_order_id
  if (!checkId) return order
  if (order.payment_status === 'paid' || order.payment_status === 'refunded' || order.payment_status === 'partially_refunded') return order
  // A pay-later order is only re-checked when a webhook names one of its earlier attempts
  // (customer switched to pay later, then a pending UPI payment completed after all).
  if (order.payment_method !== 'online' && !gatewayOrderId) return order

  const { next, success } = await gatewayState(checkId)
  // An older attempt that did not pay says nothing about the current one.
  if (gatewayOrderId && gatewayOrderId !== order.cf_order_id && next !== 'paid') return order
  if (order.payment_method !== 'online' && next !== 'paid') return order
  if (next === order.payment_status) return order

  const sb = createAdminClient()
  if (next === 'paid') {
    const patch = {
      payment_status: 'paid' as const,
      payment_method: 'online' as const,
      cf_order_id: checkId,
      paid_amount: success?.amount ?? order.total_amount,
      paid_at: success?.paidAt ?? new Date().toISOString(),
      cf_payment_id: success?.paymentId || order.cf_payment_id,
      payment_group: success?.group ?? order.payment_group,
    }
    await sb.from('orders').update(patch).eq('id', order.id).neq('payment_status', 'paid')
    const paid = { ...order, ...patch }
    await alertOwnerOnce(paid)
    return paid
  }

  // awaiting <-> failed only; a paid row is excluded by the filter.
  await sb.from('orders').update({ payment_status: next }).eq('id', order.id).in('payment_status', ['awaiting_payment', 'failed'])
  return { ...order, payment_status: next }
}

/** The customer-facing view: never includes phone, email or the street address. */
export function publicOrderView(order: StoredOrder) {
  return {
    orderNumber: order.order_number,
    status: order.status,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    total: order.total_amount,
    subtotal: order.items_subtotal ?? order.total_amount - order.delivery_fee,
    deliveryFee: order.delivery_fee,
    deliveryMethod: order.delivery_method,
    city: order.shipping_address?.city ?? null,
    pincode: order.shipping_address?.pincode ?? null,
    eventDate: order.shipping_address?.event_date ?? null,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    items: order.items.map((i) => ({ name: i.product_name, size: i.size, quantity: i.quantity, price: i.price })),
  }
}

export type PublicOrderView = ReturnType<typeof publicOrderView>
