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
  const categoryParam = searchParams.get('category') || 'all'

  const [activeProducts, setActiveProducts] = useState<any[]>([])
  const [deletedProducts, setDeletedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<{ id: string, name: string, slug: string }[]>([])
  const [totalActiveItems, setTotalActiveItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll to minimize header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch all categories once
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('id, name, slug').order('name')
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

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

      let categoryMatchProductIds: string[] = []

      // 1. Enhanced Search Logic: If searching, also find products in matching categories
      if (search) {
        const { data: matchedCats } = await supabase.from('categories').select('id').ilike('name', `%${search}%`)
        if (matchedCats && matchedCats.length > 0) {
          const catIds = matchedCats.map(c => c.id)
          const { data: pcRefs } = await supabase.from('product_categories').select('product_id').in('category_id', catIds)
          categoryMatchProductIds = pcRefs?.map(p => p.product_id) || []
        }
      }

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

      // Apply Filter by Category Param
      if (categoryParam && categoryParam !== 'all') {
        const { data: categoryData } = await supabase.from('categories').select('id').eq('slug', categoryParam).single()
        if (categoryData) {
          const { data: productCategories } = await supabase.from('product_categories').select('product_id').eq('category_id', categoryData.id)
          const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []

          if (productIdsFromJunction.length > 0) {
            activeQuery = activeQuery.in('id', productIdsFromJunction)
            countQuery = countQuery.in('id', productIdsFromJunction)
          } else {
            // Category has no products, force empty result
            activeQuery = activeQuery.eq('id', '00000000-0000-0000-0000-000000000000')
            countQuery = countQuery.eq('id', '00000000-0000-0000-0000-000000000000')
          }
        }
      }

      // Apply Search filter (combining name match OR matched category product ids)
      if (search) {
        if (categoryMatchProductIds.length > 0) {
          activeQuery = activeQuery.or(`name.ilike.%${search}%,id.in.(${categoryMatchProductIds.join(',')})`)
          countQuery = countQuery.or(`name.ilike.%${search}%,id.in.(${categoryMatchProductIds.join(',')})`)
        } else {
          activeQuery = activeQuery.ilike('name', `%${search}%`)
          countQuery = countQuery.ilike('name', `%${search}%`)
        }
      }

      // Execute Count
      const { count } = await countQuery
      setTotalActiveItems(count || 0)

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
  }, [search, currentPage, categoryParam])

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
      {/* Sticky Header Container for Mobile */}
      <div
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-gray-100 md:relative md:z-auto md:bg-transparent md:pt-0 md:pb-0 md:border-none mb-6 -mx-4 px-4 md:mx-0 md:px-0 ${isScrolled ? 'pt-2 pb-2 shadow-sm' : 'pt-2 pb-4'
          }`}
      >
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100 mb-4'
          } md:!h-auto md:!opacity-100 md:!mb-4`}>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Search Results for "${search}"` : 'Products'}
          </h1>
          <Link href="/admin/products/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Add New Product</Button>
          </Link>
        </div>

        <div>
          <AdminSearchBar categories={categories} />
        </div>
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
