/**
 * One-off: fix dead-keyword spellings in three product slugs.
 *
 * "lehnga" and "dandia" have zero search volume in the Semrush export;
 * "lehenga" and "dandiya" have volume. These products were 4 days old with no
 * rankings or backlinks, so the rename window was effectively free.
 *
 * Redirects for the old URLs (both /products/ and /wholesale/) are added to
 * redirects.json in the same commit.
 *
 * Dry run:  npx tsx scripts/rename-lehenga-slugs.ts
 * Apply:    npx tsx scripts/rename-lehenga-slugs.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')

/**
 * `name` is renamed alongside `slug` because it renders as the product page
 * <h1> — a stronger ranking signal than the URL, and it was carrying the same
 * dead spellings.
 */
export const RENAMES: { from: string; to: string; name: string }[] = [
  { from: 'blue-lehnga-dandia-dress', to: 'blue-lehenga-dandiya-dress', name: 'Blue Lehenga Dandiya Dress' },
  { from: 'pink-lehnga-dandiya-dress', to: 'pink-lehenga-dandiya-dress', name: 'Pink Lehenga Dandiya Dress' },
  { from: 'dandiya-fancy-dress-lehnga', to: 'dandiya-fancy-dress-lehenga', name: 'Dandiya Fancy Dress Lehenga' },
]

/**
 * Older products (Mar–Apr 2026) carrying the same dead "lehnga" spelling.
 * Deliberately NOT slug-renamed: they are months old and may hold rankings and
 * links, and a URL keyword is a weak signal — not worth the risk. Only the
 * user-visible name (the product page <h1>) and any stale seo_title are fixed,
 * which costs nothing and needs no redirect.
 */
const NAME_ONLY: { slug: string; name: string; seo_title?: string }[] = [
  { slug: 'rajasthani-lehnga-fancy-dress', name: 'Rajasthani Lehenga Fancy Dress', seo_title: 'Gota-Patti Rajasthani Lehenga - State Competition' },
  { slug: 'red-haryanvi-lehnga-fancy-dress', name: 'Red Haryanvi Lehenga Fancy Dress' },
  { slug: 'yellow-haryanvi-lehnga-fancy-dress', name: 'Yellow Haryanvi Lehenga Fancy Dress' },
]

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  for (const r of RENAMES) {
    const { data: prod } = await sb
      .from('products')
      .select('id, name, slug')
      .eq('slug', r.from)
      .maybeSingle()

    if (!prod) {
      const { data: already } = await sb
        .from('products').select('id').eq('slug', r.to).maybeSingle()
      console.log(`${r.from}\n   ${already ? '✔ already renamed' : '❌ not found'}`)
      continue
    }

    // Refuse if the target slug is taken by a different product.
    const { data: clash } = await sb
      .from('products').select('id').eq('slug', r.to).maybeSingle()
    if (clash && clash.id !== prod.id) {
      console.error(`${r.from}\n   ❌ target slug ${r.to} already used by another product — skipping`)
      continue
    }

    console.log(`slug: ${r.from}  ->  ${r.to}`)
    console.log(`name: ${prod.name}  ->  ${r.name}`)

    if (APPLY) {
      const { error } = await sb
        .from('products')
        .update({ slug: r.to, name: r.name })
        .eq('id', prod.id)
      if (error) console.error(`   ❌ ${error.message}`)
      else console.log('   ✅ renamed')
    }
  }

  console.log('\n=== NAME-ONLY FIXES (slug deliberately unchanged) ===')
  for (const n of NAME_ONLY) {
    const { data: prod } = await sb
      .from('products').select('id, name, seo_title').eq('slug', n.slug).maybeSingle()
    if (!prod) { console.log(`${n.slug}\n   ❌ not found`); continue }

    const update: Record<string, string> = {}
    if (prod.name !== n.name) update.name = n.name
    if (n.seo_title && prod.seo_title !== n.seo_title) update.seo_title = n.seo_title

    console.log(`${n.slug}`)
    console.log(`   name : ${prod.name}  ->  ${n.name}`)
    if (n.seo_title) console.log(`   title: ${prod.seo_title}  ->  ${n.seo_title}`)
    if (!Object.keys(update).length) { console.log('   ✔ already correct'); continue }

    if (APPLY) {
      const { error } = await sb.from('products').update(update).eq('id', prod.id)
      if (error) console.error(`   ❌ ${error.message}`)
      else console.log('   ✅ updated')
    }
  }
}

if (process.argv[1]?.includes('rename-lehenga-slugs')) {
  main().catch(e => { console.error(e); process.exit(1) })
}
