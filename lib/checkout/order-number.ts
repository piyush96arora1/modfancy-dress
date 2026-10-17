/**
 * Order numbers: MFD-YYMMDD-XXXXX, dated in IST, with a 5-character crypto-random suffix
 * from an alphabet without look-alikes (no 0/O, 1/I/L). The same string is the Cashfree
 * order_id, which allows [A-Za-z0-9_-] and 3–45 characters.
 *
 * 30^5 ≈ 24 million suffixes per day; the unique index on orders.order_number backs it up.
 */
import { randomInt } from 'node:crypto'

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export const ORDER_NUMBER_RE = /^MFD-\d{6}-[2-9A-HJKMNP-Z]{5}(-R\d{1,2})?$/

export function istDateStamp(now: Date = new Date()): string {
  const ist = new Date(now.getTime() + 330 * 60_000)
  const yy = String(ist.getUTCFullYear() % 100).padStart(2, '0')
  const mm = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(ist.getUTCDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

export function newOrderNumber(now: Date = new Date()): string {
  let suffix = ''
  for (let i = 0; i < 5; i++) suffix += ALPHABET[randomInt(ALPHABET.length)]
  return `MFD-${istDateStamp(now)}-${suffix}`
}

/** Cashfree order ids cannot be reused, so each payment retry gets `-R2`, `-R3`, … */
export function retryCashfreeOrderId(orderNumber: string, attempt: number): string {
  return attempt <= 1 ? orderNumber : `${orderNumber}-R${attempt}`
}

/** The attempt number encoded in a Cashfree order id (1 for the original). */
export function cashfreeAttempt(cfOrderId: string | null | undefined): number {
  const m = cfOrderId?.match(/-R(\d+)$/)
  return m ? Number(m[1]) : 1
}

/** Order number from a Cashfree order id (strips any retry suffix). */
export function orderNumberFromCashfreeId(cfOrderId: string): string {
  return cfOrderId.replace(/-R\d+$/, '')
}
