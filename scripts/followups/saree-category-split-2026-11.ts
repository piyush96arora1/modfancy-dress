/**
 * Stop /category/saree and /category/kids-saree competing (review, 4 Nov 2026).
 *
 * kids-saree now targets "saree fancy dress" / "fancy dress competition saree".
 * saree was titled "Saree Fancy Dress - Buy Online", the same phrase. Its three
 * products are regional sarees (Bengali, Maharashtrian nauvari, South Indian), so
 * it takes the regional-saree intent instead and links to kids-saree.
 *
 * Dry run:  npx tsx scripts/followups/saree-category-split-2026-11.ts
 * Apply:    npx tsx scripts/followups/saree-category-split-2026-11.ts --apply
 */
import { run, updateCategory } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  await updateCategory(cat, {
    slug: 'saree',
    name: 'Regional Saree Costumes',
    seo_title: 'Regional Saree Costumes – Bengali, Nauvari & South Indian',
    meta_description:
      'Regional saree costumes for girls: Bengali saree, Maharashtrian nauvari and South Indian saree for states-of-India themes. Buy or rent in Delhi NCR.',
    description:
      'Regional saree costumes for states-of-India themes, cultural days and folk dance items: a [Bengali saree](/products/bengali-saree-fancy-dress) for a Bengal or Durga Puja look, a [Maharashtrian nauvari](/products/maharashtra-fancy-dress) for Maharashtra Day and Lavani-style items, and a [South Indian saree](/products/south-indian-girl-fancy-dress) for Kerala, Tamil Nadu and Karnataka themes. Each is ready to wear, so there is no draping on the morning of the event. Rent per event with a refundable deposit, or buy, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. For simple sarees in pink, blue, printed and white-with-red-border, see [saree fancy dress for girls](/category/kids-saree).',
  })
  if (APPLY && pass === 2) await revalidateSite('catalog')
})
