#!/usr/bin/env tsx
/**
 * Imports the scraped supplier catalog (vastra-data/db.json) into Supabase.
 *
 * Idempotent on (supplier_code, source_id) and safe to interrupt: uploads are skipped when the
 * storage object already exists, rows are upserted, and anything that fails permanently lands
 * in a ledger so a later run can retry exactly that.
 *
 * The scrape itself is produced by scripts/vastra-scrape.mjs — see docs/vastra-scrape.md.
 *
 * Usage:
 *   npm run import:catalog -- --dry-run
 *   npm run import:catalog -- --phases=categories
 *   npm run import:catalog -- --phases=products --limit=5
 *   npm run import:catalog -- --retry-failed
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { processCatalogImage, assertFontAvailable, type Variant } from './lib/watermark'
import {
  cleanProductName,
  slugifyCatalogName,
  resolveCatalogSlug,
} from '../lib/utils/supplier-naming'

config({ path: '.env.local' })

const SUPPLIER_CODE = 'sup-01'
const BUCKET = 'product-images'
const DB_PATH = 'vastra-data/db.json'
const LEDGER_PATH = 'vastra-data/import-failures.json'
const IMAGES_ROOT = 'vastra-data'

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const value = (name: string, fallback: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback

const DRY = flag('dry-run')
const PHASES = value('phases', 'categories,products').split(',')
const LIMIT = Number(value('limit', '0'))
const RETRY_FAILED = flag('retry-failed')
const CONCURRENCY = Number(value('concurrency', '4'))

const log = (msg: string) => console.log(`${new Date().toISOString()} ${msg}`)

// ---------------------------------------------------------------- failure ledger

type Failure = {
  phase: string
  key: string
  label?: string
  error: string
  attempts: number
  last_failed_at: string
}

let ledger: Record<string, Failure> = {}

async function loadLedger() {
  try {
    ledger = JSON.parse(await fsp.readFile(LEDGER_PATH, 'utf8'))
  } catch {
    ledger = {}
  }
}

async function saveLedger() {
  await fsp.writeFile(LEDGER_PATH, JSON.stringify(ledger, null, 2))
}

function recordFailure(phase: string, key: string, err: unknown, label?: string) {
  const id = `${phase}:${key}`
  const message = err instanceof Error ? err.message : String(err)
  ledger[id] = {
    phase,
    key,
    label,
    error: message,
    attempts: (ledger[id]?.attempts ?? 0) + 1,
    last_failed_at: new Date().toISOString(),
  }
  console.error(`FAILED ${id} :: ${message}`)
}

const clearFailure = (phase: string, key: string) => {
  delete ledger[`${phase}:${key}`]
}

// ---------------------------------------------------------------- helpers

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Retries with exponential backoff; rethrows the last error when attempts run out. */
async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i < attempts) {
        const wait = Math.min(1000 * 2 ** (i - 1), 15000) + Math.floor(Math.random() * 300)
        console.warn(`${label} failed (${i}/${attempts}), retrying in ${wait}ms`)
        await sleep(wait)
      }
    }
  }
  throw lastErr
}

async function pool<T>(items: T[], limit: number, worker: (item: T, i: number) => Promise<void>) {
  const queue = [...items.entries()]
  let done = 0
  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(limit, queue.length)) }, async () => {
      for (;;) {
        const next = queue.shift()
        if (!next) return
        await worker(next[1], next[0])
        if (++done % 25 === 0) log(`  ...${done}/${items.length}`)
      }
    })
  )
}

/** Local path for a scraped image URL, as laid down by scripts/vastra-scrape.mjs. */
function localImagePath(url: string): string {
  const u = new URL(url)
  return path.join(IMAGES_ROOT, 'images', ...u.pathname.split('/').filter(Boolean))
}

/**
 * The supplier returns a bare directory URL (".../designCategory/") for categories with no
 * image — 10 of the 61. Those are absent, not broken, so they must be skipped rather than
 * attempted: reading one resolves to a directory and throws EISDIR.
 */
function isUsableImageUrl(url: string | undefined | null): url is string {
  if (!url || !url.startsWith('http')) return false
  const file = url.split('?')[0].split('/').pop()
  return Boolean(file && file.includes('.'))
}

const publicUrl = (supabase: SupabaseClient, objectPath: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

/**
 * Processes and uploads one image variant, skipping the work when the object already exists so
 * an interrupted run resumes cheaply.
 */
async function uploadVariant(
  supabase: SupabaseClient,
  sourceUrl: string,
  objectPath: string,
  variant: Variant
): Promise<string> {
  const dir = path.dirname(objectPath)
  const base = path.basename(objectPath)

  const { data: existing } = await supabase.storage.from(BUCKET).list(dir, {
    search: base,
    limit: 1,
  })
  if (existing?.some((o) => o.name === base)) return publicUrl(supabase, objectPath)

  const input = await fsp.readFile(localImagePath(sourceUrl))
  const processed = await processCatalogImage(input, variant)

  await withRetry(`upload ${objectPath}`, async () => {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, processed.data, { contentType: 'image/webp', cacheControl: '31536000', upsert: true })
    if (error) throw new Error(error.message)
  })

  return publicUrl(supabase, objectPath)
}

// ---------------------------------------------------------------- categories

type ScrapedDb = {
  categories: Record<string, ScrapedCategory>
  products: Record<string, ScrapedProduct>
}

type ScrapedCategory = {
  category_id: number
  category_name: string
  parent_category_id: number
  item_index_no?: number
  image?: string
  thumbnail_url?: string
}

type ScrapedProduct = {
  design_id: string
  category_ids: string[]
  image_urls: string[]
  thumbnail_urls: string[]
  listing: {
    design_number: string
    design_price: number
    design_notes?: string
    design_tags?: string
    category_id: number
    set_value?: number
    minimum_order_qty?: number
  }
  detail?: {
    is_size?: number
    color_size_data?: { color_name: string; size_info?: Record<string, unknown>[] }[]
  }
}

async function importCategories(supabase: SupabaseClient, db: ScrapedDb) {
  const all = Object.values(db.categories)
  log(`Phase categories: ${all.length} categories`)

  // Parents before children so parent_id resolves in a single pass.
  const ordered = [
    ...all.filter((c) => String(c.parent_category_id) === '0'),
    ...all.filter((c) => String(c.parent_category_id) !== '0'),
  ]

  const idBySourceId = new Map<string, string>()
  const takenSlugs = new Set<string>()

  for (const cat of ordered) {
    const sourceId = String(cat.category_id)
    try {
      let imageUrl: string | null = null
      let thumbUrl: string | null = null
      if (isUsableImageUrl(cat.image) && !DRY) {
        imageUrl = await uploadVariant(
          supabase,
          cat.image,
          `catalog/category/${sourceId}.webp`,
          'full'
        )
        thumbUrl = await uploadVariant(
          supabase,
          isUsableImageUrl(cat.thumbnail_url) ? cat.thumbnail_url : cat.image,
          `catalog/category/${sourceId}-thumb.webp`,
          'thumb'
        )
      }

      const parentSourceId = String(cat.parent_category_id)
      const parentId = parentSourceId === '0' ? null : idBySourceId.get(parentSourceId) ?? null
      if (parentSourceId !== '0' && !parentId) {
        throw new Error(`parent category ${parentSourceId} not imported yet`)
      }

      const row = {
        supplier_code: SUPPLIER_CODE,
        source_id: sourceId,
        name: cat.category_name,
        slug: resolveCatalogSlug(slugifyCatalogName(cat.category_name), sourceId, takenSlugs),
        parent_id: parentId,
        image_url: imageUrl,
        thumbnail_url: thumbUrl,
        source_image_url: isUsableImageUrl(cat.image) ? cat.image : null,
        sort_order: cat.item_index_no ?? 0,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      if (DRY) {
        log(`  [dry] ${row.slug} (parent ${parentSourceId})`)
        idBySourceId.set(sourceId, `dry-${sourceId}`)
      } else {
        const { data, error } = await supabase
          .from('supplier_categories')
          .upsert(row, { onConflict: 'supplier_code,source_id' })
          .select('id')
          .single()
        if (error) throw new Error(error.message)
        idBySourceId.set(sourceId, data.id)
      }
      clearFailure('category', sourceId)
    } catch (err) {
      recordFailure('category', sourceId, err, cat.category_name)
    }
  }

  await saveLedger()
  log(`  categories done: ${idBySourceId.size}/${all.length}`)
  return idBySourceId
}

// ---------------------------------------------------------------- products

/** Condenses the supplier's colour/size payload down to what the product page renders. */
function condenseVariants(detail: ScrapedProduct['detail']) {
  const rows = (detail?.color_size_data ?? []).flatMap((c) =>
    (c.size_info ?? []).map((s) => ({
      color: c.color_name,
      size: String(s.size_name),
      rate: Number(s.size_rate) || 0,
      in_stock: s.is_stock_available === 1,
    }))
  )
  // A lone "No Color / Default" row carries no information worth showing a client.
  const meaningful = rows.filter((r) => !(r.color === 'No Color' && r.size === 'Default'))
  return {
    hasSizes: detail?.is_size === 1 && meaningful.length > 0,
    variants: meaningful.length ? meaningful : null,
  }
}

async function importProducts(
  supabase: SupabaseClient,
  db: ScrapedDb,
  idBySourceId: Map<string, string>
) {
  // Sorted by id so slug assignment is deterministic: the same product always wins a
  // contested base slug, and links shared with clients stay stable across re-imports.
  let products = Object.values(db.products).sort((a, b) => a.design_id.localeCompare(b.design_id))

  // Slugs must be resolved over the whole catalog even when only a subset is imported,
  // otherwise a --limit run would hand out a slug that a later full run reassigns.
  const takenSlugs = new Set<string>()
  const slugById = new Map<string, string>()
  for (const p of products) {
    slugById.set(
      p.design_id,
      resolveCatalogSlug(
        slugifyCatalogName(cleanProductName(p.listing.design_number)),
        p.design_id,
        takenSlugs
      )
    )
  }

  if (RETRY_FAILED) {
    const keys = new Set(
      Object.values(ledger)
        .filter((f) => f.phase === 'product')
        .map((f) => f.key)
    )
    products = products.filter((p) => keys.has(p.design_id))
  }
  if (LIMIT > 0) products = products.slice(0, LIMIT)

  log(`Phase products: ${products.length} products`)

  await pool(products, CONCURRENCY, async (p) => {
    const sourceId = p.design_id
    try {
      const categorySourceId = String(p.category_ids[0] ?? p.listing.category_id)
      const categoryId = idBySourceId.get(categorySourceId)
      if (!categoryId) throw new Error(`no imported category for ${categorySourceId}`)

      const { hasSizes, variants } = condenseVariants(p.detail)

      const row = {
        supplier_code: SUPPLIER_CODE,
        source_id: sourceId,
        name: cleanProductName(p.listing.design_number),
        source_name: p.listing.design_number,
        slug: slugById.get(sourceId)!,
        category_id: categoryId,
        supplier_price: Number(p.listing.design_price) || 0,
        notes: p.listing.design_notes || null,
        tags: p.listing.design_tags || null,
        set_value: p.listing.set_value ?? 1,
        min_order_qty: p.listing.minimum_order_qty ?? 0,
        has_sizes: hasSizes,
        variants,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      if (DRY) {
        log(`  [dry] ${row.slug} ₹${row.supplier_price} (${p.image_urls.length} images)`)
        return
      }

      const { data, error } = await supabase
        .from('supplier_products')
        .upsert(row, { onConflict: 'supplier_code,source_id' })
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      const productId = data.id

      for (const [i, sourceUrl] of p.image_urls.entries()) {
        if (!isUsableImageUrl(sourceUrl)) continue
        const base = `${sourceId}-${i}`
        const full = await uploadVariant(supabase, sourceUrl, `catalog/full/${base}.webp`, 'full')
        const thumb = await uploadVariant(
          supabase,
          isUsableImageUrl(p.thumbnail_urls?.[i]) ? p.thumbnail_urls[i] : sourceUrl,
          `catalog/thumb/${base}.webp`,
          'thumb'
        )
        const { error: imgErr } = await supabase.from('supplier_product_images').upsert(
          {
            product_id: productId,
            url: full,
            thumb_url: thumb,
            source_url: sourceUrl,
            sort_order: i,
            is_primary: i === 0,
          },
          { onConflict: 'product_id,source_url' }
        )
        if (imgErr) throw new Error(imgErr.message)
      }

      clearFailure('product', sourceId)
    } catch (err) {
      recordFailure('product', sourceId, err, p.listing.design_number)
    }
  })

  await saveLedger()
}

// ---------------------------------------------------------------- main

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  await assertFontAvailable()
  const supabase = createClient(url, key)
  const db: ScrapedDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  await loadLedger()

  log(`Importing from ${DB_PATH} — phases=${PHASES.join(',')} dry=${DRY}`)

  let idBySourceId = new Map<string, string>()

  if (PHASES.includes('categories')) {
    idBySourceId = await importCategories(supabase, db)
  }

  if (PHASES.includes('products')) {
    if (idBySourceId.size === 0 && !DRY) {
      // Rebuild the map from the database so the products phase can run on its own.
      const { data, error } = await supabase
        .from('supplier_categories')
        .select('id, source_id')
        .eq('supplier_code', SUPPLIER_CODE)
      if (error) throw new Error(error.message)
      idBySourceId = new Map(data!.map((c) => [c.source_id, c.id]))
      if (idBySourceId.size === 0) {
        throw new Error('No categories imported yet — run --phases=categories first')
      }
    }
    if (DRY && idBySourceId.size === 0) {
      // Dry runs need placeholder ids so product rows can be assembled and printed.
      for (const c of Object.values(db.categories)) {
        idBySourceId.set(String(c.category_id), `dry-${c.category_id}`)
      }
    }
    await importProducts(supabase, db, idBySourceId)
  }

  await saveLedger()
  const open = Object.keys(ledger).length
  log(open ? `${open} failures logged in ${LEDGER_PATH}` : 'No outstanding failures')
  if (open) log(`Retry with: npm run import:catalog -- --retry-failed`)
}

main().catch(async (err) => {
  console.error('Fatal:', err)
  await saveLedger()
  process.exit(1)
})
