/**
 * One-off backfill for the 19 Sep 2026 Ramleela batch: 12 active products
 * uploaded with no description, no meta_description, no seo_title and no image
 * alt text, one of them (Rishi) with no category at all.
 *
 * Copy is written against the product photographs — every colour, fabric,
 * garment part and included accessory below is what is actually in the image.
 * All 12 are shot as flat-lays, not worn, so the alt text says so rather than
 * describing a child who is not in the frame.
 *
 * Keyword targets come from the Semrush gap export in seodata/ (17 Jun 2026);
 * the curated per-product lists live in lib/seo/keywords.ts and the same terms
 * are worked into the titles, metas and body copy here. The site ranked nowhere
 * for any of these character terms, with one exception: `ravan dress` (590/mo,
 * KD 15) where modfancydress.com sat at #18 — so the Raavan copy carries the
 * "ravan"/"ravana" spellings that have the volume. The slug originally spelt it
 * "raavan"; scripts/rename-ramleela-slugs.ts fixed that the same day, and the
 * two renamed slugs below are the post-rename ones.
 *
 * The "Ramleela Costumes" category already has description, seo_title and
 * meta_description, so this script does not touch it.
 *
 * Dry run:  npx tsx scripts/backfill-ramleela-descriptions.ts
 * Apply:    npx tsx scripts/backfill-ramleela-descriptions.ts --apply
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
const META_MAX = 155 // generatePageMetadata truncates above this

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

type Patch = {
  slug: string
  description: string
  meta_description: string
  seo_title: string
  /** Every product in this batch has a single flat-lay photo. */
  alt: string
}

const PATCHES: Patch[] = [
  // ---------------- Ram ----------------
  {
    slug: 'raja-ram-fancy-dress',
    description:
      'A Raja Ram dress cut as a short red kurta in the coronation style — a deep V yoke worked in gold zari with mirror inserts and sequin outlines, short sleeves finished with gold brocade cuffs, a red booti-print body, and paisley panels over the hips above a gold fringed hem. This is the crowned Ayodhya Ram of the rajya-abhishek scene rather than the forest years, so it is the one to pick when the script calls for Ram on the throne or leading the Dussehra procession. Pairs with a mukut, bow and quiver from our accessories. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Raja Ram dress for kids — red and gold brocade kurta with mirror-work yoke. Buy ₹1300 or rent ₹1000 in Delhi NCR.',
    seo_title: 'Raja Ram Dress - Shri Ram Costume for Kids',
    alt: 'Raja Ram fancy dress for kids laid flat — red kurta with gold zari yoke, mirror work and fringed hem',
  },
  {
    slug: 'vanvasi-ram',
    description:
      'A Vanvasi Ram fancy dress for the exile chapters — a plain saffron kurta with a matching saffron dhoti, kept deliberately unembroidered the way Ram is shown during the fourteen years in the forest. The set arrives complete: a long black wig for the jata, two orange pom-pom garlands, and a blue-and-white striped quiver with gold trim. Because everything a teacher needs is in one bag, it is the easier Ram costume to hand a parent the night before an annual function. For the crowned-king scenes see our Raja Ram dress instead. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Vanvasi Ram fancy dress for kids — saffron kurta and dhoti with wig, garlands and quiver. Buy ₹900 or rent ₹600 in Delhi NCR.',
    seo_title: 'Vanvasi Ram Fancy Dress - Ram Costume Set',
    alt: 'Vanvasi Ram fancy dress set laid flat — saffron kurta and dhoti with black wig, orange garlands and a quiver',
  },

  // ---------------- Hanuman ----------------
  {
    slug: 'hanuman-ji-fancy-dress',
    description:
      'The simplest Hanuman fancy dress we stock and the cheapest way to put a child on stage as Bajrangbali — a red full-sleeve top with a gold oval patch on the chest carrying "राम" in Devanagari, gold lace at the cuffs and hem, and matching red shorts trimmed the same way. There is no heavy velvet or zari here, which is the point: it is light, it moves, and a child can run and jump through a full Ramleela act or a vanar sena group dance without overheating. Add a Hanuman mask, gada and tail from our accessories to finish the look. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Hanuman fancy dress for kids — red top and shorts with gold trim and Ram chest patch. Buy ₹650 or rent ₹450 in Delhi NCR.',
    seo_title: 'Hanuman Fancy Dress for Kids - Red Costume',
    alt: 'Hanuman fancy dress for kids laid flat — red top with gold Ram chest patch and matching red shorts',
  },
  {
    slug: 'hanuman-red-fancy-dress',
    description:
      'A red Hanuman fancy dress with real stage weight — deep red velvet with gold zari stripes radiating out across the sleeves and chest, a magenta jewelled V-yoke at the neck, a twisted gold cord at the waist, and a pointed front panel carrying green-and-gold leaf motifs above a gold fringed hem. The velvet holds its shape and catches hall lighting in a way the plain cotton Hanuman set cannot, so this is the one to choose when the child has a lead speaking role rather than a place in the vanar sena. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Red Hanuman fancy dress for kids — velvet tunic with gold zari stripes and jewelled yoke. Buy ₹1200 or rent ₹800 in Delhi NCR.',
    seo_title: 'Red Hanuman Fancy Dress - Velvet Costume',
    alt: 'Red Hanuman fancy dress laid flat — red velvet tunic with radiating gold zari stripes and jewelled yoke',
  },
  {
    // renamed to `hanuman-yellow-fancy-dress` on 19 Sep 2026
    slug: 'hanuman-yellow-fancy-dress',
    description:
      'A yellow Hanuman dress in mustard-gold, the shade associated with Bajrangbali in most temple depictions — gold zari worked in a criss-cross lattice across the chest, a turquoise beaded leaf motif at the yoke, a gold belt with hanging tassels at the waist, and a pointed front flap edged in gold lace. It reads differently from the usual red Hanuman on a stage full of them, which is worth knowing if a school is fielding several Hanumans and wants the lead to stand apart. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Yellow Hanuman fancy dress for kids — gold zari tunic with turquoise yoke and tasselled belt. Buy ₹1100 or rent ₹800 in Delhi NCR.',
    seo_title: 'Yellow Hanuman Fancy Dress - Zari Costume',
    alt: 'Yellow Hanuman fancy dress laid flat — mustard gold tunic with turquoise beaded yoke and tasselled gold belt',
  },

  // ---------------- Lanka ----------------
  {
    // renamed to `ravan-fancy-dress` on 19 Sep 2026 by scripts/rename-ramleela-slugs.ts
    slug: 'ravan-fancy-dress',
    description:
      'A Ravan dress built to look menacing from the back row — black fabric scattered with gold booti print, a jewelled yoke in gold and yellow set with green and multicolour stones, chevron borders in gold and red down the body, and dense gold fringe along the sleeve edges and hem. Black and gold is the standard palette for the Lankesh scenes and for the Dussehra effigy procession, and the fringe gives the costume movement every time the child turns. Pair it with a ten-head Ravan mukut from our accessories. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Ravan dress for kids — black tunic with gold booti print, jewelled yoke and gold fringe. Buy ₹1100 or rent ₹800 in Delhi NCR.',
    seo_title: 'Ravan Dress - Raavan Fancy Dress for Kids',
    alt: 'Ravan fancy dress for kids laid flat — black tunic with gold booti print, jewelled yoke and gold fringe trim',
  },
  {
    slug: 'meghnath-fancy-dress',
    description:
      'A Meghnath fancy dress in royal blue — a deep V yoke heavy with gold zari and a mirrored jewel at its centre, gold-bordered short sleeves, a blue booti-print body, gold leaf panels across the hips, and banded gold and blue stripes above a fringed hem. Meghnath, also called Indrajit, is Ravan\'s son and the warrior who fells Lakshman, so the costume is deliberately close in build to our Raavan dress while the blue keeps the two apart on stage. Works with a king\'s mukut from our accessories. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Meghnath (Indrajit) fancy dress for kids — royal blue tunic with gold zari yoke. Buy ₹1200 or rent ₹800 in Delhi NCR.',
    seo_title: 'Meghnath Fancy Dress - Indrajit Costume',
    alt: 'Meghnath fancy dress laid flat — royal blue tunic with gold zari yoke, mirror jewel and fringed hem',
  },
  {
    slug: 'kumbhkaran-fancy-dress',
    description:
      'A Kumbhkaran fancy dress cut heavier than the rest of the Lanka set, which suits the giant of the Ramayana — black velvet with a gold zari yoke rising into a crown-shaped motif at the neck, white and silver leaf embroidery across the skirt panels, a gold waistband, a scalloped white-and-gold border along the bottom, and thick gold fringe at the sleeves and hem. It is the most heavily worked costume in this batch and photographs well under stage lights. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Kumbhkaran fancy dress for kids — black velvet tunic with gold zari and white leaf motifs. Buy ₹1300 or rent ₹1000 in Delhi NCR.',
    seo_title: 'Kumbhkaran Fancy Dress - Ramleela Costume',
    alt: 'Kumbhkaran fancy dress laid flat — black velvet tunic with gold zari crown yoke and white leaf embroidery',
  },

  // ---------------- Forest and allies ----------------
  {
    slug: 'jatayu-fancy-dress',
    description:
      'A Jatayu costume that actually reads as the bird — a full-body white faux-fur jumpsuit, a moulded eagle head mask with a hooked yellow beak, painted eyes and a fur crest, and a separate pair of large layered feather wings. Jatayu is the vulture king who tries to stop Ravan carrying Sita away, and it is usually the hardest part to costume in a school Ramleela because nothing in a normal dress-up box comes close. The jumpsuit goes on over the child\'s own clothes and the wings tie on at the back. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Jatayu costume for kids — white fur jumpsuit, eagle mask with yellow beak and feather wings. Buy ₹1000 or rent ₹600 in Delhi NCR.',
    seo_title: 'Jatayu Costume - Ramayana Bird Fancy Dress',
    alt: 'Jatayu costume laid flat — white faux-fur jumpsuit with an eagle head mask and large white feather wings',
  },
  {
    slug: 'jaamvant-fancy-dress',
    description:
      'A Jaamvant fancy dress made as a full black faux-fur jumpsuit with a matching bear head mask and hood. Jaamvant is the bear king who reminds Hanuman of his own strength before the leap to Lanka, and he is a speaking part in most school Ramleela scripts, so the mask is built to sit back off the face rather than muffle the child. The same suit doubles as a plain bear costume for jungle and animal theme fancy dress competitions. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Jaamvant fancy dress for kids — black fur jumpsuit with bear head mask. Buy ₹900 or rent ₹600 in Delhi NCR.',
    seo_title: 'Jaamvant Fancy Dress - Bear Costume Kids',
    alt: 'Jaamvant fancy dress laid flat — black faux-fur full-body jumpsuit with a bear head mask',
  },
  {
    slug: 'rishi-fancy-dress',
    description:
      'A Rishi fancy dress in saffron — a pleated dhoti with a wide gold zari border and gold tassel fringe, worn with a matching angavastram stole bordered and tasselled to match. There is no stitched top, which is how a sage is actually shown: the stole goes over one shoulder and across the chest. It covers every rishi and muni role a Ramleela needs — Vishwamitra, Vashishtha, Valmiki, Narad Muni — and doubles as a sanyasi or sadhu costume for Janmashtami and general mythology fancy dress. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Rishi fancy dress for kids — saffron pleated dhoti with gold zari border and matching angavastram. Buy ₹900 or rent ₹800 in Delhi NCR.',
    seo_title: 'Rishi Fancy Dress - Sanyasi Dhoti Costume',
    alt: 'Rishi fancy dress laid flat — saffron pleated dhoti with gold zari border and matching tasselled angavastram stole',
  },

  // ---------------- Ganesh ----------------
  {
    slug: 'ganesh-fancy-dress',
    description:
      'A Ganesh fancy dress supplied as a complete set — a yellow kurta with a gold-bordered yellow dhoti, a red sash worn diagonally across the chest, a moulded Ganpati head mask with a painted trunk and a gold mukut, and a silver parashu axe prop for the hand. Because the mask and weapon are included, there is nothing left to source separately, which is the usual scramble with a Ganesh costume. Suits school Ramleela and mythology programmes, Ganesh Chaturthi functions and Ganesh Vandana dance items. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Ganesh fancy dress for kids — yellow kurta and dhoti, red sash, Ganpati mask and axe prop. Buy ₹1200 or rent ₹800 in Delhi NCR.',
    seo_title: 'Ganesh Fancy Dress - Ganpati Costume for Kids',
    alt: 'Ganesh fancy dress set laid flat — yellow kurta and dhoti with red sash, Ganpati head mask with gold mukut and a silver axe prop',
  },
]

/** Uploaded with no category_id and no product_categories row — reachable only by direct URL. */
const ORPHAN = { slug: 'rishi-fancy-dress', categorySlug: 'ramleela-costumes' }

async function main() {
  const tooLong = PATCHES.filter((p) => p.meta_description.length > META_MAX)
  if (tooLong.length) {
    console.error('❌ meta_description over limit:')
    tooLong.forEach((p) => console.error(`   ${p.slug}: ${p.meta_description.length}`))
    process.exit(1)
  }

  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  // ---- Phase 1: product copy ----
  console.log('=== PHASE 1: DESCRIPTION / META / TITLE ===')
  for (const p of PATCHES) {
    const { data: existing } = await sb
      .from('products')
      .select('id, name, description, meta_description, seo_title')
      .eq('slug', p.slug)
      .maybeSingle()

    if (!existing) {
      console.error(`❌ ${p.slug}: not found`)
      continue
    }

    // Never clobber copy that already exists.
    const update: Record<string, string> = {}
    if (!existing.description?.trim()) update.description = p.description
    if (!existing.meta_description?.trim()) update.meta_description = p.meta_description
    if (!existing.seo_title?.trim()) update.seo_title = p.seo_title

    const kept = [
      existing.description?.trim() ? 'desc' : '',
      existing.meta_description?.trim() ? 'meta' : '',
      existing.seo_title?.trim() ? 'title' : '',
    ].filter(Boolean)

    console.log(`${p.slug}`)
    console.log(
      `   writing: ${Object.keys(update).join(', ') || '(nothing)'}` +
        `${kept.length ? `   | kept: ${kept.join(', ')}` : ''}`
    )
    console.log(
      `   desc ${p.description.length} | meta ${p.meta_description.length} | title ${p.seo_title.length}`
    )

    if (APPLY && Object.keys(update).length) {
      const { error } = await sb.from('products').update(update).eq('id', existing.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  // ---- Phase 2: image alt text ----
  console.log('\n=== PHASE 2: IMAGE ALT TEXT ===')
  for (const p of PATCHES) {
    const { data: prod } = await sb.from('products').select('id').eq('slug', p.slug).maybeSingle()
    if (!prod) {
      console.error(`❌ ${p.slug}: not found`)
      continue
    }
    const { data: imgs } = await sb
      .from('product_images')
      .select('id, alt_text, is_primary, order')
      .eq('product_id', prod.id)
      .order('order', { ascending: true })

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
          .update({ alt_text: p.alt })
          .eq('id', img.id)
        if (error) {
          console.error(`   ❌ ${p.slug}: ${error.message}`)
          continue
        }
      }
      wrote++
    }
    console.log(`${p.slug}: ${wrote} alt written, ${kept} kept (${(imgs ?? []).length} images)`)
  }

  // ---- Phase 3: orphaned product ----
  console.log('\n=== PHASE 3: ORPHAN FIX ===')
  {
    const { data: cat } = await sb
      .from('categories')
      .select('id, name')
      .eq('slug', ORPHAN.categorySlug)
      .maybeSingle()
    const { data: prod } = await sb
      .from('products')
      .select('id, category_id')
      .eq('slug', ORPHAN.slug)
      .maybeSingle()
    if (!cat || !prod) {
      console.error('   ❌ category or product not found')
    } else if (prod.category_id) {
      console.log('   ✔ already has a category — skipping')
    } else {
      console.log(`   ${ORPHAN.slug}: assign category_id -> ${cat.name}`)
      if (APPLY) {
        const { error: e1 } = await sb
          .from('products')
          .update({ category_id: cat.id })
          .eq('id', prod.id)
        const { error: e2 } = await sb
          .from('product_categories')
          .upsert(
            { product_id: prod.id, category_id: cat.id },
            { onConflict: 'product_id,category_id' }
          )
        console.log(
          e1 || e2
            ? `   ❌ ${e1?.message ?? ''} ${e2?.message ?? ''}`
            : '   ✅ category + junction row set'
        )
      }
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
