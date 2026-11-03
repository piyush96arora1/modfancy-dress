/**
 * Replace every photo of one product with a single new photo (e.g. an AI-generated shot
 * that replaces third-party model photos).
 *
 *   npx tsx scripts/replace-product-photo.ts <slug> <image-file>           (dry run)
 *   npx tsx scripts/replace-product-photo.ts <slug> <image-file> --apply
 *
 * What --apply does:
 * 1. Backs up the product's current product_images rows to
 *    .scratch/ai-photos/backup/<slug>-<timestamp>.json (enough to restore them).
 * 2. Encodes the file as WebP and uploads products-webp/<slug>-<timestamp>.webp plus the
 *    products-w400|w800|w1600 variants the storefront reads (lib/utils/image-variants.ts),
 *    all with a one-year cacheControl.
 * 3. Deletes the old product_images rows and inserts one primary row for the new photo.
 *
 * Old storage objects are left in place, so restoring is just re-inserting the backed-up rows.
 * --apply then calls /api/revalidate (scope 'catalog') so the new photo shows immediately.
 */
import { config } from 'dotenv'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { VARIANT_WIDTHS, variantPath } from '../lib/utils/image-variants'
import { revalidateSite } from './lib/revalidate'

config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const sb = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const BUCKET = 'product-images'
const QUALITY = 80
const MAX_SIDE = 1600
const BACKUP_DIR = resolve(process.cwd(), '.scratch/ai-photos/backup')

const [slug, file] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const APPLY = process.argv.includes('--apply')

const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`

async function upload(path: string, body: Buffer) {
  const { error } = await sb.storage.from(BUCKET).upload(path, body, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw new Error(`Upload ${path} failed: ${error.message}`)
}

async function main() {
  if (!slug || !file) {
    console.error('Usage: npx tsx scripts/replace-product-photo.ts <slug> <image-file> [--apply]')
    process.exit(1)
  }

  const { data: product, error } = await sb
    .from('products')
    .select('id, name, slug, product_images(*)')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()
  if (error || !product) throw new Error(`Product "${slug}" not found: ${error?.message}`)
  const oldRows = (product.product_images ?? []) as Record<string, unknown>[]

  const source = readFileSync(file)
  const original = await sharp(source)
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer()
  const meta = await sharp(original).metadata()
  const stamp = Date.now()
  const path = `products-webp/${slug}-${stamp}.webp`
  const variants = await Promise.all(
    VARIANT_WIDTHS.map(async (w) => ({
      path: variantPath(path, w)!,
      body: await sharp(source)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer(),
    }))
  )

  console.log(`${product.name} (${product.slug})`)
  console.log(`  replacing ${oldRows.length} image(s):`)
  oldRows.forEach((r) => console.log(`    - ${r.image_url}`))
  console.log(`  with ${path} (${meta.width}x${meta.height}, ${kb(original.length)})`)
  variants.forEach((v) => console.log(`    + ${v.path} (${kb(v.body.length)})`))

  if (!APPLY) {
    console.log('\nDry run. Pass --apply to write.')
    return
  }

  mkdirSync(BACKUP_DIR, { recursive: true })
  const backup = resolve(BACKUP_DIR, `${slug}-${stamp}.json`)
  writeFileSync(backup, JSON.stringify({ product: { id: product.id, slug }, rows: oldRows }, null, 2))
  console.log(`\nBacked up old rows to ${backup}`)

  await upload(path, original)
  for (const v of variants) await upload(v.path, v.body)
  console.log('Uploaded original and variants.')

  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
  const alt = (oldRows.find((r) => r.is_primary)?.alt_text as string | undefined) ?? product.name
  const { error: insertError } = await sb
    .from('product_images')
    .insert({ product_id: product.id, image_url: imageUrl, is_primary: true, order: 0, alt_text: alt })
  if (insertError) throw new Error(`Insert failed (old rows untouched): ${insertError.message}`)

  const oldIds = oldRows.map((r) => r.id as string)
  if (oldIds.length) {
    const { error: deleteError } = await sb.from('product_images').delete().in('id', oldIds)
    if (deleteError) throw new Error(`New row added but old rows not removed: ${deleteError.message}`)
  }
  console.log(`Done: ${product.slug} now has 1 image → ${imageUrl}`)
}

main()
  .then(() => (APPLY ? revalidateSite('catalog') : undefined))
  .catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
