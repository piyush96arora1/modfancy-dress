/**
 * Task 19a follow-up for the 25 Sep 2026 upload (plan stock lists S1 + S2): 19 products
 * added through the admin panel with no description, meta_description, seo_title or alt
 * text, several with names that do not say what the photo shows.
 *
 * Copy is written against the product photographs. Keyword targets come from
 * seodata/FESTIVAL-KEYWORDS-2026.md (dandiya dress 27,100/mo, top completion "for women";
 * ravan mukut 590; hanuman mask 390; durga maa fancy dress 320; garba dress for boy 480 at
 * KD 10 with "kediyu" as the name people ask for; "ravan costume for adults", "laxman
 * costume" and "ravan ka mukhota" as autocomplete gaps).
 *
 * Phases (all dry-run unless --apply):
 *   1. Rename slug + name where the upload name hid the product. Safe today: the pages
 *      are hours old with no rankings, and phase 5 308s the upload slug anyway.
 *   2. Fill description / meta_description / seo_title (and size where empty). Never
 *      overwrites a field that already has copy. Prices in metas come from the live row.
 *   3. Alt text per photo, only where empty.
 *   4. Extra categories (product_categories rows), only where missing.
 *   5. redirects.json: upload slug -> new slug, and the soft-deleted pages these products
 *      replace (Mahishasur, the boys' kediyu and girls' chaniya choli URLs) move from their
 *      interim category redirect to the new product. seodata/live-urls.json and
 *      seodata/pending-reupload-redirects.json are updated to match, and the whole graph
 *      is checked with validateRedirects before anything is written.
 *
 * Not fixed here, reported instead: dandiya-stick has rent ₹200 above its ₹80 price, a
 * data-entry error only the owner can correct, so its meta carries no price.
 *
 * Dry run:  npx tsx scripts/followup-oct5-batch.ts
 * Apply:    npx tsx scripts/followup-oct5-batch.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'
import { validateRedirects, type Redirect } from '../lib/seo/redirect-graph'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')
const LIVE_URLS_PATH = resolve(process.cwd(), 'seodata/live-urls.json')
const PENDING_PATH = resolve(process.cwd(), 'seodata/pending-reupload-redirects.json')

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

type Prices = { buy: number | null; rent: number | null }

type Item = {
  /** Slug as uploaded. */
  from: string
  /** New slug and name, when the upload name did not describe the product. */
  to?: string
  name?: string
  size?: string
  body: string
  /** At most one Roman-script Hinglish line, placed last before the store line. */
  hinglish?: string
  meta: (p: Prices) => string
  seo_title: string
  /** Alt text by image filename (basename of image_url). */
  alt: Record<string, string>
  addCategories?: string[]
  /** Soft-deleted product URLs this one replaces. */
  replaces?: string[]
}

const buyRent = ({ buy, rent }: Prices) => `Buy ₹${buy} or rent ₹${rent} in Delhi NCR.`

const WOMEN_SET = 'Sized for women and older teens; tell us your measurements when you book and we will set one aside.'

const ITEMS: Item[] = [
  // ---------------- Women's dandiya / garba (S1: "dandiya dress for women") ----------------
  {
    from: 'garba-dandiya-fancy-dress',
    to: 'dusty-blue-floral-dandiya-chaniya-choli',
    name: 'Dusty Blue Floral Dandiya Chaniya Choli',
    size: 'Adult',
    body:
      'A dusty blue chaniya choli for women, printed all over in soft pink, peach and mustard florals with a hem band of Mughal arches and medallions in navy and coral. The full-sleeve choli carries the same print with a floral waistband, and the matching blue dupatta has printed medallion panels and a tasselled edge. It is the quieter choice on a dandiya night full of red and black: pastel, detailed up close, and still wide enough in the flare to turn well in garba. ' +
      WOMEN_SET,
    hinglish: 'Pastel blue dandiya dress for women — halka rang, full flare, garba night ke liye.',
    meta: (p) => `Dusty blue floral dandiya chaniya choli for women with arch-print hem and matching dupatta. ${buyRent(p)}`,
    seo_title: 'Dusty Blue Floral Dandiya Chaniya Choli - Women',
    alt: {
      'garba-dandiya-fancy-dress.jpg':
        'Dusty blue floral dandiya chaniya choli for women — full-sleeve printed choli, arch-print hem and blue dupatta',
    },
  },
  {
    from: 'multi-garba-dandiya-dress',
    to: 'mustard-pink-patchwork-garba-chaniya-choli',
    name: 'Mustard and Pink Patchwork Garba Chaniya Choli',
    size: 'Adult',
    body:
      'A women\'s garba chaniya choli built from patchwork: mustard yellow lehenga panels alternate with purple lehariya stripes and Kutchi embroidered squares with elephant motifs, above a hem of round mirror work in red, green and gold. The choli is rani pink at the yoke with mirror embroidery and purple lehariya sleeves finished in mirror cuffs, and the mustard dupatta is edged to match. Bright, traditional and properly Gujarati, it is the one to pick for a first-night garba or a society dandiya where colour is the point. ' +
      WOMEN_SET,
    hinglish: 'Gujrati patchwork chaniya choli, mirror work ke saath — navratri garba ke liye.',
    meta: (p) => `Mustard and pink patchwork garba chaniya choli for women — lehariya, Kutchi embroidery and mirror work. ${buyRent(p)}`,
    seo_title: 'Mustard Pink Patchwork Garba Chaniya Choli',
    alt: {
      '1790318200203-ck3ycmr7f6.jpg':
        'Mustard and pink patchwork garba chaniya choli — purple lehariya panels, elephant embroidery and a mirror-work hem',
    },
  },
  {
    from: 'multi-color-dandiya-fancy-dress',
    to: 'rainbow-bandhani-dandiya-lehenga',
    name: 'Rainbow Bandhani Dandiya Lehenga',
    size: 'Adult',
    body:
      'A rainbow dandiya lehenga for women: tall bandhani-dot panels in purple, orange, royal blue, green, pink and lime run from waist to hem and finish in a broad gold border. The sleeveless choli is mustard bandhani with a purple V panel and gold trim, and the long mustard dupatta is worked with gold lace, pink diamond motifs and a scalloped gota edge. Every colour of the nine nights is in the skirt, so it suits any day of Navratri and photographs brightly under stage lights. ' +
      WOMEN_SET,
    hinglish: 'Rangeen bandhani lehenga — navratri ke har din ke liye ek dress.',
    meta: (p) => `Rainbow bandhani dandiya lehenga for women with gold border and mustard gota dupatta. ${buyRent(p)}`,
    seo_title: 'Rainbow Bandhani Dandiya Lehenga for Women',
    alt: {
      '1790318265374-quet3c6nbm8.jpg':
        'Rainbow bandhani dandiya lehenga — multicolour dotted panels with a gold border, mustard choli and gota dupatta',
    },
  },
  {
    from: 'black-dandiya-fancy-dress',
    to: 'black-red-block-print-dandiya-lehenga',
    name: 'Black and Red Block Print Dandiya Lehenga',
    size: 'Adult',
    body:
      'A black and red dandiya lehenga in traditional block print: alternating black and red panels covered in small bootis flare out to a hem of large paisleys and a studded red border. The three-quarter sleeves carry printed bands, and the black dupatta has a red paisley border, block-printed medallions and tassels. Black and red is the classic garba combination, and the fine hand-block look keeps it elegant rather than loud — good for women who want a traditional dandiya dress without heavy mirror work. ' +
      WOMEN_SET,
    hinglish: 'Kaali-laal block print dandiya dress, traditional look — garba raas ke liye.',
    meta: (p) => `Black and red block print dandiya lehenga for women with paisley hem and printed dupatta. ${buyRent(p)}`,
    seo_title: 'Black Red Block Print Dandiya Lehenga Choli',
    alt: {
      '1790318334161-q4r1c8xjei.jpg':
        'Black and red block print dandiya lehenga for women — booti panels, paisley hem and black printed dupatta',
    },
  },
  {
    from: 'black-and-red-dandiya-lehnga',
    to: 'black-maroon-ajrakh-border-garba-lehenga',
    name: 'Black Ajrakh Border Garba Lehenga',
    size: 'Adult',
    body:
      'A black garba lehenga for women with deep maroon ajrakh-style borders: a wide medallion band and paisleys circle the hem above a pleated black frill, and the fitted bodice is printed to match with a tie-back neck and frilled half sleeves. The plain black flare between the borders is what makes it spin well — there is a lot of fabric and nothing heavy to weigh it down — and the long black dupatta keeps the look simple. A strong pick for a dandiya night or a garba competition. ' +
      WOMEN_SET,
    hinglish: 'Black ajrakh lehnga, maroon border ke saath — dandiya night ke liye.',
    meta: (p) => `Black garba lehenga for women with maroon ajrakh-print borders, frilled hem and dupatta. ${buyRent(p)}`,
    seo_title: 'Black Ajrakh Garba Lehenga - Maroon Border',
    alt: {
      '1790318416211-sxw42rk5eni.jpg':
        'Black garba lehenga with maroon ajrakh-print medallion borders, pleated frill hem and black dupatta',
    },
  },
  {
    from: 'white-and-red-dandiya-dress',
    to: 'white-red-ajrakh-patchwork-dandiya-chaniya-choli',
    name: 'White and Red Ajrakh Patchwork Dandiya Chaniya Choli',
    size: 'Adult',
    body:
      'An off-white dandiya chaniya choli for women with a deep red and black ajrakh patchwork border — squares of block-printed motifs, peacocks and garba dancers — finished in a black frill. The cropped choli is the same red and black patchwork with frilled half sleeves and a tie-back, and the ivory dupatta has a printed red border. White with red is the look many women choose for Ashtami and the final garba nights, and the patchwork keeps it from reading plain on stage. ' +
      WOMEN_SET,
    hinglish: 'Safed aur laal chaniya choli, ajrakh patchwork — ashtami garba ke liye.',
    meta: (p) => `White and red dandiya chaniya choli for women with ajrakh patchwork border and ivory dupatta. ${buyRent(p)}`,
    seo_title: 'White Red Ajrakh Dandiya Chaniya Choli',
    alt: {
      '1790318469371-0r3ejgnvr7ap.jpg':
        'Off-white dandiya chaniya choli with red and black ajrakh patchwork border, patchwork choli and ivory dupatta',
    },
  },

  // ---------------- Garba for kids (S1, R1 re-uploads) ----------------
  {
    from: 'boy-garba-dandiya-fancy-dress',
    to: 'orange-kediyu-garba-dress-for-boys',
    name: 'Orange Kediyu Garba Dress for Boys',
    body:
      'A complete kediyu set for boys in bright orange: the flared kediyu top has a mirror-work yoke in green, blue and red, mirrored cuffs and a double-tiered frill with embroidered bands, worn over matching dhoti-style pants trimmed with a mirror stripe down each leg. A round mirror-work cap finishes the Gujarati look. Kediyu is the traditional garba dress for boys and men, and this one is made to be danced in — light, loose at the legs and bright enough to stand out in a school garba line. Fits most school-age boys.',
    hinglish: 'Garba dress for boy — kediyu, dhoti aur topi, poora set.',
    meta: (p) => `Orange kediyu garba dress for boys — mirror-work top, dhoti pants and cap. ${buyRent(p)}`,
    seo_title: 'Kediyu Garba Dress for Boys - Orange Mirror Work',
    alt: {
      '1790319479490-2xcpji3qmxt.jpg':
        'Orange kediyu garba dress for boys laid flat — mirror-work frilled top, dhoti pants and mirror cap',
      '1790319523829-lmx5xzeefn.jpg':
        'Boy wearing an orange kediyu garba dress with mirror-work yoke, dhoti pants and cap',
    },
    addCategories: ['kids'],
    replaces: [
      'garba-dance-fancy-dress-boys-costume',
      'garba-dance-fancy-dress-for-boys',
      'folk-dance-dress-with-pagri-for-boys-fancy-dress',
    ],
  },
  {
    from: 'girl-garba-dandiya-fancy-dress',
    to: 'garba-chaniya-choli-for-girls',
    name: 'Garba Chaniya Choli for Girls',
    body:
      'A garba chaniya choli for girls in two colours — red or yellow. Both have a sleeveless Kutchi-embroidered choli in multicolour geometric work, a printed flared chaniya with a wide embroidered border and a pom-pom tassel hem, and a plain dupatta in the same colour with an embroidered edge. It is light cotton-feel fabric that a child can dance in for a whole school garba programme, and the embroidery reads clearly from the audience. Tell us red or yellow when you book. Fits most school-age girls.',
    hinglish: 'Ladkiyon ke liye garba chaniya choli — laal ya peela, navratri function ke liye.',
    meta: (p) => `Garba chaniya choli for girls in red or yellow — Kutchi embroidered choli, tassel hem, dupatta. ${buyRent(p)}`,
    seo_title: 'Garba Chaniya Choli for Girls - Red or Yellow',
    alt: {
      'girl-garba-dandiya-fancy-dress.jpg':
        'Red garba chaniya choli for girls — Kutchi embroidered choli, printed chaniya with tassel hem, shown flat and worn',
      'girl-garba-dandiya-fancy-dress-2.jpg':
        'Yellow garba chaniya choli for girls — embroidered choli, printed chaniya and yellow dupatta, shown flat and worn',
    },
    addCategories: ['kids'],
    replaces: [
      'garba-dance-chaniya-choli-fancy-dress-costume',
      'gujarati-garba-chaniya-choli-costume-girls-fancy-dress',
      'gujarati-garba-dance-chaniya-choli-for-girls-fancy-dress',
      'gujarati-garba-chaniya-choli-costume-girls',
      'gujarati-garba-dance-chaniya-choli-for-girls',
    ],
  },
  {
    from: 'dandiya-stick',
    to: 'dandiya-sticks',
    name: 'Dandiya Sticks',
    body:
      'A pair of wooden dandiya sticks wrapped in bright ribbon — orange at the top, sky blue through the middle and maroon at the base, each band edged with gold and finished with a rubber cap so they are kinder on hands and floors. The standard length suits both kids and adults for dandiya raas. Add a pair to any dandiya dress or chaniya choli so the costume is ready for the dance floor.',
    hinglish: 'Dandiya ki sticks, ek jodi — garba aur dandiya raas ke liye.',
    // Price omitted on purpose: rent (₹200) is above the price (₹80), reported to the owner.
    meta: () => 'Ribbon-wrapped wooden dandiya sticks, sold as a pair with rubber caps — for dandiya raas and Navratri garba in Delhi NCR.',
    seo_title: 'Dandiya Sticks Pair - Navratri Garba',
    alt: {
      'dandiya-stick.jpg': 'Pair of dandiya sticks wrapped in orange, sky blue and maroon ribbon with gold bands',
    },
    addCategories: ['dandiya-dress', 'garba-dress'],
  },

  // ---------------- Durga Puja / Navratri ----------------
  {
    from: 'maa-durga-fancy-dress',
    body:
      'A Maa Durga fancy dress for girls in red and green, the colours Durga is always shown in: a red saree draped dhoti-style with wide green and gold zari borders, a matching red blouse, and a gold mukut, sword and trishul so the full look is ready for the stage. It suits Navratri and Durga Ashtami school programmes, kanjak and Durga Puja tableaux. Tie the pallu over the shoulder as in the photo, add bangles and a bindi, and she is ready. Fits most school-age girls.',
    hinglish: 'Durga mata ki dress for girls — mukut, talwar aur trishul ke saath.',
    meta: (p) => `Maa Durga fancy dress for girls — red and green saree with crown, sword and trishul. ${buyRent(p)}`,
    seo_title: 'Maa Durga Fancy Dress for Girls - Navratri',
    alt: {
      'maa-durga-fancy-dress.jpg':
        'Maa Durga fancy dress for girls — red saree with green zari border, shown flat and worn with crown, sword and trishul',
    },
    addCategories: ['kids'],
  },
  {
    from: 'mahishasur-fancy-dress',
    body:
      'A Mahishasur fancy dress for the Durga Puja and Navratri stage: a black satin kurta with a large gold embroidered collar and gold cuffs, wide black dhoti pants with a double gold stripe down each leg, a tall gold mukut, a curved sword and a trishul. It pairs with our Maa Durga costume for the Mahishasura Mardini scene, and works equally as a demon king in a Ramleela. Shown here on a boy and on an adult — ask the shop for your size.',
    hinglish: 'Mahishasur ka costume — Durga puja natak ke liye.',
    meta: (p) => `Mahishasur fancy dress — black and gold demon king costume with crown, sword and trishul. ${buyRent(p)}`,
    seo_title: 'Mahishasur Fancy Dress - Durga Puja Costume',
    alt: {
      'mahisa-sur-fancy-dress.jpg':
        'Mahishasur fancy dress — black satin kurta with gold collar, striped dhoti pants, crown, sword and trishul, flat and worn by a boy',
      'mahishasur-fancy-dress-2.jpg':
        'Adult in a Mahishasur costume — black and gold outfit with gold crown, holding a sword and trishul',
    },
    replaces: ['mahishasur-fancy-dress-costume'],
  },

  // ---------------- Ramleela (S2) ----------------
  {
    from: 'raavan-fancy-dress',
    to: 'ravan-costume-for-adults',
    name: 'Ravan Costume for Adults',
    body:
      'A Ravan costume for adults, made for Ramleela stages and Dussehra: a black velvet kurta covered in gold zari, sequins and fringed shoulder pieces, black dhoti pants with a red and gold border, embroidered wrist cuffs, a tall gold and jewelled mukut and a gold gada. It is the full demon-king look for men playing Ravan in a committee Ramleela, an office Dussehra event or a college play. For children, see our kids Ravan dress; the ten-head Ravan mask and Ravan mukut are sold separately.',
    hinglish: 'Ravan ka costume for men — Ramleela aur Dussehra ke liye.',
    meta: (p) => `Ravan costume for adults — black velvet and gold zari with mukut and gada for Ramleela. ${buyRent(p)}`,
    seo_title: 'Ravan Costume for Adults - Ramleela Dress',
    alt: {
      'raavan-fancy-dress.jpg':
        'Man wearing an adult Ravan costume — black velvet with gold zari, red-bordered dhoti, gold mukut and gada',
    },
    addCategories: ['indian-mythology-costumes'],
  },
  {
    from: 'ravan-face',
    to: 'ravan-mask',
    name: 'Ravan 10 Head Mask',
    body:
      'A ten-head Ravan mask for Dussehra: nine painted blue Ravan faces with crowns and moustaches fan out either side of a gold crown band with a horse-head crest, and an elastic strap holds it on. Worn across the forehead it gives the Dashanan look instantly, without heavy make-up. It fits kids and adults and pairs with any Ravan dress, including our kids and adult Ravan costumes, for Ramleela or a school Dussehra programme.',
    hinglish: 'Ravan ka mukhota, das sir wala — Dussehra ke liye.',
    meta: (p) => `Ten-head Ravan mask (mukhota) with crown band and elastic — for Dussehra and Ramleela. ${buyRent(p)}`,
    seo_title: 'Ravan Mask - 10 Head Mukhota for Dussehra',
    alt: {
      'ravan-face.jpg': 'Ten-head Ravan mask — blue painted Ravan faces on either side of a gold crown band',
    },
    addCategories: ['indian-mythology-costumes'],
  },
  {
    from: 'ravan-mukut',
    body:
      'A tall Ravan mukut in black velvet, worked in gold sequins, gold braid, pearls and red stones, with a spiky gold tinsel fringe around the edge and a red and gold band at the base. It is a stage crown made to be seen from the back of a Ramleela pandal. It suits kids and adults and completes any Ravan costume, and works for other demon-king roles too.',
    hinglish: 'Ravan ka mukut — Ramleela aur Dussehra ke liye.',
    meta: (p) => `Ravan mukut — black velvet crown with gold sequins, pearls and tinsel for Ramleela. ${buyRent(p)}`,
    seo_title: 'Ravan Mukut - Crown for Ramleela & Dussehra',
    alt: {
      '1790319404662-73lnc5d79pu.jpg':
        'Ravan mukut — black velvet crown worked in gold sequins, pearls and red stones with a gold tinsel fringe',
    },
  },
  {
    from: 'laxman-fancy-dress',
    body:
      'A Laxman fancy dress for kids in royal green and gold — a green kurta covered in gold diamond embroidery with fringed sleeves and hem, green dhoti pants with gold bands, a jewelled gold mukut and a gold bow and arrows. This is Laxman as the prince of Ayodhya, for the palace and coronation scenes and for Ram-Sita-Laxman tableaux at Dussehra and Diwali. For the forest years, pick our Vanvasi Laxman dress. Fits most school-age kids.',
    hinglish: 'Laxman ji ki dress for kids — Ramleela aur Diwali jhanki ke liye.',
    meta: (p) => `Laxman fancy dress for kids — green and gold royal costume with crown, bow and arrows. ${buyRent(p)}`,
    seo_title: 'Laxman Fancy Dress for Kids - Ramleela',
    alt: {
      'laxman-fancy-dress.jpg':
        'Boy in a Laxman fancy dress — green and gold embroidered kurta, green dhoti, gold crown, bow and arrows',
    },
    addCategories: ['indian-mythology-costumes'],
  },
  {
    from: 'vanvasi-laxman-fancy-dress',
    body:
      'A Vanvasi Laxman fancy dress for the forest chapters of the Ramayana: a plain saffron kurta and saffron dhoti with a red sash at the waist, a long black wig for the jata, and rudraksha malas for the neck and wrists. Shown with a bow and quiver. It matches our Vanvasi Ram set, so the two brothers can go on stage together for Ramleela, Dussehra or a school Ramayana play. For the crowned prince, see our Laxman fancy dress. Fits most school-age kids.',
    hinglish: 'Vanvasi Laxman ki dress — Ram ke saath Ramleela ke liye.',
    meta: (p) => `Vanvasi Laxman fancy dress for kids — saffron kurta and dhoti with sash, wig and rudraksha malas. ${buyRent(p)}`,
    seo_title: 'Vanvasi Laxman Fancy Dress for Kids',
    alt: {
      'vanvasi-laxman-fancy-dress.jpg':
        'Vanvasi Laxman fancy dress — saffron kurta and dhoti with red sash, wig and rudraksha malas, shown flat and worn',
    },
    addCategories: ['indian-mythology-costumes'],
  },
  {
    from: 'hanuman-mask',
    body:
      'A Hanuman mask in glossy orange with a sculpted gold mukut, black brows and hair at the sides, with eye holes and an elastic strap. It turns any red or orange outfit into Bajrangbali for Ramleela, Dussehra, Hanuman Jayanti or a school play, and suits kids and adults. Add a gada from our accessories and one of our Hanuman dresses for the full look.',
    hinglish: 'Hanuman ji ka mask — Ramleela aur Dussehra ke liye.',
    meta: (p) => `Hanuman mask with gold crown for kids and adults — for Ramleela, Dussehra and school plays. ${buyRent(p)}`,
    seo_title: 'Hanuman Mask - Ramleela & Dussehra',
    alt: {
      'hanuman-mask.jpg': 'Orange Hanuman mask with a sculpted gold crown and black brows',
    },
    addCategories: ['indian-mythology-costumes'],
  },
  {
    from: 'ram-bow-and-arrow',
    name: 'Ram Bow and Arrow Set',
    body:
      'A Ram bow and arrow set for the stage: a curved bow wrapped in red and gold with a gold string, four gold-tipped arrows and a gold glitter quiver to carry them. Light enough for a child to hold through a whole scene, it completes a Ram or Laxman costume for Ramleela, Dussehra and Diwali tableaux.',
    hinglish: 'Ram ji ka dhanush baan — Ramleela ke liye.',
    meta: (p) => `Ram bow and arrow set with four gold arrows and a quiver — for Ram and Laxman costumes. ${buyRent(p)}`,
    seo_title: 'Ram Bow and Arrow Set with Quiver',
    alt: {
      'ram-bow-and-arrow.jpg': 'Ram bow and arrow set — red and gold bow, four gold-tipped arrows and a gold quiver',
    },
    addCategories: ['indian-mythology-costumes'],
  },
  {
    from: 'rudraksh-mala',
    to: 'rudraksha-mala-set',
    name: 'Rudraksha Mala Set',
    body:
      'A rudraksha mala set for costumes: a long rudraksh bead necklace, two rudraksha bands on red threads for the wrists or arms, and a pair of rudraksha earrings. It completes a rishi, sadhu, Shiv, Vanvasi Ram or Vanvasi Laxman look for Ramleela, Mahashivratri and school plays. Light prop beads, made for the stage.',
    hinglish: 'Rudraksh mala set — rishi aur Shiv ji ke costume ke liye.',
    meta: (p) => `Rudraksha mala set — necklace, two wrist bands and earrings for rishi, Shiv and Vanvasi costumes. ${buyRent(p)}`,
    seo_title: 'Rudraksha Mala Set - Rishi & Shiv Costume',
    alt: {
      'rudraksh-mala.jpg': 'Rudraksha mala set — bead necklace, two red-thread wrist bands and a pair of earrings',
    },
  },
]

type Row = {
  id: string
  slug: string
  name: string
  price: number | null
  rent_price: number | null
  size: string | null
  description: string | null
  meta_description: string | null
  seo_title: string | null
  deleted_at: string | null
  product_images: { id: string; image_url: string; alt_text: string | null }[]
  product_categories: { category_id: string }[]
}

const basename = (u: string) => u.split('?')[0].split('/').pop()!

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')

  const { data: cats, error: ce } = await sb.from('categories').select('id, slug').eq('is_active', true)
  if (ce) throw ce
  const catId = new Map(cats!.map((c) => [c.slug, c.id as string]))

  // ---- Load and pre-check everything before the first write ----
  const problems: string[] = []
  const rows = new Map<string, Row>()
  for (const it of ITEMS) {
    const slugs = [it.from, it.to].filter(Boolean) as string[]
    const { data, error } = await sb
      .from('products')
      .select('id, slug, name, price, rent_price, size, description, meta_description, seo_title, deleted_at, product_images(id, image_url, alt_text), product_categories(category_id)')
      .in('slug', slugs)
      .is('deleted_at', null)
    if (error) throw error
    if (data!.length !== 1) {
      problems.push(`${it.from}: expected 1 live row for ${slugs.join(' / ')}, found ${data!.length}`)
      continue
    }
    const row = data![0] as Row
    rows.set(it.from, row)

    if (it.to && row.slug === it.from) {
      const { data: clash } = await sb.from('products').select('id, name').eq('slug', it.to).maybeSingle()
      if (clash) problems.push(`${it.from}: target slug ${it.to} is taken by "${clash.name}"`)
    }
    const meta = it.meta({ buy: row.price, rent: row.rent_price })
    if (meta.includes('null') || meta.includes('undefined')) problems.push(`${it.from}: price missing in meta`)
    for (const v of checkCopy({ seoTitle: it.seo_title, metaDescription: meta })) problems.push(`${it.from}: ${v}`)
    for (const img of row.product_images) {
      if (!img.alt_text && !it.alt[basename(img.image_url)]) problems.push(`${it.from}: no alt text for ${basename(img.image_url)}`)
    }
    for (const c of it.addCategories ?? []) if (!catId.has(c)) problems.push(`${it.from}: category ${c} not active`)
  }
  if (problems.length) {
    console.error('❌ Pre-checks failed, nothing written:\n  ' + problems.join('\n  '))
    process.exit(1)
  }

  // ---- Phases 1–4, per product ----
  for (const it of ITEMS) {
    const row = rows.get(it.from)!
    const slug = it.to ?? it.from
    console.log(`\n── ${slug}${it.to && row.slug !== it.to ? `  (was ${it.from})` : ''}`)

    const patch: Record<string, string> = {}
    if (it.to && row.slug !== it.to) patch.slug = it.to
    if (it.name && row.name !== it.name) patch.name = it.name
    if (it.size && !row.size) patch.size = it.size
    if (!row.description) patch.description = [it.body, it.hinglish, it.body.includes(STORE_TAIL) ? '' : STORE_TAIL].filter(Boolean).join('\n')
    if (!row.meta_description) patch.meta_description = it.meta({ buy: row.price, rent: row.rent_price })
    if (!row.seo_title) patch.seo_title = it.seo_title

    for (const [k, v] of Object.entries(patch)) {
      const old = (row as unknown as Record<string, unknown>)[k]
      console.log(`   ${k}: ${old ? `${String(old).slice(0, 40)} -> ` : ''}${v.length > 110 ? v.slice(0, 110) + '…' : v}`)
    }
    if (APPLY && Object.keys(patch).length) {
      const { error } = await sb.from('products').update(patch).eq('id', row.id)
      if (error) throw new Error(`${slug}: ${error.message}`)
    }

    for (const img of row.product_images) {
      if (img.alt_text) continue
      const alt = it.alt[basename(img.image_url)]
      console.log(`   alt[${basename(img.image_url)}]: ${alt}`)
      if (APPLY) {
        const { error } = await sb.from('product_images').update({ alt_text: alt }).eq('id', img.id)
        if (error) throw new Error(`${slug} alt: ${error.message}`)
      }
    }

    const have = new Set(row.product_categories.map((c) => c.category_id))
    for (const c of it.addCategories ?? []) {
      if (have.has(catId.get(c)!)) continue
      console.log(`   + category ${c}`)
      if (APPLY) {
        const { error } = await sb.from('product_categories').insert({ product_id: row.id, category_id: catId.get(c)! })
        if (error) throw new Error(`${slug} category ${c}: ${error.message}`)
      }
    }
  }

  // ---- Phase 5: redirects ----
  console.log('\n=== REDIRECTS ===')
  const redirects: Redirect[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
  const live = new Set<string>(JSON.parse(readFileSync(LIVE_URLS_PATH, 'utf8')))

  const upsert = (source: string, destination: string) => {
    const i = redirects.findIndex((r) => r.source === source)
    if (i >= 0) {
      if (redirects[i].destination === destination) return
      console.log(`   ~ ${source}: ${redirects[i].destination} -> ${destination}`)
      redirects[i] = { ...redirects[i], destination }
    } else {
      console.log(`   + ${source} -> ${destination}`)
      redirects.push({ source, destination, permanent: true })
    }
  }

  const resolved = new Set<string>()
  for (const it of ITEMS) {
    const slug = it.to ?? it.from
    for (const prefix of ['/products/', '/wholesale/']) live.add(prefix + slug)
    const olds = [...(it.replaces ?? []), ...(it.to ? [it.from] : [])]
    for (const old of olds) {
      for (const prefix of ['/products/', '/wholesale/']) {
        live.delete(prefix + old)
        upsert(prefix + old, prefix + slug)
      }
      resolved.add(old)
    }
  }

  const issues = validateRedirects(redirects, live)
  if (issues.length) {
    console.error('❌ Redirect graph problems, not writing redirects:\n  ' + issues.join('\n  '))
    process.exit(1)
  }

  const pending: { oldSlug: string }[] = JSON.parse(readFileSync(PENDING_PATH, 'utf8'))
  const stillPending = pending.filter((p) => !resolved.has(p.oldSlug))
  console.log(`   pending re-upload redirects: ${pending.length} -> ${stillPending.length}`)

  if (APPLY) {
    writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 2) + '\n')
    writeFileSync(LIVE_URLS_PATH, JSON.stringify([...live].sort(), null, 2) + '\n')
    writeFileSync(PENDING_PATH, JSON.stringify(stillPending, null, 2) + '\n')
    console.log('   wrote redirects.json, seodata/live-urls.json, seodata/pending-reupload-redirects.json')
  }

  console.log('\nOwner to fix: dandiya-sticks rent ₹200 is above its ₹80 price.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
