/**
 * Pre-generated, resized real-WebP variants of product photos.
 *
 * Next's image optimiser stays off (`images.unoptimized`), so grid cards used to download
 * the 1400-1600px originals (420-510KB, some PNG bytes named .webp) to draw a ~180px tile.
 * scripts/generate-image-variants.ts writes `products-w400|w800|w1600/<name>.webp` next to
 * every original, and the uploader writes the 400/800 ones for new photos. Components pick
 * a width with `variantUrl` and fall back to the original URL `onError`, so a photo with no
 * variant yet still renders.
 *
 * Relative import on purpose: `tsx --test` does not resolve the `@/` alias.
 */
import { getImageUrl } from '../imageUrl'

export type VariantWidth = 400 | 800 | 1600
export const VARIANT_WIDTHS: readonly VariantWidth[] = [400, 800, 1600]

const RE = /\/product-images\/products-webp\/([^/?#]+)\.(webp|png|jpe?g)(\?[^#]*)?$/i
const PATH_RE = /^products-webp\/([^/?#]+)\.(webp|png|jpe?g)$/i

/** Resized WebP URL for a product image; any other URL is returned unchanged. */
export function variantUrl(url: string, width: VariantWidth): string {
  const m = url.match(RE)
  if (!m) return url
  return url.replace(RE, `/product-images/products-w${width}/${m[1]}.webp${m[3] ?? ''}`)
}

/** Storage path (inside the bucket) of a variant, or null when the path has none. */
export function variantPath(path: string, width: VariantWidth): string | null {
  const m = path.match(PATH_RE)
  return m ? `products-w${width}/${m[1]}.webp` : null
}

/** The 400w card image for a stored product image URL (legacy paths resolved first). */
export const cardImageUrl = (url: string) => variantUrl(getImageUrl(url), 400)
