/**
 * Children's Day 2026 (Sat 14 Nov; most schools celebrate Fri 13 Nov).
 * Plan: docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md, Task 12.
 *
 *   Step 1  Retarget jawahar-lal-nehru-fancy-dress from "15 August" to
 *           Children's Day (overwrite title, meta and body; slug unchanged).
 *           The body keeps Independence Day / Republic Day as secondary uses.
 *   Step 3  Refresh helper-costumes for "community helpers fancy dress" and
 *           "children's day fancy dress", and attach the live profession
 *           costumes that were sitting outside it (police, air force,
 *           astronaut). Copy lists only what is live today; pilot, doctor,
 *           nurse, farmer and postman arrive with the owner's upload (Task 19 S3).
 *   Step 4  New post /blog/childrens-day-fancy-dress-ideas.
 *   Step 5  CTR pass on laptop-fancy-dress-costumes: rent price in the title.
 *           Doraemon is left to the Task 5 differentiation.
 *
 * Every price in the copy is a {{rent|price|deposit:slug}} placeholder filled
 * from the DB at run time. Shop facts (deposit, pickup, booking lead time,
 * group rates, delivery) are the ones on /rent and /faq (lib/seo/rental-faq-data.ts).
 *
 * Dry run:  npx tsx scripts/setup-childrens-day-2026.ts
 * Apply:    npx tsx scripts/setup-childrens-day-2026.ts --apply
 */
import { attachProducts, run, updateCategory, updateProduct, upsertPost } from './lib/festival-content'

const NEHRU = 'jawahar-lal-nehru-fancy-dress'
const LAPTOP = 'laptop-fancy-dress-costumes'

const NEHRU_DESCRIPTION = `A Chacha Nehru costume for Children's Day, the look every school asks for on 14 November. In 2026 the 14th falls on a Saturday, so most schools hold their Bal Diwas programme on Friday 13 November. The set is a white achkan (long coat) with churidar and a white cap, finished with Nehru's signature red rose on the chest. Pandit Jawaharlal Nehru, India's first Prime Minister, was so fond of children that his birthday became Children's Day, which is why a Jawaharlal Nehru fancy dress is the most recognised costume on the day.

The same costume works for 15 August Independence Day, 26 January Republic Day and freedom-fighter fancy dress competitions, so it earns its keep through the school year. Current size: {{size:${NEHRU}}}. Rent it for {{rent:${NEHRU}}} with a refundable deposit of {{deposit:${NEHRU}}}, or buy it for {{price:${NEHRU}}}, at our Krishna Nagar shop in East Delhi. WhatsApp us to check the size and book before the November rush.

Bal Diwas par Chacha Nehru banna hai? Rent pe lijiye.`

const HELPER_DESCRIPTION =
  "Community helpers fancy dress for kids, ready for Children's Day on 14 November, school career days and \"people who help us\" themes. This collection covers the helpers teachers ask for most: an air hostess dress, a chef costume, a fire fighter costume, a fisherman outfit, a traffic police uniform, a police costume with an officer cap, an army costume in Kargil print, an Indian Air Force uniform and an astronaut suit. Each one is a costume a judge recognises from the back row, and each is easy for a child to explain in two lines on stage, such as \"I am a fire fighter, I keep you safe from fire.\" Every costume here can be bought, or rented for one event with a refundable deposit, and schools that need ten or more pieces for a class act can ask for group rates. Try sizes at our Krishna Nagar shop in East Delhi, or WhatsApp us the profession and your child's age to check what fits. Children's Day fancy dress ki taiyari? Rent pe lijiye."

const POST_CONTENT = `Children's Day falls on Saturday 14 November in 2026, so most schools will hold their Bal Diwas celebrations and fancy dress competitions on Friday 13 November. That leaves parents about two weeks after Diwali to sort out a costume. These are the Children's Day fancy dress ideas we suggest most often at our Krishna Nagar shop, grouped so you can pick by theme and by your child's age.

## Chacha Nehru: the classic Children's Day costume

Children's Day is Pandit Jawaharlal Nehru's birthday, so Chacha Nehru is the costume judges expect and parents search for first. The look is simple and instantly recognisable: a white achkan (long coat) with churidar, a white cap, and a red rose pinned on the left side of the chest.

Our [Jawaharlal Nehru fancy dress](/products/${NEHRU}) comes as the full achkan, churidar and cap set with the rose. It rents for {{rent:${NEHRU}}} or you can buy it for {{price:${NEHRU}}}, and because the same costume works on 15 August and 26 January, buying makes sense if your child is likely to be asked again.

A two-line intro your child can say on stage: "I am Chacha Nehru, the first Prime Minister of India. I loved children, and that is why we celebrate my birthday as Children's Day."

For a girl who wants a leader costume, an [Indira Gandhi fancy dress](/products/indira-gandhi-fancy-dress-costume) pairs well with a Nehru for a sibling or class act, and the [Mahatma Gandhi costume](/products/mahatma-gandhi-fancy-dress-costume) is another easy choice. You can see all of them under [leaders and freedom fighters](/category/leaders-freedom-fighters).

## Community helpers fancy dress ideas

Many schools pick a "people who help us" theme for Children's Day, especially for nursery and primary classes. Community helper costumes are easy for small children to explain, and teachers like them because every child gets a clear line to say. These are the ones we have ready:

- [Air hostess dress](/products/air-hostess-fancy-dress): the most requested helper costume for girls. "I am an air hostess. I take care of passengers on the plane."
- [Traffic police costume](/products/traffic-police-fancy-dress-costume): a strong pick for boys and girls. "I am a traffic police officer. I keep the roads safe."
- [Police fancy dress](/products/police-fancy-dress), with an optional [police officer cap](/products/police-officer-cap).
- [Fire fighter costume](/products/fire-fighter-fancy-dress-costume): "I am a fire fighter. I put out fires and save lives."
- [Chef costume](/products/chef-fancy-dress-costume): easy to add a prop, such as a wooden spoon or a toy pan.
- [Fisherman fancy dress](/products/fisherman-fancy-dress): works well with a small net or a cardboard fish.
- [Army costume in Kargil print](/products/army-fancy-dress-costume-kargil-print) and the [Indian Air Force uniform](/products/indian-air-force-fancy-dress-costume), for children who want to be soldiers.
- [Astronaut suit](/products/astronaut-fancy-dress): the favourite for older kids who want something that looks different on stage.

The full range is on our [community helpers costumes](/category/helper-costumes) page. If the profession you need is not listed, WhatsApp us and we will tell you what we can put together.

## Cartoon character costumes

For the youngest children, and for schools that keep Children's Day playful, a cartoon costume is the happiest choice. Small children feel comfortable in something they recognise from TV:

- [Doraemon fancy dress](/products/doraemon-fancy-dress) in size {{size:doraemon-fancy-dress}}
- [Chutki](/products/chutki-fancy-dress) and [Noddy](/products/noddy-fancy-dress-costumes)
- [Winnie the Pooh](/products/pooh-fancy-dress) and [Tweety](/products/tweety-fancy-dress)
- [Angry Bird](/products/angry-bird-fancy-dress) and [Balveer](/products/balveer-fancy-dress-costumes)
- [Snow White](/products/snow-white-fancy-dress) for girls who want a princess

See every option on the [cartoon characters](/category/cartoon-characters) page. For a theme with a message, fun object costumes also do well on Children's Day: a [laptop costume](/products/${LAPTOP}) for a "digital India" line, a [pencil costume](/products/pencil-fancy-dress-costume-for-kids) for "education for every child", or a [traffic light](/products/traffic-light-fancy-dress-costumes) for road safety.

## Which costume suits which age

- **Ages 3 to 5:** keep it soft and simple. Cartoon costumes, the pencil and the traffic light are easy to wear, and a child this age only needs one line, or none at all.
- **Ages 5 to 8:** community helpers work best here. The costume tells the story, and a two-line intro is easy to learn in a week.
- **Ages 8 to 12:** Chacha Nehru with a short speech, the astronaut, or the air force uniform. Older children can carry a longer speech and a more formal costume.

## Getting the size right

Ages on costume labels are only a guide. Children of the same age vary a lot, so measure your child's chest and height and send them to us with the costume name. For long costumes like the achkan, check the length at the ankle, because a hem that is too long is the most common reason a child trips on stage. If you can, visit the shop and try two sizes. It takes ten minutes and saves a last-minute rush.

## Rent or buy?

Rent if the costume is for one event. Every costume in our shop can be rented for an event, which usually means one to two days, with a refundable deposit that you get back in full when you return it. The deposit depends on the costume: ₹500 for costumes up to ₹200 rent, ₹1,000 for ₹201 to ₹500 rent, and ₹2,000 above that. You do not need to wash the costume before returning it.

Buy if your child will wear it again. The Nehru, army and police costumes come back every 15 August and 26 January, so a bought costume often gets two or three outings.

Teachers dressing a whole class can WhatsApp us the list. For ten or more costumes we offer group rates.

## When to book

October and November are among our busiest months, with Navratri, Dussehra, Halloween, Diwali and annual-function rehearsals all within a few weeks of each other. For Children's Day, book at least one week ahead, and two weeks ahead for the Nehru costume, which is the one most schools ask for. You can pick up from our Krishna Nagar shop in East Delhi, or we can send the costume by Porter or Rapido anywhere in Delhi NCR. Read more on our [rent page](/rent) or the [FAQ](/faq).

Bal Diwas ki fancy dress chahiye? WhatsApp karke size check kar lijiye.`

run(async (cat) => {
  // Step 1: Nehru retarget (overwrite).
  await updateProduct(cat, {
    slug: NEHRU,
    seo_title: "Chacha Nehru Costume for Kids – Children's Day 14 Nov",
    meta_description:
      "Jawaharlal Nehru fancy dress for Children's Day: white achkan, Nehru cap and red rose. Buy or rent in Delhi NCR for school events on 13–14 November 2026.",
    description: NEHRU_DESCRIPTION,
  })

  // Step 3: helper-costumes refresh and live profession costumes attached.
  await updateCategory(cat, {
    slug: 'helper-costumes',
    seo_title: "Community Helpers Fancy Dress – Children's Day Costumes",
    meta_description:
      "Community helpers fancy dress for kids: air hostess, police, fire fighter, chef, army and astronaut. Buy or rent in Delhi NCR for Children's Day.",
    description: HELPER_DESCRIPTION,
  })
  await attachProducts(cat, 'helper-costumes', [
    'police-fancy-dress',
    'indian-air-force-fancy-dress-costume',
    'astronaut-fancy-dress',
  ])

  // Step 5: laptop CTR (rent price from the DB).
  await updateProduct(cat, {
    slug: LAPTOP,
    seo_title: `Laptop Fancy Dress for Kids – Rent {{rent:${LAPTOP}}} | Children's Day`,
    meta_description: `Laptop fancy dress for kids: rent for {{rent:${LAPTOP}}} or buy for {{price:${LAPTOP}}}. A tech-theme costume for Children's Day and science fairs in Delhi NCR.`,
  })

  // Step 4: new post.
  await upsertPost(cat, {
    slug: 'childrens-day-fancy-dress-ideas',
    title: "Children's Day Fancy Dress Ideas for Kids (14 November)",
    excerpt:
      "Children's Day fancy dress ideas for 13–14 November: Chacha Nehru, community helpers and cartoon costumes, with sizing, rent vs buy and booking tips.",
    content: POST_CONTENT,
  })
})
