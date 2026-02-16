'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ProductGrid } from '@/components/public/ProductGrid'
import { productsCache } from '@/lib/cache/products'
import type { ProductWithDetails } from '@/types/database'

interface ProductsClientProps {
  initialProducts: ProductWithDetails[]
  initialCategories: Array<{ id: string; name: string; slug: string }>
  search?: string
  category?: string
}

export function ProductsClient({
  initialProducts,
  initialCategories,
  search,
  category
}: ProductsClientProps) {
  // Cache the server-rendered data for future fast navigations
  useEffect(() => {
    productsCache.set(search, category, {
      products: initialProducts,
      categories: initialCategories,
    })
  }, [search, category, initialProducts, initialCategories])

  // Prefetch data for common routes
  useEffect(() => {
    const prefetchRoutes = async () => {
      if (search || category) {
        await productsCache.prefetch()
      }
      initialCategories.slice(0, 5).forEach((cat) => {
        productsCache.prefetch(undefined, cat.slug)
      })
    }

    const timer = setTimeout(prefetchRoutes, 2000)
    return () => clearTimeout(timer)
  }, [initialCategories, search, category])

  // Always use the server-rendered initialProducts — this is the source of truth
  if (initialProducts.length > 0) {
    return <ProductGrid products={initialProducts} />
  }

  return (
    <div className="text-center py-12">
      <p className="text-[#9A9A9A] mb-2 text-base">
        {search ? `No products found for "${search}"` : 'No products found.'}
      </p>
      {search && (
        <Link
          href="/products"
          className="text-sm text-[#C8956C] hover:text-[#A07048] underline font-medium transition-colors"
        >
          Browse all products
        </Link>
      )}
    </div>
  )
}
