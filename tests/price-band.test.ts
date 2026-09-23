import { test } from 'node:test'
import assert from 'node:assert/strict'
import { priceBand, formatPriceBand } from '../lib/seo/price-band'

test('band spans min..max buy and min rent', () => {
  assert.deepEqual(priceBand([{ price: 1200, rent_price: 300 }, { price: 400, rent_price: 350 }]),
    { minBuy: 400, maxBuy: 1200, minRent: 300 })
})
test('ignores null and zero prices', () => {
  assert.deepEqual(priceBand([{ price: null, rent_price: 0 }, { price: 550, rent_price: null }]),
    { minBuy: 550, maxBuy: 550, minRent: null })
})
test('no priced products → null (row must not invent a price)', () => {
  assert.equal(priceBand([]), null)
  assert.equal(priceBand([{ price: null, rent_price: null }]), null)
})
test('formats with Indian digit grouping', () => {
  assert.equal(formatPriceBand({ minBuy: 400, maxBuy: 1200, minRent: 300 }), 'Buy ₹400–₹1,200 · rent from ₹300')
  assert.equal(formatPriceBand({ minBuy: 2250, maxBuy: 2250, minRent: null }), 'Buy ₹2,250')
  assert.equal(formatPriceBand({ minBuy: null, maxBuy: null, minRent: 200 }), 'Rent from ₹200')
  assert.equal(formatPriceBand({ minBuy: 100000, maxBuy: 150000, minRent: null }), 'Buy ₹1,00,000–₹1,50,000')
})
test('short "from" price prefers rent (the entry point) for comparison tables', async () => {
  const { fromPrice } = await import('../lib/seo/price-band')
  assert.equal(fromPrice({ minBuy: 400, maxBuy: 1200, minRent: 300 }), '₹300 rent · ₹400 buy')
  assert.equal(fromPrice(null), null)
})
