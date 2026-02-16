import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined

    const supabase = await createClient()

    // Build query - filter out deleted products
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        categories:product_categories(category:categories(*)),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .is('deleted_at', null)

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply category filter
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (categoryData) {
        const { data: productCategories } = await supabase
          .from('product_categories')
          .select('product_id')
          .eq('category_id', categoryData.id)

        const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []
        
        if (productIdsFromJunction.length > 0) {
          query = query.or(`category_id.eq.${categoryData.id},id.in.(${productIdsFromJunction.join(',')})`)
        } else {
          query = query.eq('category_id', categoryData.id)
        }
      }
    }

    query = query.order('created_at', { ascending: false })

    const { data: products, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch categories for filter
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    return NextResponse.json({
      products: products || [],
      categories: categories || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

