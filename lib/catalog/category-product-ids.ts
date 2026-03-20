import type { SupabaseClient } from '@supabase/supabase-js'

/** Product IDs in a category (primary `category_id` + `product_categories` junction), active only. */
export async function getProductIdsForCategory(
  supabase: SupabaseClient,
  categoryId: string
): Promise<string[]> {
  const { data: productCategories } = await supabase
    .from('product_categories')
    .select('product_id')
    .eq('category_id', categoryId)

  const junctionIds = productCategories?.map((pc) => pc.product_id) ?? []

  let query = supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .is('deleted_at', null)

  if (junctionIds.length > 0) {
    query = query.or(`category_id.eq.${categoryId},id.in.(${junctionIds.join(',')})`)
  } else {
    query = query.eq('category_id', categoryId)
  }

  const { data } = await query
  return data?.map((p) => p.id) ?? []
}
