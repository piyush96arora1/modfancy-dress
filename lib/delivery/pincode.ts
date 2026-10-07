/**
 * Pincode → delivery estimate, entirely local.
 *
 * Same-day delivery is a Porter / Rapido parcel booked from the Krishna Nagar
 * store, so "same-day" means "a bike or mini-truck can reach it from East Delhi
 * in a couple of hours" — Delhi plus the four NCR cities that border it. That is
 * a short, stable list of pincode ranges, so it lives here as data rather than
 * behind an API: the check is a synchronous range lookup with no network call,
 * which keeps it off the INP and LCP budget entirely.
 *
 * To add or drop an area, edit SAME_DAY_AREAS. Keep the copy in DeliveryPromise
 * and `shippingDetails()` in lib/seo/structured-data.tsx consistent with it.
 */

export interface SameDayArea {
  city: string
  /** Inclusive 6-digit pincode ranges. */
  ranges: Array<[number, number]>
}

export const SAME_DAY_AREAS: SameDayArea[] = [
  { city: 'Delhi', ranges: [[110001, 110099]] },
  // 201301–201310 Noida sectors, 201312–201318 Greater Noida / Noida Extension.
  { city: 'Noida', ranges: [[201301, 201318]] },
  // Indirapuram, Vaishali, Vasundhara, Raj Nagar, Kaushambi — closest NCR city to the store.
  { city: 'Ghaziabad', ranges: [[201001, 201017]] },
  // Gurugram city sectors. Manesar (1220 5x) and beyond are left out on purpose.
  { city: 'Gurugram', ranges: [[122001, 122018]] },
  { city: 'Faridabad', ranges: [[121001, 121013]] },
]

/**
 * Orders confirmed before this hour (IST) go out the same day. After it the
 * parcel leaves next morning, or the customer can book their own Rapido/Porter.
 */
export const SAME_DAY_CUTOFF_HOUR_IST = 12

export type DeliveryEstimate =
  | { kind: 'invalid' }
  | { kind: 'same-day'; city: string; beforeCutoff: boolean }
  | { kind: 'india' }

const PINCODE_RE = /^[1-9][0-9]{5}$/

export function normalisePincode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

export function sameDayCity(pincode: string): string | null {
  if (!PINCODE_RE.test(pincode)) return null
  const n = Number(pincode)
  for (const area of SAME_DAY_AREAS) {
    if (area.ranges.some(([lo, hi]) => n >= lo && n <= hi)) return area.city
  }
  return null
}

/** Current hour in India, whatever timezone the visitor's device is set to. */
export function istHour(now: Date = new Date()): number {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  return Math.floor(((utcMinutes + 330) % 1440) / 60)
}

export function estimateDelivery(rawPincode: string, now: Date = new Date()): DeliveryEstimate {
  const pincode = normalisePincode(rawPincode)
  if (!PINCODE_RE.test(pincode)) return { kind: 'invalid' }
  const city = sameDayCity(pincode)
  if (city) return { kind: 'same-day', city, beforeCutoff: istHour(now) < SAME_DAY_CUTOFF_HOUR_IST }
  return { kind: 'india' }
}

/** One-line summary, used in the WhatsApp prefill and stored on the order. */
export function estimateLabel(estimate: DeliveryEstimate): string {
  switch (estimate.kind) {
    case 'same-day':
      return estimate.beforeCutoff
        ? `Same-day delivery (${estimate.city})`
        : `Next-morning delivery, or same-day if you book Rapido/Porter (${estimate.city})`
    case 'india':
      return '3–5 business days by courier'
    default:
      return ''
  }
}

/** Shared between the product-page checker and the checkout form. */
export const PINCODE_STORAGE_KEY = 'mfd-delivery-pincode'

export function readSavedPincode(): string {
  try {
    return localStorage.getItem(PINCODE_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function savePincode(pincode: string): void {
  try {
    localStorage.setItem(PINCODE_STORAGE_KEY, pincode)
  } catch {
    // Private mode / blocked storage — the prefill is a convenience only.
  }
}
