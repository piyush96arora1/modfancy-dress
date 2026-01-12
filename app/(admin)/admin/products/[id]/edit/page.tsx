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
      variants:product_variants(*)
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

  return (
    <div className="px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} categories={categories || []} />
    </div>
  )
}





