import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCategoryPriceTableRows } from '@/lib/catalog/category-price-stats'
import { SeoTableWrap, seoTableClass } from '@/components/public/seo-tables/table-styles'

type Props = {
  headingId?: string
  className?: string
}

/** Server component: category-level counts and retail price bands from Supabase. */
export async function CategoryPriceTable({ headingId = 'category-price-comparison', className = '' }: Props) {
  const supabase = await createClient()
  const rows = await getCategoryPriceTableRows(supabase)
  if (rows.length === 0) return null

  return (
    <section className={className} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]"
      >
        Price overview by category
      </h2>
      <p className="text-sm text-[#6B6B6B] mb-4 max-w-3xl leading-relaxed">
        Live from our catalogue — product counts, typical retail bands, and sizes we list. Wholesale is quoted per
        order;{' '}
        <Link href="/wholesale" className="text-[#C8956C] hover:text-[#A07048] font-medium">
          view wholesale
        </Link>{' '}
        or{' '}
        <Link href="/contact" className="text-[#C8956C] hover:text-[#A07048] font-medium">
          contact us
        </Link>
        .
      </p>
      <SeoTableWrap>
        <table className={seoTableClass}>
          <caption className="sr-only">
            Fancy dress categories with product counts, retail price range, and wholesale note
          </caption>
          <thead>
            <tr>
              <th scope="col">Costume category</th>
              <th scope="col">Products</th>
              <th scope="col">Retail (from)</th>
              <th scope="col">Wholesale (5+ pcs)</th>
              <th scope="col">Sizes listed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug}>
                <td>
                  <Link href={`/category/${r.slug}`} className="text-[#1B2A4A] hover:text-[#C8956C] font-medium">
                    {r.name}
                  </Link>
                </td>
                <td className="tabular-nums whitespace-nowrap">{r.productCount}</td>
                <td className="tabular-nums whitespace-nowrap">{r.retailRange}</td>
                <td className="text-sm">
                  <Link href="/wholesale" className="text-[#C8956C] hover:text-[#A07048] font-medium whitespace-nowrap">
                    Get a quote →
                  </Link>
                </td>
                <td className="text-[#6B6B6B] text-xs md:text-sm max-w-[140px] md:max-w-none">{r.sizesSummary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SeoTableWrap>
    </section>
  )
}
