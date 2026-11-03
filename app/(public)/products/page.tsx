import { Suspense } from 'react'
import { getProductCardsCached, getActiveCategoriesDailyCached } from '@/lib/supabase/cached-seo-queries'
import { ProductsBrowser } from '@/components/public/ProductsBrowser'
import { ProductsListSkeleton } from '@/components/public/ProductsListSkeleton'
import { generatePageMetadata } from '@/lib/seo/metadata'

// Statically rendered (ISR). Search + category filtering happen client-side
// from the URL, so the page no longer reads searchParams and stays cacheable.
export const revalidate = 604800 // weekly; admin saves and data scripts revalidate on demand (/api/revalidate)

export const metadata = generatePageMetadata({
  title: 'All Fancy Dress Costumes - Buy Online',
  description:
    'Browse our complete collection of fancy dress costumes and accessories. 400+ successful school functions. Quality costumes in Delhi.',
  path: '/products',
})

async function ProductsList() {
  const [products, categories] = await Promise.all([
    getProductCardsCached(),
    getActiveCategoriesDailyCached(),
  ])

  return (
    <ProductsBrowser
      products={products}
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
