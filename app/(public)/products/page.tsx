import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { SearchBar } from '@/components/public/SearchBar'
import { CategoryFilter } from '@/components/public/CategoryFilter'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
import type { ProductWithDetails } from '@/types/database'

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
  }>
}

export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const { search, category } = await searchParams
  const title = search 
    ? `Search Results for "${search}" - Fancy Dress Costumes`
    : category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Fancy Dress Costumes`
    : 'All Fancy Dress Costumes - Browse Collection'
  
  const description = search
    ? `Find fancy dress costumes matching "${search}". Quality costumes for school functions, dance performances, and events.`
    : category
    ? `Browse our collection of ${category} fancy dress costumes. Premium quality, 15+ years experience.`
    : 'Browse our complete collection of fancy dress costumes and accessories. 400+ successful school functions. Premium quality costumes in Delhi.'

  return generatePageMetadata({
    title,
    description,
    path: '/products',
  })
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const { search, category } = await searchParams

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
    .is('deleted_at', null) // Only show products that are not deleted

  // Apply search filter - search in name and description
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply category filter - check both old category_id and new product_categories junction table
  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (categoryData) {
      // First get product IDs from junction table
      const { data: productCategories } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryData.id)

      const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []
      
      // Filter by products that have this category_id OR are in the junction table
      if (productIdsFromJunction.length > 0) {
        query = query.or(`category_id.eq.${categoryData.id},id.in.(${productIdsFromJunction.join(',')})`)
      } else {
        query = query.eq('category_id', categoryData.id)
      }
    }
  }

  // Order by created_at descending (newest first)
  query = query.order('created_at', { ascending: false })

  const { data: products } = await query

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const isSearching = Boolean(search)
  const resultsCount = products?.length || 0

  return (
    <div className="px-4 md:px-0 bg-white">
      {/* Compact Header Section */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-indigo-900">
              {search ? `Search: "${search}"` : 'All Products'}
            </h1>
            {search && (
              <Link 
                href={category ? `/products?category=${category}` : '/products'}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline font-medium"
              >
                Clear search
              </Link>
            )}
          </div>
          {resultsCount > 0 && (
            <p className="text-sm text-gray-600 font-medium">
              {resultsCount} {resultsCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="w-full">
          <SearchBar />
        </div>

        {/* Category Filter - Always shown but compact */}
        <div className="mt-3">
          <CategoryFilter 
            categories={categories || []} 
            currentCategory={category || null}
            searchQuery={search || null}
          />
        </div>
      </div>

      {/* Products Grid - Full Width */}
      <div className="w-full">
        {products && products.length > 0 ? (
          <ProductGrid products={products as ProductWithDetails[]} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2 text-lg">
              {search ? `No products found for "${search}"` : 'No products found.'}
            </p>
            {search && (
              <Link 
                href="/products" 
                className="text-sm text-indigo-600 hover:text-indigo-800 underline font-medium"
              >
                Browse all products
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

