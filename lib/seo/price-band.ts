/**
 * Price bands for editorial tables, computed from live products at render time.
 * These tables also feed FAQPage JSON-LD, so a hard-coded price that drifts from
 * the catalogue becomes a wrong fact in Google's index — never hard-code them.
 */
export type PriceBand = { minBuy: number | null; maxBuy: number | null; minRent: number | null }
type Priced = { price: number | null; rent_price: number | null }

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export function priceBand(rows: Priced[]): PriceBand | null {
  const buy = rows.map((r) => Number(r.price)).filter((n) => n > 0)
  const rent = rows.map((r) => Number(r.rent_price)).filter((n) => n > 0)
  if (!buy.length && !rent.length) return null
  return {
    minBuy: buy.length ? Math.min(...buy) : null,
    maxBuy: buy.length ? Math.max(...buy) : null,
    minRent: rent.length ? Math.min(...rent) : null,
  }
}

export function formatPriceBand(b: PriceBand): string {
  const parts: string[] = []
  if (b.minBuy != null && b.maxBuy != null)
    parts.push(b.minBuy === b.maxBuy ? `Buy ${inr(b.minBuy)}` : `Buy ${inr(b.minBuy)}–${inr(b.maxBuy)}`)
  if (b.minRent != null) parts.push(parts.length ? `rent from ${inr(b.minRent)}` : `Rent from ${inr(b.minRent)}`)
  return parts.join(' · ')
}

/** Compact entry-price label for narrow table cells. */
export function fromPrice(b: PriceBand | null): string | null {
  if (!b) return null
  const parts: string[] = []
  if (b.minRent != null) parts.push(`${inr(b.minRent)} rent`)
  if (b.minBuy != null) parts.push(`${inr(b.minBuy)} buy`)
  return parts.join(' · ')
}
