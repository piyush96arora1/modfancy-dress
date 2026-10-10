/**
 * Apply the post-upload follow-up for a batch of products from a JSON spec.
 *
 * This is scripts/followup-oct8-batch.ts with the copy moved out into data, so each batch
 * is a reviewed spec in scripts/followups/ instead of a new 270-line script. The
 * catalog-steward agent writes the spec; this runner owns every guard.
 *
 * Spec (scripts/followups/<yyyy-mm-dd>-<label>.json):
 *   {
 *     "batch": "8 Oct 2026 upload",
 *     "items": [{
 *       "from": "dandiya-lehnga",                     // slug as uploaded
 *       "to": "mustard-peacock-print-dandiya-lehenga", // optional rename (308 from the old URL)
 *       "name": "Mustard Peacock Print Dandiya Lehenga",
 *       "size": "Adult",                              // only written when size is empty
 *       "body": "…English description…",             // body/meta/seo_title: required only when that DB field is empty
 *       "hinglish": "…one Roman-script line…",       // optional, placed last before the store line
 *       "meta": "… {PRICE_LINE}",                     // {PRICE_LINE} {BUY} {RENT} filled from live prices
 *       "seo_title": "…",
 *       "alt": { "<image filename>": "…" },           // every image whose alt_text is empty
 *       "addCategories": ["ramleela-costumes"],
 *       "replaces": ["old-soft-deleted-slug"],        // 308 old product URLs to this one
 *       "overwrite": false                            // true rewrites existing copy too
 *     }]
 *   }
 *
 * {PRICE_LINE} is "Buy ₹X or rent ₹Y in Delhi NCR." (the phrase scripts/fix-meta-prices.ts
 * keeps in sync), or "Buy ₹X in Delhi NCR." for buy-only products.
 *
 * Phases per product: rename slug + name, fill empty copy (or all of it with overwrite),
 * alt text where empty, missing categories; then 308s in redirects.json with the redirect
 * graph validated. Every check runs before the first write; any failure writes nothing.
 *
 * Dry run:  npx tsx scripts/catalog-followup.ts scripts/followups/<spec>.json
 * Apply:    npx tsx scripts/catalog-followup.ts scripts/followups/<spec>.json --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'
import { validateRedirects, type Redirect } from '../lib/seo/redirect-graph'
import { hinglishProblems } from './lib/seo-copy-run'

config({ path: resolve(process.cwd(), '.env.local'), quiet: true })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const APPLY = process.argv.includes('--apply')
const SPEC_PATH = process.argv.slice(2).find((a) => a.endsWith('.json'))
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')
const LIVE_URLS_PATH = resolve(process.cwd(), 'seodata/live-urls.json')
const PENDING_PATH = resolve(process.cwd(), 'seodata/pending-reupload-redirects.json')

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

type Item = {
  from: string
  to?: string
  name?: string
  size?: string
  /** body / meta / seo_title are required only when the DB field is empty (or overwrite is set). */
  body?: string
  hinglish?: string
  meta?: string
  seo_title?: string
  alt?: Record<string, string>
  addCategories?: string[]
  replaces?: string[]
  overwrite?: boolean
}

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
  product_images: { id: string; image_url: string; alt_text: string | null }[]
  product_categories: { category_id: string }[]
}

const basename = (u: string) => u.split('?')[0].split('/').pop()!
const blank = (v: string | null | undefined) => !v || !v.trim()

function fillMeta(meta: string, row: Row): string {
  const buy = Number(row.price)
  const rent = Number(row.rent_price)
  if (!(buy > 0) && /\{(PRICE_LINE|BUY)\}/.test(meta)) throw new Error('no buy price')
  if (!(rent > 0) && meta.includes('{RENT}')) throw new Error('no rent price')
  const line = rent > 0 ? `Buy ₹${buy} or rent ₹${rent} in Delhi NCR.` : `Buy ₹${buy} in Delhi NCR.`
  return meta.replaceAll('{PRICE_LINE}', line).replaceAll('{BUY}', String(buy)).replaceAll('{RENT}', String(rent))
}

const bodyOf = (it: Item) => [it.body!.trim(), it.hinglish?.trim(), it.body!.includes(STORE_TAIL) ? '' : STORE_TAIL].filter(Boolean).join('\n')

async function main() {
  if (!SPEC_PATH) {
    console.error('usage: npx tsx scripts/catalog-followup.ts <spec.json> [--apply]')
    process.exit(1)
  }
  const spec = JSON.parse(readFileSync(resolve(process.cwd(), SPEC_PATH), 'utf8')) as { batch: string; items: Item[] }
  console.log(`${APPLY ? '=== APPLYING' : '=== DRY RUN (pass --apply to write)'}: ${spec.batch} — ${spec.items.length} product(s) ===\n`)

  const { data: cats, error: ce } = await sb.from('categories').select('id, slug').eq('is_active', true)
  if (ce) throw ce
  const catId = new Map(cats!.map((c) => [c.slug, c.id as string]))

  // ---- Load and pre-check everything before the first write ----
  const problems: string[] = []
  const rows = new Map<string, Row>()
  const metas = new Map<string, string>()
  const targets = new Set<string>()
  for (const it of spec.items) {
    const slugs = [it.from, it.to].filter(Boolean) as string[]
    for (const s of slugs) if (!SLUG.test(s)) problems.push(`${it.from}: "${s}" is not a valid slug`)
    const target = it.to ?? it.from
    if (targets.has(target)) problems.push(`${it.from}: two items end at slug ${target}`)
    targets.add(target)

    const { data, error } = await sb
      .from('products')
      .select('id, slug, name, price, rent_price, size, description, meta_description, seo_title, product_images(id, image_url, alt_text), product_categories(category_id)')
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
    if (Number(row.rent_price) > Number(row.price) && Number(row.price) > 0)
      problems.push(`${it.from}: rent ₹${row.rent_price} is above buy ₹${row.price} — owner must fix the price first`)

    const needs = (current: string | null) => !!it.overwrite || blank(current)
    if (needs(row.description) && !it.body) problems.push(`${it.from}: description is empty, spec has no body`)
    if (needs(row.meta_description) && !it.meta) problems.push(`${it.from}: meta_description is empty, spec has no meta`)
    if (needs(row.seo_title) && !it.seo_title) problems.push(`${it.from}: seo_title is empty, spec has no seo_title`)
    if (it.meta || it.seo_title) {
      try {
        const meta = it.meta ? fillMeta(it.meta, row) : row.meta_description ?? ''
        if (/\{[A-Z_]+\}/.test(meta)) problems.push(`${it.from}: unknown token left in meta`)
        metas.set(it.from, meta)
        for (const v of checkCopy({ seoTitle: it.seo_title ?? row.seo_title ?? '', metaDescription: meta })) problems.push(`${it.from}: ${v}`)
      } catch (e) {
        problems.push(`${it.from}: meta — ${(e as Error).message}`)
      }
    }
    if (it.body) {
      for (const h of hinglishProblems([it.body, it.hinglish].filter(Boolean).join('\n'))) problems.push(`${it.from}: ${h}`)
      if (it.body.trim().split(/\s+/).length < 60) problems.push(`${it.from}: body under 60 words — too thin to rank`)
    }
    for (const img of row.product_images) {
      if (blank(img.alt_text) && !it.alt?.[basename(img.image_url)]) problems.push(`${it.from}: no alt text for ${basename(img.image_url)}`)
    }
    for (const c of it.addCategories ?? []) if (!catId.has(c)) problems.push(`${it.from}: category ${c} not active`)
  }
  // ---- Redirects: planned and validated here, so a bad graph stops the run before any DB write ----
  const redirectLog: string[] = []
  const redirects: Redirect[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
  const live = new Set<string>(JSON.parse(readFileSync(LIVE_URLS_PATH, 'utf8')))

  const upsert = (source: string, destination: string) => {
    const i = redirects.findIndex((r) => r.source === source)
    if (i >= 0) {
      if (redirects[i].destination === destination) return
      redirectLog.push(`   ~ ${source}: ${redirects[i].destination} -> ${destination}`)
      redirects[i] = { ...redirects[i], destination }
    } else {
      redirectLog.push(`   + ${source} -> ${destination}`)
      redirects.push({ source, destination, permanent: true })
    }
  }

  const resolved = new Set<string>()
  for (const it of spec.items) {
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
  for (const i of issues) problems.push(`redirects: ${i}`)

  const pending: { oldSlug: string }[] = JSON.parse(readFileSync(PENDING_PATH, 'utf8'))
  const stillPending = pending.filter((p) => !resolved.has(p.oldSlug))

  if (problems.length) {
    console.error('❌ Pre-checks failed, nothing written:\n  ' + problems.join('\n  '))
    process.exit(1)
  }

  // ---- Phases 1–4, per product ----
  for (const it of spec.items) {
    const row = rows.get(it.from)!
    const slug = it.to ?? it.from
    console.log(`\n── ${slug}${it.to && row.slug !== it.to ? `  (was ${it.from})` : ''}`)

    const write = (current: string | null) => it.overwrite || blank(current)
    const patch: Record<string, string> = {}
    if (it.to && row.slug !== it.to) patch.slug = it.to
    if (it.name && row.name !== it.name) patch.name = it.name
    if (it.size && blank(row.size)) patch.size = it.size
    if (write(row.description)) patch.description = bodyOf(it)
    if (write(row.meta_description)) patch.meta_description = metas.get(it.from)!
    if (write(row.seo_title)) patch.seo_title = it.seo_title!

    for (const [k, v] of Object.entries(patch)) {
      const old = (row as unknown as Record<string, unknown>)[k]
      console.log(`   ${k}: ${old ? `${String(old).slice(0, 40)} -> ` : ''}${v.length > 110 ? v.slice(0, 110) + '…' : v}`)
    }
    if (APPLY && Object.keys(patch).length) {
      const { error } = await sb.from('products').update(patch).eq('id', row.id)
      if (error) throw new Error(`${slug}: ${error.message}`)
    }

    for (const img of row.product_images) {
      if (!blank(img.alt_text)) continue
      const alt = it.alt![basename(img.image_url)]
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

  // ---- Phase 5: redirects (already validated) ----
  console.log('\n=== REDIRECTS ===')
  redirectLog.forEach((l) => console.log(l))
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
