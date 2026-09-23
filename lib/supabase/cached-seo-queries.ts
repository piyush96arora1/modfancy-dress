import { unstable_cache } from 'next/cache'
import { createPublicServerClient } from './public-server'

/**
 * Cached public read paths added for the festival-season SEO work. Same pattern
 * as `cached-queries.ts` (unstable_cache + anon client, so pages stay ISR).
 */

const ONE_DAY = 86400
const ONE_HOUR = 3600

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

export type GuideLink = { slug: string; title: string; excerpt: string | null }

/**
 * The published blog post a category page links to as "Read the guide"
 * (`categories.guide_blog_slug`). `select('*')` so it returns null rather than
 * erroring before migration 20260923_blog_links.sql is applied.
 */
export const getCategoryGuideCached = unstable_cache(
  async (categorySlug: string): Promise<GuideLink | null> => {
    const supabase = createPublicServerClient()
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .eq('is_active', true)
      .maybeSingle()
    const guideSlug = (cat as { guide_blog_slug?: string | null } | null)?.guide_blog_slug
    if (!guideSlug) return null
    const { data: post } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt')
      .eq('slug', guideSlug)
      .not('published_at', 'is', null)
      .maybeSingle()
    return post ?? null
  },
  ['category-guide'],
  { revalidate: ONE_DAY, tags: ['categories', 'blog'] }
)

/**
 * Active category slugs that name this post as their guide: the fallback
 * source for a post's "Shop this guide" grid when `related_category_slugs` is
 * empty, so both directions of the link stay in step. Empty before the
 * migration (the filter column doesn't exist yet, so the query errors).
 */
export const getCategorySlugsForGuideCached = unstable_cache(
  async (postSlug: string): Promise<string[]> => {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from('categories')
      .select('slug')
      .eq('guide_blog_slug', postSlug)
      .eq('is_active', true)
      .order('slug')
    if (error) return []
    return (data ?? []).map((c) => c.slug as string)
  },
  ['category-slugs-for-guide'],
  { revalidate: ONE_DAY, tags: ['categories', 'blog'] }
)

export type LivePricedProduct = {
  name: string
  price: number | null
  rent_price: number | null
  categorySlugs: string[]
}

/**
 * Every live product's name, prices and category slugs (primary + junction) —
 * the source for the price bands in the editorial tables and their FAQ JSON-LD,
 * so those never drift from the catalogue.
 */
export const getLivePricedProductsCached = unstable_cache(
  async (): Promise<LivePricedProduct[]> => {
    const supabase = createPublicServerClient()
    const [{ data: products, error }, { data: categories }] = await Promise.all([
      supabase
        .from('products')
        .select('name, price, rent_price, category_id, product_categories(category_id)')
        .eq('is_active', true)
        .is('deleted_at', null),
      supabase.from('categories').select('id, slug').eq('is_active', true),
    ])
    if (error) throw new Error(`[cached-seo-queries] priced products failed: ${error.message}`)
    const slugById = new Map((categories ?? []).map((c) => [c.id as string, c.slug as string]))
    return (products ?? []).map((p) => {
      const ids = new Set<string>([
        ...(p.category_id ? [p.category_id as string] : []),
        ...((p.product_categories as { category_id: string }[] | null) ?? []).map((pc) => pc.category_id),
      ])
      return {
        name: p.name as string,
        price: p.price as number | null,
        rent_price: p.rent_price as number | null,
        categorySlugs: [...ids].map((id) => slugById.get(id)).filter((s): s is string => !!s),
      }
    })
  },
  ['live-priced-products'],
  { revalidate: ONE_HOUR, tags: ['products', 'categories'] }
)
