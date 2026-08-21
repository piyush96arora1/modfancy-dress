/**
 * Image pipeline for the supplier catalog: resize -> tiled watermark -> WebP.
 *
 * The watermark is tiled rather than placed in a corner so branding survives cropping and
 * screenshotting when a client forwards an image. Tile density scales with image width: a
 * percentage tuned for full-size images renders an illegible ~11px smudge on 400px thumbnails.
 *
 * sharp is a native module and must stay out of the Next build graph, so this file lives under
 * scripts/ and is only ever imported by scripts.
 */
import sharp from 'sharp'

export const WATERMARK_TEXT = '@modfancydress'

/**
 * `constrain` differs per variant on purpose:
 *  - full  'longest' caps either dimension at 1400 so no image is ever huge.
 *  - thumb  'width'  fixes the width at 400 and lets height follow, because these fill a
 *           fixed-width grid card. Capping the longest side instead would render a portrait
 *           source at 225px wide and look broken in the grid.
 */
const VARIANTS = {
  full: { size: 1400, constrain: 'longest', quality: 85, fontPct: 0.028, stepMult: 13 },
  thumb: { size: 400, constrain: 'width', quality: 82, fontPct: 0.055, stepMult: 7.5 },
} as const

export type Variant = keyof typeof VARIANTS

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Repeating diagonal watermark covering the whole canvas. */
export function tiledWatermarkSvg(
  width: number,
  height: number,
  opts: { text?: string; opacity?: number; fontPct?: number; stepMult?: number } = {}
): string {
  const text = escapeXml(opts.text ?? WATERMARK_TEXT)
  const opacity = opts.opacity ?? 0.14
  const fontPct = opts.fontPct ?? VARIANTS.full.fontPct
  const stepMult = opts.stepMult ?? VARIANTS.full.stepMult

  const fontSize = Math.max(11, Math.round(width * fontPct))
  const stepX = Math.round(fontSize * stepMult)
  const stepY = Math.round((fontSize * stepMult) / 1.85)

  let marks = ''
  for (let y = -stepY; y < height + stepY; y += stepY) {
    // Offset alternate rows so the pattern reads as a weave rather than a grid.
    const offset = (Math.round(y / stepY) % 2) * (stepX / 2)
    for (let x = -stepX; x < width + stepX; x += stepX) {
      const px = x + offset
      marks +=
        `<text x="${px}" y="${y}" font-family="DejaVu Sans, sans-serif" ` +
        `font-size="${fontSize}" font-weight="600" fill="#ffffff" ` +
        `fill-opacity="${opacity}" transform="rotate(-30 ${px} ${y})">${text}</text>`
    }
  }
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${marks}</svg>`
}

/**
 * Fails loudly if fontconfig cannot render text.
 *
 * Without this the pipeline would silently composite an empty overlay and upload a whole
 * catalog of unwatermarked images.
 */
export async function assertFontAvailable(): Promise<void> {
  const probe =
    `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">` +
    `<text x="4" y="40" font-family="DejaVu Sans, sans-serif" font-size="28" fill="#ffffff">Aa1</text></svg>`
  const { data, info } = await sharp(Buffer.from(probe)).png().toBuffer({ resolveWithObject: true })
  if (!data.length || info.width !== 200) {
    throw new Error('SVG text rendering unavailable — install a sans-serif font before importing')
  }
}

/** Resize, watermark, and encode one image for the given variant. */
export async function processCatalogImage(
  input: Buffer,
  variant: Variant
): Promise<{ data: Buffer; width: number; height: number }> {
  const cfg = VARIANTS[variant]

  // Resize first so the watermark is sized relative to the final image.
  const resized = await sharp(input)
    .rotate() // honour EXIF orientation before measuring
    .resize(
      cfg.constrain === 'width'
        ? { width: cfg.size, withoutEnlargement: true }
        : { width: cfg.size, height: cfg.size, fit: 'inside', withoutEnlargement: true }
    )
    .toBuffer({ resolveWithObject: true })

  const { width, height } = resized.info
  const svg = tiledWatermarkSvg(width, height, {
    fontPct: cfg.fontPct,
    stepMult: cfg.stepMult,
  })

  const data = await sharp(resized.data)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .webp({ quality: cfg.quality })
    .toBuffer()

  return { data, width, height }
}
