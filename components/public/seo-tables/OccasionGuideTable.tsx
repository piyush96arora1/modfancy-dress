import Link from 'next/link'
import { FaqPageSchema } from '@/lib/seo/structured-data'
import { OCCASION_GUIDE_ROWS, occasionGuideFaqPairs } from '@/lib/seo/occasion-guide-data'
import { SeoTableWrap, seoTableClass } from '@/components/public/seo-tables/table-styles'

type Props = {
  /** When true, emits FAQPage JSON-LD for this curated guide (use on homepage only; merge on /faq). */
  includeFaqScript?: boolean
  headingId?: string
  className?: string
}

export function OccasionGuideTable({ includeFaqScript, headingId = 'occasion-costume-guide', className = '' }: Props) {
  const faqSchema = includeFaqScript ? FaqPageSchema(occasionGuideFaqPairs()) : null

  return (
    <section className={className} aria-labelledby={headingId}>
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <h2
        id={headingId}
        className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]"
      >
        Which costume for which occasion?
      </h2>
      <p className="text-sm text-[#6B6B6B] mb-4 max-w-3xl leading-relaxed">
        Quick picks for school events and festivals — typical price bands and where to shop on our site.
      </p>
      <SeoTableWrap>
        <table className={seoTableClass}>
          <caption className="sr-only">Occasion to costume type and category</caption>
          <thead>
            <tr>
              <th scope="col">Occasion</th>
              <th scope="col">Best costume type</th>
              <th scope="col">Price range</th>
              <th scope="col">View collection</th>
            </tr>
          </thead>
          <tbody>
            {OCCASION_GUIDE_ROWS.map((row) => (
              <tr key={row.categorySlug + row.occasion}>
                <td className="whitespace-nowrap">{row.occasion}</td>
                <td>{row.bestCostume}</td>
                <td className="whitespace-nowrap tabular-nums">{row.priceRange}</td>
                <td>
                  <Link
                    href={`/category/${row.categorySlug}`}
                    className="text-[#C8956C] hover:text-[#A07048] font-medium whitespace-nowrap"
                  >
                    {row.categoryLabel} →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SeoTableWrap>
    </section>
  )
}
