import Link from 'next/link'
import { priceBand, fromPrice } from '@/lib/seo/price-band'
import { getLivePricedProductsCached } from '@/lib/supabase/cached-seo-queries'
import { SeoTableWrap, seoTableClass } from '@/components/public/seo-tables/table-styles'

const ROWS = [
  {
    style: 'Kathak',
    costume: 'Anarkali / Lehenga',
    features: 'Flowing skirt, gota work',
    match: /kathak/i,
    slug: 'kathak-dress',
  },
  {
    style: 'Bharatnatyam',
    costume: 'Flared skirt set',
    features: 'Gold temple jewellery',
    match: /bharatnatyam/i,
    slug: 'bharatnatyam',
  },
  {
    style: 'Odissi',
    costume: 'Saree drape style',
    features: 'Silver jewellery, fan',
    match: /odissi/i,
    slug: 'classical-dance-dress',
  },
  {
    style: 'Garba',
    costume: 'Chaniya Choli',
    features: 'Mirror work, flared skirt',
    match: /garba|chaniya|dandiya/i,
    slug: 'garba-dress',
  },
  {
    style: 'Bhangra',
    costume: 'Kurta + Pagri',
    features: 'Colourful phulkari',
    match: /bhangra/i,
    slug: 'folk-dance-dress',
  },
  {
    style: 'Lavani',
    costume: 'Nauvari saree',
    features: 'Bold colours, nath',
    match: /lavani/i,
    slug: 'folk-dance-dress',
  },
]

type Props = {
  headingId?: string
  className?: string
}

/** Editorial comparison of dance costume styles; entry prices come from live products whose name matches the style. */
export async function ClassicalDanceComparisonTable({
  headingId = 'classical-dance-costume-comparison',
  className = '',
}: Props) {
  const products = await getLivePricedProductsCached()
  const rows = ROWS.map((row) => ({
    ...row,
    from: fromPrice(priceBand(products.filter((p) => row.match.test(p.name)))),
  })).filter((row) => row.from) // never list a style we have no priced stock for
  return (
    <section className={className} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]"
      >
        Costume comparison by dance style
      </h2>
      <p className="text-sm text-[#6B6B6B] mb-4 max-w-3xl leading-relaxed">
        Starting prices are the lowest current rent and buy price for that style. Follow the links to see current stock.
      </p>
      <SeoTableWrap>
        <table className={seoTableClass}>
          <caption className="sr-only">Dance style, costume type, features, and starting price</caption>
          <thead>
            <tr>
              <th scope="col">Dance style</th>
              <th scope="col">Costume style</th>
              <th scope="col">Key features</th>
              <th scope="col">Starting price</th>
              <th scope="col">Shop</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.style}>
                <td className="font-medium whitespace-nowrap">{row.style}</td>
                <td>{row.costume}</td>
                <td className="text-[#6B6B6B]">{row.features}</td>
                <td className="tabular-nums">{row.from}</td>
                <td>
                  <Link
                    href={`/category/${row.slug}`}
                    className="text-[#8F6240] hover:text-[#7F5636] font-medium whitespace-nowrap"
                  >
                    Browse →
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
