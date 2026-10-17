/**
 * Contact-field helpers with no dependencies, safe to import into the checkout page bundle
 * (lib/checkout/schema.ts pulls in zod, which stays server-side).
 */

/** 10-digit Indian mobile from whatever was typed: spaces, +91, 091, leading 0. */
export function normaliseIndianMobile(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return d
}

export const MOBILE_RE = /^[6-9]\d{9}$/
export const PINCODE_RE = /^[1-9]\d{5}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
