import { createPublicServerClient } from '@/lib/supabase/public-server'
import { getSizeGuideRowsForCategory } from '@/lib/catalog/size-guide'
import type { SizeGuideRow } from '@/lib/catalog/size-guide'
import { SeoTableWrap, seoTableClass } from '@/components/public/seo-tables/table-styles'

function SizeGuideTableInner({ rows, caption }: { rows: SizeGuideRow[]; caption: string }) {
  return (
    <table className={seoTableClass}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Size</th>
          <th scope="col">Approx. age</th>
          <th scope="col">Approx. height</th>
          <th scope="col">Price in category</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.sizeLabel}>
            <td className="whitespace-nowrap font-medium">{r.sizeLabel}</td>
            <td>{r.age}</td>
            <td className="tabular-nums">{r.height}</td>
            <td className="tabular-nums whitespace-nowrap">{r.priceDisplay}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type Props = {
  categoryId: string
  categoryName: string
  className?: string
}

/** Server component: loads variant sizes for products in this category. Renders nothing if no size data. */
export async function SizeGuideTable({ categoryId, categoryName, className = '' }: Props) {
  const supabase = createPublicServerClient()
  const rows = await getSizeGuideRowsForCategory(supabase, categoryId)
  if (!rows?.length) return null

  const caption = `Size guide for ${categoryName} — ages, heights, and indicative prices`
  const headingId = `size-guide-${categoryId}`

  return (
    <section className={className} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]"
      >
        Size guide
      </h2>
      <p className="hidden md:block text-sm text-[#6B6B6B] mb-3 max-w-3xl leading-relaxed">
        Sizes available across this category (from our variant data). Heights are approximate — WhatsApp us if you are
        between sizes.
      </p>
      <p className="md:hidden text-xs text-[#6B6B6B] mb-2 leading-relaxed">
        From live variant data for {categoryName}. Tap to expand the table.
      </p>

      <div className="hidden md:block">
        <SeoTableWrap>
          <SizeGuideTableInner rows={rows} caption={caption} />
        </SeoTableWrap>
      </div>

      <details className="md:hidden rounded-xl border border-[#E8E5E0] bg-white overflow-hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[#1B2A4A] flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
          <span>Show size &amp; price table</span>
          <span className="text-[#9A9A9A] text-xs font-normal">Scroll →</span>
        </summary>
        <div className="px-2 pb-3">
          <SeoTableWrap className="border-0 shadow-none rounded-lg">
            <SizeGuideTableInner rows={rows} caption={caption} />
          </SeoTableWrap>
        </div>
      </details>
    </section>
  )
}
