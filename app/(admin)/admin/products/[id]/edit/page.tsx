import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(*),
      product_categories:product_categories(category_id)
    `)
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Extract category IDs from product_categories junction table
  const productCategoryIds = product.product_categories?.map((pc: any) => pc.category_id) || []
  
  // Add category_ids to product object for form
  const productWithCategories = {
    ...product,
    category_ids: productCategoryIds,
    // Keep category_id for backward compatibility (use first category if exists)
    category_id: productCategoryIds.length > 0 ? productCategoryIds[0] : product.category_id
  }

  return (
    <div className="px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={productWithCategories} categories={categories || []} />
    </div>
  )
}





