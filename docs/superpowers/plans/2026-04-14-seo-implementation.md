# SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical, high, and medium SEO issues identified across the technical audit, GEO audit, and local SEO audit to increase Google crawl coverage from 57 pages to 250+ pages and improve local + wholesale keyword visibility.

**Architecture:** Next.js 16 App Router site with Supabase backend. All SEO changes are in `app/` route files, `lib/seo/`, `components/public/Footer.tsx`, `next.config.ts`, and `public/`. No database changes required for any Phase 1–3 tasks.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, Tailwind CSS, Lucide React

**Run dev server to verify UI changes:** `npm run dev` → http://localhost:3000

---

## File Map

| File | Change |
|------|--------|
| `app/sitemap.ts` | Remove wholesale product URLs |
| `app/robots.ts` | Add /cart and /wholesale/enquiry to disallow |
| `app/not-found.tsx` | Export noindex metadata |
| `app/(public)/wholesale/[slug]/page.tsx` | Fix canonical path |
| `app/(public)/fancy-dress-noida/page.tsx` | Fix duplicate brand in title |
| `app/(public)/fancy-dress-gurgaon/page.tsx` | Fix duplicate brand in title |
| `app/(public)/fancy-dress-delhi/page.tsx` | Create new Delhi location page |
| `app/(public)/rent/page.tsx` | Add Service schema JSON-LD |
| `components/public/Footer.tsx` | Fix NAP comma, add social links |
| `next.config.ts` | Add CSP + HSTS headers |
| `public/llms.txt` | Create new file |
| `lib/seo/structured-data.tsx` | Add Person author to BlogPostingSchema |

---

## Phase 1 — Critical (Fix Crawl Issues)

These are the direct cause of Google crawling only 57 pages after 1 month. Do these first and redeploy immediately.

---

### Task 1: Remove wholesale product URLs from sitemap

**Files:**
- Modify: `app/sitemap.ts:66-73`

The sitemap currently submits every product twice (`/products/[slug]` and `/wholesale/[slug]`), totalling 1,200+ URLs — half are near-duplicates. Google identifies the pattern and stops crawling. Remove the wholesale product URLs; keep wholesale category URLs (they are genuinely different B2B landing pages).

- [ ] **Step 1: Edit sitemap.ts**

Open `app/sitemap.ts`. The return statement currently is:

```typescript
  return [
    ...staticPages,
    ...productUrls,
    ...wholesaleProductUrls,
    ...categoryUrls,
    ...wholesaleCategoryUrls,
    ...blogUrls,
  ]
```

Change it to:

```typescript
  return [
    ...staticPages,
    ...productUrls,
    ...categoryUrls,
    ...wholesaleCategoryUrls,
    ...blogUrls,
  ]
```

- [ ] **Step 2: Verify the variable `wholesaleProductUrls` is still defined above**

Lines 31–34 of the file define `wholesaleProductUrls`. Leave that variable defined — removing it from the return array is enough. The variable does no harm if unused.

- [ ] **Step 3: Verify the change**

Run: `npm run dev`
Navigate to: http://localhost:3000/sitemap.xml
Confirm: `/wholesale/odissi-fancy-dress` (or any wholesale product slug) does NOT appear. `/wholesale/category/dance-costume` (wholesale category) DOES appear.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts
git commit -m "fix(seo): remove wholesale product URLs from sitemap to stop crawl budget waste"
```

---

### Task 2: Fix wholesale product canonical to point to retail page

**Files:**
- Modify: `app/(public)/wholesale/[slug]/page.tsx:51-58`

The canonical on every `/wholesale/[slug]` page currently points to itself. Google sees two indexable pages with near-identical product content. The canonical must point to `/products/[slug]` so Google consolidates to the retail page.

- [ ] **Step 1: Edit the generateMetadata call**

In `app/(public)/wholesale/[slug]/page.tsx`, the `generateMetadata` function returns:

```typescript
    return generatePageMetadata({
        title: product.seo_title || wholesaleProductTitle(product.name),
        description,
        path: `/wholesale/${slug}`,
        image: getImageUrl(primaryImage?.image_url),
        type: 'product',
    })
```

Change `path: \`/wholesale/\${slug}\`` to `path: \`/products/\${slug}\``:

```typescript
    return generatePageMetadata({
        title: product.seo_title || wholesaleProductTitle(product.name),
        description,
        path: `/products/${slug}`,
        image: getImageUrl(primaryImage?.image_url),
        type: 'product',
    })
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Navigate to: http://localhost:3000/wholesale/odissi-fancy-dress
View page source (`Ctrl+U`), search for `canonical`.
Confirm: `<link rel="canonical" href="https://www.modfancydress.com/products/odissi-fancy-dress"/>` (retail URL, not wholesale).

- [ ] **Step 3: Commit**

```bash
git add app/(public)/wholesale/[slug]/page.tsx
git commit -m "fix(seo): wholesale product canonical now points to retail page"
```

---

### Task 3: Add noindex to 404 not-found page

**Files:**
- Modify: `app/not-found.tsx`

The 404 page currently has no metadata export, so it inherits `index: true, follow: true` from the root layout. Google may treat it as a soft 404 and attempt to index it. Adding `robots: { index: false }` prevents this.

- [ ] **Step 1: Add metadata export to not-found.tsx**

Open `app/not-found.tsx`. Add this import and export before the `export default function NotFound()` line:

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
```

The full file after edit:

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: {
    index: false,
    follow: false,
  },
}

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
        Sorry, we couldn&apos;t find that page. Try browsing our costume collection instead.
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

- [ ] **Step 2: Verify**

Run: `npm run dev`
Navigate to: http://localhost:3000/some-nonexistent-page
View source, search for `robots`.
Confirm: `<meta name="robots" content="noindex,nofollow"/>` is present.

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "fix(seo): add noindex to 404 page to prevent soft-404 indexing"
```

---

### Task 4: Block /cart and /wholesale/enquiry in robots.txt

**Files:**
- Modify: `app/robots.ts:17`

These pages waste crawl budget. `/cart` is a dynamic client-side page with no indexable content. `/wholesale/enquiry` is a form-only page not in the sitemap.

- [ ] **Step 1: Edit robots.ts**

Open `app/robots.ts`. Change the disallow array:

```typescript
        disallow: ['/admin/', '/api/'],
```

to:

```typescript
        disallow: ['/admin/', '/api/', '/cart', '/wholesale/enquiry'],
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Navigate to: http://localhost:3000/robots.txt
Confirm output includes:
```
Disallow: /admin/
Disallow: /api/
Disallow: /cart
Disallow: /wholesale/enquiry
```

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "fix(seo): block /cart and /wholesale/enquiry in robots.txt"
```

---

## Phase 2 — High Priority (Fix Within 1 Week)

---

### Task 5: Fix duplicate brand name in Noida and Gurgaon page titles

**Files:**
- Modify: `app/(public)/fancy-dress-noida/page.tsx:7-11`
- Modify: `app/(public)/fancy-dress-gurgaon/page.tsx:7-11`

The `generatePageMetadata` function automatically appends `| Mod Fancy Dress` to every title. Both location pages currently pass a title that already ends with `| Mod Fancy Dress`, producing the double: `"Fancy Dress Costumes in Noida — Delivery Available | Mod Fancy Dress | Mod Fancy Dress"`.

- [ ] **Step 1: Fix Noida page title**

In `app/(public)/fancy-dress-noida/page.tsx`, change:

```typescript
export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Noida — Delivery Available | Mod Fancy Dress',
```

to:

```typescript
export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Noida — Delivery Available',
```

- [ ] **Step 2: Fix Gurgaon page title**

In `app/(public)/fancy-dress-gurgaon/page.tsx`, change:

```typescript
export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Gurgaon — Delivery Available | Mod Fancy Dress',
```

to:

```typescript
export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Gurgaon — Delivery Available',
```

- [ ] **Step 3: Verify both pages**

Run: `npm run dev`
Navigate to: http://localhost:3000/fancy-dress-noida → view source → check `<title>` tag.
Expected: `Fancy Dress Costumes in Noida — Delivery Available | Mod Fancy Dress` (brand name appears once).
Repeat for: http://localhost:3000/fancy-dress-gurgaon

- [ ] **Step 4: Commit**

```bash
git add app/(public)/fancy-dress-noida/page.tsx app/(public)/fancy-dress-gurgaon/page.tsx
git commit -m "fix(seo): remove duplicate brand name from Noida and Gurgaon page titles"
```

---

### Task 6: Fix footer address NAP — add comma between Som Bazar and Krishna Nagar

**Files:**
- Modify: `components/public/Footer.tsx:86`

The `<address>` element in the footer renders "Som Bazar Krishna Nagar" without a comma when text is extracted. Google's entity resolution for NAP (Name, Address, Phone) matching requires punctuation to be consistent across all sources. The schema has a comma; the footer visual address does not.

- [ ] **Step 1: Edit Footer.tsx**

In `components/public/Footer.tsx` around line 85–88, change:

```tsx
                <address className="not-italic text-xs leading-relaxed">
                  S64, South Anarkali, Som Bazar<br />
                  Krishna Nagar, Delhi 110051
                </address>
```

to:

```tsx
                <address className="not-italic text-xs leading-relaxed">
                  S64, South Anarkali, Som Bazar,<br />
                  Krishna Nagar, Delhi 110051
                </address>
```

(Added comma after "Som Bazar" on the first line.)

- [ ] **Step 2: Verify**

Run: `npm run dev`
Visit any page and check the footer address. It should visually read:
```
S64, South Anarkali, Som Bazar,
Krishna Nagar, Delhi 110051
```

- [ ] **Step 3: Commit**

```bash
git add components/public/Footer.tsx
git commit -m "fix(seo): add comma to footer address for NAP consistency"
```

---

### Task 7: Create /fancy-dress-delhi location page

**Files:**
- Create: `app/(public)/fancy-dress-delhi/page.tsx`

Delhi is the primary market and physical store location, but there is no dedicated Delhi location page. "Fancy dress shop Delhi", "costume shop Delhi", "fancy dress Krishna Nagar" are the highest-value local keywords. This page must be 600+ words with Delhi-specific content (unlike the Noida/Gurgaon pages which are delivery-focused, this page emphasises the physical store).

- [ ] **Step 1: Create the page file**

Create `app/(public)/fancy-dress-delhi/page.tsx` with this content:

```typescript
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Phone } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Shop in Delhi — Krishna Nagar Store',
  description: 'Mod Fancy Dress is Delhi\'s most trusted fancy dress costume shop. Located in Krishna Nagar, East Delhi. 400+ costumes for school functions, dance performances, and events. Visit us or order online.',
  path: '/fancy-dress-delhi',
})

export default function FancyDressDelhiPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Delhi</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Shop in Delhi — Krishna Nagar
      </h1>

      {/* Store card */}
      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Physical Store — Open Daily</p>
            <p className="text-sm text-[#6B6B6B]">S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051. Open 10 AM – 9:30 PM, all 7 days. Visit us in person to try sizes and see the full collection.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Mod Fancy Dress has been Delhi's go-to costume shop for over <strong className="text-[#2D2D2D]">15 years</strong>. Our store in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong> stocks more than <strong className="text-[#2D2D2D]">400 fancy dress styles</strong> for children and adults — from classical Indian dance costumes and freedom fighter outfits to superhero costumes and international character dress. We have served <strong className="text-[#2D2D2D]">400+ school functions</strong> across Delhi NCR and hold over <strong className="text-[#2D2D2D]">700 Google reviews</strong> with a 4.7-star rating.</p>

        <p>Our store is easily accessible from most Delhi areas: <strong className="text-[#2D2D2D]">Krishna Nagar Metro Station</strong> (Blue Line) is a 5-minute walk. We regularly serve customers from East Delhi (Shahdara, Preet Vihar, Laxmi Nagar, Mayur Vihar), Central Delhi (Connaught Place, Karol Bagh), South Delhi (Saket, Hauz Khas, Greater Kailash), and North Delhi (Model Town, Pitampura, Rohini). Delivery is also available to all Delhi pin codes via Porter and Rapido.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">What We Stock</h2>
        <p>Our Delhi store stocks costumes across every category schools and events need:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[#2D2D2D]">Freedom Fighter costumes</strong> — Bhagat Singh, Subhas Chandra Bose, Gandhi, Lakshmibai, Sardar Patel. Most popular for Republic Day (26 Jan) and Independence Day (15 Aug).</li>
          <li><strong className="text-[#2D2D2D]">Classical dance costumes</strong> — Bharatanatyam, Kathak, Odissi, Garba, Kuchipudi. Available in multiple sizes for children from age 3 to adults.</li>
          <li><strong className="text-[#2D2D2D]">Mythological costumes</strong> — Krishna, Ram, Sita, Durga, Hanuman, Radha. Perfect for Janmashtami, Navratri, and school dramas.</li>
          <li><strong className="text-[#2D2D2D]">Professional costumes</strong> — Doctor, nurse, police, chef, scientist, astronaut. Used widely for career-day events and school functions.</li>
          <li><strong className="text-[#2D2D2D]">Fancy dress competition costumes</strong> — National leaders, world leaders, cartoon characters, animals, fruits, vegetables.</li>
          <li><strong className="text-[#2D2D2D]">Festival costumes</strong> — Navratri chaniya choli, Diwali traditional wear, Eid outfits, Christmas costumes.</li>
        </ul>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Buy or Rent — Both Available in Delhi</h2>
        <p>Delhi customers can both buy and rent from our Krishna Nagar store. <strong className="text-[#2D2D2D]">Purchase prices</strong> start from ₹350 for simple costumes and go up to ₹2,500 for elaborate classical dance sets. <strong className="text-[#2D2D2D]">Rental prices</strong> start at ₹200 per event — ideal for one-time occasions like school annual functions where buying is not practical. A refundable security deposit (₹500–₹2,000 depending on the costume) is taken and returned when you bring the costume back.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Bulk Orders for Delhi Schools</h2>
        <p>We specialise in bulk orders of 50–300 costumes for Delhi school annual functions. Schools from across Delhi — DPS, KV, Ryan International, DAV, and hundreds of local schools — have trusted us to supply matching sets for dance performances and dramatic presentations. Wholesale pricing is available for orders of 10 or more pieces of the same costume. Contact us on WhatsApp with your requirement and we will send you a price list within a few hours.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">How to Reach Our Krishna Nagar Store</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Take the Blue Line Metro to <strong className="text-[#2D2D2D]">Krishna Nagar Station</strong> — we are a 5-minute walk from Exit 2</li>
          <li>By road: Enter Krishna Nagar from the GT Road side, turn into South Anarkali market. Look for Mod Fancy Dress at S64, Som Bazar</li>
          <li>By auto or cab: Tell the driver "Som Bazar, South Anarkali, Krishna Nagar" — it is a well-known market</li>
          <li>Parking is available on the market street for two-wheelers. For cars, use the parking near Krishna Nagar Metro</li>
        </ol>
      </div>

      {/* Google Maps embed */}
      <div className="rounded-xl overflow-hidden border border-[#E8E5E0] mb-6" style={{ height: 280 }}>
        <iframe
          src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
          width="100%"
          height="280"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mod Fancy Dress store location — Krishna Nagar, Delhi"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <a href={whatsappUrl('Hi, I want to visit your Krishna Nagar store or order fancy dress costumes in Delhi.')} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full">WhatsApp Us</Button>
        </a>
        <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex-1">
          <Button size="lg" variant="outline" className="w-full gap-2">
            <Phone className="w-4 h-4" />
            {BUSINESS_PHONE_DISPLAY}
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#6B6B6B]">
        <div className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D2D2D]">Store Hours</p>
              <p>Open daily: 10:00 AM – 9:30 PM</p>
              <p className="text-xs text-[#9A9A9A] mt-1">Including Sundays and public holidays</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D2D2D]">Store Address</p>
              <address className="not-italic text-xs leading-relaxed">
                S64, South Anarkali, Som Bazar,<br />
                Krishna Nagar, Delhi 110051
              </address>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add to sitemap**

Open `app/sitemap.ts`. Add the Delhi page to `staticPages`:

```typescript
    { url: `${baseUrl}/fancy-dress-delhi`, lastModified: new Date('2026-04-14') },
```

Place it after the existing Gurgaon line (around line 63).

- [ ] **Step 3: Verify**

Run: `npm run dev`
Navigate to: http://localhost:3000/fancy-dress-delhi
Check: H1 shows, Maps embed loads, no console errors.
Check: http://localhost:3000/sitemap.xml includes `/fancy-dress-delhi`.

- [ ] **Step 4: Commit**

```bash
git add app/(public)/fancy-dress-delhi/page.tsx app/sitemap.ts
git commit -m "feat(seo): add /fancy-dress-delhi location page targeting Delhi store keywords"
```

---

### Task 8: Create public/llms.txt

**Files:**
- Create: `public/llms.txt`

The `llms.txt` standard (emerging 2025–2026) helps AI crawlers (ChatGPT, Perplexity, Claude) understand your site structure and key pages. It's a plain-text file served at `/llms.txt`. Quick win with no side effects.

- [ ] **Step 1: Create the file**

Create `public/llms.txt`:

```
# Mod Fancy Dress

> India's trusted fancy dress costume store. 15+ years experience, 400+ school functions served. Based in Krishna Nagar, Delhi — physical store open daily 10 AM to 9:30 PM. Serving Delhi, Noida, Gurgaon, Ghaziabad, Faridabad, Greater Noida. Buy, rent, or order wholesale fancy dress costumes.

## Key Pages
- [Home](https://www.modfancydress.com): Full costume catalog — kids, adults, school events
- [All Products](https://www.modfancydress.com/products): 400+ fancy dress costumes for sale
- [Fancy Dress on Rent](https://www.modfancydress.com/rent): Rental from ₹200/event, Delhi NCR delivery, refundable deposit
- [Wholesale Costumes](https://www.modfancydress.com/wholesale): Bulk orders for schools and events, up to 30% off retail
- [Fancy Dress in Delhi](https://www.modfancydress.com/fancy-dress-delhi): Physical store in Krishna Nagar, East Delhi
- [Fancy Dress in Noida](https://www.modfancydress.com/fancy-dress-noida): Delivery to all Noida sectors
- [Fancy Dress in Gurgaon](https://www.modfancydress.com/fancy-dress-gurgaon): Delivery to DLF, Cyber City, Sohna Road areas
- [About Us](https://www.modfancydress.com/about): Founded 2010, 700+ reviews, 4.7/5 star rating
- [FAQ](https://www.modfancydress.com/faq): Common questions about buying, renting, delivery, bulk orders

## Blog Guides
- [School Annual Function Costume Guide](https://www.modfancydress.com/blog/school-annual-function-fancy-dress-guide): How to choose costumes for school events
- [Classical Dance Costume Guide](https://www.modfancydress.com/blog/which-classical-dance-costume-for-your-child): Bharatanatyam, Kathak, Odissi, Garba comparison
- [Rent vs Buy Guide](https://www.modfancydress.com/blog/rent-or-buy-fancy-dress-costume): When to rent vs purchase a fancy dress costume
- [Kathak Costume Guide](https://www.modfancydress.com/blog/how-to-choose-kathak-dance-costume): How to choose the right Kathak dance costume
- [Navratri Costume Guide](https://www.modfancydress.com/blog/garba-navratri-costume-kids-guide): Garba and Navratri costumes for kids
- [Republic Day Ideas](https://www.modfancydress.com/blog/republic-day-fancy-dress-ideas-kids): Freedom fighter and folk costumes for Republic Day

## Key Facts
- Physical store: S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051
- Phone: +91 93113 65366
- Hours: 10:00 AM – 9:30 PM, open all 7 days
- Rental prices: ₹200–₹1,000 per event (refundable deposit: ₹500–₹2,000)
- Purchase prices: ₹350–₹2,500
- Wholesale: available for 10+ pieces of same costume, up to 30% discount
- Delivery: via Porter and Rapido across Delhi NCR, same-day available
- Languages: English and Hindi content available
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Navigate to: http://localhost:3000/llms.txt
Confirm: Plain text content is returned (not a 404 or HTML page).

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat(seo): add llms.txt for AI crawler guidance"
```

---

### Task 9: Add Service schema to /rent page

**Files:**
- Modify: `app/(public)/rent/page.tsx`

The `/rent` page has FAQPage and BreadcrumbList schema but no `Service` schema. Adding `Service` with `serviceType`, `areaServed`, and `priceRange` helps Google surface this page for rental-intent queries ("fancy dress on rent Delhi", "costume hire near me").

- [ ] **Step 1: Add the Service schema JSON-LD to the rent page**

Open `app/(public)/rent/page.tsx`. In the `return` statement of `RentPage`, add a `<script>` block with the Service schema before the page's main content. Find the `return (` and add it as the first child:

```tsx
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': 'https://www.modfancydress.com/rent#service',
            name: 'Fancy Dress Costume Rental',
            serviceType: 'Costume Rental',
            description: 'Rent fancy dress costumes in Delhi NCR. 400+ styles including dance, festival, and competition costumes. Prices from ₹200 per event with refundable deposit.',
            url: 'https://www.modfancydress.com/rent',
            provider: {
              '@type': 'ClothingStore',
              '@id': 'https://www.modfancydress.com/#organization',
              name: 'Mod Fancy Dress',
            },
            areaServed: [
              { '@type': 'City', name: 'Delhi' },
              { '@type': 'City', name: 'Noida' },
              { '@type': 'City', name: 'Gurgaon' },
              { '@type': 'City', name: 'Ghaziabad' },
              { '@type': 'City', name: 'Faridabad' },
              { '@type': 'City', name: 'Greater Noida' },
            ],
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              priceRange: '₹200–₹1000',
              description: 'Rental price per event. Refundable security deposit of ₹500–₹2,000 required.',
            },
          }),
        }}
      />
      {/* existing page JSX continues here */}
```

Note: wrap whatever was previously the return value in a `<>...</>` fragment if it wasn't already.

- [ ] **Step 2: Verify**

Run: `npm run dev`
Navigate to: http://localhost:3000/rent
View source, search for `"@type":"Service"`.
Confirm the schema is present in the initial HTML.

- [ ] **Step 3: Commit**

```bash
git add app/(public)/rent/page.tsx
git commit -m "feat(seo): add Service schema to /rent page for rental-intent queries"
```

---

## Phase 3 — Medium Priority (Fix Within 1 Month)

---

### Task 10: Add CSP and HSTS security headers

**Files:**
- Modify: `next.config.ts:4-12`

The site has `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` but is missing `Content-Security-Policy` (CSP) and `Strict-Transport-Security` (HSTS). These are now relevant to overall site health scoring and HTTPS enforcement.

- [ ] **Step 1: Add headers to next.config.ts**

Open `next.config.ts`. The `securityHeaders` array currently is:

```typescript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
]
```

Change to:

```typescript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://maps.google.com https://maps.gstatic.com",
      "frame-src https://maps.google.com https://www.google.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    ].join('; '),
  },
]
```

- [ ] **Step 2: Test in dev for CSP console errors**

Run: `npm run dev`
Open Chrome DevTools Console.
Navigate to: http://localhost:3000, http://localhost:3000/rent, http://localhost:3000/products
Look for any `Content Security Policy` console errors. If images or scripts are blocked, add their origins to the relevant CSP directive.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(security): add HSTS and Content-Security-Policy headers"
```

---

### Task 11: Add Google Maps embed to Noida and Gurgaon location pages

**Files:**
- Modify: `app/(public)/fancy-dress-noida/page.tsx`
- Modify: `app/(public)/fancy-dress-gurgaon/page.tsx`

Location pages should have an embedded map to reinforce the geographic signal. The contact page has one; location pages do not. Use `loading="lazy"` to avoid page performance impact.

- [ ] **Step 1: Add map to Noida page**

In `app/(public)/fancy-dress-noida/page.tsx`, before the final closing `</div>`, add:

```tsx
      {/* Store location map */}
      <div className="rounded-xl overflow-hidden border border-[#E8E5E0] mt-6" style={{ height: 240 }}>
        <iframe
          src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
          width="100%"
          height="240"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mod Fancy Dress store — Krishna Nagar, Delhi (serves Noida)"
        />
      </div>
```

- [ ] **Step 2: Add map to Gurgaon page**

Repeat the same iframe block in `app/(public)/fancy-dress-gurgaon/page.tsx` before its final closing `</div>`, changing the title to `"Mod Fancy Dress store — Krishna Nagar, Delhi (serves Gurgaon)"`.

- [ ] **Step 3: Verify**

Run: `npm run dev`
Check: http://localhost:3000/fancy-dress-noida — map iframe loads at page bottom.
Check: http://localhost:3000/fancy-dress-gurgaon — same.

- [ ] **Step 4: Commit**

```bash
git add app/(public)/fancy-dress-noida/page.tsx app/(public)/fancy-dress-gurgaon/page.tsx
git commit -m "feat(seo): add Google Maps embed to Noida and Gurgaon location pages"
```

---

### Task 12: Add social media links to Footer

**Files:**
- Modify: `components/public/Footer.tsx`

The site has no social media links anywhere. Instagram and YouTube are the two highest-impact platforms for a visual costume business and have the strongest correlation with AI citation visibility. Add them to the footer even if the accounts are new — the links establish entity connections.

**Pre-condition:** You need active URLs for Instagram and YouTube before this task. If not yet created, placeholder this as `https://www.instagram.com/modfancydress` and `https://www.youtube.com/@modfancydress` and update once accounts are created.

- [ ] **Step 1: Add social icons to Footer.tsx**

In `components/public/Footer.tsx`, after the existing WhatsApp `<a>` link (around line 81), add:

```tsx
              <a
                href="https://www.instagram.com/modfancydress"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-[#C8956C] transition-colors"
                aria-label="Follow Mod Fancy Dress on Instagram"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@modfancydress"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-[#C8956C] transition-colors"
                aria-label="Watch Mod Fancy Dress on YouTube"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Check the footer on any page. Instagram and YouTube links should appear in the "Get in Touch" section.

- [ ] **Step 3: Update URLs once accounts are created**

When you create the actual Instagram/YouTube accounts, update these two `href` values with the real URLs.

- [ ] **Step 4: Commit**

```bash
git add components/public/Footer.tsx
git commit -m "feat(seo): add Instagram and YouTube social links to footer"
```

---

### Task 13: Add sameAs to organization schema

**Files:**
- Modify: `lib/seo/structured-data.tsx`

The `ClothingStore` organization schema has no `sameAs` property. Adding `sameAs` with links to GBP, JustDial, IndiaMART, Instagram, and YouTube helps Google's Knowledge Graph confirm Mod Fancy Dress as an entity across platforms. This directly improves AI search citation accuracy.

- [ ] **Step 1: Find the organization schema function**

In `lib/seo/structured-data.tsx`, find the function that generates the ClothingStore schema for the homepage. Search for `ClothingStore` — it's likely in a function called something like `OrganizationSchema` or `LocalBusinessSchema`.

- [ ] **Step 2: Add sameAs array**

Inside the schema object that contains `'@type': 'ClothingStore'`, add:

```typescript
    sameAs: [
      'https://share.google/j5z6wKKjqsCHJKajh',
      'https://www.instagram.com/modfancydress',
      'https://www.youtube.com/@modfancydress',
    ],
```

Update the Google Business Profile URL if you have a more permanent URL (the `share.google` URL is a shareable link; the permanent GBP URL format is `https://maps.google.com/?cid=XXXXX`).

Once JustDial and IndiaMART listings are created, add their URLs to this array.

- [ ] **Step 3: Verify**

Run: `npm run dev`
Navigate to: http://localhost:3000
View source, find the ClothingStore JSON-LD block.
Confirm `"sameAs"` array is present.

- [ ] **Step 4: Commit**

```bash
git add lib/seo/structured-data.tsx
git commit -m "feat(seo): add sameAs to organization schema for entity confirmation"
```

---

## Phase 4 — Low Priority / Content Tasks (Backlog)

These require content decisions or platform accounts. No specific code until prerequisites are met.

---

### Task 14: Expand FAQ answers from `<details>` hidden HTML to visible text

**Context:** FAQ pages use HTML `<details>` accordion elements. Non-Google AI crawlers (Perplexity, ClaudeBot) don't execute JavaScript or render collapsed HTML — they may not read these answers. The FAQPage JSON-LD schema is still readable, but answer text in `<details>` is invisible to some AI systems.

**When to do:** After the Phase 1–3 deploys are stable.

**What to do:** In the `FaqSection` component (`components/public/FaqSection.tsx` — find it with `Glob **/FaqSection*`), convert the FAQ rendering from `<details>`/`<summary>` to always-visible HTML. Optionally use a CSS-only accordion (no JS) that keeps answers in the DOM. This is a UX change — confirm with the site owner that they prefer visible FAQ over accordion style before implementing.

---

### Task 15: Add named author schema to blog posts

**Context:** Blog posts use `'@type': 'Organization'` as the author in `BlogPostingSchema` (`lib/seo/structured-data.tsx:469-473`). Named human authors improve E-E-A-T signals for Google and AI systems.

**When to do:** Once a named author (or authors) is agreed upon for the blog.

**What to do:**
1. Update `BlogPostingSchema` in `lib/seo/structured-data.tsx` to accept an optional `authorName` parameter
2. Change the `author` field from `Organization` to `Person` when an author name is provided:

```typescript
author: authorName
  ? {
      '@type': 'Person',
      name: authorName,
      jobTitle: 'Costume Specialist',
      worksFor: { '@id': organizationEntityId() },
    }
  : {
      '@type': 'Organization',
      '@id': organizationEntityId(),
      name: 'Mod Fancy Dress',
    },
```

3. Pass the author name from `app/(public)/blog/[slug]/page.tsx` into `BlogPostingSchema`.

---

### Task 16: Create /wholesale/schools B2B landing page

**Context:** There is no dedicated landing page targeting "wholesale costumes for schools", "bulk order costumes for school function". The wholesale landing page is generic; a schools-specific page would target this high-value B2B segment directly.

**When to do:** After Phase 2 pages are stable.

**What to include:**
- H1: "Wholesale Fancy Dress Costumes for Schools — Bulk Orders Delhi"
- Content: minimum 600 words, covering: MOQ (minimum order quantity), typical order sizes, school types served, ordering process, delivery timeline, payment terms
- Trust signals: number of schools served, specific testimonials from school coordinators
- CTA: WhatsApp enquiry link with pre-filled message
- Schema: `Service` with `serviceType: "B2B Costume Wholesale"`, `audience: "Schools and Educational Institutions"`
- Add to sitemap

---

### Task 17: Implement IndexNow

**Context:** IndexNow is a protocol supported by Bing, Yandex, and Naver that notifies search engines of page updates instantly. Not supported by Google, but Bing drives ChatGPT and Copilot results.

**When to do:** After all Phase 1–3 fixes are deployed.

**What to do:**
1. Generate an IndexNow API key at https://www.bing.com/indexnow
2. Create `public/<key>.txt` with the key value
3. Create `app/api/indexnow/route.ts` that accepts POST requests with a URL and calls the IndexNow API
4. Optionally integrate with Next.js `revalidatePath` to auto-notify on content updates

---

## Post-Deploy Checklist

After deploying Phase 1 (Tasks 1–4):

- [ ] Go to Google Search Console → Sitemaps → resubmit `https://www.modfancydress.com/sitemap.xml`
- [ ] Use GSC URL Inspection on `https://www.modfancydress.com/wholesale/odissi-fancy-dress` — confirm canonical shows as the retail URL
- [ ] Use GSC URL Inspection on `https://www.modfancydress.com/robots.txt` — confirm /cart is disallowed
- [ ] Monitor crawl stats in GSC over the following 2 weeks — crawled page count should increase significantly

After deploying Phase 2 (Tasks 5–9):

- [ ] Claim Bing Places at https://www.bingplaces.com — this powers ChatGPT and Copilot local results
- [ ] Claim Apple Business Connect at https://businessconnect.apple.com
- [ ] Submit to JustDial and IndiaMART with exact NAP matching the schema
- [ ] Submit to Data Axle and Foursquare data aggregators for downstream citation distribution
