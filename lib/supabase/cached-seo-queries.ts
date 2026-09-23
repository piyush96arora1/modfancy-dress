import {
  getCategoryBySlugCached,
  getProductsForCategoryCached,
} from './cached-queries'

/**
 * Cached public read paths added for the festival-season SEO work. Same pattern
 * as `cached-queries.ts` (unstable_cache + anon client, so pages stay ISR).
 */

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
