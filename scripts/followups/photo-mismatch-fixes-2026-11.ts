/**
 * Copy that contradicted the product photo (found 4 Nov 2026 while checking
 * Republic Day photos):
 *  - Tilak: copy said "dhoti-kurta and cap"; the photo shows a red pagdi (turban).
 *  - Air Force cap: copy claimed an "embroidered badge"; the photo is a plain black
 *    peaked cap with a yellow band.
 *
 * Dry run:  npx tsx scripts/followups/photo-mismatch-fixes-2026-11.ts
 * Apply:    npx tsx scripts/followups/photo-mismatch-fixes-2026-11.ts --apply
 */
import { run, updateProduct } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  await updateProduct(cat, {
    slug: 'bal-gangadhar-tilak-fancy-dress-costume',
    seo_title: 'Bal Gangadhar Tilak Costume for Kids – Freedom Fighter',
    meta_description:
      'Lokmanya Tilak costume for kids with dhoti-kurta and red pagdi for Republic Day and freedom-fighter competitions. Buy {{price:bal-gangadhar-tilak-fancy-dress-costume}} or rent {{rent:bal-gangadhar-tilak-fancy-dress-costume}}, Delhi NCR.',
    description:
      'Honour Lokmanya Bal Gangadhar Tilak with this freedom fighter costume: a traditional dhoti-kurta with the red pagdi (turban) that Tilak is remembered for. Add a moustache and a line such as "Swaraj is my birthright, and I shall have it!" and the look is complete. Ideal for Republic Day and Independence Day school events, history skits and freedom-fighter fancy dress competitions. Rent it for {{rent:bal-gangadhar-tilak-fancy-dress-costume}} with a refundable deposit, or buy it for {{price:bal-gangadhar-tilak-fancy-dress-costume}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR.',
  })
  await updateProduct(cat, {
    slug: 'air-force-cap',
    seo_title: 'Air Force Cap – Pilot & Armed Forces Costume Cap',
    meta_description:
      'Black peaked pilot-style cap with a yellow band to complete an Air Force or armed-forces costume for Republic Day. Buy {{price:air-force-cap}} or rent {{rent:air-force-cap}}, Delhi NCR.',
    description:
      'A black peaked pilot-style cap with a yellow band and a structured brim, the finishing touch for an Air Force, pilot or armed-forces costume. Pair it with a uniform for Republic Day parades, Independence Day school functions and community-helper fancy dress competitions. Available for kids. Rent it for {{rent:air-force-cap}} or buy it for {{price:air-force-cap}} at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR.',
  })
  if (APPLY && pass === 2) await revalidateSite('catalog')
})
