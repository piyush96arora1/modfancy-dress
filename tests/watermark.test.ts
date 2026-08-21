import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import {
  tiledWatermarkSvg,
  processCatalogImage,
  assertFontAvailable,
  WATERMARK_TEXT,
} from '../scripts/lib/watermark'

const solid = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: '#888888' } })
    .jpeg()
    .toBuffer()

test('font rendering is available', async () => {
  await assertFontAvailable()
})

test('svg carries the brand text, the tilt and the opacity', () => {
  const svg = tiledWatermarkSvg(800, 1000)
  assert.equal(WATERMARK_TEXT, '@modfancydress')
  assert.ok(svg.includes('@modfancydress'))
  assert.ok(svg.includes('rotate(-30'))
  assert.ok(svg.includes('fill-opacity="0.14"'))
  assert.ok(svg.startsWith('<svg') && svg.includes('width="800"'))
})

test('font size scales with width so thumbnails stay legible', () => {
  const size = (s: string) => Number(/font-size="(\d+)"/.exec(s)![1])
  assert.equal(size(tiledWatermarkSvg(1400, 1400, { fontPct: 0.028 })), Math.round(1400 * 0.028))
  assert.ok(
    size(tiledWatermarkSvg(400, 700, { fontPct: 0.055 })) >= 20,
    'thumbnail mark must not collapse to a smudge'
  )
})

test('tiles repeat across the whole canvas', () => {
  const marks = tiledWatermarkSvg(800, 1000).match(/<text/g)!.length
  assert.ok(marks > 6, `expected a repeating tile, got ${marks} marks`)
})

test('escapes markup so a text override cannot break the svg', () => {
  const svg = tiledWatermarkSvg(200, 200, { text: '<script>&' })
  assert.ok(!svg.includes('<script>'))
  assert.ok(svg.includes('&lt;script&gt;&amp;'))
})

test('full variant caps at 1400px, emits webp, and never enlarges', async () => {
  const out = await processCatalogImage(await solid(2000, 3000), 'full')
  assert.equal(out.width, 933)
  assert.equal(out.height, 1400)
  assert.equal((await sharp(out.data).metadata()).format, 'webp')

  const tiny = await processCatalogImage(await solid(300, 300), 'full')
  assert.equal(tiny.width, 300, 'must not upscale small sources')
})

test('thumb variant is 400px wide webp', async () => {
  const out = await processCatalogImage(await solid(1080, 1918), 'thumb')
  assert.equal(out.width, 400)
  assert.equal((await sharp(out.data).metadata()).format, 'webp')
})

test('watermarking actually changes the pixels', async () => {
  const src = await solid(800, 800)
  const marked = await processCatalogImage(src, 'full')
  const plain = await sharp(src).webp({ quality: 85 }).toBuffer()
  assert.notEqual(marked.data.length, plain.length)
})

test('a real catalog image round-trips and shrinks substantially', async () => {
  const { readdirSync, readFileSync, existsSync } = await import('node:fs')
  const dir = 'vastra-data/images/design'
  if (!existsSync(dir)) return // scraped images are gitignored; skip where absent
  const file = readdirSync(dir)[0]
  const src = readFileSync(`${dir}/${file}`)
  const out = await processCatalogImage(src, 'full')
  assert.ok(out.width <= 1400 && out.height <= 1400)
  assert.ok(out.data.length < src.length, 'output should be smaller than the source')
})

test('thumb keeps a fixed 400px width for the grid, whatever the aspect ratio', async () => {
  for (const [w, h] of [[1080, 1918], [1918, 1080], [800, 800]]) {
    const out = await processCatalogImage(await solid(w, h), 'thumb')
    assert.equal(out.width, 400, `${w}x${h} thumb should be 400 wide, got ${out.width}`)
  }
})
