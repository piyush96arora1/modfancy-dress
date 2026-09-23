import { unstable_cache } from 'next/cache'
import { createPublicServerClient } from './public-server'
import {
  getCategoryBySlugCached,
  getProductsForCategoryCached,
} from './cached-queries'
import { toProductCardData, type ProductCardRow } from '@/lib/utils/product-card-data'
import type { ProductCardData } from '@/types/database'

/**
 * Cached public read paths added for the festival-season SEO work. Same pattern
 * as `cached-queries.ts` (unstable_cache + anon client, so pages stay ISR).
 */

const ONE_HOUR = 3600

/**
 * A category page is only worth a 200 when the category is active AND has at
 * least one live product. Anything else (missing, inactive, empty) must be a
 * real 404, otherwise Google reports it as a soft 404. The sitemap already
 * leaves empty categories out, so the two stay consistent.
 *
 * Composes the existing cached queries, so calling it from both
 * generateMetadata and the page body costs one fetch each.
 */
export async function getListableCategory(slug: string) {
  const category = await getCategoryBySlugCached(slug)
  if (!category) return null
  const products = await getProductsForCategoryCached(category.id)
  if (!products || products.length === 0) return null
  return { category, products }
}

/**
 * Card-sized version of the full active catalog for /products and /wholesale.
 * getAllActiveProductsCached ships every column (descriptions, SEO copy) and
 * every image for 300+ products into the RSC payload, which made /products ~1MB.
 * Same filters, same order, same 1h window.
 */
export const getProductCardsCached = unstable_cache(
  async (): Promise<ProductCardData[]> => {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from('products')
      .select(`
        id, slug, name, price, wholesale_price, rent_price,
        category:categories(name, slug),
        categories:product_categories(category:categories(name, slug)),
        images:product_images(image_url, alt_text, is_primary),
        variants:product_variants(price_override)
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    return ((data ?? []) as unknown as ProductCardRow[]).map(toProductCardData)
  },
  ['product-cards'],
  { revalidate: ONE_HOUR, tags: ['products'] }
)
