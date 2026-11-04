/**
 * Republic Day and Independence Day category pages (4 Nov 2026).
 *
 * Schools start rehearsing for 26 January in mid-December, so these two pages
 * need to rank by then. Semrush India (4 Nov), monthly volume:
 *   independence day dress 2,400 · tri colour dress 1,600 · independence day
 *   dress for women 1,300 · independence day costume for girl 1,000 ·
 *   independence day dress for girl india 880 · republic day dress 590 ·
 *   republic day dress for baby girl 590 · tiranga dress 590 · tricolor dress
 *   480 · patriotic dance dress 480 · republic day dress for girl 320 ·
 *   15 august fancy dress 260 · 26 january dress 260 · republic day dress for
 *   baby boy 260 · republic day fancy dress ideas 260 · tiranga dress for girl
 *   260 · fancy dress competition for independence day 210 (we are #13) ·
 *   15 august fancy dress competition 140 (#1).
 *
 * Split so the two pages stop competing for the same phrases:
 *   - republic-day-dress    → republic day / 26 january / tiranga / tricolour
 *                             dress for girls and boys, patriotic dance dress.
 *                             Name (the H1) becomes "Republic Day & Tiranga Dress".
 *   - independence-day-dress → independence day / 15 august dress & costume and
 *                             the fancy dress competition, led by the army /
 *                             Kargil theme.
 *   Leaders are only named briefly and linked to leaders-freedom-fighters,
 *   which now owns that role.
 *
 * Not targeted: "for women" and "for baby" phrases. There are no adult or baby
 * sizes in either category, so the copy does not claim them.
 *
 * Copy checked against the primary photos (4 Nov). Old copy said "Bharat Mata
 * in a tiranga-themed white saree" (fine) but also listed Bhagat Singh, whose
 * full costume is soft-deleted (only the hat is live).
 *
 * Attachments (additive): republic-day-dress was missing its own best match,
 * the tiranga costume, plus both army uniforms, Subhash Chandra Bose and the
 * full Mangal Pandey dress, all of which sat only under Independence Day.
 *
 * The meta's "rent from / buy from" figures are checked against the live floor
 * of each category (current rows plus the ones attached here); a price change
 * that moves the floor fails the run.
 *
 * Dry run:  npx tsx scripts/followups/patriotic-categories-2026-11.ts
 * Apply:    npx tsx scripts/followups/patriotic-categories-2026-11.ts --apply
 */
import { run, updateCategory, attachProducts, assertLinks, sb, type Catalog } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
let pass = 0

const RD_ATTACH = [
  'tiranga-color-costume-for-boys-girls-fancy-dress',
  'army-fancy-dress-costume-kargil-print',
  'kargil-fancy-dress',
  'subhash-chandra-bose-fancy-dress',
  'mangal-pandey-fancy-dress',
]

/** Throws unless the meta's "rent from ₹X" and "buy from ₹Y" equal the live floors. */
async function assertFloors(cat: Catalog, categorySlug: string, extra: string[], meta: string) {
  const c = cat.categories.get(categorySlug)
  if (!c) throw new Error(`${categorySlug}: not an active category`)
  const { data: j } = await sb.from('product_categories').select('product_id').eq('category_id', c.id)
  const { data: prim } = await sb.from('products').select('id').eq('category_id', c.id)
  const ids = new Set([...(j ?? []), ...(prim ?? [])].map((r) => ('product_id' in r ? r.product_id : r.id) as string))
  for (const s of extra) {
    const p = cat.products.get(s)
    if (p) ids.add(p.id)
  }
  const rows = [...cat.products.values()].filter((p) => ids.has(p.id))
  const floor = (xs: (number | null)[]) => Math.min(...xs.map(Number).filter((n) => n > 0))
  const rent = floor(rows.map((p) => p.rent_price))
  const buy = floor(rows.map((p) => p.price))
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
  console.log(`\n--- floors ${categorySlug}: ${rows.length} live products, rent ${fmt(rent)}, buy ${fmt(buy)}`)
  const wantRent = new RegExp(`rent from ${fmt(rent)}\\b`, 'i')
  const wantBuy = new RegExp(`buy from ${fmt(buy)}\\b`, 'i')
  if (!wantRent.test(meta) || !wantBuy.test(meta))
    throw new Error(`${categorySlug}: meta must say "rent from ${fmt(rent)}" and "buy from ${fmt(buy)}"`)
}

const RD = {
  slug: 'republic-day-dress',
  name: 'Republic Day & Tiranga Dress',
  seo_title: 'Republic Day Dress for Girls & Boys – Tiranga Dress',
  meta_description:
    'Republic Day dress for girls and boys: tiranga dress, Bharat Mata, army and air force uniforms for 26 January. Rent from ₹300 or buy from ₹400, Delhi NCR.',
  description:
    'Republic Day dress for girls and boys, for 26 January school programmes, parade-day assemblies, patriotic dance items and fancy dress competitions. The look most schools ask for is the [tiranga dress](/products/tiranga-color-costume-for-boys-girls-fancy-dress) in saffron, white and green, made for both girls and boys: in the photo the girl wears a white lace anarkali with a saffron dupatta and green churidar, and the boy a white kurta with a saffron jacket, green satin pants and a tricolour pagdi, so a class can do a tricolour group dance in matching sets. For a girl who wants one costume that says India on its own, [Bharat Mata](/products/bharat-mata-fancy-dress-costume) comes in a white saree with a saffron-and-green border, a gold crown and a hand-held flag. For boys who want to march, there is an [army dress](/products/army-fancy-dress-costume-kargil-print) in a brown-and-beige camouflage print, a green camouflage Kargil uniform with cap and belt, a grey [Indian Air Force costume](/products/indian-air-force-fancy-dress-costume) with side cap, and a [traffic police dress](/products/traffic-police-fancy-dress-costume) with whistle. Girls can also go as Jhansi ki Rani, Indira Gandhi or Mother Teresa; every national leader we stock is in [freedom fighters & leaders](/category/leaders-freedom-fighters), and our [Republic Day fancy dress ideas](/blog/republic-day-fancy-dress-ideas-kids) pair each costume with a line to say on stage. Rent from ₹300 per event with a refundable deposit, or buy from ₹400, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. Rehearsals start in mid-December, so book tricolour sets for a group early.',
}

const ID = {
  slug: 'independence-day-dress',
  seo_title: 'Independence Day Dress & 15 August Fancy Dress for Kids',
  meta_description:
    'Independence Day dress for kids for 15 August: Kargil army uniforms, air force, Bharat Mata, tricolour and freedom fighters. Rent from ₹300, buy from ₹550.',
  description:
    'Independence Day dress for kids, for 15 August flag-hoisting assemblies, school programmes and the Independence Day fancy dress competition. A salute to the soldiers who guard the country is the theme judges see most on 15 August, and we have two army uniforms for it: the green camouflage [Kargil dress](/products/kargil-fancy-dress) with cap and belt, and an army dress in a brown-and-beige camouflage print. Alongside them are a grey Indian Air Force uniform with side cap and a khaki [police dress](/products/police-fancy-dress) with peaked cap. For girls, [Bharat Mata](/products/bharat-mata-fancy-dress-costume) in a white saree with a tricolour border, gold crown and flag is the best-known Independence Day costume, and [Jhansi ki Rani](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume) in red and gold, shown with sword and shield, suits a girl who wants a fighting role. The freedom struggle itself is covered by [Subhash Chandra Bose](/products/subhash-chandra-bose-fancy-dress) in an olive uniform and side cap, Mangal Pandey in a red sepoy jacket with gold braid, Mahatma Gandhi, Nehru, Tilak and Indira Gandhi; the full list is in [freedom fighters & leaders](/category/leaders-freedom-fighters). For a simple saffron, white and green look there is a tricolour costume for boys and girls. Our [15 August fancy dress ideas](/blog/independence-day-fancy-dress-ideas) give a line to say for each. Rent from ₹300 per event with a refundable deposit, or buy from ₹550, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR.',
}

run(async (cat) => {
  pass++

  await attachProducts(cat, 'republic-day-dress', RD_ATTACH)

  await assertFloors(cat, RD.slug, RD_ATTACH, RD.meta_description)
  console.log('   links', assertLinks(cat, RD.description))
  await updateCategory(cat, RD)

  await assertFloors(cat, ID.slug, [], ID.meta_description)
  console.log('   links', assertLinks(cat, ID.description))
  await updateCategory(cat, ID)

  if (APPLY && pass === 2) await revalidateSite('catalog')
})
