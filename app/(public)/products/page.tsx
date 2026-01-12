import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { SearchBar } from '@/components/public/SearchBar'
import { SortSelect } from '@/components/public/SortSelect'
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
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-900">
            {search ? `Search Results for "${search}"` : 'All Products'}
          </h1>
          {search && resultsCount > 0 && (
            <p className="text-sm text-gray-600">
              {resultsCount} {resultsCount === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full">
            <SearchBar />
          </div>
          <div className="w-full md:w-auto">
            <SortSelect />
          </div>
        </div>
        {search && (
          <div className="mt-2">
            <Link 
              href="/products" 
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Clear search
            </Link>
          </div>
        )}
      </div>

      {/* Horizontal Category Filters - Shown when searching or as compact option */}
      {isSearching && (
        <div className="mb-6 pb-4 border-b">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter by category:</span>
            <Link
              href={search ? `/products?search=${encodeURIComponent(search)}` : '/products'}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                !category 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-700'
              }`}
            >
              All
            </Link>
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?search=${encodeURIComponent(search || '')}&category=${cat.slug}`}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  category === cat.slug
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-700'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-4 md:gap-6 ${isSearching ? 'md:grid-cols-1' : 'md:grid-cols-4'}`}>
        {/* Sidebar Filters - Only shown when NOT searching */}
        {!isSearching && (
          <aside className="md:col-span-1">
            <div className="border rounded-lg p-4 md:sticky md:top-24 bg-white">
              <h3 className="font-semibold mb-4 text-indigo-900">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`text-sm ${!category ? 'font-semibold text-indigo-900' : 'text-gray-600 hover:text-indigo-700'}`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`text-sm ${category === cat.slug ? 'font-semibold text-indigo-900' : 'text-gray-600 hover:text-indigo-700'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* Products Grid */}
        <div className={isSearching ? 'w-full' : 'md:col-span-3'}>
          {products && products.length > 0 ? (
            <>
              {isSearching && (
                <div className="mb-4 text-sm text-gray-600">
                  Showing {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
                </div>
              )}
              <ProductGrid products={products as ProductWithDetails[]} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {search ? `No products found for "${search}"` : 'No products found.'}
              </p>
              {search && (
                <Link 
                  href="/products" 
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Browse all products
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

