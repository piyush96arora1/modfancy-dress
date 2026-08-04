# Rent price hiding, WhatsApp split, and upload quality

**Date:** 2026-08-02
**Status:** Implemented; DB migration applied to production 2026-08-02 (4 rows, verified 0 leftovers)

Three independent changes bundled into one pass.

---

## A. Hide rent prices on product pages

### Goal

Show that a costume is available on rent without publishing a rent price. Customers enquire
on WhatsApp for the rate.

### SEO finding

Rent price was already excluded from Product JSON-LD, deliberately — see the comment at
`lib/seo/structured-data.tsx:355`. The `offers` node only ever carried the sale price,
because a `LeaseOut` offer breaks Merchant Center price extraction. Hiding the on-page rent
price therefore has **zero** structured-data impact.

### Changes

| File | Before | After |
|---|---|---|
| `components/public/AddToCartButton.tsx` | `Also on rent: ₹450/event · Deposit ₹1000` | `Also available on rent` |
| `app/(public)/products/[slug]/page.tsx` | `Rent from ₹450/event`, button `Rent` | `Available on Rent` + `Get rental price on WhatsApp`, button `Enquire` |
| `app/(public)/rent/page.tsx` | category cards showed `₹200–₹1000/event` | range line removed, costume count kept |

`computeRentPrice` / `computeRentDeposit` imports dropped from `AddToCartButton.tsx`; both
functions remain in use by `components/admin/ProductForm.tsx`.

### Deliberately unchanged

- `rent_price` / `rent_deposit` in DB and admin — they are the rentable flag *and* feed `/rent`.
- `/rent` hero "starting from ₹200/event", meta description, and `Service` schema `priceRange`.
  Page, meta and schema stay mutually consistent.
- Homepage and `/compare/local-vs-online` generic "from ₹200/event" copy.
- `getRentCategoriesCached` still computes `min_rent` / `max_rent`; unrendered but retained so
  the display decision is trivially reversible.

---

## B. Split WhatsApp number from the call line

### Decision

`9953764137` handles WhatsApp chat. `9311365366` stays as the call line **and** as the NAP
number in LocalBusiness / Organization schema. No Google Business Profile change required,
so no local-SEO risk.

### Changes

`lib/constants/contact.ts`:

```ts
BUSINESS_WHATSAPP_E164    = '919953764137'      // was 919311365366
BUSINESS_WHATSAPP_DISPLAY = '+91 99537 64137'   // new
BUSINESS_PHONE_TEL        = '+919311365366'     // unchanged — call line / NAP
BUSINESS_PHONE_DISPLAY    = '+91 93113 65366'   // unchanged — call line / NAP
```

One constant cascades to every `whatsappUrl()` and `wa.me/` link site-wide.

Text that names a number inside a **WhatsApp** sentence had to move too, or the site would
tell customers to message the call line:

- `app/(public)/faq/page.tsx:82` — now uses `BUSINESS_WHATSAPP_DISPLAY`
- `lib/seo/rental-faq-data.ts:22` — hardcoded number updated

`supabase/migrations/034_whatsapp_number_9953764137.sql` covers 4 DB rows (2 FAQs, 2 blog
posts). Rows are filtered on the literal word `WhatsApp` so call-context mentions survive.

### Deliberately unchanged

- `lib/seo/structured-data.tsx:49,125` — `telephone` stays on the call line.
- `/returns`, `/privacy-policy` — generic contact, not WhatsApp-labelled.
- `banner_settings.ticker_text` (`"...Mod Fancy Dress || 9311365366"`) — shows a bare number
  with no WhatsApp label, so it reads as the call line.

---

## C. Upload image quality

### Root cause

Not over-compression. `lib/utils/upload.ts` requested `fileType: 'image/webp'`, but
`canvas.toBlob()` silently falls back to `image/png` when it cannot encode the requested type.
All 10 sampled files in `products-webp/` were PNG bytes named `.webp`.

Once output is PNG the three settings interact badly:

1. PNG is lossless, so `initialQuality: 0.85` does nothing — `toBlob` ignores quality for PNG.
2. The library must still reach `maxSizeMB: 0.1` (100 KB), and its only remaining lever is
   **shrinking dimensions**.
3. A photo-as-PNG cannot reach 100 KB, so it downscales until it gives up. The loop shrinks
   the canvas 5% per iteration over `maxIteration` (default 10) passes: `1200 × 0.95¹⁰ = 718px`.
   Observed output was `536×716` — a near-exact match, confirming the mechanism.

The blur was aggressive downscaling in pursuit of an unreachable target. Raising
`initialQuality` alone would have changed nothing.

### Changes

```ts
maxSizeMB: 0.4,             // was 0.1
maxWidthOrHeight: 1600,     // was 1200
initialQuality: 0.92,       // was 0.85
alwaysKeepResolution: true, // new — never trade pixels for file size
```

`alwaysKeepResolution` (supported in browser-image-compression 2.0.2) is the fix: resize once
to `maxWidthOrHeight`, then quality-only.

Plus a truthfulness guard — extension and `contentType` now derive from `compressed.type`
instead of hardcoding webp, so PNG output is no longer mislabelled and a fresh upload
immediately reveals whether WebP encoding works.

### Not done

The 91 existing PNG-as-webp images were left in place. Decision: fix forward, evaluate a
backfill after observing a real upload.

### Follow-up: iOS regression (2026-08-04)

Naming files after their real format collided with `getImageUrl()`, which rewrote
`.png → .webp` on every URL. That rule exists to map legacy `/products/foo.jpg` rows onto
pre-generated `/products-webp/foo.webp` files, and it was harmless only because uploads were
previously *named* `.webp` regardless of their bytes — the old mislabelling happened to agree
with it.

Real uploads settled the open format question empirically: laptop produced genuine WebP, iOS
Safari fell back (it cannot encode WebP via `canvas.toBlob`; it displays WebP fine, so viewers
are unaffected). The iOS files stored as `.png`, `getImageUrl` requested `.webp`, and those
404'd — one live product page (`gujrati-boy-fancy-dress`) showed a broken image.

Fixes:

- `lib/imageUrl.ts` — URLs already inside a `-webp` folder are returned untouched; the stored
  filename is authoritative. Legacy rewriting is unchanged, and the 66 legacy `products/*.png`
  rows still resolve to their existing pre-generated WebP variants.
- `lib/utils/upload.ts` — feature-detect WebP encoding and fall back to **JPEG rather than
  PNG**. Format labelling was the visible symptom; the real cost was that PNG is lossless, so
  `initialQuality` and `maxSizeMB` were both inert and iOS uploads landed at ~3 MB. JPEG keeps
  the encode lossy, so the size target is reachable (~300–400 KB).
- `maxIteration: 3` — at fixed resolution each pass allocates a fresh full-size canvas, which
  is heavy on iOS Safari's canvas memory ceiling and buys little once quality starts at 0.92.

The two changes are complementary: the upload change optimises the common path, the URL change
stops any unexpected format from 404ing. Worst case is now a heavy file, not a broken image.

---

## Verification

`npm run build` passes; `/rent`, `/faq` and all 354 `/products/[slug]` routes still prerender.
Built HTML confirmed: no `₹…/event` on product detail pages, no category ranges on `/rent`,
hero from-price retained, `wa.me/919953764137` in pages, `"telephone":"+919311365366"` in
schema. No new lint issues.
