/**
 * One-off backfill: adds description / meta_description / seo_title to active
 * products that were uploaded without them (Aug 2026 Dandiya + Kashmiri batch,
 * and three Independence Day products missing only meta).
 *
 * Copy is written against the product photographs — colours, garment parts and
 * embellishments are what is actually in the images, not generic filler.
 * Keyword targets come from the Semrush gap export in seodata/.
 *
 * Dry run:  npx tsx scripts/backfill-product-descriptions.ts
 * Apply:    npx tsx scripts/backfill-product-descriptions.ts --apply
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
const META_MAX = 158 // generatePageMetadata truncates at 155; stay under

type Patch = {
  slug: string
  description?: string
  meta_description: string
  seo_title: string
}

const PATCHES: Patch[] = [
  {
    slug: 'dandiya-fancy-dress-yellow',
    description:
      'A bright yellow dandiya dress with a navy floral-embroidered choli, a full-flare ghera skirt and a matching dupatta edged in the same floral border. The contrast blouse and puff sleeves photograph well under garba lights, and the skirt carries a proper twirl for dandiya raas. Ideal for Navratri garba nights, dandiya events and college cultural programmes. Sized for adults — WhatsApp us for sizing. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Yellow chaniya choli dandiya dress with navy floral embroidery and full-flare skirt for Navratri garba nights. Buy ₹2000 or rent ₹800 in Delhi NCR.',
    seo_title: 'Yellow Dandiya Chaniya Choli - Navratri Garba',
  },
  {
    slug: 'dandiya-fancy-dress-pink',
    description:
      'A rani pink dandiya dress built for the garba floor — a black choli worked in multicolour floral embroidery with mirror accents, a deep-flare pink skirt with a mirror-and-floral hem border, and a matching pink dupatta. The dark blouse against bright pink reads sharply on stage and in photographs. A favourite for Navratri garba nights, dandiya raas and school cultural programmes. Sized for adults. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Rani pink dandiya dress with mirror-work floral choli and full-flare skirt for Navratri garba nights. Buy ₹2000 or rent ₹800 in Delhi NCR.',
    seo_title: 'Pink Dandiya Dress - Mirror Work Garba Choli',
  },
  {
    slug: 'dandiya-fancy-dress-cream',
    description:
      'A cream chaniya choli with dense pink mirror-work bands across the blouse and a mirror-worked hem on the full-flare skirt, finished with a multicolour leheriya-stripe dupatta. The neutral base lets the mirror work and the striped dupatta do the talking — an elegant alternative to the brighter garba colours. Suits Navratri garba nights, dandiya events and stage performances. Sized for adults. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Cream chaniya choli with pink mirror work and leheriya-stripe dupatta for Navratri garba and dandiya nights. Buy ₹2000 or rent ₹800 in Delhi NCR.',
    seo_title: 'Cream Chaniya Choli - Mirror Work Dandiya Dress',
  },
  {
    slug: 'dandiya-fancy-dress-lehnga',
    description:
      'A navy blue dandiya lehenga in an all-over floral print, paired with a sleeveless floral-embroidered choli with tassel ties and a navy dupatta bordered in pink and gold. The deep base colour and dense floral work make it one of the richer garba looks we stock, and it is cut with a full flare for dandiya raas. Ideal for Navratri nights, garba competitions and cultural programmes. Sized for adults. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Navy floral dandiya lehenga choli with tassel-tie blouse and gold-bordered dupatta for Navratri garba. Buy ₹2000 or rent ₹800 in Delhi NCR.',
    seo_title: 'Navy Floral Dandiya Lehenga Choli - Navratri',
  },
  {
    slug: 'dandiya-gujarati-fancy-dress',
    description:
      'The traditional Gujarati garba look — a mirror-work patchwork choli in yellow, green, blue and red, a multicolour panelled skirt covered in mirror discs with a scalloped green hem, and a rainbow leheriya dupatta. This is the authentic Kutchi-style garba costume most people picture for Navratri, and it carries real presence on a dandiya floor. Sized for adults. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Traditional Gujarati garba costume with mirror-work patchwork choli, multicolour skirt and leheriya dupatta. Buy ₹2250 or rent ₹1000 in Delhi NCR.',
    seo_title: 'Gujarati Garba Costume - Mirror Work Chaniya Choli',
  },
  {
    slug: 'pink-lehnga-dandiya-dress',
    description:
      'A pink and gold dandiya lehenga with a gold floral butta print running through the skirt and a broad zari border at the hem, worn with a black choli embroidered in pink florals and gold. Dressier than a standard garba set, it works equally for Navratri nights, sangeet functions and stage performances, with a full flare for dandiya raas. Sized for adults. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Pink and gold dandiya lehenga with zari border and embroidered black choli for Navratri and sangeet nights. Buy ₹2200 or rent ₹500 in Delhi NCR.',
    seo_title: 'Pink Gold Dandiya Lehenga - Navratri & Sangeet',
  },
  {
    slug: 'blue-lehnga-dandia-dress',
    description:
      'A navy blue floor-length dandiya dress with a gold mirror-worked bodice and a full-flare skirt banded in gota lace and multicolour pom-pom trim at the hem. The single-piece cut is easier to move in than a separate choli and skirt, which makes it a practical choice for a long garba night. Suits Navratri events, dandiya nights and cultural programmes. Sized for adults. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Navy blue dandiya dress with gold mirror-work bodice, gota lace and pom-pom hem for Navratri garba nights. Buy ₹1800 or rent ₹350 in Delhi NCR.',
    seo_title: 'Blue Dandiya Dress - Gota & Mirror Work Navratri',
  },
  {
    slug: 'kashmiri-fancy-dress',
    description:
      'A Kashmiri dress for girls in maroon velvet — an embroidered pheran-style kurta with white thread work and a green velvet collar, worn over matching green velvet salwar with a gold hem band. Warm, comfortable and instantly recognisable, it is one of the most-picked looks for Kashmiri fancy dress competitions, state costume days and "Unity in Diversity" school programmes. Available for kids — WhatsApp us for sizing. Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
    meta_description:
      'Kashmiri dress for girls in maroon velvet with embroidered pheran and green salwar for state costume competitions. Buy ₹1500 or rent ₹1000, Delhi NCR.',
    seo_title: 'Kashmiri Dress for Girls - State Fancy Dress',
  },

  // --- description already present, meta + title missing ---
  {
    slug: 'police-fancy-dress',
    meta_description:
      "Realistic kids' police uniform for Republic Day, community helper theme days and school fancy dress competitions. Buy ₹650 or rent ₹400 in Delhi NCR.",
    seo_title: 'Police Fancy Dress for Kids - Republic Day',
  },
  {
    slug: 'subhash-chander-bose-fancy-dress',
    meta_description:
      'Netaji Subhas Chandra Bose costume with INA-style cap and uniform jacket for Republic Day and Independence Day. Buy ₹650 or rent ₹400 in Delhi NCR.',
    seo_title: 'Subhas Chandra Bose Costume - Netaji 15 August',
  },
  {
    slug: 'mangal-pandey-fancy-dress',
    meta_description:
      'Mangal Pandey costume in 1857 period styling for Republic Day, Independence Day and history fancy dress competitions. Buy ₹1000 or rent ₹600, Delhi NCR.',
    seo_title: 'Mangal Pandey Costume - 1857 Freedom Fighter',
  },
]

async function main() {
  // --- guard: meta lengths ---
  const tooLong = PATCHES.filter(p => p.meta_description.length > META_MAX)
  if (tooLong.length) {
    console.error('❌ meta_description over limit:')
    tooLong.forEach(p => console.error(`   ${p.slug}: ${p.meta_description.length}`))
    process.exit(1)
  }

  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  for (const p of PATCHES) {
    const { data: existing, error } = await sb
      .from('products')
      .select('id, name, description, meta_description, seo_title')
      .eq('slug', p.slug)
      .single()

    if (error || !existing) {
      console.error(`❌ ${p.slug}: not found`)
      continue
    }

    // Never clobber copy that already exists.
    const update: Record<string, string> = {}
    if (p.description && !existing.description?.trim()) update.description = p.description
    if (!existing.meta_description?.trim()) update.meta_description = p.meta_description
    if (!existing.seo_title?.trim()) update.seo_title = p.seo_title

    const skipped = [
      p.description && existing.description?.trim() ? 'desc(kept)' : '',
      existing.meta_description?.trim() ? 'meta(kept)' : '',
      existing.seo_title?.trim() ? 'title(kept)' : '',
    ].filter(Boolean).join(' ')

    console.log(`${p.slug}`)
    console.log(`   writing: ${Object.keys(update).join(', ') || '(nothing)'}${skipped ? `   | ${skipped}` : ''}`)
    console.log(`   meta ${p.meta_description.length} chars | desc ${p.description?.length ?? '—'} chars`)

    if (APPLY && Object.keys(update).length) {
      const { error: upErr } = await sb.from('products').update(update).eq('id', existing.id)
      if (upErr) console.error(`   ❌ ${upErr.message}`)
      else console.log('   ✅ written')
    }
  }

  // --- fix the orphaned product: no category_id AND no junction row ---
  const ORPHAN = 'dandiya-fancy-dress-lehnga'
  const { data: cat } = await sb.from('categories').select('id, name').eq('slug', 'dandiya-dress').single()
  const { data: orphan } = await sb.from('products').select('id, category_id').eq('slug', ORPHAN).single()

  console.log(`\n=== ORPHAN FIX: ${ORPHAN} ===`)
  if (!cat || !orphan) {
    console.error('   ❌ category or product not found')
  } else if (orphan.category_id) {
    console.log('   already has a category — skipping')
  } else {
    console.log(`   assign category_id -> ${cat.name} (${cat.id})`)
    if (APPLY) {
      const { error: e1 } = await sb.from('products').update({ category_id: cat.id }).eq('id', orphan.id)
      const { error: e2 } = await sb.from('product_categories')
        .upsert({ product_id: orphan.id, category_id: cat.id }, { onConflict: 'product_id,category_id' })
      if (e1 || e2) console.error(`   ❌ ${e1?.message ?? ''} ${e2?.message ?? ''}`)
      else console.log('   ✅ category assigned + junction row added')
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
