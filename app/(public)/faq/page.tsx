import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { ChevronRight } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema, FaqPageSchema } from '@/lib/seo/structured-data'
import { occasionGuideFaqPairs } from '@/lib/seo/occasion-guide-data'
import { rentalFaqPairs } from '@/lib/seo/rental-faq-data'
import { OccasionGuideTable } from '@/components/public/seo-tables/OccasionGuideTable'
import { CategoryPriceTable } from '@/components/public/seo-tables/CategoryPriceTable'
import { FAQ_SECTION_LABELS, FAQ_SECTION_ORDER } from '@/lib/faq-section-labels'
import { getFaqsForFaqPage } from '@/lib/faqs/queries'
import { FaqSection } from '@/components/public/FaqSection'
import type { Faq } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata = generatePageMetadata({
  title: 'FAQ - Mod Fancy Dress | Orders, Sizing, Bulk & Delivery',
  description:
    'Answers about ordering fancy dress online, Krishna Nagar store, sizing, school bulk orders, wholesale, delivery across India, returns, and care — Mod Fancy Dress.',
  path: '/faq',
})

function sortFaqsForPage(faqs: Faq[]): Faq[] {
  const rank = (s: string) => {
    const i = FAQ_SECTION_ORDER.indexOf(s as (typeof FAQ_SECTION_ORDER)[number])
    return i === -1 ? 999 : i
  }
  return [...faqs].sort((a, b) => rank(a.section) - rank(b.section) || a.sort_order - b.sort_order)
}

export default async function FaqPage() {
  const faqs = sortFaqsForPage(await getFaqsForFaqPage())

  const faqPageSchema = FaqPageSchema([
    ...occasionGuideFaqPairs(),
    ...rentalFaqPairs(),
    ...faqs.map(({ question, answer }) => ({ question, answer })),
  ])
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ])

  const seenSections = new Set<string>()
  const sections: { key: string; label: string; items: Faq[] }[] = []
  for (const f of faqs) {
    if (!seenSections.has(f.section)) {
      seenSections.add(f.section)
      sections.push({
        key: f.section,
        label: FAQ_SECTION_LABELS[f.section] ?? f.section,
        items: [],
      })
    }
    sections.find((s) => s.key === f.section)?.items.push(f)
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="fade-in max-w-3xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-[#2D2D2D]">FAQ</span>
        </nav>

        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-3">
            Frequently asked questions
          </h1>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed">
            Ordering, sizing, school &amp; bulk orders, costumes, delivery, and visiting our Krishna Nagar store. For
            anything else,{' '}
            <Link href="/contact" className="text-[#C8956C] hover:text-[#A07048] font-medium">
              contact us
            </Link>{' '}
            or WhatsApp +91 92110 77110.
          </p>
        </header>

        <div className="mb-10 space-y-10">
          <OccasionGuideTable headingId="faq-occasion-guide" />
          <CategoryPriceTable headingId="faq-category-prices" />
        </div>

        <FaqSection
          title="Costume Rental"
          headingId="faq-section-rental"
          items={rentalFaqPairs().map((faq, i) => ({ id: `rental-${i}`, question: faq.question, answer: faq.answer }))}
        />

        {faqs.length === 0 ? (
          <div className="rounded-xl border border-[#E8E5E0] bg-[#F5F3F0] p-5 text-sm text-[#6B6B6B]">
            <p className="mb-2">
              No FAQs were returned from the database. If you just added this feature, apply the migration{' '}
              <code className="text-xs bg-white px-1 py-0.5 rounded border border-[#E8E5E0]">026_faqs.sql</code> in
              Supabase (local: <code className="text-xs bg-white px-1 py-0.5 rounded border">supabase db push</code>
              ), then refresh.
            </p>
            <p>
              <Link href="/contact" className="text-[#C8956C] hover:underline font-medium">
                Contact us
              </Link>{' '}
              for help in the meantime.
            </p>
          </div>
        ) : (
          sections.map((block) => (
            <FaqSection
              key={block.key}
              title={block.label}
              headingId={`faq-section-${block.key}`}
              items={block.items.map(({ id, question, answer }) => ({ id, question, answer }))}
            />
          ))
        )}
      </div>
    </>
  )
}
