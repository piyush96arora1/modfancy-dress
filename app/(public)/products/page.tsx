import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/public/SearchBar'
import { CategoryFilter } from '@/components/public/CategoryFilter'
import { ProductsClient } from '@/components/public/ProductsClient'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'
import { generatePageMetadata } from '@/lib/seo/metadata'
import type { ProductWithDetails } from '@/types/database'

export const revalidate = 300

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
      : 'All Fancy Dress Costumes - Buy Online'

  const description = search
    ? `Find fancy dress costumes matching "${search}". Quality costumes for school functions, dance performances, and events.`
    : category
      ? `Browse our collection of ${category} fancy dress costumes. 15+ years experience.`
      : 'Browse our complete collection of fancy dress costumes and accessories. 400+ successful school functions. Quality costumes in Delhi.'

  return generatePageMetadata({
    title,
    description,
    path: '/products',
  })
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const { search, category } = await searchParams

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      categories:product_categories(category:categories(name)),
      images:product_images(image_url, is_primary),
      variants:product_variants(price_override)
    `)
    .eq('is_active', true)
    .is('deleted_at', null)

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (categoryData) {
      const { data: productCategories } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryData.id)

      const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []

      if (productIdsFromJunction.length > 0) {
        query = query.or(`category_id.eq.${categoryData.id},id.in.(${productIdsFromJunction.join(',')})`)
      } else {
        query = query.eq('category_id', categoryData.id)
      }
    }
  }

  query = query.order('created_at', { ascending: false })
  const { data: products } = await query

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .eq('is_active', true)
    .order('name')

  const resultsCount = products?.length || 0

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-5 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            {search && (
              <Link
                href={category ? `/products?category=${category}` : '/products'}
                className="text-xs text-[#C8956C] hover:text-[#A07048] font-medium transition-colors"
              >
                Clear search
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {resultsCount > 0 && (
              <p className="text-xs text-[#9A9A9A] font-medium">
                {resultsCount} {resultsCount === 1 ? 'product' : 'products'}
              </p>
            )}
            <PricingModeToggle currentMode="retail" />
          </div>
        </div>

        {/* Search */}
        <div className="w-full mb-3">
          <Suspense fallback={<div className="h-12 bg-[#F5F3F0] rounded-lg animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories || []}
          currentCategory={category || null}
          searchQuery={search || null}
        />
      </div>

      {/* Products Grid */}
      <ProductsClient
        initialProducts={products as ProductWithDetails[]}
        initialCategories={categories || []}
        search={search}
        category={category}
      />
    </div>
  )
}
