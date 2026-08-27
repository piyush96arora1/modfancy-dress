/**
 * Catches products whose category wiring would quietly degrade their page.
 *
 * A product filed under a switched-off category still renders, but its size
 * guide (looked up by category id) and its related-products block both come back
 * empty, and its breadcrumb points at a category page that no longer resolves.
 * Nothing errors — the page just silently loses content. This check makes that
 * visible.
 *
 *   npm run check:categories
 *
 * Exits 1 on a product pointing at an inactive category (a regression), and
 * reports — without failing — products with no category and categories with too
 * few products to rank. Those are editorial calls, not build breakers.
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}
const sb = createClient(url, key)

const THIN_CATEGORY_THRESHOLD = 3

async function main() {
  const [{ data: cats, error: catErr }, { data: prods, error: prodErr }, { data: junc, error: juncErr }] =
    await Promise.all([
      sb.from('categories').select('id, name, slug, is_active'),
      sb.from('products').select('id, slug, name, category_id').eq('is_active', true).is('deleted_at', null),
      sb.from('product_categories').select('product_id, category_id'),
    ])
  const err = catErr || prodErr || juncErr
  if (err) {
    console.error(`Could not read from Supabase: ${err.message}`)
    process.exit(1)
  }

  const byId = new Map((cats ?? []).map((c) => [c.id, c]))
  const activeProductIds = new Set((prods ?? []).map((p) => p.id))

  // Pool per category = products whose primary category is it, plus junction members.
  const pool = new Map<string, Set<string>>()
  for (const c of cats ?? []) if (c.is_active) pool.set(c.id, new Set())
  for (const p of prods ?? []) if (p.category_id && pool.has(p.category_id)) pool.get(p.category_id)!.add(p.id)
  for (const j of junc ?? []) {
    if (pool.has(j.category_id) && activeProductIds.has(j.product_id)) pool.get(j.category_id)!.add(j.product_id)
  }

  const deadPrimary = (prods ?? []).filter((p) => p.category_id && !byId.get(p.category_id)?.is_active)
  const noCategory = (prods ?? []).filter((p) => !p.category_id)
  const noLiveCategory = (prods ?? []).filter((p) => {
    const ids = [p.category_id, ...(junc ?? []).filter((j) => j.product_id === p.id).map((j) => j.category_id)]
    return !ids.some((id) => id && byId.get(id)?.is_active)
  })
  const thin = [...pool.entries()]
    .map(([id, set]) => ({ cat: byId.get(id)!, n: set.size }))
    .filter((r) => r.n < THIN_CATEGORY_THRESHOLD)
    .sort((a, b) => a.n - b.n)

  console.log(`Checked ${prods?.length ?? 0} active products across ${pool.size} active categories.\n`)

  if (deadPrimary.length) {
    console.error(`FAIL  ${deadPrimary.length} product(s) filed under a switched-off category:`)
    for (const p of deadPrimary) {
      console.error(`        ${p.slug}  ->  "${byId.get(p.category_id!)?.name}" (inactive)`)
    }
    console.error(`      These pages lose their size guide and related products. Reassign them in the admin panel.\n`)
  } else {
    console.log('OK    no product is filed under a switched-off category')
  }

  if (noCategory.length) {
    console.log(`WARN  ${noCategory.length} product(s) have no category at all:`)
    for (const p of noCategory) console.log(`        ${p.slug}`)
  }
  if (noLiveCategory.length) {
    console.log(`WARN  ${noLiveCategory.length} product(s) belong to no live category, so they show no related products:`)
    for (const p of noLiveCategory) console.log(`        ${p.slug}`)
  }
  if (thin.length) {
    console.log(`WARN  ${thin.length} live categor(ies) hold fewer than ${THIN_CATEGORY_THRESHOLD} products — too thin to rank:`)
    for (const r of thin) console.log(`        ${String(r.n).padStart(2)}  ${r.cat.name}  (/category/${r.cat.slug})`)
  }

  process.exit(deadPrimary.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
