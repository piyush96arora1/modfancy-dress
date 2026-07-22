import Link from 'next/link'
import {
    getAllActiveProductsCached,
    getActiveCategoriesCached,
    getWholesaleDiscountPctCached,
} from '@/lib/supabase/cached-queries'
import { ProductsBrowser } from '@/components/public/ProductsBrowser'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { CategoryPriceTable } from '@/components/public/seo-tables/CategoryPriceTable'
import type { ProductWithDetails } from '@/types/database'

// Statically rendered (ISR); filtering is client-side. See /products for rationale.
export const revalidate = 3600

export const metadata = generatePageMetadata({
    title: 'Wholesale Fancy Dress Costumes - Bulk Prices for Schools & Events',
    description:
        'Shop wholesale fancy dress costumes at bulk prices. Save 30% on costumes for school functions, dance events, and cultural programs. 400+ successful school events.',
    path: '/wholesale',
})

export default async function WholesalePage() {
    const [products, categories, wholesaleDiscountPct] = await Promise.all([
        getAllActiveProductsCached(),
        getActiveCategoriesCached(),
        getWholesaleDiscountPctCached(),
    ])

    return (
        <ProductsBrowser
            products={products as unknown as ProductWithDetails[]}
            categories={categories}
            heading="Wholesale Prices"
            basePath="/wholesale"
            pricingMode="wholesale"
            wholesaleDiscountPct={wholesaleDiscountPct}
        >
            {/* Wholesale banner */}
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#F5F3F0] border border-[#E8E5E0]">
                <p className="text-sm text-[#2D2D2D]">
                    <strong>📦 Wholesale Pricing</strong> — Bulk order prices per piece. Click any product to send an enquiry.
                    {' '}<Link href="/wholesale/schools" className="text-[#C8956C] hover:underline font-medium">School &amp; bulk orders →</Link>
                </p>
            </div>

            <div className="mb-8">
                <CategoryPriceTable headingId="wholesale-category-prices" />
            </div>
        </ProductsBrowser>
    )
}
