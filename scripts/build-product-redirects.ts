/**
 * Redirect hygiene and duplicate consolidation (SEO plan 2026-09-23, Task 5).
 *
 *   1. Duplicate pairs: download both products' images and compare SHA-256.
 *      Same images → merge: soft-delete the loser (deleted_at, as the admin
 *      panel does), move its product_categories onto the keeper, redirect.
 *      Different images → differentiate: rewrite name / seo_title /
 *      meta_description so each page targets its own query (checked with
 *      checkCopy), and optionally give the other product a clearer slug.
 *   2. Typo slugs: rename the slug (and the typo in `name`, the page <h1>),
 *      redirect the old URL, and rewrite /products/<old> links in blog posts.
 *   3. Dead product slugs with no redirect get one:
 *        a. a live product with the same normalised name,
 *        b. else the dead product's primary (then any) live, non-empty category,
 *        c. else /products.
 *      Never the homepage (a soft 404). Test slugs are left to 404.
 *      Products the owner will re-upload as new (PENDING_REUPLOAD) go to the
 *      best live category for now and are written to
 *      seodata/pending-reupload-redirects.json so Task 19a can repoint them.
 *   4. Existing redirects whose destination is dead are repaired with the same
 *      logic; every chain is flattened; validateRedirects must return nothing.
 *
 * Every /products/<slug> redirect has a /wholesale/<slug> twin (the site
 * serves both), as the existing redirects.json already does.
 *
 * Soft-deleted products are never restored (owner decision, 23 Sep 2026).
 * Prices in copy are read from the DB at run time.
 *
 * Dry run:  npx tsx scripts/build-product-redirects.ts
 * Apply:    npx tsx scripts/build-product-redirects.ts --apply
 *           (writes the DB, redirects.json, seodata/live-urls.json and
 *            seodata/pending-reupload-redirects.json)
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createHash } from 'crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'
import { flattenRedirects, validateRedirects, type Redirect } from '../lib/seo/redirect-graph'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const APPLY = process.argv.includes('--apply')
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')
const LIVE_URLS_PATH = resolve(process.cwd(), 'seodata/live-urls.json')
const PENDING_PATH = resolve(process.cwd(), 'seodata/pending-reupload-redirects.json')

type Product = {
  id: string
  name: string
  slug: string
  category_id: string | null
  price: number | null
  rent_price: number | null
  is_active: boolean
  deleted_at: string | null
  created_at: string
  seo_title: string | null
  meta_description: string | null
}
type Category = { id: string; slug: string; is_active: boolean }
type Junction = { id: string; product_id: string; category_id: string }
type Image = { product_id: string; image_url: string }
type Blog = { id: string; slug: string; content: string | null; published_at: string | null }
type Copy = { name: string; seo_title: string; meta_description: string }
type Entry = Redirect & { permanent: boolean }

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const rs = (n: number | null) => `₹${n ?? ''}`

/**
 * The eight near-duplicate pairs, keeper first. The keeper is the slug with
 * more Search Console impressions (seodata/gsc/2026-09-23). `differentiate`
 * is used only when the images differ; it is written from each product's own
 * photographs, and prices come from the row at run time.
 */
const PAIRS: {
  keeper: string
  other: string
  /** Merge even though the image bytes differ (a reshoot of the same costume). */
  forceMerge?: string
  differentiate?: {
    keeper: (p: Product) => Copy
    other: (p: Product) => Copy
    /** A clearer slug for the other product (old slug is redirected). */
    otherSlug?: string
  }
}[] = [
  { keeper: 'odissi-fancy-dress', other: 'odisi-fancy-dress' },
  {
    keeper: 'bharatnatyam-fancy-dress',
    other: 'bharatnatyam-fancy-dress-1',
    differentiate: {
      // Photo: adult dancer, red and orange costume with white pleated fan and gold border.
      keeper: (p) => ({
        name: 'Red Bharatnatyam Fancy Dress for Women',
        seo_title: `Red Bharatnatyam Costume for Women – Rent ${rs(p.rent_price)}`,
        meta_description: `Red and white Bharatnatyam costume with a pleated fan front and gold border, adult size, for recitals and annual day. Buy ${rs(p.price)} or rent ${rs(p.rent_price)} in Delhi NCR.`,
      }),
      // Photos: magenta costume with purple-and-gold border, flat-lay with temple jewellery, and a dancer in it.
      other: (p) => ({
        name: 'Magenta Bharatnatyam Fancy Dress',
        seo_title: `Bharatnatyam Dress for Kids – Magenta, Rent ${rs(p.rent_price)}`,
        meta_description: `Magenta Bharatnatyam costume with a purple-and-gold border and pleated fan, in 5-7 yrs and adult sizes, for recitals. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
      otherSlug: 'magenta-bharatnatyam-fancy-dress',
    },
  },
  {
    keeper: 'pooh-fancy-dress-costumes',
    other: 'pooh-fancy-dress',
    differentiate: {
      // Photos: yellow jumpsuit with red top panel and a Pooh-face hood, front/side/back.
      keeper: (p) => ({
        name: 'Winnie the Pooh Costume for Kids',
        seo_title: 'Winnie the Pooh Costume for Kids – Birthday & School',
        meta_description: `Yellow Winnie the Pooh jumpsuit for kids with the red top panel and a Pooh-face hood. For birthdays and school fancy dress. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
      // Photo: the same style of bodysuit shown at a party; aimed at the shorter "pooh fancy dress" query.
      other: (p) => ({
        name: 'Pooh Bear Fancy Dress',
        seo_title: `Pooh Bear Fancy Dress (3-9 yrs) – Rent ${rs(p.rent_price)}`,
        meta_description: `Pooh bear fancy dress for kids 3-9 yrs: soft yellow bodysuit with red top and bear-face hood, for Disney days and parties. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
    },
  },
  {
    keeper: 'cow-animal-fancy-dress-costume',
    other: 'cow-fancy-dress',
    differentiate: {
      // Photos: all-white cow jumpsuit, hood with black horns and ears.
      keeper: (p) => ({
        name: 'White Cow Fancy Dress Costume',
        seo_title: `White Cow Fancy Dress for Kids – Rent ${rs(p.rent_price)}`,
        meta_description: `White cow costume for kids: plain white jumpsuit with a cow hood, black horns and ears, for animal day and school fancy dress. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
      // Photo: black-and-white spotted cow suit with a green collar and horned hood.
      other: (p) => ({
        name: 'Spotted Cow Fancy Dress',
        seo_title: `Spotted Cow Costume for Kids (3-9 yrs) – Rent ${rs(p.rent_price)}`,
        meta_description: `Black-and-white spotted cow costume for kids 3-9 yrs, with a horned hood and green collar, for farm and animal themes. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
    },
  },
  {
    keeper: 'hanuman-ji-fancy-dress-for-ramleela',
    other: 'hanuman-ji-fancy-dress',
    differentiate: {
      // Photos: red and gold zari Hanuman outfit with crown, tail and orange gada.
      keeper: (p) => ({
        name: 'Hanuman Ji Ramleela Costume with Crown and Gada',
        seo_title: 'Hanuman Costume for Ramleela – Crown, Gada and Tail',
        meta_description: `Full Hanuman Ji costume for Ramleela and Dussehra plays: red and gold outfit with crown, tail and gada for kids. Buy ${rs(p.price)} or rent ${rs(p.rent_price)} in Delhi NCR.`,
      }),
      // Photos: plain red velvet top and shorts with gold trim and a Ram chest patch.
      other: (p) => ({
        name: 'Hanuman Ji Red Dress (Top and Shorts)',
        seo_title: `Simple Hanuman Dress for Kids – Rent ${rs(p.rent_price)}`,
        meta_description: `Budget Hanuman fancy dress for kids: red velvet top and shorts with gold trim and a Ram patch on the chest. Buy ${rs(p.price)} or rent ${rs(p.rent_price)} in Delhi NCR.`,
      }),
    },
  },
  {
    keeper: 'vanvasi-ram-fancy-dress',
    other: 'vanvasi-ram',
    forceMerge:
      'same costume (saffron kurta and dhoti, orange garlands, bow and quiver), reshot for the 19 Sep upload; see scripts/merge-vanvasi-ram-duplicate.ts',
  },
  {
    keeper: 'rajasthani-lehenga-fancy-dress',
    other: 'rajasthani-lehnga-fancy-dress',
    differentiate: {
      // Photo: adult woman, green bandhani lehenga with red chunni and silver jewellery.
      keeper: (p) => ({
        name: 'Green Rajasthani Lehenga Fancy Dress',
        seo_title: `Rajasthani Lehenga for Women – Green, Rent ${rs(p.rent_price)}`,
        meta_description: `Green bandhani Rajasthani lehenga-choli with a red chunni, adult size, for Ghoomar and Republic Day stage events. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
      // Photo: young girl, flared yellow-and-red panelled lehenga with silver border and red dupatta.
      other: (p) => ({
        name: 'Yellow Rajasthani Lehenga Fancy Dress',
        seo_title: `Rajasthani Lehenga for Girls – Yellow, Rent ${rs(p.rent_price)}`,
        meta_description: `Yellow and red panelled Rajasthani lehenga for girls with a silver border and red dupatta, for school cultural events. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
      otherSlug: 'yellow-rajasthani-lehenga-fancy-dress',
    },
  },
  {
    keeper: 'doraemon-cartoon',
    other: 'doraemon-fancy-dress',
    differentiate: {
      // Photo: full-body mascot, big Doraemon head, blue suit and blue feet covers.
      // Title carries the rent price (Task 12 step 5 CTR pass).
      keeper: (p) => ({
        name: 'Doraemon Mascot Costume (Full Body)',
        seo_title: `Doraemon Mascot Costume (Full Body) – Rent ${rs(p.rent_price)}`,
        meta_description: `Full-body Doraemon mascot costume with a big character head, blue suit and feet covers for Children's Day and events. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
      // Photo: child in a blue Doraemon jumpsuit with face hood, white belly and red collar.
      other: (p) => ({
        name: 'Doraemon Fancy Dress for Kids',
        seo_title: `Doraemon Costume for Kids – Rent ${rs(p.rent_price)}`,
        meta_description: `Blue Doraemon jumpsuit for kids 3-9 yrs with a Doraemon face hood, white belly and red collar, for Children's Day. Buy ${rs(p.price)} or rent ${rs(p.rent_price)}, Delhi NCR.`,
      }),
    },
  },
]

/** Typo slugs to rename. `name` fixes the same typo in the page <h1> (only if the name is still `fromName`). */
const RENAMES: { from: string; to: string; fromName?: string; name?: string }[] = [
  { from: 'kerala-fancy-dres', to: 'kerala-fancy-dress', fromName: 'Kerala Fancy Dres', name: 'Kerala Fancy Dress' },
  { from: 'pahdi-boy-fancy-dress', to: 'pahadi-boy-fancy-dress', fromName: 'Pahdi Boy Fancy Dress', name: 'Pahadi Boy Fancy Dress' },
  { from: 'purple-frock-fancys-dress', to: 'purple-frock-fancy-dress' },
  { from: 'water-melon-fancy-dress', to: 'watermelon-fancy-dress', fromName: 'Water Melon Fancy Dress', name: 'Watermelon Fancy Dress' },
  {
    from: 'subhash-chander-bose-fancy-dress',
    to: 'subhash-chandra-bose-fancy-dress',
    fromName: 'Subhash Chander Bose Fancy Dress',
    name: 'Subhash Chandra Bose Fancy Dress',
  },
  {
    from: 'ballroom-dance-fancy-dress-costume-2',
    to: 'ballroom-dance-fancy-dress-costume',
    fromName: 'Ballroom Dance Fancy Dress Costume 2',
    name: 'Ballroom Dance Fancy Dress Costume',
  },
]

/** Left to 404: never real products. */
const TEST_SLUGS = new Set(['test2', 'test3', 'sample-2', 'nmnm', 'german2'])

/**
 * Soft-deleted products the owner will re-upload as new (Task 19 / 19a).
 * Until then they go to the best live category; Task 19a repoints them.
 */
const PENDING_REUPLOAD: Record<string, { interim: string; expected: string }> = {
  'indian-pilot-fancy-dress-costume': { interim: '/category/helper-costumes', expected: 'Indian Pilot Fancy Dress' },
  // A live police costume exists, and police-fancy-dress-costumes-kids already redirects to it.
  'children-police-fancy-dress-costume': { interim: '/products/police-fancy-dress', expected: 'Police Fancy Dress for Kids' },
  'indian-army-fancy-dress-costume': { interim: '/category/republic-day-dress', expected: 'Indian Army Fancy Dress' },
  'indian-navy-fancy-dress-costume': { interim: '/category/republic-day-dress', expected: 'Indian Navy Fancy Dress' },
  'bhagat-singh-fancy-dress-costume': { interim: '/category/leaders-freedom-fighters', expected: 'Bhagat Singh Fancy Dress' },
  'goddess-saraswati-mata-fancy-dress-costume': { interim: '/category/indian-mythology-costumes', expected: 'Saraswati Mata Fancy Dress' },
  'mahishasur-fancy-dress-costume': { interim: '/category/indian-mythology-costumes', expected: 'Mahishasur Fancy Dress' },
  'shivaji-maharaj-fancy-dress-costume': { interim: '/category/leaders-freedom-fighters', expected: 'Shivaji Maharaj Fancy Dress' },
  'ghoomar-lehenga-fancy-dress': { interim: '/category/rajasthani-dress', expected: 'Ghoomar Lehenga Fancy Dress' },
  'garba-dance-fancy-dress-boys-costume': { interim: '/category/garba-dress', expected: 'Garba Dress for Boys (kediyu set)' },
  'garba-dance-fancy-dress-for-boys': { interim: '/category/garba-dress', expected: 'Garba Dress for Boys (kediyu set)' },
  'folk-dance-dress-with-pagri-for-boys-fancy-dress': { interim: '/category/garba-dress', expected: 'Garba Dress for Boys (kediyu set)' },
  'garba-dance-fancy-dress-costume-combo': { interim: '/category/garba-dress', expected: 'Garba Couple Combo Set (boy and girl)' },
  'garba-dance-fancy-dress-costume-combo-set': { interim: '/category/garba-dress', expected: 'Garba Couple Combo Set (boy and girl)' },
  'garba-dance-fancy-dress-costumes': { interim: '/category/garba-dress', expected: 'Garba Dance Fancy Dress' },
  'garba-dance-chaniya-choli-fancy-dress-costume': { interim: '/category/garba-dress', expected: 'Garba Chaniya Choli for Girls' },
  'gujarati-garba-dance-chaniya-choli-for-girls-fancy-dress': { interim: '/category/garba-dress', expected: 'Garba Chaniya Choli for Girls' },
  'gujarati-garba-chaniya-choli-costume-girls-fancy-dress': { interim: '/category/garba-dress', expected: 'Garba Chaniya Choli for Girls' },
  'gujrati-garba-dance-dress-lehenga-fancy-dress': { interim: '/category/garba-dress', expected: 'Gujrati Garba Lehenga for Girls' },
}

/**
 * A dead slug matching one of these goes to that category (if live) rather
 * than its recorded primary category, which is often a catch-all
 * (`costumes`, `dance-dress`) or plainly wrong (cartoons filed under
 * superheroes, chocolate under fruit). First match wins.
 */
const KEYWORD_CATEGORY: [RegExp, string][] = [
  [/minnie|mickey|donald|bheem|shinchan|doraemon|angry-bird|pooh|noddy/, 'cartoon-characters'],
  [/hulk|captain-america|spider|batman|superman/, 'superhero-costumes'],
  [/\b(dog|cat|shark|rabbit|zebra|panda|leopard|monkey|octopus|seahorse|penguin|elephant|frog|snake|lion|tiger)\b/, 'animal-costumes'],
  [/bharatanatyam|bharatnatyam|bhartnatyam/, 'bharatnatyam'],
  [/kathak/, 'kathak-dress'],
  [/odissi|kuchipudi|semi-classical|chhau/, 'classical-dance-dress'],
  [/bhangra/, 'bhangra-dress'],
  [/radha|krishna/, 'janmashtami-dress'],
  [/shiva|saraswati|durga|ganesh/, 'indian-mythology-costumes'],
  [/dairy-milk|popcorn|chocolate/, 'junk-food'],
  [/brinjal|onion|potato/, 'vegetable-costumes'],
  [/\bapple\b/, 'fruit-costumes'],
  [/japanese|kimono|german/, 'world-costumes'],
  [/western|frock|skirt/, 'western-dance-dress'],
]
const GENDER_WORDS = new Set('boy boys girl girls children child women men adult adults'.split(' '))

/**
 * Non-product redirects other tasks asked for. Added only if the destination
 * is live; the source is retired by that task (so it is left out of the live set).
 */
const EXTRA: Entry[] = [
  { source: '/blog/garba-navratri-costume-kids-guide', destination: '/blog/navratri-garba-dandiya-dress-guide', permanent: true },
  { source: '/blog/school-annual-function-fancy-dress-guide', destination: '/blog/fancy-dress-ideas-school-annual-function', permanent: true },
  { source: '/blog/which-classical-dance-costume-for-your-child', destination: '/category/classical-dance-dress', permanent: true },
  { source: '/blog/republic-independence-day-fancy-dress-ideas', destination: '/blog/independence-day-fancy-dress-ideas', permanent: true },
]

/** From app/sitemap.ts staticPages, plus /wholesale/enquiry. "/" is live but never a redirect target. */
const STATIC_PAGES = [
  '/', '/products', '/wholesale', '/rent', '/blog', '/about', '/faq', '/contact', '/privacy-policy', '/returns',
  '/fancy-dress-noida', '/fancy-dress-gurgaon', '/fancy-dress-delhi', '/wholesale/schools', '/wholesale/delhi-market',
  '/wholesale/resellers', '/wholesale/dance-academies', '/wholesale/enquiry', '/compare/local-vs-online',
]

// ---------------------------------------------------------------------------

async function all<T>(table: string, columns = '*'): Promise<T[]> {
  const out: T[] = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await sb.from(table).select(columns).range(i, i + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...(data as T[]))
    if (data!.length < 1000) return out
  }
}

async function sha256(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) return `http-${res.status}:${url}`
  return createHash('sha256').update(Buffer.from(await res.arrayBuffer())).digest('hex')
}

const COLOUR_AND_FILLER = new Set(
  (
    'fancy dress dresses costume costumes for and with in the of a set colour color kids ' +
    'red blue green yellow pink orange white black golden gold silver purple magenta maroon cream ' +
    'multicolour multicolor grey brown navy sky peach'
  ).split(' ')
)
/** Name with colours, "fancy dress costume" filler and digits removed, as a sorted token key. */
export function normaliseName(name: string): string {
  return [
    ...new Set(
      name
        .toLowerCase()
        .replace(/[^a-z ]+/g, ' ')
        .split(/\s+/)
        .filter((t) => t && !COLOUR_AND_FILLER.has(t))
    ),
  ]
    .sort()
    .join(' ')
}

/** /wholesale twin of a retail URL. */
function wholesaleOf(url: string): string | null {
  if (url === '/products') return '/wholesale'
  if (url.startsWith('/products/')) return '/wholesale/' + url.slice('/products/'.length)
  if (url.startsWith('/category/')) return '/wholesale/category/' + url.slice('/category/'.length)
  return null
}

function linkPattern(slug: string) {
  return new RegExp(`(/(?:products|wholesale)/)${slug.replace(/[-]/g, '\\-')}(?![a-z0-9-])`, 'g')
}

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  const products = await all<Product>(
    'products',
    'id, name, slug, category_id, price, rent_price, is_active, deleted_at, created_at, seo_title, meta_description'
  )
  const categories = await all<Category>('categories', 'id, slug, is_active')
  const junction = await all<Junction>('product_categories', 'id, product_id, category_id')
  const images = await all<Image>('product_images', 'product_id, image_url')
  const blogs = await all<Blog>('blog_posts', 'id, slug, content, published_at')

  const bySlug = new Map(products.map((p) => [p.slug, p]))
  const catById = new Map(categories.map((c) => [c.id, c]))
  const isLive = (p: Product) => p.is_active && !p.deleted_at
  const liveProductUrlsAtStart = products.filter(isLive).flatMap((p) => [`/products/${p.slug}`, `/wholesale/${p.slug}`])
  const now = new Date().toISOString()
  const newRedirects: Entry[] = []
  const redirectPair = (from: string, to: string) => {
    newRedirects.push({ source: `/products/${from}`, destination: `/products/${to}`, permanent: true })
    newRedirects.push({ source: `/wholesale/${from}`, destination: `/wholesale/${to}`, permanent: true })
  }
  /** old slug -> new slug, for blog links */
  const slugMoves = new Map<string, string>()
  const outcomes: string[] = []

  // ---- 1. Duplicate pairs --------------------------------------------------
  console.log('## Duplicate pairs')
  for (const pair of PAIRS) {
    const keeper = bySlug.get(pair.keeper)
    const other = bySlug.get(pair.other) ?? (pair.differentiate?.otherSlug ? bySlug.get(pair.differentiate.otherSlug) : undefined)
    if (!keeper || !isLive(keeper)) throw new Error(`keeper ${pair.keeper} is not live`)
    if (!other) throw new Error(`${pair.other} not found`)
    if (!isLive(other)) {
      console.log(`   ${pair.other}: already soft-deleted (merged earlier)`)
      if (other.slug === pair.other) redirectPair(pair.other, pair.keeper)
      outcomes.push(`${pair.keeper} <- ${pair.other}: merged (earlier run)`)
      continue
    }

    const hashesOf = async (p: Product) =>
      Promise.all(images.filter((i) => i.product_id === p.id).map((i) => sha256(i.image_url)))
    const [hk, ho] = await Promise.all([hashesOf(keeper), hashesOf(other)])
    const sameImages = hk.length > 0 && hk.length === ho.length && ho.every((h) => hk.includes(h))
    console.log(`\n-- ${pair.keeper} (${hk.length} img) vs ${other.slug} (${ho.length} img): ${sameImages ? 'SAME images' : 'different images'}`)

    if (sameImages || pair.forceMerge) {
      if (!sameImages) console.log(`   merging anyway: ${pair.forceMerge}`)
      const keeperCats = new Set(junction.filter((j) => j.product_id === keeper.id).map((j) => j.category_id))
      const loserRows = junction.filter((j) => j.product_id === other.id)
      const toMove = [...new Set([...loserRows.map((j) => j.category_id), ...(other.category_id ? [other.category_id] : [])])].filter(
        (c) => !keeperCats.has(c)
      )
      console.log(`   soft-delete ${other.slug}; move categories onto keeper: ${toMove.map((c) => catById.get(c)?.slug).join(', ') || '(none needed)'}`)
      if (APPLY) {
        if (toMove.length) {
          const { error } = await sb.from('product_categories').insert(toMove.map((category_id) => ({ product_id: keeper.id, category_id })))
          if (error) throw error
        }
        if (loserRows.length) {
          const { error } = await sb.from('product_categories').delete().in('id', loserRows.map((j) => j.id))
          if (error) throw error
        }
        const { error } = await sb.from('products').update({ deleted_at: now }).eq('id', other.id).is('deleted_at', null)
        if (error) throw error
      }
      other.deleted_at = now
      for (const c of toMove) junction.push({ id: 'new', product_id: keeper.id, category_id: c })
      for (const j of loserRows) junction.splice(junction.indexOf(j), 1)
      redirectPair(other.slug, keeper.slug)
      slugMoves.set(other.slug, keeper.slug)
      outcomes.push(`${pair.keeper} <- ${other.slug}: MERGED${sameImages ? ' (identical images)' : ` (${pair.forceMerge})`}`)
      continue
    }

    if (!pair.differentiate) throw new Error(`${pair.keeper}: images differ but no differentiate copy configured`)
    for (const [p, make] of [
      [keeper, pair.differentiate.keeper],
      [other, pair.differentiate.other],
    ] as const) {
      const copy = make(p)
      const problems = checkCopy({ seoTitle: copy.seo_title, metaDescription: copy.meta_description })
      if (problems.length) throw new Error(`${p.slug}: ${problems.join('; ')}`)
      const changed = (['name', 'seo_title', 'meta_description'] as const).filter((k) => p[k] !== copy[k])
      console.log(`   ${p.slug}${changed.length ? '' : ' (already set)'}`)
      for (const k of changed) console.log(`     ${k}: ${JSON.stringify(p[k])}\n       -> ${JSON.stringify(copy[k])} (${copy[k].length})`)
      if (APPLY && changed.length) {
        const { error } = await sb.from('products').update(Object.fromEntries(changed.map((k) => [k, copy[k]]))).eq('id', p.id)
        if (error) throw error
      }
      Object.assign(p, copy)
    }
    const otherSlug = pair.differentiate.otherSlug
    if (otherSlug && other.slug !== otherSlug) {
      if (bySlug.has(otherSlug)) throw new Error(`slug ${otherSlug} is taken`)
      RENAMES.push({ from: other.slug, to: otherSlug })
    } else if (otherSlug) {
      redirectPair(pair.other, otherSlug)
      slugMoves.set(pair.other, otherSlug)
    }
    outcomes.push(`${pair.keeper} vs ${pair.other}: DIFFERENTIATED -> "${pair.differentiate.keeper(keeper).name}" / "${pair.differentiate.other(other).name}"`)
  }

  // ---- 2. Slug renames -----------------------------------------------------
  console.log('\n## Slug renames')
  for (const r of RENAMES) {
    const p = bySlug.get(r.from)
    const already = bySlug.get(r.to)
    if (!p && already && isLive(already)) {
      console.log(`   ${r.from} -> ${r.to}: already renamed`)
      redirectPair(r.from, r.to)
      slugMoves.set(r.from, r.to)
      continue
    }
    if (!p || !isLive(p)) throw new Error(`${r.from} is not a live product`)
    if (already) throw new Error(`${r.to} is taken by another product`)
    const update: Record<string, string> = { slug: r.to }
    if (r.name && p.name === r.fromName) update.name = r.name
    console.log(`   ${r.from} -> ${r.to}${update.name ? `  (name: "${p.name}" -> "${update.name}")` : ''}`)
    const leftover = [p.seo_title, p.meta_description].filter((t) => t && r.fromName && t.includes(r.fromName.split(' ').slice(0, 2).join(' ')))
    if (leftover.length) console.log(`     note: typo still in copy: ${leftover.join(' | ')}`)
    if (APPLY) {
      const { error } = await sb.from('products').update(update).eq('id', p.id).eq('slug', r.from)
      if (error) throw error
    }
    bySlug.delete(r.from)
    p.slug = r.to
    if (update.name) p.name = update.name
    bySlug.set(r.to, p)
    redirectPair(r.from, r.to)
    slugMoves.set(r.from, r.to)
  }

  // ---- 2b. Blog links to moved slugs ---------------------------------------
  // Also links to older retired slugs that redirected to a slug moved above
  // (e.g. subash-… -> subhash-chander-… -> subhash-chandra-…): link the end.
  const existingAtStart: Entry[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
  for (const r of existingAtStart) {
    const s = r.source.match(/^\/products\/([a-z0-9-]+)$/)?.[1]
    const d = r.destination.match(/^\/products\/([a-z0-9-]+)$/)?.[1]
    if (s && d && slugMoves.has(d) && !slugMoves.has(s)) slugMoves.set(s, slugMoves.get(d)!)
  }
  console.log('\n## Blog links')
  for (const b of blogs) {
    if (!b.content) continue
    let content = b.content
    const hits: string[] = []
    for (const [from, to] of slugMoves) {
      const re = linkPattern(from)
      const n = content.match(re)?.length ?? 0
      if (n) {
        content = content.replace(re, `$1${to}`)
        hits.push(`${from} -> ${to} (x${n})`)
      }
    }
    if (!hits.length) continue
    console.log(`   /blog/${b.slug}: ${hits.join(', ')}`)
    if (APPLY) {
      const { error } = await sb.from('blog_posts').update({ content }).eq('id', b.id)
      if (error) throw error
    }
    b.content = content
  }

  // ---- 3. Live URL set (after the changes above) ---------------------------
  const liveProducts = products.filter(isLive)
  const liveIds = new Set(liveProducts.map((p) => p.id))
  const nonEmpty = new Set<string>([
    ...junction.filter((j) => liveIds.has(j.product_id)).map((j) => j.category_id),
    ...liveProducts.map((p) => p.category_id).filter((c): c is string => !!c),
  ])
  const liveCats = categories.filter((c) => c.is_active && nonEmpty.has(c.id))
  const liveCatIds = new Set(liveCats.map((c) => c.id))
  const retiredByOtherTasks = new Set(EXTRA.map((e) => e.source))
  const liveUrls = new Set<string>([
    ...STATIC_PAGES,
    ...liveProducts.flatMap((p) => [`/products/${p.slug}`, `/wholesale/${p.slug}`]),
    ...liveCats.flatMap((c) => [`/category/${c.slug}`, `/wholesale/category/${c.slug}`]),
    ...blogs.filter((b) => b.published_at && !retiredByOtherTasks.has(`/blog/${b.slug}`)).map((b) => `/blog/${b.slug}`),
  ])

  const liveAtStart = new Set([
    ...[...liveUrls].filter((u) => !/^\/(products|wholesale)\/(?!category\/)/.test(u)),
    ...liveProductUrlsAtStart,
  ])

  // ---- 4. Destinations for dead product slugs ------------------------------
  // Name keys map to a product only when exactly one live product has that key
  // (null = ambiguous, e.g. several colour variants): an ambiguous name is
  // better served by its category page than by one arbitrary variant.
  const liveByName = new Map<string, Product | null>()
  /** Same key with gender words dropped. */
  const liveByLooseName = new Map<string, Product | null>()
  const loose = (key: string) => key.split(' ').filter((t) => !GENDER_WORDS.has(t)).join(' ')
  for (const p of liveProducts) {
    const k = normaliseName(p.name)
    if (k) liveByName.set(k, liveByName.has(k) ? null : p)
    const l = loose(k)
    if (l) liveByLooseName.set(l, liveByLooseName.has(l) ? null : p)
  }
  const catBySlug = new Map(liveCats.map((c) => [c.slug, c]))
  const reasons = new Map<string, string>()
  const destFor = (slug: string): string => {
    const p = bySlug.get(slug) ?? products.find((x) => x.slug === slug)
    const reup = PENDING_REUPLOAD[slug]
    if (reup) {
      if (!liveUrls.has(reup.interim)) throw new Error(`interim ${reup.interim} for ${slug} is not live`)
      reasons.set(slug, 'pending re-upload')
      return reup.interim
    }
    if (p) {
      const key = normaliseName(p.name)
      const match = liveByName.has(key) ? liveByName.get(key) : liveByLooseName.get(loose(key))
      if (match) {
        reasons.set(slug, `same name "${match.name}"`)
        return `/products/${match.slug}`
      }
      const rule = KEYWORD_CATEGORY.find(([re, c]) => re.test(slug) && catBySlug.has(c))
      if (rule) {
        reasons.set(slug, 'keyword category')
        return `/category/${rule[1]}`
      }
      const cats = [p.category_id, ...junction.filter((j) => j.product_id === p.id).map((j) => j.category_id)].filter(
        (c): c is string => !!c && liveCatIds.has(c)
      )
      if (cats.length) {
        reasons.set(slug, cats[0] === p.category_id ? 'primary category' : 'other category')
        return `/category/${catById.get(cats[0])!.slug}`
      }
    }
    reasons.set(slug, p ? 'no live category' : 'unknown slug')
    return '/products'
  }

  // ---- 5. Assemble redirects -----------------------------------------------
  const existing: Entry[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
  const newSources = new Set(newRedirects.map((r) => r.source))
  let result: Entry[] = existing.filter((r) => !newSources.has(r.source))
  const replaced = existing.length - result.length

  // Sources that are live pages make the page unreachable: drop them.
  const shadowing = result.filter((r) => liveUrls.has(r.source))
  for (const r of shadowing) console.log(`   dropping redirect from live page: ${r.source} -> ${r.destination}`)
  result = result.filter((r) => !liveUrls.has(r.source))
  result.push(...newRedirects)

  // Dead product slugs with no redirect.
  const covered = new Set(result.map((r) => r.source))
  const added: Entry[] = []
  for (const p of products) {
    if (isLive(p) || TEST_SLUGS.has(p.slug) || covered.has(`/products/${p.slug}`)) continue
    const d = destFor(p.slug)
    added.push({ source: `/products/${p.slug}`, destination: d, permanent: true })
    if (!covered.has(`/wholesale/${p.slug}`)) added.push({ source: `/wholesale/${p.slug}`, destination: wholesaleOf(d)!, permanent: true })
  }
  result.push(...added)
  // A dead product's /wholesale twin can be missing even when its /products redirect exists.
  const covered2 = new Set(result.map((r) => r.source))
  for (const r of [...result]) {
    const w = wholesaleOf(r.source)
    if (r.source.startsWith('/products/') && w && !covered2.has(w)) {
      const wd = wholesaleOf(r.destination)
      if (wd) {
        result.push({ source: w, destination: wd, permanent: true })
        added.push(result[result.length - 1])
      }
    }
  }

  // Existing redirects that ended at a dead product now reach that product's
  // new redirect; flattening points them straight at its destination. Any
  // destination still dead after that gets the dead-slug logic directly.
  let flat = flattenRedirects(result)
  flat = flat.map((r) => {
    if (liveUrls.has(r.destination) || r.destination.startsWith('http')) return r
    const m = r.destination.match(/^\/(products|wholesale)\/([a-z0-9-]+)$/)
    if (!m || m[2] === 'category') return r
    const d = destFor(m[2])
    return { ...r, destination: m[1] === 'wholesale' ? wholesaleOf(d)! : d }
  })
  flat = flattenRedirects(flat)

  const originalDest = new Map(existing.map((r) => [r.source, r.destination]))
  const repairs: string[] = []
  let flattened = 0
  for (const r of flat) {
    const was = originalDest.get(r.source)
    if (!was || was === r.destination) continue
    if (!liveAtStart.has(was)) repairs.push(`${r.source}: ${was} -> ${r.destination}`)
    else flattened++
  }
  const repaired = repairs.length

  for (const e of EXTRA) {
    if (!liveUrls.has(e.destination)) {
      console.log(`   skipping ${e.source}: destination ${e.destination} is not live`)
      continue
    }
    if (!flat.some((r) => r.source === e.source)) flat.push(e)
  }

  // ---- 6. Report and validate ----------------------------------------------
  console.log('\n## New redirects for dead slugs (/products only)')
  for (const r of added.filter((r) => r.source.startsWith('/products/'))) {
    const slug = r.source.slice('/products/'.length)
    const final = flat.find((f) => f.source === r.source)!.destination
    console.log(`   ${slug.padEnd(62)} -> ${final}  [${reasons.get(slug)}]`)
  }
  console.log('\n## Repaired (destination was dead)')
  for (const s of repairs) console.log('   ' + s)
  const byReason: Record<string, number> = {}
  for (const r of reasons.values()) byReason[r.startsWith('same name') ? 'same name' : r] = (byReason[r.startsWith('same name') ? 'same name' : r] ?? 0) + 1

  // Re-upload slugs still on their interim destination (Task 19a removes an
  // entry by repointing its redirect at the new product).
  const finalDest = new Map(flat.map((r) => [r.source, r.destination]))
  const pending = Object.entries(PENDING_REUPLOAD)
    .filter(([slug, { interim }]) => finalDest.get(`/products/${slug}`) === interim)
    .map(([oldSlug, { interim, expected }]) => ({ oldSlug, interimDestination: interim, expectedProduct: expected }))

  const problems = validateRedirects(flat, liveUrls)
  console.log(`
## Summary
   pairs:            ${outcomes.join('\n                     ')}
   existing entries: ${existing.length} (${replaced} replaced by new entries, ${shadowing.length} dropped as shadowing a live page)
   new (merge/rename): ${newRedirects.length}
   new (dead slugs):   ${added.length}  (reasons: ${JSON.stringify(byReason)})
   repaired:           ${repaired}
   flattened:          ${flattened}
   total:              ${flat.length}
   live URLs:          ${liveUrls.size}
   pending re-upload:  ${pending.length}
   validateRedirects:  ${problems.length ? problems.length + ' PROBLEMS' : 'clean'}`)
  if (problems.length) {
    for (const p of problems) console.log('   ✗ ' + p)
    process.exit(1)
  }

  if (APPLY) {
    mkdirSync(resolve(process.cwd(), 'seodata'), { recursive: true })
    writeFileSync(REDIRECTS_PATH, JSON.stringify(flat, null, 2) + '\n')
    writeFileSync(LIVE_URLS_PATH, JSON.stringify([...liveUrls].sort(), null, 2) + '\n')
    writeFileSync(PENDING_PATH, JSON.stringify(pending.sort((a, b) => a.oldSlug.localeCompare(b.oldSlug)), null, 2) + '\n')
    console.log('\n   wrote redirects.json, seodata/live-urls.json, seodata/pending-reupload-redirects.json')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
