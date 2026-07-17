# Configurable Homepage Sections — Design Spec

- **Date:** 2026-07-17
- **Status:** Approved (pending spec review)
- **Author:** Piyush Arora (with Claude)

## Problem

The homepage has a single hard-coded "New Arrivals" section that lists the 8
most-recently-uploaded products (`created_at desc`). For a costume rental/sale
business, demand is **event-driven** (Independence Day, Republic Day, Janmashtami,
annual-function season, Halloween), not recency-driven. "Newest uploaded" rarely
equals "what customers want this month." Order data is too sparse (17 orders / 25
line items) to compute real analytics-driven "trending," so the section must be
**admin-curated**.

Occasions also **overlap** (e.g. Independence Day + Janmashtami can fall close
together), so the homepage must be able to feature more than one occasion at once,
each clearly labeled.

## Goals

- Replace "New Arrivals" with **multiple admin-configurable sections** (rows), each
  = `{ title, source, category, product_count, order, enabled }`.
- Handle overlapping occasions by enabling multiple labeled sections.
- Zero-effort seasonal swaps: change what's featured by toggling/reconfiguring in
  admin, live within seconds.
- Fully **server-rendered** for SEO + Core Web Vitals.
- Reuse the existing Banner-module admin UX so it feels familiar.

## Non-Goals

- Analytics/sales-driven "trending" (data too sparse; revisit later).
- Per-product `is_featured` toggle (tedious; can layer "pin specific products"
  onto a section later if needed).
- Multiple categories mixed into one section (combine via multiple sections instead).

## Data Model

New table `homepage_sections` (mirrors `banners` RLS pattern):

| column | type | notes |
|---|---|---|
| `id` | uuid PK | `default uuid_generate_v4()` |
| `title` | text NOT NULL | customer-facing heading, e.g. "Independence Day Picks" |
| `source_type` | text NOT NULL default `'category'` | `'category'` \| `'latest'` |
| `category_id` | uuid NULL | FK → `categories(id)` ON DELETE SET NULL; null when `source_type='latest'` |
| `product_count` | int NOT NULL default 8 | clamp 1–12 in admin UI |
| `sort_order` | int NOT NULL default 0 | row order on the page |
| `is_enabled` | boolean NOT NULL default true | on/off |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | |

**RLS:** public `SELECT` (true); admin `INSERT/UPDATE/DELETE` gated on
`(auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'` — identical to `banners`.

**Index:** none new required beyond the FK; product lookups rely on the existing
`product_categories(category_id)` and `products(created_at)` indexes.

TypeScript: add `HomepageSection` type to `types/database.ts`.

## Rendering (server-side)

In `app/(public)/page.tsx` (Server Component, existing `revalidate = 86400`):

1. Fetch enabled sections: `homepage_sections` where `is_enabled = true`
   ordered by `sort_order asc`.
2. For each section, fetch its products **in parallel** (`Promise.all`):
   - `source_type = 'category'`: products joined via `product_categories`
     where `category_id = section.category_id`, `is_active = true`,
     `deleted_at IS NULL`, ordered `created_at desc`, limit `product_count`.
   - `source_type = 'latest'`: products `is_active = true`, `deleted_at IS NULL`,
     ordered `created_at desc`, limit `product_count` (current New Arrivals query).
   - Select only fields the cards need (id, name, slug, price fields, category,
     categories, images, variants) — keep payload lean.
3. Render each via a new server component `components/public/HomepageSection.tsx`:
   - `<section aria-labelledby={id}>` with `<h2 id={id}>{title}</h2>`
   - `<ProductGrid products={...} productTitleTag="h4" showViewAllCard />`
   - "View all →" link: `/category/[slug]` for category sources, `/products` for latest.
   - Skip rendering a section whose product query returns empty (no empty rows).
4. Keep `PricingModeToggle` on the **first** section's header (as today).

`AssetPreloader` continues to preload the banner (LCP) only — section product
images are **not** preloaded (below the fold).

## Admin Module

- New nav link **"Homepage"** → `/admin/homepage` in `app/(admin)/admin/layout.tsx`
  (`navLinks` array).
- `app/(admin)/admin/homepage/page.tsx` — loads sections + active categories.
- `components/admin/HomepageSectionsManagement.tsx` (client) — same card-list UX as
  `BannerManagement`:
  - Per card: title input · source select (Category / Latest products) · category
    dropdown (active categories, shown when source=category) · product count
    (number, 1–12) · enable toggle · reorder ↑↓ · delete.
  - "Add Section" draft + "Save All" (upsert with `sort_order` = visual index).
- **On save → on-demand revalidation of `/`** so changes go live immediately instead
  of waiting for the 24h ISR window. Implement `app/api/revalidate/route.ts`
  (admin-auth or shared-secret protected) calling `revalidatePath('/')`; admin
  calls it after a successful save. (Also fixes the same 24h staleness that
  currently affects banner edits — banner admin can adopt it later.)

## SEO

- Server-rendered → all section content + product links present in initial HTML.
- Heading hierarchy: page `h1` (hero) → section `h2` (title) → card `h4`
  (`productTitleTag="h4"`).
- Each section is a semantic `<section aria-labelledby>`; "View all" is a real
  `<a href>` to the canonical category page (strengthens internal linking to
  category pages).
- Descriptive, occasion-keyworded titles improve topical relevance.
- Add `ItemList` JSON-LD per section (position + product url/name) to aid product
  rich results. Sections link to canonical category pages (no duplicate-content risk).

## Mobile

- `ProductGrid` is already responsive: 2 cols mobile → 4 cols desktop. Reuse as-is.
- Section header stacks on mobile (`flex-col sm:flex-row`), matching current layout.
- Keep default `product_count` modest (8 = 4 mobile rows/section); recommend ≤ 3–4
  enabled sections at once so the mobile page doesn't get excessively long.
- Ensure `ProductCard` `next/image` uses correct responsive `sizes`
  (`(max-width:768px) 50vw, 25vw`) so phones don't over-download.

## Web Vitals

- **LCP:** hero banner remains the LCP element. Section product images are below the
  fold and must be **lazy-loaded** (`next/image` non-priority, `loading="lazy"`) —
  no `priority` on any section image, so they don't compete with the banner.
- **CLS:** server-rendered (no client pop-in) + fixed card aspect ratios → no layout
  shift. Skip empty sections server-side (don't render then remove).
- **INP:** sections add ~no client JS (only the existing `PricingModeToggle` island).
- **Query cost:** parallel `Promise.all`, each query limited to `product_count`,
  lean field selection, cached by ISR + on-demand revalidation.

## Seed Data (in the migration)

- `Independence Day Picks` → source `category`, `independence-day-dress`, enabled,
  `sort_order 0` (current occasion).
- `New Arrivals` → source `latest`, enabled, `sort_order 1` (nothing lost; can be
  disabled anytime).

## Files

- `supabase/migrations/033_create_homepage_sections.sql` (new — table, RLS, seed)
- `types/database.ts` (add `HomepageSection`)
- `app/(admin)/admin/layout.tsx` (nav link)
- `app/(admin)/admin/homepage/page.tsx` (new)
- `components/admin/HomepageSectionsManagement.tsx` (new)
- `app/api/revalidate/route.ts` (new — on-demand revalidate)
- `components/public/HomepageSection.tsx` (new — server component)
- `app/(public)/page.tsx` (replace New Arrivals block)

## Defaults chosen (correct if wrong)

- One category per section (overlap handled via multiple sections).
- Product order within a section: newest-first (`created_at desc`) — deterministic
  for caching.
- `product_count` default 8, admin-editable, clamped 1–12.
- Products filtered to `is_active = true AND deleted_at IS NULL`.
- Dedicated table (not `site_settings` JSON) to match the `banners` admin pattern.
