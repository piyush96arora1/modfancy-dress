import { Suspense } from 'react'
import Link from 'next/link'
import {
    getAllActiveProductsCached,
    getActiveCategoriesCached,
    getWholesaleDiscountPctCached,
} from '@/lib/supabase/cached-queries'
import { ProductsBrowser } from '@/components/public/ProductsBrowser'
import { WholesaleListSkeleton } from '@/components/public/WholesaleListSkeleton'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { CategoryPriceTable } from '@/components/public/seo-tables/CategoryPriceTable'
import { FaqPageSchema } from '@/lib/seo/structured-data'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Package, Truck, Wallet, Clock } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import type { ProductWithDetails } from '@/types/database'

// Statically rendered (ISR); filtering is client-side. See /products for rationale.
export const revalidate = 3600

export const metadata = generatePageMetadata({
    title: 'Wholesale Fancy Dress Costumes - Bulk Prices for Schools & Events',
    description:
        'Shop wholesale fancy dress costumes at bulk prices. Save 30% on costumes for school functions, dance events, and cultural programs. 400+ successful school events.',
    path: '/wholesale',
})

const pricingTiers = [
    { range: '10–49 pieces', discount: '15% off', note: 'Min. 10 of the same costume' },
    { range: '50–99 pieces', discount: '20% off', note: 'Mixed styles allowed' },
    { range: '100–299 pieces', discount: '25% off', note: 'Dedicated coordinator' },
    { range: '300+ pieces', discount: '30% off', note: 'Custom quote + priority packing' },
]

const wholesaleFaqs = [
    {
        question: 'What is the minimum order quantity for wholesale costume prices?',
        answer:
            'Bulk pricing starts at 10 pieces of the same costume style. From 50 pieces onwards you can mix different styles across the order and still keep the bulk rate. Orders under 10 pieces are billed at normal retail prices.',
    },
    {
        question: 'How much discount do I get on a bulk fancy dress order?',
        answer:
            'Discounts are tiered by quantity: 15% off for 10–49 pieces, 20% off for 50–99 pieces, 25% off for 100–299 pieces, and 30% off for 300 pieces and above. The 300+ tier is quoted individually and gets priority packing.',
    },
    {
        question: 'How long does a bulk costume order take to confirm and dispatch?',
        answer:
            'Send your costume list, total quantity, size breakdown and event date on WhatsApp. We check it against live stock and send a per-piece price list back, usually the same day. Stock is only held once you confirm, so book early during Republic Day, Independence Day, annual function and Navratri season when popular styles move fast.',
    },
    {
        question: 'Do you deliver bulk orders outside Krishna Nagar?',
        answer:
            'Yes. We deliver across Delhi NCR via Porter or Rapido, with shipping charges extra according to the delivery location. You can also collect the order yourself from our store at S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051, open daily 10 AM to 9:30 PM.',
    },
    {
        question: 'What are the payment terms for wholesale orders?',
        answer:
            'Orders above ₹10,000 need a 30% advance to confirm the order and hold the stock. The balance is paid on delivery by cash or UPI.',
    },
    {
        question: 'Can schools and dance academies rent costumes in bulk instead of buying?',
        answer:
            'Yes. Renting suits a one-time function where the costumes will not be reused, while buying works out cheaper for institutions running several events a year. Tell us your event schedule and we will suggest which option costs less.',
    },
]

async function WholesaleContent() {
    const [products, categories, wholesaleDiscountPct] = await Promise.all([
        getAllActiveProductsCached(),
        getActiveCategoriesCached(),
        getWholesaleDiscountPctCached(),
    ])

    const faqSchema = FaqPageSchema(wholesaleFaqs)

    return (
        <ProductsBrowser
            products={products as unknown as ProductWithDetails[]}
            categories={categories}
            heading="Wholesale Fancy Dress Costumes — Bulk Supplier in Delhi"
            basePath="/wholesale"
            pricingMode="wholesale"
            wholesaleDiscountPct={wholesaleDiscountPct}
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Wholesale banner */}
            <div className="mb-4 px-4 py-3 rounded-xl bg-[#F5F3F0] border border-[#E8E5E0]">
                <p className="text-sm text-[#2D2D2D]">
                    <strong>📦 Wholesale Pricing</strong> — Bulk order prices per piece. Click any product to send an enquiry.
                    {' '}<Link href="/wholesale/schools" className="text-[#C8956C] hover:underline font-medium">School &amp; bulk orders →</Link>
                </p>
            </div>

            {/* Intro prose */}
            <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-6">
                <p>
                    Mod Fancy Dress is a wholesale fancy dress costume supplier working out of{' '}
                    <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong>. Over{' '}
                    <strong className="text-[#2D2D2D]">15 years</strong> we have supplied bulk costume orders for{' '}
                    <strong className="text-[#2D2D2D]">400+ school functions</strong> and now hold{' '}
                    <strong className="text-[#2D2D2D]">400+ costume styles</strong> in stock. Every price shown on this
                    page is the per-piece bulk rate, not the retail rate — switch to{' '}
                    <Link href="/products" className="text-[#C8956C] hover:underline">the retail catalogue</Link>{' '}
                    if you are buying single pieces.
                </p>
                <p>
                    <strong className="text-[#2D2D2D]">Minimum order quantity:</strong> bulk pricing starts at{' '}
                    <strong className="text-[#2D2D2D]">10 pieces of the same costume style</strong>. Under 10 pieces the
                    order is billed at retail. Once you cross 50 pieces you can mix styles across the order and still
                    keep the bulk rate, which is what most school and dance orders end up doing.
                </p>

                <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                    Bulk Discount Tiers
                </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {pricingTiers.map((tier) => (
                    <div
                        key={tier.range}
                        className="rounded-xl border border-[#E8E5E0] bg-white p-4"
                        style={{ boxShadow: 'var(--shadow-xs)' }}
                    >
                        <p className="font-semibold text-[#1B2A4A] text-sm">{tier.range}</p>
                        <p className="text-2xl font-bold text-[#C8956C] my-1">{tier.discount}</p>
                        <p className="text-xs text-[#9A9A9A]">{tier.note}</p>
                    </div>
                ))}
            </div>

            {/* Ordering logistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl border border-[#E8E5E0] bg-white p-4">
                    <Clock className="w-5 h-5 text-[#C8956C] mb-2" />
                    <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1">Lead time &amp; stock confirmation</h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                        WhatsApp us the costume list, quantity, size breakdown and event date. We check live stock and
                        send a per-piece price list back, usually the same day. Stock is held only after you confirm, so
                        book early in Republic Day, Independence Day, annual function and Navratri season.
                    </p>
                </div>
                <div className="rounded-xl border border-[#E8E5E0] bg-white p-4">
                    <Truck className="w-5 h-5 text-[#C8956C] mb-2" />
                    <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1">Delivery or store pickup</h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                        Bulk orders go out across Delhi NCR via Porter or Rapido, with shipping charges extra according
                        to location. You can also collect from the Krishna Nagar store. Costumes are packed and labelled
                        per size so you do not have to re-sort them before the event.
                    </p>
                </div>
                <div className="rounded-xl border border-[#E8E5E0] bg-white p-4">
                    <Wallet className="w-5 h-5 text-[#C8956C] mb-2" />
                    <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1">Payment terms</h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                        Orders above ₹10,000 need a 30% advance to confirm the order and lock the stock. The balance is
                        paid on delivery by cash or UPI. Nothing beyond shipping is added on top of the quoted per-piece
                        price.
                    </p>
                </div>
            </div>

            <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-6">
                <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                    Who Buys Wholesale From Us
                </h2>
                <p>
                    <strong className="text-[#2D2D2D]">Schools</strong> order matched sets for annual functions and
                    national day programmes — sizing, packing and event deadlines are covered on our{' '}
                    <Link href="/wholesale/schools" className="text-[#C8956C] hover:underline">school bulk order page</Link>.{' '}
                    <strong className="text-[#2D2D2D]">Dance academies</strong> book coordinated group costumes per
                    routine, often in several colourways;{' '}
                    <Link href="/wholesale/dance-academies" className="text-[#C8956C] hover:underline">see the dance academy page</Link>.{' '}
                    <strong className="text-[#2D2D2D]">Event and production companies</strong> buy for corporate shows,
                    mall activations and themed parties. <strong className="text-[#2D2D2D]">Resellers</strong> and
                    smaller costume shops restock at trade rates ahead of season —{' '}
                    <Link href="/wholesale/resellers" className="text-[#C8956C] hover:underline">reseller terms are here</Link>.
                    If you are comparing suppliers, our{' '}
                    <Link href="/wholesale/delhi-market" className="text-[#C8956C] hover:underline">guide to the Delhi fancy dress wholesale market</Link>{' '}
                    explains how the Som Bazar trade works.
                </p>
                <p>
                    Sizes run <strong className="text-[#2D2D2D]">ages 3–14</strong> for children and{' '}
                    <strong className="text-[#2D2D2D]">S, M, L, XL</strong> for adults, so one order can cover students,
                    teachers and parents without splitting it across suppliers.
                </p>

                <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                    Buying vs. Renting in Bulk
                </h2>
                <p>
                    Buy when the costumes will be reused across several events or when you want to keep them after the
                    show — the discount tiers above make repeat use much cheaper per event. Rent when it is a one-time
                    function and the budget matters more than ownership; rental needs a deposit and the costumes come
                    back to us afterwards. Mixed orders are common: buy the styles you will use every year, rent the
                    one-off character costumes. Send us your event calendar and we will tell you which way works out
                    cheaper.
                </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <a
                    href={whatsappUrl('Hi, I want wholesale prices for a bulk fancy dress order. Here is my requirement:')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                >
                    <Button size="lg" className="w-full gap-2">
                        <Package className="w-4 h-4" />
                        WhatsApp for a Bulk Quote
                    </Button>
                </a>
                <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex-1">
                    <Button size="lg" variant="outline" className="w-full gap-2">
                        <Phone className="w-4 h-4" />
                        {BUSINESS_PHONE_DISPLAY}
                    </Button>
                </a>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B] mb-8">
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-[#2D2D2D]">Wholesale counter</p>
                        <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051 — open daily 10 AM – 9:30 PM</p>
                    </div>
                </div>
            </div>

            {/* FAQ — same Q/A as the FAQPage JSON-LD above */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]">
                    Wholesale Ordering FAQs
                </h2>
                <div className="space-y-3">
                    {wholesaleFaqs.map((faq) => (
                        <div key={faq.question} className="rounded-xl border border-[#E8E5E0] bg-white p-4">
                            <h3 className="font-semibold text-[#2D2D2D] text-sm mb-1.5">{faq.question}</h3>
                            <p className="text-sm text-[#6B6B6B] leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="mb-8">
                <CategoryPriceTable headingId="wholesale-category-prices" />
            </div>
        </ProductsBrowser>
    )
}

export default function WholesalePage() {
    return (
        <Suspense fallback={<WholesaleListSkeleton />}>
            <WholesaleContent />
        </Suspense>
    )
}
