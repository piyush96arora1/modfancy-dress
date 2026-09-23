import { test } from 'node:test'
import assert from 'node:assert/strict'
import { interleaveGuideProducts } from '../lib/utils/guide-products'

const list = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => ({ id: `${prefix}${i}` }))
const ids = (rows: { id: string }[]) => rows.map((r) => r.id)

test('alternates between the guide categories', () => {
  assert.deepEqual(ids(interleaveGuideProducts([list('d', 10), list('g', 10)], 4)), ['d0', 'g0', 'd1', 'g1'])
})
test('a product in two categories appears once', () => {
  const both = { id: 'x' }
  assert.deepEqual(ids(interleaveGuideProducts([[both, { id: 'd1' }], [both, { id: 'g1' }]], 8)), ['x', 'g1', 'd1'])
})
test('a short category leaves room for the other', () => {
  assert.deepEqual(ids(interleaveGuideProducts([list('d', 1), list('g', 5)], 4)), ['d0', 'g0', 'g1', 'g2'])
})
test('caps at 8 by default, and handles no categories', () => {
  assert.equal(interleaveGuideProducts([list('d', 20)]).length, 8)
  assert.deepEqual(interleaveGuideProducts([]), [])
})
