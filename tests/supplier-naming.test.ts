import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  cleanProductName,
  slugifyCatalogName,
  resolveCatalogSlug,
} from '../lib/utils/supplier-naming'

test('strips the DES- prefix and title-cases', () => {
  assert.equal(cleanProductName('DES-gajra'), 'Gajra')
  assert.equal(cleanProductName('DES-mala rudraksh plain'), 'Mala Rudraksh Plain')
  assert.equal(cleanProductName('DES-Ghost Mask Rubber1'), 'Ghost Mask Rubber 1')
})

test('separates a trailing number so names read naturally', () => {
  assert.equal(cleanProductName('DES-garba ghoomer lehenga13'), 'Garba Ghoomer Lehenga 13')
  assert.equal(cleanProductName('DES-mala golden 12no.'), 'Mala Golden 12no.')
})

test('survives names without the prefix and collapses whitespace', () => {
  assert.equal(cleanProductName('plain kurta'), 'Plain Kurta')
  assert.equal(cleanProductName('  DES-  double  space '), 'Double Space')
})

test('slugifies to url-safe lowercase with & as and', () => {
  assert.equal(slugifyCatalogName('mala & kundal'), 'mala-and-kundal')
  assert.equal(slugifyCatalogName('Sea animals& insects'), 'sea-animals-and-insects')
  assert.equal(slugifyCatalogName('Mala Golden 12no.'), 'mala-golden-12no')
  assert.equal(slugifyCatalogName('RamlilaDress &Kavach'), 'ramliladress-and-kavach')
})

test('slug has no leading, trailing or doubled hyphens', () => {
  for (const input of ['  -weird- name-  ', '&&&', 'a  --  b']) {
    const slug = slugifyCatalogName(input)
    assert.ok(!slug.startsWith('-') && !slug.endsWith('-'), `bad edges: "${slug}"`)
    assert.ok(!slug.includes('--'), `doubled hyphen: "${slug}"`)
  }
})

test('resolveCatalogSlug hands out the base slug when it is free', () => {
  const taken = new Set<string>()
  assert.equal(resolveCatalogSlug('mukut-24', 'aaaaaaaa-1111', taken), 'mukut-24')
})

test('resolveCatalogSlug suffixes a collision with a stable id token', () => {
  const taken = new Set(['mukut-24'])
  const id = '2110c9a3-73a1-4bd4-94f6-2be60f1ca8c4'
  const slug = resolveCatalogSlug('mukut-24', id, taken)
  assert.equal(slug, 'mukut-24-2110c9')
  // stable: same inputs always give the same slug, so shared links never drift
  assert.equal(resolveCatalogSlug('mukut-24', id, new Set(['mukut-24'])), slug)
})

test('resolveCatalogSlug marks the slug it returns as taken', () => {
  const taken = new Set<string>()
  const a = resolveCatalogSlug('wig', 'id-one-aaaa', taken)
  const b = resolveCatalogSlug('wig', 'id-two-bbbb', taken)
  assert.equal(a, 'wig')
  assert.notEqual(b, a)
  assert.equal(taken.size, 2)
})

test('the real 827 products all get unique slugs', () => {
  type ScrapedProduct = { design_id: string; listing: { design_number: string } }
  const db = JSON.parse(readFileSync('vastra-data/db.json', 'utf8')) as {
    products: Record<string, ScrapedProduct>
  }
  const taken = new Set<string>()
  const products = Object.values(db.products).sort((a, b) =>
    a.design_id.localeCompare(b.design_id)
  )
  for (const p of products) {
    resolveCatalogSlug(
      slugifyCatalogName(cleanProductName(p.listing.design_number)),
      p.design_id,
      taken
    )
  }
  assert.equal(taken.size, products.length, 'every product must own a distinct slug')
  assert.equal(taken.size, 827)
})
