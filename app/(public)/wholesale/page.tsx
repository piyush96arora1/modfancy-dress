import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/public/SearchBar'
import { CategoryFilter } from '@/components/public/CategoryFilter'
import { ProductGrid } from '@/components/public/ProductGrid'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'
import { generatePageMetadata } from '@/lib/seo/metadata'
import type { ProductWithDetails } from '@/types/database'

export const revalidate = 60

interface WholesalePageProps {
    searchParams: Promise<{
        search?: string
        category?: string
    }>
}

export async function generateMetadata({ searchParams }: WholesalePageProps) {
    const { search, category } = await searchParams
    const title = search
        ? `Wholesale Results for "${search}" - Bulk Fancy Dress Costumes`
        : category
            ? `Wholesale ${category.charAt(0).toUpperCase() + category.slice(1)} Costumes - Bulk Prices`
            : 'Wholesale Fancy Dress Costumes - Bulk Prices for Schools & Events'

    const description = search
        ? `Find wholesale fancy dress costumes matching "${search}". Bulk discount prices for schools, events, and resellers.`
        : category
            ? `Buy ${category} fancy dress costumes at wholesale prices. Bulk discounts for schools and event organizers.`
            : 'Shop wholesale fancy dress costumes at bulk prices. Save 30% on costumes for school functions, dance events, and cultural programs. 400+ successful school events.'

    return generatePageMetadata({
        title,
        description,
        path: '/wholesale',
    })
}

export default async function WholesalePage({ searchParams }: WholesalePageProps) {
    const supabase = await createClient()
    const { search, category } = await searchParams

    // Fetch wholesale discount setting
    const { data: settings } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'wholesale_discount_pct')
        .single()

    const wholesaleDiscountPct = settings?.value?.value ?? 30

    let query = supabase
        .from('products')
        .select(`
      *,
      category:categories(*),
      categories:product_categories(category:categories(*)),
      images:product_images(*),
      variants:product_variants(*)
    `)
        .eq('is_active', true)
        .is('deleted_at', null)

    if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
        const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', category)
            .eq('is_active', true)
            .single()

        if (categoryData) {
            const { data: productCategories } = await supabase
                .from('product_categories')
                .select('product_id')
                .eq('category_id', categoryData.id)

            const productIdsFromJunction = productCategories?.map(pc => pc.product_id) || []

            if (productIdsFromJunction.length > 0) {
                query = query.or(`category_id.eq.${categoryData.id},id.in.(${productIdsFromJunction.join(',')})`)
            } else {
                query = query.eq('category_id', categoryData.id)
            }
        }
    }

    query = query.order('created_at', { ascending: false })
    const { data: products } = await query

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    const resultsCount = products?.length || 0

    return (
        <div className="fade-in">
            {/* Page Header */}
            <div className="mb-5 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                            {search ? `Wholesale Results for "${search}"` : 'Wholesale Prices'}
                        </h1>
                        {search && (
                            <Link
                                href={category ? `/wholesale?category=${category}` : '/wholesale'}
                                className="text-xs text-[#C8956C] hover:text-[#A07048] font-medium transition-colors"
                            >
                                Clear search
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {resultsCount > 0 && (
                            <p className="text-xs text-[#9A9A9A] font-medium">
                                {resultsCount} {resultsCount === 1 ? 'product' : 'products'}
                            </p>
                        )}
                        <PricingModeToggle currentMode="wholesale" />
                    </div>
                </div>

                {/* Wholesale banner */}
                <div className="mb-4 px-4 py-3 rounded-xl bg-[#F5F3F0] border border-[#E8E5E0]">
                    <p className="text-sm text-[#2D2D2D]">
                        <strong>📦 Wholesale Pricing</strong> — Bulk order prices per piece. Click any product to send an enquiry.
                    </p>
                </div>

                {/* Search */}
                <div className="w-full mb-3">
                    <Suspense fallback={<div className="h-12 bg-[#F5F3F0] rounded-lg animate-pulse" />}>
                        <SearchBar />
                    </Suspense>
                </div>

                {/* Category Filter */}
                <CategoryFilter
                    categories={categories || []}
                    currentCategory={category || null}
                    searchQuery={search || null}
                />
            </div>

            {/* Products Grid */}
            {products && products.length > 0 ? (
                <ProductGrid
                    products={products as ProductWithDetails[]}
                    pricingMode="wholesale"
                    wholesaleDiscountPct={wholesaleDiscountPct}
                />
            ) : (
                <div className="text-center py-12">
                    <p className="text-[#9A9A9A] mb-2 text-base">
                        {search ? `No products found for "${search}"` : 'No products found.'}
                    </p>
                    {search && (
                        <Link
                            href="/wholesale"
                            className="text-sm text-[#C8956C] hover:text-[#A07048] underline font-medium transition-colors"
                        >
                            Browse all wholesale products
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
