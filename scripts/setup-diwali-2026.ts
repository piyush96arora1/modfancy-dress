/**
 * Diwali 2026 (Sun 8 Nov; school Diwali competitions run about 2–6 Nov).
 * Plan: docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md, Task 11.
 *
 *   Step 1  Repurpose the empty-but-indexed festival-costumes category
 *           (position 8.8, 365 impressions, 0 products = soft-404 risk) as the
 *           Diwali hub: rename, overwrite copy, and attach the live Ram / Sita /
 *           Hanuman costumes (the Ayodhya-return tableau), Ganesh (worshipped
 *           with Lakshmi on Diwali night) and the Ramleela crossovers
 *           (Ravan, Meghnath, Kumbhkaran) via product_categories only. Their
 *           existing categories are left alone.
 *
 *           Not attached: `vanvasi-ram` is live but also a redirects.json
 *           source (-> vanvasi-ram-fancy-dress), so its page is unreachable;
 *           the reachable twin is attached instead. There are no live goddess
 *           products (Saraswati is soft-deleted; Lakshmi, diya and cracker
 *           costumes are owner stock still to upload, Task 19 D1), so the copy
 *           names them as ideas with "WhatsApp to check", not as stock.
 *   Step 2  New post /blog/diwali-fancy-dress-competition-ideas.
 *
 * Dry run:  npx tsx scripts/setup-diwali-2026.ts
 * Apply:    npx tsx scripts/setup-diwali-2026.ts --apply
 */
import { attachProducts, run, updateCategory, upsertPost } from './lib/festival-content'

const FESTIVAL_PRODUCTS = [
  // Ram's return to Ayodhya
  'raja-ram-fancy-dress',
  'vanvasi-ram-fancy-dress',
  'rani-sita-fancy-dress-costume-for-ramleela',
  'vanvasi-sita-saree-dress',
  'hanuman-ji-fancy-dress',
  'hanuman-ji-fancy-dress-for-ramleela',
  'hanuman-red-fancy-dress',
  'hanuman-yellow-fancy-dress',
  // Lakshmi-Ganesh puja
  'ganesh-fancy-dress',
  // Dussehra / Ramleela crossovers
  'ravan-fancy-dress',
  'meghnath-fancy-dress',
  'kumbhkaran-fancy-dress',
]

const FESTIVAL_DESCRIPTION =
  "Festival costumes for Diwali, Dussehra and the school celebrations around them. Diwali falls on Sunday 8 November 2026, and most schools hold their Diwali fancy dress competitions in the week before, from 2 to 6 November. The classic Diwali theme is Ram's return to Ayodhya, so this collection brings together our Ram, Sita and Hanuman costumes: the crowned Raja Ram in red and gold brocade, the saffron Vanvasi Ram, Rani Sita and Vanvasi Sita, and four Hanuman costumes from a light cotton set to heavy velvet. Ganesh, worshipped with Lakshmi on Diwali night, is here too, and Ravan, Meghnath and Kumbhkaran cover the Dussehra and Ramleela side of the season. Lakshmi Mata, diya and eco-friendly \"say no to crackers\" costumes are the other Diwali favourites; WhatsApp us to check what is in store and in which sizes. Every costume can be bought, or rented for one event with a refundable deposit, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR by Porter or Rapido. Diwali ki fancy dress? Rent pe lijiye."

const POST_CONTENT = `Diwali falls on Sunday 8 November in 2026, and most schools hold their Diwali fancy dress competitions in the last school week before the break, roughly Monday 2 to Friday 6 November. Here are the Diwali fancy dress competition ideas that work best on a school stage, grouped by theme and by age, with a short line for each that your child can say to the judges.

## Ram, Sita and Hanuman: the return to Ayodhya

Diwali celebrates Ram coming home to Ayodhya after fourteen years in exile, with the city lighting diyas to welcome him. It is the most popular Diwali theme in school competitions, and it works for a single child or a group of three or four.

- **Ram:** the [Raja Ram dress](/products/raja-ram-fancy-dress) is the crowned king in red and gold brocade, which is exactly the Ayodhya homecoming look. It rents for {{rent:raja-ram-fancy-dress}}. The [Vanvasi Ram set](/products/vanvasi-ram-fancy-dress) in saffron shows Ram during the exile, and suits a "journey home" act.
- **Sita:** [Rani Sita](/products/rani-sita-fancy-dress-costume-for-ramleela) for the queen, or the [Vanvasi Sita saree](/products/vanvasi-sita-saree-dress) (size {{size:vanvasi-sita-saree-dress}}) for the forest years.
- **Hanuman:** the simplest is the [red Hanuman ji fancy dress](/products/hanuman-ji-fancy-dress), light enough for small children, at {{rent:hanuman-ji-fancy-dress}} rent. For a lead role, the [velvet red Hanuman](/products/hanuman-red-fancy-dress) or the [yellow Hanuman](/products/hanuman-yellow-fancy-dress) stand out more under hall lights.
- **Laxman:** for a brother act, a second saffron vanvasi-style set works. WhatsApp us and we will suggest the closest match in your child's size.

What to say on stage: "I am Shri Ram. After fourteen years in the forest, I have come home to Ayodhya, and the whole city has lit diyas to welcome me. That is why we celebrate Diwali."

## Goddess Lakshmi

Lakshmi Mata is the goddess worshipped on Diwali night, so it is the most searched Diwali fancy dress for girls. The look is a red or pink saree with a gold border, a gold crown, a lotus in one hand and a few gold coins in the other. You can build it from one of our [kids' sarees](/category/kids-saree), such as the [pink saree](/products/pink-saree-fancy-dress) or the [white saree with red border](/products/white-saree-red-border-fancy-dress), and add a paper lotus and chocolate coins. For a ready-made Lakshmi Mata costume, WhatsApp us to check what is in store.

What to say on stage: "I am Goddess Lakshmi. On Diwali night every home is cleaned and lit with diyas to welcome me. I bring wealth, health and happiness to all."

## Lord Ganesh

Lakshmi and Ganesh are worshipped together at Diwali puja, so Ganesh is a good choice for boys who want a mythology costume that is not Ram. Our [Ganesh fancy dress](/products/ganesh-fancy-dress) comes as a complete set with the kurta, dhoti, Ganpati head mask and axe prop, so there is nothing extra to buy.

What to say on stage: "I am Lord Ganesh. We pray to me first in every puja, and on Diwali we pray to me with Maa Lakshmi."

## Eco-friendly Diwali fancy dress ideas

Many schools now ask for an eco-friendly Diwali theme, and a green message often scores well with judges. A few ideas that are easy to put together:

- **Diya costume:** an orange or yellow outfit with a cardboard flame headband. "I am a diya. I give light without smoke. Light me, not crackers."
- **Say no to crackers:** a plain outfit with a hand-made placard, or a cracker costume crossed out. "Crackers make noise and smoke. Let's celebrate with lights and sweets instead."
- **Tree:** our [tree fancy dress](/products/tree-fancy-dress) carries a clean-air message. "I am a tree. I give you fresh air. Please don't fill it with smoke this Diwali."
- **Earth or cloud:** the [Earth fancy dress](/products/earth-fancy-dress) or the [cloud costume](/products/cloud-fancy-dress) for a "save our planet" line.
- **Rangoli girl:** a bright [kids' saree](/products/kids-saree-fancy-dress-costume) with a rangoli-print dupatta and a small plate of colours.

For more nature and message costumes, see the [nature costumes](/category/nature-costumes) page.

## Ideas by age

- **Ages 3 to 5:** diya, tree, cloud or a light Hanuman. Choose something the child can wear comfortably for an hour, and keep the line to one sentence.
- **Ages 5 to 8:** Ram, Sita, Lakshmi or Ganesh with a two-line intro. This is the age where a clear character and a confident line win.
- **Ages 8 to 12:** the full Ayodhya tableau as a group act, or an eco-friendly theme with a short speech. Older children can carry a longer message and a heavier costume.

## Sizing tips

Measure your child's chest and height and check them against the costume before the day. For dhotis and sarees, check the length at the ankle, because a hem that is too long is the most common reason children trip on stage. Masks and crowns should sit firmly without pressing on the forehead. If you can, visit our shop and try two sizes.

## Rent or buy, and when to book

Rent if the costume is for one event. Every costume in our shop can be rented, usually for one to two days, with a refundable deposit that comes back in full when you return it. The deposit is ₹500 for costumes up to ₹200 rent, ₹1,000 for ₹201 to ₹500 rent, and ₹2,000 above that. Buy if the costume will be worn again, for example a Ram or Hanuman that will also be used for Dussehra and Ramleela.

October and November are among our busiest months, with Navratri, Dussehra, Halloween and Diwali close together. Book at least one week ahead, and two weeks for the Ram and Sita costumes. You can pick up from our Krishna Nagar shop in East Delhi, or we can send the costume by Porter or Rapido anywhere in Delhi NCR. Teachers dressing a whole class can ask for group rates on ten or more costumes. See all Diwali costumes on our [festival costumes](/category/festival-costumes) page, the wider [Indian mythology costumes](/category/indian-mythology-costumes) range, or read how renting works on the [rent page](/rent).

Diwali ki fancy dress chahiye? WhatsApp karke size check kar lijiye.`

run(async (cat) => {
  await updateCategory(cat, {
    slug: 'festival-costumes',
    name: 'Festival Costumes: Diwali, Dussehra & More',
    seo_title: 'Diwali Fancy Dress for Kids – Lakshmi, Ram-Sita & Diya',
    meta_description:
      'Diwali fancy dress ideas for school competitions: Lakshmi Mata, Ram-Sita, diya and eco-friendly costumes. Buy or rent in Delhi NCR before 8 November 2026.',
    description: FESTIVAL_DESCRIPTION,
  })
  await attachProducts(cat, 'festival-costumes', FESTIVAL_PRODUCTS)

  await upsertPost(cat, {
    slug: 'diwali-fancy-dress-competition-ideas',
    title: 'Diwali Fancy Dress Competition Ideas for Kids and School',
    excerpt:
      'Diwali fancy dress competition ideas by age: Ram-Sita, Hanuman, Lakshmi, Ganesh and eco-friendly diya costumes, with lines to say on stage.',
    content: POST_CONTENT,
  })
})
