# Private supplier catalog at `/catalog`

**Date:** 2026-08-21
**Status:** Designed; not implemented

## Goal

Publish 827 supplier products on modfancydress.com at supplier price +20%, as pages the owner
sends to clients directly over WhatsApp. The pages must be **invisible to search engines** and
must not touch the live retail catalog. Merging selected items into the real `products` table —
and deciding their retail/wholesale treatment and SEO — is a later, separate decision.

## Source data

`scripts/vastra-scrape.mjs` has already mirrored the supplier storefront into
`vastra-data/db.json` (gitignored). See `docs/vastra-scrape.md` for the API details and JSON
schema. What it holds:

| | |
|---|---|
| Categories | 61 — 12 root + 49 children, 2 levels, all slugs unique |
| Products | 827, every one mapped to a category, all name-slugs unique |
| Prices | ₹0–₹21,000; **43 products priced 0** |
| Notes / tags | 179 have supplier notes, 28 have tags |
| Variants | 90 have real size/colour variants |
| Images | 885 full + 885 thumbnails + 51 category images, 842 MB on disk |

Re-running the scraper is incremental, so the import below can be re-run to pick up new
supplier items later.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Data home | New `supplier_*` tables | Live `products`/`categories` feed the sitemap, search RPC, `/products` and `/category/[slug]`. Separate tables make leakage structurally impossible rather than a filter you must remember. Supplier name deliberately kept out of the schema. |
| Privacy | `noindex` + `robots.txt` disallow | Links must open with zero friction for clients. Content is not secret, it just must not rank. |
| Images | Compress to WebP, self-host on Supabase | Owning the files means they cannot vanish when the supplier renames them, and `*.supabase.co` is already allowed by the CSP and `next.config.ts` `remotePatterns`. |
| Price rounding | Round **up** to nearest ₹10 | Clean numbers to quote by voice/WhatsApp, and never lands under the 20% target. Accepted trade-off: cheap items overshoot (₹78 → ₹100 is effectively 28%). |
| Watermark | Tiled diagonal `@modfancydress`, 14% opacity | Survives cropping and screenshotting, so branding travels with forwarded images. Accepted trade-off: slight loss of fine detail (beadwork) versus a corner mark. |

## Data model

New migration. Neutral naming; `supplier_code` allows a second source later without a
`suppliers` table (YAGNI).

```sql
CREATE TABLE supplier_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_code TEXT NOT NULL DEFAULT 'sup-01',
  source_id     TEXT NOT NULL,               -- supplier's category_id, for re-import matching
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  parent_id     UUID REFERENCES supplier_categories(id) ON DELETE CASCADE,
  image_url     TEXT,                        -- our Supabase URL
  thumbnail_url TEXT,
  source_image_url TEXT,                     -- original, so images can be re-fetched
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (supplier_code, source_id)
);

CREATE TABLE supplier_products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_code  TEXT NOT NULL DEFAULT 'sup-01',
  source_id      TEXT NOT NULL,              -- supplier design_id (uuid)
  name           TEXT NOT NULL,              -- cleaned: "DES-gajra" -> "Gajra"
  source_name    TEXT NOT NULL,              -- original, nothing lost
  slug           TEXT NOT NULL UNIQUE,
  category_id    UUID NOT NULL REFERENCES supplier_categories(id) ON DELETE CASCADE,
  supplier_price NUMERIC(10,2) NOT NULL,     -- raw cost; never sent to the browser
  notes          TEXT,
  tags           TEXT,
  set_value      INTEGER DEFAULT 1,
  min_order_qty  INTEGER DEFAULT 0,
  has_sizes      BOOLEAN DEFAULT FALSE,
  variants       JSONB,                      -- condensed colour/size rows
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (supplier_code, source_id)
);

CREATE TABLE supplier_product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,                 -- watermarked WebP, max 1400px
  thumb_url   TEXT NOT NULL,                 -- watermarked WebP, 400px
  source_url  TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  is_primary  BOOLEAN DEFAULT FALSE
);

-- Full-text search column + index, feeding search_supplier_catalog() below.
ALTER TABLE supplier_products ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(tags,''))
  ) STORED;
CREATE INDEX supplier_products_search_idx ON supplier_products USING GIN (search_vector);
```

Indexes: `supplier_products(category_id)`, `supplier_products(slug)`,
`supplier_categories(parent_id)`, plus the GIN index above.

### `site_settings` caveat — verify before writing the migration

`site_settings` is read by `lib/supabase/cached-queries.ts:374` and `lib/utils/pricing.ts`, but
**it has no migration in this repo** — it was created directly in Supabase. Its column shape
and constraints are therefore unverified from source. Observed usage implies
`(key text, value jsonb)` where value holds `{"value": <number>}`.

Before writing the migration, confirm against the live database whether `key` carries a unique
constraint. If it does, seed with `INSERT ... ON CONFLICT (key) DO NOTHING`. If it does not,
`ON CONFLICT` will error — use a guarded insert instead:

```sql
INSERT INTO site_settings (key, value)
SELECT 'supplier_markup_pct', '{"value": 20}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'supplier_markup_pct');
```

The reader must also default to 20 when the row is missing, the way
`getWholesaleDiscountPctCached` defaults to 30, so a missing row degrades to correct behaviour
rather than a broken page.

RLS: public `SELECT` on all three (the pages are anonymous), writes service-role only —
matching how `products` is handled.

### Naming and slugs

- Product name: strip the `DES-` prefix (all 827 have it), title-case, keep the original in
  `source_name`. `DES-mala rudraksh plain` → **Mala Rudraksh Plain**.
- Slugs: derived from the cleaned name / category name. Verified unique across all 827
  products and all 61 categories, so no dedupe suffix logic is needed — but the import must
  still fail loudly on an unexpected collision rather than silently overwrite.

## Price rule

```
display = ceil(supplier_price * (1 + markup_pct/100) / 10) * 10
```

- `markup_pct` comes from `site_settings.supplier_markup_pct`, cached one hour with
  `unstable_cache`, exactly like `getWholesaleDiscountPctCached`
  (`lib/supabase/cached-queries.ts:374`). Changing 20% → 25% is one row edit, no re-import.
- The 43 products with `supplier_price = 0` render **"Price on request"**, never "₹0".
- **`supplier_price` must not reach the browser.** The query layer computes the display price
  and omits the raw cost from what it returns, so a client cannot read the owner's cost out of
  the HTML or a JSON payload.

## Routes and pages

| Route | Renders |
|---|---|
| `/catalog` | the 12 root categories as cards, a search box, total item count |
| `/catalog/[slug]` | any category, root or child — flat slugs, all unique |
| `/catalog/p/[slug]` | one product |
| `/catalog/search?q=` | server-rendered results |

Flat category slugs avoid the `/catalog/[parent]/[child]` vs `/catalog/[category]/[product]`
ambiguity that a nested scheme would create, and keep links short enough to paste into a chat.

**Category page.** Root categories show their child chips plus every product beneath them;
leaves show their own products. Paginated 48 per page via a `?page=N` search param (the largest
category holds 237); page 1 is the bare URL so shared links stay clean, and an out-of-range
page returns `notFound()`.
Descendants are computed from our own `parent_id` tree, **not** from the supplier's parent
listing — that listing is provably incomplete, missing 16 products across the 4 parents
(documented in `docs/vastra-scrape.md`).

**Product page.** Image gallery, name, display price, supplier notes when present, a
colour/size table when `has_sizes`, a WhatsApp button pre-filled with item name and price using
the site's existing WhatsApp number, and a link back to its category.

## Search

A dedicated Postgres RPC `search_supplier_catalog(search_term, result_limit)` over product
name, tags and category name, backed by a generated `tsvector` column and GIN index — the same
shape as the existing `search_products_and_categories` RPC used by `app/api/search/route.ts`.
Keeping it a separate function means retail search cannot return supplier items and needs no
changes.

## Keeping it out of search engines

Four independent layers, so no single mistake exposes the section:

1. `robots: { index: false, follow: false }` in every `/catalog` page's `generateMetadata`.
2. `/catalog` added to the disallow list in `app/robots.ts`.
3. Absent from `app/sitemap.ts` — it enumerates the `products`/`categories` tables, so
   exclusion is automatic; to be verified explicitly, not assumed.
4. An `X-Robots-Tag: noindex, nofollow` response header on `/catalog/*` via `next.config.ts`
   `headers()`, which catches anything that bypasses page metadata.

## Image pipeline

`scripts/import-supplier-catalog.ts`, reading `vastra-data/db.json`:

1. Resize to max 1400px (`fit: inside`, no enlargement).
2. Composite the tiled diagonal watermark: `@modfancydress`, white, 14% opacity, rotated -30°.
   **Tile density scales with image size** — font ≈2.8% of width on full images, ≈5.5% on
   400px thumbnails. A fixed 2.8% produced an 11px smudge on thumbnails; verified legible at
   both sizes before adoption.
3. Encode WebP q85 (full) / q82 (thumbnails), matching the existing `compress.js` convention.
4. Upload to `product-images/catalog/full/` and `product-images/catalog/thumb/`.
5. Upsert categories → products → images, keyed on `(supplier_code, source_id)`.

Every uploaded image is watermarked — the 885 product images, their thumbnails, and the 51
category tiles alike. Nothing supplier-sourced is served unmarked.

Measured on a 40-image sample: 898 KB average source → **209 KB output, 77% smaller**.
Projected **~180 MB for full images plus ~40 MB thumbnails, ~220 MB total** — comfortably
inside a 1 GB storage tier.

Watermarking happens **after** resize so the mark is sized relative to the final image.
Fonts: rendering uses DejaVu Sans via fontconfig; the script must assert a usable font at
startup and fail loudly rather than silently emitting unwatermarked images. This is a local
script, not a serverless function, so font availability is stable.

### Import fault tolerance

Same discipline as the scraper, for the same reason — a 1873-image upload will be interrupted:

- Idempotent on `(supplier_code, source_id)`; re-running skips completed work.
- Skips any image already uploaded, verified by object existence, not by a local flag.
- Retries uploads with exponential backoff; permanent failures go to a ledger file with enough
  context to retry, and the run continues.
- `--dry-run` prints what would change without writing.
- Reads `SUPABASE_SERVICE_ROLE_KEY` from the environment. It must **not** hardcode the key —
  `compress.js` does that today and the key is committed to git history (see Risks).

## Rendering and caching

- Category pages: `generateStaticParams` over the 61 slugs.
- Product pages: on-demand ISR, no `generateStaticParams`, so 827 pages are not added to every
  build.
- All data access through `unstable_cache` with tags, following `lib/supabase/cached-queries.ts`.
- **Empty-result guard.** A known failure mode in this project is ISR caching an empty catalog
  during a Supabase outage, which then persists until a redeploy. Catalog queries must
  `notFound()` or throw on an unexpected empty result rather than rendering and caching an
  empty page.

## Out of scope

- No admin CRUD for these tables — the import script is the source of truth.
- No cart, checkout, or enquiry-basket integration.
- No promote-into-`products` script yet. Every row keeps `source_id`, `supplier_code` and its
  Supabase image URLs, so promotion later is an `INSERT ... SELECT` plus a slug decision rather
  than a re-import.
- No retail/wholesale dual pricing here; that belongs to the later merge.

## Risks and open items

- **Supplier image rights.** These are the supplier's product photographs. Keeping the section
  `noindex` and shared privately is materially different from publishing them on the indexed
  retail site. Before any of this becomes public, get the supplier's agreement on image reuse.
  The watermark does not change that.
- **Leaked service-role key (pre-existing, unrelated to this work).** `compress.js` has the
  Supabase `service_role` key hardcoded and committed (`c2184c8`). That key bypasses RLS
  entirely. Recommend rotating it and moving it to env; the new import script will read from
  env regardless.
- **Cheap-item markup overshoot.** Rounding up to ₹10 means sub-₹100 items carry an effective
  markup above 20%. Accepted deliberately; switch to ₹5 rounding if it becomes a problem.
- **Watermark is destructive.** Uploaded derivatives are watermarked; the clean originals stay
  in `vastra-data/images/` (gitignored, 842 MB) and can regenerate everything. Don't delete
  that directory.

## File inventory

New:
- `supabase/migrations/<ts>_create_supplier_catalog.sql`
- `scripts/import-supplier-catalog.ts`
- `lib/supabase/supplier-queries.ts`
- `lib/utils/supplier-pricing.ts`
- `app/(public)/catalog/page.tsx`
- `app/(public)/catalog/[slug]/page.tsx`
- `app/(public)/catalog/p/[slug]/page.tsx`
- `app/(public)/catalog/search/page.tsx`
- `components/public/catalog/` — category card, product grid, product gallery, search box

Edited:
- `app/robots.ts` — disallow `/catalog`
- `next.config.ts` — `X-Robots-Tag` header for `/catalog/*`
