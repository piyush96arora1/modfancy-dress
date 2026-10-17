/**
 * Cashfree Payment Gateway, called with plain fetch (the cashfree-pg SDK pulls in axios and
 * @sentry/node for the four calls we make).
 *
 * Docs: cashfree.com/docs/api-reference/payments/latest. API version pinned below: it adds
 * the x-idempotency-key webhook header we de-duplicate on, and Cashfree keeps old versions
 * working, so the shape of responses never changes under us.
 *
 * Server-only: reads CASHFREE_SECRET_KEY. Relative-import friendly for `tsx --test`.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

export const CASHFREE_API_VERSION = '2025-01-01'

export type CashfreeEnv = 'sandbox' | 'production'

export function cashfreeEnv(): CashfreeEnv {
  return process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
}

function baseUrl(): string {
  return cashfreeEnv() === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'
}

function credentials(): { id: string; secret: string } {
  const id = process.env.CASHFREE_APP_ID
  const secret = process.env.CASHFREE_SECRET_KEY
  if (!id || !secret) throw new Error('CASHFREE_APP_ID / CASHFREE_SECRET_KEY not set')
  return { id, secret }
}

export class CashfreeError extends Error {
  constructor(public status: number, public code: string | undefined, message: string) {
    super(message)
  }
}

async function call<T>(path: string, init: { method?: string; body?: unknown; idempotencyKey?: string } = {}): Promise<T> {
  const { id, secret } = credentials()
  const headers: Record<string, string> = {
    'x-client-id': id,
    'x-client-secret': secret,
    'x-api-version': CASHFREE_API_VERSION,
    accept: 'application/json',
  }
  if (init.body !== undefined) headers['content-type'] = 'application/json'
  if (init.idempotencyKey) headers['x-idempotency-key'] = init.idempotencyKey

  const res = await fetch(`${baseUrl()}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new CashfreeError(res.status, data.code as string | undefined, String(data.message ?? `Cashfree ${res.status}`))
  }
  return data as T
}

export type CashfreeOrderStatus = 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED' | 'TERMINATION_REQUESTED'

export type CashfreeOrder = {
  cf_order_id: string | number
  order_id: string
  order_amount: number
  order_status: CashfreeOrderStatus
  payment_session_id: string
  order_expiry_time?: string
}

export type CashfreePayment = {
  cf_payment_id: string | number
  payment_status: 'SUCCESS' | 'NOT_ATTEMPTED' | 'FAILED' | 'USER_DROPPED' | 'VOID' | 'CANCELLED' | 'PENDING'
  payment_amount: number
  payment_group?: string
  payment_time?: string
  payment_completion_time?: string
  payment_message?: string
}

export type CreateOrderInput = {
  orderId: string
  amount: number
  customer: { phone: string; name: string; email?: string | null }
  returnUrl: string
  notifyUrl?: string
  note?: string
  tags?: Record<string, string>
  idempotencyKey: string
  /** Minutes until Cashfree expires the payment session. */
  expiresInMinutes?: number
}

/** Cashfree wants a customer id of plain alphanumerics; the phone number is stable per buyer. */
export function cashfreeCustomerId(phone10: string): string {
  return `c${phone10}`
}

export async function createCashfreeOrder(input: CreateOrderInput): Promise<CashfreeOrder> {
  const expiry = new Date(Date.now() + (input.expiresInMinutes ?? 60) * 60_000)
  return call<CashfreeOrder>('/orders', {
    method: 'POST',
    idempotencyKey: input.idempotencyKey,
    body: {
      order_id: input.orderId,
      order_amount: Number(input.amount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: cashfreeCustomerId(input.customer.phone),
        customer_phone: input.customer.phone,
        customer_name: input.customer.name.slice(0, 100),
        ...(input.customer.email ? { customer_email: input.customer.email } : {}),
      },
      order_meta: {
        return_url: input.returnUrl,
        ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
      },
      order_expiry_time: expiry.toISOString(),
      ...(input.note ? { order_note: input.note.slice(0, 200) } : {}),
      ...(input.tags ? { order_tags: input.tags } : {}),
    },
  })
}

export function getCashfreeOrder(orderId: string): Promise<CashfreeOrder> {
  return call<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`)
}

export function getCashfreePayments(orderId: string): Promise<CashfreePayment[]> {
  return call<CashfreePayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`)
}

/**
 * Webhook signature: Base64(HMAC-SHA256(timestamp + rawBody, secret key)).
 * `rawBody` must be the exact bytes received (read with req.text() before parsing).
 * Rejects timestamps more than `maxAgeMs` from now to stop replays.
 */
export function verifyCashfreeSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secret: string = credentials().secret,
  now: number = Date.now(),
  maxAgeMs = 5 * 60_000,
): boolean {
  if (!timestamp || !signature) return false
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(now - ts) > maxAgeMs) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(timestamp + rawBody).digest('base64'))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/**
 * Collapse Cashfree's order + payment states into ours. `PAID` on the order is the only
 * success signal Cashfree documents as authoritative.
 */
export function paymentStatusFromCashfree(
  order: Pick<CashfreeOrder, 'order_status'>,
  payments: Pick<CashfreePayment, 'payment_status'>[],
): 'paid' | 'awaiting_payment' | 'failed' {
  if (order.order_status === 'PAID') return 'paid'
  // A PENDING payment is a UPI/bank still confirming: keep waiting, never call it failed.
  if (payments.some((p) => p.payment_status === 'PENDING' || p.payment_status === 'SUCCESS')) return 'awaiting_payment'
  if (order.order_status === 'EXPIRED' || order.order_status === 'TERMINATED') return 'failed'
  const failedStates = ['FAILED', 'USER_DROPPED', 'CANCELLED', 'VOID']
  if (payments.length > 0 && payments.every((p) => failedStates.includes(p.payment_status))) return 'failed'
  return 'awaiting_payment'
}
