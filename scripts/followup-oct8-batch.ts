/**
 * Follow-up for the 5 Oct 2026 upload: three products added through the admin panel with
 * no description, meta_description, seo_title or alt text.
 *
 *   - "Manthra Fancy Dress": the photo is Manthara, Kaikeyi's hunchbacked maid, played by a
 *     girl in a grey bun wig with a walking stick, over a black ribbon-striped lehenga. Renamed
 *     to the standard spelling; "manthra" stays in the body because Google autocomplete
 *     offers both ("manthara costume", "manthra costume", "manthra fancy dress").
 *   - "Raja Dashrath Fancy Dress": the slug already matches "raja dashrath costume" and
 *     "dashrath costume for kids" (autocomplete, hl=en gl=in, 8 Oct 2026), so it stays.
 *   - "Dandiya Lehnga": a mustard kalamkari-style lehenga with peacock print, sage green
 *     dupatta and tassels. Renamed so the name says what it is; targets "dandiya lehenga
 *     for women" and "peacock print lehenga" (both autocomplete completions).
 *
 * Manthara and Dashrath were filed only under festival-costumes, so they join the Ramleela
 * and mythology categories while Ramleela season (Dussehra 20 Oct) is on.
 *
 * Same phases as scripts/followup-harry-potter.ts: rename slug + name, fill empty copy only,
 * alt text where empty, missing categories, and a 308 from the upload slug in redirects.json.
 *
 * Dry run:  npx tsx scripts/followup-oct8-batch.ts
 * Apply:    npx tsx scripts/followup-oct8-batch.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'
import { validateRedirects, type Redirect } from '../lib/seo/redirect-graph'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')
const LIVE_URLS_PATH = resolve(process.cwd(), 'seodata/live-urls.json')
const PENDING_PATH = resolve(process.cwd(), 'seodata/pending-reupload-redirects.json')

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

type Prices = { buy: number | null; rent: number | null }

type Item = {
  /** Slug as uploaded. */
  from: string
  /** New slug and name, when the upload name did not describe the product. */
  to?: string
  name?: string
  size?: string
  body: string
  /** At most one Roman-script Hinglish line, placed last before the store line. */
  hinglish?: string
  meta: (p: Prices) => string
  seo_title: string
  /** Alt text by image filename (basename of image_url). */
  alt: Record<string, string>
  addCategories?: string[]
  /** Soft-deleted product URLs this one replaces. */
  replaces?: string[]
}

const buyRent = ({ buy, rent }: Prices) => `Buy ₹${buy} or rent ₹${rent} in Delhi NCR.`

const ITEMS: Item[] = [
  {
    from: 'manthra-fancy-dress',
    to: 'manthara-fancy-dress',
    name: 'Manthara Fancy Dress',
    body:
      'A Manthara fancy dress for Ramleela and school Ramayan plays: the scheming old maid of Queen Kaikeyi, the character who sets Ram\'s vanvas in motion. The set is a black lehenga banded in red, orange, yellow and blue ribbon with silver criss-cross trim, and a short black blouse with a silver yoke and a red zigzag waistband. In the photo it is finished with a grey bun wig, a long pearl mala and a wooden walking stick, so a child can play the bent, grumbling Manthara (also spelt Manthra) that every audience recognises. It is a strong character role for a girl who wants something other than Sita, and it suits Dussehra stage plays and mythology fancy dress competitions alike. Tell us your child\'s age when you book and we will set aside the right size.',
    hinglish: 'Ramleela ke liye Manthara ki dress — kubdi daasi ka role, lathi aur safed baalon ke saath.',
    meta: (p) =>
      `Manthara fancy dress for Ramleela — black ribbon-striped lehenga and blouse for Kaikeyi's old maid. ${buyRent(p)}`,
    seo_title: 'Manthara Fancy Dress for Ramleela - Kids Costume',
    alt: {
      'manthra-fancy-dress.jpg':
        'Manthara fancy dress — black lehenga with red, yellow and blue ribbon stripes, shown flat and on a girl with a grey wig and walking stick',
    },
    addCategories: ['ramleela-costumes', 'indian-mythology-costumes'],
  },
  {
    from: 'raja-dashrath-fancy-dress',
    body:
      'A Raja Dashrath costume for kids, made for the Ayodhya court scenes of the Ramleela. The king wears a cream and gold armour top worked with blue paisley stones, red beads and gold fringe at the shoulders, over rani pink bandhani sleeves and a gold waist belt. Pink dhoti pants with gold borders and a tall gold mukut with red and white stones complete the royal look, and in the photo he carries a gold sword and a moustache. It is the right dress for the scenes where Dashrath crowns Ram, grants Kaikeyi her boons and sends his son to the forest, and it works for any Indian king role in a school play or fancy dress competition. Tell us your child\'s age when you book and we will set aside the right size.',
    hinglish: 'Raja Dashrath ki dress bachchon ke liye — mukut, kavach aur dhoti, Ramleela ke darbar ke liye.',
    meta: (p) =>
      `Raja Dashrath costume for kids — cream and gold armour, pink dhoti and gold mukut for Ramleela. ${buyRent(p)}`,
    seo_title: 'Raja Dashrath Costume for Kids - Ramleela Dress',
    alt: {
      'raja-dashrath-fancy-dress.jpg':
        'Raja Dashrath costume for kids — cream and gold armour, pink bandhani sleeves, pink dhoti and gold mukut, shown flat and on a boy holding a sword',
    },
    addCategories: ['ramleela-costumes', 'indian-mythology-costumes'],
  },
  {
    from: 'dandiya-lehnga',
    to: 'mustard-peacock-print-dandiya-lehenga',
    name: 'Mustard Peacock Print Dandiya Lehenga',
    size: 'Adult',
    body:
      'A mustard yellow dandiya lehenga for women in a kalamkari-style print: peacocks, flowering vines and birds cover the full flared skirt, which ends in a broad border of sage green medallions, maroon zigzag bands and a black hem. The sleeveless choli carries the same print with a bordered neckline, and the sage green dupatta is printed with florals and peacocks of its own, edged in maroon and finished with green tassels. Earthy rather than neon, it stands out on a dandiya night full of red and pink, and the flare is wide enough to turn well in garba. Sized for women and older teens; tell us your measurements when you book and we will set one aside.',
    hinglish: 'Peacock print wala dandiya lehenga — mustard aur green, navratri garba night ke liye.',
    meta: (p) =>
      `Mustard peacock print dandiya lehenga for women with sage green dupatta and tassels. ${buyRent(p)}`,
    seo_title: 'Mustard Peacock Print Dandiya Lehenga for Women',
    alt: {
      '1791221744520-1svmsprp5y3.jpg':
        'Mustard peacock print dandiya lehenga for women with sleeveless choli and sage green tasselled dupatta',
    },
  },
]


type Row = {
  id: string
  slug: string
  name: string
  price: number | null
  rent_price: number | null
  size: string | null
  description: string | null
  meta_description: string | null
  seo_title: string | null
  deleted_at: string | null
  product_images: { id: string; image_url: string; alt_text: string | null }[]
  product_categories: { category_id: string }[]
}

const basename = (u: string) => u.split('?')[0].split('/').pop()!

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  const { data: cats, error: ce } = await sb.from('categories').select('id, slug').eq('is_active', true)
  if (ce) throw ce
  const catId = new Map(cats!.map((c) => [c.slug, c.id as string]))

  // ---- Load and pre-check everything before the first write ----
  const problems: string[] = []
  const rows = new Map<string, Row>()
  for (const it of ITEMS) {
    const slugs = [it.from, it.to].filter(Boolean) as string[]
    const { data, error } = await sb
      .from('products')
      .select('id, slug, name, price, rent_price, size, description, meta_description, seo_title, deleted_at, product_images(id, image_url, alt_text), product_categories(category_id)')
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
    const meta = it.meta({ buy: row.price, rent: row.rent_price })
    if (meta.includes('null') || meta.includes('undefined')) problems.push(`${it.from}: price missing in meta`)
    for (const v of checkCopy({ seoTitle: it.seo_title, metaDescription: meta })) problems.push(`${it.from}: ${v}`)
    for (const img of row.product_images) {
      if (!img.alt_text && !it.alt[basename(img.image_url)]) problems.push(`${it.from}: no alt text for ${basename(img.image_url)}`)
    }
    for (const c of it.addCategories ?? []) if (!catId.has(c)) problems.push(`${it.from}: category ${c} not active`)
  }
  if (problems.length) {
    console.error('❌ Pre-checks failed, nothing written:\n  ' + problems.join('\n  '))
    process.exit(1)
  }

  // ---- Phases 1–4, per product ----
  for (const it of ITEMS) {
    const row = rows.get(it.from)!
    const slug = it.to ?? it.from
    console.log(`\n── ${slug}${it.to && row.slug !== it.to ? `  (was ${it.from})` : ''}`)

    const patch: Record<string, string> = {}
    if (it.to && row.slug !== it.to) patch.slug = it.to
    if (it.name && row.name !== it.name) patch.name = it.name
    if (it.size && !row.size) patch.size = it.size
    if (!row.description) patch.description = [it.body, it.hinglish, it.body.includes(STORE_TAIL) ? '' : STORE_TAIL].filter(Boolean).join('\n')
    if (!row.meta_description) patch.meta_description = it.meta({ buy: row.price, rent: row.rent_price })
    if (!row.seo_title) patch.seo_title = it.seo_title

    for (const [k, v] of Object.entries(patch)) {
      const old = (row as unknown as Record<string, unknown>)[k]
      console.log(`   ${k}: ${old ? `${String(old).slice(0, 40)} -> ` : ''}${v.length > 110 ? v.slice(0, 110) + '…' : v}`)
    }
    if (APPLY && Object.keys(patch).length) {
      const { error } = await sb.from('products').update(patch).eq('id', row.id)
      if (error) throw new Error(`${slug}: ${error.message}`)
    }

    for (const img of row.product_images) {
      if (img.alt_text) continue
      const alt = it.alt[basename(img.image_url)]
      console.log(`   alt[${basename(img.image_url)}]: ${alt}`)
      if (APPLY) {
        const { error } = await sb.from('product_images').update({ alt_text: alt }).eq('id', img.id)
        if (error) throw new Error(`${slug} alt: ${error.message}`)
      }
    }

    const have = new Set(row.product_categories.map((c) => c.category_id))
    for (const c of it.addCategories ?? []) {
      if (have.has(catId.get(c)!)) continue
      console.log(`   + category ${c}`)
      if (APPLY) {
        const { error } = await sb.from('product_categories').insert({ product_id: row.id, category_id: catId.get(c)! })
        if (error) throw new Error(`${slug} category ${c}: ${error.message}`)
      }
    }
  }

  // ---- Phase 5: redirects ----
  console.log('\n=== REDIRECTS ===')
  const redirects: Redirect[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
  const live = new Set<string>(JSON.parse(readFileSync(LIVE_URLS_PATH, 'utf8')))

  const upsert = (source: string, destination: string) => {
    const i = redirects.findIndex((r) => r.source === source)
    if (i >= 0) {
      if (redirects[i].destination === destination) return
      console.log(`   ~ ${source}: ${redirects[i].destination} -> ${destination}`)
      redirects[i] = { ...redirects[i], destination }
    } else {
      console.log(`   + ${source} -> ${destination}`)
      redirects.push({ source, destination, permanent: true })
    }
  }

  const resolved = new Set<string>()
  for (const it of ITEMS) {
    const slug = it.to ?? it.from
    for (const prefix of ['/products/', '/wholesale/']) live.add(prefix + slug)
    const olds = [...(it.replaces ?? []), ...(it.to ? [it.from] : [])]
    for (const old of olds) {
      for (const prefix of ['/products/', '/wholesale/']) {
        live.delete(prefix + old)
        upsert(prefix + old, prefix + slug)
      }
      resolved.add(old)
    }
  }

  const issues = validateRedirects(redirects, live)
  if (issues.length) {
    console.error('❌ Redirect graph problems, not writing redirects:\n  ' + issues.join('\n  '))
    process.exit(1)
  }

  const pending: { oldSlug: string }[] = JSON.parse(readFileSync(PENDING_PATH, 'utf8'))
  const stillPending = pending.filter((p) => !resolved.has(p.oldSlug))
  console.log(`   pending re-upload redirects: ${pending.length} -> ${stillPending.length}`)

  if (APPLY) {
    writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 2) + '\n')
    writeFileSync(LIVE_URLS_PATH, JSON.stringify([...live].sort(), null, 2) + '\n')
    writeFileSync(PENDING_PATH, JSON.stringify(stillPending, null, 2) + '\n')
    console.log('   wrote redirects.json, seodata/live-urls.json, seodata/pending-reupload-redirects.json')
  }

}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
