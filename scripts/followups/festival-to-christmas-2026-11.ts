/**
 * Switch /category/festival-costumes from Diwali to Christmas (12 Nov 2026).
 *
 * Diwali was 8 Nov; the category still targeted it ("Diwali Fancy Dress for Kids –
 * Lakshmi, Ram-Sita & Diya"). Christmas is the next festival and the biggest gap in
 * the Semrush data: santa claus dress 8,100/mo, santa dress 8,100, angel dress 1,900,
 * angel dress for kids 1,300, childrens santa costume 880 (~58K/mo across Santa +
 * angel). Christmas is Friday 25 Dec 2026; school Christmas programmes run ~18–24 Dec,
 * so the page needs to rank from early December.
 *
 * Santa, angel and reindeer are already in this category (uploaded 4 Nov). The star
 * costume joins them (Christmas star in nativity plays). The Ram/Sita/Hanuman/Ravan
 * costumes stay attached — they also live in ramleela-costumes — and the copy keeps a
 * line for them. Name becomes "Christmas & Festival Costumes" (the H1).
 * No rent or deposit figures (owner rule).
 *
 * Dry run:  npx tsx scripts/followups/festival-to-christmas-2026-11.ts
 * Apply:    npx tsx scripts/followups/festival-to-christmas-2026-11.ts --apply
 */
import { run, updateCategory, attachProducts } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  await attachProducts(cat, 'festival-costumes', ['star-fancy-dress'])
  await updateCategory(cat, {
    slug: 'festival-costumes',
    name: 'Christmas & Festival Costumes',
    seo_title: 'Christmas Costumes for Kids – Santa, Angel & Reindeer',
    meta_description:
      'Christmas fancy dress for kids: Santa Claus dress, angel dress with wings, reindeer and star costumes for school Christmas plays. Buy or rent, Delhi NCR.',
    description:
      'Christmas costumes for kids for school Christmas programmes, nativity plays, carol singing and Christmas parties. Christmas falls on Friday 25 December 2026, and most schools hold their celebrations in the week before, from about 18 to 24 December. The star of every programme is Santa: our [Santa Claus dress](/products/santa-claus-dress) comes as the red suit with white trim, Santa cap, white beard and gift pouch, in kids\' and adult sizes, so a teacher or parent can play Santa too. For girls there is the [angel dress](/products/angel-fancy-dress), a white lace frock with wings, wand and headband that suits angel dialogues and nativity scenes, and our [reindeer costume](/products/reindeer-fancy-dress) with antler hood and red nose makes a perfect Rudolph next to Santa. A [star costume](/products/star-fancy-dress) completes the nativity line-up. Need lines for the stage? See our [angel dialogues for fancy dress competition](/blog/angel-dialogues-for-fancy-dress-competition). This collection also keeps our Ram, Sita, Hanuman, Ganesh and Ravan costumes for Ramleela and festival plays through the year; the full set is in [Ramleela costumes](/category/ramleela-costumes). Every costume can be bought, or rented for one event with a refundable deposit, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR by Porter or Rapido. Book Santa early: December is our busiest month for it.',
  })
  if (APPLY && pass === 2) await revalidateSite('catalog')
})
