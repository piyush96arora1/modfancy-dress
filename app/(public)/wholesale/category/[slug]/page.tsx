import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import type { ProductWithDetails } from '@/types/database'

interface WholesaleCategoryPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: WholesaleCategoryPageProps) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: category } = await supabase
        .from('categories')
        .select('name, description, seo_title, meta_description, image_url')
        .eq('slug', slug)
        .single()

    if (!category) {
        return { title: 'Category Not Found' }
    }

    const defaultDescription = category.description
        ? `Buy ${category.name} fancy dress costumes at wholesale bulk prices. ${category.description}`
        : `Buy ${category.name} fancy dress costumes at wholesale prices. Bulk discounts for schools, events, and cultural programs. Save up to 30%.`
    const description = category.meta_description
        ? category.meta_description
        : (defaultDescription.length > 155 ? defaultDescription.slice(0, 152) + '…' : defaultDescription)

    return generatePageMetadata({
        title: category.seo_title || `${category.name} Costumes | Buy Online`,
        description,
        path: `/wholesale/category/${slug}`,
        image: getImageUrl(category.image_url),
    })
}

export default async function WholesaleCategoryPage({ params }: WholesaleCategoryPageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch wholesale discount setting
    const { data: settings } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'wholesale_discount_pct')
        .single()

    const wholesaleDiscountPct = settings?.value?.value ?? 30

    const { data: category } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (!category) {
        notFound()
    }

    const { data: productCategories } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', category.id)

    const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []

    let query = supabase
        .from('products')
        .select(`
      *,
      category:categories(name),
      categories:product_categories(category:categories(name)),
      images:product_images(image_url, is_primary),
      variants:product_variants(price_override)
    `)
        .eq('is_active', true)
        .is('deleted_at', null)

    if (productIdsFromJunction.length > 0) {
        query = query.or(`category_id.eq.${category.id},id.in.(${productIdsFromJunction.join(',')})`)
    } else {
        query = query.eq('category_id', category.id)
    }

    query = query.order('created_at', { ascending: false })
    const { data: products } = await query

    const breadcrumbSchema = BreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Wholesale', url: '/wholesale' },
        { name: category.name, url: `/wholesale/category/${slug}` },
    ])

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="fade-in">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6">
                    <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <Link href="/wholesale" className="hover:text-[#1B2A4A] transition-colors">Wholesale</Link>
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[#2D2D2D]">{category.name}</span>
                </nav>

                {/* Category Header — compact so products are above the fold */}
                <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                        {category.name} — Wholesale
                        {products && (
                            <span className="text-sm font-normal text-emerald-700 ml-2">({products.length} {products.length === 1 ? 'product' : 'products'})</span>
                        )}
                    </h1>
                    <PricingModeToggle currentMode="wholesale" basePath={`/category/${slug}`} />
                </div>

                {/* Cross-link to retail */}
                <div className="mb-4">
                    <Link
                        href={`/category/${slug}`}
                        className="text-sm text-[#C8956C] hover:text-[#A07048] font-medium transition-colors"
                    >
                        ← View retail prices for {category.name}
                    </Link>
                </div>

                {/* Products Grid */}
                {products && products.length > 0 ? (
                    <ProductGrid
                        products={products as ProductWithDetails[]}
                        pricingMode="wholesale"
                        wholesaleDiscountPct={wholesaleDiscountPct}
                    />
                ) : (
                    <div className="text-center py-16">
                        <p className="text-[#9A9A9A] text-sm">No products found in this category.</p>
                    </div>
                )}

                {/* Category description below products */}
                {category.description && (
                    <section className="mt-10 md:mt-12 pt-8 border-t border-[#E8E5E0]" aria-label="About this category">
                        <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-3xl">{category.description}</p>
                    </section>
                )}

                {/* Link to blog */}
                <section className="mt-8 pt-6 border-t border-[#E8E5E0]">
                    <Link href="/blog" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
                        Fancy dress ideas & costume guides on our blog →
                    </Link>
                </section>
            </div>
        </>
    )
}
