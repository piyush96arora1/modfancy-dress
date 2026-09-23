import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkCopy } from '../lib/seo/copy-limits'

test('accepts copy inside the limits', () => {
  assert.deepEqual(checkCopy({ seoTitle: 'Dandiya Dress for Women & Kids – Rent in Delhi', metaDescription: 'x'.repeat(150) }), [])
})
test('flags a title over 60 chars and a meta over 160', () => {
  const v = checkCopy({ seoTitle: 'x'.repeat(61), metaDescription: 'y'.repeat(161) })
  assert.equal(v.length, 2)
})
test('flags an empty meta and a meta under 70 chars (too thin for a snippet)', () => {
  assert.equal(checkCopy({ seoTitle: 'ok', metaDescription: '' }).length, 1)
  assert.equal(checkCopy({ seoTitle: 'ok', metaDescription: 'short' }).length, 1)
})
test('flags Devanagari in title/meta (metas stay English)', () => {
  assert.equal(checkCopy({ seoTitle: 'डांडिया ड्रेस', metaDescription: 'z'.repeat(120) }).length, 1)
})
