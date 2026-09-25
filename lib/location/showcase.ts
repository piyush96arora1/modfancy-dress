/**
 * What the location pages (/fancy-dress-delhi, /fancy-dress-noida) show under their intro:
 * up to 8 occasion tiles and one row of in-season products.
 *
 * The festival calendar is the homepage's (`homepage_sections` date windows), so a
 * location page never needs its own admin screen and changes over on the same day.
 * Evergreen categories fill the rest, and carry the grid alone between festivals.
 *
 * Relative imports on purpose: `tsx --test` does not resolve the `@/` alias.
 */
import { isActiveOn, meetsMinProducts } from '../utils/seasonal'

export type ShowcaseCategory = { id: string; name: string; slug: string; image_url: string | null }
export type Tile = { name: string; slug: string; image: string }

/** The school-year staples Delhi and Noida pages already talk about, in display order. */
export const EVERGREEN_CATEGORY_SLUGS: readonly string[] = [
  'leaders-freedom-fighters',
  'classical-dance-dress',
  'indian-mythology-costumes',
  'states-fancy-dress',
  'cartoon-characters',
  'animal-costumes',
  'helper-costumes',
  'superhero-costumes',
]

type Section = {
  category_id: string | null
  source_type: string
  starts_on?: string | null
  ends_on?: string | null
  min_products?: number | null
}

/** Category ids of the category sections live today (same rules as the homepage), in order, once each. */
export function seasonalCategoryIds(sections: Section[], today: string, liveCount: (categoryId: string) => number): string[] {
  const ids: string[] = []
  for (const s of sections) {
    if (s.source_type !== 'category' || !s.category_id) continue
    if (!isActiveOn(s, today) || !meetsMinProducts(s, liveCount(s.category_id))) continue
    if (!ids.includes(s.category_id)) ids.push(s.category_id)
  }
  return ids
}

/**
 * Tiles in the given order. `categories` must already be limited to active categories
 * with live products; an id not in it is skipped, so a tile never links to a 404.
 * A category with no image of its own borrows its first product's photo.
 */
export function pickTiles({ orderedIds, categories, coverFor, limit = 8 }: {
  orderedIds: string[]
  categories: ShowcaseCategory[]
  coverFor: (categoryId: string) => string | null
  limit?: number
}): Tile[] {
  const byId = new Map(categories.map((c) => [c.id, c]))
  const tiles: Tile[] = []
  const seen = new Set<string>()
  for (const id of orderedIds) {
    if (tiles.length >= limit) break
    const c = byId.get(id)
    if (!c || seen.has(id)) continue
    const image = c.image_url || coverFor(id)
    if (!image) continue
    seen.add(id)
    tiles.push({ name: c.name, slug: c.slug, image })
  }
  return tiles
}

/** Round-robin across lists so every festival gets a card near the top; each id once. */
export function interleaveUnique<T extends { id: string }>(lists: T[][], limit: number): T[] {
  const out: T[] = []
  const seen = new Set<string>()
  const longest = Math.max(0, ...lists.map((l) => l.length))
  for (let i = 0; i < longest && out.length < limit; i++) {
    for (const list of lists) {
      const item = list[i]
      if (!item || seen.has(item.id)) continue
      seen.add(item.id)
      out.push(item)
      if (out.length >= limit) break
    }
  }
  return out
}

/**
 * Costumes before props. Category lists are newest-first, so a fresh accessory upload
 * (dandiya sticks, 25 Sep) otherwise becomes the Dandiya tile photo and the first card.
 * A list with nothing but accessories is returned as is, so a tile never loses its cover.
 */
export function preferCostumes<T extends { category?: { name?: string | null } | null }>(products: T[]): T[] {
  const costumes = products.filter((p) => p.category?.name !== 'Accessories')
  return costumes.length ? costumes : products
}
