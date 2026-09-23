import { unstable_cache } from 'next/cache'
import { createPublicServerClient } from './public-server'

/**
 * Cached public read paths added for the festival-season SEO work. Same pattern
 * as `cached-queries.ts` (unstable_cache + anon client, so pages stay ISR).
 */

const ONE_DAY = 86400

/**
 * Ids of categories that hold at least one live product, counting both the
 * primary `category_id` and `product_categories` junction rows. Queried from
 * the products side so soft-deleted and inactive products never count, and so
 * the row count stays at the live-catalog size (well under PostgREST's cap).
 *
 * Returned as an array because unstable_cache serialises to JSON.
 */
export const getNonEmptyCategoryIdsCached = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from('products')
      .select('category_id, junction:product_categories(category_id)')
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(5000)
    if (error) throw new Error(`[cached-seo-queries] non-empty categories failed: ${error.message}`)
    const ids = new Set<string>()
    for (const row of (data ?? []) as Array<{ category_id: string | null; junction: { category_id: string }[] | null }>) {
      if (row.category_id) ids.add(row.category_id)
      for (const j of row.junction ?? []) if (j.category_id) ids.add(j.category_id)
    }
    return [...ids].sort()
  },
  ['non-empty-category-ids'],
  { revalidate: ONE_DAY, tags: ['products', 'categories'] }
)

export type DatedHomepageSection = {
  id: string
  title: string
  source_type: 'category' | 'latest'
  category_id: string | null
  product_count: number
  sort_order: number
  is_enabled: boolean
  starts_on?: string | null
  ends_on?: string | null
  min_products?: number | null
  category: { name: string; slug: string } | null
}

/**
 * Enabled homepage sections including their date window. `select('*')` rather
 * than a column list so this works whether or not the dates migration
 * (20260923_homepage_sections_dates.sql) has been applied yet. The date filter
 * itself runs at render time (`isActiveOn`), not here, so a cached row list
 * never keeps a finished festival on the page.
 */
export const getDatedHomepageSectionsCached = unstable_cache(
  async (): Promise<DatedHomepageSection[]> => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('homepage_sections')
      .select('*, category:categories(name, slug)')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })
    return (data ?? []).map((s: Record<string, unknown>) => ({
      ...s,
      category: Array.isArray(s.category) ? (s.category[0] ?? null) : (s.category ?? null),
    })) as DatedHomepageSection[]
  },
  ['homepage-sections-dated'],
  { revalidate: ONE_DAY, tags: ['homepage-sections', 'categories'] }
)
