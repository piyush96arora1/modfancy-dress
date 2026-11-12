# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Owner's goal: applies to every task, no need to be told again

**Rank #1 on Google India for costumes, fancy dress, school-event and rental searches, with excellent mobile UX and Core Web Vitals.** Every change is judged against four targets:

1. **Mobile UX:** most customers are on phones. Check every changed page at 390×844 *and* 1366×800 (Playwright screenshots). The thing the customer came for (products, price, WhatsApp/enquiry) is on the first screen; no horizontal scroll; nothing covering faces in photos; tap targets ≥44px.
2. **Core Web Vitals:** LCP, INP/TBT and CLS must not get worse. Measure before and after with Lighthouse mobile (`npx -y lighthouse@12.2.1 <url> --only-categories=performance`; Chrome at `~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`). Pages stay statically rendered (○/● in the build table). Images: 400/800/1600 WebP variants, never full originals in grids. Third-party scripts stay deferred.
3. **SEO:** title ≤60 chars leading with the searched phrase, meta ≤155, one H1, canonical, structured data valid, internal links working, page in the sitemap, image alt text from what the photo shows. Don't create two pages competing for the same phrase.
4. **Ranking #1:** decide with evidence. A change is "working" only after Google Search Console shows more clicks for that page over 2–4 comparable weeks (ideally more enquiries or orders), not from a one-day Semrush estimate. Keep commercial demand (dress, costume, buy, rent) separate from informational demand (speech, dialogue, ideas).

Work from `seodata/semrush-2026-11/BACKLOG.md` (the single current list). Review your own and any agent's work against the four targets before it goes live, then verify on the live site.

### Standing owner rules (never undo)
- **Never publish rent or deposit figures** anywhere: copy, metas, FAQs, tables, cards, feeds or schema. Say "available on rent" and point to WhatsApp. Allowed: buy prices, the site-wide "from ₹200" line, and the deposit range "₹500–₹2,000".
- Product pages: **no fabric claims**; prices only from admin; **no MRP or discounts**.
- **Never contact Sanskriti / fancydressnoida.com** (competitor).
- Describe products only from what their photo shows; don't invent included props or sizes.

## Commands

```bash
npm run dev        # Development server (Webpack) at http://localhost:3000
npm run build      # Production build
npm start          # Start production server
npm run lint       # ESLint

# Data management scripts
npm run import:collection   # Import product collection into Supabase
npm run verify:setup        # Verify database setup
npm run check:missing       # Check for missing products
```

> The dev server uses `--webpack` explicitly. Do not switch to Turbopack.

## Architecture

This is a **Next.js 16 App Router** e-commerce site for a fancy dress / costume rental business. It uses **Supabase** (PostgreSQL + Auth + Storage) as the backend.

### Route Groups

- `app/(public)/` — Customer-facing storefront (products, categories, cart, blog, FAQs, contact, rent)
- `app/(auth)/` — Login, signup, password reset
- `app/(admin)/` — Protected admin panel for managing products, categories, orders, enquiries, banners

Middleware enforces admin role (`role: 'admin'` in Supabase user metadata) for `/admin` routes.

### Key Libraries

| Concern | Library |
|---------|---------|
| Database / Auth | Supabase (`lib/supabase/client.ts` for browser, `lib/supabase/server.ts` for SSR) |
| Cart state | Zustand with localStorage persistence (`lib/store/cart.ts`, key: `mod-fancy-dress-cart`) |
| Shared state | React Context — `EnquiryBasketProvider`, `PricingModeProvider` |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Carousels | Embla Carousel |
| Image compression | browser-image-compression (client-side before upload) |

### Pricing Model

Products support three price fields: `price` (retail), `wholesale_price`, `rent_price` + `rent_deposit`. The `PricingModeContext` toggles between retail and wholesale display modes across the UI.

### Data Patterns

- **Soft deletes**: Products use `deleted_at` timestamp. All queries must filter `is_active = true AND deleted_at IS NULL`.
- **Multiple categories**: Products can belong to multiple categories via the `product_categories` junction table.
- **Server-side data fetching**: Data access functions live in `lib/supabase/` and are called from Server Components or API routes.
- **API routes** (`app/api/`): Used for public endpoints (search, products, wholesale enquiry). Product listing is cached with 60-second revalidation.
- **Images**: Stored in Supabase Storage bucket `product-images`. `next/image` is set to `unoptimized: true` in production (Vercel optimization limit).

### Database Migrations

SQL migration files are in `supabase/migrations/`. The schema includes RLS policies, soft delete indexes, and full-text search setup.

### SEO

- Centralized metadata generation: `lib/seo/metadata.ts`
- JSON-LD structured data: `lib/seo/structured-data.ts`
- Dynamic sitemap/robots: `app/sitemap.ts`, `app/robots.ts`
- URL redirects: `redirects.json` (loaded by `next.config.ts`)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # Server-side only (elevated permissions)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION  # Optional
```

## TypeScript

Path alias `@/*` resolves to the project root. Use it for all internal imports.
