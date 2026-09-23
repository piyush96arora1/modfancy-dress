import { test } from 'node:test'
import assert from 'node:assert/strict'
import { flattenRedirects, validateRedirects } from '../lib/seo/redirect-graph'
import redirects from '../redirects.json'
import liveUrls from '../seodata/live-urls.json'

// Snapshot written by `scripts/build-product-redirects.ts --apply`. Refresh it
// (re-run the script) after any product is added, renamed or deleted.
test('redirects.json is clean against the live URL snapshot', () =>
  assert.deepEqual(validateRedirects(redirects, new Set(liveUrls)), []))

test('every redirect is permanent and has the {source, destination, permanent} shape next.config.ts expects', () => {
  for (const r of redirects) assert.deepEqual(Object.keys(r).sort(), ['destination', 'permanent', 'source'])
  assert.ok(redirects.every((r) => r.permanent === true))
})

const live = new Set(['/', '/products/a', '/products/b', '/category/c'])

test('clean graph has no problems', () =>
  assert.deepEqual(validateRedirects([{ source: '/products/old', destination: '/products/a' }], live), []))

test('source that is a live URL is flagged (page unreachable)', () =>
  assert.equal(validateRedirects([{ source: '/products/a', destination: '/products/b' }], live).length, 1))

test('destination that is not live is flagged', () =>
  assert.equal(validateRedirects([{ source: '/products/old', destination: '/products/gone' }], live).length, 1))

test('chains are flagged', () =>
  assert.ok(
    validateRedirects(
      [
        { source: '/products/x', destination: '/products/y' },
        { source: '/products/y', destination: '/products/a' },
      ],
      live
    ).some((p) => p.includes('chain'))
  ))

test('loops are flagged', () =>
  assert.ok(
    validateRedirects(
      [
        { source: '/products/x', destination: '/products/y' },
        { source: '/products/y', destination: '/products/x' },
      ],
      live
    ).some((p) => p.includes('loop'))
  ))

test('external and non-product destinations outside the live set are allowed only if static', () =>
  assert.deepEqual(
    validateRedirects([{ source: '/old-page', destination: '/fancy-dress-delhi' }], new Set(['/fancy-dress-delhi'])),
    []
  ))

test('a redirect to the homepage is flagged (Google treats it as a soft 404)', () =>
  assert.ok(
    validateRedirects([{ source: '/products/old', destination: '/' }], live).some((p) => p.includes('homepage'))
  ))

test('a duplicated source is flagged (only the first entry would ever run)', () =>
  assert.ok(
    validateRedirects(
      [
        { source: '/products/old', destination: '/products/a' },
        { source: '/products/old', destination: '/products/b' },
      ],
      live
    ).some((p) => p.includes('duplicate'))
  ))

test('flattenRedirects points every hop at the end of its chain', () =>
  assert.deepEqual(
    flattenRedirects([
      { source: '/products/x', destination: '/products/y' },
      { source: '/products/y', destination: '/products/a' },
    ]),
    [
      { source: '/products/x', destination: '/products/a' },
      { source: '/products/y', destination: '/products/a' },
    ]
  ))
