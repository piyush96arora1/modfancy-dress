/**
 * Generated image alt text for product photos.
 *
 * Google Images ranks largely on alt text, filename and the surrounding page, and 152 live
 * products had no alt text at all (the gallery fell back to "<name> Main Image"). This builds
 * a consistent, descriptive fallback: product name, who it is for (when we can tell), the
 * category, and the shop. Hand-written alt text always wins over this; it is only used where
 * `product_images.alt_text` is empty.
 */

export type Audience = 'kids' | 'women' | 'men' | 'adults'

/** Screen readers and Google both favour short alt text; 125 is the common guidance. */
const MAX = 125
const SHOP = ' Mod Fancy Dress Delhi'

/** Words that already say who the costume is for, so " for <audience>" would repeat it. */
const AUDIENCE_WORDS =
  /\b(kids?|child(ren)?|baby|babies|boys?|girls?|women|womens|ladies|lady|men|mens|gents|adults?)\b/i

export function buildAltText(
  p: { name: string; categoryName?: string | null; audience?: Audience | null },
  index: number
): string {
  const name = p.name.trim()
  const aud = p.audience && !AUDIENCE_WORDS.test(name) ? ` for ${p.audience}` : ''
  const view = index > 0 ? ` – view ${index + 1},` : ' –'
  const cat = p.categoryName?.trim() ? ` ${p.categoryName.trim()},` : ''
  const head = `${name}${aud}`
  const budget = MAX - (view.length + cat.length + SHOP.length)
  return `${head.slice(0, Math.max(10, budget)).trim()}${view}${cat}${SHOP}`.slice(0, MAX)
}

const KIDS_NAME = /\b(kids?|child(ren)?|baby|babies|boys?|girls?|toddlers?|infants?)\b/i
const KIDS_CATEGORY = /\bkids?\b/i
// Singular "man"/"woman" are left out on purpose: they are character names (Iron Man,
// Wonder Woman), not audiences.
const MEN_NAME = /\b(men|mens|men's|gents|male)\b/i
const WOMEN_NAME = /\b(women|womens|women's|ladies|lady|female)\b/i
const ADULT_NAME = /\badults?\b/i
/** Garments cut for women when the sizing says adult. */
const WOMEN_GARMENT = /\b(lehenga|lehnga|chaniya|choli|ghagra|saree|sari)\b/i

/** Sizing phrases the product copy uses ("Available for kids", "7-9 yrs", "Sized for adults"). */
const KIDS_SIZING = /\b(for kids|school-age kids|kids'? sizes?|\d+\s*-\s*\d+\s*yrs?)\b/i
const ADULT_SIZING = /\b(for adults|adult free size|adult sizes?|\(adult\)|and adults?)\b/i

/**
 * Best-effort audience from the product name, its category names and the sizing line in
 * its description. Kids signals in the name or category win, because a "girls lehenga" is
 * a kids' costume. A lehenga is only "for women" when the copy says it is adult-sized:
 * several Navratri chaniya cholis on the site are kids-only. When kids and adult sizes are
 * both stocked, or nothing says, the audience stays null, since a wrong "for women" on a
 * child's costume is worse than none.
 */
export function inferAudience(
  name: string,
  categoryNames: string[],
  description?: string | null
): Audience | null {
  if (KIDS_NAME.test(name) || categoryNames.some((c) => KIDS_CATEGORY.test(c))) return 'kids'
  if (MEN_NAME.test(name)) return 'men'
  if (WOMEN_NAME.test(name)) return 'women'
  if (ADULT_NAME.test(name)) return 'adults'

  const d = description ?? ''
  const kidsSized = KIDS_SIZING.test(d)
  const adultSized = ADULT_SIZING.test(d)
  if (kidsSized && !adultSized) return 'kids'
  if (adultSized && !kidsSized) return WOMEN_GARMENT.test(name) ? 'women' : 'adults'
  return null
}
