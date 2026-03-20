import type { SupabaseClient } from '@supabase/supabase-js'
import { formatPrice } from '@/lib/utils/pricing'
import { normalizeSizeKey } from '@/lib/catalog/size-metadata'

export type CategoryPriceTableRow = {
  name: string
  slug: string
  productCount: number
  /** e.g. "₹399–₹550" or "₹399" */
  retailRange: string
  sizesSummary: string
}

function collectSizes(
  productSize: string | null | undefined,
  variants: { size: string | null }[] | null | undefined
): Set<string> {
  const out = new Set<string>()
  if (productSize?.trim()) out.add(normalizeSizeKey(productSize.trim()))
  for (const v of variants ?? []) {
    if (v.size?.trim()) out.add(normalizeSizeKey(v.size.trim()))
  }
  return out
}

function formatSizesSummary(keys: Set<string>): string {
  if (keys.size === 0) return '—'
  const labels = [...keys]
    .map((k) => {
      const pretty = k.replace(/\b(yrs)\b/g, 'yrs').replace(/\s+/g, ' ')
      return pretty
    })
    .filter(Boolean)
  if (labels.length <= 3) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`
}

/**
 * Per-category retail min/max, product count, and rough sizes line — from live catalog.
 */
export async function getCategoryPriceTableRows(supabase: SupabaseClient): Promise<CategoryPriceTableRow[]> {
  const { data: categories } = await supabase.from('categories').select('id, name, slug')

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      price,
      category_id,
      size,
      category:categories(id, slug, name),
      categories:product_categories(category:categories(id, slug, name)),
      variants:product_variants(size)
    `)
    .eq('is_active', true)
    .is('deleted_at', null)

  type Stat = { count: number; min: number; max: number; sizes: Set<string> }
  const bySlug = new Map<string, Stat & { name: string }>()

  const ensure = (slug: string, name: string) => {
    if (!bySlug.has(slug)) {
      bySlug.set(slug, { name, count: 0, min: Infinity, max: 0, sizes: new Set() })
    }
    return bySlug.get(slug)!
  }

  for (const c of categories ?? []) {
    ensure(c.slug, c.name)
  }

  for (const p of products ?? []) {
    const price = p.price
    if (price == null || price <= 0) continue

    const sizes = collectSizes(p.size, p.variants as { size: string | null }[] | undefined)
    const catSlugs: { slug: string; name: string }[] = []

    const primary = p.category as { slug?: string; name?: string } | null
    if (primary?.slug && primary?.name) {
      catSlugs.push({ slug: primary.slug, name: primary.name })
    }
    const junction = p.categories as { category?: { slug?: string; name?: string } }[] | undefined
    for (const row of junction ?? []) {
      const c = row.category
      if (c?.slug && c?.name) catSlugs.push({ slug: c.slug, name: c.name })
    }

    const seen = new Set<string>()
    for (const { slug, name } of catSlugs) {
      if (seen.has(slug)) continue
      seen.add(slug)
      const s = ensure(slug, name)
      s.count += 1
      s.min = Math.min(s.min, price)
      s.max = Math.max(s.max, price)
      for (const sz of sizes) s.sizes.add(sz)
    }
  }

  const rows: CategoryPriceTableRow[] = []
  for (const [slug, s] of bySlug) {
    if (s.count === 0) continue
    const retailRange =
      s.min === s.max ? formatPrice(s.min) : `${formatPrice(s.min)}–${formatPrice(s.max)}`
    rows.push({
      slug,
      name: s.name,
      productCount: s.count,
      retailRange,
      sizesSummary: formatSizesSummary(s.sizes),
    })
  }

  rows.sort((a, b) => a.name.localeCompare(b.name))
  return rows
}
