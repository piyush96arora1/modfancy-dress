import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AddToCartButton } from '@/components/public/AddToCartButton'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ProductSchema, BreadcrumbSchema } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
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
    .select('name, description, images:product_images(image_url, is_primary)')
    .eq('slug', slug)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
  const imageUrl = primaryImage?.image_url

  return generatePageMetadata({
    title: `${product.name} - Premium Fancy Dress Costume`,
    description: product.description || `Buy ${product.name} - Premium fancy dress costume at Mod Fancy Dress. Quality costumes for school functions and events. 15+ years experience.`,
    path: `/products/${slug}`,
    image: imageUrl,
    type: 'product',
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

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
    .is('deleted_at', null)
    .single()

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
      .is('deleted_at', null)
      .single()

    if (inactiveProduct) {
      product = inactiveProduct
    } else {
      notFound()
    }
  }

  const productData = product as ProductWithDetails
  const primaryImage = productData.images?.find((img) => img.is_primary) || productData.images?.[0]
  const otherImages = productData.images?.filter((img) => !img.is_primary) || []
  const allImages = primaryImage ? [primaryImage, ...otherImages] : otherImages

  const sizes = [...new Set(productData.variants?.map((v) => v.size).filter((s): s is string => Boolean(s)) || [])]
  const colors = [...new Set(productData.variants?.map((v) => v.color).filter((c): c is string => Boolean(c)) || [])]

  const productSchema = ProductSchema(productData)
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: productData.name, url: `/products/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6 overflow-x-auto">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors whitespace-nowrap">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/products" className="hover:text-[#1B2A4A] transition-colors whitespace-nowrap">Products</Link>
          {productData.category && (
            <>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link href={`/category/${productData.category.slug}`} className="hover:text-[#1B2A4A] transition-colors whitespace-nowrap">{productData.category.name}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-[#2D2D2D] truncate">{productData.name}</span>
        </nav>

        {!productData.is_active && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4 text-sm">
            This product is currently inactive.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Images */}
          <div>
            {primaryImage && (
              <div className="aspect-square relative bg-[#F5F3F0] rounded-xl overflow-hidden mb-3" style={{ boxShadow: 'var(--shadow-md)' }}>
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
                  <div key={img.id} className="aspect-square relative bg-[#F5F3F0] rounded-lg overflow-hidden border border-[#E8E5E0] hover:border-[#C8956C]/50 transition-colors cursor-pointer">
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
            {/* Category pill */}
            {productData.category && (
              <Link href={`/category/${productData.category.slug}`} className="inline-block mb-2">
                <span className="text-xs px-2.5 py-1 bg-[#F5F3F0] text-[#6B6B6B] rounded-full font-medium hover:bg-[#FBF5EF] hover:text-[#C8956C] transition-colors">
                  {productData.category.name}
                </span>
              </Link>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4 leading-tight">{productData.name}</h1>

            {productData.description && (
              <div className="mb-6 p-4 bg-[#F5F3F0] rounded-lg">
                <h2 className="font-semibold text-sm text-[#1B2A4A] mb-1.5 font-[family-name:var(--font-outfit)]">Description</h2>
                <p className="text-sm text-[#6B6B6B] whitespace-pre-line leading-relaxed">{productData.description}</p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mb-6">
              <AddToCartButton
                product={productData}
                sizes={sizes}
                colors={colors}
                variants={productData.variants}
              />
            </div>

            {/* Cross-link to wholesale */}
            <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <Link
                href={`/wholesale/${slug}`}
                className="text-sm text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
              >
                🏷️ Planning to buy in bulk? View wholesale prices →
              </Link>
            </div>

            {/* Available Options */}
            {productData.variants.length > 0 && (
              <div className="border-t border-[#E8E5E0] pt-5">
                <h3 className="font-semibold text-sm mb-2 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Available Options</h3>
                <ul className="space-y-1 text-sm text-[#6B6B6B]">
                  {sizes.length > 0 && (
                    <li>
                      <strong className="text-[#2D2D2D]">Sizes:</strong> {sizes.join(', ')}
                    </li>
                  )}
                  {colors.length > 0 && (
                    <li>
                      <strong className="text-[#2D2D2D]">Colors:</strong> {colors.join(', ')}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
