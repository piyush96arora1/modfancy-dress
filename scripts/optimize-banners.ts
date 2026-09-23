/**
 * Re-encode oversized homepage banners as display-sized WebP with a one-year cache.
 *
 * Why: three carousel banners were 7–8MB PNGs at 3712x1152 / 3040x1408. The carousel
 * mounts each slide as it rotates into view, so a mobile visitor downloaded ~7MB per
 * slide. Desktop is re-encoded at 1920w and mobile at 1080w (their display widths at
 * 2x DPR are well under that). Originals are left in storage; only the row's URLs move.
 *
 * Usage:
 *   npx tsx scripts/optimize-banners.ts          # dry run: sizes before/after
 *   npx tsx scripts/optimize-banners.ts --apply  # upload + update banner rows
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })
const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`
const MAX_KB = 300 // anything above this is re-encoded
const WIDTH = { desktop_image_url: 1920, mobile_image_url: 1080 } as const

async function main() {
  const { data: banners, error } = await sb.from('banners').select('id, link_url, desktop_image_url, mobile_image_url')
  if (error) throw error
  for (const b of banners ?? []) {
    const update: Record<string, string> = {}
    for (const field of ['desktop_image_url', 'mobile_image_url'] as const) {
      const url = b[field] as string | null
      if (!url) continue
      const res = await fetch(url)
      if (!res.ok) { console.log(`skip ${b.link_url} ${field}: HTTP ${res.status}`); continue }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length <= MAX_KB * 1024) continue
      const out = await sharp(buf).resize({ width: WIDTH[field], withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
      const name = url.split('/').pop()!.replace(/\.(png|jpe?g|webp)$/i, '')
      const path = `banners-webp/${name}-${WIDTH[field]}w.webp`
      console.log(`${b.link_url} ${field}: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB (${path})`)
      if (!APPLY) continue
      const { error: up } = await sb.storage.from('product-images').upload(path, out, {
        contentType: 'image/webp', cacheControl: '31536000', upsert: true,
      })
      if (up) throw up
      update[field] = `${PUBLIC}/${path}`
    }
    if (APPLY && Object.keys(update).length) {
      const { error: e } = await sb.from('banners').update(update).eq('id', b.id)
      if (e) throw e
    }
  }
  if (!APPLY) console.log('dry run: nothing uploaded')
}

main().catch((e) => { console.error(e); process.exit(1) })
