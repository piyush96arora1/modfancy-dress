import { unstable_cache } from 'next/cache'
import { createPublicServerClient } from './public-server'

const ONE_DAY = 86400

/** PostgREST code for "single() matched zero rows" — a legitimate 404, not a failure. */
const NO_ROWS = 'PGRST116'

export type ProductCategoryRef = { id: string; name: string; slug: string }

/**
 * Every *active* category a product belongs to: its primary `category_id` plus
 * any `product_categories` junction rows.
 *
 * Filtering to active categories here is what keeps a product filed under a
 * switched-off category from falling through to an empty related block — it
 * drops out of the running and a live category is used instead.
 *
 * The payload is a handful of ids, so one cache entry per product is cheap. The
 * heavy per-category product lists stay shared in `getProductsForCategoryCached`.
 */
export const getProductCategoriesCached = unstable_cache(
  async (productId: string): Promise<ProductCategoryRef[]> => {
    const supabase = createPublicServerClient()

    const [productRes, junctionRes] = await Promise.all([
      supabase.from('products').select('category_id').eq('id', productId).single(),
      supabase.from('product_categories').select('category_id').eq('product_id', productId),
    ])

    if (productRes.error && productRes.error.code !== NO_ROWS) {
      throw new Error(`[related-queries] primary category for "${productId}" failed: ${productRes.error.message}`)
    }
    if (junctionRes.error) {
      throw new Error(`[related-queries] junction categories for "${productId}" failed: ${junctionRes.error.message}`)
    }

    const ids = [
      ...new Set(
        [productRes.data?.category_id, ...(junctionRes.data ?? []).map((r) => r.category_id)]
          .filter((id): id is string => Boolean(id))
      ),
    ]
    if (ids.length === 0) return []

    const catRes = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('id', ids)
      .eq('is_active', true)
    if (catRes.error) {
      throw new Error(`[related-queries] categories for "${productId}" failed: ${catRes.error.message}`)
    }

    // Stable order so downstream tie-breaks are deterministic across rebuilds.
    return (catRes.data ?? []).sort((a, b) => a.id.localeCompare(b.id))
  },
  ['product-categories'],
  { revalidate: ONE_DAY, tags: ['products', 'categories'] }
)
