/**
 * Pricing for the private supplier catalog.
 *
 * The supplier's cost is marked up and rounded UP to the nearest ₹10 so quoted numbers stay
 * clean over WhatsApp and never land under the intended margin. Rounding up means sub-₹100
 * items carry an effective markup above the nominal percentage (₹78 -> ₹100 is really 28%);
 * that is deliberate.
 */

export const DEFAULT_MARKUP_PCT = 20
export const PRICE_ON_REQUEST = 'Price on request'

/**
 * Marked-up, ₹10-rounded price to show a client.
 *
 * Returns null when there is no usable supplier price — 43 of the 827 catalog items are
 * priced 0 — so callers render "Price on request" rather than a misleading ₹0.
 */
export function supplierDisplayPrice(
  supplierPrice: number,
  markupPct: number = DEFAULT_MARKUP_PCT
): number | null {
  if (!Number.isFinite(supplierPrice) || supplierPrice <= 0) return null
  const marked = supplierPrice * (1 + markupPct / 100)
  return Math.ceil(marked / 10) * 10
}

/** Display string for a price returned by supplierDisplayPrice. */
export function formatSupplierPrice(price: number | null): string {
  if (price === null) return PRICE_ON_REQUEST
  return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
