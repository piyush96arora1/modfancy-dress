/**
 * Merge the two live Vanvasi Ram product pages into one.
 *
 * The 19 Sep 2026 Ramleela upload added `vanvasi-ram`, which is the same
 * costume as `vanvasi-ram-fancy-dress` (created 27 Mar 2026). Two live pages
 * for one product split the "vanvasi ram fancy dress" signal between them.
 *
 * The older page wins: it has the better photograph (a child wearing the
 * costume outdoors, 475x716, versus a 300x264 flat-lay), the better slug, and
 * six months of URL history. So this script:
 *
 *   1. writes copy onto the surviving page that is grounded in ITS photo — the
 *      new page's copy mentions a wig that is not in the older shot, so it is
 *      rewritten rather than copied across,
 *   2. adds the survivor to Ramleela Costumes (it was only in Indian
 *      Mythology, which is why it never showed up beside its siblings),
 *   3. soft-deletes `vanvasi-ram` the way the admin panel does, and
 *   4. adds 301s from the retired slug on both /products and /wholesale.
 *
 * Prices are deliberately left alone. The two rows disagree on rent — the
 * survivor says Rs450, the newer upload said Rs600 — and picking one is a
 * pricing decision, not an SEO one. The script prints the mismatch instead.
 *
 * The survivor's existing copy is printed before being overwritten, and also
 * written to scripts/.vanvasi-merge-backup.json, so it can be restored.
 *
 * Dry run:  npx tsx scripts/merge-vanvasi-ram-duplicate.ts
 * Apply:    npx tsx scripts/merge-vanvasi-ram-duplicate.ts --apply
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
const META_MAX = 155
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')
const BACKUP_PATH = resolve(process.cwd(), 'scripts/.vanvasi-merge-backup.json')

const SURVIVOR = 'vanvasi-ram-fancy-dress'
const RETIRED = 'vanvasi-ram'
const RAMLEELA_CATEGORY = 'ramleela-costumes'

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

/**
 * Written against the surviving page's photograph: a child in a saffron kurta
 * and saffron dhoti, orange pom-pom garlands at the neck and in the hair, a
 * bow in hand and a quiver of arrows on the back. No wig in that shot, so no
 * wig is claimed here.
 */
const COPY = {
  name: 'Vanvasi Ram Fancy Dress',
  seo_title: 'Vanvasi Ram Fancy Dress - Ram Costume Kids',
  meta_description:
    'Vanvasi Ram fancy dress for kids — saffron kurta and dhoti with garlands, bow and quiver. Ram costume for Ramleela in Delhi NCR.',
  description:
    'A Vanvasi Ram fancy dress for the exile chapters of the Ramayana — a saffron kurta over a matching saffron dhoti, kept plain and unembroidered the way Ram is shown during the fourteen years in the forest. It is worn with orange pom-pom garlands at the neck and in the hair, and comes with a bow and a quiver of arrows, so the child has something to hold through a speaking scene rather than empty hands. This is the forest Ram of the vanvas, Panchavati and Jatayu scenes; for the crowned king of the rajya-abhishek see our Raja Ram dress instead. A staple of school Ramleela, Ram Navami and Dussehra programmes. Fits most school-age kids. ' +
    STORE_TAIL,
  alt: 'Child wearing a saffron Vanvasi Ram fancy dress with kurta, dhoti, orange garlands, bow and quiver',
}

type Redirect = { source: string; destination: string; permanent: boolean }

async function main() {
  if (COPY.meta_description.length > META_MAX) {
    console.error(`❌ meta too long: ${COPY.meta_description.length}`)
    process.exit(1)
  }

  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  const { data: survivor } = await sb
    .from('products')
    .select('id, name, slug, price, rent_price, rent_deposit, description, meta_description, seo_title, category_id, deleted_at')
    .eq('slug', SURVIVOR)
    .maybeSingle()
  const { data: retired } = await sb
    .from('products')
    .select('id, name, slug, price, rent_price, rent_deposit, deleted_at')
    .eq('slug', RETIRED)
    .maybeSingle()

  if (!survivor) {
    console.error(`❌ survivor ${SURVIVOR} not found — aborting`)
    process.exit(1)
  }
  if (survivor.deleted_at) {
    console.error(`❌ survivor ${SURVIVOR} is soft-deleted — aborting`)
    process.exit(1)
  }

  // ---- Phase 1: price mismatch report (no writes) ----
  console.log('=== PHASE 1: PRICE CHECK (report only) ===')
  if (!retired) {
    console.log('   retired row already gone — skipping comparison')
  } else {
    const fields = ['price', 'rent_price', 'rent_deposit'] as const
    let differs = false
    for (const f of fields) {
      const a = survivor[f]
      const b = retired[f]
      if (a !== b) {
        differs = true
        console.log(`   ⚠ ${f}: survivor ₹${a}  vs  retired ₹${b}  — survivor's value kept`)
      }
    }
    if (!differs) console.log('   ✔ prices match')
  }

  // ---- Phase 2: copy onto the survivor ----
  console.log('\n=== PHASE 2: COPY ONTO SURVIVOR ===')
  {
    const backup = {
      backed_up_at: new Date().toISOString(),
      slug: survivor.slug,
      name: survivor.name,
      seo_title: survivor.seo_title,
      meta_description: survivor.meta_description,
      description: survivor.description,
    }
    console.log('   replacing existing copy — previous values:')
    console.log(`     name:  ${survivor.name}`)
    console.log(`     title: ${survivor.seo_title}`)
    console.log(`     meta:  ${survivor.meta_description?.slice(0, 80)}…`)
    console.log(`   new title: ${COPY.seo_title} (${COPY.seo_title.length})`)
    console.log(`   new meta:  ${COPY.meta_description.length} chars | desc ${COPY.description.length}`)

    if (APPLY) {
      writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2) + '\n')
      console.log(`   ↳ previous copy saved to ${BACKUP_PATH.split('/').slice(-2).join('/')}`)
      const { error } = await sb
        .from('products')
        .update({
          name: COPY.name,
          seo_title: COPY.seo_title,
          meta_description: COPY.meta_description,
          description: COPY.description,
        })
        .eq('id', survivor.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  // ---- Phase 3: alt text on the survivor's images ----
  console.log('\n=== PHASE 3: SURVIVOR ALT TEXT ===')
  {
    const { data: imgs } = await sb
      .from('product_images')
      .select('id, alt_text, is_primary')
      .eq('product_id', survivor.id)
    let wrote = 0
    let kept = 0
    for (const img of imgs ?? []) {
      if (img.alt_text?.trim()) {
        kept++
        continue
      }
      if (APPLY) {
        const { error } = await sb
          .from('product_images')
          .update({ alt_text: COPY.alt })
          .eq('id', img.id)
        if (error) {
          console.error(`   ❌ ${error.message}`)
          continue
        }
      }
      wrote++
    }
    console.log(`   ${wrote} alt written, ${kept} kept (${(imgs ?? []).length} images)`)
  }

  // ---- Phase 4: add survivor to Ramleela Costumes ----
  console.log('\n=== PHASE 4: CATEGORY ===')
  {
    const { data: cat } = await sb
      .from('categories')
      .select('id, name')
      .eq('slug', RAMLEELA_CATEGORY)
      .maybeSingle()
    if (!cat) {
      console.error('   ❌ ramleela-costumes not found')
    } else {
      const { data: existing } = await sb
        .from('product_categories')
        .select('product_id')
        .eq('product_id', survivor.id)
        .eq('category_id', cat.id)
        .maybeSingle()
      if (existing) {
        console.log('   ✔ already in Ramleela Costumes')
      } else {
        console.log(`   + junction row -> ${cat.name} (primary category left unchanged)`)
        if (APPLY) {
          const { error } = await sb
            .from('product_categories')
            .upsert(
              { product_id: survivor.id, category_id: cat.id },
              { onConflict: 'product_id,category_id' }
            )
          console.log(error ? `   ❌ ${error.message}` : '   ✅ added')
        }
      }
    }
  }

  // ---- Phase 5: soft-delete the duplicate ----
  console.log('\n=== PHASE 5: RETIRE DUPLICATE ===')
  if (!retired) {
    console.log('   ✔ already gone')
  } else if (retired.deleted_at) {
    console.log('   ✔ already soft-deleted')
  } else {
    console.log(`   soft-delete ${RETIRED} ("${retired.name}")`)
    if (APPLY) {
      const { error } = await sb
        .from('products')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', retired.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ retired')
    }
  }

  // ---- Phase 6: redirects ----
  console.log('\n=== PHASE 6: REDIRECTS ===')
  {
    const existing: Redirect[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
    const seen = new Set(existing.map((e) => e.source))
    const added: Redirect[] = []
    for (const prefix of ['/products', '/wholesale']) {
      const source = `${prefix}/${RETIRED}`
      if (seen.has(source)) {
        console.log(`   ✔ already present: ${source}`)
        continue
      }
      added.push({ source, destination: `${prefix}/${SURVIVOR}`, permanent: true })
      console.log(`   + ${source}  ->  ${prefix}/${SURVIVOR}`)
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
