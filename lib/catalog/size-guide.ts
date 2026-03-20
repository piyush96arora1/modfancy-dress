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

function effectiveVariantPrice(productPrice: number, override: number | null): number {
  return override ?? productPrice
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

  const priceById = new Map<string, number>()
  for (const p of products ?? []) {
    priceById.set(p.id, p.price ?? 0)
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
    const base = priceById.get(v.product_id) ?? 0
    const eff = effectiveVariantPrice(base, v.price_override)
    const cur = byKey.get(key)
    if (!cur) {
      byKey.set(key, { display: label, min: eff, max: eff })
    } else {
      cur.min = Math.min(cur.min, eff)
      cur.max = Math.max(cur.max, eff)
    }
  }

  // Product-level size when no variant rows used that product's sizes
  for (const p of products ?? []) {
    const label = p.size?.trim()
    if (!label) continue
    const key = normalizeSizeKey(label)
    if ([...byKey.keys()].some((k) => k === key)) continue
    const eff = p.price ?? 0
    if (!byKey.has(key)) {
      byKey.set(key, { display: label, min: eff, max: eff })
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
