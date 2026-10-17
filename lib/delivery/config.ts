/**
 * Delivery methods and charges at checkout.
 *
 * - Outside Delhi NCR: courier, a flat fee paid online with the order.
 * - Delhi NCR (same-day pincodes in ./pincode): Porter bike delivery, where the customer pays
 *   the rider the Porter fare (the shop WhatsApps the exact fare), or free pickup from the
 *   Krishna Nagar shop. Neither adds anything to the online total.
 *
 * Owner decision, 17 Oct 2026. To offer free courier above an order value, set
 * FREE_COURIER_ABOVE. Keep app/(public)/shipping-policy in step with these numbers.
 *
 * Relative import on purpose: `tsx --test` does not resolve the `@/` alias.
 */
import { normalisePincode, sameDayCity } from './pincode'

export const COURIER_FEE = 189
/** Subtotal at or above which courier is free. null = never free. */
export const FREE_COURIER_ABOVE: number | null = null

export type DeliveryMethod = 'courier' | 'porter' | 'pickup'

export const SHOP_PICKUP_LABEL = 'Krishna Nagar, East Delhi'

/** Methods offered for a pincode, in display order. Empty for an invalid pincode. */
export function deliveryOptions(rawPincode: string): DeliveryMethod[] {
  const pincode = normalisePincode(rawPincode)
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return []
  return sameDayCity(pincode) ? ['porter', 'pickup'] : ['courier']
}

/** What the delivery adds to the amount paid online. */
export function deliveryFee(method: DeliveryMethod, subtotal: number): number {
  if (method !== 'courier') return 0
  if (FREE_COURIER_ABOVE != null && subtotal >= FREE_COURIER_ABOVE) return 0
  return COURIER_FEE
}

/** True when the method is allowed for this pincode (the server re-checks the client's choice). */
export function isDeliveryAllowed(method: DeliveryMethod, rawPincode: string): boolean {
  return deliveryOptions(rawPincode).includes(method)
}
