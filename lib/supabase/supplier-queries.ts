import { unstable_cache } from 'next/cache'
import type { PostgrestError } from '@supabase/supabase-js'
import { createPublicServerClient } from './public-server'
import {
  supplierDisplayPrice,
  formatSupplierPrice,
  DEFAULT_MARKUP_PCT,
} from '@/lib/utils/supplier-pricing'

/**
 * Read layer for the private supplier catalog at /catalog.
 *
 * INVARIANT: `supplier_price` never leaves this module. Every exported shape carries a
 * formatted `priceLabel` only, so the owner's cost cannot be read out of page HTML or a
 * client payload.
 *
 * Reads throw rather than degrading to empty data, following the reasoning in
 * cached-queries.ts: an outage that returns null must not render as a *successful* empty
 * catalog that Next.js then bakes into static HTML and caches.
 *
 * Each query is a plain exported `fetch*` function plus an `unstable_cache` wrapper.
 * `unstable_cache` throws "incrementalCache missing" outside the Next runtime, so the split
 * is what makes these queries verifiable from a script or a test.
 */

const ONE_DAY = 86400
const ONE_HOUR = 3600
export const CATALOG_PAGE_SIZE = 48

/** PostgREST code for "single() matched zero rows" — a legitimate 404, not a failure. */
const NO_ROWS = 'PGRST116'

/**
 * The supplier_* tables are not in types/database.ts, so supabase-js infers their row type as
 * `never`. Row shapes are declared here and applied through the unwrap helpers' type argument,
 * which keeps the casts in one place instead of sprinkling `any` across every query.
 */
type Result = { data: unknown; error: PostgrestError | null }

type CategoryRow = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_url: string | null
  thumbnail_url: string | null
}

function unwrap<T>(result: Result, what: string): T | null {
  if (result.error) {
    throw new Error(`[supplier-queries] ${what} failed: ${result.error.message}`)
  }
  return result.data as T | null
}

function unwrapMaybe<T>(result: Result, what: string): T | null {
  if (result.error && result.error.code !== NO_ROWS) {
    throw new Error(`[supplier-queries] ${what} failed: ${result.error.message}`)
  }
  return result.data as T | null
}

export type CatalogCategory = {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  thumbnailUrl: string | null
  childCount: number
}

export type CatalogProduct = {
  id: string
  name: string
  slug: string
  priceLabel: string
  categoryName: string
  categorySlug: string
  thumbUrl: string | null
  setValue: number
  minOrderQty: number
}

/*
 * Deliberately ABSENT from every client-facing shape:
 *
 *   supplier_price  — the cost itself.
 *   notes           — 135 of the 179 supplier notes contain digits and many are the cost
 *                     verbatim ("1500" on an item costing ₹1500 that we show at ₹1800,
 *                     "2 pair 60 ke" on a ₹30 item). Rendering them would defeat the point of
 *                     hiding supplier_price. The column stays populated for the owner.
 *   variants[].rate — the supplier's per-size cost (334 rows carry one). Exposed only as a
 *                     marked-up priceLabel, never raw.
 */

export type CatalogVariant = {
  color: string
  size: string
  /** Marked-up price for this size, or null when the size carries no separate rate. */
  priceLabel: string | null
  inStock: boolean
}

export type CatalogProductDetail = CatalogProduct & {
  images: { url: string; thumbUrl: string }[]
  hasSizes: boolean
  variants: CatalogVariant[] | null
}

export type CatalogCategoryPage = {
  category: CategoryRow
  parent: { name: string; slug: string } | null
  children: CatalogCategory[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------- markup

/** Markup percentage, mirroring getWholesaleDiscountPctCached. Defaults if the row is absent. */
export async function fetchCatalogMarkupPct(): Promise<number> {
  const result = await createPublicServerClient()
    .from('site_settings')
    .select('value')
    .eq('key', 'supplier_markup_pct')
    .maybeSingle()
  const data = unwrapMaybe<{ value?: { value?: number } }>(result, 'catalog markup pct')
  const pct = data?.value?.value
  return typeof pct === 'number' ? pct : DEFAULT_MARKUP_PCT
}

export const getCatalogMarkupPctCached = unstable_cache(
  fetchCatalogMarkupPct,
  ['catalog-markup-pct'],
  { revalidate: ONE_HOUR, tags: ['catalog', 'settings'] }
)

// ---------------------------------------------------------------- mapping

/** Maps a raw row to the client-safe shape. This is where supplier_price is dropped. */
function toCatalogProduct(row: any, markupPct: number): CatalogProduct {
  const images = row.supplier_product_images ?? []
  const primary = images.find((i: any) => i.is_primary) ?? images[0]
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    priceLabel: formatSupplierPrice(supplierDisplayPrice(Number(row.supplier_price), markupPct)),
    categoryName: row.supplier_categories?.name ?? row.category_name ?? '',
    categorySlug: row.supplier_categories?.slug ?? row.category_slug ?? '',
    thumbUrl: primary?.thumb_url ?? row.thumb_url ?? null,
    setValue: row.set_value ?? 1,
    minOrderQty: row.min_order_qty ?? 0,
  }
}

const toCatalogCategory = (c: CategoryRow, childCount = 0): CatalogCategory => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  imageUrl: c.image_url,
  thumbnailUrl: c.thumbnail_url,
  childCount,
})

// ---------------------------------------------------------------- categories

export async function fetchCatalogRootCategories(): Promise<CatalogCategory[]> {
  const supabase = createPublicServerClient()

  const roots = unwrap<CategoryRow[]>(
    await supabase
      .from('supplier_categories')
      .select('id, name, slug, parent_id, image_url, thumbnail_url')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('sort_order', { ascending: false }),
    'catalog root categories'
  )

  const children = unwrap<{ parent_id: string }[]>(
    await supabase.from('supplier_categories').select('parent_id').not('parent_id', 'is', null),
    'catalog child counts'
  )

  const childCounts = new Map<string, number>()
  for (const c of children ?? []) {
    childCounts.set(c.parent_id, (childCounts.get(c.parent_id) ?? 0) + 1)
  }

  return (roots ?? []).map((c) => toCatalogCategory(c, childCounts.get(c.id) ?? 0))
}

export const getCatalogRootCategoriesCached = unstable_cache(
  fetchCatalogRootCategories,
  ['catalog-root-categories'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

export async function fetchCatalogCategoryBySlug(
  slug: string
): Promise<CatalogCategoryPage | null> {
  const supabase = createPublicServerClient()

  const category = unwrapMaybe<CategoryRow>(
    await supabase
      .from('supplier_categories')
      .select('id, name, slug, parent_id, image_url, thumbnail_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(),
    `catalog category ${slug}`
  )
  if (!category) return null

  const children = unwrap<CategoryRow[]>(
    await supabase
      .from('supplier_categories')
      .select('id, name, slug, parent_id, image_url, thumbnail_url')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: false }),
    `catalog children of ${slug}`
  )

  let parent: { name: string; slug: string } | null = null
  if (category.parent_id) {
    parent = unwrapMaybe<{ name: string; slug: string }>(
      await supabase
        .from('supplier_categories')
        .select('name, slug')
        .eq('id', category.parent_id)
        .maybeSingle(),
      `catalog parent of ${slug}`
    )
  }

  return { category, parent, children: (children ?? []).map((c) => toCatalogCategory(c)) }
}

export const getCatalogCategoryBySlugCached = unstable_cache(
  fetchCatalogCategoryBySlug,
  ['catalog-category'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

// ---------------------------------------------------------------- products

/**
 * Products in a category, including everything beneath it.
 *
 * Descendants come from our own parent_id tree rather than the supplier's parent listing,
 * which is provably incomplete — it omits 16 products across the four parent categories.
 */
export async function fetchCatalogProductsForCategory(slug: string, page: number) {
  const supabase = createPublicServerClient()
  const markupPct = await fetchCatalogMarkupPct()

  const category = unwrapMaybe<{ id: string }>(
    await supabase.from('supplier_categories').select('id').eq('slug', slug).maybeSingle(),
    `catalog category id ${slug}`
  )
  if (!category) return { products: [], total: 0, pageSize: CATALOG_PAGE_SIZE }

  const kids = unwrap<{ id: string }[]>(
    await supabase.from('supplier_categories').select('id').eq('parent_id', category.id),
    `catalog descendants of ${slug}`
  )
  const ids = [category.id, ...(kids ?? []).map((k) => k.id)]

  const from = (page - 1) * CATALOG_PAGE_SIZE
  const result = await supabase
    .from('supplier_products')
    .select(
      'id, name, slug, supplier_price, set_value, min_order_qty,' +
        'supplier_categories!inner(name, slug), supplier_product_images(thumb_url, is_primary)',
      { count: 'exact' }
    )
    .in('category_id', ids)
    .eq('is_active', true)
    .order('name')
    .range(from, from + CATALOG_PAGE_SIZE - 1)

  // A ?page= beyond the last page makes PostgREST answer 416 with no error code, which
  // unwrap would otherwise turn into a 500. An offset past the end is a dead link, not an
  // outage: return an empty page so the route can 404. Every other error still throws.
  if (result.status === 416) {
    return { products: [], total: result.count ?? 0, pageSize: CATALOG_PAGE_SIZE }
  }

  const rows = unwrap<any[]>(result, `catalog products ${slug}`)

  return {
    products: (rows ?? []).map((r) => toCatalogProduct(r, markupPct)),
    total: result.count ?? 0,
    pageSize: CATALOG_PAGE_SIZE,
  }
}

export const getCatalogProductsForCategoryCached = unstable_cache(
  fetchCatalogProductsForCategory,
  ['catalog-category-products'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

export async function fetchCatalogProductBySlug(
  slug: string
): Promise<CatalogProductDetail | null> {
  const supabase = createPublicServerClient()
  const markupPct = await fetchCatalogMarkupPct()

  const data = unwrapMaybe<any>(
    await supabase
      .from('supplier_products')
      .select(
        'id, name, slug, supplier_price, set_value, min_order_qty, has_sizes, variants,' +
          'supplier_categories!inner(name, slug),' +
          'supplier_product_images(url, thumb_url, is_primary, sort_order)'
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(),
    `catalog product ${slug}`
  )
  if (!data) return null

  const images = [...(data.supplier_product_images ?? [])]
    .sort(
      (a: any, b: any) =>
        Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) ||
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )
    .map((i: any) => ({ url: i.url, thumbUrl: i.thumb_url }))

  // Marked up per size; the raw supplier rate never leaves this function.
  const rawVariants = (data.variants ?? []) as {
    color: string
    size: string
    rate: number
    in_stock: boolean
  }[]
  const variants: CatalogVariant[] = rawVariants.map((v) => ({
    color: v.color,
    size: v.size,
    priceLabel: v.rate > 0 ? formatSupplierPrice(supplierDisplayPrice(v.rate, markupPct)) : null,
    inStock: Boolean(v.in_stock),
  }))

  return {
    ...toCatalogProduct(data, markupPct),
    images,
    hasSizes: Boolean(data.has_sizes),
    variants: variants.length ? variants : null,
  }
}

export const getCatalogProductBySlugCached = unstable_cache(
  fetchCatalogProductBySlug,
  ['catalog-product'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

// ---------------------------------------------------------------- counts & search

export async function fetchCatalogCounts() {
  const supabase = createPublicServerClient()
  const [products, categories] = await Promise.all([
    supabase
      .from('supplier_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('supplier_categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])
  if (products.error) {
    throw new Error(`[supplier-queries] catalog product count: ${products.error.message}`)
  }
  if (categories.error) {
    throw new Error(`[supplier-queries] catalog category count: ${categories.error.message}`)
  }
  return { products: products.count ?? 0, categories: categories.count ?? 0 }
}

export const getCatalogCountsCached = unstable_cache(fetchCatalogCounts, ['catalog-counts'], {
  revalidate: ONE_DAY,
  tags: ['catalog'],
})

/** Not cached: search terms are unbounded, so caching them would bloat the cache for no gain. */
export async function searchCatalog(term: string): Promise<CatalogProduct[]> {
  const trimmed = term.trim()
  if (trimmed.length < 2) return []
  const markupPct = await fetchCatalogMarkupPct()
  const { data, error } = await createPublicServerClient().rpc('search_supplier_catalog', {
    search_term: trimmed,
    result_limit: 48,
  })
  if (error) throw new Error(`[supplier-queries] catalog search failed: ${error.message}`)
  return ((data as any[]) ?? []).map((r) => toCatalogProduct(r, markupPct))
}
