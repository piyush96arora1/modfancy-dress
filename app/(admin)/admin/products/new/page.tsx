import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'New Product - Admin Panel',
}

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm categories={categories || []} />
    </div>
  )
}






