/**
 * Ramleela/Dussehra push, copy gaps, orphans and broken images (festival-season
 * plan, Task 4). Ramleela runs 11–20 Oct 2026 and Dussehra is 20 Oct.
 *
 * Phase 1  Copy for `krishna-fancy-dress` and `radha-rani-fancy-dress` (24 Aug
 *          batch, no description/meta/title). They are a matching adult pair,
 *          ₹3500 each. Copy is written from the photos: one styled shot and
 *          one flat-lay each. The styled Krishna shot adds a mukut, flute and
 *          jewellery that are not in the flat-lay, so the copy doesn't promise them.
 *          Only empty fields are written.
 * Phase 2  Orphans. Attach a primary category where it is NULL, and add any
 *          missing product_categories rows. `krishna-fancy-dress-costume`'s primary
 *          (mythological-characters-costume) is inactive, so it moves to
 *          indian-mythology-costumes. `odisi-fancy-dress` is skipped because Task 5
 *          merges it.
 * Phase 3  Overwrite `ramleela-costumes` category copy.
 * Phase 4  Broken images. A product_images row whose stored file is an HTML page
 *          (magic bytes `<!DOC` / `<html`), not an image, is deleted. The table has
 *          no deleted_at column. The storage object is left in place. A product left
 *          with no images is set is_active = false and reported for the owner's
 *          photo list. Alt text is left to the Task 6 backfill.
 * Phase 5  Publish the new post `dussehra-ramleela-costume-ideas` from
 *          scripts/content/dussehra-ramleela-costume-ideas.md. It is only inserted
 *          when absent, and an existing post is never overwritten.
 *
 * Prices come from the live catalog at run time; titles and metas pass checkCopy.
 *
 * Dry run:  npx tsx scripts/fix-sep-batch-and-orphans.ts
 * Apply:    npx tsx scripts/fix-sep-batch-and-orphans.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'
import { loadCatalog, fillTokens, checkLinks, wordCount } from './lib/seo-copy-helpers'

config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const APPLY = process.argv.includes('--apply')

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

const PRODUCT_COPY = [
  {
    slug: 'krishna-fancy-dress',
    seo_title: 'Krishna Costume for Adults - Velvet Radha Krishna Set',
    meta_description:
      'Krishna costume for adults: maroon velvet kurta, yellow sequin net sleeves and yellow dhoti, made to pair with our Radha. Buy ₹{BUY:krishna-fancy-dress} or rent ₹{RENT:krishna-fancy-dress}, Delhi NCR.',
    description: [
      'An adult Krishna costume made as one half of a matching Radha Krishna pair. The kurta is deep maroon velvet scattered with gold sequin work, with long sleeves in yellow sequinned net striped in white thread, finished with maroon and gold cuffs. At the waist sits a two-tier frill in yellow net and maroon velvet, edged in green and gold lace. Below it is a full yellow dhoti with the same green-and-gold border running down the front pleat and around the hem.',
      'This is the most elaborate Krishna we stock and the one for grown-up roles: a Janmashtami jhanki, a Raas Leela or Krishna Leela stage act, a temple programme, or a couple entry alongside our Radha Rani costume, which is cut in exactly the same colours. The styled photo adds a peacock-feather mukut, a flute and jewellery. Ask on WhatsApp which accessories we can add. Sized for adults. WhatsApp us to confirm the fit before you come in.',
      'Adult Krishna ki dress — Radha ke saath couple jhanki ke liye.',
      STORE_TAIL,
    ].join('\n'),
  },
  {
    slug: 'radha-rani-fancy-dress',
    seo_title: 'Radha Rani Costume for Adults - Lehenga Choli Set',
    meta_description:
      'Radha costume for adults: yellow sequin net lehenga, maroon velvet choli and dupatta, matching our Krishna set. Buy ₹{BUY:radha-rani-fancy-dress} or rent ₹{RENT:radha-rani-fancy-dress} in Delhi NCR.',
    description: [
      'The Radha half of our adult Radha Krishna pair. The choli is maroon velvet worked with gold sequins, with sleeves in yellow sequinned net and maroon cuffs. It sits over a full-flare yellow net lehenga striped in white thread and sequins. The hem carries three bands: green and gold embroidered lace, maroon velvet and a scalloped gold edge. A long yellow net dupatta bordered in maroon and gold completes the set.',
      'The colours are cut to match our adult Krishna costume, so the two read as one jhanki on stage. It suits Janmashtami, Raas Leela and Krishna Leela programmes, and the wide lehenga also works for a garba or dandiya night. Styled on an adult. WhatsApp us to confirm the size before you come in.',
      'Radha Rani ki lehenga — Krishna ke saath matching couple look.',
      STORE_TAIL,
    ].join('\n'),
  },
]

/** [product slug, category slugs]: the first slug is the primary when category_id is NULL. */
const ORPHANS: [string, string[]][] = [
  ['school-fancy-dress-red-color', ['kids']],
  ['radha-rani-fancy-dress', ['indian-mythology-costumes']],
  ['astronaut-fancy-dress', ['space-costumes', 'helper-costumes']],
]
const REPRIMARY = { slug: 'krishna-fancy-dress-costume', to: 'indian-mythology-costumes' }

const RAMLEELA = {
  slug: 'ramleela-costumes',
  seo_title: 'Ramleela Costumes on Rent – Ram, Sita, Ravan, Hanuman',
  meta_description:
    'Ramleela and Dussehra costumes for Ram, Sita, Ravan, Hanuman and Kumbhkaran. Rent from ₹{MIN_RENT:ramleela-costumes} or buy in Delhi NCR for Ramleela, 11–20 Oct. Bulk for committees.',
  description: [
    'Ramleela costumes for the whole cast, for Ramleela 2026 (11–20 October) and Dussehra on 20 October: Ram, Sita, Hanuman, Ravan, Meghnath, Kumbhkaran, Jatayu, Jaamvant, the rishis and the royal court.',
    'Ram comes in two looks: the crowned Raja Ram of the coronation and the saffron Vanvasi Ram of the forest years. Sita comes as the Ayodhya queen and in a plain saffron vanvasi saree. Hanuman has three dresses, from a light red set for young children to red velvet and mustard-gold zari costumes for a lead role, plus a foam gada. Lanka has a black-and-gold Ravan, a royal blue Meghnath and a heavy velvet Kumbhkaran, with swords, shields and spears for the battle scenes.',
    'Ramleela costume on rent in Delhi: rent any costume here per event from ₹{MIN_RENT:ramleela-costumes} with a refundable deposit, returned in full when the costume comes back. Extra days for a longer run can be arranged for a small additional charge. Try sizes at our Krishna Nagar store, a five-minute walk from Krishna Nagar Metro, or have costumes delivered across Delhi NCR by Porter or Rapido. Most pieces are sized for school-age children. For adult actors, WhatsApp us the roles and sizes.',
    'Bulk orders for Ramleela committees: send the character list on WhatsApp (+91 99537 64137). Groups of ten or more get group rates, and schools and committees can also order wholesale. Book at least a week before the first show.',
    'Ravan ka costume ya Hanuman ji ki dress chahiye? Rent pe milegi.',
  ].join(' '),
}

const BROKEN_IMAGE_PRODUCTS = ['mother-teresa-fancy-dress-costume', 'traffic-police-fancy-dress-costume']

const POST = {
  slug: 'dussehra-ramleela-costume-ideas',
  title: 'Dussehra & Ramleela Costumes 2026: Ram, Sita, Ravan, Hanuman',
  excerpt:
    'Ramleela and Dussehra 2026 costume ideas for Ram, Sita, Ravan, Hanuman and the rest of the cast, for kids and adults, to rent or buy in Delhi (11–20 Oct).',
}

function abort(msg: string): never {
  console.error(`❌ ${msg}`)
  process.exit(1)
}

/** Reads the first bytes of a stored file; true when it is an HTML page rather than an image. */
async function isHtml(url: string): Promise<{ html: boolean; head: string; status: number }> {
  const res = await fetch(url, { headers: { Range: 'bytes=0-63' } })
  const buf = Buffer.from(await res.arrayBuffer())
  const head = buf.subarray(0, 16).toString('latin1')
  const text = buf.toString('utf8').replace(/^﻿/, '').trimStart().toLowerCase()
  return { html: text.startsWith('<!doc') || text.startsWith('<html'), head: JSON.stringify(head), status: res.status }
}

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')
  const cat = await loadCatalog(sb)
  const now = () => new Date().toISOString()

  // ---------- Validate all copy before any write ----------
  const products = PRODUCT_COPY.map((p) => ({
    ...p,
    seo_title: fillTokens(p.seo_title, cat),
    meta_description: fillTokens(p.meta_description, cat),
    description: fillTokens(p.description, cat),
  }))
  for (const p of products) {
    const v = checkCopy({ seoTitle: p.seo_title, metaDescription: p.meta_description })
    if (v.length) abort(`${p.slug}: ${v.join('; ')}`)
  }
  const ram = {
    ...RAMLEELA,
    meta_description: fillTokens(RAMLEELA.meta_description, cat),
    description: fillTokens(RAMLEELA.description, cat),
  }
  {
    const v = checkCopy({ seoTitle: ram.seo_title, metaDescription: ram.meta_description })
    if (v.length) abort(`${ram.slug}: ${v.join('; ')}`)
  }
  const postBody = fillTokens(readFileSync(resolve(__dirname, 'content', `${POST.slug}.md`), 'utf8').trim(), cat)
  {
    const v = checkCopy({ seoTitle: POST.title, metaDescription: POST.excerpt })
    if (v.length) abort(`post: ${v.join('; ')}`)
    const { errors, productLinks } = checkLinks(postBody, cat)
    if (errors.length) abort(`post links: ${errors.join('; ')}`)
    const words = wordCount(postBody)
    console.log(`post: ${words} words, ${productLinks.length} product links`)
    if (productLinks.length < 8) abort('post has fewer than 8 product links')
  }

  // ---------- Phase 1: product copy (empty fields only) ----------
  console.log('\n=== PHASE 1: KRISHNA / RADHA COPY ===')
  for (const p of products) {
    const { data: row } = await sb.from('products').select('id, description, meta_description, seo_title').eq('slug', p.slug).single()
    if (!row) abort(`${p.slug} not found`)
    const update: Record<string, string> = {}
    if (!row.description?.trim()) update.description = p.description
    if (!row.meta_description?.trim()) update.meta_description = p.meta_description
    if (!row.seo_title?.trim()) update.seo_title = p.seo_title
    console.log(`${p.slug}: writing ${Object.keys(update).join(', ') || '(nothing, all filled)'}`)
    console.log(`   title (${p.seo_title.length}): ${p.seo_title}\n   meta  (${p.meta_description.length}): ${p.meta_description}`)
    if (APPLY && Object.keys(update).length) {
      const { error } = await sb.from('products').update({ ...update, updated_at: now() }).eq('id', row.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  // ---------- Phase 2: orphans and primary fix ----------
  console.log('\n=== PHASE 2: ORPHANS ===')
  const catId = (s: string) => cat.categories.get(s)?.id ?? abort(`category ${s} is not active`)
  for (const [slug, catSlugs] of ORPHANS) {
    const live = cat.products.get(slug) ?? abort(`${slug} is not live`)
    const { data: row } = await sb.from('products').select('category_id').eq('id', live.id).single()
    const { data: links } = await sb.from('product_categories').select('category_id').eq('product_id', live.id)
    const have = new Set((links ?? []).map((l) => l.category_id))
    const missing = catSlugs.filter((s) => !have.has(catId(s)))
    const setPrimary = !row?.category_id
    console.log(`${slug}: primary ${setPrimary ? `NULL -> ${catSlugs[0]}` : 'kept'}; add junction: ${missing.join(', ') || '(none)'}`)
    if (!APPLY) continue
    if (setPrimary) {
      const { error } = await sb.from('products').update({ category_id: catId(catSlugs[0]), updated_at: now() }).eq('id', live.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ primary set')
    }
    if (missing.length) {
      const { error } = await sb.from('product_categories').insert(missing.map((s) => ({ product_id: live.id, category_id: catId(s) })))
      console.log(error ? `   ❌ ${error.message}` : `   ✅ ${missing.length} junction row(s) added`)
    }
  }
  {
    const live = cat.products.get(REPRIMARY.slug) ?? abort(`${REPRIMARY.slug} is not live`)
    const { data: row } = await sb.from('products').select('category_id, categories(slug, is_active)').eq('id', live.id).single()
    const current = row?.categories as unknown as { slug: string; is_active: boolean } | null
    const target = catId(REPRIMARY.to)
    const { data: links } = await sb.from('product_categories').select('category_id').eq('product_id', live.id)
    const needLink = !(links ?? []).some((l) => l.category_id === target)
    if (row?.category_id === target) console.log(`${REPRIMARY.slug}: primary already ${REPRIMARY.to}`)
    else if (current?.is_active) console.log(`${REPRIMARY.slug}: primary ${current.slug} is active, left alone`)
    else {
      console.log(`${REPRIMARY.slug}: primary ${current?.slug ?? 'NULL'} (inactive) -> ${REPRIMARY.to}; junction ${needLink ? 'add' : 'present'}`)
      if (APPLY) {
        const { error } = await sb.from('products').update({ category_id: target, updated_at: now() }).eq('id', live.id)
        console.log(error ? `   ❌ ${error.message}` : '   ✅ primary moved')
        if (needLink) {
          const { error: e2 } = await sb.from('product_categories').insert({ product_id: live.id, category_id: target })
          console.log(e2 ? `   ❌ ${e2.message}` : '   ✅ junction row added')
        }
      }
    }
  }

  // ---------- Phase 3: Ramleela category (overwrite) ----------
  console.log('\n=== PHASE 3: RAMLEELA CATEGORY (overwrite) ===')
  {
    const { data: row } = await sb.from('categories').select('id, seo_title, meta_description, description').eq('slug', ram.slug).single()
    if (!row) abort('ramleela-costumes not found')
    console.log(`   title: "${row.seo_title}"\n       -> "${ram.seo_title}" (${ram.seo_title.length})`)
    console.log(`   meta:  "${row.meta_description}"\n       -> "${ram.meta_description}" (${ram.meta_description.length})`)
    console.log(`   desc:  ${row.description?.length ?? 0} -> ${ram.description.length} chars, ${wordCount(ram.description)} words`)
    if (APPLY) {
      const { error } = await sb
        .from('categories')
        .update({ seo_title: ram.seo_title, meta_description: ram.meta_description, description: ram.description, updated_at: now() })
        .eq('id', row.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  // ---------- Phase 4: broken (non-image) product images ----------
  console.log('\n=== PHASE 4: BROKEN IMAGES ===')
  const deactivated: string[] = []
  for (const slug of BROKEN_IMAGE_PRODUCTS) {
    const live = cat.products.get(slug)
    if (!live) {
      console.log(`${slug}: not live, skipping`)
      continue
    }
    const { data: imgs } = await sb.from('product_images').select('id, image_url, is_primary, order').eq('product_id', live.id).order('order')
    const bad: typeof imgs = []
    for (const img of imgs ?? []) {
      const r = await isHtml(img.image_url)
      console.log(`   ${slug} #${img.order}${img.is_primary ? ' (primary)' : ''} ${r.status} ${r.head} ${r.html ? '-> HTML, drop' : 'ok'}`)
      if (r.html) bad.push(img)
    }
    const remaining = (imgs ?? []).filter((i) => !bad.some((b) => b.id === i.id))
    console.log(`${slug}: ${bad.length} non-image row(s) to delete, ${remaining.length} image(s) left`)
    if (!APPLY || !bad.length) {
      if (!remaining.length) deactivated.push(slug)
      continue
    }
    const { error } = await sb.from('product_images').delete().in('id', bad.map((b) => b.id))
    console.log(error ? `   ❌ ${error.message}` : `   ✅ deleted ${bad.length} row(s)`)
    if (error) continue
    if (!remaining.length) {
      const { error: e2 } = await sb.from('products').update({ is_active: false, updated_at: now() }).eq('id', live.id)
      console.log(e2 ? `   ❌ ${e2.message}` : '   ⚠️  no images left: set is_active = false')
      deactivated.push(slug)
    } else if (!remaining.some((i) => i.is_primary)) {
      const { error: e3 } = await sb.from('product_images').update({ is_primary: true }).eq('id', remaining[0].id)
      console.log(e3 ? `   ❌ ${e3.message}` : '   ✅ promoted next image to primary')
    }
  }
  if (deactivated.length) console.log(`   Owner photo list (inactive, no image): ${deactivated.join(', ')}`)

  // ---------- Phase 5: new Dussehra post ----------
  console.log('\n=== PHASE 5: NEW POST ===')
  const { data: existing } = await sb.from('blog_posts').select('id, published_at').eq('slug', POST.slug).maybeSingle()
  if (existing) console.log(`${POST.slug}: already exists (published_at ${existing.published_at}), not overwritten`)
  else {
    console.log(`${POST.slug}: insert "${POST.title}" (${POST.title.length}), excerpt ${POST.excerpt.length}`)
    if (APPLY) {
      const t = now()
      const { error } = await sb
        .from('blog_posts')
        .insert({ slug: POST.slug, title: POST.title, language: 'en', content: postBody, excerpt: POST.excerpt, published_at: t, created_at: t, updated_at: t })
      console.log(error ? `   ❌ ${error.message}` : '   ✅ published')
    }
  }

  console.log(APPLY ? '\nDone.' : '\nDry run complete. Re-run with --apply to write.')
}

main().catch((e) => abort(e instanceof Error ? e.message : String(e)))
