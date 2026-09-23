# SEO Master Plan — Progress Tracker
Legend: ✅ done · 🟡 partial · ❌ not started · ⏳ waiting/blocked
(Updated 2026-06-18)

## §3 Security
- ✅ **SEC-03** admin policies → server-only `app_metadata` (privilege escalation closed). Admin must re-login.
- ✅ **SEC-02** backup table RLS enabled (deny-all).
- ✅ **SEC-01** orders/order_items PII leak CLOSED — checkout fix deployed, test order verified, RLS enabled (advisor ERROR lints cleared). Reads now limited to order owner/admin.
- ❌ **SEC-04** function `search_path` · ❌ **SEC-05** over-permissive catalogues/enquiries · ❌ **SEC-06** bucket listing · ❌ **SEC-07** leaked-password + MFA (dashboard).

## Phase 1 — Quick wins
- ✅ Host canonicalization (apex→www 308)
- ✅ 13 quick-win products hand-tuned
- ✅ Kashmiri + Indian-Mythology categories (title/meta; mythology page populated, 16 products)
- ❌ Per-product review *snippets* — declined (no genuine per-product reviews; won't fabricate). Genuine Google **testimonials** added on location pages instead (✅).

## Phase 2 — Scale + Local
### 2A Product meta + images
- ✅ All **357 products** have unique seo_title + meta_description (0 null, 0 dupes)
- ✅ **alt_text backfill** — 228 images, 0 remaining null
### 2B Category depth ✅ DONE
- ✅ 15 high-value categories: rewritten seo_title/meta/**description** + **74 category-scoped FAQs**
- ✅ Product cross-listing (leaders-freedom-fighters now 13 products; helper/cartoon)
- ✅ Consolidated 5 duplicate categories (products remapped, deactivated, **301'd**) — 0 orphans
- ✅ Category pages now render `description` as a visible intro (code)
- ✅ Sitemap filters out empty categories (index-bloat fix)
- ✅ All 50 active categories have meta; 0 over-length
### 2C Local / GBP
- ✅ Delhi / Noida / Gurgaon pages (meta, JSON-LD, FAQs, internal links, GBP link, 18 testimonials)
- 🟡 **GBP optimization + 1★ review replies** — drafts ready in `GBP-ACTION-PLAN.md`; **you publish** (+ confirm deposit/delivery processes first)
- ❌ National "costume on rent in <city>" long-tail pages

## Phase 3 — Content / topical authority ✅ DONE (first wave)
- ✅ 6 genuine guides inserted: fancy-dress-competition-ideas, indian-mythological-characters, freedom-fighter-ideas, janmashtami-krishna, navratri-garba-dandiya, republic-independence-day
- ✅ Blog renderer upgraded to show markdown headings/bold/links (so the guides display correctly)
- ❌ Further waves (more occasion/character guides) — optional

## Phase 4 — Authority / backlinks
- ✅ Task 2 — schema `sameAs` → canonical Google Maps profile (both schema blocks)
- 🟡 Task 1 — citation pack ready (`CITATION-PACK.md`); **you/VA submit** to JustDial/Sulekha/IndiaMART/Bing/etc.
- ❌ Task 3 social/Pinterest profiles · Task 4 school/event partnership links · Task 5 content-driven seasonal PR

## Extras
- ✅ `INVENTORY-GAPS.md` (17 missing products to add)
- ✅ `GBP-ACTION-PLAN.md` (review replies + GBP plan + review-request template)
- ❌ NAP/business-name alignment ("Mod Fancy Dresses (Rent ‖ Wholesale)" → "Mod Fancy Dress") + schema `sameAs` → canonical Maps URL

---
## Keyword coverage status
- ✅ **Meta layer:** every product, category, and location page targets its keywords.
- ✅ **Category depth:** the high-volume head-term categories (dandiya 27k, kids 12k, freedom-fighters 6.6k, kathak 6.6k, states, haryanvi, helper) now have real on-page content + FAQs + internal links.
- ✅ **Informational head terms:** 6 content guides live (competition 33k, mythology, freedom-fighters, occasions).
- ❌ Remaining: per-product review snippets (needs real reviews), Phase 4 authority, more content waves.

---
## 23 Sep 2026 — festival-season push (plan: `docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md`)
Baselines: `seodata/gsc/2026-09-23-baseline.md` (Search Console), `seodata/gbp/2026-09-23-baseline.md` (Business Profile). Weekly: `bash seodata/gsc/snapshot.sh`.

### Shipped (live on production, verified)
- ✅ **Navratri/Dandiya** (T1): dandiya-dress + garba-dress retargeted at women/men/couples/rent; pillar guide rewritten (1,564 words, 16 product links, 2026 colours); kids guide merged + 308.
- ✅ **Ramleela** (T4): category copy; new `/blog/dussehra-ramleela-costume-ideas`; 4 orphans attached; 4 scraped non-image rows removed.
- ✅ **Seasonal homepage** (T2): Navratri + Ramleela sections and a composed hero banner (168KB/72KB); Janmashtami off; empty categories dropped; hydration #418 fixed.
- ✅ **Soft 404s** (T3): missing/inactive/empty categories → 404.
- ✅ **Redirects** (T5): 345 → 811 entries; 222 dead slugs, 48 dead ends repaired, 0 chains; 2 merges, 6 pairs differentiated, 6 typo slugs renamed.
- ✅ **Image SEO** (T6): alt text on every live image (312 filled); image sitemap (673 images, submitted, Google fetched); slug-based upload names.
- ✅ **CWV** (T7/T8): 400/800/1600w real-WebP variants (1,953); page weight −60–86%; /products payload −29%; map facade on location pages; 2.5MB of on-load prefetch removed; carousel banners re-encoded. Numbers in `seodata/CWV-2026.md`.
- ✅ **Children's Day / Diwali / Halloween** (T10–12): Nehru retitled for 14 Nov; helper, festival (Diwali hub, 12 products) and Halloween categories; 3 new guides.
- ✅ **Dance / Krishna / states** (T13/T15): 13 Kathak products differentiated; dance, Kathak, classical, mythology and states hubs, with 29 internal links; 3 thin posts merged + 308s.
- ✅ **Ghaziabad page** (T16), linked from Delhi/Noida/Gurgaon.
- ✅ **Prices**: 97 stale snippet prices corrected; comparison/FAQ tables now use live prices.
- ✅ Category descriptions render once, with links; markdown kept out of JSON-LD.

### Needs the owner
- ⏳ Run 2 SQL migrations (`supabase/migrations/20260923_*.sql`), then `npx tsx scripts/seed-seasonal-homepage.ts --apply` and `npx tsx scripts/seed-guide-links.ts --apply`. Until then, homepage sections have no end dates and category→guide cards don't show.
- ⏳ Upload the stock batches (plan Task 19); run Task 19a after each (`seodata/pending-reupload-redirects.json`).
- ⏳ GBP posts from `seodata/GBP-POSTS-2026-AUTUMN.md` (profile calls peak 2–4 days before a festival, so Navratri posts go up 1–8 Oct).
- ⏳ Vercel → Domains: apex → www in one hop. Search Console CWV report check in 28 days.
- ⏳ Data fixes: navratri-chaniya-choli (rent ₹2500 > buy ₹1500), orange-fancy-dress (rent > buy); kathak-dance-dress-anarkali-style-1.webp returns 400; Kerala and Kathakali have no product images; Gabbar is only in the generic "costumes" category.

### 23 Sep 2026 (later): done via Chrome with the owner logged in
- ✅ Both migrations run in the Supabase SQL editor; `seed-seasonal-homepage` and `seed-guide-links` applied. Homepage sections are now date-windowed, categories link to their guides, and all posts have covers (4 hand-picked: Dussehra→Ravan, Diwali→Raja Ram, freedom fighters→Jhansi, Independence Day→Gandhi).
- ✅ Search Console "Request indexing" (10/day quota): dandiya-dress, garba-dress, ramleela-costumes, navratri guide, dussehra guide, childrens-day guide, diwali guide, homepage, fancy-dress-ghaziabad, Nehru product. **Tomorrow:** halloween-costume-ideas-india, category/dance-dress, category/states-fancy-dress, category/festival-costumes, category/halloween.
- ✅ Core Web Vitals report: "Not enough usage data" (mobile and desktop). Google has no field CWV for the site yet, so CWV isn't a ranking input today.
- ✅ Merchant listings: 263 valid, 0 invalid. The ~150 "missing shippingDetails / hasMerchantReturnPolicy" came from /wholesale/<slug> emitting a second Product; removed (commit 6e61ccd), "Validate fix" started on both. `shippingRate` is omitted on purpose (charges vary per order). 4 SKUs are over 50 chars (non-critical).
- ⚠️ **Vercel Hobby over quota:** ISR writes 306K / 200K in the cycle ending 23 Sep. Cause: /products and /wholesale (~750KB each) regenerating hourly, plus every deploy rewriting all prerendered pages. Fixed in ba9eee8: all public pages are daily now, and admin product saves call /api/revalidate (scope=catalog). **Keep pushes batched**: each deploy costs ISR writes. Check Vercel → Observability → ISR in a week (target under 6.5K write units/day).
- ✅ Vercel domains were already correct (apex 308 → www). The extra http→https hop is Vercel's own and can't be removed.
