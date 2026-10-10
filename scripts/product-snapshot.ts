/**
 * Everything the catalog-steward needs to look at a product before writing about it, read-only:
 * the row, its categories (primary and junction), its images with alt text, and optionally the
 * photos themselves downloaded to a folder so they can be viewed.
 *
 *   npx tsx scripts/product-snapshot.ts <slug> [<slug>…] [--images <dir>]
 *
 * Prints JSON. Image files are saved as <dir>/<slug>/<image filename>.
 */
import { config } from 'dotenv'
import { resolve, join } from 'path'
import { mkdirSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '../lib/imageUrl'

config({ path: resolve(process.cwd(), '.env.local'), quiet: true })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const args = process.argv.slice(2)
const imagesAt = args.indexOf('--images')
const IMAGE_DIR = imagesAt >= 0 ? args[imagesAt + 1] : null
const slugs = args.filter((a, i) => !a.startsWith('--') && !(imagesAt >= 0 && i === imagesAt + 1))

const basename = (u: string) => u.split('?')[0].split('/').pop()!

async function main() {
  if (!slugs.length) {
    console.error('usage: npx tsx scripts/product-snapshot.ts <slug>… [--images <dir>]')
    process.exit(1)
  }
  const { data: cats, error: ce } = await sb.from('categories').select('id, slug, is_active')
  if (ce) throw ce
  const catSlug = new Map(cats!.map((c) => [c.id as string, `${c.slug}${c.is_active ? '' : ' (inactive)'}`]))

  const { data, error } = await sb
    .from('products')
    .select(
      'id, slug, name, price, rent_price, rent_deposit, size, is_active, deleted_at, created_at, description, meta_description, seo_title, category_id, product_categories(category_id), product_images(image_url, alt_text, is_primary)'
    )
    .in('slug', slugs)
  if (error) throw error

  const out: Record<string, unknown>[] = []
  for (const p of data ?? []) {
    const images = (p.product_images ?? []) as { image_url: string; alt_text: string | null; is_primary: boolean | null }[]
    const files: string[] = []
    if (IMAGE_DIR) {
      const dir = join(IMAGE_DIR, p.slug)
      mkdirSync(dir, { recursive: true })
      for (const img of images) {
        const res = await fetch(getImageUrl(img.image_url))
        if (!res.ok) {
          files.push(`${basename(img.image_url)}: HTTP ${res.status}`)
          continue
        }
        const file = join(dir, basename(img.image_url))
        writeFileSync(file, Buffer.from(await res.arrayBuffer()))
        files.push(file)
      }
    }
    const { product_categories, product_images, category_id, ...row } = p
    out.push({
      ...row,
      primaryCategory: category_id ? catSlug.get(category_id) ?? category_id : null,
      otherCategories: (product_categories ?? []).map((c: { category_id: string }) => catSlug.get(c.category_id) ?? c.category_id),
      images: product_images.map((i: { image_url: string; alt_text: string | null; is_primary: boolean | null }) => ({
        file: basename(i.image_url),
        primary: !!i.is_primary,
        alt_text: i.alt_text,
      })),
      ...(IMAGE_DIR ? { downloaded: files } : {}),
    })
  }
  const missing = slugs.filter((s) => !out.some((p) => p.slug === s))
  console.log(JSON.stringify({ products: out, notFound: missing }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
