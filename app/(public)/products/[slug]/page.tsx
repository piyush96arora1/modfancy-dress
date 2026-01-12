import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AddToCartButton } from '@/components/public/AddToCartButton'
import type { ProductWithDetails } from '@/types/database'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} - Mod Fancy Dress`,
    description: product.description || `Buy ${product.name} at Mod Fancy Dress`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Find product by slug (show active products, but also check for inactive ones)
  // Never show deleted products to public
  let { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null) // Never show deleted products
    .single()

  // If not found as active, check if it exists as inactive (but not deleted)
  if (!product) {
    const { data: inactiveProduct } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .is('deleted_at', null) // Never show deleted products
      .single()
    
    if (inactiveProduct) {
      // Product exists but is inactive - use it anyway
      product = inactiveProduct
    } else {
      // Product doesn't exist or is deleted
      notFound()
    }
  }

  const productData = product as ProductWithDetails
  const primaryImage = productData.images?.find((img) => img.is_primary) || productData.images?.[0]
  const otherImages = productData.images?.filter((img) => !img.is_primary) || []

  // Get unique sizes and colors from variants (filter out null values)
  const sizes = [...new Set(productData.variants?.map((v) => v.size).filter((s): s is string => Boolean(s)) || [])]
  const colors = [...new Set(productData.variants?.map((v) => v.color).filter((c): c is string => Boolean(c)) || [])]

  const basePrice = productData.price

  return (
    <div className="px-4 md:px-0 bg-white">
      {!productData.is_active && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          This product is currently inactive.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Images */}
      <div>
        {primaryImage && (
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={primaryImage.image_url}
              alt={productData.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        {otherImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {otherImages.map((img) => (
              <div key={img.id} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                <Image
                  src={img.image_url}
                  alt={`${productData.name} - Image ${img.order}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{productData.name}</h1>
        {productData.category && (
          <p className="text-gray-600 mb-4">{productData.category.name}</p>
        )}
        {basePrice && (
          <p className="text-3xl font-bold mb-6 text-gray-900">₹{basePrice.toFixed(2)}</p>
        )}

        {productData.description && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2 text-gray-900">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{productData.description}</p>
          </div>
        )}

        {/* Variants */}
        <div className="mb-6">
          <AddToCartButton
            product={productData}
            sizes={sizes}
            colors={colors}
            variants={productData.variants}
          />
        </div>

        {/* Product Details */}
        {productData.variants.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-2 text-gray-900">Available Options</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {sizes.length > 0 && (
                <li>
                  <strong>Sizes:</strong> {sizes.join(', ')}
                </li>
              )}
              {colors.length > 0 && (
                <li>
                  <strong>Colors:</strong> {colors.join(', ')}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}





