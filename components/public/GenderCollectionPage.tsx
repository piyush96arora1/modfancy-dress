import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { getActiveCategoriesCached, getAllActiveProductsCached } from '@/lib/supabase/cached-queries'
import { pickGenderCollection, themeChips, type Audience } from '@/lib/catalog/gender-collections'
import { ProductGrid } from '@/components/public/ProductGrid'
import { BreadcrumbSchema, FaqPageSchema } from '@/lib/seo/structured-data'
import { whatsappUrl } from '@/lib/constants/contact'
import type { ProductCardData } from '@/types/database'

type CollectionProduct = ProductCardData & { description?: string | null }

/**
 * Shared layout for /fancy-dress-for-girls and /fancy-dress-for-boys: a collection
 * page in the shape that ranks for these queries — product grid first, then theme
 * links, a short guide and FAQs. Reads only the weekly-cached catalogue, so both
 * routes prerender as static pages.
 */
export async function GenderCollectionPage({
  audience,
  path,
  heading,
  intro,
  guide,
  faqs,
  whatsappText,
}: {
  audience: Audience
  path: string
  heading: string
  /** One line under the H1; receives the live costume count. */
  intro: (count: number) => ReactNode
  guide: ReactNode
  faqs: { question: string; answer: string }[]
  whatsappText: string
}) {
  const [allProducts, categories] = await Promise.all([
    getAllActiveProductsCached(),
    getActiveCategoriesCached(),
  ])
  const products = pickGenderCollection(allProducts as unknown as CollectionProduct[], audience)
  const chips = themeChips(products, new Set(categories.map((c) => c.slug as string)))
  const other = audience === 'girls'
    ? { href: '/fancy-dress-for-boys', label: 'Fancy dress for boys' }
    : { href: '/fancy-dress-for-girls', label: 'Fancy dress for girls' }

  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: heading, url: path },
  ])
  const faqSchema = FaqPageSchema(faqs)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="fade-in">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-3">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-[#2D2D2D]">{heading}</span>
        </nav>

        <header className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-1.5">
            {heading}
          </h1>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-snug max-w-2xl">{intro(products.length)}</p>
        </header>

        <section aria-label={`${heading} costumes`}>
          <ProductGrid products={products} productTitleTag="h3" priorityCount={4} showCategoryBadge={false} />
        </section>

        {chips.length > 0 && (
          <section className="mt-10 md:mt-14">
            <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-3">
              Shop by theme
            </h2>
            <ul className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.slug}>
                  <Link
                    prefetch={false}
                    href={`/category/${c.slug}`}
                    className="inline-flex items-center min-h-[40px] px-3.5 rounded-full border border-[#E8E5E0] bg-white text-sm text-[#1B2A4A] hover:border-[#C8956C]/50 hover:text-[#8F6240] transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  prefetch={false}
                  href={other.href}
                  className="inline-flex items-center min-h-[40px] px-3.5 rounded-full border border-[#C8956C]/40 bg-[#FBF5EF] text-sm font-medium text-[#8F6240] hover:border-[#C8956C] transition-colors"
                >
                  {other.label}
                </Link>
              </li>
            </ul>
          </section>
        )}

        <section className="mt-10 md:mt-14 pt-8 border-t border-[#E8E5E0] max-w-3xl space-y-3 text-sm text-[#6B6B6B] leading-relaxed">
          {guide}
        </section>

        <section className="mt-10 md:mt-14 pt-8 border-t border-[#E8E5E0] max-w-3xl">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4">
            Questions parents ask
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-lg border border-[#E8E5E0] bg-white">
                <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#1B2A4A] hover:text-[#8F6240] transition-colors list-none flex items-center justify-between gap-2">
                  {faq.question}
                  <ChevronRight className="w-4 h-4 shrink-0 text-[#6B6B6B] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-4 pb-3 text-sm text-[#6B6B6B] leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 md:mt-12">
          <a
            href={whatsappUrl(whatsappText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full max-w-md mx-auto min-h-[48px] py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA851] text-[#1B2A4A] font-semibold text-sm transition-colors touch-manipulation"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
            <span>Ask about sizes on WhatsApp</span>
          </a>
        </div>
      </div>
    </>
  )
}
