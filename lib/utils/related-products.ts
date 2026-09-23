/**
 * Picks the sibling products shown in the "More <Category> Costumes" block on a
 * product page.
 *
 * The obvious implementation — "first N products in the category" — shows the
 * same N siblings on every product page in that category. Google reads an
 * identical repeated block as boilerplate and discounts the links, and those N
 * products hoard every internal link while the rest of the category gets none.
 *
 * Instead this walks a ring: order the category, start at the current product,
 * take the next `count` wrapping around the end. Every product in the category
 * receives exactly `count` inbound sibling links (no orphans, uniform equity),
 * and no two products show the same block.
 */

export const RELATED_PRODUCTS_COUNT = 8

export function selectRelatedProducts<T extends { id: string }>(
  siblings: T[],
  currentProductId: string,
  count: number = RELATED_PRODUCTS_COUNT
): T[] {
  // Sort here rather than trusting the query: product pages are prerendered, so
  // the block has to be byte-stable across ISR regenerations even if Postgres
  // returns rows in a different order.
  const ordered = [...siblings].sort((a, b) => a.id.localeCompare(b.id))
  if (ordered.length === 0 || count <= 0) return []

  const selfIndex = ordered.findIndex((s) => s.id === currentProductId)
  // Product isn't in its own category list (primary category vs junction
  // mismatch) — still show something rather than blanking the section.
  if (selfIndex === -1) return ordered.slice(0, count)

  const block: T[] = []
  // `offset < ordered.length` is what stops a category smaller than `count`
  // from wrapping far enough to repeat itself.
  for (let offset = 1; offset < ordered.length && block.length < count; offset++) {
    block.push(ordered[(selfIndex + offset) % ordered.length])
  }
  return block
}

/**
 * Heading for the related block: a real keyword-bearing H2 ("More Krishna
 * Costumes"), not a generic "You may also like".
 *
 * Only a trailing "Costume"/"Costumes" is stripped. Trailing "Dress" is left
 * alone on purpose — "Fancy Dress" would otherwise become "More Fancy
 * Costumes" and lose the phrase people actually search for.
 */
export function relatedHeading(categoryName: string): string {
  const base = categoryName.trim().replace(/\s*costumes?$/i, '').trim()
  return base ? `More ${base} Costumes` : 'More Costumes'
}

export interface CategoryPool<T> {
  categoryId: string
  categoryName: string
  categorySlug: string
  /** Active products in this category, including the one being viewed. */
  products: T[]
}

/**
 * A product can sit in several categories. Draw siblings from whichever holds
 * the most, rather than from whichever happens to be the primary — a product
 * filed primarily under a near-empty category still gets a full block from the
 * bigger category it also belongs to.
 *
 * Ties break on category id so a prerendered page picks the same category on
 * every rebuild.
 */
/**
 * Catch-all categories whose members have nothing in common beyond "costume":
 * drawing siblings from them is how Gabbar ended up next to Facebook and Laptop
 * costumes. Any category this large is treated the same way.
 */
export const GENERIC_CATEGORY_SLUGS: ReadonlySet<string> = new Set(['costumes'])
export const GENERIC_POOL_MIN_SIZE = 60

export function isGenericPool<T>(pool: CategoryPool<T>): boolean {
  return GENERIC_CATEGORY_SLUGS.has(pool.categorySlug) || pool.products.length >= GENERIC_POOL_MIN_SIZE
}

export interface RelatedSources<T> {
  /** Names the block ("More X Costumes") and links "View all"; its siblings come first. */
  main: CategoryPool<T>
  /** Used, in order, only when `main` can't fill the block: other specific categories, then generic ones. */
  topUp: T[][]
}

const byCategoryId = <T>(a: CategoryPool<T>, b: CategoryPool<T>) => a.categoryId.localeCompare(b.categoryId)

/**
 * Relevance-first choice of where a product page's related block comes from:
 * 1. the primary category, when it alone has a full block of siblings;
 * 2. otherwise the richest *specific* category (a product filed under a
 *    near-empty primary still gets a relevant block — the Krishna case);
 * 3. a generic pool leads only when nothing specific exists.
 * Generic pools otherwise only top up a thin block.
 */
export function pickRelatedSources<T extends { id: string }>(
  pools: CategoryPool<T>[],
  primaryCategoryId: string | null | undefined,
  count: number = RELATED_PRODUCTS_COUNT
): RelatedSources<T> | null {
  const usable = pools.filter((p) => p.products.length > 1)
  const specific = usable.filter((p) => !isGenericPool(p))
  const generic = usable.filter((p) => isGenericPool(p))

  const primary = specific.find((p) => p.categoryId === primaryCategoryId)
  const main =
    primary && primary.products.length - 1 >= count
      ? primary
      : (pickRichestPool(specific) ?? pickRichestPool(generic))
  if (!main) return null

  const topUp = [
    ...specific.filter((p) => p !== main).sort(byCategoryId),
    ...generic.filter((p) => p !== main).sort(byCategoryId),
  ].map((p) => p.products)
  return { main, topUp }
}

/**
 * The related block: the ring over `main` (see selectRelatedProducts), then, if
 * that is short, top-up products never already shown. Top-ups are also taken as
 * a ring starting where the current id would sort, so products in a thin
 * category don't all get the same filler set.
 */
export function selectRelatedWithTopUp<T extends { id: string }>(
  sources: RelatedSources<T>,
  currentProductId: string,
  count: number = RELATED_PRODUCTS_COUNT
): T[] {
  const block = selectRelatedProducts(sources.main.products, currentProductId, count)
  const seen = new Set([currentProductId, ...block.map((b) => b.id)])
  for (const group of sources.topUp) {
    if (block.length >= count) break
    const candidates = [...new Map(group.filter((c) => !seen.has(c.id)).map((c) => [c.id, c])).values()]
      .sort((a, b) => a.id.localeCompare(b.id))
    if (candidates.length === 0) continue
    const start = Math.max(0, candidates.findIndex((c) => c.id.localeCompare(currentProductId) > 0))
    for (let i = 0; i < candidates.length && block.length < count; i++) {
      const c = candidates[(start + i) % candidates.length]
      block.push(c)
      seen.add(c.id)
    }
  }
  return block
}

export function pickRichestPool<T>(pools: CategoryPool<T>[]): CategoryPool<T> | null {
  // A pool of one is the product itself, which yields no siblings.
  const usable = pools.filter((p) => p.products.length > 1)
  if (usable.length === 0) return null

  return usable.reduce((best, p) => {
    if (p.products.length !== best.products.length) {
      return p.products.length > best.products.length ? p : best
    }
    return p.categoryId.localeCompare(best.categoryId) < 0 ? p : best
  })
}
