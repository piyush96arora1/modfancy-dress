/**
 * Task 15 step 6 of docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md:
 * Krishna and states hubs, plus CTR fixes on page-1 state products.
 *
 * Krishna: 8 variants sat at positions 11–15 with titles that all read
 * "Krishna Costume ... Janmashtami", and "child krishna fancy dress" drew
 * 5,801 image impressions at position 34. Each variant now leads with its own
 * angle (age band, colour, "for adults"), taken from the product photo and the
 * DB size field. /category/indian-mythology-costumes (position 4.9) becomes
 * the Krishna hub with a "Krishna dress by age and colour" passage.
 * krishna-fancy-dress and radha-rani-fancy-dress are written by another script
 * and are not touched here.
 *
 * States: /category/states-fancy-dress becomes the states hub, naming each
 * state costume with the school day it suits. Assam, Maharashtra, Manipur,
 * Nagaland (girl) and Kerala rank at 5–10 with under 1% CTR; their titles and
 * metas now lead with the query (e.g. "assamese dress", "manipuri dress") and
 * say what is in the photo. Kerala is edited by id because its slug is being
 * renamed separately.
 *
 * Also fixes the two metas over 160 characters (Jhansi Ki Rani, Indira Gandhi),
 * which also quoted a stale ₹400 price.
 *
 * Category descriptions render as one plain paragraph, so they are prose.
 * Prices are read from the DB at run time. Rewrite task: existing
 * seo_title/meta_description on these rows are overwritten; names, slugs,
 * descriptions of products and alt text are not touched.
 *
 * Dry run:  npx tsx scripts/seo-krishna-states-hubs.ts
 * Apply:    npx tsx scripts/seo-krishna-states-hubs.ts --apply
 */
import { APPLY, LiveProduct, Problems, banner, diff, loadCatalog, fromPrices, sb } from './lib/seo-copy-run'

type ProductPatch = {
  /** slug, or id when the slug is being renamed elsewhere */
  slug?: string
  id?: string
  seo_title: string
  meta: (p: LiveProduct) => string
}

const buyRent = (p: LiveProduct) => `Buy ₹${p.price} or rent ₹${p.rent_price}`

const KRISHNA: ProductPatch[] = [
  {
    slug: 'krishna-fancy-dress-kid',
    seo_title: 'Bal Krishna Dress for Toddlers (3-5 yrs) – Yellow',
    meta: (p) => `Child Krishna fancy dress for toddlers aged 3-5: yellow kurta with Bal Krishna print, yellow dhoti and peacock feather. ${buyRent(p)} in Delhi.`,
  },
  {
    slug: 'krishna-yellow-fancy-dress',
    seo_title: 'Yellow Polka-Dot Krishna Dress for Kids (5-7 yrs)',
    meta: (p) => `Yellow Krishna dress for kids aged 5-7: polka-dot angrakha kurta and dhoti with red borders, for Janmashtami and school. ${buyRent(p)} in Delhi.`,
  },
  {
    slug: 'krishna-yellow-dhoti-kurta-fancy-dress',
    seo_title: 'Yellow Krishna Dhoti Kurta for Boys (7-9 yrs)',
    meta: (p) => `Krishna dhoti kurta for boys aged 7-9: bright yellow wrap kurta, dhoti and sash with red trim. ${buyRent(p)} at our Krishna Nagar, Delhi shop.`,
  },
  {
    slug: 'krishna-green-fancy-dress',
    seo_title: 'Green Print Krishna Dress for Kids (7-9 yrs)',
    meta: (p) => `Krishna dress with a green mandala print on yellow, kurta and dhoti for kids aged 7-9, shown with a peacock mukut. ${buyRent(p)} in Delhi.`,
  },
  {
    slug: 'krishna-blue-and-yellow-fancy-dress',
    seo_title: 'Blue & Yellow Krishna Costume with Mukut (7-9 yrs)',
    meta: (p) => `Blue and yellow Krishna costume for kids aged 7-9: blue printed kurta, yellow dhoti and matching mukut. ${buyRent(p)} in Krishna Nagar, Delhi.`,
  },
  {
    slug: 'pink-and-yellow-krishna-fancy-dress',
    seo_title: 'Pink & Yellow Krishna Costume with Mukut (7-9 yrs)',
    meta: (p) => `Pink and yellow Krishna costume for kids aged 7-9: pink printed kurta, yellow dhoti, sash and matching mukut. ${buyRent(p)} in Krishna Nagar, Delhi.`,
  },
  {
    slug: 'krishna-fancy-dress-king',
    seo_title: 'Krishna Dress for Adults – Raja Krishna Costume',
    meta: (p) => `Adult Krishna dress for men and teens: printed kurta, layered red and yellow dhoti and floral crown, for Janmashtami jhanki. ${buyRent(p)} in Delhi.`,
  },
  {
    slug: 'krishna-fancy-dress-costume',
    seo_title: 'Royal Blue Krishna Costume with Crown for Kids',
    meta: (p) => `Krishna costume for kids: royal blue brocade kurta, red sash and yellow dhoti, shown with a gold crown. ${buyRent(p)} at our Krishna Nagar, Delhi shop.`,
  },
]

const STATES: ProductPatch[] = [
  {
    slug: 'assam-fancy-dress',
    seo_title: 'Assamese Dress for Boys – Assam Fancy Dress for Bihu',
    meta: (p) => `Assamese dress for boys: cream kurta with red Assamese motifs and white dhoti with gold border, for Bihu and state day. ${buyRent(p)} in Delhi.`,
  },
  {
    slug: 'maharashtra-fancy-dress',
    seo_title: 'Maharashtra Fancy Dress for Girls – Yellow Nauvari',
    meta: (p) => `Maharashtra fancy dress for girls: yellow nauvari saree with a green border, draped dhoti-style, for state day and Republic Day. ${buyRent(p)} in Delhi.`,
  },
  {
    slug: 'manipur-fancy-dress',
    seo_title: 'Manipuri Dress for Girls – Potloi Raas Costume',
    meta: (p) => `Manipuri traditional dress for girls aged 7-9: potloi hooped skirt in pink and gold, blue blouse, net veil and headpiece. ${buyRent(p)} in Delhi.`,
  },
  {
    slug: 'nagaland-girl-fancy-dress',
    seo_title: 'Nagaland Dress for Girls – Naga Costume & Headgear',
    meta: (p) => `Nagaland dress for girls: striped Naga wrap skirt and top, shown with the feathered headgear, for Hornbill and state day. ${buyRent(p)} in Delhi.`,
  },
  {
    // kerala-fancy-dres: being renamed by another agent, so matched by id
    id: '9799ff48-6a25-44ae-bc40-c017c042ec4a',
    seo_title: 'Kerala Costume for Kids – Kasavu Saree Fancy Dress',
    meta: (p) => `Kerala costume for school state day and Onam: off-white kasavu saree with gold border, 9-11 yrs. ${buyRent(p)} at our Krishna Nagar, Delhi shop.`,
  },
  {
    slug: 'jhansi-ki-rani-laxmi-bai-fancy-dress-costume',
    seo_title: 'Jhansi Ki Rani Laxmi Bai Costume for Girls',
    meta: (p) => `Rani Laxmi Bai (Jhansi Ki Rani) warrior costume for girls, for Independence Day and Republic Day speeches. ${buyRent(p)} in Delhi NCR.`,
  },
  {
    slug: 'indira-gandhi-fancy-dress-costume',
    seo_title: 'Indira Gandhi Costume for Girls - Leader',
    meta: (p) => `Indira Gandhi fancy dress: saree with shawl and the grey-streak hairstyle for Republic Day and leader theme days. ${buyRent(p)} in Delhi NCR.`,
  },
]

async function main() {
  banner()
  const cat = await loadCatalog()
  const problems = new Problems()

  const resolved = [...KRISHNA, ...STATES].map((x) => {
    const p = x.id ? cat.productById.get(x.id) : cat.products.get(x.slug!)
    if (!p) throw new Error(`not live: ${x.id ?? x.slug}`)
    const meta_description = x.meta(p)
    problems.copy(p.slug, x.seo_title, meta_description)
    return { p, seo_title: x.seo_title, meta_description }
  })
  const titles = resolved.map((r) => r.seo_title.toLowerCase())
  if (new Set(titles).size !== titles.length) problems.add('duplicate seo_title')

  // ---------- Krishna hub ----------
  const k = (s: string) => cat.products.get(s)!
  const myth = fromPrices(cat, 'indian-mythology-costumes')
  const kid = k('krishna-fancy-dress-kid')
  const king = k('krishna-fancy-dress-king')
  const mythology = {
    seo_title: 'Krishna Dress & Mythology Fancy Dress for Kids, Adults',
    meta_description: `Krishna dress by age and colour, from toddler Bal Krishna to adult Raja Krishna, plus Ram, Hanuman and Sita costumes. Buy from ₹${myth.buy} or rent in Delhi.`,
    description: [
      `Indian mythology fancy dress for Janmashtami, Ramleela, school competitions and annual-day plays: Krishna, Ram, Hanuman and Sita costumes to buy or rent from our Krishna Nagar shop in Delhi.`,
      `Krishna dress by age and colour: for toddlers of 3-5, the yellow Bal Krishna dress with a baby-Krishna print (₹${kid.price}); for 5-7, the yellow polka-dot dhoti kurta; for 7-9, the bright yellow dhoti kurta, the green-print dress, and the blue-and-yellow and pink-and-yellow sets with matching mukut; the royal blue brocade Krishna costume with crown for a Dwarkadhish look; and for teens and adults, the Raja Krishna costume with floral crown (₹${king.price}), which also suits a college jhanki or a parent in a Radha-Krishna pair. Yellow is the classic Krishna colour; blue and green read differently on a stage full of yellow Krishnas.`,
      `For the Ramayana, pick Vanvasi Ram, Hanuman or Rani Sita. Costumes can be rented for one event with a refundable deposit, with pickup from the shop or Porter/Rapido delivery across Delhi NCR.`,
    ].join(' '),
  }
  problems.copy('category indian-mythology-costumes', mythology.seo_title, mythology.meta_description)
  problems.plainCategory('category indian-mythology-costumes', mythology.description)

  // ---------- States hub ----------
  const states = fromPrices(cat, 'states-fancy-dress')
  const statesHub = {
    seo_title: 'States Fancy Dress for School – Indian State Costumes',
    meta_description: `Indian states fancy dress for Unity in Diversity, Republic Day and state days: Assam, Kerala, Manipur, Nagaland, Maharashtra and more. From ₹${states.buy}, Delhi.`,
    description: [
      `States fancy dress for school: traditional costumes of Indian states for Unity in Diversity day, Republic Day tableaux and state-day competitions, to buy or rent in Delhi.`,
      `Which school day each suits: Assam mekhela chador (girls) and Assamese dhoti kurta (boys) for Bihu and Northeast day; Kerala kasavu saree, Kathakali and South Indian veshti or pavadai for Onam and Pongal; Manipuri potloi and Manipur boy dhoti for Raas Leela and Northeast day; Nagaland girl and boy costumes and the Mizoram puanchei for Hornbill Festival and Northeast day; Maharashtra nauvari, Maharashtra boy pheta and the Maratha warrior for Maharashtra Day and Shivaji Jayanti; Bengali saree and dhoti kurta for Durga Puja; Gujarati boy kediyu for Navratri; Sambalpuri costumes for Odisha Day; Sikkim, Himachali and Pahadi costumes for hill-state day.`,
      `All of them work for Republic Day and Unity in Diversity. For Punjab and Rajasthan see Bhangra Dress and Rajasthani Dress. Rent with a refundable deposit, or order one state per child for a whole class.`,
    ].join(' '),
  }
  problems.copy('category states-fancy-dress', statesHub.seo_title, statesHub.meta_description)
  problems.plainCategory('category states-fancy-dress', statesHub.description, 1400)

  problems.abortIfAny()

  console.log('=== PRODUCTS ===')
  for (const r of resolved) {
    console.log(r.p.slug)
    let changed = diff('p', 'seo_title', r.p.seo_title, r.seo_title)
    changed = diff('p', 'meta_description', r.p.meta_description, r.meta_description) || changed
    if (APPLY && changed) {
      const { error } = await sb.from('products').update({ seo_title: r.seo_title, meta_description: r.meta_description }).eq('id', r.p.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  console.log('\n=== CATEGORIES ===')
  for (const [slug, patch] of [
    ['indian-mythology-costumes', mythology],
    ['states-fancy-dress', statesHub],
  ] as const) {
    const { data: c } = await sb.from('categories').select('id, seo_title, meta_description, description').eq('slug', slug).single()
    console.log(slug)
    let changed = diff('c', 'seo_title', c!.seo_title, patch.seo_title)
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
