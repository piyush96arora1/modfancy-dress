/**
 * SEO title helpers — smart product/category title generation for `generateMetadata`.
 *
 * Category classification determines audience suffix:
 *   - Kids-only (fruit, animal, cartoon …) → "for Kids"
 *   - Dance → "Dance Costume"
 *   - Festival → occasion context
 *   - Default → "Buy Online"
 */

const KIDS_ONLY_CATEGORIES = new Set([
  'fruit costumes',
  'vegetable costumes',
  'animal costumes',
  'bird costumes',
  'insect costumes',
  'cartoon characters',
  'superhero costumes',
  'nature costumes',
  'space costumes',
  'flower costumes',
  'helper costumes',
])

const DANCE_CATEGORIES = new Set([
  'kathak dress',
  'bharatnatyam',
  'western dance dress',
  'garba dress',
  'bhangra dress',
  'folk dance dress',
  'classical dance dress',
  'indo western dance dress',
  'gidda dress',
  'lavani costume',
  'dance dress',
  'dandiya dress',
  'manipuri dance costume',
  'mohiniyattam dress',
  'haryanvi dress',
  'kashmiri dress',
  'rajasthani dress',
  'qawwali dress',
  'international dance dress',
  'kids saree',
  'lehenga',
  'frock dress',
  'saree',
])

const FESTIVAL_CATEGORIES = new Set([
  'janmashtami dress',
  'republic day dress',
  'independence day dress',
  'halloween',
  'ramleela costumes',
  'festival costumes',
])

const TAIL_PATTERNS = [
  /\s+fancy\s+dress\s+costumes?\s*$/i,
  /\s+fancy\s+dress\s*$/i,
]

/** Strip trailing "Fancy Dress" / "Fancy Dress Costume(s)" that bloats title tags. */
export function cleanProductName(name: string): string {
  let out = name.trim()
  for (const pat of TAIL_PATTERNS) {
    const cleaned = out.replace(pat, '').trim()
    if (cleaned.length >= 4) {
      out = cleaned
      break
    }
  }
  return out
}

function classifyCategory(categoryName: string | null | undefined): 'kids' | 'dance' | 'festival' | 'general' {
  if (!categoryName) return 'general'
  const lower = categoryName.toLowerCase().trim()
  if (KIDS_ONLY_CATEGORIES.has(lower)) return 'kids'
  if (DANCE_CATEGORIES.has(lower)) return 'dance'
  if (FESTIVAL_CATEGORIES.has(lower)) return 'festival'
  return 'general'
}

/**
 * Build an SEO-friendly product title for `<title>`.
 * Called when `product.seo_title` is null (the common case for 335 products).
 */
export function smartProductTitle(productName: string, categoryName?: string | null): string {
  const clean = cleanProductName(productName)
  const type = classifyCategory(categoryName)

  switch (type) {
    case 'kids':
      return `${clean} - Costume for Kids`
    case 'dance':
      return `${clean} - Dance Costume`
    case 'festival':
      return `${clean} - Fancy Dress`
    default:
      return `${clean} - Buy Online`
  }
}

/** Wholesale product title: prepend "Wholesale" for SERP differentiation. */
export function wholesaleProductTitle(productName: string): string {
  const clean = cleanProductName(productName)
  return `Wholesale ${clean}`
}

/** Wholesale category title: separate from retail to avoid duplicate titles. */
export function wholesaleCategoryTitle(categoryName: string): string {
  return `Wholesale ${categoryName} - Bulk Prices`
}
