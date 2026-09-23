import { priceBand, formatPriceBand } from '@/lib/seo/price-band'
import type { LivePricedProduct } from '@/lib/supabase/cached-seo-queries'

/**
 * Curated editorial rows for OccasionGuideTable + FAQ JSON-LD pairs. The price
 * band is NOT curated: it is computed from the live products in `categorySlug`
 * at render time (see `withPriceBands`), because these rows feed FAQPage JSON-LD
 * and a stale hard-coded price becomes a wrong fact in Google's index.
 */
export type OccasionGuideRow = {
  occasion: string
  bestCostume: string
  categorySlug: string
  categoryLabel: string
}

export const OCCASION_GUIDE_ROWS: OccasionGuideRow[] = [
  {
    occasion: 'School Annual Function',
    bestCostume: 'Kathak / Rajasthani / Folk',
    categorySlug: 'kathak-dress',
    categoryLabel: 'Kathak dress',
  },
  {
    occasion: 'Republic Day (26 Jan)',
    bestCostume: 'Freedom Fighters / Army',
    categorySlug: 'republic-day-dress',
    categoryLabel: 'Republic Day',
  },
  {
    occasion: 'Independence Day (15 Aug)',
    bestCostume: 'Tiranga / Freedom Fighters',
    categorySlug: 'independence-day-dress',
    categoryLabel: 'Independence Day',
  },
  {
    occasion: 'Janmashtami',
    bestCostume: 'Krishna / Radha',
    categorySlug: 'janmashtami-dress',
    categoryLabel: 'Janmashtami',
  },
  {
    occasion: 'Navratri / Garba',
    bestCostume: 'Chaniya Choli / Kedia',
    categorySlug: 'garba-dress',
    categoryLabel: 'Garba',
  },
  {
    occasion: 'Fancy Dress Competition',
    bestCostume: 'Fruit / Vegetable / Animal',
    categorySlug: 'fruit-costumes',
    categoryLabel: 'Fruit costumes',
  },
  {
    occasion: 'Classical Dance Recital',
    bestCostume: 'Bharatnatyam / Kathak',
    categorySlug: 'bharatnatyam',
    categoryLabel: 'Bharatnatyam',
  },
  {
    occasion: 'Folk Dance Performance',
    bestCostume: 'Bhangra / Gidda / Haryanvi',
    categorySlug: 'folk-dance-dress',
    categoryLabel: 'Folk dance',
  },
]

/** FAQ mainEntity entries for FaqPageSchema (merge on /faq; standalone script on homepage). */
export type PricedOccasionGuideRow = OccasionGuideRow & { priceRange: string | null }

/** Attach each row's live price band; rows whose category has no priced live product get null. */
export function withPriceBands(products: LivePricedProduct[]): PricedOccasionGuideRow[] {
  return OCCASION_GUIDE_ROWS.map((row) => {
    const band = priceBand(products.filter((p) => p.categorySlugs.includes(row.categorySlug)))
    return { ...row, priceRange: band ? formatPriceBand(band) : null }
  })
}

export function occasionGuideFaqPairs(rows: PricedOccasionGuideRow[]): { question: string; answer: string }[] {
  return rows.map((row) => ({
    question: `Which fancy dress is best for ${row.occasion.toLowerCase()}?`,
    answer: `We recommend ${row.bestCostume} costumes${row.priceRange ? ` (${row.priceRange})` : ''}. Browse our ${row.categoryLabel} collection for ready-to-wear options.`,
  }))
}
