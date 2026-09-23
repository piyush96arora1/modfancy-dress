/**
 * Shared machinery for the autumn 2026 festival content scripts
 * (setup-halloween-2026, setup-diwali-2026, setup-childrens-day-2026).
 *
 * The calling script declares only its copy. This module owns what must not
 * vary between them:
 *
 *   - Every seo_title / meta_description (and blog title / excerpt, which the
 *     blog page uses as its <title> and meta) goes through checkCopy, plus the
 *     155-char cap that generatePageMetadata truncates at. One violation stops
 *     the whole run before anything is written.
 *   - Prices are never typed into copy. Copy uses {{price:slug}},
 *     {{rent:slug}}, {{deposit:slug}} and {{size:slug}} placeholders that are
 *     filled from the live row at run time; an unknown placeholder is fatal.
 *   - Every /products/<slug> link in a post must be a live product
 *     (is_active, not soft-deleted) that is not also a redirects.json source,
 *     and every /category/<slug> link must be an active category.
 *   - Dry run by default; --apply writes.
 */
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../../lib/seo/copy-limits'

config({ path: resolve(process.cwd(), '.env.local') })

export const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')
/** False on the validation pass; true only on the second (--apply) pass. */
let writing = false

/** generatePageMetadata truncates descriptions above this. */
const RENDER_META_MAX = 155
const EXCERPT_MAX = 160

/**
 * Slugs being renamed by a parallel task on 23 Sep 2026. Linking them now
 * would publish a link that becomes a redirect hop within hours.
 */
const DO_NOT_LINK = new Set(['kerala-fancy-dres', 'pahdi-boy-fancy-dress'])

export type LiveProduct = {
  id: string
  slug: string
  name: string
  price: number | null
  rent_price: number | null
  rent_deposit: number | null
  size: string | null
}

export type Catalog = {
  products: Map<string, LiveProduct>
  categories: Map<string, { id: string; name: string }>
  redirectSources: Set<string>
}

export async function loadCatalog(): Promise<Catalog> {
  const { data: prods, error: pe } = await sb
    .from('products')
    .select('id, slug, name, price, rent_price, rent_deposit, size')
    .eq('is_active', true)
    .is('deleted_at', null)
  if (pe) throw pe
  const { data: cats, error: ce } = await sb
    .from('categories')
    .select('id, slug, name')
    .eq('is_active', true)
  if (ce) throw ce
  const redirects = JSON.parse(readFileSync(resolve(process.cwd(), 'redirects.json'), 'utf8')) as {
    source: string
  }[]
  return {
    products: new Map((prods ?? []).map((p) => [p.slug, p as LiveProduct])),
    categories: new Map((cats ?? []).map((c) => [c.slug, { id: c.id, name: c.name }])),
    redirectSources: new Set(redirects.map((r) => r.source)),
  }
}


/** Throws with every problem at once so a dry run shows the full list. */
export function assertCopy(label: string, seoTitle: string, metaDescription: string) {
  const v = checkCopy({ seoTitle, metaDescription })
  if (metaDescription.length > RENDER_META_MAX) v.push(`meta ${metaDescription.length} > ${RENDER_META_MAX} (render truncation)`)
  if (v.length) throw new Error(`${label}: ${v.join('; ')}`)
  console.log(`   ✔ copy ok — title ${seoTitle.length}, meta ${metaDescription.length}`)
}

/** Fills {{price|rent|deposit|size:slug}} from the live row. */
export function fill(cat: Catalog, text: string): string {
  return text.replace(/\{\{(price|rent|deposit|size):([a-z0-9-]+)\}\}/g, (_, field: string, slug: string) => {
    const p = cat.products.get(slug)
    if (!p) throw new Error(`placeholder ${field}:${slug} — product not live`)
    const v = field === 'price' ? p.price : field === 'rent' ? p.rent_price : field === 'deposit' ? p.rent_deposit : p.size
    if (v === null || v === undefined || v === '') throw new Error(`placeholder ${field}:${slug} — empty in DB`)
    return field === 'size' ? String(v) : `₹${Number(v).toLocaleString('en-IN')}`
  }).replace(/\{\{[^}]*\}\}/g, (m) => {
    throw new Error(`unknown placeholder ${m}`)
  })
}

/** Returns {products, categories} link counts; throws on any dead link. */
export function assertLinks(cat: Catalog, content: string) {
  const bad: string[] = []
  let products = 0
  let categories = 0
  for (const m of content.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const href = m[1]
    const prod = /^\/products\/([a-z0-9-]+)$/.exec(href)
    const catm = /^\/category\/([a-z0-9-]+)$/.exec(href)
    if (prod) {
      products++
      const s = prod[1]
      if (!cat.products.has(s)) bad.push(`${href} not live`)
      if (cat.redirectSources.has(href)) bad.push(`${href} is a redirect source`)
      if (DO_NOT_LINK.has(s)) bad.push(`${href} is being renamed today`)
    } else if (catm) {
      categories++
      if (!cat.categories.has(catm[1])) bad.push(`${href} not an active category`)
    } else if (!['/rent', '/faq', '/fancy-dress-delhi', '/wholesale', '/wholesale/schools', '/contact'].includes(href) && !href.startsWith('/blog/')) {
      bad.push(`${href} unrecognised internal link`)
    }
  }
  if (bad.length) throw new Error(`dead links:\n   ${bad.join('\n   ')}`)
  return { products, categories }
}

export function wordCount(markdown: string) {
  return markdown
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*[\]-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

export type Post = { slug: string; title: string; excerpt: string; content: string }

/** Inserts the post, or rewrites it if this script created it on an earlier run. */
export async function upsertPost(cat: Catalog, post: Post) {
  console.log(`\n--- blog: ${post.slug}`)
  if (post.excerpt.length > EXCERPT_MAX) throw new Error(`${post.slug}: excerpt ${post.excerpt.length} > ${EXCERPT_MAX}`)
  assertCopy(post.slug, post.title, post.excerpt)
  const content = fill(cat, post.content)
  const links = assertLinks(cat, content)
  console.log(`   words ${wordCount(content)} | product links ${links.products} | category links ${links.categories}`)
  const hinglishHeadings = content.split('\n\n').filter((b) => /\b(pe|ki|ka|hai|lijiye|chahiye)\b/.test(b))
  if (hinglishHeadings.length > 1) throw new Error(`${post.slug}: more than one Hinglish block`)

  const { data: existing } = await sb.from('blog_posts').select('id, published_at').eq('slug', post.slug).maybeSingle()
  if (!writing) {
    console.log(`   would ${existing ? 'update' : 'insert'}`)
    return
  }
  if (existing) {
    const { error } = await sb
      .from('blog_posts')
      .update({ title: post.title, excerpt: post.excerpt, content })
      .eq('id', existing.id)
    console.log(error ? `   ❌ ${error.message}` : '   ✅ updated')
  } else {
    const { error } = await sb.from('blog_posts').insert({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content,
      language: 'en',
      published_at: new Date().toISOString(),
    })
    console.log(error ? `   ❌ ${error.message}` : '   ✅ inserted')
  }
}

export type CategoryPatch = {
  slug: string
  name?: string
  seo_title: string
  meta_description: string
  description: string
}

/** Overwrites the category copy (these tasks are explicit "overwrite" tasks). */
export async function updateCategory(cat: Catalog, patch: CategoryPatch) {
  console.log(`\n--- category: ${patch.slug}`)
  const c = cat.categories.get(patch.slug)
  if (!c) throw new Error(`${patch.slug}: not an active category`)
  const seo_title = fill(cat, patch.seo_title)
  const meta_description = fill(cat, patch.meta_description)
  assertCopy(patch.slug, seo_title, meta_description)
  console.log(`   title: ${seo_title}\n   meta:  ${meta_description}`)
  const description = fill(cat, patch.description)
  if (description.includes('\n')) throw new Error(`${patch.slug}: category description renders as one <p>; no newlines`)
  console.log(`   desc ${description.length} chars`)
  const update: Record<string, string> = { seo_title, meta_description, description }
  if (patch.name) update.name = patch.name
  console.log(`   writing: ${Object.keys(update).join(', ')}`)
  if (writing) {
    const { error } = await sb.from('categories').update(update).eq('id', c.id)
    console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
  }
}

export type ProductPatch = {
  slug: string
  seo_title: string
  meta_description: string
  /** Omit to leave the body copy untouched. */
  description?: string
}

/** Overwrites a product's title/meta (and body if given). Slug is never touched. */
export async function updateProduct(cat: Catalog, patch: ProductPatch) {
  console.log(`\n--- product: ${patch.slug}`)
  const p = cat.products.get(patch.slug)
  if (!p) throw new Error(`${patch.slug}: not live`)
  const seo_title = fill(cat, patch.seo_title)
  const meta_description = fill(cat, patch.meta_description)
  assertCopy(patch.slug, seo_title, meta_description)
  console.log(`   title: ${seo_title}\n   meta:  ${meta_description}`)
  const update: Record<string, string> = { seo_title, meta_description }
  if (patch.description !== undefined) {
    update.description = fill(cat, patch.description)
    console.log(`   desc ${update.description.length} chars`)
  }
  console.log(`   writing: ${Object.keys(update).join(', ')}`)
  if (writing) {
    const { error } = await sb.from('products').update(update).eq('id', p.id)
    console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
  }
}

/** Adds product_categories rows; never removes a product's existing categories. */
export async function attachProducts(cat: Catalog, categorySlug: string, productSlugs: string[]) {
  console.log(`\n--- attach to ${categorySlug}`)
  const c = cat.categories.get(categorySlug)
  if (!c) throw new Error(`${categorySlug}: not an active category`)
  const { data: rows } = await sb.from('product_categories').select('product_id').eq('category_id', c.id)
  const already = new Set((rows ?? []).map((r) => r.product_id))
  for (const slug of productSlugs) {
    const p = cat.products.get(slug)
    if (!p) throw new Error(`${slug}: not live`)
    if (cat.redirectSources.has(`/products/${slug}`)) throw new Error(`${slug}: is a redirect source`)
    if (already.has(p.id)) {
      console.log(`   ✔ ${slug} already attached`)
      continue
    }
    console.log(`   + ${slug}`)
    if (writing) {
      const { error } = await sb
        .from('product_categories')
        .upsert({ product_id: p.id, category_id: c.id }, { onConflict: 'product_id,category_id' })
      if (error) console.log(`     ❌ ${error.message}`)
    }
  }
}

/**
 * Runs main() once as a dry run, which validates every title, meta, placeholder
 * and link. Only if that whole pass succeeds, and --apply was given, runs it
 * again with writes on, so a bad item late in the list can't leave the
 * earlier ones half-written.
 */
export async function run(main: (cat: Catalog) => Promise<void>) {
  try {
    const cat = await loadCatalog()
    console.log('=== VALIDATION / DRY RUN ===')
    await main(cat)
    if (!APPLY) {
      console.log('\nDry run only. Pass --apply to write.')
      return
    }
    console.log('\n\n=== APPLYING ===')
    writing = true
    await main(cat)
  } catch (e) {
    console.error(`\n❌ ${(e as Error).message}`)
    process.exit(1)
  }
}
