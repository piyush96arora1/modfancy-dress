/**
 * Task 13 steps 1–2 of docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md
 * (annual-function and dance season, Dec–Feb).
 *
 * 1. Kathak. Thirteen kathak products shared one template: "Kathak Dance Dress
 *    Fancy Dress", "Kathak Costume Fancy Dress", ... all at the same price, all
 *    with metas aimed at the bare head term. They are real colour and style
 *    variants a parent chooses between, so they stay, but each now targets its
 *    own "<colour> kathak dress" query, and /category/kathak-dress takes the
 *    head terms ("kathak dress", "kathak dress on rent", "kathak dress for
 *    girls"). Colour, cut and what is in the set come from the product photos
 *    (viewed 23 Sep 2026), not from the old copy, which had drifted (lehenga
 *    sets described as anarkalis, metas quoting ₹400 on ₹1,200 dresses).
 *    Slugs do not change. `kathak-fancy-dress` also joins the kathak category.
 *
 * 2. Dance hub. /category/dance-dress (4,323 impressions at position 11.7) is
 *    rewritten as "Dance Costumes on Rent in Delhi – Annual Function": one
 *    section per dance linking to its category, plus bulk sets for schools and
 *    academies. /category/classical-dance-dress gets the same treatment and
 *    absorbs the thin post `which-classical-dance-costume-for-your-child`
 *    (unpublished by scripts/seo-blog-consolidation.ts; 301 to this category).
 *
 * Category descriptions render as one plain paragraph on the category page,
 * so they are written as prose (no markdown, no links) and kept short enough
 * not to push the product grid below the fold.
 *
 * Every price is read from the DB at run time. Every title/meta passes
 * checkCopy(), every link must resolve to a live page, and at most one Hinglish
 * line ends each body — otherwise nothing is written.
 *
 * This is a rewrite task, so existing copy on these rows is overwritten.
 *
 * Dry run:  npx tsx scripts/seo-kathak-dance-hub.ts
 * Apply:    npx tsx scripts/seo-kathak-dance-hub.ts --apply
 */
import { APPLY, Catalog, LiveProduct, Problems, banner, diff, fromPrices, loadCatalog, product, sb } from './lib/seo-copy-run'

const SHOP = 'Mod Fancy Dress, S64 South Anarkali, Krishna Nagar, Delhi'

/** Closing sentence for every kathak product: rent terms from the DB, logistics from /rent. */
function kathakTail(p: LiveProduct): string {
  const deposit = p.rent_deposit ? ` against a refundable ₹${p.rent_deposit} deposit` : ' against a refundable deposit'
  return (
    `Buy it for ₹${p.price}, or rent it for the function at ₹${p.rent_price}${deposit}, from ${SHOP} — ` +
    `pick up at the shop or book Porter/Rapido delivery anywhere in Delhi NCR. WhatsApp the dancer's height and we will confirm the size before you come.`
  )
}

type KathakPatch = {
  slug: string
  /** Short colour-and-style label used in the category list. */
  label: string
  name: string
  seo_title: string
  meta: (p: LiveProduct) => string
  /** What the photo shows. The tail with price and rent terms is appended. */
  body: string
}

const KATHAK: KathakPatch[] = [
  {
    slug: 'kathak-dress-blue-colour-fancy-dress',
    label: 'royal blue, lehenga style',
    name: 'Royal Blue Kathak Dress – Lehenga Style',
    seo_title: 'Royal Blue Kathak Dress for Girls – Lehenga Style',
    meta: (p) => `Royal blue kathak dress for girls: gold-booti brocade lehenga, blouse and gold net dupatta. Buy ₹${p.price} or rent ₹${p.rent_price} in Krishna Nagar, Delhi.`,
    body:
      'A royal blue kathak dress cut in lehenga style — a full-flare blue brocade ghagra woven with small gold booti and edged in a wide gold border, a matching short-sleeve blouse with a gold waistband, and a sheer gold net dupatta worn over the head the way Mughal-court kathak is staged. The lehenga opens into a full circle on every chakkar, and the deep blue reads rich rather than washed out under school-hall lights. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'kathak-anarkali-fancy-dress-style-white-red',
    label: 'white and red, anarkali',
    name: 'White & Red Kathak Dress – Anarkali with Dupatta',
    seo_title: 'White & Red Kathak Dress for Girls – Anarkali',
    meta: (p) => `White and red kathak dress: white satin anarkali with red brocade bodice, red churidar and red net dupatta. Buy ₹${p.price} or rent ₹${p.rent_price} in Delhi.`,
    body:
      'A white and red kathak dress — a white satin anarkali that flares from a gold waistband to a red-and-gold bordered hem, a red brocade bodice at the back, red churidar, and a long red net dupatta that crosses the shoulder and trails behind on the turn. White with red is the classic kathak palette, so it fits a dress-code note that simply says "kathak costume" without naming a colour. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'kathak-dance-dress-anarkali-style-costume-fancy-dress',
    label: 'magenta, short anarkali',
    name: 'Magenta Kathak Dress – Short Anarkali & Churidar',
    seo_title: 'Magenta Kathak Dress – Short Anarkali with Churidar',
    meta: (p) => `Magenta kathak dress: knee-length brocade anarkali with gold churidar and gold dupatta, full sleeves. Buy ₹${p.price} or rent ₹${p.rent_price} in Krishna Nagar, Delhi.`,
    body:
      'A magenta kathak dress with a shorter, knee-length anarkali — deep pink brocade with a gold pattern all over, full sleeves, a gold waistband and gold lace at the hem, worn over gold churidar with a gold dupatta across the body. The shorter cut keeps the footwork visible from the audience, which teachers ask for when the item is tatkaar-heavy rather than spin-heavy. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'kathak-dress-green-colour-fancy-dress',
    label: 'green, lehenga style',
    name: 'Green Kathak Dress – Brocade Lehenga Style',
    seo_title: 'Green Kathak Dress for Girls – Brocade Lehenga',
    meta: (p) => `Green kathak dress for girls: green and gold brocade lehenga, matching blouse and gold net dupatta. Buy ₹${p.price} or rent ₹${p.rent_price} at our Krishna Nagar, Delhi shop.`,
    body:
      'A green kathak dress in lehenga style — a parrot-green brocade ghagra with gold weave and a gold border, a matching short-sleeve blouse with a gold waistband, and a sheer gold net dupatta over the head. It is the same cut as our royal blue and purple lehenga kathak dresses, so a school can mix the three colours in one group item and still have the line look matched. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'kathak-dance-dress-costume-yellow-with-purple-fancy-dress',
    label: 'yellow and purple, net anarkali',
    name: 'Yellow & Purple Kathak Dress – Net Anarkali',
    seo_title: 'Yellow & Purple Kathak Dress – Floor-Length Anarkali',
    meta: (p) => `Yellow and purple kathak dress: floor-length yellow net anarkali with purple brocade bodice and hem. Buy ₹${p.price} or rent ₹${p.rent_price} in Krishna Nagar, Delhi.`,
    body:
      'A yellow and purple kathak dress — a floor-length yellow anarkali with a sheer net over-layer, a purple-and-gold brocade bodice, purple brocade cuffs and a wide purple border at the hem, with sheer yellow sleeves. The two colours sit at opposite ends of the wheel, so the dress stays readable from the back rows even under coloured stage gels. Photographed on an adult dancer.',
  },
  {
    slug: 'kathak-dance-dress-anarkali-style-fancy-dress',
    label: 'sky blue, brocade anarkali',
    name: 'Sky Blue Kathak Dress – Brocade Anarkali',
    seo_title: 'Sky Blue Kathak Dress for Girls – Brocade Anarkali',
    meta: (p) => `Sky blue kathak dress for girls: turquoise brocade anarkali with gold motifs, gold dupatta and churidar. Buy ₹${p.price} or rent ₹${p.rent_price} in Krishna Nagar, Delhi.`,
    body:
      'A sky blue kathak dress — a turquoise brocade anarkali with gold floral motifs, full sleeves with gold cuffs, a gold waistband and gold lace at the hem, worn with gold churidar and a gold dupatta draped across one shoulder. It is the lightest colour in our kathak range and photographs well in daylight, which suits morning annual-day programmes held outdoors. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'anarkali-kathak-fancy-dress-costume-white',
    label: 'white and gold, anarkali with jacket',
    name: 'White & Gold Kathak Dress – Anarkali with Jacket',
    seo_title: 'White & Gold Kathak Dress – Anarkali with Jacket',
    meta: (p) => `White and gold kathak dress: floor-length white anarkali with a short gold-and-white jacket and gold hem. Buy ₹${p.price} or rent ₹${p.rent_price} in Krishna Nagar, Delhi.`,
    body:
      'A white and gold kathak dress — a floor-length white anarkali with full sheer sleeves, a short sleeveless white jacket (koti) worked in gold, a gold waistband, gold cuffs and a deep gold border at the hem. It is the formal-recital look: white and gold is what many kathak gurus choose for a senior batch or a solo item. Photographed on an adult dancer.',
  },
  {
    slug: 'kathak-fancy-dress-costume-for-classical-dance',
    label: 'cream and red, brocade anarkali',
    name: 'Cream & Red Kathak Dress – Brocade Anarkali',
    seo_title: 'Cream & Red Kathak Dress – Gold Brocade Anarkali',
    meta: (p) => `Cream and red kathak dress: gold-cream brocade anarkali with a red bodice and red churidar, full flare. Buy ₹${p.price} or rent ₹${p.rent_price} in Krishna Nagar, Delhi.`,
    body:
      'A cream and red kathak dress — a full-flare anarkali in cream brocade with a gold pattern, full sleeves, a red brocade bodice with a gold neckline, a thin red border at the hem, and red churidar underneath. Cream with red is a softer take on the classic white-and-red kathak look. The photos show it on a young girl, but this piece is listed in adult size, so send the dancer\'s height before you visit.',
  },
  {
    slug: 'kathak-anarkali-costume-fancy-dress',
    label: 'yellow with red dupatta, anarkali',
    name: 'Yellow Kathak Dress – Anarkali with Red Dupatta',
    seo_title: 'Yellow Kathak Dress for Girls – Anarkali, Red Dupatta',
    meta: (p) => `Yellow kathak dress for girls: yellow satin anarkali with red-and-gold border and red dupatta. Buy ₹${p.price} or rent ₹${p.rent_price} at our Krishna Nagar, Delhi shop.`,
    body:
      'A yellow kathak dress — a bright yellow satin anarkali that opens into a wide circle, edged in a red-and-gold border, with a gold waistband, red cuffs, red churidar and a red net dupatta worn over both shoulders with a gold edge. Yellow and red is the Basant palette, so this one also doubles for a Basant Panchami or spring-themed dance. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'kathak-dance-costume-fancy-dress',
    label: 'pink and green, net anarkali',
    name: 'Pink & Green Kathak Dress – Net Anarkali',
    seo_title: 'Pink & Green Kathak Dress – Net Anarkali with Churidar',
    meta: (p) => `Pink and green kathak dress: pink net anarkali with a green brocade bodice, green-gold hem and green churidar. Buy ₹${p.price} or rent ₹${p.rent_price} in Delhi.`,
    body:
      'A pink and green kathak dress — a hot-pink anarkali with a sheer net over-skirt, a green-and-gold brocade bodice, sheer pink sleeves with green cuffs, a green-and-gold border at the hem and green churidar. The contrast border traces a clean circle on every spin, which is why this pairing is popular for group items filmed from the front. Photographed on an adult dancer.',
  },
  {
    slug: 'kathak-costume-fancy-dress',
    label: 'purple, lehenga style',
    name: 'Purple Kathak Dress – Lehenga with Gold Dupatta',
    seo_title: 'Purple Kathak Dress for Girls – Lehenga Style',
    meta: (p) => `Purple kathak dress for girls: wine-purple brocade lehenga with gold polka weave, blouse and gold net dupatta. Buy ₹${p.price} or rent ₹${p.rent_price} in Delhi.`,
    body:
      'A purple kathak dress in lehenga style — a wine-purple brocade ghagra with a gold polka weave and a gold border, a matching short-sleeve blouse, a gold waistband and a sheer gold net dupatta over the head. The darker tone suits a Mughal-court or thumri item where the teacher wants a richer, evening look. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'kathak-dance-dress-fancy-dress',
    label: 'pink, lehenga style',
    name: 'Pink Kathak Dress – Brocade Lehenga Style',
    seo_title: 'Pink Kathak Dress for Girls – Brocade Lehenga',
    meta: (p) => `Pink kathak dress for girls: magenta and gold brocade lehenga with blouse and gold net dupatta over the head. Buy ₹${p.price} or rent ₹${p.rent_price} in Krishna Nagar, Delhi.`,
    body:
      'A pink kathak dress in lehenga style — a magenta brocade ghagra with an all-over gold pattern and a gold border, a matching short-sleeve blouse, a gold waistband and a long gold net dupatta worn over the head. It is the pink counterpart to our blue, green and purple lehenga kathak dresses, all in the same cut. Photographed on a girl of primary-school age.',
  },
  {
    slug: 'kathak-fancy-dress',
    label: 'white and pink, anarkali',
    name: 'White & Pink Kathak Dress – Anarkali',
    seo_title: 'White & Pink Kathak Dress – Anarkali, Kids & Adult Sizes',
    meta: (p) => `White and pink kathak dress: white anarkali with gold and red borders and a pink net dupatta. Kids and adult sizes. Buy ₹${p.price} or rent ₹${p.rent_price} in Delhi.`,
    body:
      'A white and pink kathak dress — a white anarkali with a wide gold-and-red border at the hem, full white sleeves, a gold waistband and a pink-red net dupatta across the shoulder, worn over white churidar. It is stocked in a 5–7 yrs kids size and an adult size, so a mother-and-daughter or teacher-and-student pair can match.',
  },
]

async function main() {
  banner()
  const cat: Catalog = await loadCatalog()
  const problems = new Problems()

  // ---------- products ----------
  const productPatches = KATHAK.map((k) => {
    const p = product(cat, k.slug)
    const description = `${k.body} ${kathakTail(p)}`
    const meta_description = k.meta(p)
    problems.copy(k.slug, k.seo_title, meta_description)
    problems.body(cat, k.slug, description)
    return { p, k, update: { name: k.name, seo_title: k.seo_title, meta_description, description } }
  })
  const titles = productPatches.map((x) => x.k.seo_title.toLowerCase())
  if (new Set(titles).size !== titles.length) problems.add('duplicate kathak seo_title')

  // ---------- kathak-dress category (head term) ----------
  const kathakSlugs = KATHAK.map((k) => k.slug)
  const kathakPrices = {
    buy: Math.min(...kathakSlugs.map((s) => product(cat, s).price ?? Infinity)),
    rent: Math.min(...kathakSlugs.map((s) => product(cat, s).rent_price ?? Infinity)),
  }
  const kathakCategory = {
    seo_title: 'Kathak Dress on Rent in Delhi – For Girls & Women',
    meta_description: `Kathak dress for girls and women in ${KATHAK.length} colours, anarkali and lehenga cuts. Kathak dress on rent from ₹${kathakPrices.rent} or buy from ₹${kathakPrices.buy} in Krishna Nagar, Delhi.`,
    description: [
      `Kathak dress for girls and women, to buy or to rent in Delhi: ${KATHAK.length} kathak costumes, each in its own colour, for school annual functions, recitals and inter-school competitions. Rent from ₹${kathakPrices.rent} or buy from ₹${kathakPrices.buy} at our Krishna Nagar shop.`,
      `Choose the cut first. An anarkali kathak dress is one long flared kurta over churidar that spins into a clean circle, and it is what most teachers mean by "kathak costume": white and red, white and gold, cream and red, yellow with a red dupatta, sky blue, magenta, yellow and purple, pink and green, and white and pink. A lehenga-style kathak dress is a separate ghagra, blouse and net dupatta over the head, the Mughal-court look, in royal blue, green, purple and pink, all in one cut so a group can mix colours and still look matched.`,
      `Most dresses are stocked for girls of primary-school age; three anarkalis are shown on adult dancers, and the white and pink one comes in a 5–7 yrs and an adult size. Size by height, not age. To rent, pay the rent plus a refundable deposit, collect from the shop or book Porter/Rapido delivery, and get the full deposit back after the function. Schools and academies ordering one colour for a whole batch get matched sets across sizes.`,
      `Kathak dress kiraye pe chahiye? Colour aur size WhatsApp karke confirm kar lijiye.`,
    ].join(' '),
  }
  problems.copy('category kathak-dress', kathakCategory.seo_title, kathakCategory.meta_description)
  problems.plainCategory('category kathak-dress', kathakCategory.description)

  // ---------- classical-dance-dress (absorbs which-classical-dance-costume-for-your-child) ----------
  const classicalAll = ['kathak-dress', 'bharatnatyam', 'classical-dance-dress'].map((c) => fromPrices(cat, c))
  const classical = {
    buy: Math.min(...classicalAll.map((x) => x.buy)),
    rent: Math.min(...classicalAll.map((x) => x.rent)),
  }
  const classicalCategory = {
    seo_title: 'Classical Dance Costume on Rent – Kathak & Bharatnatyam',
    meta_description: `Classical dance costume on rent or to buy in Delhi: kathak, bharatnatyam and odissi dresses for recitals and annual day. Rent from ₹${classical.rent}. Krishna Nagar shop.`,
    description: [
      `Classical dance costumes to buy or rent in Delhi: kathak, bharatnatyam and odissi dresses for recitals, school annual day and inter-school competitions, from our shop in Krishna Nagar, with rent from ₹${classical.rent} plus a refundable deposit.`,
      `Which classical dance costume is right for your child? Start with the teacher's note, because each form has its own silhouette. Kathak is a flared anarkali over churidar, or a lehenga with a net dupatta over the head; look for a skirt that opens into a full circle on the spin. Bharatnatyam is a stitched costume with a pleated fan that opens between the knees in araimandi, worn with gold temple jewellery. Odissi has a pleated front fan with a silver-toned belt and jewellery. Some schools want only a simple practice set, others want full jewellery and hair pieces, so WhatsApp us a photo of the dress-code note and we will shortlist what fits it.`,
      `If your child is between sizes, go one size up: a slightly loose costume can be pinned, a tight one restricts the footwork. Rent for a single recital, or buy if the child performs every season. The Kathak Dress and Bharatnatyam categories hold the full colour range.`,
    ].join(' '),
  }
  problems.copy('category classical-dance-dress', classicalCategory.seo_title, classicalCategory.meta_description)
  problems.plainCategory('category classical-dance-dress', classicalCategory.description)

  // ---------- dance-dress hub ----------
  const f = (slug: string) => fromPrices(cat, slug)
  const hub = {
    seo_title: 'Dance Costumes on Rent in Delhi – Annual Function',
    meta_description:
      'Dance costumes on rent in Delhi for the school annual function: kathak, bharatnatyam, bhangra, garba, kalbelia, bihu and western. Matched sets for schools.',
    description: [
      `Dance costumes on rent in Delhi for the school annual function, the inter-school competition and the academy recital, from one shop in Krishna Nagar, a 5-minute walk from Krishna Nagar Metro.`,
      `Kathak: anarkali and lehenga dresses in ${KATHAK.length} colours, rent from ₹${kathakPrices.rent}. Bharatnatyam and Odissi: see Classical Dance Dress, bharatnatyam from ₹${f('bharatnatyam').buy}. Bhangra and Giddha: bhangra sets for boys and men from ₹${f('bhangra-dress').buy}, giddha suits for girls from ₹${f('gidda-dress').buy}. Garba and Dandiya: chaniya choli and kediyu. Kalbelia and Rajasthani folk: kalbelia dresses, lehengas and angrakha-dhoti sets for ghoomar. Bihu and Manipuri: mekhela chador, Bihu sets for boys and Manipuri Raas costumes. Haryanvi, Lavani, Kashmiri and other folk dances each have their own category. Western and Bollywood: sequin tops, frocks and ballroom sets from ₹${f('western-dance-dress').buy}.`,
      `Bulk for schools and academies: we match one colour across every size, pack and label per size, and deliver across Delhi NCR; send the dance, count, size list and date on WhatsApp for a price list. To rent, pay the rent plus a refundable deposit and get it back when you return the costume.`,
      `Annual function ke liye dance dress chahiye? Dance ka naam aur size WhatsApp kijiye.`,
    ].join(' '),
  }
  problems.copy('category dance-dress', hub.seo_title, hub.meta_description)
  problems.plainCategory('category dance-dress', hub.description)

  problems.abortIfAny()

  // ---------- write ----------
  console.log('=== PRODUCTS ===')
  for (const { p, update } of productPatches) {
    console.log(p.slug)
    let changed = false
    changed = diff('p', 'name', p.name, update.name) || changed
    changed = diff('p', 'seo_title', p.seo_title, update.seo_title) || changed
    changed = diff('p', 'meta_description', p.meta_description, update.meta_description) || changed
    changed = diff('p', 'description', p.description, update.description) || changed
    if (APPLY && changed) {
      const { error } = await sb.from('products').update(update).eq('id', p.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  // kathak-fancy-dress sits in classical + folk only; add it to the kathak category too.
  const kfd = product(cat, 'kathak-fancy-dress')
  const kathakCatId = cat.categories.get('kathak-dress')!
  if (!(cat.members.get('kathak-dress') ?? []).includes(kfd.slug)) {
    console.log('\nkathak-fancy-dress: + product_categories kathak-dress')
    if (APPLY) {
      const { error } = await sb.from('product_categories').insert({ product_id: kfd.id, category_id: kathakCatId })
      console.log(error ? `   ❌ ${error.message}` : '   ✅ linked')
    }
  }

  console.log('\n=== CATEGORIES ===')
  for (const [slug, patch] of [
    ['kathak-dress', kathakCategory],
    ['classical-dance-dress', classicalCategory],
    ['dance-dress', hub],
  ] as const) {
    const { data: c } = await sb.from('categories').select('id, seo_title, meta_description, description').eq('slug', slug).single()
    console.log(slug)
    let changed = false
    changed = diff('c', 'seo_title', c!.seo_title, patch.seo_title) || changed
    changed = diff('c', 'meta_description', c!.meta_description, patch.meta_description) || changed
    changed = diff('c', 'description', c!.description, patch.description) || changed
    if (APPLY && changed) {
      const { error } = await sb.from('categories').update(patch).eq('id', c!.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }
  if (!APPLY) console.log('\n(dry run — nothing written)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
