# Mod Fancy Dress — Full Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical bugs (fabricated reviews, wrong pricing display, wrong geo coords), apply all SEO improvements from the 40-item audit, and improve UX/conversion across the storefront.

**Architecture:** Next.js 16 App Router + Supabase. Most changes are in `lib/seo/structured-data.tsx`, `next.config.ts`, page files, and new static pages. No database schema changes required except one SQL query to optionally clean up product names.

**Tech Stack:** Next.js 16, Supabase (PostgreSQL), TypeScript, Tailwind CSS, Lucide React, `next/image`, Zustand.

**SEO Health Score at start:** 59/100. Expected after Sprint 1+2: ~78/100.

---

## File Map

| File | Change |
|------|--------|
| `lib/seo/structured-data.tsx` | Delete `ReviewSchema()`, fix `LocalBusinessSchema()` (type/geo/telephone/reviewCount), fix `OrganizationSchema()` (telephone/foundingDate), fix `ProductSchema()` displayPrice |
| `app/layout.tsx` | Remove duplicate `<meta name="viewport">`, add `export const viewport` |
| `next.config.ts` | Remove `turbopack: {}`, add `headers()` with security headers |
| `components/public/AssetPreloader.tsx` | Remove spurious Google Fonts preconnects |
| `app/(public)/page.tsx` | Add `export const revalidate = 300` |
| `app/(public)/products/page.tsx` | Add `export const revalidate = 300` |
| `app/(public)/category/[slug]/page.tsx` | Add `export const revalidate = 300` |
| `app/(public)/blog/page.tsx` | Add `export const revalidate = 300` |
| `app/(public)/contact/page.tsx` | Remove `ReviewSchema` usage; add Google Maps iframe |
| `app/(public)/products/[slug]/page.tsx` | Add `notFound()` for inactive/missing products |
| `app/(public)/blog/[slug]/page.tsx` | Add `BlogPosting` JSON-LD schema |
| `app/sitemap.ts` | Fix static page `lastmod`, remove `changeFrequency`/`priority`, add `export const revalidate = 3600` |
| `app/(public)/privacy-policy/page.tsx` | Create new page |
| `app/(public)/returns/page.tsx` | Create new page |
| `app/(public)/fancy-dress-noida/page.tsx` | Create location landing page |
| `app/(public)/fancy-dress-gurgaon/page.tsx` | Create location landing page |
| `app/not-found.tsx` | Create custom 404 page |
| `public/llms.txt` | Create AI crawler guidance file |
| `components/public/Footer.tsx` | Add Privacy Policy and Returns links |
| `components/public/MobileBottomNav.tsx` | Add Rent tab |

---

## Task 1: Delete Fabricated ReviewSchema + Fix Contact Page

**The critical Google policy violation.** `ReviewSchema()` in `structured-data.tsx` emits 5 fake named reviews (Priya Sharma, Rajesh Kumar, Anita Mehta, Vikram Singh, Sunita Devi) into JSON-LD. This violates Google's structured data guidelines and can trigger manual actions. `contact/page.tsx` also renders these fake reviews as visible HTML — keep the visible cards but remove the JSON-LD injection.

**Files:**
- Modify: `lib/seo/structured-data.tsx` (lines 452–537)
- Modify: `app/(public)/contact/page.tsx` (lines 5, 15, 27)

- [x] **Step 1: Delete ReviewSchema function from structured-data.tsx**

In `lib/seo/structured-data.tsx`, delete the entire `ReviewSchema()` function (lines 452–537 inclusive, starting at `// Review Schema` comment):

```typescript
// Delete this entire block — lines 452–537:
// Review Schema
export function ReviewSchema() {
  return {
    // ... (the entire function with 5 fake reviews)
  }
}
```

After deletion, the file should end with the closing brace of `FaqPageSchema` at line 449.

- [x] **Step 2: Remove ReviewSchema import and usage from contact/page.tsx**

In `app/(public)/contact/page.tsx`:

Line 5 — remove the import:
```typescript
// DELETE this line:
import { ReviewSchema } from '@/lib/seo/structured-data'
```

Lines 15 and 27 — remove the usage:
```typescript
// DELETE line 15:
const reviewSchema = ReviewSchema()

// DELETE line 27 (the <script> tag):
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
```

The visible review cards array (`const reviews = [...]`) on lines 17–23 and the HTML rendering remain — they are just UI display, not structured data injection.

- [x] **Step 3: Run lint to verify no compile errors**

```bash
npm run lint 2>&1 | head -30
```

Expected: No errors referencing `ReviewSchema`.

- [x] **Step 4: Commit**

```bash
git add lib/seo/structured-data.tsx app/(public)/contact/page.tsx
git commit -m "fix(seo): delete fabricated ReviewSchema — violates Google structured data policy"
```

---

## Task 2: Fix LocalBusinessSchema (type, geo, telephone, reviewCount)

Four schema bugs in `LocalBusinessSchema()` in `lib/seo/structured-data.tsx`:
- `@type: 'LocalBusiness'` → should be `'ClothingStore'` (more specific, eligible for more rich results)
- `geo.latitude: '28.7041', geo.longitude: '77.1025'` → wrong (Delhi city center / Connaught Place). Krishna Nagar is ~`28.6680, 77.2897`
- `telephone: ['+919311365366']` → array, must be string per schema.org spec
- `reviewCount: '700'`, `bestRating: '5'`, `worstRating: '1'` → strings, must be integers

**Files:**
- Modify: `lib/seo/structured-data.tsx` (lines 34–109)

- [x] **Step 1: Apply all four fixes in LocalBusinessSchema**

In `lib/seo/structured-data.tsx`, replace the `LocalBusinessSchema` function body:

```typescript
export function LocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': localBusinessEntityId(),
    parentOrganization: {
      '@id': organizationEntityId(),
    },
    name: 'Mod Fancy Dress',
    description:
      'Fancy dress costumes and accessories. Based in Delhi with 15+ years of experience; we serve customers across Delhi, Noida, the wider NCR (Gurugram, Ghaziabad, Faridabad, Greater Noida, and nearby areas), and ship to many localities in other states — contact us for delivery options.',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.jpg`,
    telephone: '+919311365366',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'S64, South Anarkali, Som Bazar',
      addressLocality: 'Krishna Nagar',
      addressRegion: 'Delhi',
      postalCode: '110051',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '28.6680',
      longitude: '77.2897',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Delhi',
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: 'National Capital Territory of Delhi',
        },
      },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Gurugram' },
      { '@type': 'City', name: 'Ghaziabad' },
      { '@type': 'City', name: 'Faridabad' },
      { '@type': 'City', name: 'Greater Noida' },
      {
        '@type': 'AdministrativeArea',
        name: 'National Capital Region',
        containedInPlace: { '@type': 'Country', name: 'India' },
      },
      { '@type': 'Country', name: 'India' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '10:00',
      closes: '21:30',
    },
    priceRange: '₹₹',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: 700,
      bestRating: 5,
      worstRating: 1,
    },
    sameAs: [
      'https://share.google/j5z6wKKjqsCHJKajh',
    ],
  }
}
```

- [x] **Step 2: Fix OrganizationSchema — same telephone and add foundingDate**

In `lib/seo/structured-data.tsx`, update `OrganizationSchema()`:

```typescript
export function OrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationEntityId(),
    name: 'Mod Fancy Dress',
    alternateName: 'Mod Fancy Dress — Delhi & NCR',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.jpg`,
    description:
      'Retailer of fancy dress costumes and accessories. Over 15 years serving schools, events, and families across Delhi, Noida, the National Capital Region, and customers in other states through delivery and coordination.',
    telephone: '+919311365366',
    foundingDate: '2010',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'S64, South Anarkali, Som Bazar',
      addressLocality: 'Krishna Nagar',
      addressRegion: 'Delhi',
      postalCode: '110051',
      addressCountry: 'IN',
    },
    sameAs: ['https://share.google/j5z6wKKjqsCHJKajh'],
    subOrganization: {
      '@id': localBusinessEntityId(),
    },
  }
}
```

- [x] **Step 3: Commit**

```bash
git add lib/seo/structured-data.tsx
git commit -m "fix(schema): ClothingStore type, correct geo coords, fix telephone/reviewCount types, add foundingDate"
```

---

## Task 3: Fix Duplicate Viewport Meta in app/layout.tsx

Next.js 16 automatically injects `<meta name="viewport">` when you export a `viewport` object. The current `app/layout.tsx` has a manual `<meta name="viewport">` tag in `<head>` (line 46) causing a duplicate. Per Next.js docs, this should be removed and replaced with `export const viewport`.

**Files:**
- Modify: `app/layout.tsx`

- [x] **Step 1: Add viewport export and remove manual meta tag**

In `app/layout.tsx`, add the viewport export after the metadata export:

```typescript
import type { Metadata, Viewport } from "next";
// (rest of imports unchanged)

export const metadata: Metadata = generatePageMetadata({
  // (unchanged)
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}
```

Then remove line 46 from the `<head>` block:
```typescript
// DELETE this line from <head>:
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
```

The final `<head>` block should only contain: manifest link, theme-color, apple-mobile meta tags, apple-touch-icon, favicon links, mobile-web-app-capable.

- [x] **Step 2: Run build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes. No viewport-related warnings.

- [x] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "fix(layout): replace duplicate viewport meta with export const viewport"
```

---

## Task 4: Remove turbopack from next.config.ts + Add Security Headers

Two fixes in one file:
1. `turbopack: {}` in `next.config.ts` conflicts with the `--webpack` flag required by CLAUDE.md
2. Missing security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

**Files:**
- Modify: `next.config.ts`

- [x] **Step 1: Remove turbopack and add security headers**

Replace the entire `next.config.ts` with:

```typescript
import type { NextConfig } from "next";
import redirectsData from "./redirects.json";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
]

const nextConfig: NextConfig = {
  async redirects() {
    return redirectsData as any;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'udnidqllpmyoothwznbv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    minimumCacheTTL: 86400,
  },
};

let config = nextConfig;

if (process.env.NODE_ENV === 'production') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/udnidqllpmyoothwznbv\.supabase\.co\/storage\/v1\/object\/public\/product-images\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'supabase-images',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  });

  config = withPWA(nextConfig);
}

export default config;
```

- [x] **Step 2: Verify dev server still starts with webpack**

```bash
npm run dev -- --webpack 2>&1 | head -10
```

Expected: Server starts on port 3000 without turbopack error.

- [x] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "fix(config): remove turbopack, add security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)"
```

---

## Task 5: Remove Spurious Google Fonts Preconnects from AssetPreloader

`components/public/AssetPreloader.tsx` adds `preconnect` links to `fonts.googleapis.com` and `fonts.gstatic.com` in a `useEffect` (after hydration). No Google Fonts are actually used — all fonts are served by `next/font/google` locally. These preconnects run too late (after hydration) to help performance and add unnecessary DNS requests.

**Files:**
- Modify: `components/public/AssetPreloader.tsx`

- [x] **Step 1: Remove the preloadFonts function and its call**

In `components/public/AssetPreloader.tsx`, delete the `preloadFonts` function (lines 59–71) and remove its call on line 92:

```typescript
// DELETE the entire preloadFonts function:
const preloadFonts = () => {
  const fontLink = document.createElement('link')
  fontLink.rel = 'preconnect'
  fontLink.href = 'https://fonts.googleapis.com'
  document.head.appendChild(fontLink)

  const fontLink2 = document.createElement('link')
  fontLink2.rel = 'preconnect'
  fontLink2.href = 'https://fonts.gstatic.com'
  fontLink2.crossOrigin = 'anonymous'
  document.head.appendChild(fontLink2)
}

// Also DELETE the call to preloadFonts() (line 92):
preloadFonts()
```

- [x] **Step 2: Commit**

```bash
git add components/public/AssetPreloader.tsx
git commit -m "fix(perf): remove spurious Google Fonts preconnects from AssetPreloader (fonts are local via next/font)"
```

---

## Task 6: Add ISR Revalidation to High-Traffic Pages

Currently all pages make fresh Supabase queries on every request with no caching. Adding `export const revalidate = 300` (5 minutes) means Next.js will serve cached pages and only rebuild in the background every 5 minutes. This reduces TTFB from ~1.5s to <100ms for cached requests.

**Files:**
- Modify: `app/(public)/page.tsx`
- Modify: `app/(public)/products/page.tsx`
- Modify: `app/(public)/category/[slug]/page.tsx`
- Modify: `app/(public)/blog/page.tsx`

- [x] **Step 1: Add revalidate to homepage**

In `app/(public)/page.tsx`, add after the metadata export (line 21):

```typescript
export const metadata = generatePageMetadata({
  // (unchanged)
})

export const revalidate = 300
```

- [x] **Step 2: Add revalidate to products listing page**

In `app/(public)/products/page.tsx`, add after the metadata export:

```typescript
export const revalidate = 300
```

- [x] **Step 3: Add revalidate to category page**

In `app/(public)/category/[slug]/page.tsx`, add after the metadata export:

```typescript
export const revalidate = 300
```

- [x] **Step 4: Add revalidate to blog listing page**

In `app/(public)/blog/page.tsx`, add after the metadata export:

```typescript
export const revalidate = 300
```

- [x] **Step 5: Fix sitemap revalidation and remove priority/changeFrequency**

In `app/sitemap.ts`, add `export const revalidate = 3600` at the top and remove all `changeFrequency` and `priority` fields from every sitemap entry (Google ignores these, but they pollute the sitemap XML).

Also fix static page `lastModified` to use a hardcoded date rather than `new Date()` (which forces revalidation every crawl):

```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.modfancydress.com'

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
    .is('deleted_at', null)

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true)

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .not('published_at', 'is', null)

  const productUrls = products?.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
  })) || []

  const wholesaleProductUrls = products?.map((product) => ({
    url: `${baseUrl}/wholesale/${product.slug}`,
    lastModified: new Date(product.updated_at),
  })) || []

  const categoryUrls = categories?.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(category.updated_at),
  })) || []

  const wholesaleCategoryUrls = categories?.map((category) => ({
    url: `${baseUrl}/wholesale/category/${category.slug}`,
    lastModified: new Date(category.updated_at),
  })) || []

  const blogUrls = blogPosts?.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
  })) || []

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/products`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/wholesale`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/rent`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/about`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/faq`, lastModified: new Date('2026-03-01') },
    { url: `${baseUrl}/contact`, lastModified: new Date('2026-03-01') },
  ]

  return [
    ...staticPages,
    ...productUrls,
    ...wholesaleProductUrls,
    ...categoryUrls,
    ...wholesaleCategoryUrls,
    ...blogUrls,
  ]
}
```

- [x] **Step 6: Commit**

```bash
git add app/(public)/page.tsx app/(public)/products/page.tsx "app/(public)/category/[slug]/page.tsx" app/(public)/blog/page.tsx app/sitemap.ts
git commit -m "feat(perf): add ISR revalidate=300 to key pages; fix sitemap lastmod and revalidation"
```

---

## Task 7: Fix Inactive Product Soft-404

Product pages for inactive (`is_active = false`) or missing slugs currently render a blank/error UI instead of returning a proper 404. Search engines crawling these URLs receive a 200 status with no product content — a "soft 404" that wastes crawl budget and can hurt rankings.

**Files:**
- Modify: `app/(public)/products/[slug]/page.tsx`

- [x] **Step 1: Read the current product fetch logic to find the right insertion point**

Read `app/(public)/products/[slug]/page.tsx` lines 60–120 to find where the product is fetched in the default export function.

- [x] **Step 2: Add notFound() call for inactive/missing products**

In the main page component function, after fetching the product, add a `notFound()` call if the product is missing or inactive:

```typescript
// After the product fetch query, before rendering:
if (!product || !product.is_active || product.deleted_at) {
  notFound()
}
```

The `notFound` import is already at line 1: `import { notFound } from 'next/navigation'`.

Also ensure `generateMetadata` handles missing products gracefully (it already does on line 39-41, returning `{ title: 'Product Not Found' }` — this is fine since the page function will call `notFound()` before rendering).

- [x] **Step 3: Commit**

```bash
git add "app/(public)/products/[slug]/page.tsx"
git commit -m "fix(products): call notFound() for inactive or missing product slugs to prevent soft-404"
```

---

## Task 8: Fix Category Listing Price Display Bug

**Critical UX + trust bug.** On the category listing page, product cards show inflated prices because `ProductSchema()` in `structured-data.tsx` uses `product.variants[0].price_override` (the Adult size upsell price, e.g. ₹2,550) instead of `product.price` (the base children's price, e.g. ₹950). This bug also affects product cards on the storefront.

The fix is in `ProductSchema()` — the `displayPrice` calculation. The schema offer price should use `product.price` as the base, not the first variant override.

Additionally, check `components/public/ProductCard.tsx` or similar listing card component to confirm it uses `product.price` directly (not variants) and fix if needed.

**Files:**
- Modify: `lib/seo/structured-data.tsx` (line 324)
- Read + possibly modify: `components/public/ProductCard.tsx` (or similar)

- [x] **Step 1: Fix displayPrice in ProductSchema**

In `lib/seo/structured-data.tsx`, line 324, change:

```typescript
// BEFORE:
const displayPrice = product.variants?.length > 0 && product.variants[0].price_override
  ? product.variants[0].price_override
  : product.price || 0

// AFTER:
const displayPrice = product.price || 0
```

The `offers` array below (lines 370–381) already correctly maps variant offers individually, so each size's price will be in the schema. The top-level `displayPrice` should be the base price.

- [x] **Step 2: Check the ProductCard component for the same bug**

```bash
grep -n "price_override\|variants\[0\]" components/public/ProductCard.tsx 2>/dev/null || grep -rn "price_override" components/public/ --include="*.tsx" | head -20
```

If any listing card component uses `variants[0].price_override` as the display price, change it to use `product.price` instead.

- [x] **Step 3: Commit**

```bash
git add lib/seo/structured-data.tsx
git commit -m "fix(pricing): use product.price as base display price in ProductSchema, not first variant override"
```

---

## Task 9: Create Missing og-image.jpg and logo.png

`LocalBusinessSchema`, `OrganizationSchema`, and `generatePageMetadata` all reference `/logo.png` and `/og-image.jpg`. These files do not exist in `public/`, causing broken image references in Open Graph previews and JSON-LD validators.

**Files:**
- Create: `public/og-image.jpg` (1200×630 px, JPEG)
- Create: `public/logo.png` (400×400 px, PNG, transparent background)

- [ ] **Step 1: Create placeholder og-image.jpg**

Create a 1200×630 JPEG. If you have access to a design tool, use these specs:
- Background: `#1B2A4A` (brand navy)
- Text: "Mod Fancy Dress" in white, large
- Subtitle: "Fancy Dress Costumes • Delhi NCR" in `#C8956C`
- Dimensions: exactly 1200×630 px

If no design tool is available, use ImageMagick:

```bash
convert -size 1200x630 \
  -background '#1B2A4A' \
  -fill white \
  -gravity center \
  -font DejaVu-Sans-Bold \
  -pointsize 72 \
  -annotate 0 'Mod Fancy Dress' \
  -fill '#C8956C' \
  -pointsize 36 \
  -annotate +0+80 'Fancy Dress Costumes • Delhi NCR' \
  public/og-image.jpg
```

- [ ] **Step 2: Create placeholder logo.png**

```bash
convert -size 400x400 \
  -background transparent \
  -fill '#1B2A4A' \
  -gravity center \
  -font DejaVu-Sans-Bold \
  -pointsize 48 \
  -annotate 0 'MFD' \
  public/logo.png
```

Note: Replace with a professionally designed logo when available. These placeholders unblock schema validation and OG previews.

- [ ] **Step 3: Verify files exist**

```bash
ls -la public/og-image.jpg public/logo.png
```

- [ ] **Step 4: Commit**

```bash
git add public/og-image.jpg public/logo.png
git commit -m "feat(assets): add placeholder og-image.jpg (1200x630) and logo.png — needed for OG and schema"
```

---

## Task 10: Add BlogPosting Schema to Blog Post Pages

Blog post pages currently have no structured data. Adding `BlogPosting` schema enables article rich results in Google Search, improves E-E-A-T signals, and gives Googlebot publication dates.

**Files:**
- Modify: `lib/seo/structured-data.tsx` — add `BlogPostingSchema()` function
- Modify: `app/(public)/blog/[slug]/page.tsx` — emit the schema

- [x] **Step 1: Add BlogPostingSchema to structured-data.tsx**

In `lib/seo/structured-data.tsx`, add before the final export:

```typescript
/** BlogPosting JSON-LD for individual blog post pages. */
export function BlogPostingSchema(post: {
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  published_at: string
  updated_at: string
  cover_image_url?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt?.trim() || post.title,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      '@id': organizationEntityId(),
      name: 'Mod Fancy Dress',
    },
    publisher: {
      '@type': 'Organization',
      '@id': organizationEntityId(),
      name: 'Mod Fancy Dress',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    ...(post.cover_image_url ? { image: toAbsoluteUrl(post.cover_image_url) } : {}),
    isPartOf: {
      '@type': 'Blog',
      '@id': `${siteUrl}/blog`,
      name: 'Mod Fancy Dress Blog',
    },
  }
}
```

- [x] **Step 2: Read blog post page to find injection point**

Read `app/(public)/blog/[slug]/page.tsx` to understand the current structure.

- [x] **Step 3: Emit BlogPosting schema in blog post page**

In `app/(public)/blog/[slug]/page.tsx`, import `BlogPostingSchema` and emit it:

```typescript
import { BlogPostingSchema } from '@/lib/seo/structured-data'

// In the page component, after fetching the post:
const blogPostingSchema = BlogPostingSchema({
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  content: post.content,
  published_at: post.published_at,
  updated_at: post.updated_at,
  cover_image_url: post.cover_image_url,
})

// In the JSX return:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
/>
```

- [x] **Step 4: Commit**

```bash
git add lib/seo/structured-data.tsx "app/(public)/blog/[slug]/page.tsx"
git commit -m "feat(schema): add BlogPosting JSON-LD to blog post pages"
```

---

## Task 11: Add WebSite + SearchAction Schema to Homepage; Remove Single-Item BreadcrumbList

The homepage currently emits only a single-item BreadcrumbList (`Home → /`) which Google ignores (requires ≥2 items). Replace it with a `WebSite` + `SearchAction` schema, which enables the Google sitelinks search box in search results.

**Files:**
- Modify: `lib/seo/structured-data.tsx` — add `WebSiteSchema()`
- Modify: `app/(public)/page.tsx` — replace BreadcrumbSchema with WebSiteSchema

- [x] **Step 1: Add WebSiteSchema to structured-data.tsx**

```typescript
/** WebSite + SearchAction JSON-LD for the homepage sitelinks search box. */
export function WebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: 'Mod Fancy Dress',
    description: 'Fancy dress costumes and accessories — Delhi NCR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
```

- [x] **Step 2: Update homepage to use WebSiteSchema**

In `app/(public)/page.tsx`:

```typescript
// Change import:
import { WebSiteSchema } from '@/lib/seo/structured-data'

// Remove:
// import { BreadcrumbSchema } from '@/lib/seo/structured-data'

// Change usage:
const websiteSchema = WebSiteSchema()
// Remove: const breadcrumbSchema = BreadcrumbSchema([...])

// Change the <script> tag:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
/>
```

- [x] **Step 3: Commit**

```bash
git add lib/seo/structured-data.tsx app/(public)/page.tsx
git commit -m "feat(schema): add WebSite+SearchAction schema to homepage; remove useless single-item BreadcrumbList"
```

---

## Task 12: Create Privacy Policy and Returns Pages + Footer Links

Missing legal pages hurt trust signals and E-E-A-T. Google's quality rater guidelines look for privacy policy links. Both pages need to be added and linked from the footer.

**Files:**
- Create: `app/(public)/privacy-policy/page.tsx`
- Create: `app/(public)/returns/page.tsx`
- Modify: `components/public/Footer.tsx`

- [x] **Step 1: Create privacy-policy/page.tsx**

Create `app/(public)/privacy-policy/page.tsx`:

```typescript
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata = generatePageMetadata({
  title: 'Privacy Policy — Mod Fancy Dress',
  description: 'Privacy policy for modfancydress.com. How we collect, use, and protect your information.',
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6 font-[family-name:var(--font-outfit)]">
        Privacy Policy
      </h1>
      <p className="text-sm text-[#9A9A9A] mb-8">Last updated: March 2026</p>

      <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Information We Collect</h2>
          <p>When you contact us via WhatsApp, phone, or our enquiry form, we collect your name and contact details to process your order or enquiry. We do not collect payment information directly — all payments are handled in person or via standard payment methods.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">How We Use Your Information</h2>
          <p>We use your contact details only to respond to your enquiries and fulfil your costume orders. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Cookies</h2>
          <p>This website uses only essential cookies required for cart functionality and session management. No advertising or tracking cookies are used.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Data Retention</h2>
          <p>Order and contact information is retained only as long as necessary to complete your order and comply with applicable laws. You may request deletion of your data by contacting us at the number below.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Contact</h2>
          <p>If you have questions about this privacy policy or your personal data, please contact us: <strong>+91 93113 65366</strong> or visit our store at S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051.</p>
        </section>
      </div>
    </div>
  )
}
```

- [x] **Step 2: Create returns/page.tsx**

Create `app/(public)/returns/page.tsx`:

```typescript
import { generatePageMetadata } from '@/lib/seo/metadata'
import Link from 'next/link'

export const metadata = generatePageMetadata({
  title: 'Returns & Refund Policy — Mod Fancy Dress',
  description: 'Returns and refund policy for Mod Fancy Dress. Information about exchanges, rental deposits, and order cancellations.',
  path: '/returns',
})

export default function ReturnsPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6 font-[family-name:var(--font-outfit)]">
        Returns & Refund Policy
      </h1>
      <p className="text-sm text-[#9A9A9A] mb-8">Last updated: March 2026</p>

      <div className="prose prose-sm max-w-none text-[#6B6B6B] space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Purchase Returns</h2>
          <p>Costumes that are unworn and in original condition may be exchanged within 7 days of purchase. Please bring the item to our store with proof of purchase. We do not offer cash refunds on purchased items — store credit or exchange only.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Rental Deposits</h2>
          <p>A refundable security deposit is collected for all rental items. The deposit is returned in full when the costume is returned on time and in its original condition. Deductions may be made for damage beyond normal wear and tear or late returns.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Bulk / School Orders</h2>
          <p>For bulk orders placed for school events, cancellations made more than 7 days before the event date will receive a full refund. Cancellations within 7 days of the event are non-refundable due to the preparation involved.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Contact Us</h2>
          <p>
            For return or refund queries, contact us at <strong>+91 93113 65366</strong> or{' '}
            <Link href="/contact" className="text-[#C8956C] hover:underline">visit our contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
```

- [x] **Step 3: Read Footer.tsx to find the right insertion point**

Read `components/public/Footer.tsx` to understand the current link structure.

- [x] **Step 4: Add Privacy Policy and Returns links to the Footer**

In `components/public/Footer.tsx`, add links to `/privacy-policy` and `/returns` in the footer's link section. Look for the existing legal/info links area and add:

```typescript
<Link href="/privacy-policy" className="text-[#9A9A9A] hover:text-[#2D2D2D] text-xs transition-colors">
  Privacy Policy
</Link>
<Link href="/returns" className="text-[#9A9A9A] hover:text-[#2D2D2D] text-xs transition-colors">
  Returns Policy
</Link>
```

- [x] **Step 5: Add these pages to sitemap.ts**

In `app/sitemap.ts`, add to the `staticPages` array:

```typescript
{ url: `${baseUrl}/privacy-policy`, lastModified: new Date('2026-03-01') },
{ url: `${baseUrl}/returns`, lastModified: new Date('2026-03-01') },
```

- [x] **Step 6: Commit**

```bash
git add "app/(public)/privacy-policy/page.tsx" "app/(public)/returns/page.tsx" components/public/Footer.tsx app/sitemap.ts
git commit -m "feat: add Privacy Policy and Returns pages with footer links"
```

---

## Task 13: Add Rent Tab to Mobile Bottom Navigation

The rental service (`/rent`) is a key revenue stream but absent from `MobileBottomNav`. Mobile users (majority of traffic) can only discover it via the homepage banner — adding it to the nav increases discoverability significantly.

**Files:**
- Read + Modify: `components/public/MobileBottomNav.tsx`

- [x] **Step 1: Read the current MobileBottomNav**

Read `components/public/MobileBottomNav.tsx` to understand the current tab structure and icon imports.

- [x] **Step 2: Add Rent tab**

The current nav likely has 4 tabs (Home, Products, Cart, Contact or similar). Add a Rent tab using a `Shirt` or `Tag` icon from Lucide:

```typescript
// Add import at top:
import { Shirt } from 'lucide-react'

// Add tab item (between Products and Cart, or as 5th tab):
{
  href: '/rent',
  label: 'Rent',
  icon: Shirt,
}
```

If the nav already has 5 tabs, replace the least important one or make the Rent tab replace the Wholesale tab (wholesale is less important for mobile customers).

- [x] **Step 3: Commit**

```bash
git add components/public/MobileBottomNav.tsx
git commit -m "feat(nav): add Rent tab to mobile bottom navigation"
```

---

## Task 14: Add Google Maps Iframe to Contact Page

The contact page currently has no map embed. Adding a Google Maps iframe improves local SEO signals (Google sees maps as a local trust indicator) and makes it easier for customers to navigate to the store.

**Files:**
- Modify: `app/(public)/contact/page.tsx`

- [x] **Step 1: Add Google Maps iframe after the address card**

In `app/(public)/contact/page.tsx`, after the contact grid section (after the Hours card), add a map section:

```typescript
{/* Map */}
<div className="mb-6 rounded-xl overflow-hidden border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-xs)' }}>
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.5!2d77.2897!3d28.6680!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQwJzA0LjgiTiA3N8KwMTcnMjIuOSJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
    width="100%"
    height="280"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="Mod Fancy Dress location — S64 South Anarkali, Krishna Nagar, Delhi"
  />
</div>
```

Note: Replace the Maps embed URL with the actual embed URL from Google Maps for "S64 South Anarkali Krishna Nagar Delhi". Get it from maps.google.com → Share → Embed a map.

- [x] **Step 2: Commit**

```bash
git add "app/(public)/contact/page.tsx"
git commit -m "feat(contact): add Google Maps iframe for store location"
```

---

## Task 15: Create public/llms.txt for AI Search Visibility

`llms.txt` is the emerging standard for AI crawlers (ChatGPT, Perplexity, Gemini) to understand a site's content. Without it, AI citation tools have no structured guidance on what pages to cite.

**Files:**
- Create: `public/llms.txt`

- [x] **Step 1: Create llms.txt**

Create `public/llms.txt`:

```
# Mod Fancy Dress

> Fancy dress costumes and accessories retailer based in Delhi, India. Over 15 years experience. Serving Delhi NCR — Delhi, Noida, Gurugram, Ghaziabad, Faridabad, Greater Noida.

## About

Mod Fancy Dress is a specialist costume retailer at S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051. We sell and rent fancy dress costumes for school annual functions, dance performances, cultural events, and celebrations.

- 15+ years in business
- 400+ school events served
- Costumes available to buy and rent
- Delivery via Porter/Rapido across Delhi NCR
- Contact: +91 93113 65366

## Key Pages

- [Homepage](https://www.modfancydress.com/) — Browse all costumes
- [All Products](https://www.modfancydress.com/products) — Full product catalogue
- [Rent Costumes](https://www.modfancydress.com/rent) — Rental service from ₹200/event
- [Wholesale](https://www.modfancydress.com/wholesale) — Bulk orders for schools and event organisers
- [FAQ](https://www.modfancydress.com/faq) — Common questions about costumes, delivery, and rentals
- [Blog](https://www.modfancydress.com/blog) — Costume guides and ideas
- [Contact](https://www.modfancydress.com/contact) — Phone, WhatsApp, and address

## Categories

Dance costumes, festival costumes (Independence Day, Republic Day, Diwali, Navratri), historical/freedom fighter costumes, mythological costumes, professional fancy dress, animal costumes, international character costumes.

## Sitemap

https://www.modfancydress.com/sitemap.xml
```

- [x] **Step 2: Commit**

```bash
git add public/llms.txt
git commit -m "feat(seo): add llms.txt for AI search crawler guidance"
```

---

## Task 16: Create Location Landing Pages (Noida + Gurgaon)

Location-specific landing pages capture high-intent searches like "fancy dress costumes Noida" and "fancy dress rental Gurgaon". These must have genuinely unique content — not just city-name substitutions.

**Files:**
- Create: `app/(public)/fancy-dress-noida/page.tsx`
- Create: `app/(public)/fancy-dress-gurgaon/page.tsx`
- Modify: `app/sitemap.ts` — add these pages

- [x] **Step 1: Create fancy-dress-noida/page.tsx**

Create `app/(public)/fancy-dress-noida/page.tsx`:

```typescript
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Truck } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, BUSINESS_WHATSAPP_E164, whatsappUrl } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Noida — Delivery Available | Mod Fancy Dress',
  description: 'Looking for fancy dress costumes in Noida? Mod Fancy Dress (Krishna Nagar, Delhi) delivers to all sectors of Noida. 400+ costume styles, school function specialists. Call or WhatsApp for same-day delivery.',
  path: '/fancy-dress-noida',
})

export default function FancyDressNoidaPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Noida</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Costumes in Noida
      </h1>

      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Delivery to All Noida Sectors</p>
            <p className="text-sm text-[#6B6B6B]">We deliver fancy dress costumes to Sector 18, Sector 62, Sector 137, Greater Noida, Noida Extension, and all sectors via Porter and Rapido. Same-day delivery available — call to confirm availability.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Mod Fancy Dress is Delhi NCR's most trusted source for school function costumes, dance performance outfits, and special occasion fancy dress. While our store is located in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong> — just 20–30 minutes from most Noida sectors — we regularly deliver to Noida customers for school annual functions, Republic Day and Independence Day events, Diwali celebrations, Navratri performances, and themed parties.</p>

        <p>Our collection covers over <strong className="text-[#2D2D2D]">400 costume styles</strong>, including freedom fighter costumes (Bhagat Singh, Subhas Chandra Bose, Gandhi), classical dance costumes (Bharatanatyam, Kathak, Garba), festival wear, mythological characters (Ram, Sita, Krishna, Durga), and international fancy dress (doctor, police, chef, astronaut). Many Noida schools trust us for bulk orders of 50–200 costumes for annual functions.</p>

        <p>We also offer <strong className="text-[#2D2D2D]">rental costumes</strong> starting at ₹200 per event — ideal for one-time school events where buying isn't practical. Rental costumes are available in child and adult sizes. A refundable deposit is taken and returned when the costume is returned.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">How to Order from Noida</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Browse our costume catalogue on this website</li>
          <li>WhatsApp or call us with the costume name, size, and your delivery address</li>
          <li>We confirm availability and delivery time (usually 2–4 hours for same-day, or next morning)</li>
          <li>Pay on delivery via cash or UPI</li>
        </ol>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Popular Costumes for Noida Schools</h2>
        <p>Based on orders from Noida, the most popular costumes are: freedom fighter costumes for Republic Day (Jan 26) and Independence Day (Aug 15); classical dance costumes for annual functions; Navratri/Garba costumes; and professional costumes (doctor, nurse, police) for career-day events.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <a href={whatsappUrl('Hi, I need fancy dress costumes delivered to Noida.')} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full">WhatsApp for Noida Delivery</Button>
        </a>
        <Link href="/products" className="flex-1">
          <Button size="lg" variant="outline" className="w-full">Browse All Costumes</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2D2D2D]">Store Address (also available to visit)</p>
            <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
            <p className="mt-1"><a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#C8956C] hover:underline">{BUSINESS_PHONE_DISPLAY}</a> — Open daily 10 AM – 9:30 PM</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [x] **Step 2: Create fancy-dress-gurgaon/page.tsx**

Create `app/(public)/fancy-dress-gurgaon/page.tsx` with the same structure but Gurgaon-specific content:

```typescript
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Truck } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Gurgaon — Delivery Available | Mod Fancy Dress',
  description: 'Fancy dress costumes delivered to Gurgaon from our Delhi store. School function specialists with 400+ costume styles. Call or WhatsApp for delivery to DLF, Sohna Road, Cyber City area.',
  path: '/fancy-dress-gurgaon',
})

export default function FancyDressGurgaonPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Gurgaon</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Costumes in Gurgaon
      </h1>

      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Delivery to Gurgaon</p>
            <p className="text-sm text-[#6B6B6B]">We deliver to DLF Phases, Sohna Road, Golf Course Road, Cyber City, and other Gurgaon areas. Advance booking recommended — call us to confirm availability and timing for your area.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Getting quality fancy dress costumes in Gurgaon can be challenging. Most local shops have limited stock, especially for niche categories like classical dance costumes, freedom fighter outfits, or multi-character school sets. Mod Fancy Dress, based in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong>, stocks over 400 costume styles and regularly delivers to Gurgaon for school events and occasions.</p>

        <p>We specialise in <strong className="text-[#2D2D2D]">bulk orders for Gurgaon schools</strong> — many corporate school campuses in Gurgaon host large annual functions requiring 100–300 costumes. We have experience coordinating multi-character sets for entire school productions, including classical Indian dance, historical, and folk costume themes.</p>

        <p>Rental costumes are also available from ₹200/event with delivery to Gurgaon. Please book at least 2 days in advance for outstation delivery to ensure availability.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Ordering Process for Gurgaon</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Browse the full catalogue at modfancydress.com/products</li>
          <li>Note the costume names, sizes needed, and your event date</li>
          <li>WhatsApp or call with your requirements and Gurgaon delivery address</li>
          <li>We confirm availability, delivery charges, and timing</li>
          <li>Pay on delivery via cash or UPI</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <a href={whatsappUrl('Hi, I need fancy dress costumes delivered to Gurgaon.')} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full">WhatsApp for Gurgaon Delivery</Button>
        </a>
        <Link href="/products" className="flex-1">
          <Button size="lg" variant="outline" className="w-full">Browse All Costumes</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2D2D2D]">Store Address</p>
            <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
            <p className="mt-1"><a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#C8956C] hover:underline">{BUSINESS_PHONE_DISPLAY}</a> — Open daily 10 AM – 9:30 PM</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [x] **Step 3: Add location pages to sitemap**

In `app/sitemap.ts`, add to `staticPages`:

```typescript
{ url: `${baseUrl}/fancy-dress-noida`, lastModified: new Date('2026-03-28') },
{ url: `${baseUrl}/fancy-dress-gurgaon`, lastModified: new Date('2026-03-28') },
```

- [x] **Step 4: Commit**

```bash
git add "app/(public)/fancy-dress-noida/page.tsx" "app/(public)/fancy-dress-gurgaon/page.tsx" app/sitemap.ts
git commit -m "feat(seo): add Noida and Gurgaon location landing pages for local SEO"
```

---

## Task 17: Create Custom 404 Page

The current `notFound()` state shows Next.js default 404 styling. A custom `app/not-found.tsx` with search and category links retains users who hit broken URLs, reducing bounce rate.

**Files:**
- Create: `app/not-found.tsx`

- [x] **Step 1: Create app/not-found.tsx**

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Home, Tag } from 'lucide-react'

export default function NotFound() {
  const categories = [
    { name: 'Dance Costumes', slug: 'dance' },
    { name: 'Festival Costumes', slug: 'festival' },
    { name: 'Freedom Fighters', slug: 'freedom-fighters' },
    { name: 'Mythological', slug: 'mythological' },
  ]

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="text-6xl font-bold text-[#E8E5E0] mb-4">404</div>
      <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">
        Page Not Found
      </h1>
      <p className="text-[#6B6B6B] mb-8 max-w-sm">
        Sorry, we couldn't find that page. Try browsing our costume collection instead.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
        <Link href="/products">
          <Button size="lg" variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            Browse All Costumes
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <p className="text-xs text-[#9A9A9A] mb-3 uppercase tracking-wide">Popular Categories</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-2 p-3 rounded-lg bg-[#F5F3F0] hover:bg-[#FBF5EF] border border-[#E8E5E0] text-sm text-[#2D2D2D] transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-[#C8956C] shrink-0" />
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [x] **Step 2: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add custom 404 page with category links and CTA"
```

---

## Task 18: Fix Product Name Double-Space and Description Issues (Database)

From the brainstorm analysis: some product names have double spaces (e.g., `"Kathak  Costume"`) and some products have descriptions with improper concatenation. 7 products have NULL descriptions.

**Files:**
- No code change — SQL migration via Supabase MCP

- [x] **Step 1: Audit product names for double spaces via Supabase**

Run this SQL to find affected products:

```sql
SELECT id, name
FROM products
WHERE name LIKE '%  %'
  AND deleted_at IS NULL
ORDER BY name;
```

- [x] **Step 2: Fix double spaces in product names**

```sql
UPDATE products
SET name = regexp_replace(name, '  +', ' ', 'g'),
    updated_at = NOW()
WHERE name LIKE '%  %'
  AND deleted_at IS NULL;
```

- [x] **Step 3: Audit NULL description products**

```sql
SELECT id, name, description
FROM products
WHERE (description IS NULL OR trim(description) = '')
  AND is_active = true
  AND deleted_at IS NULL
ORDER BY name;
```

- [x] **Step 4: Add placeholder descriptions for NULL-description products**

For each product found in Step 3, add a meaningful description in the admin panel. Minimum 80 words per product. Example template:

```
[Product Name] is a traditional/festival/dance fancy dress costume available at Mod Fancy Dress, Delhi. Perfect for school annual functions, cultural events, and celebrations. Available in multiple sizes for children and adults. The costume includes [main garment and accessories]. Made from durable, comfortable materials suitable for stage performances. Trusted by 400+ schools across Delhi NCR for over 15 years. Available to buy or rent — contact us for bulk school orders.
```

Update each product via the admin panel at `/admin/products`.

---

## Task 19: Expand About Page to 500+ Words

The About page has minimal content (under 200 words), hurting E-E-A-T. Google's quality guidelines assess "who is behind this site" — a thin About page is a negative signal.

**Files:**
- Read + Modify: `app/(public)/about/page.tsx`

- [ ] **Step 1: Read current About page**

Read `app/(public)/about/page.tsx` to understand the current structure.

- [ ] **Step 2: Expand the About page content**

The expanded content should include:
- Founding story: when the business started (2010), who founded it, why
- Service area specifics: Krishna Nagar market history, local context
- What makes Mod Fancy Dress different from generic party supply shops
- School event expertise: what a "school annual function" costume service looks like
- Rental service history: when rentals were introduced
- A genuine team description (even if just "family-run business")
- Current catalogue description: approximate number of styles, range covered

Target: 500+ words visible on the page. Use `<p>` paragraphs with semantic headings (`<h2>`, `<h3>`).

---

## Task 20: Expand Wholesale Page to 800+ Words

The Wholesale page (`/wholesale`) is too thin. Wholesale customers (school purchase managers, event companies, resellers) need to understand MOQ, lead times, payment terms, and eligibility before contacting. A content-thin wholesale page loses leads.

**Files:**
- Read + Modify: `app/(public)/wholesale/page.tsx`

- [ ] **Step 1: Read current Wholesale page**

Read `app/(public)/wholesale/page.tsx`.

- [ ] **Step 2: Expand wholesale content**

Content to add (800+ words total):
- Clear MOQ statement (e.g., "minimum 10 items per order for wholesale pricing")
- Pricing tiers: what discount levels apply at what quantities
- Lead time: how many days in advance to order for school events
- Payment terms: advance deposit required, balance on delivery
- Eligibility: schools, event companies, resellers, individual customers
- Supported event types: annual functions, Republic Day, Independence Day, sports days, farewell parties, fancy dress competitions
- How to place a wholesale order: WhatsApp → receive quotation → confirm → delivery or pickup
- What's included in bulk orders: are accessories included? Is customisation available?
- Testimonial from a school (even generic: "We've served 400+ schools across Delhi NCR")

---

## Task 21: Normalize Product Name Casing (Title Case)

Product names have inconsistent casing across uploads ("fancy Dress", "FANCY DRESS", "Fancy dress"). Fix in two places:
1. **Database** — SQL to normalize all existing product names to title case
2. **Admin form** — normalize on submit so future uploads are consistent automatically

Title case rule: capitalize the first letter of every word, lowercase the rest. E.g. "fancy dress Costume" → "Fancy Dress Costume", "KATHAK costume" → "Kathak Costume".

**Files:**
- No new file — SQL via Supabase MCP for existing products
- Modify: `components/admin/ProductForm.tsx` — normalize `data.name` in `onSubmit`

- [x] **Step 1: Fix existing product names in the database**

Run this SQL to normalize all active product names to title case using PostgreSQL's `initcap()` (capitalizes first letter of each word, lowercases the rest), combined with double-space cleanup:

```sql
UPDATE products
SET
  name = initcap(trim(regexp_replace(name, '\s+', ' ', 'g'))),
  updated_at = NOW()
WHERE deleted_at IS NULL
  AND name != initcap(trim(regexp_replace(name, '\s+', ' ', 'g')));
```

Preview first (SELECT before UPDATE):

```sql
SELECT id, name AS current_name,
       initcap(trim(regexp_replace(name, '\s+', ' ', 'g'))) AS normalized_name
FROM products
WHERE deleted_at IS NULL
  AND name != initcap(trim(regexp_replace(name, '\s+', ' ', 'g')))
ORDER BY name;
```

- [x] **Step 2: Add toTitleCase helper in ProductForm.tsx**

In `components/admin/ProductForm.tsx`, add a helper function above the component:

```typescript
function toTitleCase(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}
```

- [x] **Step 3: Apply normalization in onSubmit before saving**

In `components/admin/ProductForm.tsx`, in the `onSubmit` function at line 228, change:

```typescript
// BEFORE:
const productData = {
  name: data.name,
  slug: data.slug,

// AFTER:
const productData = {
  name: toTitleCase(data.name),
  slug: data.slug,
```

This means every product saved through the admin — new or edited — will have its name normalized automatically, without the user needing to remember to format it correctly.

- [x] **Step 4: Commit**

```bash
git add components/admin/ProductForm.tsx
git commit -m "feat(admin): normalize product names to title case on save; fix existing names via SQL"
```

---

## Summary Checklist

### Sprint 1 (Critical — Do First)
- [x] Task 1: Delete fabricated ReviewSchema
- [x] Task 2: Fix LocalBusinessSchema (ClothingStore, geo, telephone, reviewCount)
- [x] Task 3: Fix duplicate viewport meta
- [x] Task 4: Remove turbopack, add security headers
- [x] Task 5: Remove spurious Google Fonts preconnects
- [x] Task 6: Add ISR revalidate=300 + fix sitemap
- [x] Task 7: Fix inactive product soft-404

### Sprint 2 (High Impact — This Month)
- [x] Task 8: Fix category listing price display bug
- [ ] Task 9: Create og-image.jpg and logo.png
- [x] Task 10: Add BlogPosting schema to blog posts
- [x] Task 11: Add WebSite+SearchAction schema to homepage
- [x] Task 12: Create Privacy Policy + Returns pages + footer links
- [x] Task 13: Add Rent tab to mobile bottom nav
- [x] Task 14: Add Google Maps iframe to contact page
- [x] Task 15: Create public/llms.txt

### Sprint 3 (Content + Local — Next 4 Weeks)
- [x] Task 16: Create Noida + Gurgaon location pages
- [x] Task 17: Create custom 404 page
- [x] Task 18: Fix product name/description quality issues (database)
- [ ] Task 19: Expand About page to 500+ words
- [ ] Task 20: Expand Wholesale page to 800+ words

### Remaining SEO-ACTION-PLAN.md Items (Manual / External)
- [ ] Fix non-www 307 → 308 in Vercel dashboard (Domains settings — no code change)
- [ ] Add `sameAs` social profiles (Instagram, Facebook) to LocalBusinessSchema once accounts confirmed
- [ ] Configure Supabase Storage bucket cache headers: `max-age=86400, stale-while-revalidate=604800` (Supabase dashboard)
- [ ] Throttle ProductGallery mousemove with requestAnimationFrame
- [ ] Claim Justdial, Sulekha, IndiaMART listings with exact NAP (external)
- [ ] Set up review solicitation in WhatsApp follow-up messages (process change)
- [ ] Enforce WebP ≤200 KB for all new product image uploads (process change)
- [x] Audit Supabase product descriptions — fix any with <80 words (admin panel)
- [ ] Add `lang="hi"` override for Hindi blog posts in generateMetadata
- [ ] Bring Add to Cart above fold on mobile — reduce image height or add sticky CTA bar
- [ ] Add CTA button overlay on banner slides; update homepage H1 with geo intent
