/**
 * Proof that the visitor placed the order, without an account.
 *
 * The order page link (Cashfree return_url, the success screen, the "share" link) carries
 * `?t=<token>`, an HMAC of the order number. With it, the page shows the full order
 * (items, address). Without it, only the phone-checked tracking view is available.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

function secret(): string {
  const s = process.env.ORDER_TOKEN_SECRET
  if (!s || s.length < 16) throw new Error('ORDER_TOKEN_SECRET is missing or too short')
  return s
}

export function orderToken(orderNumber: string, key: string = secret()): string {
  return createHmac('sha256', key).update(`order:${orderNumber}`).digest('base64url').slice(0, 24)
}

export function verifyOrderToken(orderNumber: string, token: string | null | undefined, key?: string): boolean {
  if (!token) return false
  const expected = Buffer.from(orderToken(orderNumber, key ?? secret()))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
