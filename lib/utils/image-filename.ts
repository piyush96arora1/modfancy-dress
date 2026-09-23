/**
 * Descriptive storage filenames for product images, derived from the product slug.
 *
 * Google Images uses the filename as a ranking signal; `1785840443859-hynu57imhwu.webp`
 * says nothing, `dandiya-dress-for-women-2.webp` does. Existing files keep their URLs
 * (renaming would throw away the image-search history they have); this is for new uploads.
 */

/** `<slug>` for the primary image, `<slug>-2`, `<slug>-3`… after it. No extension. */
export function imageStem(slug: string, index: number): string {
  const base =
    slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product'
  return `${base}${index > 0 ? `-${index + 1}` : ''}`
}

export function imageFilename(slug: string, index: number, ext: string): string {
  return `${imageStem(slug, index)}.${ext}`
}
