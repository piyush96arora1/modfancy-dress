import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const blank = (v: string | null | undefined) => !v || !v.trim()

/** Supabase returns an embedded to-one relation as an object, or an array when it can't prove cardinality. */
type Joined = { name?: string } | { name?: string }[] | null
const catName = (c: Joined): string =>
  (Array.isArray(c) ? c[0]?.name : c?.name) ?? '—'

async function main() {
  const { data, error } = await sb
    .from('products')
    .select('id, name, slug, description, meta_description, seo_title, price, created_at, category:categories(name, slug)')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  const rows = data ?? []

  const missingBoth = rows.filter(r => blank(r.description) && blank(r.meta_description))
  const missingDesc = rows.filter(r => blank(r.description) && !blank(r.meta_description))
  const missingMeta = rows.filter(r => !blank(r.description) && blank(r.meta_description))

  console.log(`TOTAL ACTIVE: ${rows.length}`)
  console.log(`  missing BOTH description + meta: ${missingBoth.length}`)
  console.log(`  missing description only       : ${missingDesc.length}`)
  console.log(`  missing meta_description only  : ${missingMeta.length}`)
  console.log(`  fully populated                : ${rows.length - missingBoth.length - missingDesc.length - missingMeta.length}`)

  const needy = [...missingBoth, ...missingDesc, ...missingMeta]
  console.log(`\n=== ${needy.length} PRODUCTS NEEDING WORK (newest first) ===`)
  for (const r of needy) {
    const cat = catName(r.category as Joined)
    const flags = [blank(r.description) ? 'NO-DESC' : '', blank(r.meta_description) ? 'NO-META' : ''].filter(Boolean).join('+')
    console.log(`${(r.created_at || '').slice(0, 10)}  [${flags}]  ${cat}  |  ${r.name}  |  ${r.slug}`)
  }

  console.log(`\n=== SAMPLE OF GOOD EXISTING DESCRIPTIONS (for style matching) ===`)
  const good = rows.filter(r => !blank(r.description) && (r.description || '').length > 150).slice(0, 6)
  for (const r of good) {
    console.log(`\n--- ${r.name} [${catName(r.category as Joined)}] (${(r.description || '').length} chars)`)
    console.log(r.description)
    console.log(`META: ${r.meta_description ?? '(none)'}`)
    console.log(`SEO_TITLE: ${r.seo_title ?? '(none)'}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
