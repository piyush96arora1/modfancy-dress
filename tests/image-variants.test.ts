import { test } from 'node:test'
import assert from 'node:assert/strict'
import { variantUrl, cardImageUrl, variantPath } from '../lib/utils/image-variants'
import { getImageUrl } from '../lib/imageUrl'

const base = 'https://x.supabase.co/storage/v1/object/public/product-images'
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
  assert.equal(cardImageUrl(`${base}/products/old.jpg`), `${base}/products-w400/old.webp`))
test('card URL: anything without a variant is the same URL the card used before', () => {
  for (const u of [`${base}/misc/x.webp`, `${base}/banners-webp/hero.jpg`, 'https://example.com/a.jpg', ''])
    assert.equal(cardImageUrl(u), getImageUrl(u))
})
test('storage path of a variant, for the generator and uploader', () => {
  assert.equal(variantPath('products-webp/1785-abc.png', 1600), 'products-w1600/1785-abc.webp')
  assert.equal(variantPath('banners-webp/hero.webp', 400), null)
})
