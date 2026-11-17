/**
 * Take a list of products' photos offline (e.g. third-party photos after a copyright notice),
 * keeping the product pages live with the "photo coming soon" state.
 *
 *   npx tsx scripts/takedown-product-photos.ts <dir>            (dry run: inventory + safety checks)
 *   npx tsx scripts/takedown-product-photos.ts <dir> --apply
 *
 * <dir> holds slugs.txt (one product slug per line) and optionally extra-urls.txt (older image
 * URLs of those products, e.g. pre-AI-swap originals, that must go too).
 *
 * --apply:
 * 1. Writes <dir>/archive/rows.json (every product_images row, enough to restore) and downloads
 *    every storage object it will delete into <dir>/archive/files/ (evidence + undo).
 * 2. Deletes those products' product_images rows (products themselves are untouched).
 * 3. Deletes the storage objects: the stored file, its products-webp twin and the w400/w800/w1600
 *    variants. An object whose file name is referenced anywhere else (other products, categories,
 *    banners, blog posts, homepage sections, supplier catalog) is kept and reported.
 * 4. Writes <dir>/deleted-paths.txt (for the image-cache purge) and revalidates the catalog.
 */
import { config } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '../lib/imageUrl'
import { VARIANT_WIDTHS, variantPath } from '../lib/utils/image-variants'
import { revalidateSite } from './lib/revalidate'

config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const BUCKET = 'product-images'

const dir = resolve(process.argv[2] ?? '')
const APPLY = process.argv.includes('--apply')
const read = (f: string) =>
  existsSync(resolve(dir, f)) ? readFileSync(resolve(dir, f), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : []

/** Bucket path of a product-images URL (raw Supabase or img.modfancydress.com), else null. */
function bucketPath(url: string): string | null {
  const m = url.match(/\/product-images\/([^?#]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

/** Every storage object that can serve this URL: as stored, as the products-webp twin, and its variants. */
function objectsFor(url: string): string[] {
  const out = new Set<string>()
  for (const u of [url, getImageUrl(url)]) {
    const p = bucketPath(u)
    if (!p) continue
    out.add(p)
    for (const w of VARIANT_WIDTHS) {
      const v = variantPath(p, w)
      if (v) out.add(v)
    }
  }
  return [...out]
}

const base = (p: string) => p.split('/').pop()!.replace(/\.(webp|png|jpe?g)$/i, '')

async function all<T>(table: string, select = '*'): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(select).range(from, from + 999)
    if (error) {
      console.warn(`  (skipping ${table}: ${error.message})`)
      return rows
    }
    rows.push(...((data ?? []) as T[]))
    if (!data || data.length < 1000) return rows
  }
}

async function listBucket(): Promise<Set<string>> {
  const paths = new Set<string>()
  async function walk(prefix: string) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 1000, offset })
      if (error) throw new Error(`list ${prefix}: ${error.message}`)
      for (const o of data ?? []) {
        const p = prefix ? `${prefix}/${o.name}` : o.name
        if (o.id) paths.add(p)
        else await walk(p)
      }
      if (!data || data.length < 1000) break
    }
  }
  await walk('')
  return paths
}

async function main() {
  const slugs = read('slugs.txt')
  if (!slugs.length) throw new Error(`No slugs in ${dir}/slugs.txt`)

  type Img = { id: string; product_id: string; image_url: string; is_primary: boolean; order: number; alt_text: string | null }
  type Prod = { id: string; slug: string; name: string; deleted_at: string | null; product_images: Img[] }
  const { data: prods, error } = await sb.from('products').select('id, slug, name, deleted_at, product_images(*)').in('slug', slugs)
  if (error) throw new Error(error.message)
  const products = (prods ?? []) as Prod[]
  const missing = slugs.filter((s) => !products.some((p) => p.slug === s))
  if (missing.length) throw new Error(`Slugs not found: ${missing.join(', ')}`)
  const targetIds = new Set(products.map((p) => p.id))
  const rows = products.flatMap((p) => p.product_images.map((r) => ({ ...r, slug: p.slug })))

  // Candidate objects: live rows + known older URLs of these products.
  const urls = new Set([...rows.map((r) => r.image_url), ...read('extra-urls.txt')])
  const candidates = new Set([...urls].flatMap(objectsFor))

  // Cover swaps (covers.json): category image_url / blog cover_image_url that use these photos get
  // the primary photo of a named product instead (null = no cover).
  type Covers = { categories?: Record<string, string | null>; blog_posts?: Record<string, string | null> }
  const coversFile = resolve(dir, 'covers.json')
  const covers: Covers = existsSync(coversFile) ? JSON.parse(readFileSync(coversFile, 'utf8')) : {}
  const coverField = { categories: 'image_url', blog_posts: 'cover_image_url' } as const
  const swaps: { table: 'categories' | 'blog_posts'; slug: string; field: string; from: string | null; to: string | null; via: string | null }[] = []
  for (const table of ['categories', 'blog_posts'] as const) {
    for (const [slug, via] of Object.entries(covers[table] ?? {})) {
      const field = coverField[table]
      const { data: row, error: e } = await sb.from(table).select(`slug, ${field}`).eq('slug', slug).single()
      if (e || !row) throw new Error(`${table} ${slug} not found`)
      let to: string | null = null
      if (via) {
        const { data: p } = await sb.from('products').select('slug, product_images(image_url, is_primary, order)').eq('slug', via).single()
        const imgs = ((p?.product_images ?? []) as { image_url: string; is_primary: boolean; order: number }[]).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.order - b.order)
        if (!imgs.length) throw new Error(`Cover product ${via} has no photo`)
        if (slugs.includes(via)) throw new Error(`Cover product ${via} is itself being taken down`)
        to = imgs[0].image_url
      }
      swaps.push({ table, slug, field, from: (row as Record<string, string | null>)[field], to, via })
    }
  }

  // Safety: anything else in the database that names the same file keeps it alive
  // (cover rows are checked with their new value, since they are swapped first).
  const otherImgs = (await all<Img>('product_images', 'product_id, image_url')).filter((r) => !targetIds.has(r.product_id))
  const tableRows = await Promise.all(
    ['categories', 'banners', 'banner_settings', 'blog_posts', 'homepage_sections', 'supplier_products', 'supplier_categories'].map(async (t) =>
      (await all<Record<string, unknown>>(t)).map((r) => {
        const s = swaps.find((x) => x.table === t && x.slug === r.slug)
        return JSON.stringify(s ? { ...r, [s.field]: s.to } : r)
      })
    )
  )
  const otherText = [...otherImgs.map((r) => r.image_url), ...tableRows.flat()].join('\n')
  const protectedNames = new Set<string>()
  // Match an image file name (`/<name>.<ext>`), not the bare name: many files are named after the
  // product slug, and blog posts link to /products/<slug> without using its photo.
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  for (const p of candidates) {
    if (new RegExp(`/${esc(base(p))}\\.(webp|png|jpe?g)`, 'i').test(otherText)) protectedNames.add(base(p))
  }

  const existing = await listBucket()
  const toDelete = [...candidates].filter((p) => existing.has(p) && !protectedNames.has(base(p))).sort()
  const kept = [...candidates].filter((p) => existing.has(p) && protectedNames.has(base(p))).sort()

  console.log(`${products.length} products, ${rows.length} photo rows to remove`)
  console.log(`${candidates.size} candidate storage paths; ${toDelete.length} exist and will be deleted; ${kept.length} kept (used elsewhere)`)
  kept.forEach((p) => console.log(`  keep ${p}`))
  const soft = products.filter((p) => p.deleted_at)
  if (soft.length) console.log(`note: ${soft.length} already soft-deleted: ${soft.map((p) => p.slug).join(', ')}`)

  swaps.forEach((s) => console.log(`cover ${s.table}/${s.slug}: ${s.via ? `→ ${s.via}'s photo` : '→ none'}`))
  writeFileSync(resolve(dir, 'plan.json'), JSON.stringify({ products: products.map((p) => ({ id: p.id, slug: p.slug, name: p.name, photos: p.product_images.length })), swaps, toDelete, kept }, null, 2))
  if (!APPLY) {
    console.log(`\nDry run. Plan written to ${dir}/plan.json. Pass --apply to execute.`)
    return
  }

  // 1. Archive rows + files before touching anything.
  const arch = resolve(dir, 'archive')
  mkdirSync(resolve(arch, 'files'), { recursive: true })
  writeFileSync(resolve(arch, 'rows.json'), JSON.stringify(rows, null, 2))
  writeFileSync(resolve(arch, 'cover-swaps.json'), JSON.stringify(swaps, null, 2))
  let saved = 0
  for (const p of toDelete) {
    const dest = resolve(arch, 'files', p)
    if (existsSync(dest)) { saved++; continue }
    const { data, error: e } = await sb.storage.from(BUCKET).download(p)
    if (e || !data) throw new Error(`Archive download failed for ${p}: ${e?.message}. Nothing deleted.`)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, Buffer.from(await data.arrayBuffer()))
    saved++
  }
  console.log(`Archived ${rows.length} rows and ${saved} files to ${arch}`)

  // 2. Cover swaps, then photo rows.
  for (const s of swaps) {
    const { error: e } = await sb.from(s.table).update({ [s.field]: s.to }).eq('slug', s.slug)
    if (e) throw new Error(`Cover swap ${s.table}/${s.slug} failed: ${e.message}`)
  }
  console.log(`Swapped ${swaps.length} category/blog covers`)
  const ids = rows.map((r) => r.id)
  for (let i = 0; i < ids.length; i += 200) {
    const { error: e } = await sb.from('product_images').delete().in('id', ids.slice(i, i + 200))
    if (e) throw new Error(`Row delete failed: ${e.message}`)
  }
  console.log(`Deleted ${ids.length} product_images rows`)

  // 3. Storage objects.
  for (let i = 0; i < toDelete.length; i += 100) {
    const { error: e } = await sb.storage.from(BUCKET).remove(toDelete.slice(i, i + 100))
    if (e) throw new Error(`Storage delete failed at batch ${i / 100}: ${e.message}`)
  }
  writeFileSync(resolve(dir, 'deleted-paths.txt'), toDelete.join('\n') + '\n')
  console.log(`Deleted ${toDelete.length} storage objects (list in deleted-paths.txt)`)
}

main()
  .then(() => (APPLY ? revalidateSite('catalog') : undefined))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
