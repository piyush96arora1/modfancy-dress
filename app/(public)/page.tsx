import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Mod Fancy Dress - Fancy Dress Costumes & Accessories',
  description: 'Browse our collection of fancy dress costumes and accessories',
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products (active products with images, not deleted)
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .is('deleted_at', null) // Only show products that are not deleted
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="px-4 md:px-0">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-16 mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Welcome to Mod Fancy Dress
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
          Discover amazing fancy dress costumes and accessories
        </p>
        <Link href="/products">
          <Button size="lg">Shop Now</Button>
        </Link>
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Featured Products</h2>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">View All</Button>
          </Link>
        </div>
        {products && products.length > 0 ? (
          <ProductGrid products={products as any} />
        ) : (
          <p className="text-gray-500 text-center py-12">
            No products available yet. Check back soon!
          </p>
        )}
      </section>
    </div>
  )
}






