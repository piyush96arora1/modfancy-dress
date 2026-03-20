/** Curated editorial rows — not from DB. Used for OccasionGuideTable + FAQ JSON-LD pairs. */
export type OccasionGuideRow = {
  occasion: string
  bestCostume: string
  priceRange: string
  categorySlug: string
  categoryLabel: string
}

export const OCCASION_GUIDE_ROWS: OccasionGuideRow[] = [
  {
    occasion: 'School Annual Function',
    bestCostume: 'Kathak / Rajasthani / Folk',
    priceRange: '₹399–₹550',
    categorySlug: 'kathak-dress',
    categoryLabel: 'Kathak dress',
  },
  {
    occasion: 'Republic Day (26 Jan)',
    bestCostume: 'Freedom Fighters / Army',
    priceRange: '₹399–₹550',
    categorySlug: 'republic-day-dress',
    categoryLabel: 'Republic Day',
  },
  {
    occasion: 'Independence Day (15 Aug)',
    bestCostume: 'Tiranga / Freedom Fighters',
    priceRange: '₹399–₹400',
    categorySlug: 'independence-day-dress',
    categoryLabel: 'Independence Day',
  },
  {
    occasion: 'Janmashtami',
    bestCostume: 'Krishna / Radha',
    priceRange: '₹399–₹400',
    categorySlug: 'janmashtami-dress',
    categoryLabel: 'Janmashtami',
  },
  {
    occasion: 'Navratri / Garba',
    bestCostume: 'Chaniya Choli / Kedia',
    priceRange: '₹399–₹400',
    categorySlug: 'garba-dress',
    categoryLabel: 'Garba',
  },
  {
    occasion: 'Fancy Dress Competition',
    bestCostume: 'Fruit / Vegetable / Animal',
    priceRange: '₹295–₹399',
    categorySlug: 'fruit-costumes',
    categoryLabel: 'Fruit costumes',
  },
  {
    occasion: 'Classical Dance Recital',
    bestCostume: 'Bharatnatyam / Kathak',
    priceRange: '₹399–₹550',
    categorySlug: 'bharatnatyam',
    categoryLabel: 'Bharatnatyam',
  },
  {
    occasion: 'Folk Dance Performance',
    bestCostume: 'Bhangra / Gidda / Haryanvi',
    priceRange: '₹350–₹550',
    categorySlug: 'folk-dance-dress',
    categoryLabel: 'Folk dance',
  },
]

/** FAQ mainEntity entries for FaqPageSchema (merge on /faq; standalone script on homepage). */
export function occasionGuideFaqPairs(): { question: string; answer: string }[] {
  return OCCASION_GUIDE_ROWS.map((row) => ({
    question: `Which fancy dress is best for ${row.occasion.toLowerCase()}?`,
    answer: `We recommend ${row.bestCostume} costumes (typical range ${row.priceRange}). Browse our ${row.categoryLabel} collection for ready-to-wear options.`,
  }))
}
