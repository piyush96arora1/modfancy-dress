# SEO Growth + Web Vitals — Festival Season 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow Google impressions and rankings through the Oct 2026 – Jan 2027 festival run (Navratri → Dussehra → Halloween → Diwali → Children's Day → annual functions → Christmas → Republic Day) while taking mobile Core Web Vitals from "poor" to "good".

**Architecture:** Three kinds of work, run together:
1. **Content and data** in Supabase, done by dry-run-by-default scripts in `scripts/` with an `--apply` flag.
2. **Code** in the Next.js app: sitemap, images, soft-404s, internal linking, homepage seasonality.
3. **Owner actions**: stock, Google Business Profile, photos.

Every task is ordered by the date it has to be live, because fancy-dress search demand arrives in spikes (Search Console: Independence Day pages went from 29k impressions to 1.6k within two weeks of 15 Aug).

**Tech Stack:** Next.js 16 App Router (webpack), Supabase (Postgres + Storage), `tsx --test` (node:test), `sharp` 0.34 (already a dependency), Composio CLI for Search Console.

**Spec / evidence:** This plan argues from these findings, gathered 23 Sep 2026. Executors should read them before starting.
- Search Console exports and analysis: scratchpad `gsc/`, plus the 90-day analysis from this session. Key numbers are repeated inline in each task's **Why**.
- `…/scratchpad/db/findings.md`: catalog audit (323 live products, alt-text gaps, duplicates, dead slugs, image weights).
- `…/scratchpad/tech/`: Lighthouse JSON, HTML captures, sitemap copy.
- `…/scratchpad/kw/festival-keywords.md`: festival keywords, 2026 dates, Semrush volumes, autocomplete variants.
- `seodata/SEASONAL-CALENDAR.md`, `seodata/PROGRESS.md`: earlier work (June–Aug) that this plan builds on rather than repeats.

(Scratchpad root: `/tmp/claude-1000/-home-fa064236-Desktop-code-modfacnydress/2722ee50-29df-474a-820a-8d0aa9c5fe38/scratchpad/`. Copy anything needed long-term into `seodata/` in Task 0.)

---

## Where we are (baseline, 23 Sep 2026)

| Signal | Value | Source |
|---|---|---|
| Web impressions / clicks, last 28 days | 92,455 / 902, CTR 1.0%, average position 7.4 | Search Console |
| Monthly web impressions | Jun 11k → Jul 73k → **Aug 205k** → Sep (to 20th) 71k | Search Console |
| Image search, 90 days | **723k impressions**, 709 clicks, average position **30.6** (web: 354k) | Search Console |
| Device | 90% mobile | Search Console |
| Lab mobile LCP (slow 4G) | Home 18.6s · garba-dress 22.3s · dandiya-dress 12.0s · products 9.6s · Gabbar 10.6s | Lighthouse 12.8 |
| Page weight | garba-dress 7.9MB · dandiya-dress 9.4MB · /products 9.0MB · home 5.9MB | Lighthouse |
| Image cache header | `cache-control: no-cache` on every Supabase image, including Sep uploads | curl |
| Live products | 323. 152 have no alt text, 4 are orphans, 8 duplicate pairs | DB |
| Dead product URLs with no redirect | 227 of 231. 48 existing redirects point at dead products | DB + redirects.json |
| Soft 404s | `/category/<missing>` and `/wholesale/category/<missing>` return 200 | curl |
| Garba/dandiya Search Console | 820 impressions and **5 clicks** in 90 days. Pages rank at 8–17 | Search Console |

**2026 dates (verified; avoid panchang.org, which ignores Adhik Maas):**
- Navratri: Sun **11 Oct** – Mon 19 Oct
- Dussehra: **20 Oct**. Ramleela runs 11–20 Oct.
- Halloween: 31 Oct
- Diwali: **8 Nov**
- Children's Day: Sat 14 Nov (schools mark it Fri 13 Nov)
- Christmas: 25 Dec
- Republic Day: 26 Jan 2027

**Why most of the September drop is seasonal, not a penalty:** 30 of the 40 biggest page losers are Independence Day or freedom-fighter pages. Their average position held (for example Nehru 5.7 → 5.1); only impressions fell.

## Global Constraints

- Leave `next.config.ts` `images: { unoptimized: true }` as it is ([[no-vercel-image-optimization]]). CWV fixes happen in the stored files, not the Next image optimiser.
- Dev server and build use `--webpack`. Never Turbopack.
- Every live-product query filters `is_active = true AND deleted_at IS NULL`.
- Never add a `loading.tsx` at or above a route that calls `notFound()`. Use in-page `<Suspense>` instead (see `components/public/ProductsListSkeleton.tsx`).
- Data scripts are **dry-run by default**, with `--apply` to write. Per-field guards never overwrite non-empty copy unless the task says "overwrite". Copy the shape of `scripts/backfill-ramleela-descriptions.ts`.
- Copy rules ([[seo-copy-latitude-and-hinglish]]):
  - `seo_title` is 60 characters or fewer, `meta_description` 160 or fewer, both **in English**.
  - At most **one** Roman-script Hinglish line, at the end of body copy.
  - Keep search-real spellings: `gujrati`, `chaniya`, `kediyu`, `ghoomar`, `ramleela`.
- **Why metas stay in English** (you suggested Hinglish metas): Google rewrites a meta when it doesn't match the query, and mixed-script snippets read as spam on English queries. Hinglish queries like "dandiya ki dress" still match on the nouns (`dandiya`, `dress`), which the English meta already contains. Hinglish goes in the body line and in the existing Hindi blog posts.
- **Never restore soft-deleted products** (owner decision, 23 Sep). The owner uploads replacements as new products through the admin panel. After each upload batch, run the **new-upload follow-up** (Task 19a): fill copy, alt text and category (the admin form leaves these empty, see [[admin-upload-leaves-seo-gaps]]), generate image variants, and add a 308 from the old soft-deleted slug to the new product so the old URL's Google history carries over.
- Never write fake reviews, ratings or stock claims. Prices in copy are read from the DB at script time and never hard-coded.
- Copy and page changes appear only after the ISR window or a redeploy ([[isr-bakes-in-supabase-outages]]). After a content task, trigger a redeploy (push to main) and request indexing for the key URLs.
- Commit to `main` with conventional commits, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never stage the unrelated files in the working tree: `jobhai_*`, the `sqllab_*` CSVs, `env`, `.mcp.json`, `independence/`, the PDFs and the MP3.
- Verify a code task with `npm test && npm run lint && npm run build`. The build route table must still show `○`/`●` (static/SSG) for public pages, never `ƒ`, unless the task says otherwise.

## Review Focus

1. **A redirect to a live product.** A slug that is both a live product and a redirect source makes that live page unreachable (`/products/vanvasi-ram` today). The Task 5 redirect test must fail when any `redirects.json` source matches a live slug.
2. **A redirect whose target is dead or itself a redirect** (48 today). Chains and loops waste crawl budget. The Task 5 test resolves every target and fails on chains, loops, or targets outside the set of live URLs.
3. **An image variant that doesn't exist yet.** When the card switches to the 400w URL, products uploaded later than the backfill have no variant, and without a fallback the card breaks. `cardImageUrl()` returns the original URL for anything not in `-webp` folders, and the uploader writes variants from day one (Task 7). Test both.
4. **A category slug that exists but is inactive, or has zero products.** It must 404 or noindex, not render "No products found" with status 200. The Task 3 check covers missing, inactive and empty categories.
5. **Seasonal homepage content after the festival ends.** Janmashtami still leads the homepage on 23 Sep. Date-windowed sections must disappear the day after `ends_on`. The Task 2 test pins the boundary days.

---

## Task order and deadlines

| Wave | Live by | Tasks |
|---|---|---|
| **A: Navratri and Ramleela (late, highest urgency)** | **Fri 25 Sep** | 0, 1, 2, 3, 4 |
| **B: Technical and CWV foundation** | Fri 2 Oct | 5, 6, 7, 8, 9 |
| **C: Halloween, Diwali, Children's Day** | Sat 3 – Sat 10 Oct | 10, 11, 12 |
| **D: Annual-function season, Christmas, local, linking** | 25 Oct – 10 Nov | 13, 14, 15, 16 |
| **E: Republic Day, then ongoing** | 10–20 Dec, then weekly | 17, 18 |

Owner actions are collected in **Task 19**. They run in parallel from day one. Stock is confirmed for everything listed (23 Sep); content tasks wait only on the upload date.

---

### Task 0: Freeze the baseline and a weekly Search Console snapshot

**Why:** Without a saved baseline we can't tell a win from seasonality. Search Console data only starts in March 2026, so there's no autumn 2025 to compare against, and our own snapshots are the only history there will be.

**Files:**
- Create: `seodata/gsc/2026-09-23-baseline.md` (key numbers from the "Where we are" table plus the top 50 queries and pages)
- Create: `seodata/gsc/snapshot.sh`
- Copy: `…/scratchpad/kw/festival-keywords.md` → `seodata/FESTIVAL-KEYWORDS-2026.md`; `…/scratchpad/db/findings.md` → `seodata/CATALOG-AUDIT-2026-09-23.md`

- [ ] **Step 1: Write `seodata/gsc/snapshot.sh`**

```bash
#!/usr/bin/env bash
# Pull a 28-day Search Console snapshot (web + image) into seodata/gsc/<date>/.
# Needs the composio CLI logged in with the google_search_console toolkit linked.
set -euo pipefail
END=$(date -d '3 days ago' +%F)          # GSC data lags ~2-3 days
START=$(date -d "$END -27 days" +%F)
OUT="$(dirname "$0")/$(date +%F)"; mkdir -p "$OUT"
q() { composio execute GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY -d "{\"site_url\":\"sc-domain:modfancydress.com\",\"start_date\":\"$START\",\"end_date\":\"$END\",\"dimensions\":$1,\"row_limit\":5000,\"search_type\":\"$2\"}" > "$OUT/$3.json"; }
q '[]' web total_web; q '[]' image total_image
q '["query"]' web queries_web; q '["page"]' web pages_web
q '["page"]' image pages_image; q '["date"]' web daily_web
echo "saved $OUT ($START..$END)"
```

Composio writes large results to a side file (`storedInFile: true`, `outputFilePath`). When the JSON has `storedInFile`, the analysis reads `outputFilePath`.

- [ ] **Step 2: Run it and write the baseline.** Run `bash seodata/gsc/snapshot.sh`, then write `2026-09-23-baseline.md` with the table above plus the top 50 web queries and pages by impressions.
- [ ] **Step 3: Copy the audit files into `seodata/` (listed above).**
- [ ] **Step 4: Commit.** `git add seodata/gsc seodata/FESTIVAL-KEYWORDS-2026.md seodata/CATALOG-AUDIT-2026-09-23.md && git commit -m "docs(seo): freeze the 23 Sep Search Console baseline and weekly snapshot script"`

---

### Task 1: Navratri and Dandiya content refresh (live by 25 Sep)

**Why:**
- Navratri starts 11 Oct, 18 days away. "dandiya dress" is the site's biggest commercial keyword (Semrush **27,100/mo**, KD 32), and we have ~30 garba/dandiya products, 18 of them adult women's lehengas.
- Even so, Search Console shows only **5 clicks from 820 impressions** in 90 days, with the category pages at positions **11–13**.
- A brand-new page won't rank in 18 days, but the existing pages are already indexed and recrawled daily (lastCrawl 22–23 Sep), so refreshing them is the fastest lever.
- Autocomplete's top suggestions are "dandiya dress for women", "…for men", "…for couple" and "garba dress on rent delhi". The current copy targets kids.
- There are three Navratri blog posts splitting the topic:
  - `navratri-garba-dandiya-dress-guide`: 792 words, 307 impressions
  - `garba-navratri-costume-kids-guide`: 339 words
  - `garba-navratri-dress-guide-hindi`: 302 words
- None has been updated since publishing, and the main guide has **no images and no product links**.

**Files:**
- Create: `scripts/refresh-navratri-2026.ts`
- Modify: `redirects.json` (301 `/blog/garba-navratri-costume-kids-guide` → `/blog/navratri-garba-dandiya-dress-guide`)
- Test: `tests/seo-copy-limits.test.ts`

**Interfaces:**
- Produces `lib/seo/copy-limits.ts`: `checkCopy({ seoTitle, metaDescription }): string[]` (a list of violations; empty means OK). Reused by every later copy script.

- [ ] **Step 1: Write the failing test `tests/seo-copy-limits.test.ts`**

```ts
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
```

- [ ] **Step 2: Run it and check it fails.** Run `npx tsx --test tests/seo-copy-limits.test.ts`. Expected: FAIL, "Cannot find module '../lib/seo/copy-limits'".

- [ ] **Step 3: Implement `lib/seo/copy-limits.ts`**

```ts
/** SERP-snippet limits enforced on every copy script before it writes. */
export const TITLE_MAX = 60
export const META_MIN = 70
export const META_MAX = 160
const DEVANAGARI = /[ऀ-ॿ]/

export function checkCopy({ seoTitle, metaDescription }: { seoTitle: string; metaDescription: string }): string[] {
  const v: string[] = []
  if (!seoTitle || seoTitle.length > TITLE_MAX) v.push(`seo_title length ${seoTitle?.length ?? 0} (max ${TITLE_MAX})`)
  if (!metaDescription || metaDescription.length < META_MIN || metaDescription.length > META_MAX)
    v.push(`meta_description length ${metaDescription?.length ?? 0} (${META_MIN}-${META_MAX})`)
  if (DEVANAGARI.test(seoTitle) || DEVANAGARI.test(metaDescription)) v.push('title/meta must be English (Roman script)')
  return v
}
```

- [ ] **Step 4: Run it and check it passes.** Run `npx tsx --test tests/seo-copy-limits.test.ts`. Expected: 4 pass.

- [ ] **Step 5: Write `scripts/refresh-navratri-2026.ts`** (dry run by default; `--apply` writes). It runs four phases.

**Phase 1: category copy, overwriting the existing copy.**
- Read each category's live product min price (`min(rent_price)`, `min(price)`) and fill it into `{MIN_RENT}` / `{MIN_BUY}`.
- Run `checkCopy` and abort the phase on any violation.

| slug | seo_title | meta_description | description additions (append a section; don't delete the existing FAQ content) |
|---|---|---|---|
| `dandiya-dress` | `Dandiya Dress for Women, Men & Kids – Rent in Delhi` | `Dandiya night dresses for women, men, couples and kids: mirror-work lehengas, chaniya choli and kediyu. Rent from ₹{MIN_RENT} in Delhi NCR for Navratri 2026.` | H2 "Dandiya dress for women", H2 "For men and boys (kediyu)", H2 "Couple dandiya outfits", H2 "Dandiya dress on rent in Delhi" (store address, WhatsApp, deposit rule from `/rent`), and "Navratri 2026: 11–19 October". End with the Hinglish line: `Dandiya ki dress rent pe chahiye? Krishna Nagar store aaiye ya WhatsApp karein.` |
| `garba-dress` | `Garba Dress & Chaniya Choli – Buy or Rent, Delhi` | `Garba dresses and chaniya choli for women, girls and boys for Navratri 2026 (11–19 Oct). Buy from ₹{MIN_BUY} or rent in Delhi NCR, pickup in Krishna Nagar.` | H2 "Garba dress for women", H2 "Garba costume for kids (school events)", H2 "Garba dress on rent in Delhi", plus a link to the guide |

**Phase 2: product alt text and copy for all garba/dandiya products.**
- Covers every live product in either category.
- Fill empty `product_images.alt_text` using `buildAltText()` from Task 6. If Task 6 isn't merged yet, inline the same formula: `"<name> – <audience> <category noun> for Navratri, Mod Fancy Dress Delhi"`, with `- view N` on non-primary images.
- Fill any empty description, meta or title using the Task 4 pattern.

**Phase 3: blog pillar refresh.**
- Overwrite the `navratri-garba-dandiya-dress-guide` body with an updated version:
  - 2026 dates: Ghatasthapana 11 Oct, Ashtami 19 Oct, Dussehra 20 Oct.
  - The nine-day Navratri colour list for 2026. Take the date→colour table from Drik Panchang, cite it, and don't guess.
  - Sections "for women", "for men (kediyu)", "for couples", "for kids at school", and "on rent in Delhi".
  - Merge the useful kids content from `garba-navratri-costume-kids-guide`.
  - At least 6 inline product links (`/products/<slug>`) and links to both categories.
  - A cover image: the best garba lehenga's primary image URL, stored in `blog_posts.cover_image_url`. That column comes from the Task 15 migration, so apply that migration's SQL now (it's additive and safe). Rendering the cover waits for Task 15.
- Set `updated_at = now()`.
- Keep the excerpt at 160 characters or fewer, since it's the meta: `Navratri 2026 (11–19 Oct) outfit guide: dandiya dress for women, men, couples and kids, the 9 Navratri colours, and where to buy or rent garba dresses in Delhi.`

**Phase 4: consolidate the posts.**
- Unpublish `garba-navratri-costume-kids-guide` (set `published_at = null`), and add a 301 for it to `redirects.json`.
- Keep the Hindi post, since it's a different language and different queries. Add a link from the Hindi post to the English guide and back.

- [ ] **Step 6: Dry run, review, apply.** Run `npx tsx scripts/refresh-navratri-2026.ts`, read the diff output, then `npx tsx scripts/refresh-navratri-2026.ts --apply`.
- [ ] **Step 7: Verify live after deploy.** Check that `curl -s https://www.modfancydress.com/category/dandiya-dress | grep -o '<title>[^<]*'` shows the new title, and that `/blog/garba-navratri-costume-kids-guide` returns 308 → the guide.
- [ ] **Step 8: Request indexing** in the Search Console UI, via Chrome, for `/category/dandiya-dress`, `/category/garba-dress` and `/blog/navratri-garba-dandiya-dress-guide`. The Indexing API doesn't cover product or blog pages.
- [ ] **Step 9: Commit.** `git add lib/seo/copy-limits.ts tests/seo-copy-limits.test.ts scripts/refresh-navratri-2026.ts redirects.json && git commit -m "feat(seo): retarget Navratri pages at women, men and couples, and merge the duplicate guide"`

---

### Task 2: Seasonal homepage with dated sections (live by 25 Sep)

**Why:**
- On 23 Sep the home hero is "Animal Fancy Dress" and the only featured section is Janmashtami, which ended in August.
- Navratri appears only in an alphabetical grid of 51 categories.
- The homepage is the strongest internal-link source on the site, and Google weights links from it. Putting the festival that's coming up there is the cheapest ranking signal we control.
- It also links to 2 empty categories (`festival-costumes`, `jewellery-accessories`) that render "No products found".
- This has gone stale before, so make it date-driven rather than a one-off edit.

**Files:**
- Create: `supabase/migrations/20260923_homepage_sections_dates.sql`
- Create: `lib/utils/seasonal.ts`
- Test: `tests/seasonal.test.ts`
- Modify: `app/(public)/page.tsx` (filter sections and banners with `isActiveOn`, and skip categories with 0 products in the category grid)

**Interfaces:**
- Produces `isActiveOn(row: { starts_on?: string | null; ends_on?: string | null }, today: string): boolean`. Dates are `YYYY-MM-DD` in IST.

- [ ] **Step 1: Write the failing test `tests/seasonal.test.ts`**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isActiveOn } from '../lib/utils/seasonal'

const navratri = { starts_on: '2026-09-23', ends_on: '2026-10-20' }
test('undated rows are always active', () => assert.equal(isActiveOn({}, '2026-01-01'), true))
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
```

- [ ] **Step 2: Run it and check it fails.** Run `npx tsx --test tests/seasonal.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/utils/seasonal.ts`**

```ts
/** Today's date in India as YYYY-MM-DD — the site's audience and festival calendar are IST. */
export function todayIST(now = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10)
}

/** Inclusive date window; a missing bound means open-ended. ISO dates compare lexically. */
export function isActiveOn(row: { starts_on?: string | null; ends_on?: string | null }, today: string): boolean {
  if (row.starts_on && today < row.starts_on) return false
  if (row.ends_on && today > row.ends_on) return false
  return true
}
```

- [ ] **Step 4: Run it and check it passes.** Run `npx tsx --test tests/seasonal.test.ts`. Expected: 4 pass.

- [ ] **Step 5: Write the migration and apply it** (Supabase MCP `apply_migration`, or SQL editor)

```sql
alter table homepage_sections add column if not exists starts_on date, add column if not exists ends_on date;
alter table banners           add column if not exists starts_on date, add column if not exists ends_on date;
```

- [ ] **Step 6: Wire into `app/(public)/page.tsx`.** Filter `sections.filter(s => isActiveOn(s, todayIST()))` and the same for banners.

Leave the page's current `revalidate` as it is. If it's more than 1 day (86400), lower it to 86400 so a window closes within a day.

In the category grid, drop categories with 0 live products. Reuse the non-empty-category logic from `app/sitemap.ts`: the junction rows plus the primary `category_id`. Move it into `lib/supabase/cached-queries.ts` as `getNonEmptyCategoryIdsCached()` and call it from both the sitemap and the homepage.

- [ ] **Step 7: Seed the seasonal rows** (a script in `scripts/seed-seasonal-homepage.ts`, dry run by default):

| Section | starts_on | ends_on | Content |
|---|---|---|---|
| Navratri: Dandiya & Garba | 2026-09-23 | 2026-10-19 | top 8 dandiya-dress products + link to the guide |
| Ramleela & Dussehra | 2026-09-23 | 2026-10-20 | ramleela-costumes top 8 |
| Halloween | 2026-10-05 | 2026-10-31 | halloween category (only if Task 10 has at least 6 products) |
| Diwali & Children's Day | 2026-10-21 | 2026-11-14 | helper-costumes + cartoon + Nehru |
| Annual function / dance | 2026-11-01 | 2027-02-28 | dance-dress, classical-dance-dress |

- Set `ends_on = '2026-08-31'` on the Janmashtami section.
- Point the hero banner at `/category/dandiya-dress`, dated to 19 Oct. It needs a creative: use the best garba lehenga photo, watermarked via `scripts/watermark-image.ts`.

- [ ] **Step 8: Build and verify.** Run `npm test && npm run lint && npm run build`. Check that `/` is still `○` or ISR in the route table. Run `npm start`, then check that `curl -s localhost:3000 | grep -c 'Janmashtami'` returns 0 and that the Dandiya section is present.
- [ ] **Step 9: Fix hydration error #418 on the homepage** while in this file. Run the production build in Chrome, read the console, find the server/client mismatch (usually `Date`, `Math.random` or locale formatting during render) and render it deterministically.
- [ ] **Step 10: Commit.** `git commit -m "feat(home): date-window homepage sections so the coming festival leads, and drop empty categories"`

---

### Task 3: Fix soft 404s on category routes (live by 25 Sep)

**Why:**
- `/category/does-not-exist-xyz` and `/wholesale/category/does-not-exist-xyz` return **HTTP 200** with "not found" content and three conflicting robots meta tags.
- Google classes these as soft 404s. That wastes crawl budget, which matters in the weeks we need festival pages recrawled, and it keeps deactivated categories in the index.
- Cause: `loading.tsx` sits on both dynamic routes ([[loading-tsx-breaks-404-status]]). The same fix already worked for products (`844f11d`).

**Files:**
- Delete: `app/(public)/category/[slug]/loading.tsx`, `app/(public)/wholesale/category/[slug]/loading.tsx`
- Modify: `app/(public)/category/[slug]/page.tsx`, `app/(public)/wholesale/category/[slug]/page.tsx` (call `notFound()` in `generateMetadata` when the category is missing, and wrap the product grid in `<Suspense fallback={<ProductsListSkeleton />}>`)
- Create: `scripts/check-status-codes.sh`

- [ ] **Step 1: Write the check script `scripts/check-status-codes.sh`**

```bash
#!/usr/bin/env bash
# Usage: scripts/check-status-codes.sh [base]  — asserts status codes for known cases.
B=${1:-http://localhost:3000}; fail=0
expect() { got=$(curl -s -o /dev/null -w '%{http_code}' "$B$2"); [ "$got" = "$1" ] && echo "ok   $1 $2" || { echo "FAIL $2 expected $1 got $got"; fail=1; }; }
expect 404 /category/does-not-exist-xyz
expect 404 /wholesale/category/does-not-exist-xyz
expect 404 /products/does-not-exist-xyz
expect 404 /blog/does-not-exist-xyz
expect 200 /category/dandiya-dress
expect 200 /wholesale/category/dandiya-dress
exit $fail
```

- [ ] **Step 2: Run it against production and check it fails.** Run `bash scripts/check-status-codes.sh https://www.modfancydress.com`. Expected: 2 FAIL (the category routes return 200).
- [ ] **Step 3: Make the change.** Delete the two `loading.tsx` files. In both `generateMetadata` functions, change `if (!category) return {...}` to `if (!category) notFound()`. In the page body, keep `notFound()` and move the skeleton into an in-page `<Suspense>` around the grid component.

A category that is inactive, or active with zero live products, must also `notFound()`. The sitemap already treats these as empty, so the two stay consistent.

- [ ] **Step 4: Verify with a production build** (`next dev` hides this bug). Run `npm run build && (npm start &) && sleep 5 && bash scripts/check-status-codes.sh`. Expected: all ok.
- [ ] **Step 5: Commit.** `git commit -m "fix(category): return a real 404 for missing, inactive and empty categories"`

---

### Task 4: Ramleela/Dussehra push, SEO gaps in the September batch, broken images (live by 25 Sep)

**Why:**
- Ramleela runs 11–20 Oct.
- Keywords: "ram leela costume" 880/mo at KD 16 (the best difficulty-to-volume ratio in the set), "ramleela dress" 880, "hanuman costume" 1,300, and "ravan dress" 590, where we already rank #18.
- The 19 Sep batch has meta but **empty alt text on all 14 products**.
- `krishna-fancy-dress` and `radha-rani-fancy-dress` have no description, meta or title at all.
- `radha-rani-fancy-dress` and 3 other products are orphans. They're in the sitemap but have zero internal links.
- Two live products serve an HTML "Page Not Found – Sanskriti Fancy Dresses" file as their image. That's a broken product image and shows another shop's name.

**Files:**
- Create: `scripts/fix-sep-batch-and-orphans.ts`

- [ ] **Step 1: Write the script.** It runs four phases, all dry-run by default.

**Phase 1: copy gaps.**
- Fill description, meta and title for `krishna-fancy-dress` and `radha-rani-fancy-dress`. Look at the product photos first (read `image_url` and view them) so the copy describes what's actually shown.
- Differentiate them from the other 8 Krishna variants by what's distinctive (price ₹3500 suggests premium or adult), and target "krishna costume for adults" (1,434 image impressions, position 11).
- Pass `checkCopy`.

**Phase 2: orphans.**
Attach a primary category and `product_categories` rows:

| Product | Category |
|---|---|
| `school-fancy-dress-red-color` | `kids` |
| `odisi-fancy-dress` | skip: it's merged in Task 5 |
| `radha-rani-fancy-dress` | `indian-mythology-costumes` |
| `astronaut-fancy-dress` | `space-costumes` + `helper-costumes` |

Also point `krishna-fancy-dress-costume`'s primary `category_id` at `indian-mythology-costumes` (its current primary is inactive).

**Phase 3: Ramleela.**
- Fill alt text on all images of the 14 products from 19 Sep.
- Refresh the `ramleela-costumes` category:
  - title: `Ramleela Costumes on Rent – Ram, Sita, Ravan, Hanuman` (53 chars)
  - meta: `Ramleela and Dussehra costumes for Ram, Sita, Ravan, Hanuman, Kumbhkaran and Meghnath. Rent or buy in Delhi NCR for Ramleela 11–20 Oct 2026. Bulk for committees.`
  - Check it against `checkCopy` and trim if needed.
  - The description gets an H2 "Ramleela costume on rent in Delhi" and an H2 "Bulk orders for Ramleela committees", linking to `/wholesale/schools`.
  - Hinglish line: `Ravan ka costume ya Hanuman ji ki dress chahiye? Rent pe milegi.`

**Phase 4: broken images.**
Soft-delete the 4 `product_images` rows whose stored file isn't an image: `mother-teresa-fancy-dress-costume` -1/-2 and `traffic-police-fancy-dress-costume` -1/-2. Detect them by magic bytes (`<!DOC` / `<html`), not by name.
- If a product is left with 0 images, set `is_active = false` and add it to the owner's photo list in Task 19. Don't leave a live product with no image.

- [ ] **Step 2: Publish a Dussehra blog post** (new): `/blog/dussehra-ramleela-costume-ideas`.
  - Title: "Dussehra & Ramleela Costume Ideas 2026: Ram, Sita, Ravan, Hanuman".
  - Sections: one per character with the product link and "for kids / for adults"; Ravan mukut and mask; "costume on rent for Ramleela committees"; dates.
  - About 900 words, cover image, at least 8 product links.
  - Why a new post when Navratri got a refresh instead: Ramleela is 27 days out rather than 18, there's no Dussehra post to refresh, and our blog posts have indexed and ranked within about 2 weeks before (`independence-day-fancy-dress-ideas`, published 11 Jul, reached 13k impressions by August).
- [ ] **Step 3: Dry run, review, apply, deploy.** Request indexing for `/category/ramleela-costumes` and the new post.
- [ ] **Step 4: Commit.** `git commit -m "feat(seo): Ramleela copy and alt text, attach four orphans, drop scraped non-image files"`

---

### Task 5: Redirect hygiene and duplicate consolidation (by 2 Oct)

**Why:**
- **227 of 231 deleted product URLs have no redirect.** Google still requests them and gets 404, and any links or ranking they earned are lost. Some are exactly the terms we need now: 7 garba boys'/girls' products, `bhagat-singh-fancy-dress-costume`, `indian-pilot-fancy-dress-costume`.
- **48 existing redirects point at dead products**, so they chain into a 404.
- **`/products/vanvasi-ram` is live but unreachable**, because a redirect with the same source wins.
- **11 live slugs have typos** (`kerala-fancy-dres` has 2,805 web impressions and 8,112 image impressions, `pahdi-boy-`, `gujrati-boy-`, and others). Typo slugs are a weaker URL signal. Keep a slug only when the spelling has real search volume (`gujrati` does, `dres` doesn't).
- **8 pairs of near-duplicates split rankings.** Two examples:
  - `odissi-` and `odisi-fancy-dress` share the same 2 images.
  - `doraemon-cartoon` (position 2.2) and `doraemon-fancy-dress` (position 11.8) together got 1 click from 1,000 impressions.

**Files:**
- Create: `lib/seo/redirect-graph.ts`, `tests/redirects.test.ts`
- Create: `scripts/build-product-redirects.ts` (generates entries and merges duplicates)
- Modify: `redirects.json`

**Interfaces:**
- Produces `validateRedirects(redirects: {source: string; destination: string}[], liveUrls: Set<string>): string[]` (a list of problems).

- [ ] **Step 1: Check how `redirects.json` is shaped and loaded.** Read `next.config.ts` and one entry. The test and generator must keep the same shape (`source`, `destination`, `permanent`).

- [ ] **Step 2: Write the failing test `tests/redirects.test.ts`**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateRedirects } from '../lib/seo/redirect-graph'

const live = new Set(['/products/a', '/products/b', '/category/c'])
test('clean graph has no problems', () =>
  assert.deepEqual(validateRedirects([{ source: '/products/old', destination: '/products/a' }], live), []))
test('source that is a live URL is flagged (page unreachable)', () =>
  assert.equal(validateRedirects([{ source: '/products/a', destination: '/products/b' }], live).length, 1))
test('destination that is not live is flagged', () =>
  assert.equal(validateRedirects([{ source: '/products/old', destination: '/products/gone' }], live).length, 1))
test('chains are flagged', () =>
  assert.ok(validateRedirects([
    { source: '/products/x', destination: '/products/y' },
    { source: '/products/y', destination: '/products/a' },
  ], live).some((p) => p.includes('chain'))))
test('loops are flagged', () =>
  assert.ok(validateRedirects([
    { source: '/products/x', destination: '/products/y' },
    { source: '/products/y', destination: '/products/x' },
  ], live).length >= 1))
test('external and non-product destinations outside the live set are allowed only if static', () =>
  assert.deepEqual(validateRedirects([{ source: '/old-page', destination: '/fancy-dress-delhi' }], new Set(['/fancy-dress-delhi'])), []))
```

- [ ] **Step 3: Run it and check it fails.** Run `npx tsx --test tests/redirects.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 4: Implement `lib/seo/redirect-graph.ts`**

```ts
type Redirect = { source: string; destination: string }

/** Problems that waste crawl budget or make a live page unreachable. */
export function validateRedirects(redirects: Redirect[], liveUrls: Set<string>): string[] {
  const problems: string[] = []
  const bySource = new Map(redirects.map((r) => [r.source, r.destination]))
  for (const { source, destination } of redirects) {
    if (liveUrls.has(source)) problems.push(`source is a live page (unreachable): ${source}`)
    if (bySource.has(destination)) {
      // follow to detect loop vs chain
      const seen = new Set([source]); let cur = destination
      while (bySource.has(cur) && !seen.has(cur)) { seen.add(cur); cur = bySource.get(cur)! }
      problems.push(seen.has(cur) ? `loop: ${source}` : `chain: ${source} -> ${destination} -> ...`)
    } else if (!destination.startsWith('http') && !liveUrls.has(destination)) {
      problems.push(`destination not live: ${source} -> ${destination}`)
    }
  }
  return problems
}
```

- [ ] **Step 5: Run it and check it passes.** Run `npx tsx --test tests/redirects.test.ts`. Expected: 6 pass.

- [ ] **Step 6: Write `scripts/build-product-redirects.ts`** (dry run by default).

1. **Build the live-URL set.** Include live product slugs, active non-empty category slugs, published blog slugs, and the static pages listed in `app/sitemap.ts` `staticPages`.
2. **Duplicate merges.** For each pair, compare image SHA-256 hashes (download the images).
   - **Same images: merge.** Keep the slug with more Search Console impressions (see the numbers in the table below) and soft-delete the other (`deleted_at = now()`). Move its `product_categories` onto the keeper, and add a redirect from the loser to the keeper.
   - **Different images: differentiate instead of merging.** Rename `name` and `seo_title` so each targets its own query. For example, `doraemon-cartoon` becomes "Doraemon Mascot Costume (Full Body)", aimed at mascot/adult queries, and `doraemon-fancy-dress` becomes "Doraemon Fancy Dress for Kids".

   | Pair (keeper first) | Search Console evidence |
   |---|---|
   | `odissi-fancy-dress` ← `odisi-fancy-dress` | same price, same 2 images |
   | `bharatnatyam-fancy-dress` ← `bharatnatyam-fancy-dress-1` | name clash |
   | `pooh-fancy-dress` ↔ `pooh-fancy-dress-costumes` | compare images |
   | `cow-fancy-dress` ↔ `cow-animal-fancy-dress-costume` | compare images |
   | `hanuman-ji-fancy-dress` ↔ `hanuman-ji-fancy-dress-for-ramleela` | compare images (Ramleela-critical, so do this before 1 Oct) |
   | `vanvasi-ram-fancy-dress` ↔ `vanvasi-ram` | resolve so exactly one is live and nothing redirects away from it |
   | `rajasthani-lehenga-fancy-dress` (₹850) vs `rajasthani-lehnga-fancy-dress` (₹750) | different products: differentiate names; rename the typo slug (step 4) |
   | `doraemon-cartoon` vs `doraemon-fancy-dress` | different price and product: differentiate |

3. **Dead slugs.** For each of the 227 dead product slugs with no redirect, choose a destination:
   - **(a)** a live product with the same normalised name (strip colour and "fancy dress costume");
   - **(b)** otherwise, the dead product's last primary category, if that category is live and non-empty;
   - **(c)** otherwise, `/products`.

   **Never redirect to the homepage**: Google treats that as a soft 404. Skip test slugs (`test2`, `test3`, `sample-2`, `nmnm`) and let them 404.
4. **Typo slugs.** Rename these live slugs and add a redirect from the old one:
   - `kerala-fancy-dres` → `kerala-fancy-dress`
   - `pahdi-boy-fancy-dress` → `pahadi-boy-fancy-dress`
   - `purple-frock-fancys-dress` → `purple-frock-fancy-dress`
   - `water-melon-…` → `watermelon-…`
   - `subhash-chander-bose-…` → `subhash-chandra-bose-…`
   - `bharatnatyam-fancy-dress-1`: folded in by the merge above
   - `ballroom-dance-fancy-dress-costume-2` → drop `-2` if the base slug is free

   Keep `gujrati-boy-fancy-dress`: "gujrati" has real volume ([[seo-copy-latitude-and-hinglish]]).

   Before renaming `kerala-fancy-dres`, weigh it. It's already indexed at position 8.8 with 8k image impressions. A 308 passes the ranking signal and the recrawl takes days, so it's worth doing, but do it this week, not during the Kerala-relevant annual-function season in Dec–Feb.
5. **Repair the existing 48 redirects** that point at dead products, using the same destination logic as step 3.
6. **Flatten chains**, write `redirects.json`, then run `validateRedirects` on the result and abort if there are any problems.

- [ ] **Step 7: Add a test that runs against the real `redirects.json` and a live-slug snapshot.** In `scripts/build-product-redirects.ts`, write `seodata/live-urls.json` on `--apply`. Then extend `tests/redirects.test.ts`:

```ts
import redirects from '../redirects.json'
import liveUrls from '../seodata/live-urls.json'
test('redirects.json is clean against the live URL snapshot', () =>
  assert.deepEqual(validateRedirects(redirects as any, new Set(liveUrls as string[])), []))
```

- [ ] **Step 8: Dry run, review the mapping (spot-check 20), apply, build, and verify a sample with curl.** Check `/products/vanvasi-ram`, `/products/kerala-fancy-dres` and 5 dead slugs. None should end in 404 or chain.
- [ ] **Step 9: Commit.** `git commit -m "fix(seo): redirect 227 dead product URLs, repair 48 dead-end redirects, merge duplicate products"`

---

### Task 6: Image SEO: alt text, descriptive filenames, image sitemap (by 2 Oct)

**Why:**
- Image search is the site's **largest surface**: 723k impressions in 90 days, twice web. But it sits at **position 30** with 0.1% CTR.
- Examples: "child krishna fancy dress" got 6,431 image impressions at position 34, "krishna dress" 5,676 at 29.7, "fancy dress for kids" 5,154 at 35.
- Google Images ranks mainly on the surrounding page, **alt text**, the **filename**, and image discoverability (the image sitemap). All three are weak here:
  - 152 products have empty alt text (the fallback is "`<name>` Main Image").
  - 183 of 323 card filenames are `timestamp-random` or `Math.random()` floats.
  - The sitemap has **zero `<image:image>` entries**.

**Files:**
- Create: `lib/seo/alt-text.ts`, `tests/alt-text.test.ts`
- Create: `lib/utils/image-filename.ts`, `tests/image-filename.test.ts`
- Modify: `app/sitemap.ts` (add `images`)
- Modify: `lib/utils/upload.ts` and its admin callers (pass `filename` from the product slug)
- Modify: `components/public/ProductGallery.tsx:111,192` (better fallback alt)
- Create: `scripts/backfill-alt-text.ts`

**Interfaces:**
- `buildAltText(p: { name: string; categoryName?: string | null; audience?: 'kids' | 'women' | 'men' | 'adults' | null }, index: number): string`. Index 0 is primary.
- `imageFilename(slug: string, index: number, ext: string): string`, e.g. `"dandiya-dress-for-women-red-2.webp"`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/alt-text.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildAltText } from '../lib/seo/alt-text'

test('primary image: name + category + shop', () =>
  assert.equal(buildAltText({ name: 'Ravan Costume', categoryName: 'Ramleela Costumes' }, 0),
    'Ravan Costume – Ramleela Costumes, Mod Fancy Dress Delhi'))
test('secondary images are distinguished by view number', () =>
  assert.equal(buildAltText({ name: 'Ravan Costume', categoryName: 'Ramleela Costumes' }, 2),
    'Ravan Costume – view 3, Ramleela Costumes, Mod Fancy Dress Delhi'))
test('audience is added when known and not already in the name', () => {
  assert.equal(buildAltText({ name: 'Mirror Work Lehenga', categoryName: 'Dandiya Dress', audience: 'women' }, 0),
    'Mirror Work Lehenga for women – Dandiya Dress, Mod Fancy Dress Delhi')
  assert.equal(buildAltText({ name: 'Garba Dress for Women', categoryName: 'Garba Dress', audience: 'women' }, 0),
    'Garba Dress for Women – Garba Dress, Mod Fancy Dress Delhi')
})
test('never exceeds 125 chars (screen-reader guidance)', () =>
  assert.ok(buildAltText({ name: 'x'.repeat(200), categoryName: 'y' }, 0).length <= 125))
```

```ts
// tests/image-filename.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { imageFilename } from '../lib/utils/image-filename'

test('primary image uses the bare slug', () => assert.equal(imageFilename('ravan-costume', 0, 'webp'), 'ravan-costume.webp'))
test('later images get -2, -3…', () => assert.equal(imageFilename('ravan-costume', 1, 'jpg'), 'ravan-costume-2.jpg'))
test('slug is sanitised', () => assert.equal(imageFilename('Ravan Costume!!', 0, 'webp'), 'ravan-costume.webp'))
```

- [ ] **Step 2: Run them and check they fail.** Run `npx tsx --test tests/alt-text.test.ts tests/image-filename.test.ts`. Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

```ts
// lib/seo/alt-text.ts
const MAX = 125
export function buildAltText(
  p: { name: string; categoryName?: string | null; audience?: 'kids' | 'women' | 'men' | 'adults' | null },
  index: number
): string {
  const aud = p.audience && !new RegExp(`\\b${p.audience}\\b`, 'i').test(p.name) ? ` for ${p.audience}` : ''
  const view = index > 0 ? ` – view ${index + 1},` : ' –'
  const cat = p.categoryName ? ` ${p.categoryName},` : ''
  const tail = ' Mod Fancy Dress Delhi'
  const head = `${p.name}${aud}`
  const budget = MAX - (view.length + cat.length + tail.length)
  return `${head.slice(0, Math.max(10, budget)).trim()}${view}${cat}${tail}`.slice(0, MAX)
}
```

```ts
// lib/utils/image-filename.ts
export function imageFilename(slug: string, index: number, ext: string): string {
  const base = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `${base}${index > 0 ? `-${index + 1}` : ''}.${ext}`
}
```

- [ ] **Step 4: Run them and check they pass.** Run `npx tsx --test tests/alt-text.test.ts tests/image-filename.test.ts`. Expected: 7 pass.

- [ ] **Step 5: Add the image sitemap.** In `app/sitemap.ts`, change the product query to `.select('slug, updated_at, product_images(image_url, is_primary, display_order)')`. Then map each product to `images: sortedImages.slice(0, 5).map(i => getImageUrl(i.image_url))`, with the primary image first. Next.js `MetadataRoute.Sitemap` supports `images: string[]`.
  - Categories: add their `image_url` if they have one.
  - Blog posts: add the cover image once Task 15 adds it.
  - While here, replace the hard-coded `2026-03-01` lastmods on `/` and `/products` with the newest product `updated_at`. A stale lastmod teaches Google to ignore lastmod.
- [ ] **Step 6: Build and verify.** Run `npm run build && npm start`. `curl -s localhost:3000/sitemap.xml | grep -c '<image:loc>'` should be at least 600.
- [ ] **Step 7: Uploader filenames.** In the admin product form callers of `uploadCompressedImage`, pass `imageFilename(product.slug, index, …)` without the extension (the uploader appends the real extension). Keep the timestamp suffix only to break collisions: use `upsert:false` and retry with `-<ts>` on a 409.
- [ ] **Step 8: Better fallback alt text.** In `ProductGallery.tsx:111`, change the fallback to `alt={selectedImage.alt_text || buildAltText({ name: productName, categoryName }, selectedIndex)}`. Pass `categoryName` from the product page. Apply the same to line 192 and `ProductCard.tsx:65`.
- [ ] **Step 9: `scripts/backfill-alt-text.ts`** (dry run by default): fill `alt_text` wherever it's empty for all live products (about 152), using `buildAltText`.
  - Primary category name: the product's `category_id` category.
  - Audience: infer from the name and categories (women's lehengas → `women`; `kids` category → `kids`), else null.
  - Never overwrite existing alt text.
- [ ] **Step 10: Apply, deploy, resubmit the sitemap** (`composio execute GOOGLE_SEARCH_CONSOLE_SUBMIT_SITEMAP` with `feedpath` `https://www.modfancydress.com/sitemap.xml`).
- [ ] **Step 11: Commit.** `git commit -m "feat(seo): image sitemap, generated alt text for 152 products, slug-based image filenames"`

(Renaming the existing random-named files is deliberately **not** done. It would change every image URL, and Google Images would lose the history it has built up. New uploads get good names; old ones keep their URLs.)

---

### Task 7: Image weight: resized real-WebP variants plus cache headers (by 2 Oct), the main CWV fix

**Why:**
- Lab mobile LCP is **9.6–22.3s** on every commercial page. Lighthouse attributes almost all of it to image bytes: grid cards show about 180px wide but load 1400px files of 420–510KB.
- garba-dress weighs 7.9MB and dandiya-dress 9.4MB, which are exactly the pages that must convert in October.
- **84 live images are PNG bytes named `.webp`.** Gabbar's main image is 569KB, with an estimated 1.9MB / 2.6s saving on that page. 49 images are over 1MB.
- On top of that, **every image is served with `cache-control: no-cache`**, so repeat visits download everything again (Lighthouse estimates about 5.6MB per category visit).
- CWV is a ranking signal, and 90% of the traffic is mobile.
- Next image optimisation stays off ([[no-vercel-image-optimization]]), so the fix is to store the right-sized files.

**Files:**
- Create: `lib/utils/image-variants.ts`, `tests/image-variants.test.ts`
- Create: `scripts/generate-image-variants.ts` (sharp)
- Modify: `components/public/ProductCard.tsx:64` (use the 400w variant), `components/public/ProductGallery.tsx` (800w for the main image, 1600w for zoom), `lib/utils/upload.ts` (write variants on upload)
- Modify: `scripts/import-supplier-catalog.ts:175` (add `cacheControl`)

**Interfaces:**
- `variantUrl(url: string, width: 400 | 800 | 1600): string` maps `…/product-images/products-webp/<name>.<ext>` → `…/product-images/products-w<width>/<name>.webp`. Anything else is returned unchanged.
- `cardImageUrl(url: string): string` = `variantUrl(getImageUrl(url), 400)`

- [ ] **Step 1: Find the cache-header cause first** (this decides step 6). Upload a 1KB test object through supabase-js with `cacheControl: '31536000'`, curl it, and compare with an object uploaded without it.
  - supabase-js sends `cache-control: max-age=<value>`. If the header still comes back `no-cache`, the project's storage/CDN setting overrides it. Check the Supabase dashboard (Storage → settings) via Chrome.
  - Record the finding in the commit message.
  - Existing objects need their metadata rewritten: re-upload with `upsert: true` and the cacheControl set. The variants script below does that for every file it writes.
- [ ] **Step 2: Write the failing test `tests/image-variants.test.ts`**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { variantUrl } from '../lib/utils/image-variants'

const base = 'https://x.supabase.co/storage/v1/object/public/product-images'
test('maps products-webp to a width folder and forces .webp', () => {
  assert.equal(variantUrl(`${base}/products-webp/ravan.png`, 400), `${base}/products-w400/ravan.webp`)
  assert.equal(variantUrl(`${base}/products-webp/ravan.webp`, 800), `${base}/products-w800/ravan.webp`)
})
test('leaves non-product and external URLs untouched', () => {
  assert.equal(variantUrl(`${base}/banners-webp/hero.webp`, 400), `${base}/banners-webp/hero.webp`)
  assert.equal(variantUrl('https://example.com/a.jpg', 400), 'https://example.com/a.jpg')
})
test('handles query strings', () =>
  assert.equal(variantUrl(`${base}/products-webp/a.jpg?v=2`, 400), `${base}/products-w400/a.webp?v=2`))
```

- [ ] **Step 3: Run it and check it fails.** Run `npx tsx --test tests/image-variants.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 4: Implement `lib/utils/image-variants.ts`**

```ts
import { getImageUrl } from '@/lib/imageUrl'

export type VariantWidth = 400 | 800 | 1600
const RE = /\/product-images\/products-webp\/([^/?#]+)\.(webp|png|jpe?g)(\?[^#]*)?$/i

/** Pre-generated resized WebP for a product image; untouched for anything else. */
export function variantUrl(url: string, width: VariantWidth): string {
  const m = url.match(RE)
  if (!m) return url
  return url.replace(RE, `/product-images/products-w${width}/${m[1]}.webp${m[3] ?? ''}`)
}

export const cardImageUrl = (url: string) => variantUrl(getImageUrl(url), 400)
```

- [ ] **Step 5: Run it and check it passes.** Run `npx tsx --test tests/image-variants.test.ts`. Expected: 3 pass. (If the `@/` import breaks under `tsx --test`, use a relative import. Check how `tests/related-products.test.ts` imports.)

- [ ] **Step 6: Write `scripts/generate-image-variants.ts`** (dry run by default).
  - For every `product_images.image_url` of a live product, resolved via `getImageUrl`, download the original and run sharp: `.rotate().resize({ width: W, withoutEnlargement: true }).webp({ quality: 78 })` for W in 400, 800 and 1600.
  - Upload to `products-w<W>/<name>.webp` with `contentType: 'image/webp'`, `cacheControl: '31536000'`, `upsert: true`.
  - Skip any file that already exists with the same source ETag.
  - Log bytes before and after. Expect the 400w cards at about 25–45KB each.
  - Don't touch the originals, so rollback is just reverting the component change.
- [ ] **Step 7: Run it** (`--apply`) and check that every `variantUrl` for a live image returns 200: add a `--verify` flag that HEADs them all.
- [ ] **Step 8: Switch the components.**
  - `ProductCard.tsx`: `src={cardImageUrl(primaryImage.image_url)}`.
  - `ProductGallery.tsx`: the main image uses `variantUrl(getImageUrl(url), 800)` with `fetchPriority="high"` (keep `priority`); zoom/lightbox uses 1600; thumbnails use 400.
  - Listing pages (`ProductsBrowser`, category grid): pass `priority` to the first 4 cards so the LCP card isn't `loading="lazy"`.
- [ ] **Step 9: Uploader writes variants too.** In `lib/utils/upload.ts`, after the main upload, also encode and upload the 400w and 800w variants in the browser. Reuse `imageCompression` with `maxWidthOrHeight: 400/800`, `fileType: outputType`, and the same folder and name pattern. That way new products never miss a variant (Review Focus #3).
  - Write the file with the actual extension. `variantUrl` forces `.webp`, so when Safari produces JPEG, name it `.webp` only if it really is WebP; otherwise add a runtime fallback.
  - **Simpler and safer:** in the card, `onError`, swap `src` to the original URL. Implement that fallback, since it covers every missing-variant case.
- [ ] **Step 10: Add `cacheControl: '31536000'` to `scripts/import-supplier-catalog.ts:175`** and every other upload call in `scripts/`.
- [ ] **Step 11: Measure.** Run `npm run build && npm start`, then Lighthouse mobile on `/category/garba-dress`, `/category/dandiya-dress`, `/products`, `/`, and Gabbar (`npx lighthouse <url> --form-factor=mobile --output=json`).
  - Target: page weight under 1.5MB and lab LCP under 4s on slow 4G.
  - Record the before and after numbers in `seodata/CWV-2026.md`.
- [ ] **Step 12: Commit.** `git commit -m "perf(images): serve 400/800/1600w real-WebP variants with a one-year cache"`

---

### Task 8: Page-level CWV: /products payload, Delhi map iframe (by 2 Oct)

**Why:**
- `/products` ships **1MB of HTML, 582KB of it RSC payload**, and 3,426 DOM nodes (TBT 600ms).
- `/fancy-dress-delhi` is the **#1 click page** (110 clicks in 28 days), and it loads a Google Maps iframe of about 475KB that drives its 4.3s FCP.
- These are the two slowest pages that aren't slow because of images.

**Files:**
- Modify: `app/(public)/products/page.tsx` + `components/public/ProductsBrowser.tsx` (select only the fields a card renders: id, slug, name, price, rent_price, wholesale_price, primary image url/alt, first category name. Drop descriptions and all images.)
- Create: `components/public/MapFacade.tsx` (a static image or styled block with the address and a "View on Google Maps" link; load the iframe only on click)
- Modify: `app/(public)/fancy-dress-delhi/page.tsx` (and the Noida and Gurgaon pages if they embed maps)

- [ ] **Step 1: Measure the baseline.** `curl -s https://www.modfancydress.com/products | wc -c` (expect about 1MB). Also record Lighthouse for `/fancy-dress-delhi`.
- [ ] **Step 2: Trim the payload.** Define a `ProductCardData` type holding exactly the fields `ProductCard` reads, and select only those in the cached query that `/products` uses.
  - Keep the full grid in the Suspense fallback: crawlers must still get every product ([[modfancydress-static-rendering]]).
  - Target: HTML under 450KB.
- [ ] **Step 3: Map facade.**

```tsx
'use client'
import { useState } from 'react'
export function MapFacade({ embedSrc, mapsUrl, label }: { embedSrc: string; mapsUrl: string; label: string }) {
  const [on, setOn] = useState(false)
  if (on) return <iframe src={embedSrc} title={label} className="w-full h-72 rounded-xl border-0" loading="lazy" allowFullScreen />
  return (
    <div className="w-full h-72 rounded-xl bg-[#F5F3F0] flex flex-col items-center justify-center gap-3 text-center p-4">
      <p className="text-sm text-[#1B2A4A]">{label}</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => setOn(true)} className="px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm">Show map</button>
        <a href={mapsUrl} target="_blank" rel="noopener" className="px-4 py-2 rounded-lg border text-sm">Open in Google Maps</a>
      </div>
    </div>
  )
}
```

Use the canonical Maps URL already in the schema `sameAs`.

- [ ] **Step 4: Build, then Lighthouse both pages.** Targets: `/products` TBT under 300ms; `/fancy-dress-delhi` FCP under 2s. Record the results in `seodata/CWV-2026.md`.
- [ ] **Step 5: Commit.** `git commit -m "perf: trim /products payload to card fields, load the store map on demand"`

---

### Task 9: Field Core Web Vitals and redirect hops (by 2 Oct)

**Why:**
- Lab numbers aren't what Google ranks on. It uses **field data** (CrUX, 28-day p75), and we have none yet. The PSI keyless quota was exhausted.
- `http://modfancydress.com` takes 2 hops (http→https apex→www). You've fixed the Business Profile link, but old links and citations still hit this chain.

- [ ] **Step 1: Read the Search Console Core Web Vitals report.** In Chrome, open `search.google.com/search-console/core-web-vitals?resource_id=sc-domain:modfancydress.com`. Record mobile Poor / Needs-improvement / Good URL counts and the failing metric (LCP, INP or CLS) in `seodata/CWV-2026.md`. Re-check 28 days after Task 7 ships (field data lags that long).
- [ ] **Step 2 (optional): Get a free PSI API key** (Google Cloud console, via Chrome, with your approval) and save it as `PSI_API_KEY` in `.env.local`, so CrUX URL-level data can be pulled every week in Task 18.
- [ ] **Step 3: Collapse the redirect chain.** In Vercel → Domains, via Chrome, set `modfancydress.com` to redirect straight to `https://www.modfancydress.com` (308). Verify with `curl -sIL http://modfancydress.com/ | grep -iE '^(HTTP|location)'`: expect one 308, then 200.
- [ ] **Step 4: No commit** (config only). Record it in `seodata/PROGRESS.md`.

---

### Task 10: Halloween (live by 3 Oct; needs stock)

**Why:**
- "halloween costume shop in delhi", "halloween costume on rent near me" and "halloween party delhi" all autocomplete. Semrush: halloween dress india 720, vampire halloween dress 880, witch nose 720.
- The `/category/halloween` page already gets **222 impressions at position 17.5** with a single product.
- A category with one product can't rank. Google needs a real product list to treat it as a category.
- It's worth doing only if the shop can stock at least 6 costumes by about 5 Oct: witch, vampire, pumpkin, devil, Wednesday Addams, skeleton (have), joker (have wig).

- [ ] **Step 1: Owner confirmed stock (23 Sep).** The owner uploads at least 6 Halloween costumes (witch, vampire, pumpkin, devil, Wednesday Addams, plus the existing skeleton and joker wig) through the admin panel by **1 Oct**.
- [ ] **Step 2: Run the new-upload follow-up (Task 19a) on the batch.** Each product gets description, meta and title checked by `checkCopy`, alt text from `buildAltText`, the `halloween` category, and the Task 7 variants. Seed the Task 2 Halloween homepage row once there are at least 6 live products.
- [ ] **Step 3: Category copy.**
  - Title: `Halloween Costumes on Rent in Delhi – Kids & Adults`
  - Meta: `Halloween costumes for kids and adults: witch, vampire, skeleton, pumpkin and more. Rent or buy in Delhi NCR for Halloween parties on 31 October 2026.`
  - Hinglish line: `Chudail ya bhoot ka costume? Rent pe lijiye.`
- [ ] **Step 4: Blog post** `/blog/halloween-costume-ideas-india`, targeting "halloween costume ideas for kids India", with product links.
- [ ] **Step 5: Deploy, request indexing, commit.** `git commit -m "feat(halloween): stock the Halloween category and publish the costume guide"`

---

### Task 11: Diwali (live by 4 Oct)

**Why:**
- Diwali is 8 Nov, and schools run "Diwali fancy dress competitions" the week before (autocomplete: "diwali fancy dress competition ideas", "…for school", "eco friendly diwali fancy dress"). "lakshmi dress" is 720/mo.
- We have **0 Diwali products and no post**.
- `festival-costumes` is an empty, active category that the homepage links to. It's a soft-404 risk, and a ready-made place to put this content.

**Files:**
- Create: `scripts/setup-diwali-2026.ts`

- [ ] **Step 1: Repurpose the `festival-costumes` category** (the slug is already indexed at position 8.8 with 365 impressions).
  - Name: "Festival Costumes: Diwali, Dussehra & More".
  - Attach existing products: Ram, Sita and Hanuman (Ram's return to Ayodhya), the goddess products, and Ramleela crossovers.
  - Owner stock (Task 19 D1): Lakshmi Mata, diya costume, cracker/phuljhadi costume.
  - Title: `Diwali Fancy Dress for Kids – Lakshmi, Ram-Sita & Diya`
  - Meta: `Diwali fancy dress ideas for school competitions: Lakshmi Mata, Ram-Sita, diya and eco-friendly costumes. Buy or rent in Delhi NCR before 8 November 2026.`
- [ ] **Step 2: Blog post** `/blog/diwali-fancy-dress-competition-ideas`: ideas by age, eco-friendly options, "what to say on stage" lines (these win informational queries), and product links. Publish by 4 Oct.
- [ ] **Step 3: Owner uploads Saraswati and Mahishasur as new products** (Mahishasur also fits Navratri and Durga Puja, so upload it with the S1 batch). Then run Task 19a, which redirects `goddess-saraswati-mata-fancy-dress-costume` and `mahishasur-fancy-dress-costume` to the new slugs.
- [ ] **Step 4: Deploy, request indexing, commit.** `git commit -m "feat(diwali): turn the empty festival category into the Diwali hub and publish the competition guide"`

---

### Task 12: Children's Day (live by 3–10 Oct)

**Why:**
- The Nehru cluster was the site's biggest August earner: `/products/jawahar-lal-nehru-fancy-dress` got **31,297 web and 46,272 image impressions** in 90 days. "jawaharlal nehru dress" ranks at **position 1.1** with a 0.3% CTR.
- Children's Day (14 Nov) is Chacha Nehru's day, so the same queries come back in November. But the product title still says "**for Kids – 15 August**".
- Community-helper costumes are the other Children's Day demand: air hostess dress 5,400, pilot dress 2,900, doctor 880, farmer 880, postman 720, community helpers 1,600.
- `indian-pilot-fancy-dress-costume` and `children-police-fancy-dress-costume` are soft-deleted. The owner re-uploads them as new products, and their old URLs redirect to the new ones.
- Doraemon (935 impressions, 1 click) and laptop (1,602 impressions, 1 click) already carry Children's Day titles, so they need a CTR fix, not a relabel.

- [ ] **Step 1: Retitle the Nehru product (overwrite)**
  - Title: `Chacha Nehru Costume for Kids – Children's Day 14 Nov` (53 chars)
  - Meta: `Jawaharlal Nehru fancy dress for Children's Day: white achkan, Nehru cap and red rose. Buy or rent in Delhi NCR for school events on 13–14 November 2026.`
  - In the body, keep "Independence Day / Republic Day" as secondary uses so the page stays relevant for those dates.
  - **Don't change the slug.**
- [ ] **Step 2: Owner uploads the helper and profession products as new** (Task 19 S3): pilot, police, army, navy, doctor, nurse, postman, farmer, air hostess. Run Task 19a: attach them to `helper-costumes`, fill copy and alt text, and redirect the old pilot, police, army and navy slugs to the new products.
- [ ] **Step 3: Refresh the `helper-costumes` category copy** to target "community helpers fancy dress" and "Children's Day fancy dress".
- [ ] **Step 4: Blog post** `/blog/childrens-day-fancy-dress-ideas`, targeting "children's day fancy dress ideas", with Nehru, community helpers and cartoon sections plus product links.
  - Why a new post: our Independence Day post reached 13k impressions in a month, and there's no Children's Day post to refresh.
- [ ] **Step 5: CTR pass on Doraemon and laptop** (after the Task 5 differentiation). Put the price and "rent" in the title (`Doraemon Costume for Kids – Rent ₹{rent}`), since price in the title lifts CTR on commercial queries.
- [ ] **Step 6: Deploy, request indexing, commit.** `git commit -m "feat(childrens-day): retarget Nehru for 14 Nov, restore helper costumes, publish the ideas guide"`

---

### Task 13: Annual-function and dance season hub (live by 25 Oct – 10 Nov)

**Why:**
- Dec–Feb is "the biggest window" (`seodata/SEASONAL-CALENDAR.md`). Semrush: kathak dress **6,600**, haryanvi dress 5,400, dance costumes 4,400 (we're #28), kathak dance dress 1,900 (KD 9), kalbelia 1,000 (we're #14), bhangra 1,000, bihu 590 (KD 10).
- `/category/dance-dress` already has **4,323 impressions at position 11.7**, one step from page 1.
- **12 near-identical ₹1,200 Kathak products** compete for the same queries.
- Two thin posts (`school-annual-function-fancy-dress-guide` 123 words, `which-classical-dance-costume-for-your-child` 105 words) are weak pages that dilute the topic.

- [ ] **Step 1: Kathak consolidation.** Keep all 12 products, since they're real colour variants a customer chooses between. Differentiate `seo_title` and `name` by colour and style (for example "Kathak Dress – Anarkali, Red & Gold"), and make `/category/kathak-dress` (or `classical-dance-dress`) the page that targets the head term "kathak dress".
  - Category meta targets "kathak dress on rent" and "kathak dress for girls".
  - Product metas target "<colour> kathak dress".
  - This stops 12 product pages each trying to rank for "kathak dress".
- [ ] **Step 2: Refresh `dance-dress`** into a hub: "Dance Costumes on Rent in Delhi – Annual Function". Give it one section per dance (Kathak, Bharatnatyam, Bhangra, Garba, Kalbelia, Bihu, western) linking to each dance category, plus "bulk for schools" linking to `/wholesale/schools` and `/wholesale/dance-academies`.
- [ ] **Step 3: Merge the thin posts.**
  - Fold `school-annual-function-fancy-dress-guide` into `school-annual-function-fancy-dress-ideas-hindi`'s English sibling. Pick whichever English annual-function post has the most impressions and 301 the other to it.
  - Fold `which-classical-dance-costume-for-your-child` into the refreshed hub's FAQ, and 301 it to the category.
  - Fix the 4 blog excerpts over 160 characters.
- [ ] **Step 4: Lezim.** 6,600/mo and we don't stock it (the lezim is a Maharashtrian dance prop). Add it to the owner stock list (Task 19 S5). Nothing to build until it's stocked.
- [ ] **Step 5: Deploy, request indexing, commit.**

---

### Task 14: Christmas (live by 6–13 Nov; needs stock)

**Why:**
- There's **no Santa product at all**, and autocomplete shows strong adult rental intent: "santa costume on rent", "santa claus dress for adults on rent", "santa claus ki dress kahan milati hai", "santa claus dress wholesale".
- Also asked for: angel dress (390), angel head ring (390), snowman, elf.
- The existing `tree-fancy-dress` gets **16,501 image impressions** and can be retitled to also cover "christmas tree costume".

- [ ] **Step 1: Owner uploads the Christmas batch by 5 Nov** (Task 19 S4, stock confirmed): Santa (adult and kids, rent and wholesale), angel, snowman, elf. Then run Task 19a.
- [ ] **Step 2: Create a `christmas-costumes` category** (only with at least 5 products), import the products, and write copy targeting "santa claus dress on rent in Delhi".
- [ ] **Step 3: Retitle `tree-fancy-dress`** to `Tree Fancy Dress – Christmas Tree & Save Trees Costume` (54 chars), and add it to the Christmas category.
- [ ] **Step 4: Blog post** `/blog/christmas-fancy-dress-ideas-kids`, then deploy, request indexing and commit.

---

### Task 15: Internal linking: blog ↔ product ↔ category, and relevant related products (by 10 Nov)

**Why:**
- Internal links are how Google finds out which page is the authority for a query. The site under-uses them:
  - Blog posts link to **zero products**, have **no cover image** (their `BlogPosting` schema has no `image`, and the OG image falls back to the logo), and category pages link to a generic `/blog` rather than their matching guide.
  - Related products are weakly relevant: Gabbar gets Facebook and Laptop costumes from the generic "Costumes" pool.
- Two page-2 clusters need a hub pointing at them:
  - **Krishna:** 9 variants at positions 11–15 with about 10k web impressions between them, plus "child krishna fancy dress" at 6,431 image impressions, position 34.
  - **States:** Kerala 1,089 impressions at position 9.8, Maharashtra 826 + 757, Manipur 812, Assam 711 with 0 clicks, Nagaland 714.

**Files:**
- Migration: `supabase/migrations/20260923_blog_links.sql`
- Modify: `app/(public)/blog/[slug]/page.tsx`, `app/(public)/category/[slug]/page.tsx`, `lib/seo/structured-data.ts` (BlogPosting `image`), `lib/utils/related-products.ts` (+ its test)

- [ ] **Step 1: Migration.**

```sql
alter table blog_posts add column if not exists cover_image_url text,
                       add column if not exists related_category_slugs text[] default '{}';
alter table categories add column if not exists guide_blog_slug text;
```

- [ ] **Step 2: Blog page.**
  - Render the cover image as the LCP image, with `priority` and `fetchPriority="high"`, using the 800w variant.
  - Add a "Shop this guide" grid under the post: the top 8 live products from `related_category_slugs`, via the existing cached category query.
  - Set BlogPosting `image` and the OG image from `cover_image_url`.
- [ ] **Step 3: Category page.** When `guide_blog_slug` is set, show a "Read the guide: <title>" card above the FAQ.
- [ ] **Step 4: Related products: test first.** In `tests/related-products.test.ts`, add a test that a product whose primary category has at least 8 siblings gets only same-primary-category siblings, and that the generic pool (`costumes` or any category with 60+ products) is used only to top up. Run it and watch it fail, then implement it in `lib/utils/related-products.ts`, run it again and watch it pass.
- [ ] **Step 5: Seed the links** with `scripts/seed-internal-links.ts`: set `guide_blog_slug` and `related_category_slugs` for each festival pair (dandiya/garba ↔ Navratri guide, ramleela ↔ Dussehra post, and so on), plus covers for all 20+ posts.
- [ ] **Step 6: Krishna and states hubs.**
  - Refresh `indian-mythology-costumes` (already at position 5.2) as the Krishna hub, with a "Krishna dress by age and colour" section linking all 9 variants.
  - Refresh `states-fancy-dress` as the states hub, linking each state product with a line on "which school day it's for".
  - Rewrite the variants' titles to their distinct angle (age, colour, "for adults").
  - Why now, when Janmashtami is 10 months away: the states hub feeds annual-function and Republic Day demand (Dec–Jan), and Krishna image rankings take months to build.
- [ ] **Step 7: `npm test && npm run lint && npm run build`, deploy, commit.** `git commit -m "feat(seo): link guides to products and categories to guides, relevance-first related products"`

---

### Task 16: Local expansion: Ghaziabad page (by 10 Nov)

**Why:**
- "fancy dress on rent" autocompletes to **Noida first**.
- There's strong Ghaziabad demand (Indirapuram, Vasundhara, Vaishali), and Krishna Nagar is about 20–30 minutes from all three.
- The Noida page, built the same way in March, went from **2 to 26 clicks** in a month and is still rising.
- A Ghaziabad page is the best-proven pattern on the site. Build it before annual-function season.

**Files:**
- Create: `app/(public)/fancy-dress-ghaziabad/page.tsx` (copy the structure of `fancy-dress-noida`)
- Modify: `app/sitemap.ts` `staticPages`, plus the footer and location links wherever the Noida and Gurgaon pages are linked

- [ ] **Step 1: Build the page.** Give it genuinely local content:
  - Travel time and route from Krishna Nagar (via NH-9 / Anand Vihar), and delivery or pickup options.
  - Areas served: Indirapuram, Vaishali, Vasundhara, Raj Nagar Extension, Kaushambi.
  - School-season FAQ, Service + FAQPage + BreadcrumbList JSON-LD (same helpers as Noida), and links to the seasonal categories.
  - **No fake Ghaziabad address and no invented testimonials.** Only reuse real Google reviews that mention Ghaziabad, if any exist.
- [ ] **Step 2: Build, verify it's `○`, check the status is 200, then commit, deploy and request indexing.**

---

### Task 17: Republic Day refresh (10–20 Dec)

**Why:**
- The freedom-fighter pages earned **29,391 impressions** in the Aug spike and hold their positions (for example Mangal Pandey at 3.3–3.8).
- Republic Day (26 Jan) brings the same demand back, plus Republic-specific queries: ambedkar fancy dress competition **5,400** (KD 8, and we have no Ambedkar costume), bhagat singh dress 5,400, lady freedom fighters 2,900, subhash chandra bose dress 2,900.
- `/products/bhagat-singh-fancy-dress-costume` is soft-deleted (404). Only the cap is live.

- [ ] **Step 1: Owner uploads the full Bhagat Singh costume and an Ambedkar costume as new products** (S6). Task 19a redirects `bhagat-singh-fancy-dress-costume` to the new Bhagat Singh product.
- [ ] **Step 2: Refresh the three Independence Day posts** for Republic Day: dates, titles and product links. Merge `republic-independence-day-fancy-dress-ideas` (77 impressions) into the stronger `independence-day-fancy-dress-ideas` (14,217) as a "Republic Day" section, then 301. That leaves one strong page instead of two weak ones.
- [ ] **Step 3: Retitle** the Nehru, Mangal Pandey, Bharat Mata and Indira Gandhi products to mention Republic Day from 1 Jan (the Children's Day title covers Nov–Dec).
- [ ] **Step 4: Deploy, request indexing, commit.**

---

### Task 18: Weekly measure and adjust loop (ongoing, every Monday)

**Why:** Each festival window is short. If a page isn't moving 7–10 days after a refresh, we need to know while there's still time to act: change the title, add links, or push harder through the Business Profile.

- [ ] Every Monday, run `bash seodata/gsc/snapshot.sh` and diff it against the previous week and the 23 Sep baseline. Report:
  - Total web and image impressions and clicks.
  - Positions of the festival pages being pushed that week.
  - Whether `http://modfancydress.com/` impressions are moving to `/fancy-dress-delhi` (the check on your Business Profile link change).
  - Any new 404 or soft-404 in the Search Console page-indexing report (read via Chrome).
- [ ] Append a 5-line entry to `seodata/PROGRESS.md`.
- [ ] Decision rule: if a pushed page's position hasn't improved 10 days after the push, rewrite its title for CTR and add 3 internal links from pages ranking in the top 10.
- [ ] This can be scheduled as a recurring agent (`/schedule`) if you want it automatic.

---

### Task 19: Owner actions (you, in parallel from today)

These can't be done from code, or shouldn't be done without you: they're stock, money, or public posts.

| # | Action | Needed by | Why |
|---|---|---|---|
| **G1** | Google Business Profile: post Navratri/Dandiya **today** ("Dandiya dress for women, men and kids: buy or rent"), then weekly (Ramleela 1 Oct, Halloween 20 Oct, Diwali 25 Oct, Children's Day 5 Nov, Santa 20 Nov). I can draft every post. | Today → weekly | "near me" queries got **16k impressions at 0.7% CTR**. The map pack is where they're won, and posts plus fresh photos are the fastest local signal. |
| **G2** | Add 10+ fresh store photos of the dandiya/garba and Ramleela racks to the Business Profile | 30 Sep | Photo count and recency lift map-pack engagement. |
| **G3** | Reply to all unreplied reviews (drafts in `seodata/GBP-ACTION-PLAN.md`) and ask each Navratri customer for a review | Ongoing | Review recency is a top local-pack factor. |
| **S1** | **Men's kediyu**, **couple dandiya set**, **Durga Maa costume** | 5 Oct | Autocomplete: "dandiya dress for men / couple". "durga costume" and "durga fancy dress" get about 320/mo each. The boys' garba products were deleted in June and Aug. |
| **S2** | **Laxman**, **Ravan mukut**, **Ravan mask**, adult Ravan, Hanuman mask, Ram bow-and-arrow | 5 Oct | "ravan mukut" 590 (KD 17), "hanuman mask" 390, "ravan costume for adults". There's no Laxman at all. |
| **H1** | Halloween batch: witch, vampire, pumpkin, devil, Wednesday Addams (stock confirmed) | Upload by 1 Oct | Task 10. |
| **D1** | Lakshmi Mata, diya, cracker costumes | 20 Oct | Task 11. "lakshmi dress" 720/mo. |
| **S3** | Doctor, nurse, postman, farmer, air hostess | 25 Oct | Children's Day helper demand (air hostess 5,400, pilot 2,900). |
| **S4** | Santa (adult and kids, rent), angel, snowman, elf | 5 Nov | Task 14. Zero Santa stock today. |
| **S5** | Lezim prop | Dec | 6,600/mo, not stocked. |
| **S6** | Ambedkar costume, full Bhagat Singh costume | 15 Dec | 5,400 + 5,400 for Republic Day. |
| **R1** | **Re-upload as NEW products** (don't restore): pilot, police, army, navy, Bhagat Singh, Saraswati, Mahishasur, Shivaji, Ghoomar, garba boys'/girls' sets. I redirect each old URL to the new one (Task 19a). | With the batch they belong to (S1–S6) | The redirect passes the old URL's Google history to the new product. |
| **P1** | New photos for Mother Teresa and Traffic Police (their images are a scraped HTML page from another shop) | Any | Task 4 deactivates them if they have no image. |
| **C1** | Submit the citation pack (`seodata/CITATION-PACK.md`: JustDial, Sulekha, IndiaMART, Bing Places) | Oct | Still ❌ in PROGRESS.md. Citations support map-pack rankings all year. |

---

### Task 19a: New-upload follow-up (run after every owner upload batch)

**Why:** Every admin-panel batch lands with empty description, meta, title and alt text, and usually one orphan ([[admin-upload-leaves-seo-gaps]]). A new product with none of these barely ranks, and without a redirect the old soft-deleted URL's history is thrown away.

**Files:** Create `scripts/new-upload-followup.ts`, reusing `checkCopy`, `buildAltText`, `validateRedirects` and the Task 7 variant generator.

- [ ] **Step 1: Find the batch.** Select live products with `created_at` in the last N days (`--since`). Print the 5-point gap check: description, meta, title, alt text, category.
- [ ] **Step 2: Fill the copy.** Look at each product's photos first, then write description, meta and title aimed at that festival's keywords (`seodata/FESTIVAL-KEYWORDS-2026.md`). Run `checkCopy`, attach categories, and fill alt text.
- [ ] **Step 3: Generate variants** for the new images (`scripts/generate-image-variants.ts --since`).
- [ ] **Step 4: Redirect the old URLs.** For each new product that replaces a soft-deleted one (match on normalised name), add `{ source: '/products/<old-slug>', destination: '/products/<new-slug>', permanent: true }` to `redirects.json`, replacing any earlier Task 5 fallback redirect for that slug. Refresh `seodata/live-urls.json` and run `npm test` (the redirect test must pass).
- [ ] **Step 5: Deploy, request indexing for the new products and their category, commit.** `git commit -m "feat(catalog): copy, alt text and old-URL redirects for the <batch> upload"`

---

## Deliberately not in this plan (and why)

- **Turning Next image optimisation back on.** It broke before, for reasons never diagnosed ([[no-vercel-image-optimization]]). Task 7 gets the same byte savings from stored variants, without that risk.
- **Renaming existing image files.** It would reset Google Images' history on 723k impressions. Only new uploads get the new names.
- **A new `/navratri` landing page.** At 18 days out, a new URL won't rank in time. The indexed category pages and guide get the refresh instead (Task 1). Revisit for 2027 in July.
- **Hinglish meta descriptions.** Reasons in Global Constraints. Hinglish goes in one body line plus the existing Hindi posts.
- **Removing the hard-coded `aggregateRating` (4.7 from 700).** Google ignores self-served LocalBusiness ratings for stars. It's low risk and low value; leave it unless Search Console flags it.
- **Karwa Chauth.** Searches are for women's ethnic wear, which doesn't fit a costume shop.
- **Paginating `/products`.** Task 8's payload trim gets most of the gain without cutting the crawlable links every product relies on.

## Expected outcome (targets, checked in Task 18)

| Metric | Baseline (28 days to 20 Sep) | Target for 28 days ending 25 Oct |
|---|---|---|
| Web impressions | 92k | 150k+ (Navratri + Ramleela + Diwali ramp) |
| Garba/dandiya clicks | about 2 per 28 days | 150+ |
| `/category/dandiya-dress` position | 13.1 | ≤ 7 |
| Image search average position | 30.6 | ≤ 22 |
| Lab LCP, garba-dress (mobile, slow 4G) | 22.3s | < 4s |
| Page weight, category pages | 7.9–9.4MB | < 1.5MB |
| Soft-404 routes / dead-end redirects | 2 / 48 | 0 / 0 |
| Search Console mobile CWV "Good" URLs | (read in Task 9) | majority Good within 28 days of Task 7 |
