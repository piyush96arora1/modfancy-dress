import { unstable_cache } from 'next/cache'
import { createPublicServerClient } from './public-server'

/**
 * Cached Supabase queries for public read paths.
 *
 * Why: Supabase JS client uses fetch with no-store under the hood, which
 * causes Next.js to treat any route calling it as fully dynamic — even with
 * `revalidate=86400` set. Wrapping the queries in `unstable_cache` gives
 * Next.js a cacheable data layer so the page can be classified as ISR and
 * pre-rendered + edge-cached.
 *
 * Cache lifetime: 24h (matches page-level revalidate).
 * Tags allow targeted invalidation via revalidateTag('products'|'categories'|'blog')
 * from admin save handlers if added later.
 */

const ONE_DAY = 86400
const ONE_HOUR = 3600

export const getProductReviewsCached = unstable_cache(
  async (productId: string) => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('product_reviews')
      .select('id, rating, review_text, author_name, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    return data ?? []
  },
  ['product-reviews-by-id'],
  { revalidate: ONE_DAY, tags: ['products', 'reviews'] }
)

export const getProductBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
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
    // Deterministic variant order: keeps the buy box's default selection, the displayed
    // price, the sku, and the Product-schema offer price in sync across ISR regenerations.
    if (data?.variants?.length) {
      data.variants.sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id))
    }
    return data
  },
  ['product-by-slug'],
  { revalidate: ONE_DAY, tags: ['products'] }
)

export const getProductMetaBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('products')
      .select('name, description, seo_title, meta_description, category:categories(name), images:product_images(image_url, is_primary)')
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single()
    return data
  },
  ['product-meta-by-slug'],
  { revalidate: ONE_DAY, tags: ['products'] }
)

export const getCategoryBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    return data
  },
  ['category-by-slug'],
  { revalidate: ONE_DAY, tags: ['categories'] }
)

export const getCategoryMetaBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, description, seo_title, meta_description, image_url')
      .eq('slug', slug)
      .single()
    return data
  },
  ['category-meta-by-slug'],
  { revalidate: ONE_DAY, tags: ['categories'] }
)

export const getProductsForCategoryCached = unstable_cache(
  async (categoryId: string) => {
    const supabase = createPublicServerClient()
    const { data: productCategories } = await supabase
      .from('product_categories')
      .select('product_id')
      .eq('category_id', categoryId)
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
    const { data } = await query
    return data
  },
  ['products-for-category'],
  { revalidate: ONE_DAY, tags: ['products', 'categories'] }
)

export const getHomepageSectionsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('homepage_sections')
      .select('id, title, source_type, category_id, product_count, sort_order, is_enabled, category:categories(name, slug)')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })
    // Normalize the embedded category to a single object (Supabase may return
    // a to-one relation as an object or a 1-element array depending on version).
    return (data ?? []).map((s: Record<string, unknown>) => ({
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
  { revalidate: ONE_DAY, tags: ['homepage-sections', 'categories'] }
)

export const getLatestProductsCached = unstable_cache(
  async (limit: number) => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
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
    return data ?? []
  },
  ['latest-products'],
  { revalidate: ONE_DAY, tags: ['products'] }
)

export const getBlogPostBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .single()
    return data
  },
  ['blog-post-by-slug'],
  { revalidate: ONE_DAY, tags: ['blog'] }
)

export const getActiveProductSlugsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', true)
      .is('deleted_at', null)
    return (data ?? []).map(({ slug }) => slug as string)
  },
  ['active-product-slugs'],
  { revalidate: ONE_DAY, tags: ['products'] }
)

export const getActiveCategorySlugsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)
    return (data ?? []).map(({ slug }) => slug as string)
  },
  ['active-category-slugs'],
  { revalidate: ONE_DAY, tags: ['categories'] }
)

export const getPublishedBlogSlugsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug')
      .not('published_at', 'is', null)
    return (data ?? []).map(({ slug }) => slug as string)
  },
  ['published-blog-slugs'],
  { revalidate: ONE_DAY, tags: ['blog'] }
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
    const { data: rows } = await supabase
      .from('products')
      .select('rent_price, category:categories(name, slug, image_url)')
      .eq('is_active', true)
      .is('deleted_at', null)
      .not('rent_price', 'is', null)

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
  { revalidate: ONE_DAY, tags: ['products', 'categories'] }
)

/**
 * Full active catalog for the /products and /wholesale listing pages.
 * Selects category + junction slugs so the browse page can filter by category
 * client-side (keeping the page statically rendered). 1h cache: new products
 * appear on the listing within the hour without a redeploy.
 */
export const getAllActiveProductsCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
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
    return data ?? []
  },
  ['all-active-products'],
  { revalidate: ONE_HOUR, tags: ['products'] }
)

/** Active categories (with image) for the listing-page category filter. */
export const getActiveCategoriesCached = unstable_cache(
  async () => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .order('name')
    return data ?? []
  },
  ['active-categories-with-image'],
  { revalidate: ONE_HOUR, tags: ['categories'] }
)

/** Wholesale discount percentage from site_settings (defaults to 30). */
export const getWholesaleDiscountPctCached = unstable_cache(
  async (): Promise<number> => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'wholesale_discount_pct')
      .single()
    return (data as { value?: { value?: number } } | null)?.value?.value ?? 30
  },
  ['wholesale-discount-pct'],
  { revalidate: ONE_HOUR, tags: ['products', 'settings'] }
)
