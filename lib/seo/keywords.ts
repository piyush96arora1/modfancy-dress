/**
 * Per-page SEO keywords.
 *
 * `generatePageMetadata` emits the site-wide list from `metadata.ts` unless a
 * page passes its own set. This module holds the curated per-product and
 * per-category sets, in the same spirit as `title-helpers.ts` — SEO decisions
 * kept in code, next to the other SEO decisions, rather than spread across rows.
 *
 * Ordering matters: most important term first.
 *
 * Volumes in the comments are India monthly search volume from the Semrush gap
 * export in `seodata/` (17 Jun 2026). `modfancydress.com` ranked nowhere for
 * any of the Ramleela character terms at export time; the one exception is
 * noted inline. The same is true of every garba/dandiya term in `GARBA_CORE` —
 * position 0 across the board, on a category where the site already has two
 * written category pages.
 *
 * A note on expectations: Google has not used the `<meta name="keywords">` tag
 * as a ranking signal since 2009, so this tag is not what will move these
 * pages. The terms below matter because they are also worked into each
 * product's `seo_title`, `meta_description`, body copy and image alt text —
 * which is what actually ranks. Keeping them in one list keeps those four
 * places honest and consistent.
 */

/** Shared by every Ramleela character page. `ram leela costume` is 880/mo at KD 16. */
const RAMLEELA_CORE = [
  'ramleela costume',
  'ram leela costume',
  'ramleela dress',
  'ramlila dress',
  'ramayana character costume',
  'mythological fancy dress',
  'Dussehra costume',
]

/**
 * Shared by every product in the Dandiya Dress and Garba Dress categories.
 *
 * Volumes from the same Semrush gap export. This set is the biggest single
 * opportunity on the site: `dandiya dress` alone is 27,100/mo and
 * modfancydress.com ranked at position 0 — nowhere — for every term below at
 * export time, despite both category pages already carrying copy.
 *
 * The transliterated spellings (`gujrati`/`gujarati`, `chaniya`/`chania`,
 * `ghoomar`/`ghumar`) are carried deliberately: the export shows real volume on
 * `gujrati dandiya dress` (170) under the non-standard spelling, so normalising
 * them away would drop the query we can actually win.
 */
const GARBA_CORE = [
  'dandiya dress', // 27100 · KD 32
  'dandiya night dress', // 2400 · KD 17
  'garba costume', // 1300 · KD 27
  'dandiya night outfits', // 1300 · KD 19
  'dandiya costume', // 590 · KD 28
  'garba dance costume', // 480 · KD 24
  'navratri fancy dress', // 390 · KD 27
  'dandiya clothes', // 320 · KD 28
  'dandiya wear', // 320 · KD 31
  'garba costume for women', // 210 · KD 17
  'gujrati dandiya dress', // 170 · KD 24
  'dandiya dress online', // 140 · KD 11
  'lehenga dance costume', // 140 · KD 18
  'chaniya choli',
  'garba lehenga',
  'ghoomar lehenga',
]

/**
 * Shared by every product in Superhero Costumes. Position 0 across the board at
 * export time, on a category page whose own copy promises "Captain America,
 * Green Hulk, Chota Bheem" — the listing, not the landing page, was the gap.
 */
const SUPERHERO_CORE = [
  'kids superhero costumes', // 720 · KD 25
  'superhero dress', // 390 · KD 25
  'superhero dress for boy', // 320 · KD 24
  'superhero fancy dress', // 260 · KD 27
  'superhero dress for kids', // 170 · KD 14
  'superhero costumes for boys', // 140 · KD 26
  'childrens super hero fancy dress', // 110 · KD 13
  'superhero fancy dress competition', // 110 · KD 10
  'superhero dress for baby boy', // 110 · KD 23
  'superhero costume for kids',
]

/**
 * Character-specific terms, keyed by product slug. Each list is merged ahead of
 * `RAMLEELA_CORE`, so the character term always leads.
 */
const PRODUCT_KEYWORDS: Record<string, string[]> = {
  // hanuman costume 1300 · hanuman fancy dress 590 · hanuman tail 480 · hanuman mask 390
  'hanuman-ji-fancy-dress': [
    'Hanuman costume',
    'Hanuman fancy dress',
    'Hanuman dress for kids',
    'Hanuman fancy dress ideas',
    'Bajrangbali costume',
  ],
  'hanuman-red-fancy-dress': [
    'Hanuman costume',
    'Hanuman fancy dress',
    'red Hanuman dress',
    'Hanuman fancy dress ideas',
    'Bajrangbali costume',
  ],
  'hanuman-yellow-fancy-dress': [
    'Hanuman costume',
    'Hanuman fancy dress',
    'yellow Hanuman dress',
    'Hanuman fancy dress ideas',
    'Bajrangbali costume',
  ],

  // ram dress 590 · rama dress 590 · ram costume 480 · ram fancy dress 320 · king dress for drama 210
  'raja-ram-fancy-dress': [
    'Ram dress',
    'Ram costume',
    'Ram fancy dress',
    'Raja Ram costume',
    'king dress for drama',
    'Shri Ram costume for kids',
  ],
  // ram costume ideas 390 · rama fancy dress 170 · ram dress for child 170
  // merged into the older vanvasi-ram-fancy-dress page on 19 Sep 2026
  'vanvasi-ram-fancy-dress': [
    'Vanvasi Ram fancy dress',
    'Ram costume ideas',
    'Ram dress for child',
    'Banwasi Ram costume',
    'Rama fancy dress',
    'Ram vanvas dress',
  ],

  // ravan dress 590 at KD 15 — modfancydress.com already ranked #18 here, the one
  // term on this page set with existing traction. The product was renamed from
  // `raavan-black-dress` to `ravan-fancy-dress` on 19 Sep 2026; the copy still carries
  // the "raavan" spelling too, since that is how the shop writes it.
  'ravan-fancy-dress': [
    'Ravan dress',
    'Ravan fancy dress',
    'Ravana costume',
    'Raavan costume for kids',
    'Lankesh costume',
    'Dussehra Ravan dress',
  ],

  // meghnath is Indrajit — barbietales ranks a "ravan indrajith meghnath kings crown"
  // page for king mukut (720), so both names are worth carrying.
  'meghnath-fancy-dress': [
    'Meghnath fancy dress',
    'Indrajit costume',
    'Meghnad costume',
    'Ravan son costume',
    'demon king costume for kids',
  ],

  'kumbhkaran-fancy-dress': [
    'Kumbhkaran fancy dress',
    'Kumbhkarna costume',
    'Kumbhkaran dress for kids',
    'rakshasa costume',
    'demon costume for Ramleela',
  ],

  // jatayu costume 170
  'jatayu-fancy-dress': [
    'Jatayu costume',
    'Jatayu fancy dress',
    'Jatayu bird costume',
    'eagle costume for kids',
    'Ramayana bird costume',
  ],

  // vanar sena costume 140
  'jaamvant-fancy-dress': [
    'Jaamvant fancy dress',
    'Jambavan costume',
    'bear costume for kids',
    'Jamvant dress',
    'vanar sena costume',
  ],

  // sanyasi dress 480 · narad muni costume 390
  'rishi-fancy-dress': [
    'Rishi fancy dress',
    'sanyasi dress',
    'Rishi Muni costume',
    'sadhu costume for kids',
    'saint fancy dress',
    'Vishwamitra costume',
  ],

  // ganesh costume 720 · ganpati costume 720 · ganpati fancy dress 320 · ganesh mask 1000
  'ganesh-fancy-dress': [
    'Ganesh costume',
    'Ganpati costume',
    'Ganpati fancy dress',
    'Ganesh fancy dress for kids',
    'Ganesh mask',
    'Ganpati face mask',
    'Ganesh Chaturthi costume',
  ],

  // ---- Garbha lehenge batch, 19 Sep 2026. Each list leads on the colour or
  // motif a shopper would actually type after seeing the photo, then the
  // garment noun. GARBA_CORE is appended by category, so the volume terms are
  // not repeated here.
  'yellow-elephant-motif-garba-chaniya-choli': [
    'yellow chaniya choli',
    'yellow garba lehenga',
    'elephant motif lehenga',
    'mirror work chaniya choli',
  ],
  'multicolour-patchwork-mirror-work-garba-lehenga': [
    'multicolour chaniya choli',
    'patchwork garba lehenga',
    'mirror work garba dress',
    'kutchi patchwork lehenga',
  ],
  'maroon-kutchi-embroidered-dandiya-lehenga': [
    'maroon chaniya choli',
    'kutchi embroidery lehenga',
    'maroon garba lehenga',
    'embroidered dandiya dress',
  ],
  'rainbow-panel-mirror-work-garba-chaniya-choli': [
    'multicolour garba lehenga',
    'rainbow chaniya choli',
    'mirror work dandiya dress',
    'colourful garba dress',
  ],
  'garba-dancer-print-navratri-chaniya-choli': [
    'printed chaniya choli',
    'garba print lehenga',
    'cotton garba dress',
    'navratri printed lehenga',
  ],
  'red-and-black-mirror-work-garba-lehenga': [
    'red chaniya choli',
    'red and black garba lehenga',
    'mirror work lehenga choli',
    'red dandiya dress',
  ],
  'white-kutchi-mirror-work-dandiya-chaniya-choli': [
    'white chaniya choli',
    'white garba lehenga',
    'kutchi mirror work lehenga',
    'white dandiya dress',
  ],
  'yellow-peacock-panel-garba-chaniya-choli': [
    'yellow chaniya choli',
    'peacock lehenga',
    'yellow dandiya dress',
    'embroidered garba lehenga',
  ],
  'black-multicolour-mirror-work-garba-lehenga': [
    'black chaniya choli',
    'black garba lehenga',
    'heavy mirror work lehenga',
    'black dandiya dress',
  ],
  'green-printed-gujarati-garba-chaniya-choli': [
    'green chaniya choli',
    'gujarati garba dress',
    'printed garba lehenga',
    'green dandiya dress',
  ],
  'maroon-gold-embroidered-dandiya-night-lehenga': [
    'heavy chaniya choli',
    'maroon gold lehenga',
    'designer dandiya dress',
    'embroidered garba costume',
  ],
  'black-and-red-medallion-garba-chaniya-choli': [
    'black and red chaniya choli',
    'mirror work garba lehenga',
    'black dandiya night dress',
    'medallion embroidery lehenga',
  ],
  'magenta-diamond-panel-dandiya-lehenga': [
    'pink chaniya choli',
    'rani pink garba lehenga',
    'magenta dandiya dress',
    'mirror work chaniya choli',
  ],
  'black-red-triangle-border-garba-lehenga': [
    'black chaniya choli',
    'black garba dress',
    'mirror work dandiya lehenga',
    'ambi motif lehenga',
  ],
  'white-peacock-palace-print-ghoomar-lehenga': [
    'white chaniya choli',
    'ghoomar lehenga',
    'peacock print lehenga',
    'printed navratri dress',
  ],

  // `hulk mask` is 720/mo on its own and this costume ships with the mask, so
  // the term is honest here. It leads for that reason.
  'hulk-muscle-fancy-dress-with-mask': [
    'Hulk fancy dress', // 170 · KD 23
    'Hulk mask', // 720 · KD 25
    'Hulk costume for kids',
    'Hulk muscle suit',
    'Hulk dress for boy',
    'Avengers fancy dress',
  ],
  // No Iron Man rows exist in the Semrush exports — they were seeded from other
  // queries — so these carry no volume claim. Both spellings are listed because
  // Indian shoppers use them interchangeably and neither is clearly dominant.
  // `sita vanvas dress` at 880/mo is the largest character term in the export
  // that we stock exactly, and the site ranks 0 for it. The Meera terms are here
  // because the garment genuinely is the standard Meera Bai costume and the site
  // already ranks #22 for `meera bai fancy dress` with nothing aimed at it.
  'vanvasi-sita-saree-dress': [
    'sita vanvas dress', // 880 · KD 29
    'vanvasi sita fancy dress', // 260 · KD 25
    'sita costume', // 480 · KD 26
    'sita dress', // 390 · KD 26
    'sita fancy dress', // 320 · KD 27
    'sita costume for fancy dress', // 210 · KD 17
    'sita mata dress', // 210 · KD 27
    'sita dress for kid girl', // 210 · KD 25
    'meera bai fancy dress', // 210 · KD 23 — currently #22
    'meera bai costume', // 170 · KD 27
    'meera fancy dress', // 140 · KD 19
  ],
  'iron-man-muscle-fancy-dress-with-mask': [
    'Iron Man fancy dress',
    'Ironman costume for kids',
    'Iron Man dress for boy',
    'Iron Man muscle suit',
    'Iron Man mask',
    'Avengers fancy dress',
  ],
}

/** Category pages, keyed by category slug. */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'ramleela-costumes': [
    'ramleela costume',
    'ram leela costume',
    'ramleela dress',
    'ramlila dress',
    'Ramayana characters costume',
    'Ram Sita Hanuman dress',
    'Ravan dress',
    'Dussehra costume',
    'mythological characters for fancy dress competition',
    'Indian mythology fancy dress',
    'sita vanvas dress',
    'sita costume',
    'ram sita dress',
  ],
  'dandiya-dress': [
    'dandiya dress',
    'dandiya night dress',
    'dandiya night outfits',
    'dandiya costume',
    'dandiya dress for girl',
    'dandiya clothes',
    'dandiya wear',
    'gujrati dandiya dress',
    'dandiya dress online',
    'chaniya choli for dandiya',
  ],
  'superhero-costumes': [
    'superhero costume for kids',
    'kids superhero costumes',
    'superhero dress',
    'superhero dress for boy',
    'superhero fancy dress',
    'superhero dress for kids',
    'superhero fancy dress competition',
    'Hulk fancy dress',
    'Captain America costume kids',
    'Avengers fancy dress',
  ],
  'garba-dress': [
    'garba costume',
    'garba dance costume',
    'garba costume for women',
    'garba dress for kids',
    'garba dress for boy',
    'garba dress for baby girl',
    'navratri fancy dress',
    'chaniya choli',
    'gujarati dance costume',
    'garba lehenga',
  ],
}

/**
 * Core terms every product in a category inherits, keyed by lowercased category
 * name. A product carries its own terms first and the core list after, so the
 * specific thing a shopper searched for always leads.
 */
const CATEGORY_CORE: Record<string, string[]> = {
  'ramleela costumes': RAMLEELA_CORE,
  'dandiya dress': GARBA_CORE,
  'garba dress': GARBA_CORE,
  'superhero costumes': SUPERHERO_CORE,
}

/**
 * Keywords for a product page. The product's own terms lead, then the core set
 * for its category. Returns undefined for products we have not curated that sit
 * outside a curated category, which leaves the site-wide list in place.
 */
export function productKeywords(
  slug: string,
  categoryName?: string | null
): string[] | undefined {
  const specific = PRODUCT_KEYWORDS[slug]
  const core = CATEGORY_CORE[categoryName?.trim().toLowerCase() ?? '']

  if (!specific) return core
  return core ? [...specific, ...core] : specific
}

/** Keywords for a category page, or undefined to keep the site-wide list. */
export function categoryKeywords(slug: string): string[] | undefined {
  return CATEGORY_KEYWORDS[slug]
}
