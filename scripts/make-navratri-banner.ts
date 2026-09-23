/**
 * Compose the Navratri 2026 homepage hero banner (desktop 1920x600, mobile 1080x500)
 * from real catalogue photos, and upload it as WebP with a one-year cache.
 *
 * Why: the first seeded Navratri banner reused one portrait product photo (474KB)
 * cropped into a 2.16:1 slot with no text. The hero is the homepage LCP element, so
 * it has to be both light and legible. Layout follows the Independence Day banner:
 * text left, costumes right.
 *
 * Usage:
 *   npx tsx scripts/make-navratri-banner.ts            # writes previews to ./.scratch/banner/
 *   npx tsx scripts/make-navratri-banner.ts --apply    # also uploads + points the banner row at it
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { mkdirSync } from 'fs'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })
const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`
const OUT = resolve(__dirname, '../.scratch/banner')
const BANNER_LINK = '/category/dandiya-dress'

const PHOTOS = [
  'red-and-black-mirror-work-garba-lehenga',
  'magenta-diamond-panel-dandiya-lehenga',
  'yellow-peacock-panel-garba-chaniya-choli',
]

const FONT = "'Noto Sans CJK SC', 'DejaVu Sans', sans-serif"

async function photo(name: string, w: number, h: number, radius: number) {
  const res = await fetch(`${PUBLIC}/products-w800/${name}.webp`)
  if (!res.ok) throw new Error(`${name}: ${res.status}`)
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" ry="${radius}"/></svg>`)
  const img = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
  // white frame + soft shadow so the cards read as "mirror-work tiles" on the gradient
  const pad = Math.round(radius * 0.45)
  const frame = Buffer.from(
    `<svg width="${w + pad * 2}" height="${h + pad * 2}"><rect width="${w + pad * 2}" height="${h + pad * 2}" rx="${radius + pad}" fill="#FFF8EC"/></svg>`
  )
  return sharp(frame).composite([{ input: img, left: pad, top: pad }]).png().toBuffer()
}

function background(w: number, h: number) {
  // deep maroon -> saffron, with scattered "mirror" dots
  const dots = Array.from({ length: 70 }, (_, i) => {
    const x = (i * 137.5) % w, y = (i * 89.3) % h, r = 2 + (i % 4)
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="#F6C453" opacity="${0.12 + (i % 5) * 0.04}"/>`
  }).join('')
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6E1230"/><stop offset="0.55" stop-color="#A3202F"/><stop offset="1" stop-color="#E8751A"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>${dots}
  </svg>`)
}

function text(w: number, h: number, s: { x: number; kicker: number; title: number; sub: number; pill: number; top: number }) {
  const y1 = s.top, y2 = y1 + s.title * 1.05, y3 = y2 + s.title * 1.0, y4 = y3 + s.sub * 1.7, y5 = y4 + s.pill * 2.4
  const pillW = s.pill * 17.6
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}">
    <text x="${s.x}" y="${y1}" font-size="${s.kicker}" font-weight="700" fill="#F6C453" letter-spacing="2">NAVRATRI 2026 · 11–19 OCT</text>
    <text x="${s.x}" y="${y2}" font-size="${s.title}" font-weight="900" fill="#FFF4E0">Dandiya &amp;</text>
    <text x="${s.x}" y="${y3}" font-size="${s.title}" font-weight="900" fill="#FFF4E0">Garba Dresses</text>
    <text x="${s.x}" y="${y4}" font-size="${s.sub}" font-weight="700" fill="#FFE2B8">For women, men &amp; kids</text>
    <rect x="${s.x}" y="${y5 - s.pill * 1.35}" width="${pillW}" height="${s.pill * 1.9}" rx="${s.pill * 0.95}" fill="#F6C453"/>
    <text x="${s.x + s.pill * 0.9}" y="${y5}" font-size="${s.pill}" font-weight="800" fill="#6E1230">Buy or Rent · Mod Fancy Dress</text>
  </svg>`)
}

async function build(kind: 'desktop' | 'mobile') {
  const D = kind === 'desktop'
  const w = D ? 1920 : 1080, h = D ? 600 : 500
  const cards = D ? PHOTOS : PHOTOS.slice(0, 2)
  const cw = D ? 300 : 210, ch = D ? 470 : 330, r = D ? 26 : 20
  const tiles = await Promise.all(cards.map((n) => photo(n, cw, ch, r)))
  const tileW = cw + Math.round(r * 0.45) * 2
  const gap = D ? 34 : 22
  const startX = w - (tileW * cards.length + gap * (cards.length - 1)) - (D ? 70 : 34)
  const composite = [
    { input: text(w, h, D
        ? { x: 110, kicker: 30, title: 96, sub: 40, pill: 30, top: 150 }
        : { x: 52, kicker: 22, title: 64, sub: 28, pill: 21, top: 110 }), left: 0, top: 0 },
    ...tiles.map((t, i) => ({ input: t, left: startX + i * (tileW + gap), top: Math.round((h - (ch + Math.round(r * 0.45) * 2)) / 2) + (i % 2 ? (D ? 18 : 12) : -(D ? 10 : 6)) })),
  ]
  return sharp(background(w, h)).composite(composite).webp({ quality: 80 }).toBuffer()
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const out: Record<string, Buffer> = {}
  for (const kind of ['desktop', 'mobile'] as const) {
    out[kind] = await build(kind)
    await sharp(out[kind]).toFile(`${OUT}/navratri-2026-${kind}.webp`)
    console.log(`${kind}: ${(out[kind].length / 1024).toFixed(0)}KB -> ${OUT}/navratri-2026-${kind}.webp`)
  }
  if (!APPLY) return console.log('dry run: previews written, nothing uploaded')

  const urls: Record<string, string> = {}
  for (const kind of ['desktop', 'mobile'] as const) {
    const path = `banners-webp/navratri-2026-${kind}.webp`
    const { error } = await sb.storage.from('product-images').upload(path, out[kind], {
      contentType: 'image/webp', cacheControl: '31536000', upsert: true,
    })
    if (error) throw error
    urls[kind] = `${PUBLIC}/${path}`
  }
  const { data, error } = await sb.from('banners')
    .update({ desktop_image_url: urls.desktop, mobile_image_url: urls.mobile })
    .eq('link_url', BANNER_LINK).select('id')
  if (error) throw error
  console.log(`uploaded; updated ${data?.length ?? 0} banner row(s) linking to ${BANNER_LINK}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
