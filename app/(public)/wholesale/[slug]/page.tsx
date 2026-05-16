import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createPublicServerClient } from '@/lib/supabase/public-server'

export const revalidate = 86400
import { AddToEnquiryButton } from '@/components/public/AddToEnquiryButton'
import { ProductGallery } from '@/components/public/ProductGallery'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { wholesaleProductTitle } from '@/lib/seo/title-helpers'
import {
    WholesaleProductPageJsonLdGraph,
    toAbsoluteUrl,
    siteUrl,
    localBusinessEntityId,
    aggregateRatingFromProductReviews,
    reviewsForProductJsonLd,
} from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import { getProductPrice, formatPrice } from '@/lib/utils/pricing'
import type { ProductWithDetails } from '@/types/database'
import { SizeGuideTable } from '@/components/public/seo-tables/SizeGuideTable'

interface WholesaleProductPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: WholesaleProductPageProps) {
    const { slug } = await params
    const supabase = createPublicServerClient()
    const { data: product } = await supabase
        .from('products')
        .select('name, description, seo_title, meta_description, price, wholesale_price, images:product_images(image_url, is_primary)')
        .eq('slug', slug)
        .single()

    if (!product) {
        return { title: 'Product Not Found' }
    }

    const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
    const wholesalePrice = product.wholesale_price ?? Math.round((product.price || 0) * 0.7)
    const defaultDescription = `Buy ${product.name} at wholesale price ₹${wholesalePrice}/piece. Bulk orders for schools, events, and resellers. Send enquiry for best prices.`
    const description =
        product.meta_description ??
        (product.description?.trim()
            ? product.description.trim().slice(0, 155) + (product.description.length > 155 ? '…' : '')
            : defaultDescription)

    return generatePageMetadata({
        title: product.seo_title || wholesaleProductTitle(product.name),
        description,
        path: `/products/${slug}`,
        image: getImageUrl(primaryImage?.image_url),
        type: 'product',
    })
}

export default async function WholesaleProductPage({ params }: WholesaleProductPageProps) {
    const { slug } = await params
    const supabase = createPublicServerClient()

    // Fetch wholesale discount setting
    const { data: settings } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'wholesale_discount_pct')
        .single()

    const wholesaleDiscountPct = settings?.value?.value ?? 30

    const { data: product } = await supabase
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
        notFound()
    }

    const productData = product as ProductWithDetails
    const primaryImage = productData.images?.find((img) => img.is_primary) || productData.images?.[0]
    const otherImages = productData.images?.filter((img) => !img.is_primary) || []

    const sizes = [...new Set([
        ...(productData.size ? [productData.size] : []),
        ...(productData.variants?.map((v) => v.size).filter((s): s is string => Boolean(s)) || [])
    ])]

    const wholesalePrice = getProductPrice(productData, 'wholesale', wholesaleDiscountPct)

    const publicSb = createPublicServerClient()
    const { data: reviews, error: reviewsError } = await publicSb
        .from('product_reviews')
        .select('rating, review_text, author_name, created_at')
        .eq('product_id', productData.id)
        .order('created_at', { ascending: false })

    if (reviewsError) {
        console.error('[WholesaleProductPage] product_reviews:', reviewsError.message)
    }

    const reviewAgg = aggregateRatingFromProductReviews(reviews ?? null)

    // Wholesale structured data with UnitPriceSpecification
    const productSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${siteUrl}/wholesale/${slug}#product`,
        name: `${productData.name} - Wholesale`,
        description: productData.description || `${productData.name} available at wholesale bulk prices at Mod Fancy Dress`,
        image: primaryImage ? [toAbsoluteUrl(getImageUrl(primaryImage.image_url))] : [],
        brand: { '@type': 'Brand', name: 'Mod Fancy Dress' },
        category: productData.category?.name || 'Fancy Dress Costume',
        sku: productData.variants?.[0]?.sku || productData.slug,
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/wholesale/${slug}`,
            priceCurrency: 'INR',
            price: wholesalePrice.toString(),
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: wholesalePrice.toString(),
                priceCurrency: 'INR',
                unitText: 'piece',
            },
            seller: { '@id': localBusinessEntityId() },
        },
    }
    if (reviewAgg && reviewAgg.reviewCount >= 1) {
        productSchema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Math.round(reviewAgg.ratingValue * 10) / 10,
            reviewCount: reviewAgg.reviewCount,
            bestRating: 5,
            worstRating: 1,
        }
        const reviewNodes = reviewsForProductJsonLd(reviews ?? [], slug)
        if (reviewNodes.length > 0) {
            productSchema.review = reviewNodes
        }
    }

    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'Wholesale', url: '/wholesale' },
        ...(productData.category
            ? [{ name: productData.category.name, url: `/wholesale/category/${productData.category.slug}` }]
            : []),
        { name: productData.name, url: `/wholesale/${slug}` },
    ]

    const wholesalePageJsonLd = WholesaleProductPageJsonLdGraph(productSchema, breadcrumbItems, slug)

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(wholesalePageJsonLd) }}
            />
            <div className="fade-in">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6 overflow-x-auto">
                    <Link href="/" className="hover:text-[#1B2A4A] transition-colors whitespace-nowrap">Home</Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link href="/wholesale" className="hover:text-[#1B2A4A] transition-colors whitespace-nowrap">Wholesale</Link>
                    {productData.category && (
                        <>
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            <Link href={`/wholesale/category/${productData.category.slug}`} className="hover:text-[#1B2A4A] transition-colors whitespace-nowrap">{productData.category.name}</Link>
                        </>
                    )}
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[#2D2D2D] truncate">{productData.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    {/* Images */}
                    <div>
                        {/* We don't guarantee primaryImage, but productData.images should have images. Passing all available images. */}
                        <ProductGallery images={productData.images || []} productName={productData.name} />
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Category pill */}
                        {productData.category && (
                            <Link href={`/wholesale/category/${productData.category.slug}`} className="inline-block mb-2">
                                <span className="text-xs px-2.5 py-1 bg-[#F5F3F0] text-[#6B6B6B] rounded-full font-medium hover:bg-[#FBF5EF] hover:text-[#C8956C] transition-colors">
                                    {productData.category.name}
                                </span>
                            </Link>
                        )}

                        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4 leading-tight">{productData.name}</h1>

                        {/* Wholesale Enquiry — Add to Enquiry List */}
                        <div className="mb-6">
                            <AddToEnquiryButton
                                product={productData}
                                sizes={sizes}
                                wholesaleDiscountPct={wholesaleDiscountPct}
                            />
                            <p className="text-xs text-[#9A9A9A] mt-3 italic text-center md:text-left">
                                * Shipping charges are extra according to location.
                            </p>
                        </div>
                        {/* Cross-link to retail */}
                        <div className="border-t border-[#E8E5E0] pt-4">
                            <Link
                                href={`/products/${slug}`}
                                className="inline-flex items-center gap-1.5 text-sm text-[#C8956C] hover:text-[#A07048] font-medium transition-colors"
                            >
                                Need just a few? View retail price →
                            </Link>
                        </div>

                        {/* Available Options */}
                        {productData.variants.length > 0 && (
                            <div className="border-t border-[#E8E5E0] pt-5 mt-4">
                                <h3 className="font-semibold text-sm mb-2 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Available Options</h3>
                                <ul className="space-y-1 text-sm text-[#6B6B6B]">
                                    {sizes.length > 0 && (
                                        <li>
                                            <strong className="text-[#2D2D2D]">Sizes:</strong> {sizes.join(', ')}
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
            </div>
        </>
    )
}
