/**
 * One-off import of the 15 "Garbha lehenge" sets from the private supplier
 * catalogue (/catalog/garbha-lehenge) into the public storefront, listed in
 * both Dandiya Dress and Garba Dress at a flat retail price of ₹2300.
 *
 * Why these 15 are worth the copy:
 *
 *   The Semrush gap export in seodata/ (17 Jun 2026) puts modfancydress.com at
 *   position 0 — nowhere — for every commercial garba/dandiya term, including
 *   `dandiya dress` (27,100/mo), `dandiya night dress` (2,400), `garba costume`
 *   (1,300) and `garba dance costume` (480). Both category pages already have
 *   written copy; what they did not have is enough product depth to rank. These
 *   15 take Dandiya Dress from 10 products to 25.
 *
 * Copy is written against each photograph — every colour, motif, border and
 * included piece below is what is actually in the frame. All 15 are shot as
 * flat-lays on a shop floor, so the alt text says so. Each set is three pieces
 * (chaniya, choli, dupatta) and adult free size, which the owner confirmed; the
 * supplier data carries no size field, only a "6 meter" gher note on six rows.
 *
 * Every description closes on one line of Hinglish. That is deliberate and it
 * is capped at one line: the export shows the money queries are already
 * transliterated nouns (`gujrati dandiya dress`, `garba costume`, `chaniya
 * choli`), so the spellings a Delhi buyer actually types belong in the body
 * copy — but a full Hinglish paragraph would read as keyword soup and cost more
 * in quality signals than it wins. The seo_title and meta_description stay in
 * English because those are the SERP snippet.
 *
 * The write machinery lives in scripts/lib/publish-catalog-product.ts; this
 * file is the batch: the listings, the price and the categories. Images are
 * copied rather than linked and the run is idempotent on slug — see that module.
 *
 * Dry run:  npx tsx scripts/import-garba-ghoomer-lehengas.ts
 * Apply:    npx tsx scripts/import-garba-ghoomer-lehengas.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { publishCatalogProducts, type Listing } from './lib/publish-catalog-product'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')

const DANDIYA_CATEGORY_ID = '4fc402b9-3b95-461c-b624-cfb67ebf9b4c'
const GARBA_CATEGORY_ID = '6b6cfc1d-aaf9-4c16-a167-429f9c20b002'

const PRICE = 2300
const RENT_PRICE = 800
const RENT_DEPOSIT = 2500
const SIZE = 'Adult' // the value 18 existing products already use

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'
const SET_NOTE = 'The set is three pieces — flared chaniya, matching choli and dupatta. Adult free size.'

type Item = {
  /** Row in supplier_products this is built from. */
  supplierSlug: string
  slug: string
  name: string
  body: string
  /** One line, Roman-script, carrying the spellings a buyer actually types. */
  hinglish: string
  meta_description: string
  seo_title: string
  /** Every set in this batch has a single flat-lay photo. */
  alt: string
}

const ITEMS: Item[] = [
  {
    supplierSlug: 'garba-ghoomer-lehenga',
    slug: 'yellow-elephant-motif-garba-chaniya-choli',
    name: 'Yellow Elephant Motif Garba Chaniya Choli',
    body:
      'A full-circle yellow garba lehenga with a deep maroon border, worked in round mirrors, white floral embroidery and a band of black-and-white elephant figures marching above the hem. The yellow reads bright under hall lighting and the full gher opens properly on a spin, which is what separates a dancing chaniya choli from a photo-only outfit. The choli repeats the same multicolour floral print and the maroon dupatta carries mirror patches.',
    hinglish:
      'Peeli chaniya choli with mirror work aur haathi border — Navratri garba night ke liye.',
    meta_description:
      'Yellow garba chaniya choli with mirror work, elephant border and full gher. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Yellow Garba Chaniya Choli - Dandiya Lehenga',
    alt: 'Yellow garba chaniya choli laid flat — full-circle mirror-work lehenga with maroon elephant-motif border, matching choli and dupatta',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-7',
    slug: 'multicolour-patchwork-mirror-work-garba-lehenga',
    name: 'Multicolour Patchwork Mirror Work Garba Lehenga',
    body:
      'A patchwork chaniya built from rows of square panels in red, green, blue, orange and maroon, each panel carrying its own mirror-and-thread medallion and outlined in a run of white mirrors. There is no single base colour, which is the point — it photographs loud from every angle and reads as traditional Kutchi patchwork rather than a printed shortcut. The yellow choli is covered edge to edge in round mirrors and the dupatta repeats the square panels.',
    hinglish:
      'Multicolour patchwork chaniya choli, poora mirror work — garba aur dandiya raas dono ke liye.',
    meta_description:
      'Multicolour patchwork garba lehenga with full mirror work and matching choli. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Multicolour Patchwork Garba Lehenga Choli',
    alt: 'Multicolour patchwork garba lehenga laid flat — square mirror-work panels in red, green, blue and orange with a yellow mirrored choli',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-8',
    slug: 'maroon-kutchi-embroidered-dandiya-lehenga',
    name: 'Maroon Kutchi Embroidered Dandiya Lehenga',
    body:
      'A deep maroon chaniya edged in black, with orange and green floral embroidery radiating from the waist and a broad hem band of paisley-and-flower Kutchi work above a scalloped black edge. The dark ground is the useful part: maroon holds its colour through an evening of stage lights where a pale chaniya goes flat, so this is the one to pick for a late dandiya night rather than a daytime programme. Choli and dupatta are embroidered to match.',
    hinglish:
      'Maroon kutchi embroidery wali chaniya choli — dandiya night ke liye rich look.',
    meta_description:
      'Maroon Kutchi embroidered dandiya lehenga with mirror work and matching choli. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Maroon Kutchi Embroidered Dandiya Lehenga',
    alt: 'Maroon dandiya lehenga laid flat — Kutchi floral embroidery with black border, matching embroidered choli and dupatta',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-9',
    slug: 'rainbow-panel-mirror-work-garba-chaniya-choli',
    name: 'Rainbow Panel Mirror Work Garba Chaniya Choli',
    body:
      'A maroon-bordered chaniya divided into tall triangular panels in green, blue, yellow and red, each filled with mirrored medallions and separated by dense rows of white mirrors. Laid flat it reads as a kaleidoscope; in motion the panels break into bands of colour, which is exactly the effect a group performance wants when eight dancers spin together. The red choli is heavily mirrored and the dupatta picks up the same panel colours.',
    hinglish:
      'Rangeen panel wali garba chaniya choli, full mirror work — group dance aur competition ke liye.',
    meta_description:
      'Rainbow panel garba chaniya choli with dense mirror work and full flare. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Rainbow Panel Garba Chaniya Choli - Dandiya',
    alt: 'Multicolour garba chaniya choli laid flat — triangular mirror-work panels in green, blue, yellow and red with a maroon border',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-10',
    slug: 'garba-dancer-print-navratri-chaniya-choli',
    name: 'Garba Dancer Print Navratri Chaniya Choli',
    body:
      'A printed cotton chaniya in yellow, green, blue and maroon stripes, with a band of garba dancers and peacocks printed around the lower skirt and a zigzag triangle border at the hem. This is the light one in the range — printed rather than mirror-loaded, so it weighs little and stays comfortable through a long school programme or a full night of raas. The choli and dupatta carry the same zigzag print.',
    hinglish:
      'Printed garba chaniya choli, halka aur comfortable — school function aur Navratri programme ke liye.',
    meta_description:
      'Printed garba chaniya choli with dancer and peacock motifs, light cotton. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Printed Garba Chaniya Choli for Navratri',
    alt: 'Printed garba chaniya choli laid flat — yellow, green and blue stripes with garba dancer and peacock motifs and a zigzag border',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-11',
    slug: 'red-and-black-mirror-work-garba-lehenga',
    name: 'Red and Black Mirror Work Garba Lehenga',
    body:
      'A red chaniya with a black yoke panel worked in a diamond lattice of multicolour thread and mirrors, opening into a lower skirt of large circular mirror medallions and orange-and-white flowers. The two-tone construction does the work here — the dark yoke narrows the waist while the red sweep below carries the flare. The choli is mirrored to match and the dupatta is black with the same circular medallions.',
    hinglish:
      'Laal aur kaali chaniya choli, heavy sheesha work — dandiya night dress.',
    meta_description:
      'Red and black garba lehenga with heavy mirror work and medallion embroidery. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Red Black Mirror Work Garba Lehenga Choli',
    alt: 'Red and black garba lehenga laid flat — black lattice yoke, circular mirror medallions on red, with matching choli and black dupatta',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-12',
    slug: 'white-kutchi-mirror-work-dandiya-chaniya-choli',
    name: 'White Kutchi Mirror Work Dandiya Chaniya Choli',
    body:
      'An off-white chaniya with a maroon border, scattered with round mirror medallions and green, orange and maroon diamond motifs across the pale ground, finished with a scalloped maroon hem and tassels. White is the harder colour to find in garba wear and the easier one to accessorise — oxidised jewellery and a bright dupatta both land against it. The choli is white with green and orange florals.',
    hinglish:
      'Safed chaniya choli with kutchi mirror work — Navratri ke liye alag look.',
    meta_description:
      'White Kutchi mirror work dandiya chaniya choli with maroon border. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'White Chaniya Choli - Kutchi Dandiya Lehenga',
    alt: 'White dandiya chaniya choli laid flat — Kutchi mirror medallions on an off-white ground with a scalloped maroon border',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-13',
    slug: 'yellow-peacock-panel-garba-chaniya-choli',
    name: 'Yellow Peacock Panel Garba Chaniya Choli',
    body:
      'A yellow chaniya bordered in maroon, its lower half divided into green, purple, maroon and blue panels carrying peacock and tree-of-life embroidery, with a fan of mirrored teardrops radiating from the waist above them. The peacock panels are large enough to read from the back of a hall, which matters for a stage performance in a way a fine all-over print does not. Yellow floral choli, peacock-panel dupatta.',
    hinglish:
      'Peeli chaniya choli with mor design panels — garba stage performance ke liye.',
    meta_description:
      'Yellow garba chaniya choli with peacock panel embroidery and mirror work. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Yellow Peacock Garba Chaniya Choli Lehenga',
    alt: 'Yellow garba chaniya choli laid flat — peacock and tree-of-life panels in green and purple with mirrored teardrops at the waist',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-adult-1',
    slug: 'black-multicolour-mirror-work-garba-lehenga',
    name: 'Black Multicolour Mirror Work Garba Lehenga',
    body:
      'A black chaniya loaded with mirrors — kite-shaped panels in green, orange and maroon running from waist to hem, large circular mirror roundels and white pom-flowers scattered across the black ground, and a maroon edge finished in orange braid. Black is what makes the mirrors work: every piece of glass reads as a point of light instead of competing with the fabric under it. Black embroidered choli, mirrored maroon dupatta.',
    hinglish:
      'Kaali chaniya choli, heavy sheesha kaam — dandiya night dress jo lights mein chamke.',
    meta_description:
      'Black garba lehenga with heavy multicolour mirror work and kite panels. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Black Mirror Work Garba Lehenga Choli',
    alt: 'Black garba lehenga laid flat — multicolour kite panels and circular mirror roundels on black with an embroidered black choli',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-adult-2',
    slug: 'green-printed-gujarati-garba-chaniya-choli',
    name: 'Green Printed Gujarati Garba Chaniya Choli',
    body:
      'A green chaniya printed in concentric bands of paisley, floral medallions and geometric borders in the Gujarati style, with a maroon yoke panel radiating from the waist. Printed rather than mirrored, so it is the lighter and cooler choice of the range and the easier one to wash after a night out. The choli is maroon in the same print family and the dupatta repeats the border bands.',
    hinglish:
      'Hari printed gujrati chaniya choli — garba ke liye halki aur aaramdayak.',
    meta_description:
      'Green printed Gujarati garba chaniya choli, light and comfortable. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Green Gujarati Garba Chaniya Choli Printed',
    alt: 'Green printed Gujarati garba chaniya choli laid flat — concentric paisley and floral bands with a maroon yoke and printed choli',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-adult-3',
    slug: 'maroon-gold-embroidered-dandiya-night-lehenga',
    name: 'Maroon Gold Embroidered Dandiya Night Lehenga',
    body:
      'The heaviest piece in the range — a maroon chaniya covered almost edge to edge in gold and green thread work with mirrors set through it, a black yoke panel of gold teardrops, and large gold floral medallions running round the hem above a scalloped edge. This is the dressy one, closer to a sangeet lehenga than a dance costume, so it is the pick when the evening is as much about photographs as about raas. Choli and dupatta match.',
    hinglish:
      'Maroon aur gold heavy embroidery wali chaniya choli — dandiya night aur sangeet dono ke liye.',
    meta_description:
      'Maroon and gold heavy embroidered dandiya lehenga with mirror work. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Maroon Gold Dandiya Night Lehenga Choli',
    alt: 'Maroon dandiya lehenga laid flat — dense gold and green embroidery with mirrors, black teardrop yoke and a matching embroidered choli',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-adult-4',
    slug: 'black-and-red-medallion-garba-chaniya-choli',
    name: 'Black and Red Medallion Garba Chaniya Choli',
    body:
      'A black chaniya with a red upper panel worked in a red, green and white diamond lattice, opening into a lower skirt of large circular mirror medallions with yellow flowers set between them and a red scalloped hem. The medallions are spaced rather than crowded, which keeps the black ground visible and stops the skirt reading as a single busy mass on stage. Black mirrored choli, red and black dupatta.',
    hinglish:
      'Kaali aur laal chaniya choli with gol sheesha medallion — garba night ke liye.',
    meta_description:
      'Black and red garba chaniya choli with circular mirror medallions. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Black Red Garba Chaniya Choli Mirror Work',
    alt: 'Black and red garba chaniya choli laid flat — red diamond lattice yoke and circular mirror medallions on black with a mirrored choli',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-adult-5',
    slug: 'magenta-diamond-panel-dandiya-lehenga',
    name: 'Magenta Diamond Panel Dandiya Lehenga',
    body:
      'A rani-pink chaniya with a magenta border and yoke, its body split into radiating panels of yellow, orange, blue and green, each carrying mirrored diamond motifs, above a hem band of circular mirror medallions. Rani pink is the colour most asked for on the ninth night and the one that photographs best against a lit stage. The choli is mirrored in deep brown and magenta, with a magenta dupatta.',
    hinglish:
      'Rani pink chaniya choli with mirror diamond panels — Navratri dandiya dress.',
    meta_description:
      'Rani pink magenta dandiya lehenga with mirrored diamond panels. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Rani Pink Dandiya Lehenga Chaniya Choli',
    alt: 'Magenta dandiya lehenga laid flat — yellow, orange, blue and green diamond panels with mirror medallions and a magenta border',
  },
  {
    supplierSlug: 'garba-ghoomer-lehenga-adult-6',
    slug: 'black-red-triangle-border-garba-lehenga',
    name: 'Black and Red Triangle Border Garba Lehenga',
    body:
      'A black chaniya with gold-outlined ambi teardrops radiating from the waist, each filled with coloured mirrors, over a broad red hem band of green and white mirrored triangles. The border is the widest in the range, so the hem carries real weight and swings out cleanly on a turn rather than fluttering. Coloured dots are scattered across the black between the motifs. Black mirrored choli, triangle-motif dupatta.',
    hinglish:
      'Kaali chaniya choli with laal triangle border aur ambi design — garba raas ke liye.',
    meta_description:
      'Black garba lehenga with red mirrored triangle border and ambi motifs. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'Black Garba Lehenga - Red Mirror Border',
    alt: 'Black garba lehenga laid flat — gold ambi teardrops on black above a wide red border of mirrored triangles, with a mirrored black choli',
  },
  {
    supplierSlug: 'ghoomer-printed-adult',
    slug: 'white-peacock-palace-print-ghoomar-lehenga',
    name: 'White Peacock and Palace Print Ghoomar Lehenga',
    body:
      'A white ghoomar lehenga printed with radiating red, blue, black and orange stripes over a cream ground, and a scene running round the hem of peacocks, pink lotus flowers, domed haveli gateways and elephants in green foliage. Multicolour pom-poms finish the hem. The print reads Rajasthani ghoomar as much as Gujarati garba, so it doubles for folk dance items where the brief is not strictly Navratri. The blue choli is bordered in gold with a row of elephants.',
    hinglish:
      'Safed ghoomar lehenga with mor, kamal aur haathi print — garba aur rajasthani folk dance dono ke liye.',
    meta_description:
      'White ghoomar lehenga with peacock, lotus and palace print and pom-pom hem. Buy ₹2300 or rent ₹800 in Delhi NCR.',
    seo_title: 'White Ghoomar Lehenga - Peacock Print Choli',
    alt: 'White ghoomar lehenga laid flat — peacock, lotus, palace and elephant print with pom-pom hem and a blue gold-bordered choli',
  },
]

/** Body copy: description, the set note, the Hinglish line, the store tail. */
function toListing(item: Item): Listing {
  return {
    supplierSlug: item.supplierSlug,
    slug: item.slug,
    name: item.name,
    description: [item.body, SET_NOTE, item.hinglish, STORE_TAIL].join('\n'),
    meta_description: item.meta_description,
    seo_title: item.seo_title,
    alts: [item.alt],
  }
}

publishCatalogProducts(sb, ITEMS.map(toListing), {
  price: PRICE,
  rentPrice: RENT_PRICE,
  rentDeposit: RENT_DEPOSIT,
  size: SIZE,
  primaryCategoryId: DANDIYA_CATEGORY_ID,
  categoryIds: [DANDIYA_CATEGORY_ID, GARBA_CATEGORY_ID],
  apply: APPLY,
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
