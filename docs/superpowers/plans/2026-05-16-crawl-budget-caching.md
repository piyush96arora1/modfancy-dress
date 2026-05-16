# Crawl-Budget Caching Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert 8 public Next.js routes from dynamic to ISR so Vercel's edge cache serves Googlebot in <200ms, unlocking the ~440 sitemap URLs currently stuck in "Discovered – currently not indexed".

**Architecture:** Replace the cookie-reading `createClient()` from `lib/supabase/server.ts` with the existing cookieless `createPublicServerClient()` from `lib/supabase/public-server.ts` on read-only public pages, and set `export const revalidate = 86400`. This removes the `cookies()` call that forces dynamic rendering, letting Next.js use the Full Route Cache and Vercel's Edge CDN.

**Tech Stack:** Next.js 16 App Router, Supabase JS client, Vercel Edge Network.

**Spec:** `docs/superpowers/specs/2026-05-16-crawl-budget-caching-design.md`

---

## File Inventory

All edits follow the same pattern. Each file gets:
1. Import swap: `createClient` (from `@/lib/supabase/server`) → `createPublicServerClient` (from `@/lib/supabase/public-server`)
2. Call swap: `await createClient()` → `createPublicServerClient()` (no `await` — function is sync)
3. Add or upgrade: `export const revalidate = 86400`

| # | File | createClient call sites | Existing revalidate |
|---|---|---|---|
| 1 | `app/sitemap.ts` | 1 (top of `sitemap()`) | `3600` (line 4) |
| 2 | `app/(public)/page.tsx` | 1 (line 26) | `300` (line 23) |
| 3 | `app/(public)/blog/page.tsx` | 1 (line 17) | none |
| 4 | `app/(public)/blog/[slug]/page.tsx` | 2 (lines 21, 41) | none |
| 5 | `app/(public)/category/[slug]/page.tsx` | 2 (lines 27, 57) | `300` (line 23) |
| 6 | `app/(public)/wholesale/category/[slug]/page.tsx` | 2 (lines 26, 54) | none |
| 7 | `app/(public)/wholesale/[slug]/page.tsx` | 2 (lines 31, 62) | none |
| 8 | `app/(public)/products/[slug]/page.tsx` | 2 (lines 32, 66) | none |

**Not in scope (do not change):**
- `app/(public)/products/page.tsx` — uses `searchParams`, must stay dynamic
- `app/(public)/faq/page.tsx` — has `export const dynamic = 'force-dynamic'` (separate cleanup)
- `app/(public)/cart`, `app/(public)/wholesale/enquiry` — interactive
- Anything in `app/(auth)/*` or `app/(admin)/*`
- `lib/utils/auth.ts` — correctly uses `createClient` for admin gating

---

### Task 1: Capture baseline (verify the bug exists)

**Files:** none (read-only check)

- [ ] **Step 1: Curl the current homepage and save the cache header**

Run:
```bash
curl -sI https://www.modfancydress.com/ | grep -iE "cache-control|x-vercel-cache"
```
Expected (baseline — confirms the bug):
```
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
x-vercel-cache: MISS
```

- [ ] **Step 2: Curl a product page and a category page**

Run:
```bash
curl -sI https://www.modfancydress.com/products/$(curl -s https://www.modfancydress.com/sitemap.xml | grep -oE '/products/[^<]+' | head -1 | cut -d/ -f3) | grep -iE "cache-control|x-vercel-cache"
curl -sI https://www.modfancydress.com/sitemap.xml | grep -iE "cache-control|x-vercel-cache"
```
Expected: both show `no-store` / `MISS`. This is the state we're fixing.

---

### Task 2: Convert `app/sitemap.ts`

**Files:**
- Modify: `app/sitemap.ts`

The sitemap is fetched first by Googlebot — caching it is critical so re-crawls cost no origin work.

- [ ] **Step 1: Read current file to confirm shape**

Run: `sed -n '1,10p' app/sitemap.ts`
Expected first lines:
```ts
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
```

- [ ] **Step 2: Apply the edits**

Change the import on line 2:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'

// AFTER
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Change line 4 (bump revalidate from 3600 → 86400):
```ts
// BEFORE
export const revalidate = 3600

// AFTER
export const revalidate = 86400
```

Change the client construction inside `sitemap()`:
```ts
// BEFORE
const supabase = await createClient()

// AFTER
const supabase = createPublicServerClient()
```

- [ ] **Step 3: Type-check this file**

Run:
```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "sitemap\.ts|error TS" | head -20
```
Expected: no errors mentioning `sitemap.ts`.

- [ ] **Step 4: Confirm grep clean**

Run:
```bash
grep -n "createClient\|cookies\|@/lib/supabase/server" app/sitemap.ts
```
Expected: no output (clean).

---

### Task 3: Convert `app/(public)/page.tsx` (homepage)

**Files:**
- Modify: `app/(public)/page.tsx`

- [ ] **Step 1: Apply the edits**

Line 2 import:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'
// AFTER
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Line 23 revalidate (bump 300 → 86400):
```ts
// BEFORE
export const revalidate = 300
// AFTER
export const revalidate = 86400
```

Line 26 client:
```ts
// BEFORE
const supabase = await createClient()
// AFTER
const supabase = createPublicServerClient()
```

- [ ] **Step 2: Grep clean**

Run: `grep -n "createClient\|@/lib/supabase/server" app/\(public\)/page.tsx`
Expected: empty.

---

### Task 4: Convert `app/(public)/blog/page.tsx` (blog index)

**Files:**
- Modify: `app/(public)/blog/page.tsx`

- [ ] **Step 1: Apply the edits**

Line 2 import:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'
// AFTER
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Line 17 client:
```ts
// BEFORE
const supabase = await createClient()
// AFTER
const supabase = createPublicServerClient()
```

Add new export near the top (after imports, before the page function — match style with other pages):
```ts
export const revalidate = 86400
```

- [ ] **Step 2: Grep clean**

Run: `grep -n "createClient\|@/lib/supabase/server\|revalidate" app/\(public\)/blog/page.tsx`
Expected: one line matching `export const revalidate = 86400`, nothing else.

---

### Task 5: Convert `app/(public)/blog/[slug]/page.tsx` (blog post)

**Files:**
- Modify: `app/(public)/blog/[slug]/page.tsx`

This file has **two** `createClient()` calls — one in `generateMetadata` (line 21), one in the page function (line 41). Both must be swapped.

- [ ] **Step 1: Apply the edits**

Line 3 import:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'
// AFTER
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Both client construction sites (lines ~21 and ~41):
```ts
// BEFORE (both occurrences)
const supabase = await createClient()
// AFTER (both occurrences)
const supabase = createPublicServerClient()
```

Add near top of file (after imports):
```ts
export const revalidate = 86400
```

- [ ] **Step 2: Grep clean**

Run: `grep -n "createClient\|@/lib/supabase/server" app/\(public\)/blog/\[slug\]/page.tsx`
Expected: empty (only the new public client import).

---

### Task 6: Convert `app/(public)/category/[slug]/page.tsx`

**Files:**
- Modify: `app/(public)/category/[slug]/page.tsx`

Two `createClient()` calls (lines 27 and 57). Existing `revalidate = 300` on line 23 — bump to 86400.

- [ ] **Step 1: Apply the edits**

Line 3 import:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'
// AFTER
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Line 23 revalidate:
```ts
// BEFORE
export const revalidate = 300
// AFTER
export const revalidate = 86400
```

Both client construction sites:
```ts
// BEFORE
const supabase = await createClient()
// AFTER
const supabase = createPublicServerClient()
```

- [ ] **Step 2: Grep clean**

Run: `grep -n "createClient\|@/lib/supabase/server" app/\(public\)/category/\[slug\]/page.tsx`
Expected: empty.

---

### Task 7: Convert `app/(public)/wholesale/category/[slug]/page.tsx`

**Files:**
- Modify: `app/(public)/wholesale/category/[slug]/page.tsx`

Two `createClient()` calls (lines 26 and 54).

- [ ] **Step 1: Apply the edits**

Line 3 import:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'
// AFTER
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Both client construction sites:
```ts
// BEFORE
const supabase = await createClient()
// AFTER
const supabase = createPublicServerClient()
```

Add near top of file (after imports):
```ts
export const revalidate = 86400
```

- [ ] **Step 2: Grep clean**

Run: `grep -n "createClient\|@/lib/supabase/server" app/\(public\)/wholesale/category/\[slug\]/page.tsx`
Expected: empty.

---

### Task 8: Convert `app/(public)/wholesale/[slug]/page.tsx`

**Files:**
- Modify: `app/(public)/wholesale/[slug]/page.tsx`

Two `createClient()` calls (lines 31 and 62). Note this file also already imports `createPublicServerClient` (line 4) for reviews — don't duplicate the import; just add `createPublicServerClient` to the existing import path uses, and swap the `createClient` usages.

- [ ] **Step 1: Apply the edits**

Remove the line 3 import:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'

// AFTER (just the public client line — drop the server one)
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Both `createClient()` call sites (lines ~31, ~62):
```ts
// BEFORE
const supabase = await createClient()
// AFTER
const supabase = createPublicServerClient()
```

Add near top of file (after imports):
```ts
export const revalidate = 86400
```

- [ ] **Step 2: Grep clean**

Run: `grep -n "createClient\|@/lib/supabase/server" app/\(public\)/wholesale/\[slug\]/page.tsx`
Expected: empty.

---

### Task 9: Convert `app/(public)/products/[slug]/page.tsx`

**Files:**
- Modify: `app/(public)/products/[slug]/page.tsx`

This is the big one — 358 URLs in the sitemap depend on it. Two `createClient()` calls (lines 32 and 66). This file also already imports `createPublicServerClient` (line 4) for reviews; consolidate.

- [ ] **Step 1: Apply the edits**

Remove the line 3 import:
```ts
// BEFORE
import { createClient } from '@/lib/supabase/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'

// AFTER
import { createPublicServerClient } from '@/lib/supabase/public-server'
```

Both `createClient()` call sites (lines ~32, ~66):
```ts
// BEFORE
const supabase = await createClient()
// AFTER
const supabase = createPublicServerClient()
```

Add near top of file (after imports):
```ts
export const revalidate = 86400
```

- [ ] **Step 2: Grep clean**

Run: `grep -n "createClient\|@/lib/supabase/server" app/\(public\)/products/\[slug\]/page.tsx`
Expected: empty.

---

### Task 10: Type-check the full project

**Files:** none — verification only

- [ ] **Step 1: Run full type check**

Run:
```bash
npx tsc --noEmit
```
Expected: clean (zero errors). If errors appear, they will most likely be:
- Stale `await` keywords that need removal (`createPublicServerClient` is sync, not async)
- An unused import that needs deleting

Fix any such errors before continuing.

---

### Task 11: Production build (locally) to verify route classification

**Files:** none — verification only

- [ ] **Step 1: Run production build**

Run:
```bash
npm run build 2>&1 | tee /tmp/mfd-build.log | tail -80
```

- [ ] **Step 2: Inspect the route table in the build output**

Next.js prints a route table at the end of the build with symbols:
- `○ (Static)` — fully static, prerendered at build
- `● (SSG)` — statically generated (with `generateStaticParams`)
- `ƒ (Dynamic)` — server-rendered on every request

Run:
```bash
grep -E "\(public\)|sitemap" /tmp/mfd-build.log | head -40
```

Expected classification for the routes you changed:
- `/` → `○ Static` (or `● SSG`)
- `/products/[slug]` → server-rendered at request time but **with revalidate** — Next.js marks it as `ƒ` but the **Cache-Control header at runtime** will be `s-maxage=86400` because of the `revalidate` export. (This is the key — the build symbol can be misleading; the runtime header is what matters.)
- `/category/[slug]` → same as above
- `/blog`, `/blog/[slug]`, `/wholesale/[slug]`, `/wholesale/category/[slug]` → same
- `/products` → still `ƒ Dynamic` (correct — kept dynamic on purpose)

The build must succeed with exit code 0. Any build error blocks deployment.

---

### Task 12: Commit all changes

**Files:** all 8 modified page files

- [ ] **Step 1: Stage and review the diff**

Run:
```bash
git status
git diff --stat
```
Expected: 8 files changed, ~30–40 lines total (most are import swaps + revalidate additions).

- [ ] **Step 2: Commit**

Run:
```bash
git add app/sitemap.ts \
        "app/(public)/page.tsx" \
        "app/(public)/blog/page.tsx" \
        "app/(public)/blog/[slug]/page.tsx" \
        "app/(public)/category/[slug]/page.tsx" \
        "app/(public)/wholesale/category/[slug]/page.tsx" \
        "app/(public)/wholesale/[slug]/page.tsx" \
        "app/(public)/products/[slug]/page.tsx"

git commit -m "$(cat <<'EOF'
perf(seo): make public pages edge-cacheable to fix crawl budget

Replace cookie-reading createClient() with cookieless
createPublicServerClient() on read-only public routes, and set
revalidate=86400. The cookies() call inside createClient() was
silently forcing every public page into dynamic rendering, which
made the prior revalidate=300 a no-op and produced no-store
Cache-Control headers across the site.

With this change Next.js treats the routes as ISR, so Vercel's edge
network caches rendered HTML for up to 24h. Googlebot fetches at
edge speed (<200ms vs 2.5s origin), unblocking the ~440 sitemap
URLs currently stuck in "Discovered – currently not indexed".

Routes affected: /, /products/[slug], /category/[slug],
/wholesale/[slug], /wholesale/category/[slug], /blog, /blog/[slug],
/sitemap.xml. /products (search) intentionally stays dynamic.

Spec: docs/superpowers/specs/2026-05-16-crawl-budget-caching-design.md

Co-Authored-By: claude-flow <ruv@ruv.net>
EOF
)"
```

- [ ] **Step 3: Confirm clean git status**

Run: `git status`
Expected: working tree clean (the deleted-files noise from `git status` snapshot at session start is unrelated).

---

### Task 13: Push and deploy

**Files:** none

- [ ] **Step 1: Push to origin/main**

Run: `git push origin main`

Vercel auto-deploys from `main`. Wait ~2 minutes for the deploy to complete (check the Vercel dashboard or wait for the build email).

- [ ] **Step 2: Confirm deploy is live**

Run:
```bash
curl -s https://www.modfancydress.com/ -o /dev/null -w "%{http_code}\n"
```
Expected: `200`.

---

### Task 14: Production verification

**Files:** none

- [ ] **Step 1: Re-curl the same endpoints from Task 1**

Run:
```bash
echo "=== Homepage (1st hit) ==="
curl -sI https://www.modfancydress.com/ | grep -iE "cache-control|x-vercel-cache|age:"

echo "=== Homepage (2nd hit, after a moment) ==="
sleep 3
curl -sI https://www.modfancydress.com/ | grep -iE "cache-control|x-vercel-cache|age:"

echo "=== Product page ==="
PROD_SLUG=$(curl -s https://www.modfancydress.com/sitemap.xml | grep -oE '/products/[^<]+' | head -1 | cut -d/ -f3)
curl -sI "https://www.modfancydress.com/products/$PROD_SLUG" | grep -iE "cache-control|x-vercel-cache"
sleep 3
curl -sI "https://www.modfancydress.com/products/$PROD_SLUG" | grep -iE "cache-control|x-vercel-cache"

echo "=== Sitemap ==="
curl -sI https://www.modfancydress.com/sitemap.xml | grep -iE "cache-control|x-vercel-cache"
```

Expected (success criteria):
- `cache-control: public, s-maxage=86400, stale-while-revalidate=...` (or similar; **no longer `no-store`**)
- `x-vercel-cache: HIT` on the 2nd request (1st may be `MISS` while the edge populates)
- Sitemap response also shows `s-maxage` and eventually `HIT`

- [ ] **Step 2: TTFB sanity check**

Run:
```bash
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://www.modfancydress.com/
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" "https://www.modfancydress.com/products/$PROD_SLUG"
```
Expected: <200ms (vs. 2.46s baseline on the homepage).

- [ ] **Step 3: Smoke-test a logged-out user flow**

Open in a fresh incognito window:
- Homepage loads, banner visible
- Click into a category — products grid loads
- Click a product — detail page loads with images, description, sizes
- Click "Add to cart" — cart count increments client-side
- Header login button visible (NOT user email — confirms server isn't reading auth cookies)

If any of those break, roll back with `git revert HEAD && git push` and re-investigate.

- [ ] **Step 4: Request Google to validate the fix**

In Google Search Console:
1. Open **Coverage** → "Discovered – currently not indexed" report
2. Click **Validate Fix**
3. (Optional) Open **URL Inspection** for the homepage and 5–10 top product pages → click **Request Indexing** to nudge Google

Expected timeline: GSC validation runs over ~2 weeks. The "Discovered – not indexed" count should fall and the indexed count should rise as Googlebot's crawl budget unlocks.

---

## Self-Review

**Spec coverage:**
- ✅ All 8 in-scope files from spec → Tasks 2–9
- ✅ `revalidate = 86400` set on all → Tasks 2–9 each include it
- ✅ Out-of-scope routes (`/products`, `/faq`, auth, admin) explicitly skipped — File Inventory section
- ✅ Verification plan from spec → Tasks 11 (build), 14 (production curl + smoke test + GSC)
- ✅ Risk mitigations (RLS, search page) addressed in task notes

**Placeholder scan:** No TBDs, no "implement appropriate error handling", no "similar to Task N". Every code block is complete and copy-pasteable.

**Type consistency:** `createPublicServerClient()` is sync everywhere (no `await`), import path is `@/lib/supabase/public-server` consistently, `revalidate = 86400` value identical across all tasks.

**Known gotchas surfaced:**
- Two files (Tasks 8, 9) already import `createPublicServerClient` for reviews — the plan explicitly says to consolidate, not duplicate the import.
- Next.js build symbol `ƒ Dynamic` can appear even for ISR routes; the plan notes this and tells the engineer to trust the runtime `Cache-Control` header, not the build symbol.
