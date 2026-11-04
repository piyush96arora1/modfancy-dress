/**
 * Remove published rent rates from all copy (owner decision, 4 Nov 2026).
 *
 * In Aug 2026 the owner decided rent rates are not published: a costume shows
 * "Available on rent" and the customer asks for the rate on WhatsApp
 * (docs/superpowers/specs, commit 581ac99). Copy kept quoting them anyway: on
 * 4 Nov, 338 product metas ("Buy ₹X or rent ₹Y"), 11 product titles
 * ("– Rent ₹300"), 29 descriptions, 21 category metas, 16 category descriptions
 * and 7 blog posts. The owner reconfirmed "do not show rent prices" on 4 Nov.
 *
 * What stays: the buy price; the site-wide "from ₹200" entry line kept by the
 * Aug decision; the deposit range "₹500–₹2,000". What goes: every per-costume or
 * per-category rent figure and per-costume deposit figure, and deposit tiers keyed
 * to rent brackets (they reveal the rent band).
 *
 * Rewrites are rule-based. Anything with a rent/deposit figure the rules don't
 * cover is listed as LEFTOVER and the run refuses to apply until it's handled.
 *
 * Dry run:  npx tsx scripts/followups/remove-rent-prices-2026-11.ts
 * Apply:    npx tsx scripts/followups/remove-rent-prices-2026-11.ts --apply
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { sb } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
const N = String.raw`₹\s?\d+(?:,\d{2,3})*(?!\d|,\d)`

/** Ordered rules; each is applied to every field. */
const RULES: [RegExp, string][] = [
  // one-off phrasings found in the 4 Nov dry run
  [new RegExp(String.raw`rent from ${N} per costume per event`, 'g'), 'rent per costume per event'],
  [/The deposit depends on the costume: ₹500 for costumes up to ₹200 rent, ₹1,000 for ₹201 to ₹500 rent, and ₹2,000 above that\./g, 'The deposit is ₹500–₹2,000, depending on the costume.'],
  [/with a refundable deposit: ₹500 for costumes that rent for up to ₹200, ₹1,000 for ₹201 to ₹500, and ₹2,000 above that\./g, 'with a refundable deposit of ₹500–₹2,000, depending on the costume.'],
  [new RegExp(String.raw`rent it for the function at ${N} against a refundable ${N} deposit`, 'g'), 'rent it for the function against a refundable deposit'],
  [new RegExp(String.raw`Most costumes rent for ${N}\s?(?:–|-|to)\s?${N} per event`, 'g'), 'Every costume is available on rent per event'],
  [new RegExp(String.raw`and renting starts at ${N},`, 'g'), 'and every one can be rented,'],
  [new RegExp(String.raw`, at ${N} rent\.`, 'g'), ', and available on rent.'],
  // deposit tiers keyed to rent brackets
  [new RegExp(String.raw`(?:a |the )?(?:refundable )?(?:security )?deposit[^.]{0,40}?: ?${N} (?:deposit )?for costumes up to ${N} rent, ${N} for ${N}\s?(?:–|-|to) ?${N}(?: rent)?,? and ${N} (?:for costumes )?above (?:that|${N}(?: rent)?)`, 'gi'), 'a refundable deposit of ₹500–₹2,000 depending on the costume'],
  [new RegExp(String.raw`${N} for costumes up to ${N} rent, ${N} for ${N}\s?(?:–|-|to) ?${N}(?: rent)?,? and ${N} (?:for costumes )?above (?:that|${N}(?: rent)?)`, 'gi'), '₹500–₹2,000 depending on the costume'],
  // product meta / title phrases
  [new RegExp(String.raw`(Buy ${N}) or rent ${N}(?:/event| per event)?`, 'g'), '$1 or rent'],
  [new RegExp(String.raw`(buy (?:from |for )?${N}),? or rent (?:from |for )?${N}(?:/event| per event)?`, 'gi'), '$1, or rent'],
  [new RegExp(String.raw`Rent (?:from )?${N}(?:/event| per event)? or buy`, 'g'), 'Rent or buy'],
  [new RegExp(String.raw`rent (?:from )?${N}(?:/event| per event)? or buy`, 'g'), 'rent or buy'],
  [new RegExp(String.raw`(–|-|,) ?Rent ${N}(?:/event)?`, 'g'), '$1 Buy or Rent'],
  // description sentences
  [new RegExp(String.raw`Rent it for ${N}(?: per event)?`, 'g'), 'Rent it for an event'],
  [new RegExp(String.raw`rent it for ${N}(?: per event)?`, 'g'), 'rent it for an event'],
  [new RegExp(String.raw`(?:a )?refundable (?:security )?deposit of ${N}(?!\s?(?:–|-|to)\s?₹)`, 'g'), 'a refundable deposit'],
  [new RegExp(String.raw`It rents for ${N}(?: per event)?`, 'g'), 'It is available on rent'],
  [new RegExp(String.raw`rents for ${N}(?: per event)?`, 'g'), 'is available on rent'],
  [new RegExp(String.raw`Rent from ${N}(?:/event| per event)?`, 'g'), 'Rent per event'],
  [new RegExp(String.raw`rent from ${N}(?:/event| per event)?`, 'g'), 'rent per event'],
  [new RegExp(String.raw`on rent (?:from|for) ${N}(?:/event| per event)?`, 'g'), 'on rent'],
  [new RegExp(String.raw`rent (?:at|for) ${N}(?:/event| per event)?`, 'g'), 'rent'],
  [new RegExp(String.raw`(?:R|r)ent ${N}(?:/event| per event)`, 'g'), 'Rent per event'],
  [new RegExp(String.raw`or rent ${N}`, 'g'), 'or rent'],
]

/** Still mentions a rent or deposit figure (₹200 site floor and the ₹500–₹2,000 range allowed). */
function leftover(t: string): string | null {
  t = t.replace(/₹500\s?(?:–|-|to)\s?₹2,000/g, 'DEPOSIT-RANGE')
  // a figure after "rent"/"deposit" with no "buy" in between, or a figure tagged /event, per event, or "rent"
  const re = new RegExp(String.raw`(rent|deposit)(?:(?!buy)[^.₹]){0,25}${N}|${N}\s?(?:/event|per event| rent\b)`, 'gi')
  for (const m of t.matchAll(re)) {
    const s = m[0]
    if (/₹\s?200\b/.test(s) && !/₹\s?200\s?(?:–|-|to)/.test(s)) continue // site-wide "from ₹200" floor
    if (/₹500\s?(?:–|-|to)\s?₹2,000/.test(t.slice(Math.max(0, m.index! - 5), m.index! + s.length + 15))) continue
    return s
  }
  return null
}

function rewrite(t: string | null): string | null {
  if (!t) return t
  let out = t
  for (const [re, to] of RULES) out = out.replace(re, to)
  return out.replace(/ {2,}/g, ' ').replace(/ ,/g, ',')
}

type Row = { table: string; id: string; label: string; field: string; before: string; after: string }

;(async () => {
  const changes: Row[] = []
  const leftovers: string[] = []
  const scan = async (table: string, fields: string[], activeOnly = false) => {
    const base = sb.from(table).select(['id', 'slug', ...fields].join(', '))
    const { data, error } = await (activeOnly ? base.eq('is_active', true).is('deleted_at', null) : base)
    if (error) throw new Error(`${table}: ${error.message}`)
    for (const r of data as unknown as Record<string, string>[]) {
      for (const f of fields) {
        const before = r[f]
        if (!before) continue
        const after = rewrite(before)!
        if (after !== before) changes.push({ table, id: r.id, label: r.slug, field: f, before, after })
        const left = leftover(after)
        if (left) leftovers.push(`${table}.${f} ${r.slug}: "${left}"`)
      }
    }
  }
  await scan('products', ['seo_title', 'meta_description', 'description'], true)
  await scan('categories', ['seo_title', 'meta_description', 'description'])
  await scan('blog_posts', ['title', 'excerpt', 'content'])

  const by = (t: string, f: string) => changes.filter((c) => c.table === t && c.field === f).length
  console.log(`changes: products title ${by('products', 'seo_title')}, meta ${by('products', 'meta_description')}, desc ${by('products', 'description')} | categories meta ${by('categories', 'meta_description')}, desc ${by('categories', 'description')} | blogs ${by('blog_posts', 'content')}`)
  for (const c of changes.filter((c) => c.field !== 'content' && c.field !== 'description').slice(0, 12)) console.log(`\n${c.table}.${c.field} ${c.label}\n  - ${c.before}\n  + ${c.after}`)
  for (const c of changes.filter((c) => c.field === 'content' || c.field === 'description').slice(0, 40)) {
    const a = c.before.split(/(?<=[.!?])\s+/), b = c.after.split(/(?<=[.!?])\s+/)
    const diff = b.filter((s) => !a.includes(s)).slice(0, 3)
    console.log(`\n${c.table}.${c.field} ${c.label}\n  + ${diff.join('\n  + ')}`)
  }
  if (process.argv.includes('--show-all')) {
    for (const c of changes.filter((c) => c.table !== 'products')) {
      const a = c.before.split(/(?<=[.!?])\s+/), b = c.after.split(/(?<=[.!?])\s+/)
      console.log(`\nALL ${c.table}.${c.field} ${c.label}\n  - ${a.filter((x) => !b.includes(x)).join('\n  - ')}\n  + ${b.filter((x) => !a.includes(x)).join('\n  + ')}`)
    }
  }
  const tooLong = changes.filter((c) => c.field === 'meta_description' && c.after.length > 155).map((c) => c.label)
  if (tooLong.length) console.log(`\nmeta > 155 after rewrite: ${tooLong.join(', ')}`)
  console.log(`\nLEFTOVER (${leftovers.length}):\n  ${leftovers.join('\n  ')}`)

  if (!APPLY) return console.log('\nDry run only. Pass --apply to write.')
  if (leftovers.length) throw new Error('leftover rent figures: handle them before applying')
  mkdirSync('.scratch', { recursive: true })
  const backup = `.scratch/rent-price-backup-${Date.now()}.json`
  writeFileSync(backup, JSON.stringify(changes, null, 1))
  console.log(`backup of ${changes.length} original values: ${backup}`)
  for (const c of changes) {
    const { error } = await sb.from(c.table).update({ [c.field]: c.after }).eq('id', c.id)
    if (error) console.log(`❌ ${c.table} ${c.label}.${c.field}: ${error.message}`)
  }
  console.log(`✅ ${changes.length} fields written`)
  await revalidateSite('catalog')
  await revalidateSite('content')
})()
