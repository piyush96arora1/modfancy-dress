/**
 * Post-upload follow-up for the 4 Nov 2026 admin upload: Santa Claus, reindeer,
 * angel and Kantara mask. All four went live with empty description, meta, SEO
 * title and image alt text.
 *
 * What it does (every check runs before the first write; any failure writes nothing):
 *  - renames santa-clause-fancy-dress -> santa-claus-dress-for-kids (uploaded today,
 *    misspelt; "santa claus dress" is the biggest Christmas query) and adds 308s
 *    from the old /products/ and /wholesale/ URLs;
 *  - fills empty description / meta_description / seo_title (never overwrites);
 *  - fills empty image alt text;
 *  - adds categories (additive only; no category is created).
 *
 * Prices: rent rates are not published (owner decision Aug 2026, reconfirmed
 * 4 Nov 2026). Metas end "Buy ₹<price> or rent in Delhi NCR." with the price read
 * from the live row, the phrase scripts/fix-meta-prices.ts keeps in sync. Santa has
 * no price in the DB, so its meta quotes none ("Buy or rent in Delhi NCR."); when
 * the owner adds the price, rewrite that meta to the priced phrase.
 *
 * This does not use scripts/catalog-followup.ts because that runner's {PRICE_LINE}
 * still prints the rent figure and throws on a product with no buy price.
 *
 * Dry run:  npx tsx scripts/followups/christmas-kantara-upload-2026-11.ts
 * Apply:    npx tsx scripts/followups/christmas-kantara-upload-2026-11.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../../lib/seo/copy-limits'
import { validateRedirects, type Redirect } from '../../lib/seo/redirect-graph'
import { hinglishProblems } from '../lib/seo-copy-run'
import { revalidateSite } from '../lib/revalidate'

config({ path: resolve(process.cwd(), '.env.local'), quiet: true })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const APPLY = process.argv.includes('--apply')
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')
const LIVE_URLS_PATH = resolve(process.cwd(), 'seodata/live-urls.json')
const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'
const META_MAX = 155 // caller's limit, tighter than copy-limits' 160

type Item = {
  from: string
  to?: string
  name?: string
  body: string
  hinglish?: string
  /** Ends in {PRICE}: replaced by "Buy ₹<price> or rent in Delhi NCR." (or "Buy or rent in Delhi NCR." when price is empty). */
  meta: string
  seo_title: string
  alt: Record<string, string>
  addCategories: string[]
}

const ITEMS: Item[] = [
  {
    from: 'santa-clause-fancy-dress',
    to: 'santa-claus-dress-for-kids',
    name: 'Santa Claus Dress for Kids',
    seo_title: 'Santa Claus Dress for Kids - Christmas Fancy Dress',
    meta: 'Santa Claus dress for kids: red suit with white trim, Santa cap, white beard and gift pouch for school Christmas programmes. {PRICE}',
    body:
      'A Santa Claus dress for kids, ready for the school Christmas programme. The set in the photo is a red jacket with a white button placket and white trim at the hem and cuffs, matching red trousers with white cuffs, a pointed red Santa cap with a white band, a white beard with moustache, and a small red pouch on a white cord for toffees or gift cards. The soft red suit is easy for a young child to wear through a whole show. It suits Christmas celebrations at school in the week before 25 December, carol and nativity programmes, a Christmas fancy dress competition or a Secret Santa party, and it works for boys and girls alike. Add black shoes and a sack of gifts to finish the look. Tell us your child\'s age when you book and we will set aside the right size.',
    hinglish: 'Christmas ke liye bachchon ki Santa Claus dress — topi, daadhi aur potli ke saath.',
    alt: {
      '1793800803808-2o3rt2g1dm.jpg':
        'Santa Claus dress for kids — red jacket and trousers with white trim, pointed red Santa cap, white beard and a small red pouch on a cord, worn by a smiling boy with arms open',
    },
    addCategories: ['kids', 'imaginary-character'],
  },
  {
    from: 'reindeer-fancy-dress',
    seo_title: 'Reindeer Costume for Kids - Christmas Fancy Dress',
    meta: 'Reindeer costume for kids: brown plush jumpsuit with antler hood, red Rudolph nose and red scarf for Christmas plays. {PRICE}',
    body:
      'A reindeer fancy dress for kids, the classic partner to Santa Claus at a school Christmas programme. It is a one-piece brown plush jumpsuit with a cream belly patch and elastic cuffs at the wrists and ankles. The hood makes the reindeer\'s face: dark brown antlers, cream-lined ears, cartoon eyes and a round red nose, so your child becomes Rudolph the moment the hood goes up, while their own face stays open and easy to see on stage. A red scarf with white pom-poms ties at the neck. It suits Christmas plays and carol programmes, a Santa-and-reindeer pair with a sibling or classmate, and animal-theme fancy dress competitions through the winter. Tell us your child\'s age when you book and we will set aside the right size.',
    hinglish: 'Christmas ke liye reindeer ki dress — Santa ke saath jodi banane ke liye.',
    alt: {
      'reindeer-fancy-dress.jpg':
        'Reindeer fancy dress for kids — brown plush jumpsuit with cream belly, hood with antlers, ears and a red nose, and a red pom-pom scarf, worn by a smiling boy',
    },
    addCategories: ['animal-costumes', 'kids'],
  },
  {
    from: 'angel-fancy-dress',
    seo_title: 'Angel Dress for Girls - White Fairy Fancy Dress',
    meta: 'Angel dress for girls: white lace frock with sequin tiers, pink butterfly wings, wand and headband for fancy dress. {PRICE}',
    body:
      'An angel fancy dress for girls in white and pink. The white frock has a ruffled lace collar, short puff sleeves, a buttoned front, a satin bow belt and a layered lace skirt edged with silver sequins. The set in the photo adds pink butterfly wings, a headband with two pink butterflies on springs and a matching butterfly wand, so the same dress also works as a fairy or butterfly costume. It suits an angel or fairy round in a fancy dress competition, a school Christmas programme, annual-day dances and birthday parties. If your daughter is speaking angel dialogues on stage, the wand gives her something to hold and wave as she talks. Tell us your child\'s age when you book and we will set aside the right size.',
    hinglish: 'Pari ya angel ki dress chhoti bachchiyon ke liye — pankh aur jaadu ki chhadi ke saath.',
    alt: {
      'angel-fancy-dress.jpg':
        'White angel fancy dress for girls — layered lace frock with silver sequin trim and bow belt, pink butterfly wings, butterfly headband and wand, worn by a smiling girl',
    },
    addCategories: ['imaginary-character', 'kids'],
  },
  {
    from: 'kantara-face-mask',
    seo_title: 'Kantara Mask for Fancy Dress - Daiva Face Mask',
    meta: 'Kantara face mask in the daiva style: red-orange face in green, orange and gold arches for fancy dress and stage dance. {PRICE}',
    body:
      'A Kantara face mask inspired by the daiva look from the 2022 Kannada film Kantara and the Bhoota Kola tradition of coastal Karnataka. The face is painted a glossy red-orange with bold black-lined eyes and fine painted lines across the forehead and cheeks. Around it rise layered arches: orange faux fur, a maroon band dotted in yellow and set with gold sequin flowers, and an outer green ridged arch fringed with yellow fur. Two maroon side panels with orange fur edging carry round cream ear discs. It is a striking centrepiece for a Kantara fancy dress, a Karnataka or South Indian folk theme at school, a states day or a stage dance, worn with a dhoti and body paint. Ask us on WhatsApp for more photos and the fit before you book.',
    hinglish: 'Kantara film wala daiva mask — school ke folk theme aur stage dance ke liye.',
    alt: {
      'kantara-face-mask.jpg':
        'Kantara daiva face mask — glossy red-orange face with black-lined eyes, framed by orange fur, a dotted maroon and gold band, a green arch with yellow fur and round side ear discs',
    },
    addCategories: ['indian-mythology-costumes'],
  },
]

type Row = {
  id: string
  slug: string
  name: string
  price: number | null
  rent_price: number | null
  description: string | null
  meta_description: string | null
  seo_title: string | null
  product_images: { id: string; image_url: string; alt_text: string | null }[]
  product_categories: { category_id: string }[]
}

const basename = (u: string) => u.split('?')[0].split('/').pop()!
const blank = (v: string | null | undefined) => !v || !v.trim()
const words = (s: string) => s.trim().split(/\s+/).length
const priceLine = (row: Row) =>
  Number(row.price) > 0 ? `Buy ₹${Math.round(Number(row.price))} or rent in Delhi NCR.` : 'Buy or rent in Delhi NCR.'
const bodyOf = (it: Item) => [it.body.trim(), it.hinglish?.trim(), STORE_TAIL].filter(Boolean).join('\n')
/** Any rent or deposit figure (rent rates are never published). */
const RENT_FIGURE = /(rent|deposit)[^.₹]{0,25}₹\s?\d|₹\s?\d[\d,]*\s?(\/event|per event)/i

async function main() {
  console.log(APPLY ? '=== APPLYING: 4 Nov 2026 upload ===' : '=== DRY RUN (pass --apply to write): 4 Nov 2026 upload ===')

  const { data: cats, error: ce } = await sb.from('categories').select('id, slug').eq('is_active', true)
  if (ce) throw ce
  const catId = new Map(cats!.map((c) => [c.slug as string, c.id as string]))

  const problems: string[] = []
  const rows = new Map<string, Row>()
  const metas = new Map<string, string>()

  for (const it of ITEMS) {
    const slugs = [it.from, it.to].filter(Boolean) as string[]
    const { data, error } = await sb
      .from('products')
      .select('id, slug, name, price, rent_price, description, meta_description, seo_title, product_images(id, image_url, alt_text), product_categories(category_id)')
      .in('slug', slugs)
      .is('deleted_at', null)
    if (error) throw error
    if (data!.length !== 1) {
      problems.push(`${it.from}: expected 1 live row for ${slugs.join(' / ')}, found ${data!.length}`)
      continue
    }
    const row = data![0] as Row
    rows.set(it.from, row)

    if (it.to && row.slug === it.from) {
      const { data: clash } = await sb.from('products').select('id, name').eq('slug', it.to).maybeSingle()
      if (clash) problems.push(`${it.from}: target slug ${it.to} is taken by "${clash.name}"`)
    }
    if (Number(row.price) > 0 && Number(row.rent_price) > Number(row.price))
      problems.push(`${it.from}: rent is above buy — owner must fix the price first`)

    const meta = it.meta.replace('{PRICE}', priceLine(row))
    metas.set(it.from, meta)
    if (/\{[A-Z_]+\}/.test(meta)) problems.push(`${it.from}: unknown token left in meta`)
    if (meta.length > META_MAX) problems.push(`${it.from}: meta ${meta.length} chars (max ${META_MAX})`)
    for (const v of checkCopy({ seoTitle: it.seo_title, metaDescription: meta })) problems.push(`${it.from}: ${v}`)
    for (const h of hinglishProblems([it.body, it.hinglish].filter(Boolean).join('\n'))) problems.push(`${it.from}: ${h}`)
    const n = words(it.body)
    if (n < 90 || n > 160) problems.push(`${it.from}: body is ${n} words (90–160)`)
    for (const [f, v] of Object.entries({ body: bodyOf(it), meta, seo_title: it.seo_title, ...it.alt }))
      if (RENT_FIGURE.test(v)) problems.push(`${it.from}: ${f} quotes a rent/deposit figure`)
    if (/\]\(|\*\*|^#/m.test(bodyOf(it))) problems.push(`${it.from}: body has markdown (renders as plain text)`)

    for (const img of row.product_images)
      if (blank(img.alt_text) && !it.alt[basename(img.image_url)]) problems.push(`${it.from}: no alt text for ${basename(img.image_url)}`)
    for (const c of it.addCategories) if (!catId.has(c)) problems.push(`${it.from}: category ${c} not active`)
  }

  // Redirects for the rename, validated before any write.
  const redirects: Redirect[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
  const live = new Set<string>(JSON.parse(readFileSync(LIVE_URLS_PATH, 'utf8')))
  const redirectLog: string[] = []
  for (const it of ITEMS) {
    const slug = it.to ?? it.from
    for (const prefix of ['/products/', '/wholesale/']) live.add(prefix + slug)
    if (!it.to) continue
    for (const prefix of ['/products/', '/wholesale/']) {
      const source = prefix + it.from
      const destination = prefix + it.to
      live.delete(source)
      const i = redirects.findIndex((r) => r.source === source)
      if (i >= 0 && redirects[i].destination === destination) continue
      if (i >= 0) redirects[i] = { ...redirects[i], destination }
      else redirects.push({ source, destination, permanent: true })
      redirectLog.push(`   + ${source} -> ${destination}`)
    }
  }
  for (const i of validateRedirects(redirects, live)) problems.push(`redirects: ${i}`)

  if (problems.length) {
    console.error('Pre-checks failed, nothing written:\n  ' + problems.join('\n  '))
    process.exit(1)
  }

  for (const it of ITEMS) {
    const row = rows.get(it.from)!
    const slug = it.to ?? it.from
    console.log(`\n── ${slug}${it.to && row.slug !== it.to ? `  (was ${it.from})` : ''}   price: ${row.price ?? 'NONE'}`)

    const patch: Record<string, string> = {}
    if (it.to && row.slug !== it.to) patch.slug = it.to
    if (it.name && row.name !== it.name) patch.name = it.name
    if (blank(row.description)) patch.description = bodyOf(it)
    if (blank(row.meta_description)) patch.meta_description = metas.get(it.from)!
    if (blank(row.seo_title)) patch.seo_title = it.seo_title
    for (const [k, v] of Object.entries(patch)) console.log(`   ${k} (${v.length}${k === 'description' ? `, ${words(it.body)} words` : ''}): ${v}`)
    if (APPLY && Object.keys(patch).length) {
      const { error } = await sb.from('products').update(patch).eq('id', row.id)
      if (error) throw new Error(`${slug}: ${error.message}`)
    }

    for (const img of row.product_images) {
      if (!blank(img.alt_text)) continue
      const alt = it.alt[basename(img.image_url)]
      console.log(`   alt[${basename(img.image_url)}]: ${alt}`)
      if (APPLY) {
        const { error } = await sb.from('product_images').update({ alt_text: alt }).eq('id', img.id)
        if (error) throw new Error(`${slug} alt: ${error.message}`)
      }
    }

    const have = new Set(row.product_categories.map((c) => c.category_id))
    for (const c of it.addCategories) {
      if (have.has(catId.get(c)!)) continue
      console.log(`   + category ${c}`)
      if (APPLY) {
        const { error } = await sb.from('product_categories').insert({ product_id: row.id, category_id: catId.get(c)! })
        if (error) throw new Error(`${slug} category ${c}: ${error.message}`)
      }
    }
  }

  console.log('\n=== REDIRECTS ===')
  redirectLog.forEach((l) => console.log(l))
  if (APPLY) {
    writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 2) + '\n')
    writeFileSync(LIVE_URLS_PATH, JSON.stringify([...live].sort(), null, 2) + '\n')
    console.log('   wrote redirects.json and seodata/live-urls.json')
  }
}

main()
  .then(() => (APPLY ? revalidateSite('catalog') : undefined))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
