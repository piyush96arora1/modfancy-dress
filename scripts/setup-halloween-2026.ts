/**
 * Halloween 2026 (Sat 31 Oct; parties 30–31 Oct, school events 29–30 Oct).
 * Plan: docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md, Task 10.
 *
 *   Step 3  Category copy for /category/halloween (title and meta from the
 *           plan), and attach the live joker wig so the page lists two
 *           products instead of one.
 *   Step 4  New post /blog/halloween-costume-ideas-india.
 *
 * Only the ghost/skeleton costume and the joker wig are live today. Witch,
 * vampire, pumpkin, devil and Wednesday Addams are owner-confirmed stock
 * (23 Sep) still to be uploaded (Task 10 Step 1, by 1 Oct). The body copy and
 * the post therefore present them as ideas with "WhatsApp to check what is in
 * store" and link only to live products and categories. Once the batch is live,
 * run Task 19a on it and the category fills in under the same copy.
 *
 * Dry run:  npx tsx scripts/setup-halloween-2026.ts
 * Apply:    npx tsx scripts/setup-halloween-2026.ts --apply
 */
import { attachProducts, run, updateCategory, upsertPost } from './lib/festival-content'

const GHOST = 'ghost-bhoot-skeleton-halloween-costume-fancy-dress'
const JOKER_WIG = 'multi-color-joker-wig-fancy-dress'

const HALLOWEEN_DESCRIPTION =
  "Halloween costumes to rent or buy in Delhi, for kids' parties, school Halloween events and adult Halloween nights. Halloween falls on Saturday 31 October 2026, so most parties run over the weekend of 30 and 31 October, with school events on the 29th and 30th. In store now are a ghost, bhoot and skeleton costume and a multi-colour joker wig. Witch, vampire, pumpkin, devil and Wednesday Addams looks are the ones most asked for this season; WhatsApp us to check what is in store and in which sizes before you plan the outfit. Renting suits Halloween well, because most costumes are worn for a single night: pay the rent and a refundable deposit, and get the full deposit back when you return the costume. Try sizes at our Krishna Nagar shop in East Delhi, or get the costume delivered anywhere in Delhi NCR by Porter or Rapido. Chudail ya bhoot ka costume? Rent pe lijiye."

const POST_CONTENT = `Halloween falls on Saturday 31 October in 2026, so most Halloween parties in Delhi NCR will run over the weekend of 30 and 31 October, and international schools usually hold their Halloween day on the Thursday or Friday before. Halloween has become a proper event in India, from school dress-up days to society parties and adult Halloween nights, but it still sits in the middle of Navratri, Dussehra and Diwali preparations, so a little planning helps. Here are Halloween costume ideas for kids and adults that work well in India, and what you can rent or buy at our Krishna Nagar store.

## Easy, school-safe Halloween costumes for kids

For school Halloween days the best costume is one that looks spooky from across the room but is still comfortable for a whole morning of classes and games.

- **Skeleton or ghost:** the easiest Halloween costume for children of any age. Our [ghost, bhoot and skeleton costume](/products/${GHOST}) rents for {{rent:${GHOST}}} or you can buy it for {{price:${GHOST}}}. Add a little white and black face paint and it is complete.
- **Witch:** a black dress or gown, a pointed hat, a broom and a touch of green face paint. It is the most popular Halloween idea for girls, and it is easy to keep friendly for younger children.
- **Pumpkin:** an orange outfit with a green leaf or stem headband. For small children, a round costume like our [orange fruit costume](/products/orange-fancy-dress-costumes) with a paper stem on the head reads as a pumpkin from across a classroom.
- **Joker:** our [multi-colour joker wig](/products/${JOKER_WIG}) with a white face, a red nose and a bright shirt. It works for kids and adults.
- **Superheroes:** many children simply want to be their favourite hero, and most Halloween parties welcome it. The [Hulk muscle suit](/products/hulk-muscle-fancy-dress-with-mask) and [Iron Man muscle suit](/products/iron-man-muscle-fancy-dress-with-mask) both come with a mask. See all of them under [superhero costumes](/category/superhero-costumes).

## Halloween costume ideas for adults and couples

Adult Halloween parties in Delhi lean towards classic horror characters and pop-culture looks:

- **Vampire or Dracula:** a black cape with a high collar, a waistcoat, slicked-back hair and plastic fangs. It is one of the most searched Halloween costumes in India.
- **Wednesday Addams:** a black dress with a white collar, two braids and a straight face. Trending with teenagers and adults, and easy to wear all evening.
- **Devil:** red horns, a red or black cape and a trident. A good last-minute choice.
- **Witch and warlock:** a hat, a cape and a broom or staff. It works as a couple costume with a vampire.
- **Zombie:** old clothes, torn at the edges, with grey face paint. No costume to buy, just makeup.

Most of our rental costumes are made for kids aged 3 to 13, but we do have some adult sizes. WhatsApp us your size and the look you want, and we will tell you what is in store for the party weekend.

## Desi Halloween: chudail and bhoot looks

A desi twist gets noticed at any Halloween party. A chudail needs a white or faded saree, long open hair, dark eye makeup and a slow walk; you can start from one of our [kids' sarees](/category/kids-saree) for a girl. A bhoot is even simpler: our [ghost and skeleton costume](/products/${GHOST}) already carries the bhoot name, and a white sheet-style drape over it makes it spookier. These are the costumes that make children at an Indian Halloween party laugh and scream at the same time.

## Ideas by age

- **Ages 3 to 5:** pumpkin, friendly witch, skeleton or a superhero. Avoid masks that cover the whole face; small children get upset when they cannot see well.
- **Ages 6 to 10:** skeleton, witch, joker or a superhero muscle suit. This age loves face paint, so keep a wipe handy.
- **Ages 11 and up, and adults:** vampire, Wednesday Addams, devil, zombie or a chudail. Older children and adults can carry a darker look and a longer party.

## Comfort and safety tips

- Patch-test face paint on the inside of the wrist the day before, especially for young children.
- Keep capes above the ankle so nobody trips on stairs, and skip long trailing fabric near diyas and candles, which are everywhere in October and November.
- Choose masks with wide eye holes, or use face paint instead of a mask for small children.
- For evening parties, add something bright or reflective if the child will be walking outside.

## Rent or buy, and when to book

Most Halloween costumes are worn once, which makes renting the sensible choice. Every costume in our shop can be rented for an event, usually one to two days, with a refundable deposit that you get back in full when you return it. The deposit is ₹500 for costumes up to ₹200 rent, ₹1,000 for ₹201 to ₹500 rent, and ₹2,000 above that. You do not need to wash the costume before returning it. Buy if your child will wear the costume again, for example a skeleton that doubles as a school "human body" project.

Halloween comes in our busiest season, so book at least one week before the party. You can visit our Krishna Nagar shop in East Delhi to try sizes, or we can send the costume by Porter or Rapido anywhere in Delhi NCR. See everything we have for the season on our [Halloween costumes](/category/halloween) page, read how renting works on the [rent page](/rent), or find our shop on the [fancy dress in Delhi](/fancy-dress-delhi) page.

Halloween party ke liye costume chahiye? WhatsApp karke size check kar lijiye.`

run(async (cat) => {
  await updateCategory(cat, {
    slug: 'halloween',
    seo_title: 'Halloween Costumes on Rent in Delhi – Kids & Adults',
    meta_description:
      'Halloween costumes for kids and adults: witch, vampire, skeleton, pumpkin and more. Rent or buy in Delhi NCR for Halloween parties on 31 October 2026.',
    description: HALLOWEEN_DESCRIPTION,
  })
  await attachProducts(cat, 'halloween', [JOKER_WIG])

  await upsertPost(cat, {
    slug: 'halloween-costume-ideas-india',
    title: 'Halloween Costume Ideas for Kids and Adults in India',
    excerpt:
      'Halloween costume ideas for kids and adults in India: skeleton, witch, vampire, pumpkin, Wednesday Addams and desi chudail looks, plus Delhi rent tips.',
    content: POST_CONTENT,
  })
})
