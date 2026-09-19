/**
 * Publishes Ramleela characters from the supplier catalogue into Ramleela
 * Costumes (the live category — "Ramleela Collection" is inactive and empty).
 *
 * Vanvasi Sita, priced to match Vanvasi Ram at ₹900 / rent ₹600 / deposit ₹2000
 * on the owner's instruction. NOTE: vanvasi-ram was soft-deleted on
 * 19 Sep 2026 at 06:36 UTC, so the reference product is currently off the site;
 * the price is carried over regardless, as asked.
 *
 * Why this one earns its copy:
 *
 *   `sita vanvas dress` is 880/mo at KD 29 and the site ranks 0 for it, which is
 *   the single largest character term in the export that we stock exactly.
 *   Around it: `sita costume` 480, `sita fancy dress images` 480, `ram sita
 *   dress` 390, `sita dress` 390, `sita fancy dress` 320, `sita getup` 320,
 *   `vanvasi sita fancy dress` 260, `sita costume for fancy dress` 210 at KD 17.
 *
 *   The supplier name is "Vanvashi Sita Saree Meera" and the garment is a plain
 *   saffron saree, which is equally the standard Meera Bai costume. That is not
 *   a stretch to claim: the site ALREADY ranks #22 for `meera bai fancy dress`
 *   (210/mo) with nothing aimed at it, and `meerabai fancy dress` 210,
 *   `meera bai costume` 170 and `meera fancy dress` 140 at KD 19 sit beside it.
 *   So the copy names both characters, and a shopper searching either one finds
 *   a page that honestly answers.
 *
 * The copy deliberately does NOT claim the saree is pre-stitched or ready to
 * drape. Kids' character sarees usually are, but the supplier carries no
 * construction data and a photograph cannot show it — and a parent who buys on
 * that promise and receives loose cloth the night before a function has a real
 * complaint. The line points at WhatsApp instead.
 *
 * Unlike every other catalogue photo, this one is a styled shot worn by a child
 * model against a decorated backdrop rather than a flat-lay on the shop floor,
 * so the alt text says "worn by" instead of "laid flat".
 *
 * Size is 3-9 yrs, confirmed by the owner on 19 Sep 2026. The supplier carries
 * no size data, so it was left null on first import rather than guessed, and
 * filled in once the owner said. `sita dress for kid girl` is 210/mo, so the age
 * band earns its place in the meta as well as the body.
 *
 * Dry run:  npx tsx scripts/import-ramleela-catalogue.ts
 * Apply:    npx tsx scripts/import-ramleela-catalogue.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { publishCatalogProducts, type Listing } from './lib/publish-catalog-product'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')

const RAMLEELA_CATEGORY_ID = '29888d4d-ff57-4541-93be-69a73a1a6486'

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

const LISTINGS: Listing[] = [
  {
    supplierSlug: 'vanvashi-sita-saree-meera',
    slug: 'vanvasi-sita-saree-dress',
    name: 'Vanvasi Sita Saree Dress',
    description: [
      'A vanvasi Sita dress — the plain saffron saree Sita is shown in through the forest years, with a cream and gold border and a matching orange blouse edged in the same cream. There is no zari work, no mirror and no print, and that is the point: the exile scenes call for simplicity, and a heavily worked saree reads as the Ayodhya queen rather than the vanvas. Shown here as a saree with the pallu over the left shoulder and a matching short-sleeved blouse — WhatsApp us about how it fastens before you order. Fits most girls 3 to 9 years.',
      'The same saree doubles as a Meera Bai costume — plain saffron with a gold border is the standard Meera look — so one purchase covers both a Ramleela role and a bhakti-poet or saint character for a separate school event.',
      'Vanvasi Sita ki dress — Ramleela, Dussehra aur Meera Bai fancy dress dono ke liye.',
      STORE_TAIL,
    ].join('\n'),
    meta_description:
      'Vanvasi Sita dress for girls 3-9 yrs — plain saffron saree with gold border, doubles as Meera Bai. Buy ₹900 or rent ₹600 in Delhi NCR.',
    seo_title: 'Sita Vanvas Dress - Vanvasi Sita Saree for Girls',
    alts: [
      'Vanvasi Sita saree dress worn by a young girl — plain saffron saree with a cream and gold border and matching orange blouse, hands folded in namaste',
    ],
  },
]

publishCatalogProducts(sb, LISTINGS, {
  price: 900,
  rentPrice: 600,
  rentDeposit: 2000,
  size: '3-9 yrs',
  primaryCategoryId: RAMLEELA_CATEGORY_ID,
  categoryIds: [RAMLEELA_CATEGORY_ID],
  apply: APPLY,
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
