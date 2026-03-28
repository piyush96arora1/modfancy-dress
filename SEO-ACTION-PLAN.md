# SEO Action Plan — modfancydress.com
**Generated:** 28 March 2026 | **Score:** 59/100

## Sprint 1 — This Week (Quick Wins)

- [ ] Delete `ReviewSchema()` fabricated reviews — `lib/seo/structured-data.tsx` + `app/(public)/contact/page.tsx`
- [ ] Create `public/og-image.jpg` (1200×630) and `public/logo.png`
- [ ] Fix GeoCoordinates to verified Krishna Nagar pin — `lib/seo/structured-data.tsx`
- [ ] Add `export const revalidate = 300` to homepage, category, blog listing pages
- [ ] Change `@type: 'LocalBusiness'` → `'ClothingStore'` — `structured-data.tsx` line 35
- [ ] Fix `telephone` from array `['+919311365366']` to string `'+919311365366'`
- [ ] Fix `reviewCount: "700"` → `700` (integer); same for `bestRating`, `worstRating`
- [ ] Add security headers to `next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)
- [ ] Fix duplicate viewport meta — remove from `app/layout.tsx`; use `export const viewport`
- [ ] Remove Google Fonts preconnects from `AssetPreloader.tsx`
- [ ] Remove `turbopack: {}` from `next.config.ts`; remove global `keywords` from `metadata.ts`
- [ ] Fix sitemap `lastmod` for static pages; add `export const revalidate = 3600` to sitemap route
- [ ] Fix inactive product soft-404 — call `notFound()` for missing/inactive slugs
- [ ] Fix duplicate rental FAQs in /faq data pipeline
- [ ] Remove `priority`/`changefreq` from all sitemap entries

## Sprint 2 — Next 2 Weeks (High Impact)

- [ ] Add Google Maps iframe to `/contact` page
- [ ] Add `media` attributes to banner preload `<link>` tags (viewport-conditional)
- [ ] Create `/privacy-policy` page + add to Footer
- [ ] Create `/returns` page + add to Footer and product pages
- [ ] Fix non-www 307 → 308 in Vercel dashboard (Domains settings)
- [ ] Expand `sameAs` — replace share URL with CID-based Maps URL + add social profiles
- [ ] Add `BlogPosting` schema to `app/(public)/blog/[slug]/page.tsx`
- [ ] Add `WebSite` + `SearchAction` schema to homepage; remove single-item BreadcrumbList
- [ ] Create `public/llms.txt`
- [ ] Configure Supabase Storage bucket cache: `max-age=86400, stale-while-revalidate=604800`
- [ ] Throttle `ProductGallery` mousemove with `requestAnimationFrame`
- [ ] Add `foundingDate` to `OrganizationSchema()`
- [ ] Fix product name double-space and description concatenation bug
- [ ] Bring Add to Cart above fold on mobile (reduce image height or sticky CTA bar)
- [ ] Move WhatsApp CTA higher on `/rent` page; add Rent to mobile bottom tab bar

## Sprint 3 — Month 1 (Content + Local)

- [ ] Expand About page to 500+ words with founder name, founding year, real history
- [ ] Expand Wholesale page to 800+ words (MOQ, lead times, payment, eligibility)
- [ ] Claim Justdial, Sulekha, IndiaMART listings with exact NAP
- [ ] Create `/fancy-dress-noida` location page (400+ words unique content)
- [ ] Create `/fancy-dress-gurgaon` location page (400+ words unique content)
- [ ] Add CTA button overlay on banner slides; update homepage H1 with geo intent
- [ ] Create custom `app/not-found.tsx` with search + category links
- [ ] Enforce WebP ≤200 KB for all new product image uploads
- [ ] Audit Supabase product descriptions — fix any with <80 words
- [ ] Add `lang="hi"` override for Hindi blog posts in `generateMetadata`
- [ ] Set up review solicitation in WhatsApp follow-up messages
