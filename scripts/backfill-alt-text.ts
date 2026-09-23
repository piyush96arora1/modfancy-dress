/**
 * Fill empty product_images.alt_text for every live product with generated alt text
 * (lib/seo/alt-text.ts): "<name>[ for <audience>] – [view N,] <primary category>, Mod Fancy
 * Dress Delhi".
 *
 * Why: Google Images is the site's biggest search surface (723k impressions in 90 days,
 * average position 30) and 152 live products had no alt text, so the gallery fell back to
 * "<name> Main Image".
 *
 * Guards:
 * - Live products only (is_active = true AND deleted_at IS NULL).
 * - Never overwrites alt text: images with non-empty alt_text are skipped, and the UPDATE
 *   itself is filtered on alt_text being NULL/empty, so copy written by someone else
 *   between the read and the write survives.
 * - Touches product_images.alt_text and nothing else.
 *
 * View numbers follow the gallery order (primary first, then `order`), so "view 2" is the
 * second thumbnail a shopper sees.
 *
 * Products in the Navratri and Ramleela categories are skipped by default: Tasks 1 and 4
 * of the festival plan write photo-specific alt text for them, and this script's generic
 * text would otherwise get there first and be kept by their never-overwrite guard. Pass
 * --include-festival once those tasks have run, to fill whatever they left empty.
 *
 * Dry run:  npx tsx scripts/backfill-alt-text.ts
 * Apply:    npx tsx scripts/backfill-alt-text.ts --apply [--include-festival]
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { buildAltText, inferAudience } from '../lib/seo/alt-text'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')
const INCLUDE_FESTIVAL = process.argv.includes('--include-festival')
/** Categories whose alt text the Navratri (Task 1) and Ramleela (Task 4) work owns. */
const FESTIVAL_CATEGORY_SLUGS = new Set(['garba-dress', 'dandiya-dress', 'ramleela-costumes'])

type Img = { id: string; alt_text: string | null; is_primary: boolean | null; order: number | null }
type Row = {
  id: string
  slug: string
  name: string
  description: string | null
  category: { name: string; slug: string } | null
  product_categories: { category: { name: string; slug: string } | null }[]
  product_images: Img[]
}

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  const { data, error } = await sb
    .from('products')
    .select(
      'id, slug, name, description, category:categories!products_category_id_fkey(name, slug), product_categories(category:categories(name, slug)), product_images(id, alt_text, is_primary, order)'
    )
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('slug')
  if (error) throw error

  const rows = (data ?? []) as unknown as Row[]
  let products = 0
  let written = 0
  let kept = 0
  let failed = 0
  let deferred = 0
  const audiences: Record<string, number> = {}

  for (const p of rows) {
    const gallery = [...p.product_images].sort(
      (a, b) => Number(!!b.is_primary) - Number(!!a.is_primary) || (a.order ?? 0) - (b.order ?? 0)
    )
    const todo = gallery
      .map((img, index) => ({ img, index }))
      .filter(({ img }) => !img.alt_text?.trim())
    kept += gallery.length - todo.length
    if (todo.length === 0) continue

    const slugs = [p.category?.slug, ...p.product_categories.map((pc) => pc.category?.slug)]
    if (!INCLUDE_FESTIVAL && slugs.some((s) => s && FESTIVAL_CATEGORY_SLUGS.has(s))) {
      deferred += todo.length
      console.log(`${p.slug}  deferred to the festival tasks (${todo.length} empty)`)
      continue
    }
    products++

    const categoryNames = [
      p.category?.name,
      ...p.product_categories.map((pc) => pc.category?.name),
    ].filter((n): n is string => !!n)
    const audience = inferAudience(p.name, categoryNames, p.description)
    audiences[audience ?? 'none'] = (audiences[audience ?? 'none'] ?? 0) + 1

    console.log(`${p.slug}  [${audience ?? '-'}]  ${todo.length}/${gallery.length} empty`)
    for (const { img, index } of todo) {
      const alt = buildAltText({ name: p.name, categoryName: p.category?.name, audience }, index)
      console.log(`   ${index}: ${alt}`)
      if (!APPLY) {
        written++
        continue
      }
      const { data: upd, error: e } = await sb
        .from('product_images')
        .update({ alt_text: alt })
        .eq('id', img.id)
        .or('alt_text.is.null,alt_text.eq.')
        .select('id')
      if (e) {
        failed++
        console.error(`   ❌ ${e.message}`)
      } else if (!upd?.length) {
        kept++
        console.log('   ↷ filled by someone else since the read, kept')
      } else {
        written++
      }
    }
  }

  console.log(
    `\n${APPLY ? 'Wrote' : 'Would write'} ${written} alt texts across ${products} products; ` +
      `${kept} images already had alt text; ${failed} failed; ` +
      `${deferred} deferred (festival categories${INCLUDE_FESTIVAL ? '' : ', pass --include-festival'}).`
  )
  console.log('Audience inferred:', audiences)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
