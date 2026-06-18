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
