# Location Page Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `/fancy-dress-delhi` and `/fancy-dress-noida` a photo grid of 8 occasion categories and one row of 8 in-season products, placed after the intro text, without touching the text that ranks them.

**Architecture:** A pure selection module (`lib/location/showcase.ts`) decides which categories and products to show from the homepage's dated sections, so the location pages follow the same festival calendar with no second admin screen. An async server component (`LocationShowcase`) fetches through the existing daily-cached queries and renders a plain grid (no carousel). The two pages gain `revalidate = 86400` so the picks roll over with the festivals.

**Tech Stack:** Next.js 16 App Router (server components, ISR), Supabase via `unstable_cache` queries, `node:test` via `npx tsx --test`.

**Spec:** Owner conversation, 25 Sep 2026. The Delhi page gets 7.5k impressions and 107 clicks per 28 days at position 4.9; Noida 1.1k at position 8.0 (`seodata/gsc/2026-09-23-baseline.md`). The recommendation the owner approved: keep all text; add category photo tiles (seasonal first) plus one row of about 8 products; a grid, not a carousel; after the first text section; 400w images, lazy; Delhi and Noida only; measure 3–4 weeks before Gurgaon and Ghaziabad.

## Global Constraints

- Keep every existing heading, paragraph, FAQ, JSON-LD block and link on both pages. The showcase is additive.
- Grid, not carousel. No new client JavaScript beyond the existing `ProductCard` / `VariantImage`.
- Images: 400w variants via `cardImageUrl`, falling back to the original through `VariantImage`. Nothing loads eagerly (`priorityCount` 0): the LCP stays the H1 and the store card.
- At most 8 category tiles and 8 products.
- Retail links only (`/category/<slug>`, `/products/<slug>`). These are retail landing pages.
- Only link to active categories that have live products (no soft-404 targets).
- Products go through `toProductCardData` so the RSC payload carries card fields only (Task 8 of the festival plan).
- `export const revalidate = 86400` on both pages; do not go below daily (Hobby ISR write quota, see `seodata/PROGRESS.md`, 23 Sep).
- The dev server uses `--webpack`; verify with a production build (`npm run build && npm start`), not `next dev`.

## Review Focus

1. A seasonal category with no image of its own (today: `dandiya-dress`, the lead festival) should show its first product's photo, not an empty tile. Tested in Task 1.
2. A seasonal section pointing at an inactive or empty category should be skipped, not linked. Tested in Task 1.
3. Between festivals (no active dated section), the tiles should still fill from the evergreen list and the product row should come from the evergreen categories. Tested in Task 1.
4. A product that sits in two seasonal categories (dandiya + garba) should appear once. Tested in Task 1.
5. A new accessory upload (dandiya sticks, newest in dandiya-dress) must not become the lead tile's photo or the first product card: prefer costumes, keep accessories only when a category has nothing else (`preferCostumes`, tested in Task 1). Found on the first local screenshot.
6. A section whose `min_products` isn't met yet (Halloween until 6 are live) must not appear, matching the homepage. Tested in Task 1.

---

## File Structure

- Create `lib/location/showcase.ts`: pure selection (`pickTiles`, `interleaveUnique`, `EVERGREEN_CATEGORY_SLUGS`). No I/O.
- Create `tests/location-showcase.test.ts`.
- Create `components/public/LocationShowcase.tsx`: async server component; fetches, selects, renders.
- Modify `app/(public)/fancy-dress-delhi/page.tsx`: split the intro text `<div>` after its two opening paragraphs and render the showcase there, directly before the "What We Stock" heading (the intro block runs through pricing, bulk and directions, so placing it after the whole block would bury it); add `revalidate`.
- Modify `app/(public)/fancy-dress-noida/page.tsx`: same split, directly before "How to Order from Noida"; add `revalidate`.

---

### Task 1: Selection logic

**Files:**
- Create: `lib/location/showcase.ts`
- Test: `tests/location-showcase.test.ts`

**Interfaces:**
- Produces:
  - `type ShowcaseCategory = { id: string; name: string; slug: string; image_url: string | null }`
  - `type Tile = { name: string; slug: string; image: string }`
  - `const EVERGREEN_CATEGORY_SLUGS: readonly string[]`
  - `function seasonalCategoryIds(sections: { category_id: string | null; source_type: string; starts_on?: string | null; ends_on?: string | null; min_products?: number | null }[], today: string, liveCount: (categoryId: string) => number): string[]`
  - `function pickTiles(args: { orderedIds: string[]; categories: ShowcaseCategory[]; coverFor: (categoryId: string) => string | null; limit?: number }): Tile[]`
  - `function interleaveUnique<T extends { id: string }>(lists: T[][], limit: number): T[]`

- [ ] **Step 1: Write the failing test** `tests/location-showcase.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { seasonalCategoryIds, pickTiles, interleaveUnique } from '../lib/location/showcase'

const sec = (category_id: string, over: Record<string, unknown> = {}) => ({
  category_id, source_type: 'category', starts_on: '2026-09-23', ends_on: '2026-10-20', min_products: null, ...over,
})
const cat = (id: string, image_url: string | null = `${id}.webp`) => ({ id, name: id.toUpperCase(), slug: id, image_url })

test('seasonal ids: only sections live today, in order, deduped', () => {
  const ids = seasonalCategoryIds(
    [sec('dandiya'), sec('ramleela'), sec('dandiya'), sec('xmas', { starts_on: '2026-12-01' })],
    '2026-09-25', () => 10)
  assert.deepEqual(ids, ['dandiya', 'ramleela'])
})

test('seasonal ids: min_products not met is skipped (Halloween waits for stock)', () => {
  const ids = seasonalCategoryIds([sec('halloween', { min_products: 6 })], '2026-10-06', () => 2)
  assert.deepEqual(ids, [])
})

test('seasonal ids: latest-type sections are ignored', () => {
  assert.deepEqual(seasonalCategoryIds([{ ...sec('x'), source_type: 'latest' }], '2026-09-25', () => 9), [])
})

test('tiles: category without image uses its first product photo', () => {
  const t = pickTiles({ orderedIds: ['dandiya'], categories: [cat('dandiya', null)], coverFor: () => 'p.jpg' })
  assert.deepEqual(t, [{ name: 'DANDIYA', slug: 'dandiya', image: 'p.jpg' }])
})

test('tiles: inactive/empty (not in categories list) and imageless categories are skipped', () => {
  const t = pickTiles({ orderedIds: ['gone', 'bare', 'ok'], categories: [cat('bare', null), cat('ok')], coverFor: () => null })
  assert.deepEqual(t.map((x) => x.slug), ['ok'])
})

test('tiles: deduped and capped at the limit', () => {
  const cats = ['a', 'b', 'c', 'd'].map((id) => cat(id))
  const t = pickTiles({ orderedIds: ['a', 'b', 'a', 'c', 'd'], categories: cats, coverFor: () => null, limit: 3 })
  assert.deepEqual(t.map((x) => x.slug), ['a', 'b', 'c'])
})

test('interleave: round-robin across lists, each product once', () => {
  const p = (id: string) => ({ id })
  const out = interleaveUnique([[p('1'), p('2'), p('3')], [p('2'), p('4')]], 8)
  assert.deepEqual(out.map((x) => x.id), ['1', '2', '4', '3'])
})

test('interleave: respects the limit and tolerates empty input', () => {
  const p = (id: string) => ({ id })
  assert.deepEqual(interleaveUnique([[p('1'), p('2')], [p('3')]], 2).map((x) => x.id), ['1', '3'])
  assert.deepEqual(interleaveUnique([], 8), [])
})
```

- [ ] **Step 2: Run it and check it fails.** `npx tsx --test tests/location-showcase.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement** `lib/location/showcase.ts`

```ts
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
```

- [ ] **Step 4: Run it and check it passes.** `npx tsx --test tests/location-showcase.test.ts`. Expected: 8 pass.

---

### Task 2: `LocationShowcase` server component, wired into Delhi and Noida

**Files:**
- Create: `components/public/LocationShowcase.tsx`
- Modify: `app/(public)/fancy-dress-delhi/page.tsx` (split the intro `<div className="space-y-4 …">` before the "What We Stock" `<h2>`; add `export const revalidate = 86400`)
- Modify: `app/(public)/fancy-dress-noida/page.tsx` (split before "How to Order from Noida"; add `export const revalidate = 86400`)

**Interfaces:**
- Consumes: `seasonalCategoryIds`, `pickTiles`, `interleaveUnique`, `EVERGREEN_CATEGORY_SLUGS`, `ShowcaseCategory` (Task 1); `getDatedHomepageSectionsCached`, `getNonEmptyCategoryIdsCached`, `getActiveCategoriesDailyCached` (`lib/supabase/cached-seo-queries.ts`); `getProductsForCategoryCached` (`lib/supabase/cached-queries.ts`). Every query the page reads must be daily: one hourly cache pulls the whole page to hourly regeneration (found in ba9eee8), so use `getActiveCategoriesDailyCached`, not the hourly `getActiveCategoriesCached`; `toProductCardData` (`lib/utils/product-card-data.ts`); `ProductGrid`, `VariantImage`; `cardImageUrl`, `getImageUrl`; `todayIST`.
- Produces: `<LocationShowcase city="Delhi" />` (async server component, renders nothing when it has nothing).

- [ ] **Step 1: Write the component**

```tsx
import Link from 'next/link'
import { getActiveCategoriesDailyCached, getDatedHomepageSectionsCached, getNonEmptyCategoryIdsCached } from '@/lib/supabase/cached-seo-queries'
import { getProductsForCategoryCached } from '@/lib/supabase/cached-queries'
import { EVERGREEN_CATEGORY_SLUGS, interleaveUnique, pickTiles, seasonalCategoryIds } from '@/lib/location/showcase'
import { todayIST } from '@/lib/utils/seasonal'
import { toProductCardData } from '@/lib/utils/product-card-data'
import { cardImageUrl } from '@/lib/utils/image-variants'
import { getImageUrl } from '@/lib/imageUrl'
import { ProductGrid } from './ProductGrid'
import { VariantImage } from './VariantImage'

/**
 * Occasion tiles + one in-season product row for the location landing pages.
 * Server-rendered so every link is in the HTML; images are 400w variants and lazy,
 * so the H1 and store card stay the LCP. See docs/superpowers/plans/2026-09-25-location-page-showcase.md.
 */
export async function LocationShowcase({ city }: { city: string }) {
  const [sections, nonEmptyIds, activeCategories] = await Promise.all([
    getDatedHomepageSectionsCached(),
    getNonEmptyCategoryIdsCached(),
    getActiveCategoriesDailyCached(),
  ])
  const nonEmpty = new Set(nonEmptyIds)
  const categories = activeCategories.filter((c) => nonEmpty.has(c.id))
  const idBySlug = new Map(categories.map((c) => [c.slug, c.id]))
  const evergreenIds = EVERGREEN_CATEGORY_SLUGS.map((s) => idBySlug.get(s)).filter((id): id is string => !!id)

  // Products for every candidate category: gives min_products counts, tile covers and the row.
  const candidateIds = [...new Set([
    ...sections.map((s) => s.category_id).filter((id): id is string => !!id && nonEmpty.has(id)),
    ...evergreenIds,
  ])]
  const productsById = new Map(
    await Promise.all(candidateIds.map(async (id) => [id, (await getProductsForCategoryCached(id)) ?? []] as const))
  )

  const seasonalIds = seasonalCategoryIds(sections, todayIST(), (id) => productsById.get(id)?.length ?? 0)
  const tiles = pickTiles({
    orderedIds: [...seasonalIds, ...evergreenIds],
    categories,
    coverFor: (id) => {
      const p = productsById.get(id)?.[0]
      const img = p?.images?.find((i: { is_primary: boolean }) => i.is_primary) ?? p?.images?.[0]
      return img?.image_url ?? null
    },
  })
  const rowSource = seasonalIds.length ? seasonalIds : evergreenIds.slice(0, 2)
  const products = interleaveUnique(rowSource.map((id) => productsById.get(id) ?? []), 8).map(toProductCardData)

  if (tiles.length === 0 && products.length === 0) return null

  return (
    <div className="mb-10 space-y-10">
      {tiles.length > 0 && (
        <section aria-labelledby="shop-by-occasion">
          <h2 id="shop-by-occasion" className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
            Shop Costumes by Occasion
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tiles.map((t) => (
              <li key={t.slug}>
                <Link href={`/category/${t.slug}`} className="group block rounded-xl overflow-hidden bg-white border border-[#E8E5E0] hover:border-[#C8956C]/60 transition-colors">
                  <div className="relative aspect-square bg-[#F5F3F0]">
                    <VariantImage
                      src={cardImageUrl(t.image)}
                      fallbackSrc={getImageUrl(t.image)}
                      alt={`${t.name} costumes`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 180px"
                    />
                  </div>
                  <p className="px-2 py-2 text-center text-xs md:text-sm font-medium text-[#2D2D2D] group-hover:text-[#1B2A4A] leading-tight">{t.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {products.length > 0 && (
        <section aria-labelledby="popular-now">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 id="popular-now" className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
              Popular in {city} Right Now
            </h2>
            <Link href="/products" className="text-sm text-[#8F6240] hover:underline font-medium shrink-0">View all costumes →</Link>
          </div>
          <ProductGrid products={products} productTitleTag="h3" />
        </section>
      )}
    </div>
  )
}
```

Check before writing: the prop names of `VariantImage` (`src`, `fallbackSrc`, `alt`, `fill`, `sizes`, `className`, as `CategoryCard` uses them), the return type of `getActiveCategoriesDailyCached` (`id, name, slug, image_url`), and that `toProductCardData` accepts the `getProductsForCategoryCached` row shape (it reads `images`, `category`, `categories`, `variants`); cast at the call site if the types differ.

- [ ] **Step 2: Wire into both pages.** Import `LocationShowcase` and close the intro text `<div>` before the Delhi "What We Stock" / Noida "How to Order from Noida" `<h2>`, render `<LocationShowcase city="Delhi" />` (or `"Noida"`), then reopen a `<div>` with the same classes for the rest of the text. Add `export const revalidate = 86400` under the metadata export in each file.

- [ ] **Step 3: Test, lint, build.** `npx tsx --test tests/*.test.ts && npm run lint && npm run build`. In the route table, `/fancy-dress-delhi` and `/fancy-dress-noida` must show `○` with `1d` revalidate (not `ƒ`).

- [ ] **Step 4: Verify the HTML.** `npm start`, then:
  - `curl -s localhost:3000/fancy-dress-delhi | grep -o 'href="/category/[^"]*"' | sort -u` includes `/category/dandiya-dress` and `/category/ramleela-costumes` (live sections on 25 Sep), and every existing link still appears.
  - `curl -s localhost:3000/fancy-dress-delhi | grep -c 'products-w400'` is at least 16 (8 tiles + 8 cards).
  - Every `/category/<slug>` in the page returns 200: loop `curl -s -o /dev/null -w '%{http_code}'`.
  - Existing text still present: `grep -c 'What We Stock'` = 1.

- [ ] **Step 5: Record and commit.** Add a PROGRESS.md entry with the baseline to beat (Delhi 7,571 impressions / 107 clicks / pos 4.9; Noida 1,102 / 25 / 8.0, 28 days to 20 Sep) and a re-check date of 23 Oct. Commit to main and push (one deploy).

```bash
git add lib/location/showcase.ts tests/location-showcase.test.ts components/public/LocationShowcase.tsx "app/(public)/fancy-dress-delhi/page.tsx" "app/(public)/fancy-dress-noida/page.tsx" seodata/PROGRESS.md docs/superpowers/plans/2026-09-25-location-page-showcase.md
git commit -m "feat(local): occasion tiles and an in-season product row on the Delhi and Noida pages"
git push origin main
```

- [ ] **Step 6: Verify production** after the deploy: the same curl checks against `https://www.modfancydress.com`, plus Lighthouse mobile on `/fancy-dress-delhi` (LCP must not regress past the `seodata/CWV-2026.md` figure for that page).
