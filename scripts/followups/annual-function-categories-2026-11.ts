/**
 * Annual-function and Republic Day categories (4 Nov 2026).
 *
 * Semrush keyword gap (4 Nov) has these head terms where a competitor ranks top 5
 * and we sit on page 2–4, usually through a single product rather than the
 * category:
 *   haryanvi dress 6,600 (#26) · folk dance costume / outfit 1,000×2 (#34–37)
 *   western dance costume / dance costumes western 1,300×2 (#14–16)
 *   rajasthani dance dress / rajasthan dance dress 1,300×2 (#14–18, a men's product ranks)
 *   freedom fighters fancy dress 2,900 · … ideas 2,400 · lady freedom fighters 2,900
 *   freedom fighter costume 1,900 · national leaders fancy dress ideas 1,900 (we don't rank)
 * Nov–Feb is annual-function season, then Republic Day (26 Jan).
 *
 * Fixes:
 *  - Titles lead with the searched phrase; metas carry the real rent/buy floor
 *    (checked against the live rows 4 Nov).
 *  - Descriptions name what is actually in each category. Old copy promised
 *    "over 50 styles" of western dance (there are 18) and an Ambedkar / full
 *    Bhagat Singh costume (we only have the cap).
 *  - The freedom-fighter category was missing its own best products: Subhash
 *    Bose, Bharat Mata, Mangal Pandey, Mother Teresa and the Shivaji pagdi were
 *    filed only under Independence/Republic Day. Attached here (additive).
 *    Its name becomes "Freedom Fighters & Leaders" (it is the H1).
 *
 * Dry run:  npx tsx scripts/followups/annual-function-categories-2026-11.ts
 * Apply:    npx tsx scripts/followups/annual-function-categories-2026-11.ts --apply
 */
import { run, updateCategory, attachProducts } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++

  await attachProducts(cat, 'leaders-freedom-fighters', [
    'subhash-chandra-bose-fancy-dress',
    'bharat-mata-fancy-dress-costume',
    'mangal-pandey-fancy-dress',
    'mother-teresa-fancy-dress-costume',
    'chatrapati-shivaji-maharaj-pagdi-fancy-dress',
  ])

  await updateCategory(cat, {
    slug: 'leaders-freedom-fighters',
    name: 'Freedom Fighters & Leaders',
    seo_title: 'Freedom Fighters Fancy Dress for Kids – Buy or Rent',
    meta_description:
      'Freedom fighters fancy dress for kids: Subhash Bose, Jhansi ki Rani, Bharat Mata, Gandhi, Nehru and Indira for Republic Day. Rent from ₹300 in Delhi NCR.',
    description:
      'Freedom fighters fancy dress for kids, for 26 January Republic Day, 15 August Independence Day, Children\'s Day and national-leader competitions. For boys there is [Subhash Chandra Bose](/products/subhash-chandra-bose-fancy-dress) in his olive INA uniform, [Mahatma Gandhi](/products/mahatma-gandhi-fancy-dress-costume) with dhoti, shawl and round glasses, [Jawaharlal Nehru](/products/jawahar-lal-nehru-fancy-dress) in a Nehru jacket with a red rose, [Mangal Pandey](/products/mangal-pandey-fancy-dress) in his red sepoy jacket and Bal Gangadhar Tilak. For girls, and for "lady freedom fighters" themes, there is [Jhansi ki Rani Laxmi Bai](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume) in red and gold, [Bharat Mata](/products/bharat-mata-fancy-dress-costume) in a tricolour-bordered saree with crown and flag, [Indira Gandhi](/products/indira-gandhi-fancy-dress-costume) and Mother Teresa. Caps and pagdis for Bhagat Singh, Mangal Pandey, Rani Laxmi Bai and Shivaji Maharaj complete a look on their own. Most costumes rent for ₹300–₹600 per event with a refundable deposit, or can be bought outright. Pick up from our Krishna Nagar shop in East Delhi or get delivery across Delhi NCR, and book early for January, when every school programme wants the same leaders.',
  })

  await updateCategory(cat, {
    slug: 'haryanvi-dress',
    seo_title: 'Haryanvi Dress for Girls & Boys – Buy or Rent in Delhi',
    meta_description:
      'Haryanvi dress for girls and boys: daaman, lehenga-choli and boys\' sets for school folk dance and Republic Day. Rent from ₹300 or buy from ₹750, Delhi NCR.',
    description:
      'Haryanvi dress for girls and boys, for school annual functions, Haryanvi folk dance items, Republic Day "states of India" programmes and inter-school competitions. For girls there is the traditional Daaman, the full flared Haryanvi skirt, along with Haryanvi lehenga-choli sets in red, yellow and multicolour and a lighter kids\' Haryanvi dance lehenga. For boys there is a Haryanvi boy costume, and a Haryanvi shirt and lehenga combination suits pair dances. Bright colours and a full skirt that swirls on stage make Haryana fancy dress one of the easiest folk looks to recognise from the back row. Rent from ₹300 per event with a refundable deposit, or buy from ₹750, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. Doing a group Haryanvi dance? Send us the number of girls and boys on WhatsApp and we will check sizes and colours together.',
  })

  await updateCategory(cat, {
    slug: 'folk-dance-dress',
    seo_title: 'Folk Dance Costume for Kids – Indian Folk Dance Dresses',
    meta_description:
      'Folk dance costumes for school annual functions: Bhangra, Bihu, Sambalpuri, Kajari, Bengali and Garba outfits for kids. Rent from ₹300 in Delhi NCR.',
    description:
      'Folk dance costumes for kids from across India, for school annual functions with a "unity in diversity" or states-of-India theme, Republic Day programmes and inter-school folk dance competitions. From Punjab there are Bhangra costumes for boys in blue-yellow and orange and Punjabi suits for girls; from Assam a Bihu dance costume for boys; from Odisha a Sambalpuri and Ghumra dance costume; from Uttar Pradesh a Kajari folk dance dress; from Bengal a Bengali folk costume for boys; and from Gujarat a Garba dance outfit. For classical items on the same stage there is Kathakali and an anarkali Kathak dress. Each folk dance outfit follows the colours and drape of its region so the judges and the audience can place it at a glance. Rent from ₹300 per event with a refundable deposit, or buy, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. More regional looks are in [Haryanvi dress](/category/haryanvi-dress), [Rajasthani dress](/category/rajasthani-dress) and [state fancy dress](/category/states-fancy-dress).',
  })

  await updateCategory(cat, {
    slug: 'western-dance-dress',
    seo_title: 'Western Dance Costume for Kids – Frocks, Sequins & Ballroom',
    meta_description:
      'Western dance costumes for school annual day: sequin skirt-tops, frocks, harem sets and ballroom outfits for kids. Rent from ₹200 or buy from ₹250.',
    description:
      'Western dance costumes for kids, for school annual day, group dances to film and pop songs and inter-school western dance competitions. For girls there are sequin skirt-and-top sets in green, orange, gold and red-and-blue, flared frocks in yellow, green and frill styles, and a Chinese fan dance dress. For boys there are ballroom dance costumes, a harem pant and T-shirt set for hip-hop items, and white-and-red and blue western sets that pair with the girls\' outfits. The fabrics are light and the fits secure, so they move well through a whole routine and look bright under stage lights. Because a class usually needs ten or more matching outfits, renting is the usual choice: rent from ₹200 per costume per event with a refundable deposit, or buy from ₹250, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. Send the number of children and sizes on WhatsApp for a group rate.',
  })

  await updateCategory(cat, {
    slug: 'rajasthani-dress',
    seo_title: 'Rajasthani Dance Dress for Kids – Ghoomar & Kalbelia',
    meta_description:
      'Rajasthani dance dress for girls and boys: ghoomar lehengas, Kalbelia dresses, angrakha-dhoti and pagdi sets. Rent from ₹300 or buy from ₹500 in Delhi NCR.',
    description:
      'Rajasthani dance dress for girls and boys, for Ghoomar and Kalbelia dance items, school annual functions, Republic Day "states of India" programmes and folk dance competitions. For girls there are flared Rajasthani lehengas in green and yellow for Ghoomar, two Kalbelia dance dresses with the full swirling skirt, and a Rajasthani folk dance set. For boys there is the [Rajasthani boy fancy dress](/products/rajasthani-boy-fancy-dress), angrakha and dhoti sets in white and yellow, and a traditional Rajasthani costume with pagdi; adults have a Rajasthani dance outfit for men. Bright colours and the pagdi make a Rajasthani costume one of the most photographed on any school stage. Rent from ₹300 per event with a refundable deposit, or buy from ₹500, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. For a group Ghoomar, send the number of dancers on WhatsApp and we will match colours.',
  })

  if (APPLY && pass === 2) await revalidateSite('catalog')
})
