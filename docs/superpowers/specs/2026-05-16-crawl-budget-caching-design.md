# Crawl-Budget Fix: Make Public Pages Edge-Cacheable

**Date:** 2026-05-16
**Status:** Design (awaiting approval before plan)
**Owner:** Piyush Arora

## Problem

Google Search Console reports 498 URLs as **"Discovered – currently not indexed"** against ~56 indexed pages, two months after sitemap submission.

Root cause (verified live):

```
$ curl -I https://www.modfancydress.com/
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-vercel-cache: MISS
TTFB: 2.46s
```

Every public page is served fully dynamic with no CDN caching. With ~488 URLs in the sitemap and ~2.5s origin TTFB, Googlebot's per-host crawl budget is exhausted before it can fetch more than a small fraction of the site.

The `export const revalidate = 300` already present on several routes is a no-op, because every public page calls `createClient()` from `lib/supabase/server.ts`, which calls `await cookies()`. In Next.js App Router, reading cookies forces the route to render dynamically — `revalidate` is silently ignored.

## Goal

All public detail/listing pages served from Vercel's Edge cache so Googlebot fetches them in <200ms instead of 2.5s. Daily-stale content is acceptable.

## Non-goals

- Wholesale category page de-duplication (separate spec)
- Authority / backlinks
- Performance/CWV beyond TTFB
- Search/filter page (`/products`) — stays dynamic by design

## Approach

Replace the cookie-reading server client with the existing cookieless `createPublicServerClient` on public read-only routes, and set an aggressive `revalidate` value. This lets Next.js render the route at the Full Route Cache layer and lets Vercel serve cached HTML from the Edge.

### In scope (routes that flip from dynamic → ISR)

| Route | URLs in sitemap |
|---|---|
| `app/(public)/page.tsx` | 1 (homepage) |
| `app/(public)/products/[slug]/page.tsx` | 358 |
| `app/(public)/category/[slug]/page.tsx` | 52 |
| `app/(public)/wholesale/[slug]/page.tsx` | 0 in sitemap, but page exists |
| `app/(public)/wholesale/category/[slug]/page.tsx` | 54 |
| `app/(public)/blog/page.tsx` | 1 |
| `app/(public)/blog/[slug]/page.tsx` | 13 |
| `app/sitemap.ts` | — (caches the sitemap itself) |

### Out of scope (stays dynamic — correct as-is)

- `app/(public)/products/page.tsx` — uses `searchParams`
- `app/(public)/cart`, `app/(public)/wholesale/enquiry` — interactive
- `app/(auth)/*`, `app/(admin)/*` — auth required

### Code change pattern

Each in-scope file:

```diff
- import { createClient } from '@/lib/supabase/server'
+ import { createPublicServerClient } from '@/lib/supabase/public-server'
…
- const supabase = await createClient()
+ const supabase = createPublicServerClient()
…
+ export const revalidate = 86400
```

`createPublicServerClient` already exists at `lib/supabase/public-server.ts` and uses the anon key with `persistSession: false` — same RLS-backed permissions the pages already get.

### Why this works

1. No `cookies()` read → Next.js treats route as ISR.
2. `revalidate = 86400` → response carries `Cache-Control: s-maxage=86400, stale-while-revalidate=…`.
3. Vercel Edge caches the rendered HTML across POPs.
4. Subsequent Googlebot (and user) requests hit the edge, not Supabase.
5. Pages revalidate in background once per day.

Auth-aware UI (login button, cart count, enquiry badge) is already handled in client components (`Header.tsx`, `MobileBottomNav.tsx`, `FloatingEnquiryBadge.tsx`) via `useAuth()` and Zustand — nothing on the server side renders user-specific HTML on these routes today.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Admin product/category/blog edits invisible for up to 24h | Low (accepted by owner) | Optional follow-up: wire `revalidatePath()` into admin save handlers |
| Newly added product missing from sitemap for up to 24h | Low | Google re-fetches sitemap every few days regardless |
| Anon Supabase client requires permissive RLS for SELECT | None — already required | No change; pages already serve anonymous users |
| Public pages start showing stale `wholesale_discount_pct` for 24h | Low (accepted) | Same `revalidatePath()` follow-up if needed |

## Verification

After deploy:

1. `curl -I https://www.modfancydress.com/products/<slug>` — expect `cache-control: public, s-maxage=86400, …`.
2. Second request within 24h: `x-vercel-cache: HIT`, TTFB <200ms.
3. Same checks on `/`, `/category/<slug>`, `/blog/<slug>`, `/sitemap.xml`.
4. Google Search Console → coverage report → click **Validate Fix** on the "Discovered – currently not indexed" issue.
5. Re-check Crawl Stats (Settings → Crawl stats) after 1–2 weeks; expect crawl rate to climb and "Discovered – not indexed" count to fall.

## Rollout

Single PR. No feature flag needed — the change is internal (which server client is used) and backwards-compatible. Vercel preview deploy will surface any RLS-permission issue before production.

## Open questions

None blocking. On-demand `revalidatePath()` from admin save handlers is a deliberate follow-up, not part of this spec.
