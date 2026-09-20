/**
 * Adds a readable shop-name + phone badge to an image before it is posted to
 * social media, and pads it to an aspect ratio the platform accepts.
 *
 * This is NOT scripts/lib/watermark.ts. That one tiles `@modfancydress` faintly
 * across the whole canvas at 0.14 opacity to survive a client screenshotting a
 * private supplier catalogue — it is anti-theft, and it is deliberately hard to
 * read. A marketing post wants the opposite: one legible badge that tells a
 * stranger who to call, without covering the garment.
 *
 * Sizes are all relative to image width, so the badge looks the same on a
 * 1024px and a 2048px source rather than shrinking to an unreadable smudge.
 */
import sharp from 'sharp'

export type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center'

export type WatermarkOptions = {
  shopName: string
  phone: string
  corner?: Corner
  /** Pad to this width/height ratio before watermarking. Instagram feed: 0.8 (4:5). */
  targetRatio?: number | null
  /** Colour of the bars added by padding. */
  padColour?: string
  jpegQuality?: number
}

/** Instagram feed accepts 0.8 (4:5) to 1.91 (landscape). 4:5 gives a post the most height. */
export const INSTAGRAM_FEED_RATIO = 0.8
export const INSTAGRAM_MIN_RATIO = 0.8
export const INSTAGRAM_MAX_RATIO = 1.91

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Fails loudly if fontconfig cannot render text.
 *
 * Borrowed from watermark.ts for the same reason: without it sharp composites an
 * empty overlay and you post an unbranded image believing it was branded.
 */
export async function assertFontAvailable(): Promise<void> {
  const probe =
    `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">` +
    `<text x="4" y="40" font-family="DejaVu Sans, sans-serif" font-size="28" fill="#ffffff">Aa1</text></svg>`
  const { data, info } = await sharp(Buffer.from(probe)).png().toBuffer({ resolveWithObject: true })
  if (!data.length || info.width !== 200) {
    throw new Error('SVG text rendering unavailable — install a sans-serif font (e.g. fonts-dejavu)')
  }
}

/** Pads to `ratio` with bars on whichever axis is short. Never crops. */
function padToRatio(width: number, height: number, ratio: number) {
  const current = width / height
  if (Math.abs(current - ratio) < 0.001) return { width, height }
  // Too tall/narrow -> widen. Too wide -> heighten. Either way nothing is lost.
  return current < ratio
    ? { width: Math.round(height * ratio), height }
    : { width, height: Math.round(width / ratio) }
}

function badgeSvg(width: number, height: number, o: Required<Pick<WatermarkOptions,'shopName'|'phone'|'corner'>>) {
  const name = escapeXml(o.shopName)
  const phone = escapeXml(o.phone)

  const nameSize = Math.max(14, Math.round(width * 0.032))
  const phoneSize = Math.max(12, Math.round(width * 0.026))
  const padX = Math.round(nameSize * 0.75)
  const padY = Math.round(nameSize * 0.55)
  const gap = Math.round(nameSize * 0.30)
  const margin = Math.round(width * 0.028)

  /*
   * Each line is measured with its OWN font size and weight, and the estimate is
   * deliberately generous: DejaVu Sans Bold runs about 0.66em per character and
   * regular about 0.60em. Over-estimating costs a few pixels of padding;
   * under-estimating clips the shop name mid-word, which is what the first
   * version of this did ("Mod Fancy Dres").
   */
  const textW = Math.round(Math.max(name.length * nameSize * 0.66, phone.length * phoneSize * 0.60))
  const boxW = textW + padX * 2
  const boxH = nameSize + gap + phoneSize + padY * 2

  let x: number, y: number
  switch (o.corner) {
    case 'bottom-left':   x = margin;                      y = height - boxH - margin; break
    case 'top-right':     x = width - boxW - margin;       y = margin;                 break
    case 'top-left':      x = margin;                      y = margin;                 break
    case 'bottom-center': x = Math.round((width-boxW)/2);  y = height - boxH - margin; break
    default:              x = width - boxW - margin;       y = height - boxH - margin
  }

  const r = Math.round(boxH * 0.22)
  const nameY = y + padY + nameSize * 0.82
  const phoneY = nameY + gap + phoneSize

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="${r}" ry="${r}"
        fill="#1a1a1a" fill-opacity="0.72"/>
  <text x="${x + padX}" y="${nameY}" font-family="DejaVu Sans, sans-serif"
        font-size="${nameSize}" font-weight="700" fill="#ffffff">${name}</text>
  <text x="${x + padX}" y="${phoneY}" font-family="DejaVu Sans, sans-serif"
        font-size="${phoneSize}" font-weight="500" fill="#f2c9a0">${phone}</text>
</svg>`
}

/** Pad to ratio, stamp the badge, return a JPEG buffer. */
export async function watermarkForSocial(
  input: Buffer,
  opts: WatermarkOptions
): Promise<{ buffer: Buffer; width: number; height: number; ratio: number }> {
  await assertFontAvailable()

  const corner = opts.corner ?? 'bottom-right'
  const ratio = opts.targetRatio === undefined ? INSTAGRAM_FEED_RATIO : opts.targetRatio

  const meta = await sharp(input).metadata()
  if (!meta.width || !meta.height) throw new Error('could not read image dimensions')

  let img = sharp(input).rotate() // honour EXIF orientation before measuring
  let width = meta.width
  let height = meta.height

  if (ratio) {
    const target = padToRatio(width, height, ratio)
    if (target.width !== width || target.height !== height) {
      img = img.extend({
        top: Math.floor((target.height - height) / 2),
        bottom: Math.ceil((target.height - height) / 2),
        left: Math.floor((target.width - width) / 2),
        right: Math.ceil((target.width - width) / 2),
        background: opts.padColour ?? '#ffffff',
      })
      width = target.width
      height = target.height
    }
  }

  const flattened = await img.jpeg({ quality: opts.jpegQuality ?? 90 }).toBuffer()
  const buffer = await sharp(flattened)
    .composite([{ input: Buffer.from(badgeSvg(width, height, { shopName: opts.shopName, phone: opts.phone, corner })) }])
    .jpeg({ quality: opts.jpegQuality ?? 90 })
    .toBuffer()

  return { buffer, width, height, ratio: width / height }
}
