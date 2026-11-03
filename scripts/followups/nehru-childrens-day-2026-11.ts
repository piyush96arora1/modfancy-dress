/**
 * Jawaharlal Nehru costume: win the clicks we already rank for (3 Nov 2026).
 *
 * Search Console, last 3 months: "jawaharlal nehru dress" 7,013 impressions at
 * position 1.1 but 0.31% CTR; "jawaharlal nehru costume" 1,759 / 0.23% at 1.2;
 * the "for kids" variants (3,132 + 1,871 + 1,112 impressions) sit at 7–10.
 * The old title ("Chacha Nehru Costume for Kids") never used the phrase people
 * type, and the meta had no price. Children's Day is 14 Nov (schools: Fri 13).
 *
 * Title now leads with "Jawaharlal Nehru Dress for Kids", the meta carries the
 * "Buy ₹X or rent ₹Y" phrase (kept in sync by fix-meta-prices.ts), and the main
 * photo's alt text uses the same words. The body said "white achkan with churidar";
 * the costume (and photo) is a navy Nehru jacket over a white kurta-pyjama, so
 * that sentence is corrected (owner confirmed 3 Nov).
 *
 * Dry run:  npx tsx scripts/followups/nehru-childrens-day-2026-11.ts
 * Apply:    npx tsx scripts/followups/nehru-childrens-day-2026-11.ts --apply
 */
import { run, sb, updateProduct } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const SLUG = 'jawahar-lal-nehru-fancy-dress'
const ALT = 'Jawaharlal Nehru dress for kids: Chacha Nehru costume with navy Nehru jacket, white kurta-pyjama, white cap and red rose'
const DESC = `A Chacha Nehru costume for Children's Day, the look every school asks for on 14 November. In 2026 the 14th falls on a Saturday, so most schools hold their Bal Diwas programme on Friday 13 November. The set is a navy Nehru jacket over a white kurta-pyjama with a white cap, finished with Nehru's signature red rose on the jacket. Pandit Jawaharlal Nehru, India's first Prime Minister, was so fond of children that his birthday became Children's Day, which is why a Jawaharlal Nehru fancy dress is the most recognised costume on the day.

The same costume works for 15 August Independence Day, 26 January Republic Day and freedom-fighter fancy dress competitions, so it earns its keep through the school year. Current size: {{size:${SLUG}}}. Rent it for {{rent:${SLUG}}} with a refundable deposit of {{deposit:${SLUG}}}, or buy it for {{price:${SLUG}}}, at our Krishna Nagar shop in East Delhi. WhatsApp us to check the size and book before the November rush.

Bal Diwas par Chacha Nehru banna hai? Rent pe lijiye.`
const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  await updateProduct(cat, {
    slug: SLUG,
    seo_title: 'Jawaharlal Nehru Dress for Kids – Buy or Rent in Delhi',
    description: DESC,
    meta_description: `Chacha Nehru dress for kids {{size:${SLUG}}}: navy Nehru jacket, white kurta-pyjama, cap and red rose. Buy {{price:${SLUG}}} or rent {{rent:${SLUG}}} in Delhi NCR for Children's Day.`,
  })

  const p = cat.products.get(SLUG)!
  const { data: imgs, error } = await sb.from('product_images').select('id, alt_text, is_primary').eq('product_id', p.id)
  if (error) throw new Error(error.message)
  const primary = (imgs ?? []).find((i) => i.is_primary) ?? imgs?.[0]
  if (!primary) throw new Error(`${SLUG}: no image`)
  console.log(`   alt: "${primary.alt_text}" → "${ALT}"`)
  if (APPLY && pass === 2) {
    const { error: e } = await sb.from('product_images').update({ alt_text: ALT }).eq('id', primary.id)
    console.log(e ? `   ❌ ${e.message}` : '   ✅ alt written')
    await revalidateSite('catalog')
  }
})
