import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { AddToCartButton } from '@/components/public/AddToCartButton'
import { ProductGallery } from '@/components/public/ProductGallery'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ProductPageJsonLdGraph, aggregateRatingFromProductReviews } from '@/lib/seo/structured-data'
import { ChevronRight, Star, MessageCircle } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import type { ProductWithDetails, ProductReview } from '@/types/database'
import { SizeGuideTable } from '@/components/public/seo-tables/SizeGuideTable'

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
    .select('name, description, seo_title, meta_description, images:product_images(image_url, is_primary)')
    .eq('slug', slug)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
  const imageUrl = primaryImage?.image_url

  const description =
    product.meta_description ??
    (product.description && product.description.trim()
      ? product.description.trim().slice(0, 155) + (product.description.length > 155 ? '…' : '')
      : `Buy ${product.name} - fancy dress costume at Mod Fancy Dress. Quality costumes for school functions and events. 15+ years experience.`)

  return generatePageMetadata({
    title: product.seo_title || product.name,
    description,
    path: `/products/${slug}`,
    image: getImageUrl(imageUrl),
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

  const sizes = [...new Set([
    ...(productData.size ? [productData.size] : []),
    ...(productData.variants?.map((v) => v.size).filter((s): s is string => Boolean(s)) || [])
  ])]

  const colors = [...new Set(productData.variants?.map((v) => v.color).filter((c): c is string => Boolean(c)) || [])]

  const publicSb = createPublicServerClient()
  const { data: reviews, error: reviewsError } = await publicSb
    .from('product_reviews')
    .select('id, rating, review_text, author_name, created_at')
    .eq('product_id', productData.id)
    .order('created_at', { ascending: false })

  if (reviewsError) {
    console.error('[ProductPage] product_reviews:', reviewsError.message)
  }

  const aggregateRating = aggregateRatingFromProductReviews(reviews ?? null)

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    ...(productData.category
      ? [{ name: productData.category.name, url: `/category/${productData.category.slug}` }]
      : []),
    { name: productData.name, url: `/products/${slug}` },
  ]

  const productPageJsonLd = ProductPageJsonLdGraph(
    productData,
    {
      aggregateRating,
      reviewsForJsonLd: aggregateRating && reviews?.length ? reviews : undefined,
    },
    breadcrumbItems
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productPageJsonLd) }}
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
            <ProductGallery images={allImages} productName={productData.name} />
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

            {/* Add to Cart */}
            <div className="mb-6">
              <AddToCartButton
                product={productData}
                sizes={sizes}
                colors={colors}
                variants={productData.variants}
              />
              <p className="text-xs text-[#9A9A9A] mt-3 italic text-center md:text-left">
                * Shipping charges are extra according to location.
              </p>
            </div>

            {/* Connect on WhatsApp — mobile-friendly tap target, clear spacing from wholesale */}
            <a
              href={`https://wa.me/919211077110?text=${encodeURIComponent(`Hi, I'm interested in "${productData.name}". Can you help with size/availability?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA851] text-white font-semibold text-sm transition-colors touch-manipulation mb-5"
              aria-label="Connect on WhatsApp to ask about this product"
            >
              <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
              <span>Connect on WhatsApp</span>
            </a>

            {/* Cross-link to wholesale — site accent, not WhatsApp green */}
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#F5F3F0] border border-[#E8E5E0]">
              <Link
                href={`/wholesale/${slug}`}
                className="text-sm text-[#1B2A4A] hover:text-[#C8956C] font-medium transition-colors"
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

        {/* Description below main block — keeps first fold focused on image + CTA */}
        {productData.description && (
          <section className="mt-10 md:mt-12 pt-8 border-t border-[#E8E5E0]" aria-label="Product description">
            <h2 className="font-semibold text-sm text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Description</h2>
            <p className="text-sm text-[#6B6B6B] whitespace-pre-line leading-relaxed max-w-3xl">{productData.description}</p>
          </section>
        )}

        {productData.category?.id && (
          <SizeGuideTable
            categoryId={productData.category.id}
            categoryName={productData.category.name}
            className="mt-10 md:mt-12 pt-8 border-t border-[#E8E5E0]"
          />
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <section className="mt-10 md:mt-12 pt-8 border-t border-[#E8E5E0]" aria-label="Customer reviews">
            <h2 className="font-semibold text-sm text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]">
              Reviews
              {aggregateRating && (
                <span className="ml-2 font-normal text-[#6B6B6B]">
                  — {Math.round(aggregateRating.ratingValue * 10) / 10} ★ ({aggregateRating.reviewCount} {aggregateRating.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </h2>
            <ul className="space-y-4">
              {(reviews as ProductReview[]).map((review) => (
                <li key={review.id} className="p-4 rounded-lg bg-[#F5F3F0]/60 border border-[#E8E5E0]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i <= review.rating ? 'text-[#C8956C] fill-[#C8956C]' : 'text-[#E8E5E0]'}`}
                        />
                      ))}
                    </span>
                    {review.author_name && (
                      <span className="text-sm font-medium text-[#2D2D2D]">{review.author_name}</span>
                    )}
                    <span className="text-xs text-[#9A9A9A]">
                      {new Date(review.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-[#6B6B6B] leading-relaxed mt-1">{review.review_text}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
