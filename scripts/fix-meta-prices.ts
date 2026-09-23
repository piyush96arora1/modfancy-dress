/**
 * Correct stale prices quoted in product meta descriptions.
 *
 * Why: 96 of 321 live products (23 Sep 2026) had a meta saying e.g. "Buy ₹1500 or
 * rent ₹1000" after the catalogue prices changed. The meta is the Google snippet,
 * so a wrong price there is a wrong promise made before the customer even clicks.
 *
 * Only the exact phrase "Buy ₹<n> or rent ₹<n>" is rewritten, and only the two
 * numbers, from the product's current price / rent_price. Anything else is left
 * alone and reported. Products whose rent is above the buy price are skipped — that
 * is a data-entry error for the owner to fix, not something to publish.
 *
 * Usage:
 *   npx tsx scripts/fix-meta-prices.ts          # dry run
 *   npx tsx scripts/fix-meta-prices.ts --apply  # write
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'

config({ path: resolve(__dirname, '../.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const APPLY = process.argv.includes('--apply')

const PHRASE = /Buy ₹\s?\d+(?:,\d{3})* or rent ₹\s?\d+(?:,\d{3})*/
const fmt = (n: number) => String(Math.round(n)) // catalogue copy style: "₹1500", no grouping

async function main() {
  const { data, error } = await sb
    .from('products')
    .select('id, slug, price, rent_price, seo_title, meta_description')
    .eq('is_active', true)
    .is('deleted_at', null)
  if (error) throw error

  let changed = 0
  const skipped: string[] = []
  for (const p of data ?? []) {
    const meta = p.meta_description as string | null
    if (!meta || !PHRASE.test(meta)) continue
    const price = Number(p.price), rent = Number(p.rent_price)
    if (!(price > 0) || !(rent > 0)) { skipped.push(`${p.slug}: missing price or rent`); continue }
    if (rent > price) { skipped.push(`${p.slug}: rent ₹${rent} > buy ₹${price} (owner to check)`); continue }
    const next = meta.replace(PHRASE, `Buy ₹${fmt(price)} or rent ₹${fmt(rent)}`)
    if (next === meta) continue
    const problems = checkCopy({ seoTitle: p.seo_title ?? '', metaDescription: next })
    if (problems.length) { skipped.push(`${p.slug}: ${problems.join('; ')}`); continue }
    changed++
    console.log(`${APPLY ? 'UPDATE' : 'would update'} ${p.slug}\n  - ${meta}\n  + ${next}`)
    if (APPLY) {
      const { error: e } = await sb.from('products').update({ meta_description: next }).eq('id', p.id)
      if (e) throw e
    }
  }
  console.log(`\n${changed} meta(s) ${APPLY ? 'updated' : 'to update'}; ${skipped.length} skipped`)
  skipped.forEach((s) => console.log(`  skip ${s}`))
}

main().catch((e) => { console.error(e); process.exit(1) })
