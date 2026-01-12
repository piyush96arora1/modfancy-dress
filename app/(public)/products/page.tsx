import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { SearchBar } from '@/components/public/SearchBar'
import { SortSelect } from '@/components/public/SortSelect'
import type { ProductWithDetails } from '@/types/database'

interface ProductsPageProps {
  searchParams: {
    search?: string
    category?: string
    sort?: string
  }
}

export const metadata = {
  title: 'Products - Mod Fancy Dress',
  description: 'Browse all our fancy dress products',
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const { search, category, sort } = searchParams

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

  // Apply search filter
  if (search) {
    query = query.ilike('name', `%${search}%`)
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

  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">All Products</h1>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <SearchBar />
          </div>
          <SortSelect />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {/* Sidebar Filters */}
        <aside className="md:col-span-1">
          <div className="border rounded-lg p-4 md:sticky md:top-24 bg-white">
            <h3 className="font-semibold mb-4 text-gray-900">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products"
                  className={`text-sm ${!category ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Categories
                </a>
              </li>
              {categories?.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.slug}`}
                    className={`text-sm ${category === cat.slug ? 'font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {products && products.length > 0 ? (
            <ProductGrid products={products as ProductWithDetails[]} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

