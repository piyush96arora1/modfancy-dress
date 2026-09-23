import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isActiveOn, todayIST, meetsMinProducts } from '../lib/utils/seasonal'

const navratri = { starts_on: '2026-09-23', ends_on: '2026-10-20' }
test('undated rows are always active', () => assert.equal(isActiveOn({}, '2026-01-01'), true))
test('null bounds are open-ended, same as missing', () =>
  assert.equal(isActiveOn({ starts_on: null, ends_on: null }, '2026-01-01'), true))
test('active on the first and last day (inclusive)', () => {
  assert.equal(isActiveOn(navratri, '2026-09-23'), true)
  assert.equal(isActiveOn(navratri, '2026-10-20'), true)
})
test('inactive the day before and the day after', () => {
  assert.equal(isActiveOn(navratri, '2026-09-22'), false)
  assert.equal(isActiveOn(navratri, '2026-10-21'), false)
})
test('open-ended ranges', () => {
  assert.equal(isActiveOn({ starts_on: '2026-11-01' }, '2027-03-01'), true)
  assert.equal(isActiveOn({ ends_on: '2026-11-01' }, '2026-11-02'), false)
})
test('Janmashtami, end-dated to 31 Aug, is gone on 23 Sep', () => {
  assert.equal(isActiveOn({ ends_on: '2026-08-31' }, '2026-09-23'), false)
})

test('todayIST rolls over at IST midnight, not UTC midnight', () => {
  // 18:29 UTC = 23:59 IST, same day; 18:30 UTC = 00:00 IST next day
  assert.equal(todayIST(new Date('2026-10-20T18:29:00Z')), '2026-10-20')
  assert.equal(todayIST(new Date('2026-10-20T18:30:00Z')), '2026-10-21')
})

test('min_products guard: hides a section until its category has enough stock', () => {
  assert.equal(meetsMinProducts({ min_products: 6 }, 5), false)
  assert.equal(meetsMinProducts({ min_products: 6 }, 6), true)
  assert.equal(meetsMinProducts({ min_products: null }, 1), true)
  assert.equal(meetsMinProducts({}, 1), true)
})
