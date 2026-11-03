/**
 * Doraemon: stop the mascot page from catching kids' searches (3 Nov 2026).
 *
 * Search Console, 6 Oct – 2 Nov: "doraemon costume" had 1,045 impressions at
 * position 2.4 and 0 clicks. Google served /products/doraemon-cartoon (the
 * ₹2,250 full-body mascot, 1,699 impressions, 1 click) while the kids'
 * jumpsuit parents actually want, /products/doraemon-fancy-dress, sat at
 * position 9. The mascot copy said "Available for kids", which made the two
 * pages compete for the same query.
 *
 * The mascot page now targets mascot / event searches and points to the
 * kids' costume by name (the related-products block already links it). The
 * kids' page takes the Children's Day (14 Nov) angle.
 *
 * Dry run:  npx tsx scripts/followups/doraemon-split-2026-11.ts
 * Apply:    npx tsx scripts/followups/doraemon-split-2026-11.ts --apply
 */
import { run, updateProduct } from '../lib/festival-content'

const MASCOT = 'doraemon-cartoon'
const KIDS = 'doraemon-fancy-dress'

run(async (cat) => {
  await updateProduct(cat, {
    slug: MASCOT,
    seo_title: `Doraemon Mascot Costume for Events – Rent {{rent:${MASCOT}}}`,
    meta_description: `Walk-around Doraemon mascot with a big character head, blue suit and feet covers for parties and events. Rent {{rent:${MASCOT}}} or buy {{price:${MASCOT}}}, Delhi NCR.`,
    description: `A full-body Doraemon mascot costume: the big round character head, sky-blue suit with white belly and pocket, and feet covers. It is a walk-around mascot for a performer, made for birthday parties, Children's Day programmes, school events and shop openings where Doraemon needs to greet the children in person.

Rent it for {{rent:${MASCOT}}} with a refundable deposit of {{deposit:${MASCOT}}}, or buy it for {{price:${MASCOT}}}, at our Krishna Nagar shop in East Delhi. WhatsApp us the wearer's height to check the fit before you book.

Looking for a Doraemon costume your child can wear on stage? See our Doraemon Fancy Dress for Kids in size {{size:${KIDS}}}, which rents for {{rent:${KIDS}}}.`,
  })

  await updateProduct(cat, {
    slug: KIDS,
    seo_title: `Doraemon Costume for Kids – Rent {{rent:${KIDS}}} | Children's Day`,
    meta_description: `Doraemon costume for kids {{size:${KIDS}}}: blue jumpsuit with face hood, white belly and red collar. Rent {{rent:${KIDS}}} or buy {{price:${KIDS}}} in Delhi NCR for Children's Day.`,
    description: `A Doraemon costume for kids, sized {{size:${KIDS}}}: a blue jumpsuit with a Doraemon face hood, the white belly and the red collar. It is soft and easy to wear, so even the youngest children are comfortable in it through a whole school programme.

Doraemon is one of the happiest picks for Children's Day on 14 November (most schools celebrate on Friday 13 November in 2026), cartoon-theme fancy dress competitions and birthday parties. A simple line for the stage: "I am Doraemon, and my magic pocket has a gadget for every problem."

Rent it for {{rent:${KIDS}}} with a refundable deposit of {{deposit:${KIDS}}}, or buy it for {{price:${KIDS}}}, at our Krishna Nagar shop in East Delhi. For other sizes, WhatsApp us; they usually take 2–3 days. Need a full-body Doraemon mascot for a party instead? We have that too.`,
  })
})
