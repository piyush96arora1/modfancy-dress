/**
 * One-off backfill for the 20 Aug 2026 food-costume batch: 14 active products
 * uploaded with no description, no meta_description, no seo_title and no image
 * alt text, plus a brand-new "Junk food" category with no copy at all.
 *
 * Copy is written against the product photographs — every colour, garment part
 * and construction detail below is what is actually in the images. All 14 are
 * the same build: one printed cut-out board that ties at the shoulders and
 * sides, worn over a plain full-sleeve tee and trousers.
 *
 * Keyword targets come from the Semrush gap export in seodata/ (see the commit
 * message for the volume table). The site ranks nowhere for any of them.
 *
 * Runs in phases so the Maggi rename lands before the copy keyed on its new slug.
 *
 * Dry run:  npx tsx scripts/backfill-food-costume-descriptions.ts
 * Apply:    npx tsx scripts/backfill-food-costume-descriptions.ts --apply
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

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

/**
 * "maggie" returns zero keywords in the Semrush export; "maggi" returns three
 * totalling 420/mo. The packet in the product photo reads "Maggi". The product
 * was one day old with no rankings or backlinks, so the rename window is free.
 * Redirects for both /products/ and /wholesale/ go into redirects.json.
 */
const RENAME = {
  from: 'maggie-fancy-dress',
  to: 'maggi-fancy-dress',
  name: 'Maggi Fancy Dress',
}

type Patch = {
  slug: string
  description: string
  meta_description: string
  seo_title: string
  /** alt text for the worn shot (is_primary) and the flat-lay board shot */
  altWorn: string
  altFlat: string
}

const PATCHES: Patch[] = [
  // ---------------- Fruit Costumes ----------------
  {
    slug: 'strawberry-fancy-dress',
    description:
      'A strawberry fancy dress cut to the shape of the berry — a glossy red board with dimpled golden seeds and a standing green leaf crown at the neck — worn over a matching red full-sleeve tee and red trousers. The board ties at both shoulders and at the sides, so it goes on over the child\'s own clothes in seconds and stays put through a stage routine. One of the most-requested picks for fruit fancy dress competitions and healthy-eating theme days. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Strawberry fancy dress for kids — red berry board with green leaf crown over a matching red tee and trousers. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Strawberry Fancy Dress for Kids - Fruit Costume',
    altWorn: 'Girl wearing a red strawberry fancy dress costume with green leaf crown over a red tee and trousers',
    altFlat: 'Strawberry costume board laid flat showing the printed seeds, green leaves and shoulder ties',
  },
  {
    slug: 'raspberry-fancy-dress',
    description:
      'A raspberry costume in deep berry red — a round board printed with the fruit\'s clustered drupelet texture and finished with a small green calyx and stem at the top — worn over a red full-sleeve tee and red joggers. White ribbon bows at the shoulders and ties at the sides adjust the fit. Less common than the usual apple-and-mango line-up, which makes it an easy stand-out in a fruit fancy dress competition or a nutrition-awareness programme. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Raspberry fancy dress for kids — round berry board with green calyx over a red tee and joggers. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Raspberry Fancy Dress - Fruit Costume for Kids',
    altWorn: 'Girl wearing a round red raspberry fancy dress costume over a red tee and joggers',
    altFlat: 'Raspberry costume board laid flat showing the drupelet print, green calyx and ribbon ties',
  },
  {
    slug: 'kiwi-fruit-fancy-dress',
    description:
      'A kiwi fruit fancy dress cut as a single round slice — bright green flesh with pale streaks radiating from a cream core, a ring of black seeds, and a fuzzy brown rind border — worn over a green full-sleeve tee and green trousers. The cross-section print is bold enough to read from the back of a school hall, which is what makes it work on stage rather than only up close. Suits fruit fancy dress competitions and healthy-food theme programmes. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Kiwi fruit fancy dress for kids — round kiwi slice board with seed detail over a green tee and trousers. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Kiwi Fruit Fancy Dress - Kids Fruit Costume',
    altWorn: 'Girl wearing a round kiwi fruit slice fancy dress costume over a green tee and trousers',
    altFlat: 'Kiwi fruit costume board laid flat showing the green flesh, black seeds and brown rind border',
  },
  {
    slug: 'pomegranate-fancy-dress',
    description:
      'A pomegranate fancy dress showing the fruit cut open — clusters of glossy ruby arils packed against white pith, with a pointed calyx crown standing up at the neck — worn over a deep maroon full-sleeve tee and matching joggers. The anar print carries more detail than most costume boards and holds its richness under stage lighting. A good pick for fruit fancy dress competitions, healthy-eating themes and annual day shows. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Pomegranate (anar) fancy dress for kids — cut-fruit board with ruby arils over a maroon tee and joggers. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Pomegranate Fancy Dress - Anar Fruit Costume',
    altWorn: 'Girl wearing a cut pomegranate fancy dress costume with ruby arils over a maroon tee and joggers',
    altFlat: 'Pomegranate costume board laid flat showing the aril print, white pith and calyx crown',
  },

  // ---------------- Junk Food ----------------
  {
    slug: 'maggi-fancy-dress',
    description:
      'A Maggi fancy dress made as the instantly recognisable yellow 2-Minute Noodles packet — the red Maggi oval, the blue bowl of masala noodles and the 85g pack detailing printed across a large rectangular board — worn over a black full-sleeve tee and black leggings with black shoulder ties. Very little on a junk food fancy dress stage gets recognised faster, which is why it is a regular winner in speech-and-costume rounds. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Maggi fancy dress for kids — yellow 2-Minute Noodles packet board over a black tee and leggings. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Maggi Fancy Dress - Noodles Packet Costume',
    altWorn: 'Girl wearing a yellow Maggi 2-Minute Noodles packet fancy dress costume over a black tee and leggings',
    altFlat: 'Maggi noodles packet costume board laid flat showing the printed wrapper and shoulder ties',
  },
  {
    slug: 'french-fries-fancy-dress',
    description:
      'A french fries fancy dress with real depth — a red carton front topped by a crown of chunky three-dimensional foam fry sticks standing up above it, rather than a flat print — worn over a black full-sleeve tee and black leggings. The raised fries give it a proper fast-food silhouette from the audience, and they spring back into shape after being packed. A favourite for junk food fancy dress competitions and food theme group acts. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'French fries fancy dress for kids — red carton with 3D foam fry sticks over a black tee and leggings. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'French Fries Fancy Dress - Junk Food Costume',
    altWorn: 'Girl wearing a french fries fancy dress costume with red carton and raised foam fries',
    altFlat: 'French fries costume board laid flat showing the red carton and three-dimensional fry sticks',
  },
  {
    slug: 'pizza-fancy-dress',
    description:
      'A pizza fancy dress cut as one full round pie — a melted cheese base loaded with pepperoni rounds, white mushroom slices, black olives and green capsicum strips inside a puffy golden crust — worn over a mustard-yellow full-sleeve tee and matching trousers. The circular board is the widest in our junk food range, so it reads clearly from the back of a school hall. Ideal for junk food theme competitions and annual day. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Pizza fancy dress for kids — round pizza board with pepperoni and veggies over a mustard tee and trousers. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Pizza Fancy Dress - Kids Pizza Costume',
    altWorn: 'Girl wearing a round pizza fancy dress costume over a mustard yellow tee and trousers',
    altFlat: 'Pizza costume board laid flat showing the printed toppings, crust and shoulder ties',
  },
  {
    slug: 'ice-cream-fancy-dress',
    description:
      'An ice cream fancy dress shaped as a full cone — a lattice-textured golden waffle cone below a bright pink scoop topped with dripping chocolate sauce and multicolour sprinkles — worn over a black full-sleeve tee and black leggings with white ribbon ties. The scalloped scoop edge and tall cone give it a clean storybook outline that photographs well on stage. A reliable crowd-pleaser for junk food and dessert theme fancy dress. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Ice cream fancy dress for kids — waffle cone board with pink scoop, chocolate sauce and sprinkles. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Ice Cream Fancy Dress - Cone Costume for Kids',
    altWorn: 'Girl wearing an ice cream cone fancy dress costume with pink scoop and sprinkles',
    altFlat: 'Ice cream cone costume board laid flat showing the waffle cone, pink scoop and ribbon ties',
  },
  {
    slug: 'burger-fancy-dress',
    description:
      'A burger fancy dress stacked the way children draw one — a sesame-seed top bun, frilled green lettuce, tomato slices, purple onion rings, a grilled patty and two folded cheese slices spilling over the base bun — worn over a black full-sleeve tee and black leggings. Each layer is printed with its own shaped edge, so the stack keeps a ragged burger outline instead of flattening into a circle. Ideal for junk food fancy dress competitions. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Burger fancy dress for kids — stacked cheeseburger board with lettuce, tomato and cheese layers. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Burger Fancy Dress - Junk Food Costume for Kids',
    altWorn: 'Girl wearing a stacked cheeseburger fancy dress costume over a black tee and leggings',
    altFlat: 'Burger costume board laid flat showing the sesame bun, lettuce, patty and cheese layers',
  },
  {
    slug: 'coca-cola-fancy-dress',
    description:
      'A Coca Cola fancy dress cut to the shape of a chilled can — a deep red body carrying the white script wordmark and the signature ribbon swoosh across the front, with a silver can rim printed along the neckline — worn over a red full-sleeve tee and red joggers. It pairs naturally with the burger, fries or pizza costume when a class is putting together a group junk food act. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Coca Cola fancy dress for kids — red cola can board with white swoosh over a red tee and joggers. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Coca Cola Fancy Dress - Cold Drink Can Costume',
    altWorn: 'Girl wearing a red Coca Cola can fancy dress costume over a red tee and joggers',
    altFlat: 'Coca Cola can costume board laid flat showing the red wrapper, white swoosh and ties',
  },
  {
    slug: 'lays-fancy-dress',
    description:
      'A Lays fancy dress made as the familiar yellow Classic potato chips packet — the red ribbon logo over a sunburst, a whole potato and a spill of wavy crisps printed below, and crimped seals across the top and bottom — worn over a black full-sleeve tee and black leggings. The tall packet shape covers the child from shoulder to knee, which makes it one of the more forgiving fits in the range. Ideal for junk food theme competitions. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Lays fancy dress for kids — yellow Classic chips packet board over a black tee and leggings. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Lays Fancy Dress - Chips Packet Costume for Kids',
    altWorn: 'Girl wearing a yellow Lays Classic chips packet fancy dress costume over a black tee and leggings',
    altFlat: 'Lays chips packet costume board laid flat showing the printed wrapper and crimped seals',
  },
  {
    slug: 'frooti-fancy-dress',
    description:
      'A Frooti fancy dress built as the tall yellow Tetra Pak — a ripe mango in a splash of juice, the green-outlined wordmark, the Parle Agro badge, the "Fresh \'n\' Juicy Mango Drink" line and a printed straw at the top corner — worn over a black full-sleeve tee and black leggings. The narrow carton shape is a neat change from the round boards most food costumes use. Suits junk food theme competitions and mango or summer theme shows. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Frooti fancy dress for kids — yellow mango drink Tetra Pak board over a black tee and leggings. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Frooti Fancy Dress - Mango Drink Packet Costume',
    altWorn: 'Girl wearing a yellow Frooti mango drink carton fancy dress costume over a black tee and leggings',
    altFlat: 'Frooti mango drink carton costume board laid flat showing the printed pack and shoulder ties',
  },
  {
    slug: 'strawberry-cake-fancy-dress',
    description:
      'A strawberry cake fancy dress with raised detail — glossy pink icing over dark chocolate layers with pink cream running down the sides, topped with moulded chocolate-dipped strawberries and piped icing rosettes that stand off the board — worn over a black full-sleeve tee and black leggings. The three-dimensional fruit reads as a real cake rather than a printed panel. Ideal for dessert and junk food theme fancy dress, and for birthday events. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Strawberry cake fancy dress for kids — pink-iced chocolate cake board with 3D strawberries. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Strawberry Cake Fancy Dress - Cake Costume',
    altWorn: 'Girl wearing a pink strawberry chocolate cake fancy dress costume with moulded strawberries',
    altFlat: 'Strawberry cake costume board laid flat showing the pink icing, chocolate layers and 3D strawberries',
  },
  {
    slug: 'cup-cake-fancy-dress',
    description:
      'A cupcake fancy dress on a soft pink board — a photographic print of a tall swirled buttercream cupcake dusted with cinnamon, a cinnamon stick standing in the top, and a fluted pink paper liner at the base — worn over a black full-sleeve tee and black leggings. The photo-real print gives it a bakery-window look that sets it apart from the cartoon-style food costumes. Suits dessert and junk food theme fancy dress and birthday parties. Fits most school-age kids. ' +
      STORE_TAIL,
    meta_description:
      'Cupcake fancy dress for kids — pink board with swirled buttercream cupcake print over a black tee. Buy ₹750 or rent ₹500 in Delhi NCR.',
    seo_title: 'Cupcake Fancy Dress - Bakery Costume for Kids',
    altWorn: 'Girl wearing a pink cupcake fancy dress costume with swirled buttercream print',
    altFlat: 'Cupcake costume board laid flat showing the buttercream swirl print and pink paper liner',
  },
]

/**
 * The "Junk food" category was created with the batch and has no copy, no image
 * and a name cased unlike every sibling ("Fruit Costumes", "Vegetable
 * Costumes"). `junk food fancy dress` and `fancy dress on junk food` are
 * 320/mo each and this is the page that should hold them. Renaming `name` only
 * touches the <h1> and title — the slug stays `junk-food`, so no redirect.
 */
const CATEGORY = {
  slug: 'junk-food',
  name: 'Junk Food Costumes',
  seo_title: 'Junk Food Fancy Dress Costumes - Buy & Rent',
  meta_description:
    'Junk food fancy dress costumes for kids — pizza, burger, Maggi, fries, ice cream, cola. Buy or rent in Delhi NCR for a junk food theme show.',
  description:
    'Junk food fancy dress is one of the most requested themes for school fancy dress competitions, and schools usually pair it with a healthy-food group so the two sides can be judged against each other. Our junk food costumes cover the whole tray — pizza, burger, french fries, Maggi noodles, Lays chips, Coca Cola, Frooti, ice cream, cupcake and strawberry cake — each built as a printed cut-out board that ties at the shoulders and sides, so it goes on over the child\'s own clothes in seconds. They are light enough for a full day of school events and sturdy enough to be worn again next year. Available to buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi, serving families across Delhi NCR.',
}

/** Coca Cola was uploaded with every price field null; its 13 batch siblings are all identical. */
const PRICE_FIX = {
  slug: 'coca-cola-fancy-dress',
  price: 750,
  rent_price: 500,
  rent_deposit: 1000,
}

/** Uploaded with no category_id and no product_categories row — reachable only by direct URL. */
const ORPHAN = { slug: 'pomegranate-fancy-dress', categorySlug: 'fruit-costumes' }

/**
 * Look a product up by its final slug, falling back to the pre-rename slug so a
 * dry run (where phase 1 has not actually written) still reports every product.
 */
async function findProduct<T extends string>(slug: string, columns: T) {
  const { data } = await sb.from('products').select(columns).eq('slug', slug).maybeSingle()
  if (data) return data
  if (slug !== RENAME.to) return null
  const { data: pre } = await sb
    .from('products').select(columns).eq('slug', RENAME.from).maybeSingle()
  return pre
}

async function main() {
  const tooLong = PATCHES.filter(p => p.meta_description.length > META_MAX)
  if (tooLong.length) {
    console.error('❌ meta_description over limit:')
    tooLong.forEach(p => console.error(`   ${p.slug}: ${p.meta_description.length}`))
    process.exit(1)
  }
  if (CATEGORY.meta_description.length > META_MAX) {
    console.error(`❌ category meta too long: ${CATEGORY.meta_description.length}`)
    process.exit(1)
  }

  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  // ---- Phase 1: spelling rename, before the copy keyed on the new slug ----
  console.log('=== PHASE 1: RENAME maggie -> maggi ===')
  {
    const { data: prod } = await sb
      .from('products').select('id, name, slug').eq('slug', RENAME.from).maybeSingle()
    if (!prod) {
      const { data: already } = await sb
        .from('products').select('id').eq('slug', RENAME.to).maybeSingle()
      console.log(`   ${already ? '✔ already renamed' : '❌ not found'}`)
    } else {
      const { data: clash } = await sb
        .from('products').select('id').eq('slug', RENAME.to).maybeSingle()
      if (clash && clash.id !== prod.id) {
        console.error(`   ❌ target slug ${RENAME.to} taken by another product — skipping`)
      } else {
        console.log(`   slug: ${RENAME.from} -> ${RENAME.to}`)
        console.log(`   name: ${prod.name} -> ${RENAME.name}`)
        if (APPLY) {
          const { error } = await sb
            .from('products').update({ slug: RENAME.to, name: RENAME.name }).eq('id', prod.id)
          console.log(error ? `   ❌ ${error.message}` : '   ✅ renamed')
        }
      }
    }
  }

  // ---- Phase 2: product copy ----
  console.log('\n=== PHASE 2: DESCRIPTION / META / TITLE ===')
  for (const p of PATCHES) {
    const existing = await findProduct(p.slug, 'id, name, description, meta_description, seo_title')

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
    console.log(`   desc ${p.description.length} | meta ${p.meta_description.length} | title ${p.seo_title.length}`)

    if (APPLY && Object.keys(update).length) {
      const { error } = await sb.from('products').update(update).eq('id', existing.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  // ---- Phase 3: image alt text ----
  console.log('\n=== PHASE 3: IMAGE ALT TEXT ===')
  for (const p of PATCHES) {
    const prod = await findProduct(p.slug, 'id')
    if (!prod) { console.error(`❌ ${p.slug}: not found`); continue }
    const { data: imgs } = await sb
      .from('product_images')
      .select('id, alt_text, is_primary, order')
      .eq('product_id', prod.id)
      .order('order', { ascending: true })

    let wrote = 0, kept = 0
    for (const img of imgs ?? []) {
      if (img.alt_text?.trim()) { kept++; continue }
      const alt = img.is_primary ? p.altWorn : p.altFlat
      if (APPLY) {
        const { error } = await sb.from('product_images').update({ alt_text: alt }).eq('id', img.id)
        if (error) { console.error(`   ❌ ${p.slug}: ${error.message}`); continue }
      }
      wrote++
    }
    console.log(`${p.slug}: ${wrote} alt written, ${kept} kept (${(imgs ?? []).length} images)`)
  }

  // ---- Phase 4: orphaned product ----
  console.log('\n=== PHASE 4: ORPHAN FIX ===')
  {
    const { data: cat } = await sb
      .from('categories').select('id, name').eq('slug', ORPHAN.categorySlug).maybeSingle()
    const { data: prod } = await sb
      .from('products').select('id, category_id').eq('slug', ORPHAN.slug).maybeSingle()
    if (!cat || !prod) {
      console.error('   ❌ category or product not found')
    } else if (prod.category_id) {
      console.log('   ✔ already has a category — skipping')
    } else {
      console.log(`   ${ORPHAN.slug}: assign category_id -> ${cat.name}`)
      if (APPLY) {
        const { error: e1 } = await sb
          .from('products').update({ category_id: cat.id }).eq('id', prod.id)
        const { error: e2 } = await sb
          .from('product_categories')
          .upsert({ product_id: prod.id, category_id: cat.id }, { onConflict: 'product_id,category_id' })
        console.log(e1 || e2 ? `   ❌ ${e1?.message ?? ''} ${e2?.message ?? ''}` : '   ✅ category + junction row set')
      }
    }
  }

  // ---- Phase 5: missing price ----
  console.log('\n=== PHASE 5: COCA COLA PRICE ===')
  {
    const { data: prod } = await sb
      .from('products')
      .select('id, price, rent_price, rent_deposit')
      .eq('slug', PRICE_FIX.slug)
      .maybeSingle()
    if (!prod) {
      console.error('   ❌ not found')
    } else if (prod.price != null) {
      console.log(`   ✔ price already set (₹${prod.price}) — skipping`)
    } else {
      console.log(`   price null -> ₹${PRICE_FIX.price}, rent ₹${PRICE_FIX.rent_price}, deposit ₹${PRICE_FIX.rent_deposit}`)
      if (APPLY) {
        const { error } = await sb
          .from('products')
          .update({
            price: PRICE_FIX.price,
            rent_price: PRICE_FIX.rent_price,
            rent_deposit: PRICE_FIX.rent_deposit,
          })
          .eq('id', prod.id)
        console.log(error ? `   ❌ ${error.message}` : '   ✅ priced')
      }
    }
  }

  // ---- Phase 6: category copy ----
  console.log('\n=== PHASE 6: JUNK FOOD CATEGORY ===')
  {
    const { data: cat } = await sb
      .from('categories')
      .select('id, name, description, seo_title, meta_description')
      .eq('slug', CATEGORY.slug)
      .maybeSingle()
    if (!cat) {
      console.error('   ❌ not found')
    } else {
      const update: Record<string, string> = {}
      if (cat.name !== CATEGORY.name) update.name = CATEGORY.name
      if (!cat.description?.trim()) update.description = CATEGORY.description
      if (!cat.seo_title?.trim()) update.seo_title = CATEGORY.seo_title
      if (!cat.meta_description?.trim()) update.meta_description = CATEGORY.meta_description

      console.log(`   name: ${cat.name} -> ${CATEGORY.name}`)
      console.log(`   writing: ${Object.keys(update).join(', ') || '(nothing)'}`)
      if (APPLY && Object.keys(update).length) {
        const { error } = await sb.from('categories').update(update).eq('id', cat.id)
        console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
