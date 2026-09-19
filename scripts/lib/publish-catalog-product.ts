/**
 * Publishes products from the private supplier catalogue (/catalog) into the
 * public storefront.
 *
 * Extracted from scripts/import-garba-ghoomer-lehengas.ts when the second batch
 * needed the same machinery. A calling script declares only what is specific to
 * its batch — the listings, the price, the categories — and this module owns
 * everything that must not vary: the meta-length guard, the image copy, the
 * insert order, and the dry-run report.
 *
 * Two rules are deliberately baked in here rather than left to callers:
 *
 *   Images are COPIED from catalog/full/ into products-webp/, never linked, so
 *   a future catalogue re-import cannot break a live product page.
 *
 *   The image is copied BEFORE the product row is inserted. A product with no
 *   usable image is worse than no product, and a half-finished run is safe to
 *   re-run: existing slugs are skipped and an already-copied object is tolerated.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'product-images'
/** generatePageMetadata truncates above this. */
export const META_MAX = 155

/**
 * The supplier_* tables are not in types/database.ts, so supabase-js infers
 * their rows as `never`. Declaring the shapes here keeps the reads typed
 * without an `any` cast, the same split supplier-queries.ts uses.
 */
type SupplierImageRow = { url: string; is_primary: boolean | null; sort_order: number | null }
type SupplierProductRow = { slug: string; supplier_product_images: SupplierImageRow[] | null }

export type Listing = {
  /** Row in supplier_products this is built from. */
  supplierSlug: string
  slug: string
  name: string
  /** Assembled body copy, newlines included — product pages render pre-line. */
  description: string
  meta_description: string
  seo_title: string
  /**
   * Alt text per image, in the order the catalogue sorts them (primary first).
   * A batch whose products have one photo each passes a single-element array.
   * Running out of alts is an error, not a silent null: an image with no alt is
   * exactly the gap these imports exist to close.
   */
  alts: string[]
}

export type PublishOptions = {
  price: number
  rentPrice: number | null
  rentDeposit: number | null
  size: string | null
  /** Written to products.category_id, and the category whose name drives keywords. */
  primaryCategoryId: string
  /** Every category the product should appear in, including the primary one. */
  categoryIds: string[]
  apply: boolean
}

/** `.../object/public/product-images/catalog/full/x.webp` -> `catalog/full/x.webp` */
function storagePath(publicUrl: string): string {
  const marker = `/object/public/${BUCKET}/`
  const i = publicUrl.indexOf(marker)
  if (i === -1) throw new Error(`cannot derive storage path from ${publicUrl}`)
  return publicUrl.slice(i + marker.length)
}

/** Primary first, then the supplier's own order. */
function sortImages(imgs: SupplierImageRow[]): SupplierImageRow[] {
  return [...imgs].sort(
    (a, b) =>
      Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) ||
      (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )
}

export async function publishCatalogProducts(
  sb: SupabaseClient,
  listings: Listing[],
  opts: PublishOptions
): Promise<{ inserted: number; skipped: number }> {
  // ---- preflight, before a single write
  const tooLong = listings.filter((l) => l.meta_description.length > META_MAX)
  for (const l of tooLong) {
    console.error(`meta_description too long (${l.meta_description.length}): ${l.slug}`)
  }
  if (tooLong.length) throw new Error(`${tooLong.length} meta_description over ${META_MAX} chars`)

  if (new Set(listings.map((l) => l.slug)).size !== listings.length) {
    throw new Error('duplicate slug in listings')
  }
  if (!opts.categoryIds.includes(opts.primaryCategoryId)) {
    throw new Error('categoryIds must include primaryCategoryId')
  }

  const { data: supplierRows, error } = await sb
    .from('supplier_products')
    .select('slug, supplier_product_images(url, is_primary, sort_order)')
    .in(
      'slug',
      listings.map((l) => l.supplierSlug)
    )
  if (error) throw new Error(`supplier read failed: ${error.message}`)

  const sourceImages = new Map<string, string[]>()
  for (const row of (supplierRows ?? []) as unknown as SupplierProductRow[]) {
    sourceImages.set(
      row.slug,
      sortImages(row.supplier_product_images ?? []).map((i) => i.url)
    )
  }

  for (const l of listings) {
    const urls = sourceImages.get(l.supplierSlug)
    if (!urls?.length) throw new Error(`no catalogue image for ${l.supplierSlug}`)
    if (l.alts.length < urls.length) {
      throw new Error(
        `${l.slug}: ${urls.length} catalogue images but ${l.alts.length} alt texts`
      )
    }
  }

  console.log(`${opts.apply ? 'APPLYING' : 'DRY RUN'} — ${listings.length} products\n`)

  let inserted = 0
  let skipped = 0

  for (const l of listings) {
    const { data: existing } = await sb
      .from('products')
      .select('id')
      .eq('slug', l.slug)
      .maybeSingle()

    if (existing) {
      console.log(`SKIP  ${l.slug} — already exists`)
      skipped++
      continue
    }

    const urls = sourceImages.get(l.supplierSlug)!
    // One photo keeps the bare slug so existing objects are not orphaned; more
    // than one gets an index suffix.
    const targets = urls.map((_, n) =>
      urls.length === 1 ? `products-webp/${l.slug}.webp` : `products-webp/${l.slug}-${n}.webp`
    )

    if (!opts.apply) {
      const rent =
        opts.rentPrice === null
          ? 'buy only'
          : `rent ₹${opts.rentPrice} · deposit ₹${opts.rentDeposit}`
      console.log(`NEW   ${l.name}`)
      console.log(`      /products/${l.slug}`)
      console.log(`      ₹${opts.price} · ${rent} · size ${opts.size ?? '(none)'}`)
      console.log(`      categories: ${opts.categoryIds.length}`)
      console.log(`      title: ${l.seo_title}`)
      console.log(`      meta (${l.meta_description.length}): ${l.meta_description}`)
      urls.forEach((u, n) => console.log(`      image ${n}: ${storagePath(u)}\n           -> ${targets[n]}`))
      console.log(`      ${l.description.split('\n').join('\n      ')}\n`)
      inserted++
      continue
    }

    // ---- images first
    const publicUrls: string[] = []
    for (let n = 0; n < urls.length; n++) {
      const { error: copyErr } = await sb.storage
        .from(BUCKET)
        .copy(storagePath(urls[n]), targets[n])
      if (copyErr && !/exists/i.test(copyErr.message)) {
        throw new Error(`image copy failed for ${l.slug}: ${copyErr.message}`)
      }
      publicUrls.push(sb.storage.from(BUCKET).getPublicUrl(targets[n]).data.publicUrl)
    }

    const { data: product, error: insErr } = await sb
      .from('products')
      .insert({
        name: l.name,
        slug: l.slug,
        description: l.description,
        category_id: opts.primaryCategoryId,
        price: opts.price,
        rent_price: opts.rentPrice,
        rent_deposit: opts.rentDeposit,
        size: opts.size,
        is_active: true,
        seo_title: l.seo_title,
        meta_description: l.meta_description,
      })
      .select('id')
      .single()
    if (insErr || !product) throw new Error(`insert failed for ${l.slug}: ${insErr?.message}`)
    const productId = (product as { id: string }).id

    const { error: junErr } = await sb
      .from('product_categories')
      .insert(opts.categoryIds.map((category_id) => ({ product_id: productId, category_id })))
    if (junErr) throw new Error(`category link failed for ${l.slug}: ${junErr.message}`)

    const { error: imgErr } = await sb.from('product_images').insert(
      publicUrls.map((image_url, n) => ({
        product_id: productId,
        image_url,
        alt_text: l.alts[n],
        is_primary: n === 0,
        order: n,
      }))
    )
    if (imgErr) throw new Error(`image row failed for ${l.slug}: ${imgErr.message}`)

    console.log(`OK    ${l.slug}`)
    inserted++
  }

  console.log(`\n${opts.apply ? 'inserted' : 'would insert'}: ${inserted} · skipped: ${skipped}`)
  if (!opts.apply) console.log('\nRe-run with --apply to write.')

  return { inserted, skipped }
}
