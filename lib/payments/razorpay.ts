/**
 * Razorpay Payment Gateway (Orders API + Standard Checkout), called with plain fetch.
 *
 * Docs: razorpay.com/docs/api/orders and razorpay.com/docs/payments/payment-gateway/web-integration/standard.
 * Test or live is decided by the key itself (rzp_test_… / rzp_live_…), so there is no mode flag.
 *
 * Server-only: reads RAZORPAY_KEY_SECRET. Relative-import friendly for `tsx --test`.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

const API = 'https://api.razorpay.com/v1'

export function razorpayKeyId(): string {
  const id = process.env.RAZORPAY_KEY_ID
  if (!id) throw new Error('RAZORPAY_KEY_ID not set')
  return id
}

function keySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) throw new Error('RAZORPAY_KEY_SECRET not set')
  return secret
}

/** Razorpay order ids look like order_Ab12Cd34Ef56Gh: how we tell them from Cashfree ids. */
export function isRazorpayOrderId(id: string | null | undefined): id is string {
  return !!id && id.startsWith('order_')
}

export class RazorpayError extends Error {
  constructor(public status: number, public code: string | undefined, message: string) {
    super(message)
  }
}

async function call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const auth = Buffer.from(`${razorpayKeyId()}:${keySecret()}`).toString('base64')
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      authorization: `Basic ${auth}`,
      accept: 'application/json',
      ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  })
  const data = (await res.json().catch(() => ({}))) as { error?: { code?: string; description?: string } }
  if (!res.ok) {
    throw new RazorpayError(res.status, data.error?.code, data.error?.description ?? `Razorpay ${res.status}`)
  }
  return data as T
}

export type RazorpayOrder = {
  id: string
  amount: number // paise
  amount_paid: number
  currency: string
  receipt: string | null
  status: 'created' | 'attempted' | 'paid'
  notes: Record<string, string> | unknown[]
}

export type RazorpayPayment = {
  id: string
  order_id: string
  amount: number // paise
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  method?: string
  captured?: boolean
  created_at: number // unix seconds
  error_description?: string | null
}

/** Rupees to paise, without float drift (₹939.10 → 93910). */
export const toPaise = (rupees: number) => Math.round(rupees * 100)

export function createRazorpayOrder(input: { amount: number; receipt: string; notes: Record<string, string> }): Promise<RazorpayOrder> {
  return call<RazorpayOrder>('/orders', {
    method: 'POST',
    body: { amount: toPaise(input.amount), currency: 'INR', receipt: input.receipt.slice(0, 40), notes: input.notes },
  })
}

export function getRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  return call<RazorpayOrder>(`/orders/${encodeURIComponent(orderId)}`)
}

export async function getRazorpayPayments(orderId: string): Promise<RazorpayPayment[]> {
  const res = await call<{ items: RazorpayPayment[] }>(`/orders/${encodeURIComponent(orderId)}/payments`)
  return res.items ?? []
}

function safeEqualHex(expected: string, given: string | null | undefined): boolean {
  if (!given) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(given)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Checkout handler/callback signature: HMAC-SHA256(order_id + "|" + payment_id, key secret), hex. */
export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string | null | undefined,
  secret: string = keySecret(),
): boolean {
  return safeEqualHex(createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex'), signature)
}

/** Webhook signature: HMAC-SHA256(raw body, webhook secret), hex, in X-Razorpay-Signature. */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined = process.env.RAZORPAY_WEBHOOK_SECRET,
): boolean {
  if (!secret) return false
  return safeEqualHex(createHmac('sha256', secret).update(rawBody).digest('hex'), signature)
}

/**
 * Collapse Razorpay's order + payment states into ours. A captured payment (or an order
 * marked paid) is success; an authorized one is still settling, so keep waiting.
 */
export function paymentStatusFromRazorpay(
  order: Pick<RazorpayOrder, 'status'>,
  payments: Pick<RazorpayPayment, 'status'>[],
): 'paid' | 'awaiting_payment' | 'failed' {
  if (order.status === 'paid' || payments.some((p) => p.status === 'captured')) return 'paid'
  if (payments.some((p) => p.status === 'authorized' || p.status === 'created')) return 'awaiting_payment'
  if (payments.length > 0 && payments.every((p) => p.status === 'failed')) return 'failed'
  return 'awaiting_payment'
}
