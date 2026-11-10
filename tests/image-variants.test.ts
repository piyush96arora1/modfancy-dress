import { test } from 'node:test'
import assert from 'node:assert/strict'
import { variantUrl, cardImageUrl, variantPath } from '../lib/utils/image-variants'
import { getImageUrl, cdnUrl } from '../lib/imageUrl'

const base = 'https://x.supabase.co/storage/v1/object/public/product-images'
const cdn = 'https://img.modfancydress.com/product-images'
test('maps products-webp to a width folder and forces .webp', () => {
  assert.equal(variantUrl(`${base}/products-webp/ravan.png`, 400), `${base}/products-w400/ravan.webp`)
  assert.equal(variantUrl(`${base}/products-webp/ravan.webp`, 800), `${base}/products-w800/ravan.webp`)
})
test('leaves non-product and external URLs untouched', () => {
  assert.equal(variantUrl(`${base}/banners-webp/hero.webp`, 400), `${base}/banners-webp/hero.webp`)
  assert.equal(variantUrl('https://example.com/a.jpg', 400), 'https://example.com/a.jpg')
})
test('handles query strings', () =>
  assert.equal(variantUrl(`${base}/products-webp/a.jpg?v=2`, 400), `${base}/products-w400/a.webp?v=2`))

// Review Focus #3: anything not in a `-webp` folder has no variant and must stay as-is.
test('card URL: legacy /products/ paths resolve through getImageUrl first', () =>
  assert.equal(cardImageUrl(`${base}/products/old.jpg`), `${cdn}/products-w400/old.webp`))
test('card URL: anything without a variant is the same URL the card used before', () => {
  for (const u of [`${base}/misc/x.webp`, `${base}/banners-webp/hero.jpg`, 'https://example.com/a.jpg', ''])
    assert.equal(cardImageUrl(u), getImageUrl(u))
})
test('storage path of a variant, for the generator and uploader', () => {
  assert.equal(variantPath('products-webp/1785-abc.png', 1600), 'products-w1600/1785-abc.webp')
  assert.equal(variantPath('banners-webp/hero.webp', 400), null)
})

// Photos are served through the img.modfancydress.com edge cache (workers/img-cache).
test('cdn: public Supabase storage URLs move to img.modfancydress.com, path kept', () => {
  assert.equal(cdnUrl(`${base}/products-webp/a.webp`), `${cdn}/products-webp/a.webp`)
  assert.equal(getImageUrl(`${base}/products-webp/a.png`), `${cdn}/products-webp/a.png`)
  assert.equal(getImageUrl(`${base}/banners/hero.jpg`), `${cdn}/banners-webp/hero.webp`)
})
test('cdn: variants and card URLs are built on the cdn host', () => {
  assert.equal(variantUrl(getImageUrl(`${base}/products-webp/a.webp`), 1600), `${cdn}/products-w1600/a.webp`)
  assert.equal(cardImageUrl(`${base}/products-webp/a.webp`), `${cdn}/products-w400/a.webp`)
})
test('cdn: non-Supabase, signed and empty URLs are left alone', () => {
  for (const u of ['https://example.com/a.jpg', '/images/local.webp', '',
    'https://x.supabase.co/storage/v1/object/sign/product-images/a.webp?token=t'])
    assert.equal(cdnUrl(u), u)
})
