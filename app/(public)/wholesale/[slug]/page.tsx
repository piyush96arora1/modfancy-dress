import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AddToEnquiryButton } from '@/components/public/AddToEnquiryButton'
import { ProductGallery } from '@/components/public/ProductGallery'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import { getProductPrice, formatPrice } from '@/lib/utils/pricing'
import type { ProductWithDetails } from '@/types/database'

interface WholesaleProductPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: WholesaleProductPageProps) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: product } = await supabase
        .from('products')
        .select('name, description, price, wholesale_price, images:product_images(image_url, is_primary)')
        .eq('slug', slug)
        .single()

    if (!product) {
        return { title: 'Product Not Found' }
    }

    const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
    const wholesalePrice = product.wholesale_price ?? Math.round((product.price || 0) * 0.7)

    return generatePageMetadata({
        title: `${product.name} - Wholesale Bulk Price`,
        description: `Buy ${product.name} at wholesale price ₹${wholesalePrice}/piece. Bulk orders for schools, events, and resellers. Send enquiry for best prices.`,
        path: `/wholesale/${slug}`,
        image: primaryImage?.image_url,
        type: 'product',
    })
}

export default async function WholesaleProductPage({ params }: WholesaleProductPageProps) {
    const { slug } = await params
    const supabase = await createClient()

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

    const sizes = [...new Set(productData.variants?.map((v) => v.size).filter((s): s is string => Boolean(s)) || [])]

    const wholesalePrice = getProductPrice(productData, 'wholesale', wholesaleDiscountPct)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modfacnydress.com'

    // Wholesale structured data with UnitPriceSpecification
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${siteUrl}/wholesale/${slug}#product`,
        name: `${productData.name} - Wholesale`,
        description: productData.description || `${productData.name} available at wholesale bulk prices at Mod Fancy Dress`,
        image: primaryImage ? [primaryImage.image_url] : [],
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
            seller: { '@type': 'LocalBusiness', name: 'Mod Fancy Dress' },
        },
    }

    const breadcrumbSchema = BreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Wholesale', url: '/wholesale' },
        { name: productData.name, url: `/wholesale/${slug}` },
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

                        {productData.description && (
                            <div className="mb-6 p-4 bg-[#F5F3F0] rounded-lg">
                                <h2 className="font-semibold text-sm text-[#1B2A4A] mb-1.5 font-[family-name:var(--font-outfit)]">Description</h2>
                                <p className="text-sm text-[#6B6B6B] whitespace-pre-line leading-relaxed">{productData.description}</p>
                            </div>
                        )}

                        {/* Wholesale Enquiry — Add to Enquiry List */}
                        <div className="mb-6">
                            <AddToEnquiryButton
                                product={productData}
                                sizes={sizes}
                                wholesaleDiscountPct={wholesaleDiscountPct}
                            />
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
            </div>
        </>
    )
}
