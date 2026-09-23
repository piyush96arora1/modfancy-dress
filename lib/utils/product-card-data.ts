import type { ProductCardData } from '@/types/database'

type CategoryRef = { name: string; slug: string }

/** Row shape returned by the card-sized /products select. */
export type ProductCardRow = {
  id: string
  slug: string
  name: string
  price: number | null
  wholesale_price: number | null
  rent_price: number | null
  category: CategoryRef | null
  categories: { category: CategoryRef | null }[] | null
  images: { image_url: string; alt_text: string | null; is_primary: boolean }[] | null
  variants: { price_override: number | null }[] | null
}

/**
 * Reduce a product row to what a listing card renders: the primary image (or the
 * first), the first variant's price, and the category names/slugs the badge and
 * the client-side category filter read. Everything else stays out of the payload.
 */
export function toProductCardData(row: ProductCardRow): ProductCardData {
  const images = row.images ?? []
  const primary = images.find((img) => img.is_primary) ?? images[0]
  const firstVariant = (row.variants ?? [])[0]
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    wholesale_price: row.wholesale_price,
    rent_price: row.rent_price,
    category: row.category,
    categories: (row.categories ?? []).filter(
      (j): j is { category: CategoryRef } => j?.category != null
    ),
    images: primary ? [primary] : [],
    variants: firstVariant ? [{ price_override: firstVariant.price_override }] : [],
  }
}
