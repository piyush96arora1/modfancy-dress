import type { ProductCardData } from '@/types/database'

/**
 * Only the fields ProductCard renders.
 *
 * ProductCard is a client component, so every prop is serialised into the page's RSC
 * payload (and inlined into the HTML). Grids were handed full product rows: description,
 * SEO title, meta description, timestamps, every gallery image and variant. On the
 * homepage that was ~125 KB of RSC data (/rent ~150 KB), downloaded, parsed and hydrated
 * before the page became interactive. The card shows one image, one category name, the
 * first variant's price override and the prices, so that is all it gets.
 */
export function toCardData(product: ProductCardData): ProductCardData {
  const primary = product.images.find((img) => img.is_primary) || product.images[0]
  const firstCategory = product.categories?.[0]?.category
  const firstVariant = product.variants[0]
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    wholesale_price: product.wholesale_price,
    rent_price: product.rent_price,
    category: product.category ? { name: product.category.name } : null,
    ...(firstCategory ? { categories: [{ category: { name: firstCategory.name } }] } : {}),
    images: primary
      ? [{ image_url: primary.image_url, is_primary: true, alt_text: primary.alt_text ?? null }]
      : [],
    variants: firstVariant ? [{ price_override: firstVariant.price_override }] : [],
  }
}
