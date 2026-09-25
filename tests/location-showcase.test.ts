import { test } from 'node:test'
import assert from 'node:assert/strict'
import { seasonalCategoryIds, pickTiles, interleaveUnique, preferCostumes } from '../lib/location/showcase'

const sec = (category_id: string, over: Record<string, unknown> = {}) => ({
  category_id, source_type: 'category', starts_on: '2026-09-23', ends_on: '2026-10-20', min_products: null, ...over,
})
const cat = (id: string, image_url: string | null = `${id}.webp`) => ({ id, name: id.toUpperCase(), slug: id, image_url })

test('seasonal ids: only sections live today, in order, deduped', () => {
  const ids = seasonalCategoryIds(
    [sec('dandiya'), sec('ramleela'), sec('dandiya'), sec('xmas', { starts_on: '2026-12-01' })],
    '2026-09-25', () => 10)
  assert.deepEqual(ids, ['dandiya', 'ramleela'])
})

test('seasonal ids: min_products not met is skipped (Halloween waits for stock)', () => {
  const ids = seasonalCategoryIds([sec('halloween', { min_products: 6 })], '2026-10-06', () => 2)
  assert.deepEqual(ids, [])
})

test('seasonal ids: latest-type sections are ignored', () => {
  assert.deepEqual(seasonalCategoryIds([{ ...sec('x'), source_type: 'latest' }], '2026-09-25', () => 9), [])
})

test('tiles: category without image uses its first product photo', () => {
  const t = pickTiles({ orderedIds: ['dandiya'], categories: [cat('dandiya', null)], coverFor: () => 'p.jpg' })
  assert.deepEqual(t, [{ name: 'DANDIYA', slug: 'dandiya', image: 'p.jpg' }])
})

test('tiles: inactive/empty (not in categories list) and imageless categories are skipped', () => {
  const t = pickTiles({ orderedIds: ['gone', 'bare', 'ok'], categories: [cat('bare', null), cat('ok')], coverFor: () => null })
  assert.deepEqual(t.map((x) => x.slug), ['ok'])
})

test('tiles: deduped and capped at the limit', () => {
  const cats = ['a', 'b', 'c', 'd'].map((id) => cat(id))
  const t = pickTiles({ orderedIds: ['a', 'b', 'a', 'c', 'd'], categories: cats, coverFor: () => null, limit: 3 })
  assert.deepEqual(t.map((x) => x.slug), ['a', 'b', 'c'])
})

test('interleave: round-robin across lists, each product once', () => {
  const p = (id: string) => ({ id })
  const out = interleaveUnique([[p('1'), p('2'), p('3')], [p('2'), p('4')]], 8)
  assert.deepEqual(out.map((x) => x.id), ['1', '2', '4', '3'])
})

test('interleave: respects the limit and tolerates empty input', () => {
  const p = (id: string) => ({ id })
  assert.deepEqual(interleaveUnique([[p('1'), p('2')], [p('3')]], 2).map((x) => x.id), ['1', '3'])
  assert.deepEqual(interleaveUnique([], 8), [])
})

test('preferCostumes: accessories drop out of covers and the row', () => {
  const p = (id: string, cat: string | null) => ({ id, category: cat ? { name: cat } : null })
  const out = preferCostumes([p('sticks', 'Accessories'), p('lehenga', 'Dandiya Dress'), p('x', null)])
  assert.deepEqual(out.map((x) => x.id), ['lehenga', 'x'])
})

test('preferCostumes: a list of only accessories is kept rather than emptied', () => {
  const p = (id: string) => ({ id, category: { name: 'Accessories' } })
  assert.deepEqual(preferCostumes([p('a'), p('b')]).map((x) => x.id), ['a', 'b'])
})
