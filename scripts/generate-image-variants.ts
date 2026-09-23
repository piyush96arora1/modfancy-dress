/**
 * Write resized real-WebP variants of every live product (and active category) image:
 *   products-webp/<name>.<ext>  →  products-w400/<name>.webp
 *                                  products-w800/<name>.webp
 *                                  products-w1600/<name>.webp
 *
 * Why: lab mobile LCP was 9.6–22.3s on every commercial page, almost all of it image bytes.
 * Grid cards draw ~180px tiles from 1400–1600px originals of 420–510KB, 84 of those are PNG
 * bytes named .webp, and Next's optimiser stays off (`images.unoptimized`). So the right
 * sizes are stored once, here, and components pick them with lib/utils/image-variants.ts.
 *
 * Cache: every variant is uploaded with cacheControl '31536000', which Supabase serves on
 * GET as `cache-control: public, max-age=31536000`. (Objects uploaded without it get the
 * storage default of max-age=3600. Note a HEAD request always reports `no-cache`, so check
 * cache headers with GET, not `curl -I`.)
 *
 * Safety:
 * - Reads originals; never overwrites or deletes them. Writes only under products-w*.
 * - A variant is skipped when it already exists and was made from the same original
 *   (its `sourceEtag` metadata matches the original's ETag); pass --force to redo.
 * - Two originals that differ only by extension would share a variant name; both are
 *   reported and skipped rather than one silently winning.
 *
 * Dry run:  npx tsx scripts/generate-image-variants.ts          (encodes a sample, writes nothing)
 * Apply:    npx tsx scripts/generate-image-variants.ts --apply [--force] [--limit N]
 * Verify:   npx tsx scripts/generate-image-variants.ts --verify (HEADs every variant URL)
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '../lib/imageUrl'
import { VARIANT_WIDTHS, variantPath, variantUrl, type VariantWidth } from '../lib/utils/image-variants'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const sb = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const BUCKET = 'product-images'
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
const APPLY = process.argv.includes('--apply')
const VERIFY = process.argv.includes('--verify')
const FORCE = process.argv.includes('--force')
const LIMIT = Number(argValue('--limit') ?? Infinity)
const SAMPLE = 5
const CONCURRENCY = 6
const QUALITY = 78

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`
const mb = (n: number) => `${(n / 1048576).toFixed(1)}MB`

/** Every distinct stored image of a live product or active category, as a public URL. */
async function liveImageUrls(): Promise<string[]> {
  const { data, error } = await sb
    .from('products')
    .select('slug, product_images(image_url)')
    .eq('is_active', true)
    .is('deleted_at', null)
  if (error) throw error
  const urls = new Set<string>()
  for (const p of data ?? []) {
    for (const img of (p.product_images ?? []) as { image_url: string }[]) {
      if (img.image_url) urls.add(getImageUrl(img.image_url))
    }
  }
  // Category thumbnails are product photos too (and render as 64px circles).
  const { data: cats, error: catError } = await sb
    .from('categories')
    .select('image_url')
    .eq('is_active', true)
  if (catError) throw catError
  for (const c of cats ?? []) if (c.image_url) urls.add(getImageUrl(c.image_url))
  return [...urls]
}

/** name → ETag (without quotes) for every object in a folder. */
async function listFolder(folder: string): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage.from(BUCKET).list(folder, { limit: 1000, offset })
    if (error) throw error
    for (const f of data ?? []) {
      const etag = (f.metadata as { eTag?: string } | null)?.eTag
      if (etag) out.set(f.name, etag.replace(/"/g, ''))
    }
    if (!data || data.length < 1000) return out
  }
}

async function mapLimit<T>(items: T[], n: number, fn: (t: T, i: number) => Promise<void>) {
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        await fn(items[i], i)
      }
    })
  )
}

type Job = { original: string; sourceEtag: string | null; widths: VariantWidth[] }

async function verify(urls: string[]) {
  const targets = urls.flatMap((u) => VARIANT_WIDTHS.map((w) => variantUrl(u, w))).filter((v) =>
    /\/products-w\d+\//.test(v)
  )
  const bad: string[] = []
  await mapLimit(targets, 16, async (u) => {
    const r = await fetch(u, { method: 'HEAD' })
    const type = r.headers.get('content-type') ?? ''
    if (r.status !== 200 || !type.includes('webp')) bad.push(`${r.status} ${type} ${u}`)
  })
  // HEAD always reports no-cache; the real header comes back on GET.
  const sample = await fetch(targets[0])
  console.log(`GET cache-control on ${targets[0]}: ${sample.headers.get('cache-control')}`)
  console.log(`\nVerified ${targets.length - bad.length}/${targets.length} variant URLs return 200 image/webp.`)
  bad.slice(0, 50).forEach((b) => console.log(`   ❌ ${b}`))
  if (bad.length) process.exit(1)
}

async function main() {
  const urls = await liveImageUrls()
  if (VERIFY) return verify(urls)

  console.log(APPLY ? '=== APPLYING ===\n' : `=== DRY RUN (encodes ${SAMPLE} samples; pass --apply to write) ===\n`)

  const originals = urls
    .filter((u) => u.startsWith(PUBLIC_PREFIX))
    .map((u) => decodeURIComponent(u.slice(PUBLIC_PREFIX.length).split('?')[0]))
  const noVariant = originals.filter((p) => !variantPath(p, 400))
  console.log(`${urls.length} live image URLs; ${originals.length - noVariant.length} have a variant slot.`)
  noVariant.forEach((p) => console.log(`   – no variant slot (left as is): ${p}`))

  // Two originals differing only by extension would write the same variant.
  const byTarget = new Map<string, string[]>()
  for (const p of originals) {
    const t = variantPath(p, 400)
    if (t) byTarget.set(t, [...(byTarget.get(t) ?? []), p])
  }
  const clashes = [...byTarget.values()].filter((v) => v.length > 1)
  clashes.forEach((c) => console.log(`   ⚠ variant name clash, skipped: ${c.join(' / ')}`))
  const clashed = new Set(clashes.flat())

  const sourceEtags = await listFolder('products-webp')
  const existing = new Map<VariantWidth, Map<string, string>>()
  for (const w of VARIANT_WIDTHS) existing.set(w, await listFolder(`products-w${w}`))

  // A variant is current when it exists and records the original's ETag it was made from.
  const jobs: Job[] = []
  let current = 0
  for (const original of originals) {
    if (clashed.has(original) || !variantPath(original, 400)) continue
    const sourceEtag = sourceEtags.get(original.replace(/^products-webp\//, '')) ?? null
    const widths: VariantWidth[] = []
    for (const w of VARIANT_WIDTHS) {
      const name = variantPath(original, w)!.split('/')[1]
      if (!FORCE && existing.get(w)!.has(name)) {
        const { data } = await sb.storage.from(BUCKET).info(variantPath(original, w)!)
        const madeFrom = (data?.metadata as { sourceEtag?: string } | undefined)?.sourceEtag
        if (madeFrom && madeFrom === sourceEtag) {
          current++
          continue
        }
      }
      widths.push(w)
    }
    if (widths.length) jobs.push({ original, sourceEtag, widths })
  }
  console.log(`${current} variants already current; ${jobs.length} originals need work.\n`)

  const todo = APPLY ? jobs.slice(0, LIMIT) : jobs.slice(0, SAMPLE)
  const totals = { originals: 0, written: 0, failed: 0, before: 0, after: {} as Record<number, number> }
  const failures: string[] = []

  await mapLimit(todo, CONCURRENCY, async (job) => {
    try {
      const res = await fetch(PUBLIC_PREFIX + job.original.split('/').map(encodeURIComponent).join('/'))
      if (!res.ok) throw new Error(`download ${res.status}`)
      const src = Buffer.from(await res.arrayBuffer())
      const meta = await sharp(src).metadata() // throws on non-image bytes (HTML 404 pages)
      totals.originals++
      totals.before += src.length
      const parts: string[] = []
      for (const w of job.widths) {
        const out = await sharp(src)
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toBuffer()
        totals.after[w] = (totals.after[w] ?? 0) + out.length
        parts.push(`w${w} ${kb(out.length)}`)
        if (APPLY) {
          const { error } = await sb.storage.from(BUCKET).upload(variantPath(job.original, w)!, out, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true,
            metadata: { sourceEtag: job.sourceEtag ?? '' },
          })
          if (error) throw new Error(`upload w${w}: ${error.message}`)
          totals.written++
        }
      }
      console.log(`${job.original}  ${meta.format} ${meta.width}px ${kb(src.length)} → ${parts.join(', ')}`)
    } catch (e) {
      totals.failed++
      failures.push(`${job.original}: ${(e as Error).message}`)
    }
  })

  console.log(`\n=== ${APPLY ? 'Written' : 'Sample'} ===`)
  console.log(`originals processed: ${totals.originals}, variants ${APPLY ? 'written' : 'encoded'}: ${totals.written}, failed: ${totals.failed}`)
  console.log(`original bytes: ${mb(totals.before)}`)
  for (const w of VARIANT_WIDTHS) {
    const b = totals.after[w] ?? 0
    const n = todo.filter((j) => j.widths.includes(w)).length || 1
    console.log(`w${w}: ${mb(b)} total, avg ${kb(b / n)}`)
  }
  failures.forEach((f) => console.log(`   ❌ ${f}`))
  if (!APPLY && jobs.length > SAMPLE) console.log(`\n(${jobs.length - SAMPLE} more originals would be processed with --apply)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
