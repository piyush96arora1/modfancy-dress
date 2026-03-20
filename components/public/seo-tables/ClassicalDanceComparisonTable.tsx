import Link from 'next/link'
import { SeoTableWrap, seoTableClass } from '@/components/public/seo-tables/table-styles'

const ROWS = [
  {
    style: 'Kathak',
    costume: 'Anarkali / Lehenga',
    features: 'Flowing skirt, gota work',
    from: '₹399',
    slug: 'kathak-dress',
  },
  {
    style: 'Bharatnatyam',
    costume: 'Flared skirt set',
    features: 'Gold temple jewellery',
    from: '₹250',
    slug: 'bharatnatyam',
  },
  {
    style: 'Odissi',
    costume: 'Saree drape style',
    features: 'Silver jewellery, fan',
    from: '₹550',
    slug: 'bharatnatyam',
  },
  {
    style: 'Kuchipudi',
    costume: 'Skirt + blouse',
    features: 'Tassel earrings, fan',
    from: '₹550',
    slug: 'bharatnatyam',
  },
  {
    style: 'Garba',
    costume: 'Chaniya Choli',
    features: 'Mirror work, flared skirt',
    from: '₹399',
    slug: 'garba-dress',
  },
  {
    style: 'Bhangra',
    costume: 'Kurta + Pagri',
    features: 'Colourful phulkari',
    from: '₹350',
    slug: 'folk-dance-dress',
  },
  {
    style: 'Lavani',
    costume: 'Nauvari saree',
    features: 'Bold colours, nath',
    from: '₹399',
    slug: 'folk-dance-dress',
  },
] as const

type Props = {
  headingId?: string
  className?: string
}

/** Static editorial comparison — classical & folk dance costume styles. */
export function ClassicalDanceComparisonTable({
  headingId = 'classical-dance-costume-comparison',
  className = '',
}: Props) {
  return (
    <section className={className} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]"
      >
        Costume comparison by dance style
      </h2>
      <p className="text-sm text-[#6B6B6B] mb-4 max-w-3xl leading-relaxed">
        Starting prices are typical retail entry points; exact SKUs vary. Follow the links to see current stock.
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
            {ROWS.map((row) => (
              <tr key={row.style}>
                <td className="font-medium whitespace-nowrap">{row.style}</td>
                <td>{row.costume}</td>
                <td className="text-[#6B6B6B]">{row.features}</td>
                <td className="tabular-nums whitespace-nowrap">{row.from}</td>
                <td>
                  <Link
                    href={`/category/${row.slug}`}
                    className="text-[#C8956C] hover:text-[#A07048] font-medium whitespace-nowrap"
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
