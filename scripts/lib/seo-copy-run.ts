/**
 * Shared plumbing for the Sep 2026 SEO copy scripts: a service-role client,
 * the --apply switch, a snapshot of what is live (products, categories, blog
 * posts), and the checks every script runs before it writes anything:
 *
 * - checkCopy() on every seo_title / meta_description (English, length limits)
 * - every internal link in body copy resolves to a live page
 * - at most one Roman-script Hinglish line, and only as the last line
 *
 * Any violation aborts the run before the first write.
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../../lib/seo/copy-limits'

config({ path: resolve(process.cwd(), '.env.local') })

export const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const APPLY = process.argv.includes('--apply')

export type LiveProduct = {
  id: string
  slug: string
  name: string
  price: number | null
  rent_price: number | null
  rent_deposit: number | null
  size: string | null
  description: string | null
  seo_title: string | null
  meta_description: string | null
  category_id: string | null
}

export type Catalog = {
  products: Map<string, LiveProduct>
  productById: Map<string, LiveProduct>
  /** active categories: slug -> id */
  categories: Map<string, string>
  /** category slug -> live product slugs (primary category or junction row) */
  members: Map<string, string[]>
  publishedPosts: Set<string>
}

export async function loadCatalog(): Promise<Catalog> {
  const { data: prods, error } = await sb
    .from('products')
    .select('id, slug, name, price, rent_price, rent_deposit, size, description, seo_title, meta_description, category_id')
    .eq('is_active', true)
    .is('deleted_at', null)
  if (error) throw error
  const { data: cats } = await sb.from('categories').select('id, slug, is_active')
  const { data: pcs } = await sb.from('product_categories').select('product_id, category_id')
  const { data: posts } = await sb.from('blog_posts').select('slug, published_at')

  const products = new Map<string, LiveProduct>()
  const productById = new Map<string, LiveProduct>()
  for (const p of (prods ?? []) as LiveProduct[]) {
    products.set(p.slug, p)
    productById.set(p.id, p)
  }
  const catSlugById = new Map((cats ?? []).map((c) => [c.id, c.slug]))
  const categories = new Map((cats ?? []).filter((c) => c.is_active).map((c) => [c.slug, c.id]))
  const members = new Map<string, string[]>()
  const add = (catId: string | null, productId: string) => {
    const cs = catId ? catSlugById.get(catId) : undefined
    const p = productById.get(productId)
    if (!cs || !p) return
    const list = members.get(cs) ?? []
    if (!list.includes(p.slug)) list.push(p.slug)
    members.set(cs, list)
  }
  for (const p of productById.values()) add(p.category_id, p.id)
  for (const r of pcs ?? []) add(r.category_id, r.product_id)

  const publishedPosts = new Set((posts ?? []).filter((p) => p.published_at).map((p) => p.slug))
  return { products, productById, categories, members, publishedPosts }
}

export function product(cat: Catalog, slug: string): LiveProduct {
  const p = cat.products.get(slug)
  if (!p) throw new Error(`product ${slug} is not live`)
  return p
}

/** Lowest price / rent among a category's live products, straight from the DB. */
export function fromPrices(cat: Catalog, categorySlug: string): { buy: number; rent: number } {
  const ps = (cat.members.get(categorySlug) ?? []).map((s) => cat.products.get(s)!)
  const buy = Math.min(...ps.map((p) => p.price ?? Infinity))
  const rent = Math.min(...ps.map((p) => p.rent_price ?? Infinity))
  if (!Number.isFinite(buy) || !Number.isFinite(rent)) throw new Error(`no prices for ${categorySlug}`)
  return { buy, rent }
}

const STATIC_PATHS = new Set([
  '/rent', '/products', '/wholesale', '/wholesale/schools', '/wholesale/dance-academies',
  '/contact', '/faq', '/fancy-dress-delhi', '/fancy-dress-noida', '/fancy-dress-gurgaon', '/blog',
])

/** Every `](/path)` link must point at a live product, a non-empty active category, a published post or a static page. */
export function brokenLinks(cat: Catalog, body: string, extraLivePosts: string[] = []): string[] {
  const bad: string[] = []
  for (const m of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const path = m[1]
    const [, kind, slug] = path.split('/')
    if (STATIC_PATHS.has(path)) continue
    if (kind === 'products' && cat.products.has(slug)) continue
    if (kind === 'category' && cat.categories.has(slug) && (cat.members.get(slug)?.length ?? 0) > 0) continue
    if (kind === 'blog' && (cat.publishedPosts.has(slug) || extraLivePosts.includes(slug))) continue
    bad.push(path)
  }
  return bad
}

/** Roman-script Hinglish markers. A body may hold one such line, and only as its last line. */
const HINGLISH = /\b(chahiye|kijiye|lijiye|karein|karke|kiraye|wala|wali|ke liye|mein|hai|hain|aur|bhi|toh)\b/i

export function hinglishProblems(body: string): string[] {
  const lines = body.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean)
  const hits = lines.map((l, i) => (HINGLISH.test(l) ? i : -1)).filter((i) => i >= 0)
  if (hits.length > 1) return [`${hits.length} Hinglish lines (max 1)`]
  if (hits.length === 1 && hits[0] !== lines.length - 1) return ['Hinglish line is not the last line']
  return []
}

/** Collects problems across a run; call report() before writing. */
export class Problems {
  list: string[] = []
  copy(label: string, seoTitle: string, metaDescription: string) {
    for (const v of checkCopy({ seoTitle, metaDescription })) this.list.push(`${label}: ${v}`)
  }
  body(cat: Catalog, label: string, body: string, extraLivePosts: string[] = []) {
    for (const l of brokenLinks(cat, body, extraLivePosts)) this.list.push(`${label}: dead link ${l}`)
    for (const h of hinglishProblems(body)) this.list.push(`${label}: ${h}`)
  }
  /**
   * Category descriptions render as one plain <p> (twice: under the H1 and in
   * "About this category"), so they must be prose: no markdown, no line breaks,
   * and short enough not to push the product grid below the fold.
   */
  plainCategory(label: string, text: string, maxChars = 1300) {
    if (/\n|\]\(|^#|\*\*|(^|\s)- /.test(text)) this.list.push(`${label}: category description must be plain prose (no markdown or line breaks)`)
    if (text.length > maxChars) this.list.push(`${label}: category description ${text.length} chars (max ${maxChars})`)
    // One Hinglish line = at most two trailing sentences (a question and its answer).
    const sentences = text.split(/(?<=[.?!])\s+/)
    const hits = sentences.map((s, i) => (HINGLISH.test(s) ? i : -1)).filter((i) => i >= 0)
    const trailing = hits.every((i, k) => i === sentences.length - hits.length + k)
    if (hits.length > 2 || !trailing) this.list.push(`${label}: Hinglish must be one closing line`)
  }
  add(msg: string) {
    this.list.push(msg)
  }
  abortIfAny() {
    if (!this.list.length) return
    console.error('❌ Refusing to write:')
    this.list.forEach((p) => console.error('   ' + p))
    process.exit(1)
  }
}

export function banner() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')
}

/** Print a field change as old -> new, and return whether it differs. */
export function diff(label: string, field: string, before: string | null | undefined, after: string): boolean {
  if ((before ?? '') === after) return false
  const short = (s: string) => (s.length > 140 ? s.slice(0, 137) + '...' : s)
  console.log(`   ${label}.${field} (${after.length})`)
  console.log(`      - ${short(before ?? '')}`)
  console.log(`      + ${short(after)}`)
  return true
}
