import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { SearchBar } from '@/components/public/SearchBar'
import { SortSelect } from '@/components/public/SortSelect'
import { CategoryFilter } from '@/components/public/CategoryFilter'
import type { ProductWithDetails } from '@/types/database'

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    sort?: string
  }>
}

export const metadata = {
  title: 'Products - Mod Fancy Dress',
  description: 'Browse all our fancy dress products',
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const { search, category, sort } = await searchParams

  // Build query - filter out deleted products
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .is('deleted_at', null) // Only show products that are not deleted

  // Apply search filter - search in name and description
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
      query = query.eq('category_id', categoryData.id)
    }
  }

  // Apply sorting
  const sortOrder = sort === 'price-low' ? 'asc' : sort === 'price-high' ? 'desc' : 'desc'
  if (sort?.includes('price')) {
    query = query.order('price', { ascending: sortOrder === 'asc' })
  } else {
    query = query.order('created_at', { ascending: false })
  }

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
          <h1 className="text-xl md:text-2xl font-bold text-indigo-900">
            {search ? `Search: "${search}"` : 'All Products'}
          </h1>
          {resultsCount > 0 && (
            <p className="text-sm text-gray-600 font-medium">
              {resultsCount} {resultsCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
        
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <SortSelect />
          </div>
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
  )
}

