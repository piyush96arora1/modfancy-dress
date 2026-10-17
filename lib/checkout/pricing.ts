/**
 * Server-side cart pricing. The browser's cart (localStorage) carries a price per line, but
 * it is never trusted: every checkout reprices from the products table.
 *
 * `priceLines` is pure so it can be unit-tested; the API route loads the rows and calls it.
 * Relative imports on purpose: `tsx --test` does not resolve the `@/` alias.
 */

import { DEFAULT_WHOLESALE_DISCOUNT_PCT, getProductPrice, getVariantPrice } from '../utils/pricing'

export const MAX_LINES = 20
/** Wholesale lines are bulk orders (product page defaults to 10). */
export const MAX_QTY_PER_LINE = 20
export const MAX_QTY_PER_LINE_WHOLESALE = 500

export type CartLineInput = {
  productId: string
  variantId?: string | null
  size?: string | null
  color?: string | null
  quantity: number
  /** What the browser showed. Only used to tell the customer a price changed. */
  shownPrice?: number
}

export type ProductRow = {
  id: string
  name: string
  price: number | null
  wholesale_price?: number | null
  is_active: boolean
  deleted_at: string | null
  variants: {
    id: string
    size: string | null
    color: string | null
    price_override: number | null
    wholesale_price_override?: number | null
  }[]
}

/** Wholesale buyers (pricing mode switch on the site) only place pay-later orders; their
 *  lines are priced by the same rules the product page shows (lib/utils/pricing.ts). */
export type PricingOptions = { mode?: 'retail' | 'wholesale'; wholesaleDiscountPct?: number }

export type PricedLine = {
  productId: string
  variantId: string | null
  name: string
  size: string | null
  color: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type PricingResult =
  | { ok: true; lines: PricedLine[]; subtotal: number; priceChanged: boolean }
  | { ok: false; reason: 'empty' | 'too_many_lines' | 'bad_quantity' | 'unavailable'; productId?: string }

export function priceLines(input: CartLineInput[], products: ProductRow[], opts: PricingOptions = {}): PricingResult {
  const wholesale = opts.mode === 'wholesale'
  const pct = opts.wholesaleDiscountPct ?? DEFAULT_WHOLESALE_DISCOUNT_PCT
  if (input.length === 0) return { ok: false, reason: 'empty' }
  if (input.length > MAX_LINES) return { ok: false, reason: 'too_many_lines' }

  const byId = new Map(products.map((p) => [p.id, p]))
  const lines: PricedLine[] = []
  let priceChanged = false

  for (const item of input) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > (wholesale ? MAX_QTY_PER_LINE_WHOLESALE : MAX_QTY_PER_LINE)) {
      return { ok: false, reason: 'bad_quantity', productId: item.productId }
    }
    const product = byId.get(item.productId)
    if (!product || !product.is_active || product.deleted_at) {
      return { ok: false, reason: 'unavailable', productId: item.productId }
    }
    const base = { price: product.price, wholesale_price: product.wholesale_price ?? null }
    let unitPrice = getProductPrice(base, wholesale ? 'wholesale' : 'retail', pct)
    let size = item.size ?? null
    let color = item.color ?? null
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId)
      if (!variant) return { ok: false, reason: 'unavailable', productId: item.productId }
      // getVariantPrice: a 0/null retail override falls back to the product price.
      unitPrice = getVariantPrice(
        base,
        { price_override: variant.price_override, wholesale_price_override: variant.wholesale_price_override ?? null },
        wholesale ? 'wholesale' : 'retail',
        pct,
      )
      size = variant.size ?? size
      color = variant.color ?? color
    }
    if (!(unitPrice > 0)) return { ok: false, reason: 'unavailable', productId: item.productId }
    if (item.shownPrice != null && Math.abs(item.shownPrice - unitPrice) >= 0.5) priceChanged = true

    lines.push({
      productId: product.id,
      variantId: item.variantId ?? null,
      name: product.name,
      size,
      color,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    })
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  return { ok: true, lines, subtotal, priceChanged }
}
