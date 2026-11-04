/**
 * Leader costume pages: catch the November–January leader season (4 Nov 2026).
 *
 * Semrush (4 Nov): competitors' leader pages are rising this month
 * (bookmycostume Jhansi +2.5K visits, Subhash Bose +796, Indira +112, Gandhi +89)
 * while ours sit at 16–23:
 *   subhash chandra bose dress 4,400 (#16) · bharat mata dress/costume 1,900 + 1,300×3 (#16–19)
 *   indira gandhi costume/dress 880 + 720 (#17–20) · jhansi ki rani / laxmi bai 1,300 + 1,000 (#16–23)
 *   mangal pandey fancy dress 880 (#18).
 * The Nehru fix (3 Nov) took that page from 82 to 311 est. visits/mo, so the same
 * recipe: title leads with the searched phrase + "for Kids/Girls", meta carries
 * "Buy ₹X or rent ₹Y" (synced by fix-meta-prices.ts), primary-image alt uses
 * the same words, and the description says what is in the photo and which school
 * days it suits.
 *
 * Every description was written against the product photo (checked 4 Nov):
 * Indira's old copy said "saree with a shawl" but the photo is a white saree with
 * a red border; Jhansi and Gandhi had generic template copy. Props seen in a photo
 * but not confirmed as included (sword, shield, lathi) are described as "shown
 * with", not as part of the set.
 *
 * Dry run:  npx tsx scripts/followups/leader-pages-2026-11.ts
 * Apply:    npx tsx scripts/followups/leader-pages-2026-11.ts --apply
 */
import { run, sb, updateProduct } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

type Page = { slug: string; seo_title: string; meta: string; alt: string; description: string }

const PAGES: Page[] = [
  {
    slug: 'subhash-chandra-bose-fancy-dress',
    seo_title: 'Subhash Chandra Bose Dress for Kids – Netaji Costume',
    meta: 'Subhash Chandra Bose dress for kids: olive INA uniform with jacket, trousers and side cap. Buy {{price:subhash-chandra-bose-fancy-dress}} or rent {{rent:subhash-chandra-bose-fancy-dress}} in Delhi NCR for Republic Day.',
    alt: 'Subhash Chandra Bose dress for kids: Netaji costume with olive green INA uniform jacket, trousers and side cap',
    description: `A Subhash Chandra Bose dress for kids in the olive green of the Azad Hind Fauj (INA): a uniform jacket with four pockets, shoulder straps and a tricolour badge, matching trousers and the side cap Netaji wore. Add black shoes and round glasses and your child is ready to say "Tum mujhe khoon do, main tumhe azadi dunga" on stage.

Netaji is one of the most asked-for costumes for 23 January (Netaji Jayanti, celebrated as Parakram Diwas), 26 January Republic Day and 15 August Independence Day, and for freedom-fighter fancy dress competitions through the year. Rent it for {{rent:subhash-chandra-bose-fancy-dress}} with a refundable deposit of {{deposit:subhash-chandra-bose-fancy-dress}}, or buy it for {{price:subhash-chandra-bose-fancy-dress}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. Book early for January, when school programmes keep this costume busy.`,
  },
  {
    slug: 'bharat-mata-fancy-dress-costume',
    seo_title: 'Bharat Mata Dress for Girls – Costume with Crown & Flag',
    meta: 'Bharat Mata dress for girls: white saree with a tricolour border, gold crown and Indian flag. Buy {{price:bharat-mata-fancy-dress-costume}} or rent {{rent:bharat-mata-fancy-dress-costume}} in Delhi NCR for Republic Day.',
    alt: 'Bharat Mata dress for girls: white saree with saffron and green tricolour border, gold crown and Indian flag',
    description: `A Bharat Mata (Mother India) dress for girls: a white saree edged with a saffron-and-green tricolour border, a gold crown and a hand-held Indian flag, finished with a bead necklace. It is the most recognised patriotic costume on stage, and it pairs well with a short poem or a single line such as "Main Bharat Mata hoon".

Choose it for 26 January Republic Day, 15 August Independence Day, desh bhakti dance items and freedom-fighter fancy dress competitions. Rent it for {{rent:bharat-mata-fancy-dress-costume}} with a refundable deposit of {{deposit:bharat-mata-fancy-dress-costume}}, or buy it for {{price:bharat-mata-fancy-dress-costume}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. For a Republic Day group item, WhatsApp us the number of girls and we will check stock.`,
  },
  {
    slug: 'indira-gandhi-fancy-dress-costume',
    seo_title: 'Indira Gandhi Costume for Girls – White & Red Saree',
    meta: 'Indira Gandhi costume for fancy dress competition: white saree with red border, matching blouse and grey-streak hair. Buy {{price:indira-gandhi-fancy-dress-costume}} or rent {{rent:indira-gandhi-fancy-dress-costume}} in Delhi NCR.',
    alt: 'Indira Gandhi costume for girls: white saree with red border, white blouse with red trim and grey-streak hairstyle',
    description: `An Indira Gandhi costume for girls: a white saree with a red border, a white blouse trimmed in red, and the grey streak through the hair that made India's first woman Prime Minister instantly recognisable. Add a simple bun and flat shoes and the look is complete.

It suits 19 November (Indira Gandhi's birth anniversary), Children's Day, 26 January Republic Day, 15 August Independence Day and "great women of India" or national-leader fancy dress competitions. A two-line speech about courage and leadership goes well with it. Rent it for {{rent:indira-gandhi-fancy-dress-costume}} with a refundable deposit of {{deposit:indira-gandhi-fancy-dress-costume}}, or buy it for {{price:indira-gandhi-fancy-dress-costume}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR.`,
  },
  {
    slug: 'jhansi-ki-rani-laxmi-bai-fancy-dress-costume',
    seo_title: 'Jhansi Ki Rani Dress for Girls – Rani Laxmi Bai Costume',
    meta: 'Jhansi ki Rani dress for girls: red and gold warrior outfit with dhoti-style drape, sash and red pagdi. Buy {{price:jhansi-ki-rani-laxmi-bai-fancy-dress-costume}} or rent {{rent:jhansi-ki-rani-laxmi-bai-fancy-dress-costume}} in Delhi NCR.',
    alt: 'Jhansi ki Rani dress for girls: Rani Laxmi Bai costume in red and gold with dhoti-style drape, waist sash and red pagdi',
    description: `A Jhansi ki Rani dress for girls: a red and gold Rani Laxmi Bai warrior outfit with a dhoti-style drape, a gold-trimmed blouse, a wide gold waist sash and a red pagdi. In the photo it is shown with a sword and shield, which make the "Khoob ladi mardani" pose; WhatsApp us to add them.

Rani Laxmi Bai is the top girls' choice for freedom-fighter fancy dress, 19 November (her birth anniversary), 26 January Republic Day, 15 August Independence Day and history dramas. Rent it for {{rent:jhansi-ki-rani-laxmi-bai-fancy-dress-costume}} with a refundable deposit of {{deposit:jhansi-ki-rani-laxmi-bai-fancy-dress-costume}}, or buy it for {{price:jhansi-ki-rani-laxmi-bai-fancy-dress-costume}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. The matching Rani Laxmi Bai pagdi is also sold on its own.`,
  },
  {
    slug: 'mangal-pandey-fancy-dress',
    seo_title: 'Mangal Pandey Dress for Kids – 1857 Sepoy Costume',
    meta: 'Mangal Pandey fancy dress for kids: red sepoy jacket with gold braid, black trousers and tall red-and-black cap. Buy {{price:mangal-pandey-fancy-dress}} or rent {{rent:mangal-pandey-fancy-dress}} in Delhi NCR.',
    alt: 'Mangal Pandey dress for kids: 1857 sepoy costume with red jacket and gold braid, black trousers and tall red-and-black cap',
    description: `A Mangal Pandey dress for kids in 1857 sepoy style: a red jacket with rows of gold braid and black cuffs and collar, black trousers and a tall red-and-black cap. In the photo it is shown with a sword; WhatsApp us to add one.

Mangal Pandey, whose stand at Barrackpore began the revolt of 1857, makes a strong freedom-fighter costume for 26 January Republic Day, 15 August Independence Day, history skits and "first war of independence" fancy dress competitions. Rent it for {{rent:mangal-pandey-fancy-dress}} with a refundable deposit of {{deposit:mangal-pandey-fancy-dress}}, or buy it for {{price:mangal-pandey-fancy-dress}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. The red Mangal Pandey cap is also sold on its own.`,
  },
  {
    slug: 'mahatma-gandhi-fancy-dress-costume',
    seo_title: 'Mahatma Gandhi Dress for Kids – Gandhi Ji Costume',
    meta: 'Mahatma Gandhi dress for kids: white dhoti, shawl, bald cap and round glasses. Buy {{price:mahatma-gandhi-fancy-dress-costume}} or rent {{rent:mahatma-gandhi-fancy-dress-costume}} in Delhi NCR for Republic Day and Gandhi Jayanti.',
    alt: 'Mahatma Gandhi dress for kids: Gandhi ji costume with white dhoti, shawl, bald cap and round glasses',
    description: `A Mahatma Gandhi dress for kids with everything for the Bapu look: a white dhoti, a white shawl, a skin-tone bald cap and round glasses. In the photo it is shown with a wooden lathi; any long stick works, or WhatsApp us to add one.

Gandhi ji is a favourite for 2 October Gandhi Jayanti, 30 January Martyrs' Day, 26 January Republic Day, 15 August Independence Day and freedom-fighter fancy dress competitions, and it is easy for even the youngest children to wear. Pair it with a line such as "Ahimsa parmo dharma". Rent it for {{rent:mahatma-gandhi-fancy-dress-costume}} with a refundable deposit of {{deposit:mahatma-gandhi-fancy-dress-costume}}, or buy it for {{price:mahatma-gandhi-fancy-dress-costume}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR.`,
  },
]

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  for (const p of PAGES) {
    await updateProduct(cat, {
      slug: p.slug,
      seo_title: p.seo_title,
      description: p.description,
      meta_description: p.meta,
    })
  }

  for (const p of PAGES) {
    const live = cat.products.get(p.slug)!
    const { data: imgs, error } = await sb.from('product_images').select('id, alt_text, is_primary').eq('product_id', live.id)
    if (error) throw new Error(error.message)
    const primary = (imgs ?? []).find((i) => i.is_primary) ?? imgs?.[0]
    if (!primary) throw new Error(`${p.slug}: no image`)
    if (pass === 1) console.log(`   ${p.slug} alt: "${primary.alt_text}" → "${p.alt}"`)
    if (APPLY && pass === 2) {
      const { error: e } = await sb.from('product_images').update({ alt_text: p.alt }).eq('id', primary.id)
      console.log(e ? `   ❌ ${p.slug}: ${e.message}` : `   ✅ ${p.slug} alt written`)
    }
  }
  if (APPLY && pass === 2) await revalidateSite('catalog')
})
