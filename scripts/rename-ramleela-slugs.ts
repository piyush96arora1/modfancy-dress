/**
 * Slug + name fixes for the 19 Sep 2026 Ramleela batch, run the day after
 * upload while the products have no rankings or backlinks to lose.
 *
 * Two renames, both keyword-driven (volumes from the Semrush export in
 * seodata/, 17 Jun 2026):
 *
 *   raavan-black-dress   -> ravan-fancy-dress
 *     "raavan" has no measured volume. "ravan dress" is 590/mo at KD 15 and
 *     "ravan fancy dress" another 210/mo. The slug `ravan-fancy-dress` is held
 *     by a product soft-deleted on 3 Aug 2026, so phase 1 frees it first.
 *
 *   hanuman-yellow-dress -> hanuman-yellow-fancy-dress
 *     Brings it in line with every sibling and with "hanuman fancy dress"
 *     (590/mo). No collision.
 *
 * Phase 3 is the valuable half. `/products/ravan-fancy-dress-costume-black`
 * ranked #18 for "ravan dress" (590/mo) in the June export, was soft-deleted on
 * 3 Aug 2026 and has been a 404 ever since with no redirect. The new Raavan
 * product is its direct replacement, so both dead Ravan URLs are pointed at it.
 *
 * Not touched here, because they need a call that is not mine to make:
 *   - vanvasi-ram duplicates the live vanvasi-ram-fancy-dress (same costume,
 *     older page has the better worn photo) — that is a merge, not a rename.
 *   - hanuman-ji-fancy-dress sits next to the live
 *     hanuman-ji-fancy-dress-for-ramleela. Different costumes, near-identical
 *     names.
 *
 * Dry run:  npx tsx scripts/rename-ramleela-slugs.ts
 * Apply:    npx tsx scripts/rename-ramleela-slugs.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')

/** Soft-deleted since 3 Aug 2026 and 404 either way — renaming only frees the slug. */
const FREE_TOMBSTONE = {
  from: 'ravan-fancy-dress',
  to: 'ravan-fancy-dress-legacy-2026-03',
}

const RENAMES = [
  {
    from: 'raavan-black-dress',
    to: 'ravan-fancy-dress',
    name: 'Ravan Fancy Dress',
  },
  {
    from: 'hanuman-yellow-dress',
    to: 'hanuman-yellow-fancy-dress',
    name: 'Hanuman Yellow Fancy Dress',
  },
]

/** Dead URLs to point at the new live Ravan page. */
const RECOVER = ['ravan-fancy-dress-costume-black']

type Redirect = { source: string; destination: string; permanent: boolean }

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  // ---- Phase 1: free the tombstone slug ----
  console.log('=== PHASE 1: FREE TOMBSTONE SLUG ===')
  {
    const { data: t } = await sb
      .from('products')
      .select('id, name, deleted_at')
      .eq('slug', FREE_TOMBSTONE.from)
      .maybeSingle()
    if (!t) {
      console.log('   ✔ slug already free — skipping')
    } else if (!t.deleted_at) {
      console.error(`   ❌ ${FREE_TOMBSTONE.from} is LIVE ("${t.name}") — aborting, will not touch it`)
      process.exit(1)
    } else {
      console.log(`   ${FREE_TOMBSTONE.from} -> ${FREE_TOMBSTONE.to}  (deleted ${t.deleted_at.slice(0, 10)}, "${t.name}")`)
      if (APPLY) {
        const { error } = await sb
          .from('products')
          .update({ slug: FREE_TOMBSTONE.to })
          .eq('id', t.id)
        console.log(error ? `   ❌ ${error.message}` : '   ✅ freed')
      }
    }
  }

  // ---- Phase 2: rename the new products ----
  console.log('\n=== PHASE 2: RENAME SLUG + NAME ===')
  for (const r of RENAMES) {
    const { data: prod } = await sb
      .from('products')
      .select('id, name, slug')
      .eq('slug', r.from)
      .maybeSingle()

    if (!prod) {
      const { data: already } = await sb
        .from('products')
        .select('id')
        .eq('slug', r.to)
        .maybeSingle()
      console.log(`${r.from}: ${already ? '✔ already renamed' : '❌ not found'}`)
      continue
    }

    const { data: clash } = await sb
      .from('products')
      .select('id, name, deleted_at')
      .eq('slug', r.to)
      .maybeSingle()
    if (clash && clash.id !== prod.id) {
      // On a dry run phase 1 has not actually written, so the tombstone it is
      // about to free still holds the target slug. That is not a real clash.
      const freedInPhase1 = !APPLY && r.to === FREE_TOMBSTONE.from && !!clash.deleted_at
      if (!freedInPhase1) {
        console.error(`${r.from}: ❌ target ${r.to} taken by "${clash.name}" — skipping`)
        continue
      }
      console.log(`   (target currently held by the tombstone phase 1 frees)`)
    }

    console.log(`${r.from}`)
    console.log(`   slug: ${r.from} -> ${r.to}`)
    console.log(`   name: ${prod.name} -> ${r.name}`)
    if (APPLY) {
      const { error } = await sb
        .from('products')
        .update({ slug: r.to, name: r.name })
        .eq('id', prod.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ renamed')
    }
  }

  // ---- Phase 3: redirects ----
  console.log('\n=== PHASE 3: REDIRECTS ===')
  {
    const existing: Redirect[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
    const seen = new Set(existing.map((e) => e.source))

    const ravanTarget = RENAMES.find((r) => r.to === 'ravan-fancy-dress')!.to
    const pairs: Array<[string, string]> = [
      // renamed products: old slug -> new slug
      ...RENAMES.map((r) => [r.from, r.to] as [string, string]),
      // deleted Ravan URLs -> the new live Ravan page
      ...RECOVER.map((s) => [s, ravanTarget] as [string, string]),
    ]

    const added: Redirect[] = []
    for (const [from, to] of pairs) {
      for (const prefix of ['/products', '/wholesale']) {
        const source = `${prefix}/${from}`
        const destination = `${prefix}/${to}`
        if (seen.has(source)) {
          console.log(`   ✔ already present: ${source}`)
          continue
        }
        added.push({ source, destination, permanent: true })
        seen.add(source)
        console.log(`   + ${source}  ->  ${destination}`)
      }
    }

    if (!added.length) {
      console.log('   (nothing to add)')
    } else if (APPLY) {
      writeFileSync(REDIRECTS_PATH, JSON.stringify([...existing, ...added], null, 2) + '\n')
      console.log(`   ✅ ${added.length} redirects written (${existing.length} -> ${existing.length + added.length})`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
