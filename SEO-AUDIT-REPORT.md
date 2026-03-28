# Full SEO Audit Report — modfancydress.com
**Audit Date:** 28 March 2026
**Business:** Mod Fancy Dress | Krishna Nagar, Delhi
**Type:** E-commerce + Local Service Hybrid (Retail + Rental + Wholesale)

---

## SEO Health Score: 59 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 63 | 13.9 |
| Content Quality / E-E-A-T | 23% | 62 | 14.3 |
| On-Page SEO | 20% | 65 | 13.0 |
| Schema / Structured Data | 10% | 60 | 6.0 |
| Performance (Core Web Vitals) | 10% | 45 | 4.5 |
| AI Search Readiness (GEO) | 10% | 61 | 6.1 |
| Images | 5% | 35 | 1.8 |
| **TOTAL** | | | **59 / 100** |

---

## Business Profile

| Signal | Value |
|---|---|
| Physical store | S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051 |
| Phone | +91 93113 65366 |
| Hours | Mon–Sun 10:00–21:30 |
| Rating | 4.7★ (700+ reviews) |
| Track record | 15+ years, 400+ school events |
| Service area | Delhi, Noida, Gurugram, Ghaziabad, Faridabad, Greater Noida + pan-India shipping |
| Catalogue | 417 products, 54 categories, 309 active product pages |
| Sitemap | 738 URLs |
| Stack | Next.js 16 App Router, Supabase, Vercel |

---

## Top 5 Critical Issues

1. **Fabricated reviews in `ReviewSchema()`** — 5 hardcoded fictional reviews emitted in JSON-LD on `/contact`. Violates Google's structured data review policy; risk of manual action.
2. **Missing `public/og-image.jpg` and `public/logo.png`** — both referenced in schema and metadata but return 404. Breaks OG images on all non-product pages and corrupts `LocalBusiness` logo in JSON-LD.
3. **Homepage TTFB 1.5–1.7s with zero CDN caching** — all pages served `Cache-Control: no-store`. Every visitor hits origin. One line of code (`export const revalidate = 300`) fixes it.
4. **Wrong GeoCoordinates** — `28.7041, 77.1025` is Delhi city centre (~5km from the actual store). Krishna Nagar is at approximately `28.668, 77.289`. Misplaces the map pin and damages local pack proximity signals.
5. **No privacy policy** — site collects auth data via Supabase, cart via localStorage, and WhatsApp tracking links. No `/privacy-policy` page or footer link exists. Both a legal requirement and a critical E-E-A-T failure.

## Top 5 Quick Wins

1. Add `export const revalidate = 300` to `/app/(public)/page.tsx` → TTFB drops from 1.6s to <100ms.
2. Change `@type: 'LocalBusiness'` to `@type: 'ClothingStore'` in `lib/seo/structured-data.tsx` line 35 → correct local schema category, one word.
3. Add `media` attributes to banner preload tags → stops mobile devices downloading both desktop + mobile banners simultaneously (saves ~314 KB per mobile pageload).
4. Fix `telephone: ['+919311365366']` (array) to `telephone: '+919311365366'` (string) in schema → spec compliance, fixes Rich Results Test warning.
5. Add Google Maps iframe to `/contact` page → #1 missing on-page GBP signal for local pack.

---

## CRITICAL Issues

### C1 — Fabricated Reviews in `ReviewSchema()`
**Files:** `lib/seo/structured-data.tsx` lines 452–537, `app/(public)/contact/page.tsx` lines 18–23
- 5 hardcoded reviews with generic Indian names (Priya Sharma, Rajesh Kumar, etc.) and fabricated 2024 dates
- Emitted as JSON-LD `review[]` array and displayed as HTML testimonials
- Same fictional reviews referenced in contact page display
- **Fix:** Delete `ReviewSchema()` function entirely. The `aggregateRating: 4.7/700` in `LocalBusinessSchema` is sufficient (and already correct). Replace contact page testimonials with real reviews fetched from `product_reviews` table.

### C2 — Missing `og-image.jpg` and `logo.png`
**Files:** `lib/seo/metadata.ts` line 39, `lib/seo/structured-data.tsx` lines 47, 123
- `/public/og-image.jpg` → 404 (used as OG fallback for homepage, about, blog, FAQ, contact, rent)
- `/public/logo.png` → 404 (hardcoded in `LocalBusiness.logo` and `Organization.logo` schema on every page)
- **Fix:** Create `public/og-image.jpg` (1200×630 px) and `public/logo.png` (min 112×112 px square). Use the existing logo SVG/PNG already in the project — update the constant in `structured-data.tsx`.

### C3 — Soft-404: Inactive Products Return HTTP 200
**File:** `app/(public)/products/[slug]/page.tsx` lines 33–37, 81–98
- `generateMetadata` queries products without `is_active = true` filter
- Inactive slugs render a full page with `<title>Product Not Found</title>` returning HTTP 200
- Canonical incorrectly points to homepage — PageRank dead-end
- **Fix:** Add `.eq('is_active', true).is('deleted_at', null)` to the metadata query. Call `notFound()` for missing/inactive slugs to return HTTP 404 properly.

### C4 — No Privacy Policy Page
**File:** `components/public/Footer.tsx`
- No `/privacy-policy` route exists in the codebase
- Site uses Supabase Auth (email), localStorage cart, WhatsApp URL tracking
- Required by Indian IT Rules 2021 (Intermediary Guidelines) and Google's E-E-A-T Trustworthiness standards
- **Fix:** Create `app/(public)/privacy-policy/page.tsx` with data collection disclosure. Add link to `Footer.tsx`.

### C5 — Wrong GeoCoordinates in LocalBusiness Schema
**File:** `lib/seo/structured-data.tsx`
- Current: `latitude: "28.7041", longitude: "77.1025"` (Connaught Place area, ~5km away)
- Krishna Nagar correct approximation: `28.668, 77.289`
- **Fix:** Open Google Maps, drop a pin on S64, South Anarkali shopfront, copy exact coordinates to 5+ decimal places. Update both `geo.latitude` and `geo.longitude`. Also change from string to number type.

### C6 — Homepage TTFB 1.5–1.7s (No Caching)
**File:** `app/(public)/page.tsx`
- All pages served `Cache-Control: no-store`, `x-vercel-cache: MISS` on every request
- Homepage makes 4 live Supabase queries per request (banners, products, categories)
- **Fix:** Add `export const revalidate = 300` to homepage, category pages, and blog listing. This enables ISR — Vercel serves from edge CDN with <100ms TTFB, refreshing every 5 minutes in background.

### C7 — "Add to Cart" Below Fold on Mobile
**Visual finding:**
- On 375×812 mobile, "Add to Cart" button sits at `y=832px` — 20px below viewport
- Users must scroll before they can purchase
- **Fix:** Reduce product image height on mobile from 343px to ~280px, OR add a sticky bottom CTA bar ("Add to Cart — ₹550") that stays visible while scrolling.

---

## HIGH Issues

### H1 — Non-www Redirect Uses HTTP 307 (Temporary)
- `modfancydress.com` → `www.modfancydress.com` returns 307, not 301/308
- PageRank not fully consolidated; Google may index both origins separately
- **Fix:** In Vercel dashboard → Domains → set non-www redirect to "Permanent Redirect (308)"

### H2 — No Security Response Headers
**File:** `next.config.ts` (no `headers()` function)
- Missing: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- Only HSTS present (Vercel default)
- **Fix:** Add a `headers()` function to `next.config.ts`:
```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }]
}
```

### H3 — Duplicate `<meta name="viewport">` Tag
**File:** `app/layout.tsx` line 46
- Two viewport tags emitted: first allows `maximum-scale=5` (accessibility-correct), second overrides it with just `initial-scale=1`
- The accessibility-friendly setting is silently discarded
- **Fix:** Remove the manual `<meta name="viewport">` from `app/layout.tsx`. Export a `viewport` constant instead:
```ts
import type { Viewport } from 'next'
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 5, userScalable: true,
}
```

### H4 — Product Images Unoptimized (2.27 MB PNG on Product Pages)
**File:** `next.config.ts` line 10 (`unoptimized: true`)
- 69% of product images are JPEG, 7% are PNG — no automatic format conversion
- Sample kathak dress image: 2.27 MB PNG → 3.6 seconds download on 5 Mbps Indian 4G
- next/image produces no `srcset`, no WebP conversion, no responsive resizing
- **Fix (short-term):** Configure Supabase image transform as a custom loader — append `?width=800&quality=80` to image URLs for product pages. **Fix (long-term):** Enforce WebP ≤200 KB at upload time using the existing `browser-image-compression` library.

### H5 — Both Banner Images Preloaded on All Devices
**File:** `components/public/AssetPreloader.tsx`
- HTML `<head>` emits `<link rel="preload">` for both desktop banner (314 KB) and mobile banner (303 KB) unconditionally
- Mobile devices download 617 KB of banners when they need only 303 KB
- **Fix:** Add `media` attributes to preload tags:
```html
<link rel="preload" as="image" href="...banner-desktop.webp" media="(min-width: 768px)"/>
<link rel="preload" as="image" href="...banner-mobile.webp" media="(max-width: 767px)"/>
```
Must be emitted from the Server Component layout, not from `AssetPreloader` (runs after hydration, too late).

### H6 — `telephone` Is an Array in Schema (Should Be String)
**File:** `lib/seo/structured-data.tsx`
- `telephone: ['+919311365366']` in both `LocalBusinessSchema()` and `OrganizationSchema()`
- Schema.org specifies `telephone` as a string on `LocalBusiness`/`Organization`
- **Fix:** Change to `telephone: '+919311365366'` in both functions.

### H7 — No Google Maps Embed on Contact Page
**File:** `app/(public)/contact/page.tsx`
- No `<iframe>` with Google Maps embed exists anywhere on the site
- Maps embed is one of the strongest on-page GBP proximity signals for local pack rankings
- **Fix:** Add a Maps embed using the business Place ID (extract from `g.page/r/CdvlhuNtrqb5EAI` URL).

### H8 — No Location Landing Pages for NCR Cities
- No pages exist for Noida, Gurugram, Ghaziabad, Faridabad, Greater Noida
- Service area mentioned only in copy and `areaServed` schema — not in dedicated pages
- Dedicated service area pages are the #1 local organic ranking factor (Whitespark 2026)
- **Fix:** Create `/fancy-dress-noida` and `/fancy-dress-gurgaon` as priority first pages. Each needs unique intro copy (≥400 words), delivery-specific info for that city, and correct LocalBusiness schema with `areaServed`.

### H9 — No Indian Tier-1 Directory Citations (Justdial, Sulekha, IndiaMART)
- None of these appear in `sameAs` or as footer links
- Justdial is the equivalent of Yelp for India; critical for local pack
- Three of the top 5 AI visibility factors are citation-related (Whitespark 2026)
- **Fix:** Claim/create listings on Justdial, Sulekha, and IndiaMART. Once live, add URLs to `sameAs` in `LocalBusinessSchema()`.

### H10 — Rental CTA at 6,000px Scroll Depth on Mobile
**File:** `app/(public)/rent/page.tsx`
- The WhatsApp enquiry CTA is at the very bottom of the /rent page (~6000px on mobile)
- Above-fold content shows H1 and how-it-works but no actionable button
- **Fix:** Add a "WhatsApp to Enquire" button immediately after the 3-step process section. Also add "Rent" to the mobile bottom tab bar.

### H11 — `sameAs` Contains Only One Entry (GBP Share URL)
**File:** `lib/seo/structured-data.tsx`
- Both `LocalBusinessSchema` and `OrganizationSchema` have `sameAs` with only `share.google/...` (a non-canonical, potentially expiring URL)
- YouTube correlation with AI citation is 0.737 — the strongest measured signal
- **Fix:** Replace the share URL with the stable GBP CID URL. Add Instagram, Facebook, YouTube (if accounts exist) and Justdial/Sulekha once claimed.

### H12 — Wholesale Page Critically Thin (~55 words)
**File:** `app/(public)/wholesale/page.tsx`
- Only a banner ("Bulk order prices per piece") and a product grid — no editorial content
- No MOQ, no lead time, no payment terms, no enquiry process explanation, no qualification criteria
- Minimum for a service page: 800 words
- **Fix:** Add a wholesale information section with: who it's for (schools, retailers, event organisers), minimum quantities, lead times, payment terms, and sample availability.

---

## MEDIUM Issues

### M1 — `@type` Should Be `ClothingStore` Not `LocalBusiness`
**File:** `lib/seo/structured-data.tsx` line 35
- `ClothingStore` is the correct schema.org subtype for a costume/clothing retailer
- GBP category alignment is the #1 local ranking factor; schema `@type` reinforces it
- **Fix:** Change `'@type': 'LocalBusiness'` to `'@type': 'ClothingStore'` — one word.

### M2 — No Article/BlogPosting Schema on Blog Posts
**File:** `app/(public)/blog/[slug]/page.tsx`
- Blog posts only have `LocalBusiness` + `BreadcrumbList` schema
- No `Article` or `BlogPosting` with `datePublished`, `author`, `publisher`, `image`
- Blocks article rich results in SERPs and AI Overview eligibility for informational queries
- **Fix:** Add `BlogPosting` JSON-LD using `published_at` and `updated_at` from the database. Link `author` and `publisher` to the existing `Organization` `@id`.

### M3 — Duplicate FAQ Questions on /faq Page (Data Pipeline Bug)
**File:** FAQ data loading logic
- 14 rental FAQ questions appear twice in the `mainEntity` array (44 items, 14 duplicated)
- **Fix:** De-duplicate the FAQ merge logic that combines DB FAQs with `rentalFaqPairs()`.

### M4 — About Page Critically Thin (~165 words)
**File:** `app/(public)/about/page.tsx`
- The highest-priority E-E-A-T page has only ~165 words of content
- No founder/owner named, no founding year, no named schools served, no media mentions
- **Fix:** Expand to 500+ words with: founding year, proprietor name, shop description, costume sourcing/quality standards, specific districts/schools served (without naming students), community involvement.

### M5 — No Privacy Policy or Returns Policy
**File:** `components/public/Footer.tsx`, `app/(public)/products/[slug]/page.tsx`
- No `/privacy-policy` or `/returns` route in the codebase
- Rental deposit return is mentioned in FAQ but no formal returns page for purchases
- **Fix:** Create both pages; link from footer and from product pages.

### M6 — Sitemap `lastmod` Uses `new Date()` for Static Pages
**File:** `app/sitemap.ts` lines 72–118
- Static pages (homepage, /about, /contact) report `lastmod` as current request time
- Google treats this as an unreliable signal and discounts it
- **Fix:** Use hardcoded dates for truly static pages. Add `export const revalidate = 3600` to `app/sitemap.ts` to cache the sitemap response.

### M7 — `reviewCount` Is a String (`"700"`) Not an Integer
**File:** `lib/seo/structured-data.tsx`
- Schema.org specifies `reviewCount` as `Integer`; same for `bestRating`/`worstRating`
- **Fix:** Change to `reviewCount: 700`, `bestRating: 5`, `worstRating: 1` (numeric literals).

### M8 — Homepage BreadcrumbList Has Only One Item
**File:** `lib/seo/structured-data.tsx`
- A single-item `BreadcrumbList` (Home only) cannot render as a breadcrumb rich result (Google requires 2+ items)
- **Fix:** Replace the homepage breadcrumb with a `WebSite` schema + `SearchAction` (Sitelinks Searchbox). See JSON-LD below.

### M9 — Product Name Double Space and Description Concatenation Bug
**File:** Product data pipeline
- Some products render as `"Kathak  Fancy Dress"` (double space) in JSON-LD `name`
- Description field prepends the product name without a separator
- **Fix:** Trim/normalise product names at save time. Fix the description concatenation to use `: ` separator or remove the name prefix.

### M10 — No `WebSite` Schema with `SearchAction` (Sitelinks Searchbox)
**File:** `lib/seo/structured-data.tsx`
- No `WebSite` schema emitted anywhere
- **Fix:** Add to homepage layout:
```json
{
  "@type": "WebSite",
  "@id": "https://www.modfancydress.com#website",
  "url": "https://www.modfancydress.com",
  "name": "Mod Fancy Dress",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.modfancydress.com/products?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### M11 — No Product-Level AggregateRating on Product Pages
**File:** `app/(public)/products/[slug]/page.tsx`
- Product-level star ratings don't appear in schema unless `product_reviews` table has entries
- Star ratings in product SERPs are among the highest-CTR rich results
- **Fix:** Ensure real customer reviews are collected into `product_reviews` table. The `ReviewSchema()` fabricated function must never be used.

### M12 — `lang="hi"` Missing on Hindi Blog Posts
**File:** `app/(public)/blog/[slug]/page.tsx`
- Root layout sets `lang="en"` globally
- Hindi blog posts are served with incorrect English language declaration
- **Fix:** In `generateMetadata` for blog posts, check `post.language` and set `alternates: { languages: { 'hi': currentUrl } }` and output `<html lang="hi">` for Hindi posts.

### M13 — Product Gallery `mousemove` Handler Not Throttled
**File:** `components/public/ProductGallery.tsx` lines 42–69
- `handleMouseMove` calls `getBoundingClientRect()` + 3 `setState` calls on every pixel of movement
- On low-end Android (typical in India): fires 60 state updates/second, risks INP spike to 200–400ms
- **Fix:** Wrap handler body in `requestAnimationFrame`. Guard `setContainerSize` to only call when container dimensions actually change.

### M14 — `AssetPreloader` Adds Useless Google Fonts Preconnects
**File:** `components/public/AssetPreloader.tsx`
- Injects `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com`
- No Google Fonts are loaded — all fonts are locally hosted woff2 files
- Wastes TCP/TLS connection time on every pageload
- **Fix:** Delete the Google Fonts preconnect injection from `AssetPreloader.tsx`.

### M15 — No `llms.txt` File
- `GET /llms.txt` returns 404
- Perplexity, ChatGPT, and LLM crawlers use this file for curated content indexing
- **Fix:** Create `/public/llms.txt` with a business summary, key page links, and service description.

### M16 — No `foundingDate` on Organization Schema
**File:** `lib/seo/structured-data.tsx`
- "15+ years" is stated on-page but not encoded as machine-readable `foundingDate`
- **Fix:** Add `"foundingDate": "2010"` (or the actual year) to `OrganizationSchema()`.

### M17 — Supabase Storage Images Have No CDN Caching
- All image requests: `cache-control: no-cache`, `cf-cache-status: MISS`
- Cloudflare acts as passthrough only; every visitor fetches from Supabase origin
- **Fix:** In Supabase dashboard → Storage → Policies → set bucket default to `max-age=86400, stale-while-revalidate=604800`. Dramatically improves repeat-visit image load times.

### M18 — Sitemap `priority`/`changefreq` Tags on All 738 URLs
**File:** `app/sitemap.ts`
- Google has officially confirmed it ignores both fields
- Their presence adds ~40% unnecessary payload to the sitemap
- **Fix:** Remove both fields from all `sitemap.ts` URL objects.

### M19 — No Hero CTA Button on Banner Slides
**Visual finding:**
- Banner slides (desktop and mobile) are visual-only with no "Shop Now" or "Browse" button
- Mobile hero has no layered action prompt
- **Fix:** Add a CTA button overlay on each banner slide. Update hero sub-copy to be geo-targeted: "Fancy Dress for Rent & Buy in Delhi".

### M20 — Custom 404 Page Missing
**File:** `app/not-found.tsx` (doesn't exist)
- 404 page shows only "This page could not be found" with no search, no links, no recovery
- **Fix:** Create `app/not-found.tsx` with a search input and links to popular categories. Add `/products/kathak-dress` → `/products/kathak-fancy-dress` to `redirects.json`.

---

## LOW Issues

| # | Issue | Fix |
|---|---|---|
| L1 | `turbopack: {}` in `next.config.ts` conflicts with CLAUDE.md Webpack mandate | Remove line |
| L2 | `keywords` meta tag with 15 identical terms on every page (Google ignores since 2009) | Remove `keywords` from `generatePageMetadata()` |
| L3 | No IndexNow implementation for Bing/Yandex freshness | Add IndexNow key + ping webhook on product save |
| L4 | No `hasMap` in LocalBusiness schema | Add `hasMap: "https://maps.google.com/?cid=YOUR_CID"` |
| L5 | `paymentAccepted` and `currenciesAccepted` missing from LocalBusiness schema | Add `"paymentAccepted": "Cash, UPI, Credit Card"`, `"currenciesAccepted": "INR"` |
| L6 | About page sitemap priority is 0.55 (lower than FAQ at 0.75) | Raise to 0.70 in `app/sitemap.ts` |
| L7 | Blog index doesn't display publication dates | Render `published_at` on each post card |
| L8 | No author attribution on blog posts | Add author field to `blog_posts` table or use "Mod Fancy Dress Team" |
| L9 | "Rent" missing from mobile bottom tab bar | Add Rent tab alongside Home/Shop/Cart/Contact |
| L10 | OccasionGuideTable price ranges have no freshness date marker | Add "Prices as of 2026 — see live product pages" note |
| L11 | No `ItemList` schema on main `/products` listing page | Generate from same Supabase query, same pattern as `CategoryListingJsonLd` |
| L12 | Single-origin `sameAs` share URL may expire | Use stable CID-based Maps URL: `maps.google.com/?cid=...` |
| L13 | No breadcrumb on wholesale page | Add `<nav>` breadcrumb and `BreadcrumbSchema` to `wholesale/page.tsx` |
| L14 | No AI crawler-specific rules in `robots.txt` | Add explicit `GPTBot`, `ClaudeBot`, `PerplexityBot` directives |
| L15 | Homepage H1 not geo-targeted | Change to "Fancy Dress Costumes for Rent & Buy in Delhi" |

---

## Prioritised Action Plan

### SPRINT 1 — This Week (Critical / Low Effort)

| # | Action | File | Est. Effort |
|---|---|---|---|
| 1 | Delete `ReviewSchema()` function — remove fabricated reviews from JSON-LD and contact page | `structured-data.tsx`, `contact/page.tsx` | 30 min |
| 2 | Create `public/og-image.jpg` (1200×630) and `public/logo.png` | `/public/` | 1 hr |
| 3 | Fix GeoCoordinates to verified Krishna Nagar pin (5 decimal places) | `structured-data.tsx` | 15 min |
| 4 | Add `export const revalidate = 300` to homepage, category pages, blog listing | `app/(public)/page.tsx` + others | 30 min |
| 5 | Change `@type: 'LocalBusiness'` to `@type: 'ClothingStore'` | `structured-data.tsx` line 35 | 5 min |
| 6 | Fix `telephone` from array to string in both schema functions | `structured-data.tsx` | 10 min |
| 7 | Fix `reviewCount`, `bestRating`, `worstRating` from string to integer | `structured-data.tsx` | 10 min |
| 8 | Add security headers to `next.config.ts` | `next.config.ts` | 30 min |
| 9 | Fix duplicate viewport meta tag — use Next.js `viewport` export | `app/layout.tsx` | 20 min |
| 10 | Remove Google Fonts preconnects from `AssetPreloader.tsx` | `AssetPreloader.tsx` | 10 min |
| 11 | Remove `turbopack: {}` and `keywords` from config/metadata | `next.config.ts`, `metadata.ts` | 10 min |
| 12 | Fix `sitemap.ts` static page `lastmod` — use hardcoded dates; add `revalidate` | `app/sitemap.ts` | 30 min |
| 13 | Fix inactive product soft-404 — call `notFound()` for missing/inactive slugs | `products/[slug]/page.tsx` | 1 hr |
| 14 | Fix duplicate rental FAQs in /faq data pipeline | FAQ merge logic | 30 min |
| 15 | Remove `priority`/`changefreq` tags from sitemap | `app/sitemap.ts` | 20 min |

### SPRINT 2 — Next 2 Weeks (High Impact)

| # | Action | Est. Effort |
|---|---|---|
| 16 | Add Google Maps iframe to `/contact` page (Place ID from GBP link) | 1 hr |
| 17 | Add media attributes to banner preloads (viewport-conditional) | 1 hr |
| 18 | Create privacy policy page; add to footer | 2 hr |
| 19 | Create returns/refund policy page; add to footer and product pages | 2 hr |
| 20 | Fix non-www 307 → 308 redirect in Vercel dashboard | 15 min |
| 21 | Expand `sameAs` with stable GBP CID URL + social profiles | 30 min |
| 22 | Add `BlogPosting` schema to blog post pages | 2 hr |
| 23 | Add `WebSite` + `SearchAction` schema to homepage; replace single-item BreadcrumbList | 1 hr |
| 24 | Create `public/llms.txt` | 30 min |
| 25 | Configure Supabase Storage bucket cache policy (max-age=86400) | 30 min |
| 26 | Throttle `ProductGallery` mousemove with `requestAnimationFrame` | 1 hr |
| 27 | Add `foundingDate` to OrganizationSchema | 10 min |
| 28 | Fix product name double-space and description concatenation bug | 1 hr |
| 29 | Bring "Add to Cart" above fold on mobile (reduce image height or sticky CTA) | 2 hr |
| 30 | Move WhatsApp CTA to top of `/rent` page; add Rent to mobile tab bar | 2 hr |

### SPRINT 3 — Month 1 (Content & Local)

| # | Action | Est. Effort |
|---|---|---|
| 31 | Expand About page to 500+ words with founder name, founding year, specific history | 3 hr |
| 32 | Expand Wholesale page to 800+ words (MOQ, lead times, payment, eligibility) | 3 hr |
| 33 | Claim/create Justdial, Sulekha, IndiaMART listings with exact NAP | 2 hr |
| 34 | Create `/fancy-dress-noida` and `/fancy-dress-gurgaon` location pages | 4 hr each |
| 35 | Add hero CTA button to banner slides; update H1 with geo intent | 2 hr |
| 36 | Create custom 404 page with search + category links | 2 hr |
| 37 | Enforce WebP ≤200 KB for all product image uploads | 3 hr |
| 38 | Audit product descriptions in Supabase — flag any <80 words | 2 hr |
| 39 | Add `lang="hi"` to Hindi blog posts via generateMetadata | 1 hr |
| 40 | Implement review solicitation in WhatsApp follow-up flow | 2 hr |

---

## What Is Already Working Well

| Strength | Detail |
|---|---|
| Server-side rendering | All content in initial HTML — fully crawlable by all bots |
| Zero third-party scripts | No GA4, Meta Pixel, Hotjar — significant INP and privacy advantage |
| Product Schema | Correct `Offer` with both purchase and lease options |
| FAQPage Schema (56 Q&A) | Strong AI citation source; excellent rental FAQ content |
| CollectionPage + ItemList | Correctly implemented on all category pages |
| Self-hosted fonts | No Google Fonts dependency latency |
| NAP Consistency | Single `lib/constants/contact.ts` source prevents drift |
| 738-URL sitemap | Complete coverage with correct soft-delete filtering |
| 316 slug redirects | `redirects.json` correctly handles renamed products |
| 4.7★ / 700+ reviews | Excellent social proof; aggregateRating in schema |
| Dual pricing on product pages | Rent + purchase price immediately visible on mobile |
| Bilingual blog | English + Hindi content — strong for regional queries |
| Breadcrumb schema | 4-level hierarchy on all key page types |
| PWA manifest | Service worker with StaleWhileRevalidate for images |
| Banner images already WebP | LCP image format is optimal |
| Rental FAQ data | Operationally specific, ideal AI citation content |
| Classical Dance Comparison Table | High-value structured comparison content |

---

*Report generated by Claude Code SEO Audit System | 8 parallel specialist agents | 28 March 2026*
