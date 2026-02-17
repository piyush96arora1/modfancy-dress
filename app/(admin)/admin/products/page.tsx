'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ProductList } from '@/components/admin/ProductList'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { Pagination } from '@/components/admin/Pagination'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const ITEMS_PER_PAGE = 50

export default function AdminProductsPage() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const [activeProducts, setActiveProducts] = useState<any[]>([])
  const [deletedProducts, setDeletedProducts] = useState<any[]>([])
  const [totalActiveItems, setTotalActiveItems] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const supabase = createClient()
      const offset = (currentPage - 1) * ITEMS_PER_PAGE

      // Count active products
      let countQuery = supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)

      if (search) countQuery = countQuery.ilike('name', `%${search}%`)
      const { count } = await countQuery
      setTotalActiveItems(count || 0)

      // Fetch active products
      let activeQuery = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          categories:product_categories(category:categories(*)),
          images:product_images(image_url, is_primary)
        `)
        .is('deleted_at', null)

      if (search) activeQuery = activeQuery.ilike('name', `%${search}%`)

      const { data: active } = await activeQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      setActiveProducts(active || [])

      // Fetch deleted products
      let deletedQuery = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          categories:product_categories(category:categories(*)),
          images:product_images(image_url, is_primary)
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .limit(20)

      if (search) deletedQuery = deletedQuery.ilike('name', `%${search}%`)
      const { data: deleted } = await deletedQuery

      setDeletedProducts(deleted || [])
      setLoading(false)
    }
    fetchProducts()
  }, [search, currentPage])

  const totalPages = Math.ceil(totalActiveItems / ITEMS_PER_PAGE)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

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

      <div className="mb-6">
        <AdminSearchBar />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Active Products</h2>
        <ProductList products={activeProducts} showDeleted={false} />
        {activeProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalActiveItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>

      {deletedProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Deleted Products</h2>
          <ProductList products={deletedProducts} showDeleted={true} />
        </div>
      )}
    </div>
  )
}
