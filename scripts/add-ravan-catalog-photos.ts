/**
 * Adds the other Ravan costume photographs from the private supplier catalogue
 * to the public Ravan product page, so one page shows the range of Ravan
 * dresses the shop actually holds rather than a single costume.
 *
 * These are NOT extra angles of one garment — the catalogue stores exactly one
 * photograph per item, and each entry below is a different Ravan costume. That
 * is deliberate and was the point of the request: show the variety on one page.
 *
 * Two catalogue entries matching "ravan" are deliberately left out:
 *
 *   Ravan Dress 3  — pixel-identical to the photograph already live on
 *                    /products/kumbhkaran-fancy-dress. Adding it here would put
 *                    the same image on two product pages.
 *   Ravan Mukut ×3 — crowns, not dresses. The product copy states the mukut is
 *                    bought separately, so showing one in the dress gallery
 *                    would imply it is included.
 *
 * Images are COPIED from catalog/full/ into products-webp/ rather than linked
 * in place, so the public product does not depend on catalogue storage paths.
 *
 * Note on resolution: these catalogue originals are 852–1214px wide and carry a
 * repeated @modfancydress watermark. The existing primary image is a clean
 * 300px downscale of its own catalogue original and is left untouched, so the
 * gallery mixes one clean low-res shot with several watermarked high-res ones.
 *
 * Dry run:  npx tsx scripts/add-ravan-catalog-photos.ts
 * Apply:    npx tsx scripts/add-ravan-catalog-photos.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')
const BUCKET = 'product-images'
const TARGET_DIR = 'products-webp'
const PRODUCT_SLUG = 'ravan-fancy-dress'

/** Catalogue slug -> alt text written against that specific photograph. */
const ADD: { catalogSlug: string; alt: string }[] = [
  {
    catalogSlug: 'ravan-dress',
    alt: 'Black velvet Ravan fancy dress with gold tinsel fringe, green leaf yoke and criss-cross gold bands',
  },
  {
    catalogSlug: 'ravan-dress-1',
    alt: 'Black Ravan costume with a blue and gold jewelled yoke, mirror work and heavy gold fringe',
  },
  {
    catalogSlug: 'ravan-2',
    alt: 'Black velvet Ravan dress with a gold embroidered yoke and scalloped fringed skirt panels',
  },
  {
    catalogSlug: 'ravan-3',
    alt: 'Royal blue velvet Ravan fancy dress with gold zari yoke and fringed hem',
  },
  {
    catalogSlug: 'ravan-dress-adult',
    alt: 'Adult Ravan costume in black with a dense gold lattice pattern and gold fringe hem',
  },
  {
    catalogSlug: 'ravan-dress-blue',
    alt: 'Royal blue Ravan dress with gold tinsel fringe and criss-cross gold bands on the skirt',
  },
  {
    catalogSlug: 'ravan-dress-blue-2',
    alt: 'Royal blue Ravan costume with silver leaf motifs and a scalloped gold fringed hem',
  },
]

/** Left out on purpose — see the header comment. */
const EXCLUDED = [
  ['ravan-dress-3', 'same photo as the live kumbhkaran-fancy-dress product'],
  ['ravan-mukut-big-size', 'crown, sold separately'],
  ['ravan-mukut-small', 'crown, sold separately'],
  ['folding-mukut-kids-ravan', 'crown, sold separately'],
]

/** `https://…/object/public/product-images/catalog/full/x.webp` -> `catalog/full/x.webp` */
function storagePath(publicUrl: string): string {
  const marker = `/object/public/${BUCKET}/`
  const i = publicUrl.indexOf(marker)
  if (i === -1) throw new Error(`unexpected image url: ${publicUrl}`)
  return publicUrl.slice(i + marker.length)
}

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  console.log('excluded on purpose:')
  for (const [slug, why] of EXCLUDED) console.log(`   - ${slug.padEnd(26)} ${why}`)

  const { data: product } = await sb
    .from('products')
    .select('id, name')
    .eq('slug', PRODUCT_SLUG)
    .maybeSingle()
  if (!product) {
    console.error(`❌ product ${PRODUCT_SLUG} not found`)
    process.exit(1)
  }

  const { data: existing } = await sb
    .from('product_images')
    .select('id, image_url, is_primary, order')
    .eq('product_id', product.id)
    .order('order', { ascending: true })

  const existingUrls = new Set((existing ?? []).map((e) => e.image_url))
  let nextOrder = Math.max(0, ...(existing ?? []).map((e) => e.order ?? 0)) + 1

  console.log(`\nproduct: ${product.name} (${PRODUCT_SLUG})`)
  console.log(`existing images: ${existing?.length ?? 0} — primary kept, new ones appended from order ${nextOrder}\n`)

  console.log('=== ADDING ===')
  let added = 0
  for (const item of ADD) {
    const { data: cp } = await sb
      .from('supplier_products')
      .select('id, name')
      .eq('slug', item.catalogSlug)
      .maybeSingle()
    if (!cp) {
      console.error(`❌ ${item.catalogSlug}: not in catalogue`)
      continue
    }
    const { data: imgs } = await sb
      .from('supplier_product_images')
      .select('url')
      .eq('product_id', cp.id)
      .order('sort_order', { ascending: true })
      .limit(1)
    const srcUrl = imgs?.[0]?.url
    if (!srcUrl) {
      console.error(`❌ ${item.catalogSlug}: no image`)
      continue
    }

    const src = storagePath(srcUrl)
    const dest = `${TARGET_DIR}/ravan-${item.catalogSlug}-${Date.now()}${added}.webp`
    const destUrl = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl

    if (existingUrls.has(destUrl)) {
      console.log(`   ✔ ${item.catalogSlug}: already present`)
      continue
    }

    console.log(`${cp.name}`)
    console.log(`   copy  ${src}`)
    console.log(`     ->  ${dest}`)
    console.log(`   order ${nextOrder} | alt "${item.alt.slice(0, 62)}…"`)

    if (APPLY) {
      const { error: copyErr } = await sb.storage.from(BUCKET).copy(src, dest)
      if (copyErr) {
        console.error(`   ❌ copy failed: ${copyErr.message}`)
        continue
      }
      const { error: rowErr } = await sb.from('product_images').insert({
        product_id: product.id,
        image_url: destUrl,
        is_primary: false,
        order: nextOrder,
        alt_text: item.alt,
      })
      if (rowErr) {
        console.error(`   ❌ row insert failed: ${rowErr.message}`)
        continue
      }
      console.log('   ✅ added')
    }
    nextOrder++
    added++
  }

  console.log(`\n${added} image(s) ${APPLY ? 'added' : 'would be added'}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
