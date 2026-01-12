import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
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
    .select('name, description')
    .eq('slug', slug)
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
    .single()

  if (!category) {
    notFound()
  }

  // First, get product IDs from the junction table
  const { data: productCategories } = await supabase
    .from('product_categories')
    .select('product_id')
    .eq('category_id', category.id)

  const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []

  // Build query - check both old category_id and new junction table
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      categories:product_categories(category:categories(*)),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .is('deleted_at', null) // Only show products that are not deleted

  // Filter by products that have this category_id OR are in the junction table
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
      <div className="px-4 md:px-0 bg-white">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-indigo-900">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-6 md:mb-8">{category.description}</p>
      )}
      {products && products.length > 0 ? (
        <ProductGrid products={products as ProductWithDetails[]} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      )}
    </div>
    </>
  )
}






