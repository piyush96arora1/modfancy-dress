import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  selectRelatedProducts,
  RELATED_PRODUCTS_COUNT,
} from '../lib/utils/related-products'

/** Minimal shape the selector needs. */
const p = (id: string) => ({ id })
const ids = (rows: { id: string }[]) => rows.map((r) => r.id)

/** A category of `n` products with ids padded so lexical order == numeric order. */
const category = (n: number) =>
  Array.from({ length: n }, (_, i) => p(`p${String(i).padStart(3, '0')}`))

test('shows 8 siblings by default', () => {
  assert.equal(RELATED_PRODUCTS_COUNT, 8)
  assert.equal(selectRelatedProducts(category(50), 'p000').length, 8)
})

test('never includes the product you are already looking at', () => {
  const cat = category(20)
  for (const self of cat) {
    const related = selectRelatedProducts(cat, self.id)
    assert.ok(!ids(related).includes(self.id), `${self.id} recommended itself`)
  }
})

test('never repeats a product within one block', () => {
  // small categories are where a naive wrap-around duplicates
  for (const size of [1, 2, 3, 5, 8, 9, 20]) {
    const related = selectRelatedProducts(category(size), 'p000')
    assert.equal(new Set(ids(related)).size, related.length, `size ${size} duplicated`)
  }
})

test('a category smaller than the block shows everything it has, no padding', () => {
  assert.deepEqual(ids(selectRelatedProducts(category(4), 'p001')), ['p002', 'p003', 'p000'])
  assert.deepEqual(ids(selectRelatedProducts(category(1), 'p000')), [])
})

test('wraps around past the end of the category', () => {
  // p008 is last in a 9-product category, so its block starts back at p000
  assert.deepEqual(
    ids(selectRelatedProducts(category(9), 'p008')),
    ['p000', 'p001', 'p002', 'p003', 'p004', 'p005', 'p006', 'p007']
  )
})

test('different products get different blocks — not one boilerplate set', () => {
  const cat = category(50)
  const blocks = cat.map((self) => ids(selectRelatedProducts(cat, self.id)).join(','))
  assert.equal(new Set(blocks).size, 50, 'every product should get a distinct block')
})

test('every product in the category receives exactly 8 inbound sibling links', () => {
  // This is the whole point: uniform internal-link distribution, no orphans.
  const cat = category(50)
  const inbound = new Map(cat.map((c) => [c.id, 0]))
  for (const self of cat) {
    for (const rel of selectRelatedProducts(cat, self.id)) {
      inbound.set(rel.id, (inbound.get(rel.id) ?? 0) + 1)
    }
  }
  for (const [id, count] of inbound) {
    assert.equal(count, RELATED_PRODUCTS_COUNT, `${id} got ${count} inbound links`)
  }
})

test('deterministic regardless of the order rows come back from the database', () => {
  const cat = category(30)
  const shuffled = [...cat].reverse()
  const scrambled = [...cat.slice(7), ...cat.slice(0, 7)]
  const expected = ids(selectRelatedProducts(cat, 'p012'))
  assert.deepEqual(ids(selectRelatedProducts(shuffled, 'p012')), expected)
  assert.deepEqual(ids(selectRelatedProducts(scrambled, 'p012')), expected)
})

test('an unknown current id still returns a usable block', () => {
  // primary category vs junction mismatch shouldn't blank the section
  const related = selectRelatedProducts(category(20), 'not-in-this-category')
  assert.equal(related.length, 8)
  assert.equal(new Set(ids(related)).size, 8)
})

test('empty category yields nothing', () => {
  assert.deepEqual(selectRelatedProducts([], 'p000'), [])
})

// --- section heading -------------------------------------------------------

test('heading reads naturally whether or not the category name says "Costume"', async () => {
  const { relatedHeading } = await import('../lib/utils/related-products')
  // bare subject -> add the keyword
  assert.equal(relatedHeading('Krishna'), 'More Krishna Costumes')
  assert.equal(relatedHeading('Freedom Fighter'), 'More Freedom Fighter Costumes')
  // already says Costume(s) -> don't stutter
  assert.equal(relatedHeading('Animal Costumes'), 'More Animal Costumes')
  assert.equal(relatedHeading('Animal Costume'), 'More Animal Costumes')
  assert.equal(relatedHeading('animal costumes'), 'More animal Costumes')
  // "Dress" is not the keyword we strip — "More Fancy Costumes" would lose meaning
  assert.equal(relatedHeading('Fancy Dress'), 'More Fancy Dress Costumes')
})

test('heading survives a category literally named "Costumes"', async () => {
  const { relatedHeading } = await import('../lib/utils/related-products')
  assert.equal(relatedHeading('Costumes'), 'More Costumes')
  assert.equal(relatedHeading('  Costume  '), 'More Costumes')
  assert.equal(relatedHeading(''), 'More Costumes')
})

// --- choosing which category to draw siblings from --------------------------

test('draws from the category with the most siblings, not the primary one', async () => {
  const { pickRichestPool } = await import('../lib/utils/related-products')
  const pool = (id: string, n: number) => ({
    categoryId: id, categoryName: id, categorySlug: id, products: category(n),
  })
  // the Krishna case: primary category holds 1, a secondary holds 12
  const chosen = pickRichestPool([pool('mythological-characters', 1), pool('indian-mythology', 12)])
  assert.equal(chosen?.categoryId, 'indian-mythology')
})

test('ties break on category id so the prerendered page never flip-flops', async () => {
  const { pickRichestPool } = await import('../lib/utils/related-products')
  const pool = (id: string, n: number) => ({
    categoryId: id, categoryName: id, categorySlug: id, products: category(n),
  })
  const a = pickRichestPool([pool('zebra', 9), pool('alpha', 9)])
  const b = pickRichestPool([pool('alpha', 9), pool('zebra', 9)])
  assert.equal(a?.categoryId, 'alpha')
  assert.equal(b?.categoryId, 'alpha', 'same inputs, different order -> same choice')
})

test('no categories, or all of them empty, yields nothing', async () => {
  const { pickRichestPool } = await import('../lib/utils/related-products')
  assert.equal(pickRichestPool([]), null)
  assert.equal(
    pickRichestPool([{ categoryId: 'a', categoryName: 'a', categorySlug: 'a', products: [] }]),
    null
  )
})
