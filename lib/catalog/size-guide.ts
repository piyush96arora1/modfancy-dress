import type { SupabaseClient } from '@supabase/supabase-js'
import { formatPrice } from '@/lib/utils/pricing'
import { getProductIdsForCategory } from '@/lib/catalog/category-product-ids'
import { lookupSizeMeta, normalizeSizeKey, sizeSortRank } from '@/lib/catalog/size-metadata'

export type SizeGuideRow = {
  sizeLabel: string
  age: string
  height: string
  priceDisplay: string
}

/**
 * A variant's price: its own override, else the parent product's price.
 * Null when neither is usable — a missing price is not a free product, and
 * letting it through as 0 would print "₹0" as a size's minimum on a table
 * Google reads.
 */
function effectiveVariantPrice(
  productPrice: number | undefined,
  override: number | null
): number | null {
  const price = override ?? productPrice
  return typeof price === 'number' && price > 0 ? price : null
}

/**
 * Build size guide rows from `product_variants.size` (+ optional `products.size`) for products in the category.
 */
export async function getSizeGuideRowsForCategory(
  supabase: SupabaseClient,
  categoryId: string
): Promise<SizeGuideRow[] | null> {
  const productIds = await getProductIdsForCategory(supabase, categoryId)
  if (productIds.length === 0) return null

  const { data: products } = await supabase
    .from('products')
    .select('id, price, size')
    .in('id', productIds)

  // Products with no price are left out rather than recorded as 0; see
  // effectiveVariantPrice.
  const priceById = new Map<string, number>()
  for (const p of products ?? []) {
    if (typeof p.price === 'number' && p.price > 0) priceById.set(p.id, p.price)
  }

  const { data: variants } = await supabase
    .from('product_variants')
    .select('size, price_override, product_id')
    .in('product_id', productIds)
    .not('size', 'is', null)

  type Agg = { display: string; min: number; max: number }
  const byKey = new Map<string, Agg>()

  for (const v of variants ?? []) {
    const label = v.size?.trim()
    if (!label) continue
    const key = normalizeSizeKey(label)
    const eff = effectiveVariantPrice(priceById.get(v.product_id), v.price_override)
    if (eff === null) continue
    const cur = byKey.get(key)
    if (!cur) {
      byKey.set(key, { display: label, min: eff, max: eff })
    } else {
      cur.min = Math.min(cur.min, eff)
      cur.max = Math.max(cur.max, eff)
    }
  }

  /*
   * Sizes carried on the product row rather than on variant rows.
   *
   * A size already priced from variants is authoritative and is left alone.
   * Every other product sharing a size now WIDENS that size's range. Previously
   * only the first product seen set the price and the rest were skipped, so
   * Superhero Costumes — a ₹550 Balveer and two ₹1400 costumes, all "3-9 yrs",
   * none with variant rows — advertised "From ₹1,400" and hid the ₹550. The bug
   * was invisible while categories held one product per size.
   */
  const pricedFromVariants = new Set(byKey.keys())

  for (const p of products ?? []) {
    const label = p.size?.trim()
    if (!label) continue
    const key = normalizeSizeKey(label)
    if (pricedFromVariants.has(key)) continue
    const eff = priceById.get(p.id)
    if (eff === undefined) continue
    const cur = byKey.get(key)
    if (!cur) {
      byKey.set(key, { display: label, min: eff, max: eff })
    } else {
      cur.min = Math.min(cur.min, eff)
      cur.max = Math.max(cur.max, eff)
    }
  }

  if (byKey.size === 0) return null

  type Internal = SizeGuideRow & { sort: number }
  const internal: Internal[] = [...byKey.entries()].map(([key, agg]) => {
    const { age, height } = lookupSizeMeta(agg.display)
    const priceDisplay =
      agg.min === agg.max
        ? `From ${formatPrice(agg.min)}`
        : `${formatPrice(agg.min)}–${formatPrice(agg.max)}`
    return {
      sizeLabel: agg.display,
      age,
      height,
      priceDisplay,
      sort: sizeSortRank(key),
    }
  })

  internal.sort((a, b) => a.sort - b.sort || a.sizeLabel.localeCompare(b.sizeLabel))

  return internal.map(
    (r): SizeGuideRow => ({
      sizeLabel: r.sizeLabel,
      age: r.age,
      height: r.height,
      priceDisplay: r.priceDisplay,
    })
  )
}
