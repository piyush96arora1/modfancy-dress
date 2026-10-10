/**
 * Find live products that still need the post-upload follow-up, read-only.
 *
 * Every admin-panel batch arrives with empty description / meta_description / seo_title /
 * alt text, often one product with no category, sometimes a missing or inverted price, and
 * names that hide the product ("Multi", "Ravan Face"). Uploads from iOS are JPEG, so the
 * uploader skips the w400/w800 variants. This script lists all of that in one pass so the
 * catalog-steward agent (and /shop-run) know whether there is work, and on which products.
 *
 * Checks:
 *   copy       blank description, meta_description or seo_title; title/meta outside SERP limits
 *   alt        product images with blank alt_text
 *   orphan     no primary category and no product_categories row
 *   price      price missing, or rent above the buy price (owner's data-entry error)
 *   meta-price "Buy ₹X or rent ₹Y" in the meta disagrees with live prices
 *   name       upload name/slug that probably does not say what the product is (heuristic, --days only)
 *   variants   product image without a products-w400 variant (--days only)
 *   hidden     live row whose /products URL is a redirect source (a merged duplicate): owner hides it
 *
 * Summary splits the work: `agentWork` is what catalog-steward can close (anything on a recent
 * upload, plus meta-price drift); `ownerWork` needs the owner in admin (price errors, hidden
 * duplicates). Old alt-text backlog counts in neither.
 *
 * Usage:
 *   npx tsx scripts/audit-catalog-gaps.ts               # human summary, variants for last 30 days
 *   npx tsx scripts/audit-catalog-gaps.ts --days 14
 *   npx tsx scripts/audit-catalog-gaps.ts --json        # machine-readable, for agents
 *
 * Exit code is always 0 on a successful read; "no gaps" is `total: 0` in the JSON.
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'
import { getImageUrl } from '../lib/imageUrl'
import { variantPath } from '../lib/utils/image-variants'

config({ path: resolve(process.cwd(), '.env.local'), quiet: true })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const JSON_OUT = process.argv.includes('--json')
const DAYS = Number(argValue('--days') ?? 30)
const BUCKET = 'product-images'

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const blank = (v: string | null | undefined) => !v || !v.trim()

/** Words that, on their own, describe a colour, a batch or an event rather than a product. */
const VAGUE = new Set([
  'multi', 'black', 'red', 'white', 'pink', 'blue', 'green', 'yellow', 'new', 'item', 'product',
  'dress', 'costume', 'fancy', 'set', 'face', 'garba', 'dandiya', 'navratri', 'lehnga', 'lehenga',
  'kids', 'adult', 'girls', 'boys', 'copy', 'final', 'img', 'photo',
])
const PHRASE = /Buy ₹\s?(\d+(?:,\d{3})*) or rent ₹\s?(\d+(?:,\d{3})*)/

type Row = {
  id: string
  slug: string
  name: string
  price: number | null
  rent_price: number | null
  description: string | null
  meta_description: string | null
  seo_title: string | null
  category_id: string | null
  created_at: string
  product_images: { image_url: string; alt_text: string | null }[]
  product_categories: { category_id: string }[]
}

type Gap = { slug: string; name: string; created_at: string; recent: boolean; issues: string[] }

function nameIssue(r: Row): string | null {
  const words = r.slug.split('-').filter(Boolean)
  const meaningful = words.filter((w) => !VAGUE.has(w) && !/^\d+$/.test(w))
  if (/-\d+$/.test(r.slug) || /-copy$/.test(r.slug)) return `slug "${r.slug}" looks like a duplicate/upload artefact`
  if (meaningful.length === 0) return `name "${r.name}" says nothing about the product`
  return null
}

async function variantNames(): Promise<Set<string>> {
  const out = new Set<string>()
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage.from(BUCKET).list('products-w400', { limit: 1000, offset })
    if (error) throw error
    for (const f of data ?? []) out.add(`products-w400/${f.name}`)
    if (!data || data.length < 1000) return out
  }
}

/** Storage path inside the bucket for a stored image_url (absolute, relative or legacy). */
function storagePath(imageUrl: string): string | null {
  const m = getImageUrl(imageUrl).match(/\/product-images\/([^?#]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

async function main() {
  const { data, error } = await sb
    .from('products')
    .select(
      'id, slug, name, price, rent_price, description, meta_description, seo_title, category_id, created_at, product_images(image_url, alt_text), product_categories(category_id)'
    )
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as Row[]

  const since = Date.now() - DAYS * 86_400_000
  const redirectTo = new Map<string, string>(
    (JSON.parse(readFileSync(resolve(process.cwd(), 'redirects.json'), 'utf8')) as { source: string; destination: string }[]).map(
      (r) => [r.source, r.destination]
    )
  )
  const variants = await variantNames()

  const gaps: Gap[] = []
  for (const r of rows) {
    const issues: string[] = []
    const recent = new Date(r.created_at).getTime() >= since
    const hiddenBy = redirectTo.get(`/products/${r.slug}`)
    if (hiddenBy) {
      // Nobody can reach this page, so copy and alt text on it are wasted: only the owner's hide matters.
      gaps.push({ slug: r.slug, name: r.name, created_at: r.created_at.slice(0, 10), recent, issues: [`hidden: /products/${r.slug} already redirects to ${hiddenBy} — duplicate listing, owner should hide it in admin`] })
      continue
    }
    const blanks = (['description', 'meta_description', 'seo_title'] as const).filter((k) => blank(r[k]))
    if (blanks.length) issues.push(`copy: empty ${blanks.join(', ')}`)
    else for (const v of checkCopy({ seoTitle: r.seo_title!, metaDescription: r.meta_description! })) issues.push(`copy: ${v}`)

    const noAlt = r.product_images.filter((i) => blank(i.alt_text)).length
    if (noAlt) issues.push(`alt: ${noAlt} of ${r.product_images.length} image(s) without alt text`)
    if (!r.product_images.length) issues.push('alt: product has no images')

    if (!r.category_id && !r.product_categories.length) issues.push('orphan: no category')

    const buy = Number(r.price)
    const rent = Number(r.rent_price)
    if (!(buy > 0)) issues.push('price: no buy price')
    if (buy > 0 && rent > buy) issues.push(`price: rent ₹${rent} above buy ₹${buy} — ask the owner`)

    const m = r.meta_description?.match(PHRASE)
    if (m && buy > 0 && rent > 0) {
      const [mb, mr] = [m[1], m[2]].map((s) => Number(s.replace(/,/g, '')))
      if (mb !== buy || mr !== rent) issues.push(`meta-price: meta says ₹${mb}/₹${mr}, live is ₹${buy}/₹${rent}`)
    }

    // Names and variants only for recent uploads: renaming a page that has ranked for months
    // throws away its URL history, and older images were backfilled in Sep 2026.
    const n = recent ? nameIssue(r) : null
    if (n) issues.push(`name: ${n}`)

    if (recent) {
      const missing = r.product_images
        .map((i) => storagePath(i.image_url))
        .filter((p): p is string => !!p)
        .map((p) => variantPath(p, 400))
        .filter((v): v is string => !!v && !variants.has(v)).length
      if (missing) issues.push(`variants: ${missing} image(s) without a w400 variant`)
    }

    if (issues.length) gaps.push({ slug: r.slug, name: r.name, created_at: r.created_at.slice(0, 10), recent, issues })
  }

  const count = (prefix: string) => gaps.filter((g) => g.issues.some((i) => i.startsWith(prefix))).length
  const summary = {
    live: rows.length,
    total: gaps.length,
    // A stale meta price on a product whose price is itself wrong waits for the owner.
    agentWork: gaps.filter((g) => {
      const priceBad = g.issues.some((i) => i.startsWith('price'))
      return g.issues.some(
        (i) => (i.startsWith('meta-price') && !priceBad) || (g.recent && !i.startsWith('price') && !i.startsWith('meta-price') && !i.startsWith('hidden'))
      )
    }).length,
    ownerWork: gaps.filter((g) => g.issues.some((i) => i.startsWith('price') || i.startsWith('hidden'))).length,
    backlog: gaps.filter((g) => !g.recent && g.issues.every((i) => i.startsWith('alt'))).length,
    copy: count('copy'),
    alt: count('alt'),
    orphan: count('orphan'),
    price: count('price'),
    metaPrice: count('meta-price'),
    name: count('name'),
    variants: count('variants'),
    hidden: count('hidden'),
    newestUpload: rows[0]?.created_at.slice(0, 10) ?? null,
  }

  if (JSON_OUT) {
    console.log(JSON.stringify({ summary, gaps }, null, 2))
    return
  }
  console.log(`Live products: ${summary.live}   needing work: ${summary.total}   agent: ${summary.agentWork} · owner: ${summary.ownerWork} · old alt backlog: ${summary.backlog}   newest upload: ${summary.newestUpload}`)
  console.log(
    `  copy ${summary.copy} · alt ${summary.alt} · orphan ${summary.orphan} · price ${summary.price} · meta-price ${summary.metaPrice} · name ${summary.name} · variants ${summary.variants} · hidden ${summary.hidden}   (names/variants: last ${DAYS}d)\n`
  )
  const backlogOnly = (g: Gap) => !g.recent && g.issues.every((i) => i.startsWith('alt'))
  for (const g of gaps.filter((x) => !backlogOnly(x))) {
    console.log(`${g.created_at}  ${g.slug}  (${g.name})`)
    for (const i of g.issues) console.log(`    - ${i}`)
  }
  const old = gaps.filter(backlogOnly)
  if (old.length) console.log(`\n+ ${old.length} older products with only missing alt text (backlog; see --json)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
