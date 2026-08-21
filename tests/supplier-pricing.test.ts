import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  supplierDisplayPrice,
  formatSupplierPrice,
  PRICE_ON_REQUEST,
  DEFAULT_MARKUP_PCT,
} from '../lib/utils/supplier-pricing'

test('default markup is 20', () => {
  assert.equal(DEFAULT_MARKUP_PCT, 20)
})

test('applies markup then rounds up to nearest ten', () => {
  // real supplier prices from the scrape
  assert.equal(supplierDisplayPrice(78, 20), 100) // 93.6  -> 100
  assert.equal(supplierDisplayPrice(120, 20), 150) // 144   -> 150
  assert.equal(supplierDisplayPrice(180, 20), 220) // 216   -> 220
  assert.equal(supplierDisplayPrice(280, 20), 340) // 336   -> 340
  assert.equal(supplierDisplayPrice(1500, 20), 1800) // 1800 -> 1800 (already a multiple of 10)
  assert.equal(supplierDisplayPrice(21000, 20), 25200)
})

test('honours a different markup without code changes', () => {
  assert.equal(supplierDisplayPrice(180, 25), 230) // 225 -> 230
  assert.equal(supplierDisplayPrice(180, 0), 180)
})

test('zero or missing price means price-on-request, never zero', () => {
  assert.equal(supplierDisplayPrice(0, 20), null)
  assert.equal(supplierDisplayPrice(Number.NaN, 20), null)
  assert.equal(formatSupplierPrice(null), PRICE_ON_REQUEST)
  assert.equal(PRICE_ON_REQUEST, 'Price on request')
})

test('never returns a price below the marked-up value', () => {
  for (const p of [1, 7, 13, 99, 101, 777, 1499]) {
    const shown = supplierDisplayPrice(p, 20)
    assert.ok(shown !== null && shown >= p * 1.2, `${p} -> ${shown} undercuts 20%`)
  }
})

test('formats with Indian thousands separators and no decimals', () => {
  assert.equal(formatSupplierPrice(1800), '₹1,800')
  assert.equal(formatSupplierPrice(100), '₹100')
  assert.equal(formatSupplierPrice(25200), '₹25,200')
})
