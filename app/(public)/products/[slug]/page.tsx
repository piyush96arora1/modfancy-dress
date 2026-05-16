import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import {
  getProductBySlugCached,
  getProductMetaBySlugCached,
  getActiveProductSlugsCached,
} from '@/lib/supabase/cached-queries'
import { AddToCartButton } from '@/components/public/AddToCartButton'
import { ProductGallery } from '@/components/public/ProductGallery'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { smartProductTitle } from '@/lib/seo/title-helpers'
import { ProductPageJsonLdGraph, aggregateRatingFromProductReviews } from '@/lib/seo/structured-data'
import { ChevronRight, Star } from 'lucide-react'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
import { getImageUrl } from '@/lib/imageUrl'
import type { ProductWithDetails, ProductReview } from '@/types/database'
import { SizeGuideTable } from '@/components/public/seo-tables/SizeGuideTable'
import { siteBaseUrl, whatsappUrl } from '@/lib/constants/contact'

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getActiveProductSlugsCached()
  return slugs.map((slug) => ({ slug }))
}

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductMetaBySlugCached(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
  const imageUrl = primaryImage?.image_url
  const catName = (product.category as { name?: string } | null)?.name ?? null

  const description =
    product.meta_description ??
    (product.description && product.description.trim()
      ? product.description.trim().slice(0, 155) + (product.description.length > 155 ? '…' : '')
      : `Buy ${product.name} - fancy dress costume at Mod Fancy Dress. Quality costumes for school functions and events. 15+ years experience.`)

  return generatePageMetadata({
    title: product.seo_title || smartProductTitle(product.name, catName),
    description,
    path: `/products/${slug}`,
    image: getImageUrl(imageUrl),
    type: 'product',
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlugCached(slug)

  if (!product || !product.is_active || product.deleted_at) {
    notFound()
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

  const productPageUrl = `${siteBaseUrl()}/products/${slug}`
  const waBuyMessage = `Hi, I'm interested in "${productData.name}". Can you help with size/availability?\n\n${productPageUrl}`
  const waRentMessage = `Hi, I want to rent "${productData.name}". Please share availability and rent price.\n\n${productPageUrl}`

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

            {/* Connect on WhatsApp — desktop only; mobile uses the FAB */}
            <a
              href={whatsappUrl(waBuyMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA851] text-white font-semibold text-sm transition-colors mb-4"
              aria-label="Connect on WhatsApp to ask about this product"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
            </a>

            {/* Rent + Wholesale — compact secondary options */}
            <div className="space-y-2.5 mb-4">
              {productData.rent_price != null && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-[#E8E5E0]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1B2A4A]">
                      Rent from <span className="text-[#C8956C] font-bold">₹{productData.rent_price}/event</span>
                    </p>
                    <Link href="/rent" className="block text-[10px] text-[#9A9A9A] hover:text-[#C8956C] transition-colors mt-0.5">
                      Shop pickup or Porter/Rapido delivery →
                    </Link>
                  </div>
                  <a
                    href={whatsappUrl(waRentMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold transition-colors touch-manipulation"
                    aria-label="Enquire about renting this costume on WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    Rent
                  </a>
                </div>
              )}

              <div className="px-4 py-3 rounded-xl bg-[#F5F3F0] border border-[#E8E5E0]">
                <Link
                  href={`/wholesale/${slug}`}
                  className="text-sm text-[#1B2A4A] hover:text-[#C8956C] font-medium transition-colors"
                >
                  🏷️ Buying in bulk? View wholesale prices →
                </Link>
              </div>
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

      {/* WhatsApp FAB — mobile only, sits above bottom nav */}
      <a
        href={whatsappUrl(waBuyMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-[4.5rem] z-40 md:hidden flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 active:scale-95 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5" />
      </a>
    </>
  )
}
