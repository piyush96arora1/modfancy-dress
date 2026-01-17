import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProductList } from '@/components/admin/ProductList'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { Pagination } from '@/components/admin/Pagination'

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string
    page?: string
  }>
}

export const metadata = {
  title: 'Products - Admin Panel',
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const supabase = await createClient()
  const { search, page: pageParam } = await searchParams
  
  // Pagination settings
  const itemsPerPage = 50
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1
  const offset = (currentPage - 1) * itemsPerPage

  // Build count query for active products only (pagination applies to active products)
  let activeCountQuery = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null) // Only count active products
  
  if (search) {
    activeCountQuery = activeCountQuery.ilike('name', `%${search}%`)
  }
  
  const { count: totalActiveItems } = await activeCountQuery
  const totalPages = Math.ceil((totalActiveItems || 0) / itemsPerPage)

  // Build query for active products with pagination
  // Optimized: removed variants (not displayed in list)
  let activeQuery = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      categories:product_categories(category:categories(*)),
      images:product_images(image_url, is_primary)
    `)
    .is('deleted_at', null) // Only fetch active products
  
  // Apply search filter if provided
  if (search) {
    activeQuery = activeQuery.ilike('name', `%${search}%`)
  }
  
  // Apply pagination to active products
  const { data: activeProducts } = await activeQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + itemsPerPage - 1)
  
  // Fetch deleted products separately (limit to last 20, no pagination)
  let deletedQuery = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      categories:product_categories(category:categories(*)),
      images:product_images(image_url, is_primary)
    `)
    .not('deleted_at', 'is', null) // Only fetch deleted products
    .order('deleted_at', { ascending: false })
    .limit(20) // Limit deleted products to last 20
  
  if (search) {
    deletedQuery = deletedQuery.ilike('name', `%${search}%`)
  }
  
  const { data: deletedProducts } = await deletedQuery

  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {search ? `Search Results for "${search}"` : 'Products'}
        </h1>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Add New Product</Button>
        </Link>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <AdminSearchBar />
      </div>
      
      {/* Active Products */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Active Products</h2>
        <ProductList products={activeProducts || []} showDeleted={false} />
        {activeProducts && activeProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalActiveItems || 0}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
      
      {/* Deleted Products */}
      {deletedProducts && deletedProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Deleted Products</h2>
          <ProductList products={deletedProducts} showDeleted={true} />
        </div>
      )}
    </div>
  )
}






