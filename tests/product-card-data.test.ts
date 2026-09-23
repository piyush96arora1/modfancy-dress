import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toProductCardData } from '../lib/utils/product-card-data'

const row = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  slug: 'krishna-dress',
  name: 'Krishna Dress',
  price: 800,
  wholesale_price: null,
  rent_price: 300,
  category: { name: 'Janmashtami Dress', slug: 'janmashtami-dress' },
  categories: [{ category: { name: 'Janmashtami Dress', slug: 'janmashtami-dress' } }],
  images: [
    { image_url: 'a.webp', alt_text: 'side', is_primary: false },
    { image_url: 'b.webp', alt_text: 'front', is_primary: true },
    { image_url: 'c.webp', alt_text: null, is_primary: false },
  ],
  variants: [{ price_override: 900 }, { price_override: 1000 }],
  ...over,
})

test('keeps only the primary image', () => {
  assert.deepEqual(toProductCardData(row()).images, [
    { image_url: 'b.webp', alt_text: 'front', is_primary: true },
  ])
})

test('falls back to the first image when none is primary', () => {
  const images = [
    { image_url: 'a.webp', alt_text: null, is_primary: false },
    { image_url: 'b.webp', alt_text: null, is_primary: false },
  ]
  assert.equal(toProductCardData(row({ images })).images[0].image_url, 'a.webp')
})

test('no images and no variants give empty arrays, not undefined', () => {
  const card = toProductCardData(row({ images: null, variants: null, categories: null }))
  assert.deepEqual(card.images, [])
  assert.deepEqual(card.variants, [])
  assert.deepEqual(card.categories, [])
})

test('keeps only the first variant price, which is what the card shows', () => {
  assert.deepEqual(toProductCardData(row()).variants, [{ price_override: 900 }])
})

test('drops junction rows whose category is not readable', () => {
  const categories = [{ category: null }, { category: { name: 'Dance', slug: 'dance-dress' } }]
  assert.deepEqual(toProductCardData(row({ categories })).categories, [
    { category: { name: 'Dance', slug: 'dance-dress' } },
  ])
})

test('carries no fields beyond what a card and the client filter read', () => {
  const card = toProductCardData(row({ description: 'long copy', seo_title: 'x' }))
  assert.deepEqual(Object.keys(card).sort(), [
    'categories', 'category', 'id', 'images', 'name', 'price', 'rent_price', 'slug', 'variants', 'wholesale_price',
  ])
})
