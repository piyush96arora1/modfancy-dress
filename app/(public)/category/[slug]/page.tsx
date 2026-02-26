import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import type { ProductWithDetails } from '@/types/database'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return generatePageMetadata({
    title: `${category.name} Fancy Dress Costumes - Premium Collection`,
    description: category.description || `Browse our premium collection of ${category.name} fancy dress costumes. Quality costumes for school functions and events. 15+ years experience, 400+ successful events.`,
    path: `/category/${slug}`,
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    notFound()
  }

  const { data: productCategories } = await supabase
    .from('product_categories')
    .select('product_id')
    .eq('category_id', category.id)

  const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []

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

  if (productIdsFromJunction.length > 0) {
    query = query.or(`category_id.eq.${category.id},id.in.(${productIdsFromJunction.join(',')})`)
  } else {
    query = query.eq('category_id', category.id)
  }

  query = query.order('created_at', { ascending: false })
  const { data: products } = await query

  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/products' },
    { name: category.name, url: `/category/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/products" className="hover:text-[#1B2A4A] transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-[#2D2D2D]">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-6 md:mb-8 p-5 md:p-6 rounded-xl bg-[#F5F3F0]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-1">{category.name}</h1>
              {category.description && (
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{category.description}</p>
              )}
              {products && (
                <p className="text-xs text-[#9A9A9A] mt-2">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
              )}
            </div>
            <PricingModeToggle currentMode="retail" basePath={`/category/${slug}`} />
          </div>
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <ProductGrid products={products as ProductWithDetails[]} />
        ) : (
          <div className="text-center py-16">
            <p className="text-[#9A9A9A] text-sm">No products found in this category.</p>
          </div>
        )}
      </div>
    </>
  )
}
