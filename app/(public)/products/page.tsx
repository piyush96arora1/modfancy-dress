import { Suspense } from 'react'
import {
  getAllActiveProductsCached,
  getActiveCategoriesCached,
} from '@/lib/supabase/cached-queries'
import { ProductsBrowser } from '@/components/public/ProductsBrowser'
import { ProductsListSkeleton } from '@/components/public/ProductsListSkeleton'
import { generatePageMetadata } from '@/lib/seo/metadata'
import type { ProductWithDetails } from '@/types/database'

// Statically rendered (ISR). Search + category filtering happen client-side
// from the URL, so the page no longer reads searchParams and stays cacheable.
// 1h window: new products appear on the listing within the hour.
export const revalidate = 3600

export const metadata = generatePageMetadata({
  title: 'All Fancy Dress Costumes - Buy Online',
  description:
    'Browse our complete collection of fancy dress costumes and accessories. 400+ successful school functions. Quality costumes in Delhi.',
  path: '/products',
})

async function ProductsList() {
  const [products, categories] = await Promise.all([
    getAllActiveProductsCached(),
    getActiveCategoriesCached(),
  ])

  return (
    <ProductsBrowser
      products={products as unknown as ProductWithDetails[]}
      categories={categories}
      heading="All Products"
      basePath="/products"
      pricingMode="retail"
    />
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsListSkeleton />}>
      <ProductsList />
    </Suspense>
  )
}
