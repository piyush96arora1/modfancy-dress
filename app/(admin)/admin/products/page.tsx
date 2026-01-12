import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProductList } from '@/components/admin/ProductList'

export const metadata = {
  title: 'Products - Admin Panel',
}

export default async function AdminProductsPage() {
  const supabase = await createClient()

  // Fetch all products including deleted ones (for admin view)
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .order('created_at', { ascending: false })
  
  // Separate active and deleted products
  const activeProducts = products?.filter(p => !p.deleted_at) || []
  const deletedProducts = products?.filter(p => p.deleted_at) || []

  return (
    <div className="px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Add New Product</Button>
        </Link>
      </div>
      
      {/* Active Products */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Active Products</h2>
        <ProductList products={activeProducts} showDeleted={false} />
      </div>
      
      {/* Deleted Products */}
      {deletedProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Deleted Products</h2>
          <ProductList products={deletedProducts} showDeleted={true} />
        </div>
      )}
    </div>
  )
}






