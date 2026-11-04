/**
 * Separate look-alike products that compete for the same search (4 Nov 2026).
 *
 * Semrush shows two or three of our URLs ranking for one keyword, each weaker
 * than one page would be: tree costume (#21 + #51), sunflower costume (#10 + #35),
 * mughal pagdi / turban / cap (#5 + #20 + #33), astronaut fancy dress (#11–13, two
 * products), kalbelia dress (#18–19, two products).
 *
 * The products are genuinely different stock, so nothing is merged. Instead one
 * page per keyword gets the head term at the start of its title, and the other
 * gets a title naming what actually differs (checked against the photos 4 Nov):
 *  - astronaut: the orange suit is the kids' one; the silver suit's photo is an
 *    adult (its title wrongly said "for Kids").
 *  - kalbelia: one is a women's dress, the other a girls' dress.
 *  - tree: one has a leafy hood and leaves on the top, the other a hooded top with
 *    leaf patches.
 *  - sunflower: one has a sunflower on the chest as well as the petal headpiece.
 *  - mughal pagdi: golden is the head-term page; green and red are named by colour.
 *
 * Dry run:  npx tsx scripts/followups/split-lookalike-products-2026-11.ts
 * Apply:    npx tsx scripts/followups/split-lookalike-products-2026-11.ts --apply
 */
import { run, updateProduct } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const P = (s: string) => `Buy {{price:${s}}} or rent {{rent:${s}}}`

const PAGES = [
  // astronaut
  {
    slug: 'astronaut-fancy-dress-orange',
    seo_title: 'Astronaut Fancy Dress for Kids – Orange Space Suit',
    meta_description: `Astronaut fancy dress for kids: orange zip-front space suit with hood and blue chest patches for space themes. ${P('astronaut-fancy-dress-orange')}, Delhi NCR.`,
  },
  {
    slug: 'astronaut-fancy-dress',
    seo_title: 'Silver Astronaut Costume – Space Suit with Helmet',
    meta_description: `Silver astronaut space suit with helmet and mission patches, for science fairs, space-theme parties and stage plays. ${P('astronaut-fancy-dress')} in Delhi NCR.`,
  },
  // kalbelia
  {
    slug: 'kalbelia-dress-costume-for-girls-fancy-dress',
    seo_title: 'Kalbelia Dress for Girls – Rajasthani Folk Dance',
    meta_description: `Kalbelia dress for girls: black snake-dance lehenga with colour bands, choli and veil. ${P('kalbelia-dress-costume-for-girls-fancy-dress')} in Delhi NCR.`,
  },
  {
    slug: 'kalbelia-dance-dress-costume-fancy-dress',
    seo_title: 'Kalbelia Dance Dress for Women – Mirror-Work Costume',
    meta_description: `Kalbelia dance dress for women: black full-flare mirror-work skirt, choli and veil for the stage. ${P('kalbelia-dance-dress-costume-fancy-dress')}, Delhi NCR.`,
  },
  // tree
  {
    slug: 'tree-fancy-dress-costume',
    seo_title: 'Tree Fancy Dress for Kids – Tree Costume with Leaves',
    meta_description: `Tree fancy dress for kids: leafy green top and hood, brown trunk trousers, for Earth Day. ${P('tree-fancy-dress-costume')}, Delhi NCR.`,
  },
  {
    slug: 'tree-fancy-dress',
    seo_title: 'Hooded Tree Costume – Leaf-Patch Top & Trunk Pants',
    meta_description: `Hooded tree costume: green hooded top with leaf patches and brown trunk trousers for nature plays. ${P('tree-fancy-dress')} in Delhi NCR.`,
  },
  // sunflower
  {
    slug: 'sun-flower-fancy-dress',
    seo_title: 'Sunflower Costume for Kids – Sunflower Fancy Dress',
    meta_description: `Sunflower costume for kids: green jumpsuit, chest sunflower and petal headpiece. ${P('sun-flower-fancy-dress')}, Delhi NCR.`,
  },
  {
    slug: 'sun-flower-fancy-dress-costume',
    seo_title: 'Sunflower Face-Frame Costume – Big Petal Headpiece',
    meta_description: `Green jumpsuit with a big sunflower petal headpiece framing the face, for flower-theme fancy dress. ${P('sun-flower-fancy-dress-costume')}, Delhi NCR.`,
  },
  // mughal pagdi
  {
    slug: 'golden-fancy-mughal-pagdi-turban-fancy-dress',
    seo_title: 'Mughal Pagdi – Golden Mughal Turban for Emperor Look',
    meta_description: `Mughal pagdi in golden fabric with zari bands, for Akbar, emperor and nawab costumes in history plays. ${P('golden-fancy-mughal-pagdi-turban-fancy-dress')} in Delhi NCR.`,
  },
  {
    slug: 'mughal-fancy-pagdi-green-fancy-dress',
    seo_title: 'Green Mughal Pagdi – Akbar & Nawab Turban',
    meta_description: `Green Mughal pagdi with jewelled brooch and pearl string for Akbar or nawab looks. ${P('mughal-fancy-pagdi-green-fancy-dress')}, Delhi NCR.`,
  },
  {
    slug: 'mughal-fancy-pagdi-mughal-pagdi-fancy-dress',
    seo_title: 'Red Mughal Pagdi – Royal Turban with Jewelled Brooch',
    meta_description: `Red Mughal pagdi with jewelled brooch and pearl string for a king or nawab look. ${P('mughal-fancy-pagdi-mughal-pagdi-fancy-dress')}, Delhi NCR.`,
  },
]

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  for (const p of PAGES) await updateProduct(cat, p)
  if (APPLY && pass === 2) await revalidateSite('catalog')
})
