import { unstable_cache } from 'next/cache'
import type { PostgrestError } from '@supabase/supabase-js'
import { createPublicServerClient } from './public-server'

/**
 * Cached Supabase queries for public read paths.
 *
 * Why: Supabase JS client uses fetch with no-store under the hood, which
 * causes Next.js to treat any route calling it as fully dynamic — even with
 * a page-level `revalidate` set. Wrapping the queries in `unstable_cache` gives
 * Next.js a cacheable data layer so the page can be classified as ISR and
 * pre-rendered + edge-cached.
 *
 * Cache lifetime: one week (matches page-level revalidate).
 * Tags are purged by /api/revalidate after admin saves and data-script runs.
 */

// A page inherits the shortest revalidate of the caches it reads, so this is also its ISR
// interval. Weekly keeps ISR writes inside the Hobby allowance; edits go live through
// /api/revalidate (tags below), not by waiting for expiry.
const ONE_WEEK = 604800

/** PostgREST code for "single() matched zero rows" — a legitimate 404, not a failure. */
const NO_ROWS = 'PGRST116'

type Result<T> = { data: T | null; error: PostgrestError | null }

/**
 * Fail loudly when a read errors, instead of degrading it to empty data.
 *
 * Why this exists: these queries used to destructure only `{ data }` and return
 * `data ?? []`. When the Supabase project was restricted (egress limit hit),
 * every call errored, `data` was null, and the outage rendered as a *successful*
 * empty catalog — which Next.js then baked into the static /products HTML and
 * cached. Throwing keeps that from ever being cacheable:
 *   - during a build, the deploy fails loudly rather than shipping an empty store
 *   - during ISR revalidation, Next.js discards the bad render and keeps
 *     serving the last good page
 */
function unwrap<T>(result: Result<T>, what: string): T | null {
  if (result.error) {
    throw new Error(`[cached-queries] ${what} failed: ${result.error.message}`)
  }
  return result.data
}

/** Same guard for `.single()` reads, where "no rows" is an expected 404. */
function unwrapSingle<T>(result: Result<T>, what: string): T | null {
  if (result.error && result.error.code !== NO_ROWS) {
    throw new Error(`[cached-queries] ${what} failed: ${result.error.message}`)
  }
  return result.data
}

export const getProductReviewsCached = unstable_cache(
  async (productId: string) => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('product_reviews')
      .select('id, rating, review_text, author_name, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    return unwrap(result, 'product reviews') ?? []
  },
  ['product-reviews-by-id'],
  { revalidate: ONE_WEEK, tags: ['products', 'reviews'] }
)

export const getProductBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()
    const data = unwrapSingle(result, `product by slug "${slug}"`)
    // Deterministic variant order: keeps the buy box's default selection, the displayed
    // price, the sku, and the Product-schema offer price in sync across ISR regenerations.
    if (data?.variants?.length) {
      data.variants.sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id))
    }
    return data
  },
  ['product-by-slug'],
  { revalidate: ONE_WEEK, tags: ['products'] }
)

export const getProductMetaBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('products')
      .select('name, description, seo_title, meta_description, category:categories(name), images:product_images(image_url, is_primary)')
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()
    return unwrapSingle(result, `product meta by slug "${slug}"`)
  },
  ['product-meta-by-slug'],
  { revalidate: ONE_WEEK, tags: ['products'] }
)

export const getCategoryBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    return unwrapSingle(result, `category by slug "${slug}"`)
  },
  ['category-by-slug'],
  { revalidate: ONE_WEEK, tags: ['categories'] }
)

export const getCategoryMetaBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('categories')
      .select('id, name, description, seo_title, meta_description, image_url')
      .eq('slug', slug)
      .single()
    return unwrapSingle(result, `category meta by slug "${slug}"`)
  },
  ['category-meta-by-slug'],
  { revalidate: ONE_WEEK, tags: ['categories'] }
)

export const getProductsForCategoryCached = unstable_cache(
  async (categoryId: string) => {
    const supabase = createPublicServerClient()
    const junction = await supabase
      .from('product_categories')
      .select('product_id')
      .eq('category_id', categoryId)
    const productCategories = unwrap(junction, 'product_categories for category')
    const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        categories:product_categories(category:categories(name)),
        images:product_images(image_url, is_primary),
        variants:product_variants(price_override)
      `)
      .eq('is_active', true)
      .is('deleted_at', null)

    if (productIdsFromJunction.length > 0) {
      query = query.or(`category_id.eq.${categoryId},id.in.(${productIdsFromJunction.join(',')})`)
    } else {
      query = query.eq('category_id', categoryId)
    }
    query = query.order('created_at', { ascending: false })
    return unwrap(await query, 'products for category')
  },
  ['products-for-category'],
  { revalidate: ONE_WEEK, tags: ['products', 'categories'] }
)

export const getHomepageSectionsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('homepage_sections')
      .select('id, title, source_type, category_id, product_count, sort_order, is_enabled, category:categories(name, slug)')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })
    // Normalize the embedded category to a single object (Supabase may return
    // a to-one relation as an object or a 1-element array depending on version).
    return (unwrap(result, 'homepage sections') ?? []).map((s: Record<string, unknown>) => ({
      ...s,
      category: Array.isArray(s.category) ? (s.category[0] ?? null) : (s.category ?? null),
    })) as Array<{
      id: string
      title: string
      source_type: 'category' | 'latest'
      category_id: string | null
      product_count: number
      sort_order: number
      is_enabled: boolean
      category: { name: string; slug: string } | null
    }>
  },
  ['homepage-sections-enabled'],
  { revalidate: ONE_WEEK, tags: ['homepage-sections', 'categories'] }
)

export const getLatestProductsCached = unstable_cache(
  async (limit: number) => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        categories:product_categories(category:categories(name)),
        images:product_images(image_url, is_primary),
        variants:product_variants(price_override)
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
    return unwrap(result, `latest ${limit} products`) ?? []
  },
  ['latest-products'],
  { revalidate: ONE_WEEK, tags: ['products'] }
)

export const getBlogPostBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .single()
    return unwrapSingle(result, `blog post by slug "${slug}"`)
  },
  ['blog-post-by-slug'],
  { revalidate: ONE_WEEK, tags: ['blog'] }
)

export const getActiveProductSlugsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', true)
      .is('deleted_at', null)
    return (unwrap(result, 'active product slugs') ?? []).map(({ slug }) => slug as string)
  },
  ['active-product-slugs'],
  { revalidate: ONE_WEEK, tags: ['products'] }
)

export const getActiveCategorySlugsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)
    return (unwrap(result, 'active category slugs') ?? []).map(({ slug }) => slug as string)
  },
  ['active-category-slugs'],
  { revalidate: ONE_WEEK, tags: ['categories'] }
)

export const getPublishedBlogSlugsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('blog_posts')
      .select('slug')
      .not('published_at', 'is', null)
    return (unwrap(result, 'published blog slugs') ?? []).map(({ slug }) => slug as string)
  },
  ['published-blog-slugs'],
  { revalidate: ONE_WEEK, tags: ['blog'] }
)

/** Categories that have at least one rentable product, with rent-price range + count. */
export type RentCategory = {
  name: string
  slug: string
  image_url: string | null
  min_rent: number
  max_rent: number
  product_count: number
}

export const getRentCategoriesCached = unstable_cache(
  async (): Promise<RentCategory[]> => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('products')
      .select('rent_price, category:categories(name, slug, image_url)')
      .eq('is_active', true)
      .is('deleted_at', null)
      .not('rent_price', 'is', null)
    const rows = unwrap(result, 'rent categories')

    const catMap = new Map<string, RentCategory>()
    for (const row of rows ?? []) {
      const rawCat = (row as { category: unknown }).category
      const cat = Array.isArray(rawCat)
        ? (rawCat[0] as { name: string; slug: string; image_url: string | null } | undefined)
        : (rawCat as { name: string; slug: string; image_url: string | null } | null)
      if (!cat) continue
      const rp = Number((row as { rent_price: number | string }).rent_price)
      const existing = catMap.get(cat.slug)
      if (existing) {
        existing.min_rent = Math.min(existing.min_rent, rp)
        existing.max_rent = Math.max(existing.max_rent, rp)
        existing.product_count++
      } else {
        catMap.set(cat.slug, {
          name: cat.name,
          slug: cat.slug,
          image_url: cat.image_url,
          min_rent: rp,
          max_rent: rp,
          product_count: 1,
        })
      }
    }

    return [...catMap.values()].sort((a, b) => b.product_count - a.product_count)
  },
  ['rent-categories'],
  { revalidate: ONE_WEEK, tags: ['products', 'categories'] }
)

/**
 * Full active catalog for the /products and /wholesale listing pages.
 * Selects category + junction slugs so the browse page can filter by category
 * client-side (keeping the page statically rendered). Product saves purge the
 * 'products' tag, so new products appear without waiting for the weekly expiry.
 */
export const getAllActiveProductsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        categories:product_categories(category:categories(name, slug)),
        images:product_images(image_url, is_primary),
        variants:product_variants(price_override)
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    return unwrap(result, 'all active products') ?? []
  },
  ['all-active-products'],
  { revalidate: ONE_WEEK, tags: ['products'] }
)

/** Active categories (with image) for the listing-page category filter. */
export const getActiveCategoriesCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .order('name')
    return unwrap(result, 'active categories') ?? []
  },
  ['active-categories-with-image'],
  { revalidate: ONE_WEEK, tags: ['categories'] }
)

/** Wholesale discount percentage from site_settings (defaults to 30). */
export const getWholesaleDiscountPctCached = unstable_cache(
  async (): Promise<number> => {
    const supabase = createPublicServerClient()
    const result = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'wholesale_discount_pct')
      .single()
    const data = unwrapSingle(result, 'wholesale discount pct')
    return (data as { value?: { value?: number } } | null)?.value?.value ?? 30
  },
  ['wholesale-discount-pct'],
  { revalidate: ONE_WEEK, tags: ['products', 'settings'] }
)
