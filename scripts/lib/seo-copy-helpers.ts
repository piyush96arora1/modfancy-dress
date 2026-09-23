/**
 * Shared helpers for the festival-season copy scripts (Sep 2026 plan, Tasks 1 and 4).
 *
 * - Prices in copy are never typed by hand. Copy carries tokens that are filled
 *   from the live catalog when the script runs:
 *     {BUY:<slug>}        product price
 *     {RENT:<slug>}       product rent_price
 *     {BREAKEVEN:<slug>}  nights of renting that cost as much as buying (ceil(price / rent))
 *     {MIN_BUY:<cat>}     lowest price among live products in a category
 *     {MIN_RENT:<cat>}    lowest rent_price among live products in a category
 *   A token pointing at a product that is not live, or a price that is empty,
 *   throws, so a script never writes "₹undefined" or a price for a dead page.
 * - Every internal link in blog copy is checked: /products/<slug> must be a live
 *   product, /category/<slug> an active category, /blog/<slug> a published post.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type LiveProduct = { id: string; slug: string; price: number | null; rent_price: number | null }

export type Catalog = {
  products: Map<string, LiveProduct>
  /** active categories only */
  categories: Map<string, { id: string; slug: string }>
  publishedPosts: Set<string>
  minPrice: (categorySlug: string) => { buy: number; rent: number }
}

type CategoryLinked = { category_id: string | null; product_categories: { category_id: string }[] | null }

/** Same membership rule as getProductsForCategoryCached: primary category OR a junction row. */
export function inCategory(p: CategoryLinked, categoryIds: string[]): boolean {
  return (
    (p.category_id !== null && categoryIds.includes(p.category_id)) ||
    (p.product_categories ?? []).some((x) => categoryIds.includes(x.category_id))
  )
}

export async function loadCatalog(sb: SupabaseClient): Promise<Catalog> {
  const { data: prods, error: pe } = await sb
    .from('products')
    .select('id, slug, price, rent_price, category_id, product_categories(category_id)')
    .eq('is_active', true)
    .is('deleted_at', null)
  if (pe) throw pe
  const { data: cats, error: ce } = await sb.from('categories').select('id, slug, is_active')
  if (ce) throw ce
  const { data: posts, error: be } = await sb.from('blog_posts').select('slug').not('published_at', 'is', null)
  if (be) throw be

  const products = new Map<string, LiveProduct>()
  for (const p of prods ?? []) products.set(p.slug, { id: p.id, slug: p.slug, price: p.price, rent_price: p.rent_price })
  const categories = new Map<string, { id: string; slug: string }>()
  for (const c of cats ?? []) if (c.is_active) categories.set(c.slug, { id: c.id, slug: c.slug })

  const minPrice = (categorySlug: string) => {
    const cat = categories.get(categorySlug)
    if (!cat) throw new Error(`category ${categorySlug} is not active`)
    const members = (prods ?? []).filter((p) => inCategory(p, [cat.id]))
    const buys = members.map((p) => Number(p.price)).filter((n) => n > 0)
    const rents = members.map((p) => Number(p.rent_price)).filter((n) => n > 0)
    if (!buys.length || !rents.length) throw new Error(`category ${categorySlug} has no priced live products`)
    return { buy: Math.min(...buys), rent: Math.min(...rents) }
  }

  return { products, categories, publishedPosts: new Set((posts ?? []).map((p) => p.slug)), minPrice }
}

const inr = (n: number) => n.toLocaleString('en-IN')

export function fillTokens(text: string, cat: Catalog): string {
  return text.replace(/\{(BUY|RENT|BREAKEVEN|MIN_BUY|MIN_RENT):([a-z0-9-]+)\}/g, (_m, kind: string, slug: string) => {
    if (kind === 'MIN_BUY') return inr(cat.minPrice(slug).buy)
    if (kind === 'MIN_RENT') return inr(cat.minPrice(slug).rent)
    const p = cat.products.get(slug)
    if (!p) throw new Error(`price token {${kind}:${slug}}: product is not live`)
    const buy = Number(p.price)
    const rent = Number(p.rent_price)
    if (kind === 'BUY') {
      if (!(buy > 0)) throw new Error(`${slug} has no price`)
      return inr(buy)
    }
    if (!(rent > 0)) throw new Error(`${slug} has no rent_price`)
    if (kind === 'RENT') return inr(rent)
    if (!(buy > 0)) throw new Error(`${slug} has no price`)
    return String(Math.ceil(buy / rent))
  })
}

/**
 * Checks every internal link. `extraPosts` are posts this same script is about
 * to publish (so they are not yet in publishedPosts); `droppedPosts` are posts
 * it is about to unpublish (a link to them would 404 until the redirect ships).
 */
export function checkLinks(
  md: string,
  cat: Catalog,
  opts: { extraPosts?: string[]; droppedPosts?: string[] } = {}
): { errors: string[]; productLinks: string[] } {
  const errors: string[] = []
  const productLinks = new Set<string>()
  for (const m of md.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const href = m[1].split('#')[0]
    const [, kind, slug] = href.split('/')
    if (kind === 'products') {
      if (!cat.products.has(slug)) errors.push(`dead product link ${href}`)
      else productLinks.add(slug)
    } else if (kind === 'category') {
      if (!cat.categories.has(slug)) errors.push(`inactive category link ${href}`)
    } else if (kind === 'blog') {
      const ok = (cat.publishedPosts.has(slug) || opts.extraPosts?.includes(slug)) && !opts.droppedPosts?.includes(slug)
      if (!ok) errors.push(`unpublished blog link ${href}`)
    }
  }
  if (/\{[A-Z_]+:[^}]*\}/.test(md)) errors.push('unfilled price token left in copy')
  return { errors, productLinks: [...productLinks] }
}

/** Words as a reader counts them: markdown link targets and syntax stripped. */
export function wordCount(md: string): number {
  return md
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*\[\]]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}
