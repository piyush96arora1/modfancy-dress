# Private Supplier Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a private, non-crawlable `/catalog` section listing 827 supplier products at supplier price +20%, with watermarked self-hosted images, category browsing and search, for the owner to share with clients over WhatsApp.

**Architecture:** Three new `supplier_*` Postgres tables, entirely separate from the live `products`/`categories` tables so nothing can leak into the retail site or its sitemap. A local Node script reads the already-scraped `vastra-data/db.json`, watermarks and compresses each image with sharp, uploads to Supabase Storage, and upserts rows idempotently. Next.js App Router pages read through `unstable_cache` and are blocked from indexing by four independent layers.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres + Storage), sharp, tsx, Tailwind, `node:test` via `npx tsx --test`.

**Spec:** `docs/superpowers/specs/2026-08-21-supplier-catalog-design.md`

## Global Constraints

- **Markup:** `display = ceil(supplier_price * (1 + markup_pct/100) / 10) * 10`, `markup_pct` default **20**, read from `site_settings.supplier_markup_pct`.
- **`supplier_price` must never reach the browser.** No query returns it; no component receives it.
- **Zero-price products** (43 of them) render the exact string **"Price on request"**, never "₹0".
- **Watermark:** text `@modfancydress`, white, tiled diagonal, rotated -30°, `fill-opacity` **0.14**. Font size **2.8% of width** on full images, **5.5%** on 400px thumbnails. Applied to *every* uploaded image including category tiles.
- **Image encoding:** max 1400px `fit: inside` no enlargement, WebP **q85** full / **q82** thumb (400px wide).
- **Storage paths:** `product-images/catalog/full/<source_id>-<n>.webp`, `product-images/catalog/thumb/<source_id>-<n>.webp`, `product-images/catalog/category/<source_id>.webp`.
- **Theme is established — match it, do not invent.** Borders `#E8E5E0`, accent `#C8956C`, image well `#F5F3F0`, muted text `#9A9A9A`, `rounded-xl`, `boxShadow: 'var(--shadow-card)'`, hover `-translate-y-1`, images `aspect-[3/4]`. Copy the visual language of `components/public/ProductCard.tsx`.
- **Mobile first.** Clients open these links on phones: 2-column grid on mobile, 3 at `md`, 4 at `lg`.
- **No new npm dependencies.** `sharp`, `tsx`, `dotenv` are already installed.
- **sharp must never enter the Next build graph.** All sharp imports live under `scripts/`.
- **Route prefix:** `/catalog`. Category slugs are flat and verified unique (61 categories, 827 product slugs, zero collisions).

---

## File Structure

**Create:**
- `supabase/migrations/20260821120000_create_supplier_catalog.sql` — tables, indexes, RLS, search RPC, settings seed
- `lib/utils/supplier-pricing.ts` — price math + formatting (pure, no I/O)
- `lib/utils/supplier-naming.ts` — name cleaning + slugify (pure)
- `lib/supabase/supplier-queries.ts` — all cached reads; the only place that touches `supplier_*` tables
- `scripts/lib/watermark.ts` — sharp pipeline: resize → watermark → WebP (script-only)
- `scripts/import-supplier-catalog.ts` — the importer
- `scripts/verify-supplier-schema.ts` — post-migration sanity check
- `components/public/catalog/CatalogProductCard.tsx`
- `components/public/catalog/CatalogCategoryCard.tsx`
- `components/public/catalog/CatalogGrid.tsx`
- `components/public/catalog/CatalogSearchBox.tsx`
- `components/public/catalog/CatalogGallery.tsx`
- `components/public/catalog/CatalogPagination.tsx`
- `components/public/catalog/ShareLinkButton.tsx`
- `app/(public)/catalog/page.tsx`
- `app/(public)/catalog/[slug]/page.tsx`
- `app/(public)/catalog/p/[slug]/page.tsx`
- `app/(public)/catalog/search/page.tsx`
- `tests/supplier-pricing.test.ts`
- `tests/supplier-naming.test.ts`
- `tests/watermark.test.ts`

**Modify:**
- `app/robots.ts` — add `/catalog` to disallow
- `next.config.ts` — `X-Robots-Tag` header for `/catalog/*`
- `package.json` — add `test` and `import:catalog` scripts

---

### Task 1: Pricing and naming utilities

Pure functions, no I/O. Everything downstream depends on these, so they come first and get real tests.

**Files:**
- Create: `lib/utils/supplier-pricing.ts`
- Create: `lib/utils/supplier-naming.ts`
- Create: `tests/supplier-pricing.test.ts`
- Create: `tests/supplier-naming.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `supplierDisplayPrice(supplierPrice: number, markupPct: number): number | null` — `null` means price-on-request
  - `formatSupplierPrice(price: number | null): string` — `"₹1,800"` or `"Price on request"`
  - `PRICE_ON_REQUEST: string` = `'Price on request'`
  - `DEFAULT_MARKUP_PCT: number` = `20`
  - `cleanProductName(sourceName: string): string`
  - `slugifyCatalogName(name: string): string`

- [ ] **Step 1: Add the test script to package.json**

In `package.json` `scripts`, add:

```json
"test": "tsx --test tests/*.test.ts",
"import:catalog": "tsx scripts/import-supplier-catalog.ts"
```

- [ ] **Step 2: Write the failing pricing test**

Create `tests/supplier-pricing.test.ts`:

```ts
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
  assert.equal(supplierDisplayPrice(78, 20), 100)    // 93.6  -> 100
  assert.equal(supplierDisplayPrice(120, 20), 150)   // 144   -> 150
  assert.equal(supplierDisplayPrice(180, 20), 220)   // 216   -> 220
  assert.equal(supplierDisplayPrice(280, 20), 340)   // 336   -> 340
  assert.equal(supplierDisplayPrice(1500, 20), 1800) // 1800  -> 1800 (already a multiple of 10)
  assert.equal(supplierDisplayPrice(21000, 20), 25200)
})

test('honours a different markup without code changes', () => {
  assert.equal(supplierDisplayPrice(180, 25), 230)   // 225 -> 230
  assert.equal(supplierDisplayPrice(180, 0), 180)
})

test('zero or missing price means price-on-request, never zero', () => {
  assert.equal(supplierDisplayPrice(0, 20), null)
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
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../lib/utils/supplier-pricing`.

- [ ] **Step 4: Implement the pricing util**

Create `lib/utils/supplier-pricing.ts`:

```ts
/**
 * Pricing for the private supplier catalog.
 *
 * The supplier's cost is marked up and rounded UP to the nearest ₹10 so quoted numbers stay
 * clean over WhatsApp and never land under the intended margin. Rounding up means sub-₹100
 * items carry an effective markup above the nominal percentage; that is deliberate.
 */

export const DEFAULT_MARKUP_PCT = 20
export const PRICE_ON_REQUEST = 'Price on request'

/**
 * Marked-up, ₹10-rounded price to show a client.
 * Returns null when there is no usable supplier price, so callers render
 * "Price on request" rather than a misleading ₹0.
 */
export function supplierDisplayPrice(
  supplierPrice: number,
  markupPct: number = DEFAULT_MARKUP_PCT
): number | null {
  if (!Number.isFinite(supplierPrice) || supplierPrice <= 0) return null
  const marked = supplierPrice * (1 + markupPct / 100)
  return Math.ceil(marked / 10) * 10
}

/** Display string for a price returned by supplierDisplayPrice. */
export function formatSupplierPrice(price: number | null): string {
  if (price === null) return PRICE_ON_REQUEST
  return `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
```

- [ ] **Step 5: Run the pricing test and confirm it passes**

Run: `npm test`
Expected: all pricing tests PASS.

- [ ] **Step 6: Write the failing naming test**

Create `tests/supplier-naming.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanProductName, slugifyCatalogName } from '../lib/utils/supplier-naming'

test('strips the DES- prefix and title-cases', () => {
  assert.equal(cleanProductName('DES-gajra'), 'Gajra')
  assert.equal(cleanProductName('DES-mala rudraksh plain'), 'Mala Rudraksh Plain')
  assert.equal(cleanProductName('DES-Ghost Mask Rubber1'), 'Ghost Mask Rubber1')
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
```

- [ ] **Step 7: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../lib/utils/supplier-naming`.

- [ ] **Step 8: Implement the naming util**

Create `lib/utils/supplier-naming.ts`:

```ts
/**
 * Name and slug derivation for supplier catalog rows.
 *
 * Every one of the 827 supplier products is named like "DES-mala rudraksh plain". The prefix
 * is an internal code, so it is stripped for display while the original is kept on the row.
 */

/** "DES-mala rudraksh plain" -> "Mala Rudraksh Plain" */
export function cleanProductName(sourceName: string): string {
  const withoutPrefix = sourceName.replace(/^\s*DES-\s*/i, '')
  // "lehenga13" reads badly; give a trailing pure-number group breathing room, but leave
  // unit-ish suffixes like "12no." alone.
  const spaced = withoutPrefix.replace(/([a-z])(\d+)$/i, '$1 $2')
  return spaced
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

/** URL-safe slug: lowercase, & becomes "and", runs of other characters become single hyphens. */
export function slugifyCatalogName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 9: Run all tests and confirm they pass**

Run: `npm test`
Expected: both files PASS, 0 failures.

- [ ] **Step 10: Verify against the real data — no slug collisions**

Run:

```bash
npx tsx -e "
import { readFileSync } from 'node:fs'
import { cleanProductName, slugifyCatalogName } from './lib/utils/supplier-naming'
const db = JSON.parse(readFileSync('vastra-data/db.json','utf8'))
const pSlugs = Object.values(db.products).map((p:any)=>slugifyCatalogName(cleanProductName(p.listing.design_number)))
const cSlugs = Object.values(db.categories).map((c:any)=>slugifyCatalogName(c.category_name))
const dup=(a:string[])=>[...new Set(a.filter((s,i)=>a.indexOf(s)!==i))]
console.log('products',pSlugs.length,'dupes',dup(pSlugs).length,'empty',pSlugs.filter(s=>!s).length)
console.log('categories',cSlugs.length,'dupes',dup(cSlugs).length,'empty',cSlugs.filter(s=>!s).length)
"
```

Expected: `products 827 dupes 0 empty 0` and `categories 61 dupes 0 empty 0`. If any dupes appear, stop and add a numeric suffix strategy before continuing.

- [ ] **Step 11: Commit**

```bash
git add package.json lib/utils/supplier-pricing.ts lib/utils/supplier-naming.ts tests/
git commit -m "feat(catalog): add supplier pricing and naming utilities"
```

---

### Task 2: Database migration

**Files:**
- Create: `supabase/migrations/20260821120000_create_supplier_catalog.sql`
- Create: `scripts/verify-supplier-schema.ts`

**Interfaces:**
- Consumes: nothing
- Produces: tables `supplier_categories`, `supplier_products`, `supplier_product_images`; RPC `search_supplier_catalog(search_term text, result_limit int)`; settings key `supplier_markup_pct`

> **Migrations in this repo are applied by hand in the Supabase SQL Editor** (`DEPLOYMENT.md:15`) — there is no Supabase CLI and no Postgres connection string in `.env.local`. This task therefore ends with a human paste step, then an automated verification.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260821120000_create_supplier_catalog.sql`:

```sql
-- Private supplier catalog (/catalog). Deliberately separate from products/categories so
-- supplier items can never leak into the retail storefront, sitemap or search.
-- supplier_code allows a second source later without a suppliers table.

CREATE TABLE IF NOT EXISTS supplier_categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_code    TEXT NOT NULL DEFAULT 'sup-01',
  source_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  parent_id        UUID REFERENCES supplier_categories(id) ON DELETE CASCADE,
  image_url        TEXT,
  thumbnail_url    TEXT,
  source_image_url TEXT,
  sort_order       INTEGER DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (supplier_code, source_id)
);

CREATE TABLE IF NOT EXISTS supplier_products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_code  TEXT NOT NULL DEFAULT 'sup-01',
  source_id      TEXT NOT NULL,
  name           TEXT NOT NULL,
  source_name    TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  category_id    UUID NOT NULL REFERENCES supplier_categories(id) ON DELETE CASCADE,
  supplier_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes          TEXT,
  tags           TEXT,
  set_value      INTEGER DEFAULT 1,
  min_order_qty  INTEGER DEFAULT 0,
  has_sizes      BOOLEAN DEFAULT FALSE,
  variants       JSONB,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (supplier_code, source_id)
);

CREATE TABLE IF NOT EXISTS supplier_product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  thumb_url  TEXT NOT NULL,
  source_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  UNIQUE (product_id, source_url)
);

-- Full-text search over name + tags.
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(tags, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS supplier_products_search_idx
  ON supplier_products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS supplier_products_category_idx ON supplier_products(category_id);
CREATE INDEX IF NOT EXISTS supplier_categories_parent_idx ON supplier_categories(parent_id);

-- Public read (pages are anonymous); writes are service-role only, matching `products`.
ALTER TABLE supplier_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS supplier_categories_read ON supplier_categories;
CREATE POLICY supplier_categories_read ON supplier_categories
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS supplier_products_read ON supplier_products;
CREATE POLICY supplier_products_read ON supplier_products
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS supplier_product_images_read ON supplier_product_images;
CREATE POLICY supplier_product_images_read ON supplier_product_images
  FOR SELECT USING (TRUE);

-- Search RPC. Mirrors the shape of search_products_and_categories but over supplier tables
-- only, so retail search can never return supplier items.
CREATE OR REPLACE FUNCTION search_supplier_catalog(search_term TEXT, result_limit INT DEFAULT 24)
RETURNS TABLE (
  id UUID, name TEXT, slug TEXT, supplier_price NUMERIC,
  category_name TEXT, category_slug TEXT, thumb_url TEXT
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT p.id, p.name, p.slug, p.supplier_price,
         c.name AS category_name, c.slug AS category_slug,
         (SELECT i.thumb_url FROM supplier_product_images i
           WHERE i.product_id = p.id ORDER BY i.is_primary DESC, i.sort_order ASC LIMIT 1)
  FROM supplier_products p
  JOIN supplier_categories c ON c.id = p.category_id
  WHERE p.is_active
    AND (
      p.search_vector @@ plainto_tsquery('simple', search_term)
      OR p.name ILIKE '%' || search_term || '%'
      OR c.name ILIKE '%' || search_term || '%'
    )
  ORDER BY p.name
  LIMIT LEAST(result_limit, 60);
$$;

-- site_settings has no migration in this repo (created in the dashboard), so create it
-- defensively and seed without ON CONFLICT, which would need a constraint we cannot verify.
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

INSERT INTO site_settings (key, value)
SELECT 'supplier_markup_pct', '{"value": 20}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'supplier_markup_pct');
```

- [ ] **Step 2: Write the verification script**

Create `scripts/verify-supplier-schema.ts`:

```ts
/**
 * Confirms the supplier catalog migration landed. Run after pasting the SQL into the
 * Supabase SQL Editor. Exits non-zero on any problem so it can gate the import.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)
let failed = false

for (const table of ['supplier_categories', 'supplier_products', 'supplier_product_images']) {
  const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) {
    console.error(`FAIL ${table}: ${error.message}`)
    failed = true
  } else {
    console.log(`ok   ${table} (${count ?? 0} rows)`)
  }
}

const rpc = await supabase.rpc('search_supplier_catalog', { search_term: 'test', result_limit: 1 })
if (rpc.error) {
  console.error(`FAIL search_supplier_catalog: ${rpc.error.message}`)
  failed = true
} else {
  console.log('ok   search_supplier_catalog')
}

const setting = await supabase
  .from('site_settings')
  .select('value')
  .eq('key', 'supplier_markup_pct')
  .maybeSingle()
if (setting.error) {
  console.error(`FAIL site_settings: ${setting.error.message}`)
  failed = true
} else if (!setting.data) {
  console.error('FAIL site_settings: supplier_markup_pct row missing')
  failed = true
} else {
  console.log(`ok   supplier_markup_pct = ${JSON.stringify(setting.data.value)}`)
}

process.exit(failed ? 1 : 0)
```

- [ ] **Step 3: Apply the migration (human step)**

Open the Supabase SQL Editor for the project, paste the entire contents of
`supabase/migrations/20260821120000_create_supplier_catalog.sql`, and run it. It is idempotent —
safe to re-run.

- [ ] **Step 4: Verify the schema**

Run: `npx tsx scripts/verify-supplier-schema.ts`
Expected: five `ok` lines, exit code 0. Do not proceed while anything says FAIL.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260821120000_create_supplier_catalog.sql scripts/verify-supplier-schema.ts
git commit -m "feat(catalog): add supplier catalog schema and verification script"
```

---

### Task 3: Watermark and image pipeline

**Files:**
- Create: `scripts/lib/watermark.ts`
- Create: `tests/watermark.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `tiledWatermarkSvg(width: number, height: number, opts?: { text?, opacity?, fontPct?, stepMult? }): string`
  - `processCatalogImage(input: Buffer, variant: 'full' | 'thumb'): Promise<{ data: Buffer; width: number; height: number }>`
  - `assertFontAvailable(): Promise<void>` — throws if text rendering is unavailable

- [ ] **Step 1: Write the failing test**

Create `tests/watermark.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { tiledWatermarkSvg, processCatalogImage, assertFontAvailable } from '../scripts/lib/watermark'

test('font rendering is available', async () => {
  await assertFontAvailable()
})

test('svg carries the brand text, the tilt and the opacity', () => {
  const svg = tiledWatermarkSvg(800, 1000)
  assert.ok(svg.includes('@modfancydress'))
  assert.ok(svg.includes('rotate(-30'))
  assert.ok(svg.includes('fill-opacity="0.14"'))
  assert.ok(svg.startsWith('<svg') && svg.includes('width="800"'))
})

test('font size scales with width so thumbnails stay legible', () => {
  const big = tiledWatermarkSvg(1400, 1400, { fontPct: 0.028 })
  const small = tiledWatermarkSvg(400, 700, { fontPct: 0.055 })
  const size = (s: string) => Number(/font-size="(\d+)"/.exec(s)![1])
  assert.equal(size(big), Math.round(1400 * 0.028))   // 39
  assert.ok(size(small) >= 20, 'thumbnail mark must not collapse to a smudge')
})

test('tiles repeat across the whole canvas', () => {
  const marks = tiledWatermarkSvg(800, 1000).match(/<text/g)!.length
  assert.ok(marks > 6, `expected a repeating tile, got ${marks} marks`)
})

test('full variant caps at 1400px, emits webp, and never enlarges', async () => {
  const src = await sharp({
    create: { width: 2000, height: 3000, channels: 3, background: '#888' },
  }).jpeg().toBuffer()
  const out = await processCatalogImage(src, 'full')
  assert.equal(out.width, 933)
  assert.equal(out.height, 1400)
  const meta = await sharp(out.data).metadata()
  assert.equal(meta.format, 'webp')

  const tiny = await sharp({
    create: { width: 300, height: 300, channels: 3, background: '#888' },
  }).jpeg().toBuffer()
  const tinyOut = await processCatalogImage(tiny, 'full')
  assert.equal(tinyOut.width, 300, 'must not upscale small sources')
})

test('thumb variant is 400px wide webp', async () => {
  const src = await sharp({
    create: { width: 1080, height: 1918, channels: 3, background: '#444' },
  }).jpeg().toBuffer()
  const out = await processCatalogImage(src, 'thumb')
  assert.equal(out.width, 400)
  assert.equal((await sharp(out.data).metadata()).format, 'webp')
})

test('watermarking actually changes the pixels', async () => {
  const src = await sharp({
    create: { width: 800, height: 800, channels: 3, background: '#222' },
  }).jpeg().toBuffer()
  const marked = await processCatalogImage(src, 'full')
  const plain = await sharp(src).webp({ quality: 85 }).toBuffer()
  assert.notEqual(marked.data.length, plain.length)
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../scripts/lib/watermark`.

- [ ] **Step 3: Implement the pipeline**

Create `scripts/lib/watermark.ts`:

```ts
/**
 * Image pipeline for the supplier catalog: resize -> tiled watermark -> WebP.
 *
 * The watermark is tiled rather than placed in a corner so branding survives cropping and
 * screenshotting when a client forwards an image. Tile density scales with image width — a
 * fixed percentage sized for full images renders an illegible ~11px smudge on 400px
 * thumbnails.
 *
 * sharp is a native module and must stay out of the Next build graph; this file is only ever
 * imported by scripts.
 */
import sharp from 'sharp'

export const WATERMARK_TEXT = '@modfancydress'

const VARIANTS = {
  full: { maxWidth: 1400, quality: 85, fontPct: 0.028, stepMult: 13 },
  thumb: { maxWidth: 400, quality: 82, fontPct: 0.055, stepMult: 7.5 },
} as const

export type Variant = keyof typeof VARIANTS

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Repeating diagonal watermark covering the whole canvas. */
export function tiledWatermarkSvg(
  width: number,
  height: number,
  opts: { text?: string; opacity?: number; fontPct?: number; stepMult?: number } = {}
): string {
  const text = escapeXml(opts.text ?? WATERMARK_TEXT)
  const opacity = opts.opacity ?? 0.14
  const fontPct = opts.fontPct ?? VARIANTS.full.fontPct
  const stepMult = opts.stepMult ?? VARIANTS.full.stepMult

  const fontSize = Math.max(11, Math.round(width * fontPct))
  const stepX = Math.round(fontSize * stepMult)
  const stepY = Math.round((fontSize * stepMult) / 1.85)

  let marks = ''
  for (let y = -stepY; y < height + stepY; y += stepY) {
    // Offset alternate rows so the pattern reads as a weave, not a grid.
    const offset = (Math.round(y / stepY) % 2) * (stepX / 2)
    for (let x = -stepX; x < width + stepX; x += stepX) {
      const px = x + offset
      marks +=
        `<text x="${px}" y="${y}" font-family="DejaVu Sans, sans-serif" ` +
        `font-size="${fontSize}" font-weight="600" fill="#ffffff" ` +
        `fill-opacity="${opacity}" transform="rotate(-30 ${px} ${y})">${text}</text>`
    }
  }
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${marks}</svg>`
}

/** Fails loudly if fontconfig cannot render text — otherwise we would silently ship unmarked images. */
export async function assertFontAvailable(): Promise<void> {
  const probe = `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">` +
    `<text x="4" y="40" font-family="DejaVu Sans, sans-serif" font-size="28" fill="#fff">Aa1</text></svg>`
  const { data, info } = await sharp(Buffer.from(probe)).png().toBuffer({ resolveWithObject: true })
  if (!data.length || info.width !== 200) {
    throw new Error('SVG text rendering unavailable — install a sans-serif font before importing')
  }
}

/** Resize, watermark, and encode one image for the given variant. */
export async function processCatalogImage(
  input: Buffer,
  variant: Variant
): Promise<{ data: Buffer; width: number; height: number }> {
  const cfg = VARIANTS[variant]

  // Resize first so the watermark is sized relative to the final image.
  const resized = await sharp(input)
    .rotate() // honour EXIF orientation
    .resize({ width: cfg.maxWidth, height: cfg.maxWidth, fit: 'inside', withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true })

  const { width, height } = resized.info
  const svg = tiledWatermarkSvg(width, height, {
    fontPct: cfg.fontPct,
    stepMult: cfg.stepMult,
  })

  const data = await sharp(resized.data)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .webp({ quality: cfg.quality })
    .toBuffer()

  return { data, width, height }
}
```

- [ ] **Step 4: Run tests and confirm they pass**

Run: `npm test`
Expected: all watermark tests PASS.

- [ ] **Step 5: Eyeball a real image before trusting the pipeline**

Run:

```bash
npx tsx -e "
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { processCatalogImage } from './scripts/lib/watermark'
const dir='vastra-data/images/design'
const f=readdirSync(dir)[0]
for (const v of ['full','thumb'] as const) {
  const out = await processCatalogImage(readFileSync(dir+'/'+f), v)
  writeFileSync('vastra-data/watermark-samples/verify-'+v+'.webp', out.data)
  console.log(v, out.width+'x'+out.height, (out.data.length/1024).toFixed(0)+'KB')
}
"
```

Open both files in `vastra-data/watermark-samples/`. The mark must be readable but not obscure the product. Stop and tune `opacity`/`fontPct` if not.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/watermark.ts tests/watermark.test.ts
git commit -m "feat(catalog): add watermark and image pipeline"
```

---

### Task 4: Importer — categories

**Files:**
- Create: `scripts/import-supplier-catalog.ts`

**Interfaces:**
- Consumes: `processCatalogImage`, `assertFontAvailable` (Task 3); `cleanProductName`, `slugifyCatalogName` (Task 1)
- Produces: CLI `npm run import:catalog -- [--dry-run] [--phases=categories,products] [--limit=N] [--retry-failed]`; a failure ledger at `vastra-data/import-failures.json`

- [ ] **Step 1: Write the importer skeleton and the categories phase**

Create `scripts/import-supplier-catalog.ts`:

```ts
#!/usr/bin/env tsx
/**
 * Imports the scraped supplier catalog (vastra-data/db.json) into Supabase.
 *
 * Idempotent on (supplier_code, source_id) and safe to interrupt: uploads are skipped when the
 * storage object already exists, rows are upserted, and anything that fails permanently lands
 * in a ledger so a later run can retry exactly that.
 *
 * Usage:
 *   npm run import:catalog -- --dry-run
 *   npm run import:catalog -- --phases=categories
 *   npm run import:catalog -- --limit=5
 *   npm run import:catalog -- --retry-failed
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { processCatalogImage, assertFontAvailable, Variant } from './lib/watermark'
import { cleanProductName, slugifyCatalogName } from '../lib/utils/supplier-naming'

config({ path: '.env.local' })

const SUPPLIER_CODE = 'sup-01'
const BUCKET = 'product-images'
const DB_PATH = 'vastra-data/db.json'
const LEDGER_PATH = 'vastra-data/import-failures.json'
const IMAGES_ROOT = 'vastra-data'

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const value = (name: string, fallback: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback

const DRY = flag('dry-run')
const PHASES = value('phases', 'categories,products').split(',')
const LIMIT = Number(value('limit', '0'))
const RETRY_FAILED = flag('retry-failed')
const CONCURRENCY = Number(value('concurrency', '4'))

const log = (msg: string) => console.log(`${new Date().toISOString()} ${msg}`)

// ---------------------------------------------------------------- failure ledger

type Failure = {
  phase: string
  key: string
  error: string
  attempts: number
  last_failed_at: string
}
let ledger: Record<string, Failure> = {}

async function loadLedger() {
  try {
    ledger = JSON.parse(await fsp.readFile(LEDGER_PATH, 'utf8'))
  } catch {
    ledger = {}
  }
}
async function saveLedger() {
  await fsp.writeFile(LEDGER_PATH, JSON.stringify(ledger, null, 2))
}
function recordFailure(phase: string, key: string, err: unknown) {
  const id = `${phase}:${key}`
  const message = err instanceof Error ? err.message : String(err)
  ledger[id] = {
    phase,
    key,
    error: message,
    attempts: (ledger[id]?.attempts ?? 0) + 1,
    last_failed_at: new Date().toISOString(),
  }
  console.error(`FAILED ${id} :: ${message}`)
}
const clearFailure = (phase: string, key: string) => {
  delete ledger[`${phase}:${key}`]
}

// ---------------------------------------------------------------- helpers

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Retries with exponential backoff; throws the last error when attempts run out. */
async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i < attempts) {
        const wait = Math.min(1000 * 2 ** (i - 1), 15000) + Math.floor(Math.random() * 300)
        console.warn(`${label} failed (${i}/${attempts}), retrying in ${wait}ms`)
        await sleep(wait)
      }
    }
  }
  throw lastErr
}

async function pool<T>(items: T[], limit: number, worker: (item: T, i: number) => Promise<void>) {
  const queue = [...items.entries()]
  let done = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      for (;;) {
        const next = queue.shift()
        if (!next) return
        await worker(next[1], next[0])
        if (++done % 25 === 0) log(`  ...${done}/${items.length}`)
      }
    })
  )
}

/** Local path for a scraped image URL, as laid down by scripts/vastra-scrape.mjs. */
function localImagePath(url: string): string {
  const u = new URL(url)
  return path.join(IMAGES_ROOT, 'images', ...u.pathname.split('/').filter(Boolean))
}

/** Uploads one processed variant, skipping the work when the object already exists. */
async function uploadVariant(
  supabase: SupabaseClient,
  sourceUrl: string,
  objectPath: string,
  variant: Variant
): Promise<string> {
  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list(path.dirname(objectPath), { search: path.basename(objectPath), limit: 1 })
  if (existing?.some((o) => o.name === path.basename(objectPath))) {
    return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
  }

  const local = localImagePath(sourceUrl)
  const input = await fsp.readFile(local)
  const processed = await processCatalogImage(input, variant)

  await withRetry(`upload ${objectPath}`, async () => {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, processed.data, { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(error.message)
  })

  return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl
}

// ---------------------------------------------------------------- categories phase

type ScrapedDb = {
  categories: Record<string, any>
  products: Record<string, any>
}

async function importCategories(supabase: SupabaseClient, db: ScrapedDb) {
  const all = Object.values(db.categories)
  log(`Phase categories: ${all.length} categories`)

  // Parents before children so parent_id can be resolved in one pass.
  const ordered = [
    ...all.filter((c: any) => String(c.parent_category_id) === '0'),
    ...all.filter((c: any) => String(c.parent_category_id) !== '0'),
  ]

  const idBySourceId = new Map<string, string>()

  for (const cat of ordered) {
    const sourceId = String(cat.category_id)
    try {
      let imageUrl: string | null = null
      let thumbUrl: string | null = null
      if (cat.image && !DRY) {
        imageUrl = await uploadVariant(
          supabase, cat.image, `catalog/category/${sourceId}.webp`, 'full'
        )
        thumbUrl = await uploadVariant(
          supabase, cat.thumbnail_url || cat.image, `catalog/category/${sourceId}-thumb.webp`, 'thumb'
        )
      }

      const parentSourceId = String(cat.parent_category_id)
      const parentId = parentSourceId === '0' ? null : idBySourceId.get(parentSourceId) ?? null

      const row = {
        supplier_code: SUPPLIER_CODE,
        source_id: sourceId,
        name: cat.category_name,
        slug: slugifyCatalogName(cat.category_name),
        parent_id: parentId,
        image_url: imageUrl,
        thumbnail_url: thumbUrl,
        source_image_url: cat.image || null,
        sort_order: cat.item_index_no ?? 0,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      if (DRY) {
        log(`  [dry] ${row.slug} (parent ${parentSourceId})`)
        idBySourceId.set(sourceId, `dry-${sourceId}`)
      } else {
        const { data, error } = await supabase
          .from('supplier_categories')
          .upsert(row, { onConflict: 'supplier_code,source_id' })
          .select('id')
          .single()
        if (error) throw new Error(error.message)
        idBySourceId.set(sourceId, data.id)
      }
      clearFailure('category', sourceId)
    } catch (err) {
      recordFailure('category', sourceId, err)
    }
  }

  await saveLedger()
  log(`  categories done: ${idBySourceId.size}/${all.length}`)
  return idBySourceId
}

// ---------------------------------------------------------------- main

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars in .env.local')

  await assertFontAvailable()
  const supabase = createClient(url, key)
  const db: ScrapedDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  await loadLedger()

  log(`Importing from ${DB_PATH} — phases=${PHASES.join(',')} dry=${DRY}`)

  if (PHASES.includes('categories')) {
    await importCategories(supabase, db)
  }

  await saveLedger()
  const open = Object.keys(ledger).length
  log(open ? `${open} failures logged in ${LEDGER_PATH}` : 'No outstanding failures')
}

main().catch(async (err) => {
  console.error('Fatal:', err)
  await saveLedger()
  process.exit(1)
})
```

- [ ] **Step 2: Dry-run the categories phase**

Run: `npm run import:catalog -- --dry-run --phases=categories`
Expected: 61 `[dry]` lines, `categories done: 61/61`, no failures. Confirm 12 of them show `(parent 0)`.

- [ ] **Step 3: Run the categories phase for real**

Run: `npm run import:catalog -- --phases=categories`
Expected: `categories done: 61/61`, `No outstanding failures`.

- [ ] **Step 4: Verify parent linkage and images in the database**

Run:

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const { data } = await s.from('supplier_categories').select('slug,parent_id,image_url')
console.log('total', data!.length)
console.log('roots', data!.filter(c=>!c.parent_id).length)
console.log('with image', data!.filter(c=>c.image_url).length)
"
```

Expected: `total 61`, `roots 12`, `with image 51` (10 categories have no supplier image).

- [ ] **Step 5: Commit**

```bash
git add scripts/import-supplier-catalog.ts
git commit -m "feat(catalog): import supplier categories with watermarked images"
```

---

### Task 5: Importer — products and images

**Files:**
- Modify: `scripts/import-supplier-catalog.ts`

**Interfaces:**
- Consumes: `importCategories` id map (Task 4)
- Produces: populated `supplier_products` and `supplier_product_images`

- [ ] **Step 1: Add the products phase**

In `scripts/import-supplier-catalog.ts`, add before `main()`:

```ts
/** Condenses the supplier's colour/size payload to what the product page renders. */
function condenseVariants(detail: any): { hasSizes: boolean; variants: any } {
  const colors = detail?.color_size_data ?? []
  const rows = colors.flatMap((c: any) =>
    (c.size_info ?? []).map((s: any) => ({
      color: c.color_name,
      size: s.size_name,
      rate: Number(s.size_rate) || 0,
      in_stock: s.is_stock_available === 1,
    }))
  )
  // A single "No Color / Default" row carries no information worth showing.
  const meaningful = rows.filter(
    (r: any) => !(r.color === 'No Color' && r.size === 'Default')
  )
  return {
    hasSizes: detail?.is_size === 1 && meaningful.length > 0,
    variants: meaningful.length ? meaningful : null,
  }
}

async function importProducts(
  supabase: SupabaseClient,
  db: ScrapedDb,
  idBySourceId: Map<string, string>
) {
  let products = Object.values(db.products) as any[]
  if (RETRY_FAILED) {
    const keys = new Set(
      Object.values(ledger).filter((f) => f.phase === 'product').map((f) => f.key)
    )
    products = products.filter((p) => keys.has(p.design_id))
  }
  if (LIMIT > 0) products = products.slice(0, LIMIT)

  log(`Phase products: ${products.length} products`)

  await pool(products, CONCURRENCY, async (p) => {
    const sourceId = p.design_id
    try {
      const categorySourceId = String(p.category_ids[0] ?? p.listing.category_id)
      const categoryId = idBySourceId.get(categorySourceId)
      if (!categoryId) throw new Error(`no imported category for ${categorySourceId}`)

      const { hasSizes, variants } = condenseVariants(p.detail)
      const name = cleanProductName(p.listing.design_number)

      const row = {
        supplier_code: SUPPLIER_CODE,
        source_id: sourceId,
        name,
        source_name: p.listing.design_number,
        slug: slugifyCatalogName(name),
        category_id: categoryId,
        supplier_price: Number(p.listing.design_price) || 0,
        notes: p.listing.design_notes || null,
        tags: p.listing.design_tags || null,
        set_value: p.listing.set_value ?? 1,
        min_order_qty: p.listing.minimum_order_qty ?? 0,
        has_sizes: hasSizes,
        variants,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      if (DRY) {
        log(`  [dry] ${row.slug} ₹${row.supplier_price} (${p.image_urls.length} images)`)
        return
      }

      const { data, error } = await supabase
        .from('supplier_products')
        .upsert(row, { onConflict: 'supplier_code,source_id' })
        .select('id')
        .single()
      if (error) throw new Error(error.message)
      const productId = data.id

      // Images: full + thumb per source image, first one primary.
      for (const [i, sourceUrl] of (p.image_urls as string[]).entries()) {
        const base = `${sourceId}-${i}`
        const full = await uploadVariant(supabase, sourceUrl, `catalog/full/${base}.webp`, 'full')
        const thumbSource = p.thumbnail_urls?.[i] ?? sourceUrl
        const thumb = await uploadVariant(
          supabase, thumbSource, `catalog/thumb/${base}.webp`, 'thumb'
        )
        const { error: imgErr } = await supabase.from('supplier_product_images').upsert(
          {
            product_id: productId,
            url: full,
            thumb_url: thumb,
            source_url: sourceUrl,
            sort_order: i,
            is_primary: i === 0,
          },
          { onConflict: 'product_id,source_url' }
        )
        if (imgErr) throw new Error(imgErr.message)
      }

      clearFailure('product', sourceId)
    } catch (err) {
      recordFailure('product', sourceId, err)
    }
    if (Math.random() < 0.05) await saveLedger()
  })

  await saveLedger()
}
```

Then in `main()`, after the categories block:

```ts
  if (PHASES.includes('products')) {
    // Products need the category id map. Rebuild it from the database so the products phase
    // can run on its own without re-importing categories.
    const { data, error } = await supabase
      .from('supplier_categories')
      .select('id, source_id')
      .eq('supplier_code', SUPPLIER_CODE)
    if (error) throw new Error(error.message)
    const map = new Map<string, string>(data!.map((c) => [c.source_id, c.id]))
    if (map.size === 0) throw new Error('No categories imported yet — run --phases=categories first')
    await importProducts(supabase, db, map)
  }
```

- [ ] **Step 2: Dry-run the products phase**

Run: `npm run import:catalog -- --dry-run --phases=products --limit=5`
Expected: 5 `[dry]` lines showing slug, price and image count. No failures.

- [ ] **Step 3: Import 5 products for real and inspect them**

Run: `npm run import:catalog -- --phases=products --limit=5`

Then:

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const { data } = await s.from('supplier_products').select('name,slug,supplier_price,has_sizes,supplier_product_images(url,thumb_url,is_primary)').limit(5)
console.dir(data, { depth: 4 })
"
```

Expected: 5 rows, each with at least one image row, exactly one `is_primary: true`. Open one `url` in a browser and confirm it is watermarked WebP.

- [ ] **Step 4: Run the full import**

Run: `npm run import:catalog -- --phases=products`
Expected: `827` products processed. This uploads ~1873 derivatives and takes a while; it is resumable, so an interruption is safe.

- [ ] **Step 5: Verify totals and retry any failures**

Run:

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
for (const t of ['supplier_categories','supplier_products','supplier_product_images']) {
  const { count } = await s.from(t).select('*', { count: 'exact', head: true })
  console.log(t, count)
}
const { count: zero } = await s.from('supplier_products').select('*', { count:'exact', head:true }).eq('supplier_price', 0)
console.log('zero-price products', zero)
"
```

Expected: `supplier_categories 61`, `supplier_products 827`, `supplier_product_images 885`, `zero-price products 43`.

If `vastra-data/import-failures.json` is non-empty, run `npm run import:catalog -- --phases=products --retry-failed` and re-verify.

- [ ] **Step 6: Commit**

```bash
git add scripts/import-supplier-catalog.ts
git commit -m "feat(catalog): import supplier products, variants and images"
```

---

### Task 6: Query layer

The single place that reads `supplier_*` tables. It is also the boundary that strips
`supplier_price` — no page or component may ever see it.

**Files:**
- Create: `lib/supabase/supplier-queries.ts`

**Interfaces:**
- Consumes: `supplierDisplayPrice`, `formatSupplierPrice` (Task 1)
- Produces:
  - `type CatalogProduct = { id, name, slug, priceLabel, categoryName, categorySlug, thumbUrl, notes, setValue, minOrderQty }`
  - `type CatalogProductDetail = CatalogProduct & { images: {url,thumbUrl}[], hasSizes, variants, tags }`
  - `type CatalogCategory = { id, name, slug, imageUrl, thumbnailUrl, productCount, childCount }`
  - `getCatalogRootCategoriesCached(): Promise<CatalogCategory[]>`
  - `getCatalogCategoryBySlugCached(slug): Promise<{ category, children: CatalogCategory[] } | null>`
  - `getCatalogProductsForCategoryCached(slug, page): Promise<{ products: CatalogProduct[]; total: number; pageSize: number }>`
  - `getCatalogProductBySlugCached(slug): Promise<CatalogProductDetail | null>`
  - `getCatalogCountsCached(): Promise<{ products: number; categories: number }>`
  - `searchCatalog(term): Promise<CatalogProduct[]>`
  - `CATALOG_PAGE_SIZE = 48`

- [ ] **Step 1: Write the query module**

Create `lib/supabase/supplier-queries.ts`:

```ts
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import {
  supplierDisplayPrice,
  formatSupplierPrice,
  DEFAULT_MARKUP_PCT,
} from '@/lib/utils/supplier-pricing'

/**
 * Read layer for the private supplier catalog.
 *
 * INVARIANT: supplier_price never leaves this module. Every exported shape carries a
 * formatted `priceLabel` only, so the owner's cost cannot be read out of page HTML or a
 * client payload.
 */

const ONE_HOUR = 3600
const ONE_DAY = 86400
export const CATALOG_PAGE_SIZE = 48

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type CatalogCategory = {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  thumbnailUrl: string | null
  childCount: number
}

export type CatalogProduct = {
  id: string
  name: string
  slug: string
  priceLabel: string
  categoryName: string
  categorySlug: string
  thumbUrl: string | null
  notes: string | null
  setValue: number
  minOrderQty: number
}

export type CatalogProductDetail = CatalogProduct & {
  images: { url: string; thumbUrl: string }[]
  hasSizes: boolean
  variants: { color: string; size: string; rate: number; in_stock: boolean }[] | null
  tags: string | null
}

/** Markup percentage, mirroring getWholesaleDiscountPctCached. Defaults to 20 if unset. */
export const getCatalogMarkupPctCached = unstable_cache(
  async (): Promise<number> => {
    const { data } = await anonClient()
      .from('site_settings')
      .select('value')
      .eq('key', 'supplier_markup_pct')
      .maybeSingle()
    const pct = (data as { value?: { value?: number } } | null)?.value?.value
    return typeof pct === 'number' ? pct : DEFAULT_MARKUP_PCT
  },
  ['catalog-markup-pct'],
  { revalidate: ONE_HOUR, tags: ['catalog', 'settings'] }
)

/** Converts a raw row into the client-safe shape, dropping supplier_price. */
function toCatalogProduct(row: any, markupPct: number): CatalogProduct {
  const primary =
    row.supplier_product_images?.find((i: any) => i.is_primary) ??
    row.supplier_product_images?.[0]
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    priceLabel: formatSupplierPrice(supplierDisplayPrice(Number(row.supplier_price), markupPct)),
    categoryName: row.supplier_categories?.name ?? row.category_name ?? '',
    categorySlug: row.supplier_categories?.slug ?? row.category_slug ?? '',
    thumbUrl: primary?.thumb_url ?? row.thumb_url ?? null,
    notes: row.notes ?? null,
    setValue: row.set_value ?? 1,
    minOrderQty: row.min_order_qty ?? 0,
  }
}

export const getCatalogRootCategoriesCached = unstable_cache(
  async (): Promise<CatalogCategory[]> => {
    const supabase = anonClient()
    const { data, error } = await supabase
      .from('supplier_categories')
      .select('id, name, slug, image_url, thumbnail_url')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('sort_order', { ascending: false })
    if (error) throw new Error(`catalog root categories: ${error.message}`)

    const { data: children } = await supabase
      .from('supplier_categories')
      .select('parent_id')
      .not('parent_id', 'is', null)
    const childCounts = new Map<string, number>()
    for (const c of children ?? []) {
      childCounts.set(c.parent_id, (childCounts.get(c.parent_id) ?? 0) + 1)
    }

    return (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.image_url,
      thumbnailUrl: c.thumbnail_url,
      childCount: childCounts.get(c.id) ?? 0,
    }))
  },
  ['catalog-root-categories'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

export const getCatalogCategoryBySlugCached = unstable_cache(
  async (slug: string) => {
    const supabase = anonClient()
    const { data: category, error } = await supabase
      .from('supplier_categories')
      .select('id, name, slug, parent_id, image_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
    if (error) throw new Error(`catalog category ${slug}: ${error.message}`)
    if (!category) return null

    const { data: children } = await supabase
      .from('supplier_categories')
      .select('id, name, slug, image_url, thumbnail_url')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: false })

    let parent: { name: string; slug: string } | null = null
    if (category.parent_id) {
      const { data } = await supabase
        .from('supplier_categories')
        .select('name, slug')
        .eq('id', category.parent_id)
        .maybeSingle()
      parent = data ?? null
    }

    return {
      category,
      parent,
      children: (children ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.image_url,
        thumbnailUrl: c.thumbnail_url,
        childCount: 0,
      })) as CatalogCategory[],
    }
  },
  ['catalog-category'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

/**
 * Products in a category including everything beneath it. Descendants come from our own
 * parent_id tree, not the supplier's parent listing, which is missing 16 products.
 */
export const getCatalogProductsForCategoryCached = unstable_cache(
  async (slug: string, page: number) => {
    const supabase = anonClient()
    const markupPct = await getCatalogMarkupPctCached()

    const { data: category } = await supabase
      .from('supplier_categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!category) return { products: [], total: 0, pageSize: CATALOG_PAGE_SIZE }

    // Two levels is the full depth of this tree; resolve descendants breadth-first.
    const { data: kids } = await supabase
      .from('supplier_categories')
      .select('id')
      .eq('parent_id', category.id)
    const ids = [category.id, ...(kids ?? []).map((k) => k.id)]

    const from = (page - 1) * CATALOG_PAGE_SIZE
    const { data, count, error } = await supabase
      .from('supplier_products')
      .select(
        'id, name, slug, supplier_price, notes, set_value, min_order_qty,' +
          'supplier_categories!inner(name, slug), supplier_product_images(thumb_url, is_primary)',
        { count: 'exact' }
      )
      .in('category_id', ids)
      .eq('is_active', true)
      .order('name')
      .range(from, from + CATALOG_PAGE_SIZE - 1)
    if (error) throw new Error(`catalog products ${slug}: ${error.message}`)

    return {
      products: (data ?? []).map((r) => toCatalogProduct(r, markupPct)),
      total: count ?? 0,
      pageSize: CATALOG_PAGE_SIZE,
    }
  },
  ['catalog-category-products'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

export const getCatalogProductBySlugCached = unstable_cache(
  async (slug: string): Promise<CatalogProductDetail | null> => {
    const markupPct = await getCatalogMarkupPctCached()
    const { data, error } = await anonClient()
      .from('supplier_products')
      .select(
        'id, name, slug, supplier_price, notes, tags, set_value, min_order_qty, has_sizes, variants,' +
          'supplier_categories!inner(name, slug), supplier_product_images(url, thumb_url, is_primary, sort_order)'
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()
    if (error) throw new Error(`catalog product ${slug}: ${error.message}`)
    if (!data) return null

    const images = [...(data.supplier_product_images ?? [])]
      .sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
      .map((i: any) => ({ url: i.url, thumbUrl: i.thumb_url }))

    return {
      ...toCatalogProduct(data, markupPct),
      images,
      hasSizes: Boolean(data.has_sizes),
      variants: (data.variants as CatalogProductDetail['variants']) ?? null,
      tags: data.tags ?? null,
    }
  },
  ['catalog-product'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

export const getCatalogCountsCached = unstable_cache(
  async () => {
    const supabase = anonClient()
    const [p, c] = await Promise.all([
      supabase.from('supplier_products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('supplier_categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])
    return { products: p.count ?? 0, categories: c.count ?? 0 }
  },
  ['catalog-counts'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)

/** Not cached — search terms are unbounded. */
export async function searchCatalog(term: string): Promise<CatalogProduct[]> {
  const trimmed = term.trim()
  if (trimmed.length < 2) return []
  const markupPct = await getCatalogMarkupPctCached()
  const { data, error } = await anonClient().rpc('search_supplier_catalog', {
    search_term: trimmed,
    result_limit: 48,
  })
  if (error) throw new Error(`catalog search: ${error.message}`)
  return (data ?? []).map((r: any) => toCatalogProduct(r, markupPct))
}

export const getCatalogProductSlugsCached = unstable_cache(
  async (): Promise<string[]> => {
    const { data } = await anonClient()
      .from('supplier_categories')
      .select('slug')
      .eq('is_active', true)
    return (data ?? []).map((c) => c.slug)
  },
  ['catalog-category-slugs'],
  { revalidate: ONE_DAY, tags: ['catalog'] }
)
```

- [ ] **Step 2: Verify every query against the real database**

Run:

```bash
npx tsx -e "
import { config } from 'dotenv'
config({ path: '.env.local' })
process.env.NEXT_PUBLIC_SUPABASE_URL ||= ''
const q = await import('./lib/supabase/supplier-queries')
const roots = await q.getCatalogRootCategoriesCached()
console.log('roots', roots.length, roots[0])
const cat = await q.getCatalogCategoryBySlugCached(roots[0].slug)
console.log('category', cat?.category.name, 'children', cat?.children.length)
const page = await q.getCatalogProductsForCategoryCached(roots[0].slug, 1)
console.log('products', page.products.length, 'of', page.total)
console.log('sample', page.products[0])
const detail = await q.getCatalogProductBySlugCached(page.products[0].slug)
console.log('detail images', detail?.images.length, 'price', detail?.priceLabel)
console.log('search', (await q.searchCatalog('mukut')).length, 'hits')
console.log('counts', await q.getCatalogCountsCached())
"
```

Expected: roots 12; a category with children; products with `priceLabel` like `₹220`; search returns hits; counts `{ products: 827, categories: 61 }`.

- [ ] **Step 3: Assert the price invariant holds**

Run:

```bash
npx tsx -e "
import { config } from 'dotenv'
config({ path: '.env.local' })
const q = await import('./lib/supabase/supplier-queries')
const roots = await q.getCatalogRootCategoriesCached()
const page = await q.getCatalogProductsForCategoryCached(roots[0].slug, 1)
const detail = await q.getCatalogProductBySlugCached(page.products[0].slug)
const blob = JSON.stringify({ page, detail })
if (/supplier_price/.test(blob)) { console.error('LEAK: supplier_price present'); process.exit(1) }
console.log('ok: no supplier_price in returned shapes')
console.log('price-on-request sample:', page.products.find(p=>p.priceLabel==='Price on request')?.name ?? '(none in this page)')
"
```

Expected: `ok: no supplier_price in returned shapes`, exit 0.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/supplier-queries.ts
git commit -m "feat(catalog): add cached query layer that never exposes supplier cost"
```

---

### Task 7: Catalog components

Copy the visual language of `components/public/ProductCard.tsx` exactly — same tokens, radii,
shadows, hover behaviour — but against the `CatalogProduct` shape. Do not import
`PricingModeContext`; the catalog has one price.

**Files:**
- Create: `components/public/catalog/CatalogProductCard.tsx`
- Create: `components/public/catalog/CatalogCategoryCard.tsx`
- Create: `components/public/catalog/CatalogGrid.tsx`
- Create: `components/public/catalog/CatalogPagination.tsx`
- Create: `components/public/catalog/CatalogSearchBox.tsx`
- Create: `components/public/catalog/CatalogGallery.tsx`
- Create: `components/public/catalog/ShareLinkButton.tsx`

**Interfaces:**
- Consumes: `CatalogProduct`, `CatalogCategory` (Task 6)
- Produces: `<CatalogProductCard product>`, `<CatalogCategoryCard category>`, `<CatalogGrid products>`, `<CatalogPagination page total pageSize basePath>`, `<CatalogSearchBox defaultValue?>`, `<CatalogGallery images alt>`, `<ShareLinkButton />`

- [ ] **Step 1: Product card**

Create `components/public/catalog/CatalogProductCard.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import type { CatalogProduct } from '@/lib/supabase/supplier-queries'

/** Card matching the retail ProductCard's visual language, for the private catalog. */
export function CatalogProductCard({
  product,
  titleTag = 'h3',
}: {
  product: CatalogProduct
  titleTag?: 'h3' | 'h4'
}) {
  const TitleTag = titleTag
  return (
    <Link href={`/catalog/p/${product.slug}`} className="group relative block">
      <div
        className="bg-white rounded-xl overflow-hidden border border-[#E8E5E0] group-hover:border-[#C8956C]/30 transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="aspect-[3/4] relative bg-[#F5F3F0] overflow-hidden">
          {product.thumbUrl ? (
            <Image
              src={product.thumbUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9A9A9A]">
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <TitleTag className="text-sm sm:text-base font-medium text-[#2C2C2C] line-clamp-2 group-hover:text-[#C8956C] transition-colors">
            {product.name}
          </TitleTag>
          <p className="mt-auto pt-2 text-base sm:text-lg font-semibold text-[#2C2C2C]">
            {product.priceLabel}
          </p>
          {product.setValue > 1 && (
            <p className="text-xs text-[#9A9A9A]">Set of {product.setValue}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Category card, grid, and pagination**

Create `components/public/catalog/CatalogCategoryCard.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import type { CatalogCategory } from '@/lib/supabase/supplier-queries'

export function CatalogCategoryCard({ category }: { category: CatalogCategory }) {
  const img = category.thumbnailUrl ?? category.imageUrl
  return (
    <Link href={`/catalog/${category.slug}`} className="group block">
      <div
        className="bg-white rounded-xl overflow-hidden border border-[#E8E5E0] group-hover:border-[#C8956C]/30 transition-all duration-300 group-hover:-translate-y-1"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="aspect-square relative bg-[#F5F3F0] overflow-hidden">
          {img ? (
            <Image
              src={img}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9A9A9A] text-xs">
              {category.name}
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-medium text-[#2C2C2C] group-hover:text-[#C8956C] transition-colors line-clamp-2">
            {category.name}
          </h3>
          {category.childCount > 0 && (
            <p className="text-xs text-[#9A9A9A] mt-1">{category.childCount} sub-categories</p>
          )}
        </div>
      </div>
    </Link>
  )
}
```

Create `components/public/catalog/CatalogGrid.tsx`:

```tsx
import type { CatalogProduct } from '@/lib/supabase/supplier-queries'
import { CatalogProductCard } from './CatalogProductCard'

export function CatalogGrid({
  products,
  titleTag = 'h3',
}: {
  products: CatalogProduct[]
  titleTag?: 'h3' | 'h4'
}) {
  if (products.length === 0) {
    return <p className="text-[#9A9A9A] py-8 text-center">No items here yet.</p>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((p) => (
        <CatalogProductCard key={p.id} product={p} titleTag={titleTag} />
      ))}
    </div>
  )
}
```

Create `components/public/catalog/CatalogPagination.tsx`:

```tsx
import Link from 'next/link'

/** Page 1 is the bare URL so shared links stay clean. */
export function CatalogPagination({
  page,
  total,
  pageSize,
  basePath,
}: {
  page: number
  total: number
  pageSize: number
  basePath: string
}) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`)
  const cls =
    'px-4 py-2 rounded-lg border border-[#E8E5E0] text-sm text-[#2C2C2C] hover:border-[#C8956C] transition-colors'
  return (
    <nav className="flex items-center justify-center gap-3 mt-8" aria-label="Pagination">
      {page > 1 && <Link href={href(page - 1)} className={cls}>Previous</Link>}
      <span className="text-sm text-[#9A9A9A]">Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)} className={cls}>Next</Link>}
    </nav>
  )
}
```

- [ ] **Step 3: Search box, gallery, share button**

Create `components/public/catalog/CatalogSearchBox.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function CatalogSearchBox({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const [q, setQ] = useState(defaultValue)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (q.trim().length >= 2) router.push(`/catalog/search?q=${encodeURIComponent(q.trim())}`)
      }}
      className="relative w-full max-w-xl"
      role="search"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search costumes, wigs, accessories..."
        aria-label="Search the catalog"
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E5E0] bg-white text-[#2C2C2C] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#C8956C] transition-colors"
        style={{ boxShadow: 'var(--shadow-card)' }}
      />
    </form>
  )
}
```

Create `components/public/catalog/CatalogGallery.tsx`:

```tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

export function CatalogGallery({
  images,
  alt,
}: {
  images: { url: string; thumbUrl: string }[]
  alt: string
}) {
  const [active, setActive] = useState(0)
  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-xl bg-[#F5F3F0] flex items-center justify-center text-[#9A9A9A]">
        No Image
      </div>
    )
  }
  return (
    <div>
      <div
        className="aspect-[3/4] relative rounded-xl overflow-hidden bg-[#F5F3F0] border border-[#E8E5E0]"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <Image
          src={images[active].url}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative w-16 h-20 shrink-0 rounded-lg overflow-hidden border transition-colors ${
                i === active ? 'border-[#C8956C]' : 'border-[#E8E5E0]'
              }`}
            >
              <Image src={img.thumbUrl} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

Create `components/public/catalog/ShareLinkButton.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

/** Copies the current page URL — the owner shares these links with clients directly. */
export function ShareLinkButton() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          setCopied(false)
        }
      }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E8E5E0] text-sm text-[#2C2C2C] hover:border-[#C8956C] transition-colors"
    >
      {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      {copied ? 'Link copied' : 'Copy link'}
    </button>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `components/public/catalog/`.

- [ ] **Step 5: Commit**

```bash
git add components/public/catalog/
git commit -m "feat(catalog): add catalog UI components matching site theme"
```

---

### Task 8: Pages

**Files:**
- Create: `app/(public)/catalog/page.tsx`
- Create: `app/(public)/catalog/[slug]/page.tsx`
- Create: `app/(public)/catalog/p/[slug]/page.tsx`
- Create: `app/(public)/catalog/search/page.tsx`

**Interfaces:**
- Consumes: everything from Tasks 6 and 7; `whatsappLink` from `lib/constants/contact.ts`
- Produces: the four routes

**Every page must export this exact metadata robots block:**

```ts
robots: { index: false, follow: false, googleBot: { index: false, follow: false } }
```

- [ ] **Step 1: Catalog index**

Create `app/(public)/catalog/page.tsx`:

```tsx
import type { Metadata } from 'next'
import {
  getCatalogRootCategoriesCached,
  getCatalogCountsCached,
} from '@/lib/supabase/supplier-queries'
import { CatalogCategoryCard } from '@/components/public/catalog/CatalogCategoryCard'
import { CatalogSearchBox } from '@/components/public/catalog/CatalogSearchBox'
import { ShareLinkButton } from '@/components/public/catalog/ShareLinkButton'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Catalogue',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default async function CatalogIndexPage() {
  const [categories, counts] = await Promise.all([
    getCatalogRootCategoriesCached(),
    getCatalogCountsCached(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C]">Catalogue</h1>
          <p className="text-[#9A9A9A] mt-1">
            {counts.products} items across {counts.categories} categories
          </p>
        </div>
        <ShareLinkButton />
      </div>

      <div className="mb-8">
        <CatalogSearchBox />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {categories.map((c) => (
          <CatalogCategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Category page**

Create `app/(public)/catalog/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  getCatalogCategoryBySlugCached,
  getCatalogProductsForCategoryCached,
  getCatalogProductSlugsCached,
} from '@/lib/supabase/supplier-queries'
import { CatalogGrid } from '@/components/public/catalog/CatalogGrid'
import { CatalogCategoryCard } from '@/components/public/catalog/CatalogCategoryCard'
import { CatalogPagination } from '@/components/public/catalog/CatalogPagination'
import { CatalogSearchBox } from '@/components/public/catalog/CatalogSearchBox'
import { ShareLinkButton } from '@/components/public/catalog/ShareLinkButton'

export const revalidate = 86400
export const dynamicParams = true

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const slugs = await getCatalogProductSlugsCached()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await getCatalogCategoryBySlugCached(slug)
  return {
    title: found ? `${found.category.name} | Catalogue` : 'Catalogue',
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  }
}

export default async function CatalogCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? '1') || 1)

  const found = await getCatalogCategoryBySlugCached(slug)
  if (!found) notFound()

  const { products, total, pageSize } = await getCatalogProductsForCategoryCached(slug, page)
  if (page > 1 && products.length === 0) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <nav className="flex items-center gap-1 text-sm text-[#9A9A9A] mb-4" aria-label="Breadcrumb">
        <Link href="/catalog" className="hover:text-[#C8956C]">Catalogue</Link>
        {found.parent && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/catalog/${found.parent.slug}`} className="hover:text-[#C8956C]">
              {found.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#2C2C2C]">{found.category.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C]">
            {found.category.name}
          </h1>
          <p className="text-[#9A9A9A] mt-1">{total} items</p>
        </div>
        <ShareLinkButton />
      </div>

      <div className="mb-8">
        <CatalogSearchBox />
      </div>

      {found.children.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">Browse by type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {found.children.map((c) => (
              <CatalogCategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">All items</h2>
        <CatalogGrid products={products} titleTag="h4" />
        <CatalogPagination
          page={page}
          total={total}
          pageSize={pageSize}
          basePath={`/catalog/${slug}`}
        />
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Product page**

Create `app/(public)/catalog/p/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { getCatalogProductBySlugCached } from '@/lib/supabase/supplier-queries'
import { CatalogGallery } from '@/components/public/catalog/CatalogGallery'
import { ShareLinkButton } from '@/components/public/catalog/ShareLinkButton'
import { whatsappLink } from '@/lib/constants/contact'

export const revalidate = 86400
export const dynamicParams = true

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getCatalogProductBySlugCached(slug)
  return {
    title: product ? `${product.name} | Catalogue` : 'Catalogue',
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  }
}

export default async function CatalogProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getCatalogProductBySlugCached(slug)
  if (!product) notFound()

  const enquiry = whatsappLink(
    `Hi, I'd like to know about "${product.name}" (${product.priceLabel}) from your catalogue.`
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <nav className="flex items-center gap-1 text-sm text-[#9A9A9A] mb-6" aria-label="Breadcrumb">
        <Link href="/catalog" className="hover:text-[#C8956C]">Catalogue</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/catalog/${product.categorySlug}`} className="hover:text-[#C8956C]">
          {product.categoryName}
        </Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <CatalogGallery images={product.images} alt={product.name} />

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C]">{product.name}</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">{product.categoryName}</p>

          <p className="text-3xl font-semibold text-[#2C2C2C] mt-5">{product.priceLabel}</p>

          <dl className="mt-4 space-y-1 text-sm text-[#2C2C2C]">
            {product.setValue > 1 && (
              <div className="flex gap-2">
                <dt className="text-[#9A9A9A]">Set of</dt>
                <dd>{product.setValue}</dd>
              </div>
            )}
            {product.minOrderQty > 0 && (
              <div className="flex gap-2">
                <dt className="text-[#9A9A9A]">Minimum order</dt>
                <dd>{product.minOrderQty}</dd>
              </div>
            )}
          </dl>

          {product.notes && (
            <div className="mt-5 p-4 rounded-xl bg-[#F5F3F0] border border-[#E8E5E0]">
              <p className="text-sm text-[#2C2C2C]">{product.notes}</p>
            </div>
          )}

          {product.hasSizes && product.variants && (
            <div className="mt-6">
              <h2 className="text-base font-medium text-[#2C2C2C] mb-2">Available options</h2>
              <div className="overflow-x-auto rounded-xl border border-[#E8E5E0]">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F3F0] text-[#9A9A9A]">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Colour</th>
                      <th className="text-left px-3 py-2 font-medium">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v, i) => (
                      <tr key={`${v.color}-${v.size}-${i}`} className="border-t border-[#E8E5E0]">
                        <td className="px-3 py-2">{v.color}</td>
                        <td className="px-3 py-2">{v.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={enquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8956C] text-white font-medium hover:bg-[#b8845c] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Enquire on WhatsApp
            </a>
            <ShareLinkButton />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Search page**

Create `app/(public)/catalog/search/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { searchCatalog } from '@/lib/supabase/supplier-queries'
import { CatalogGrid } from '@/components/public/catalog/CatalogGrid'
import { CatalogSearchBox } from '@/components/public/catalog/CatalogSearchBox'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search | Catalogue',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default async function CatalogSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const results = q.trim().length >= 2 ? await searchCatalog(q) : []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <nav className="text-sm text-[#9A9A9A] mb-4">
        <Link href="/catalog" className="hover:text-[#C8956C]">Catalogue</Link>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C] mb-6">
        {q ? `Results for "${q}"` : 'Search the catalogue'}
      </h1>
      <div className="mb-8">
        <CatalogSearchBox defaultValue={q} />
      </div>
      {q.trim().length >= 2 && (
        <p className="text-[#9A9A9A] mb-4">{results.length} items found</p>
      )}
      <CatalogGrid products={results} />
    </div>
  )
}
```

- [ ] **Step 5: Build and confirm the routes exist**

Run: `npm run build`
Expected: build succeeds; the route table lists `/catalog`, `/catalog/[slug]`, `/catalog/p/[slug]`, `/catalog/search`, with `/catalog/[slug]` showing prerendered paths.

- [ ] **Step 6: Check the pages render**

Run `npm run dev`, then in another shell:

```bash
curl -s localhost:3000/catalog | grep -o '<title>[^<]*' 
curl -s localhost:3000/catalog | grep -c 'catalog/'
curl -s "localhost:3000/catalog/search?q=mukut" | grep -oE '₹[0-9,]+' | head -3
```

Expected: a title, several category links, and rupee prices in the search results. Then open
`localhost:3000/catalog` in a browser at a phone width and confirm a 2-column grid, readable
prices, and watermarked images.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/catalog"
git commit -m "feat(catalog): add catalogue index, category, product and search pages"
```

---

### Task 9: Crawl protection

**Files:**
- Modify: `app/robots.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: the routes from Task 8
- Produces: `/catalog` blocked at four layers

- [ ] **Step 1: Disallow /catalog in robots.txt**

In `app/robots.ts`, change the `disallow` array to include `/catalog`:

```ts
        disallow: ['/admin/', '/api/', '/cart', '/wholesale/enquiry', '/catalog'],
```

- [ ] **Step 2: Add the X-Robots-Tag header**

In `next.config.ts`, inside `headers()`, add a second entry after the existing `/(.*)` block:

```ts
      {
        // Belt-and-braces: the private catalogue must never be indexed even if a page's
        // metadata is wrong or missing.
        source: '/catalog/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/catalog',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
```

- [ ] **Step 3: Verify all four layers**

Run `npm run build && npm start`, then:

```bash
echo '--- 1. page metadata ---'
curl -s localhost:3000/catalog | grep -o '<meta name="robots"[^>]*>'
echo '--- 2. robots.txt ---'
curl -s localhost:3000/robots.txt | grep -i catalog
echo '--- 3. response header ---'
curl -sI localhost:3000/catalog | grep -i x-robots-tag
curl -sI localhost:3000/catalog/wigs | grep -i x-robots-tag
echo '--- 4. sitemap must NOT contain catalog ---'
curl -s localhost:3000/sitemap.xml | grep -c '/catalog' || echo '0 (correct)'
```

Expected: a `noindex` meta tag; `Disallow: /catalog`; `X-Robots-Tag: noindex, nofollow` on both
URLs; and `0` catalog entries in the sitemap. Every one of the four must pass.

- [ ] **Step 4: Commit**

```bash
git add app/robots.ts next.config.ts
git commit -m "feat(catalog): block the private catalogue from search engines"
```

---

### Task 10: Final verification and push

**Files:** none created; this task validates and ships.

- [ ] **Step 1: Run the full check suite**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests pass, no type errors, lint clean, build succeeds.

- [ ] **Step 2: Re-assert the money invariant on the built output**

```bash
npm start &
sleep 5
curl -s localhost:3000/catalog/wigs | grep -c 'supplier_price' || echo '0 (correct)'
curl -s localhost:3000/catalog/wigs | grep -oE '₹[0-9,]+' | head -5
kill %1
```

Expected: `0` occurrences of `supplier_price`, and marked-up prices ending in `0`.

- [ ] **Step 3: Confirm the working tree holds nothing it should not**

```bash
git status --short
```

Expected: `vastra-data/` must NOT appear (it is gitignored, 855 MB). If it does, stop and fix
`.gitignore` before going further.

- [ ] **Step 4: Push to main**

```bash
git checkout -b feat/supplier-catalog
git push -u origin feat/supplier-catalog
git checkout main
git merge --no-ff feat/supplier-catalog -m "feat(catalog): private supplier catalogue at /catalog"
git push origin main
```

- [ ] **Step 5: Verify the deployment**

Once Vercel finishes, check the live site:

```bash
curl -sI https://www.modfancydress.com/catalog | grep -i x-robots-tag
curl -s https://www.modfancydress.com/robots.txt | grep -i catalog
curl -s https://www.modfancydress.com/sitemap.xml | grep -c '/catalog' || echo '0 (correct)'
```

Expected: header present, robots.txt disallows `/catalog`, sitemap has zero catalog URLs. Then
open `/catalog` on a phone and walk one category → one product → WhatsApp button.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Data model, RLS, search RPC, settings seed | 2 |
| `site_settings` defensive create + guarded insert | 2 |
| Price rule, ₹10 round-up, price-on-request, markup from settings | 1, 6 |
| `supplier_price` never reaches browser | 6 (invariant asserted in Step 3), 10 (asserted on built HTML) |
| Name cleaning, slug uniqueness | 1 |
| Routes `/catalog`, `/catalog/[slug]`, `/catalog/p/[slug]`, `/catalog/search` | 8 |
| Descendants from our own tree, 48/page, `?page=N`, out-of-range 404 | 6, 8 |
| Search RPC separate from retail search | 2, 6 |
| Four noindex layers | 8, 9 |
| Watermark tiled 14%, scaling font, all images | 3 |
| WebP q85/q82, 1400px/400px, storage paths | 3, 4, 5 |
| Import idempotency, resume, retries, ledger, dry-run, env key | 4, 5 |
| ISR + `unstable_cache`, empty-result guard | 6 (throws on error), 8 (`notFound()`) |
| Theme match, mobile-first | 7 |
| Out of scope: no admin CRUD, no cart, no promote script | honoured — no such tasks |

**Placeholder scan:** none — every code step carries complete code; every verification step has
a runnable command and an expected result.

**Type consistency:** `CatalogProduct` / `CatalogCategory` / `CatalogProductDetail` are defined
in Task 6 and consumed unchanged in Tasks 7–8. `processCatalogImage(input, variant)` and
`tiledWatermarkSvg(w, h, opts)` are defined in Task 3 and used with those exact signatures in
Tasks 4–5. `supplierDisplayPrice(price, markupPct)` and `formatSupplierPrice(price)` are defined
in Task 1 and used in Task 6 only.

**Known risk carried from the spec:** Task 2 Step 3 is a human step — migrations in this repo are
applied by hand in the Supabase SQL Editor (`DEPLOYMENT.md:15`). Tasks 4 onward are blocked until
Task 2 Step 4 reports five `ok` lines.
