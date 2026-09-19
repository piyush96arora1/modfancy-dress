/**
 * One-off publish of "Hulk Muscles Imp" from the supplier catalogue
 * (/catalog/p/hulk-muscles-imp) into Superhero Costumes at ₹1400.
 *
 * Why this one matters more than a single product usually would:
 *
 *   Superhero Costumes had exactly ONE live product (Balveer) when this ran,
 *   while its own category copy promises "Captain America, Green Hulk, Chota
 *   Bheem" and its meta_description says "Hulk, Batman and more". Both Hulk
 *   products it refers to were soft-deleted in Mar and Aug 2026, so the page
 *   was advertising stock it no longer had — a thin page making a promise the
 *   listing could not keep.
 *
 *   The Semrush gap export puts the site at position 0 on every superhero term:
 *   `kids superhero costumes` 720/mo, `superhero dress` 390, `superhero dress
 *   for boy` 320, `superhero fancy dress` 260, `hulk fancy dress` 170. Separately
 *   `hulk mask` is 720/mo — and this costume ships WITH the mask, so that term
 *   is honest here in a way it would not be on a plain suit. The copy and the
 *   name both lead on it.
 *
 * Copy is written against the two catalogue photographs: the padding, the torn
 * hem, the moulded mask and the colour shading below are all in frame. Both are
 * flat-lays, so the alt text says so rather than describing a child.
 *
 * Owner set price ₹1400, rent ₹600, deposit ₹1500, size 3-9 yrs.
 *
 * Dry run:  npx tsx scripts/import-hulk-muscle-costume.ts
 * Apply:    npx tsx scripts/import-hulk-muscle-costume.ts --apply
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

const SUPERHERO_CATEGORY_ID = '941ade48-aaa7-4092-bf5c-167a44c24804'

const STORE_TAIL = 'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.'

const LISTING: Listing = {
  supplierSlug: 'hulk-muscles-imp',
  slug: 'hulk-muscle-fancy-dress-with-mask',
  name: 'Hulk Muscle Fancy Dress with Mask',
  description: [
    'A Hulk fancy dress with the muscles built into it — the chest and arms are padded and moulded into sculpted pecs, a six-pack and biceps, so the costume carries the Hulk shape on a child who does not have one. The green deepens to forest green down the forearms and calves, and the attached maroon trousers are cut with a ragged torn hem, the way they are meant to look after the change. The moulded green Hulk mask is included, with black hair, red-rimmed eyes and bared teeth, so there is no separate mask to buy or lose on the day.',
    'Two pieces — the padded muscle suit with attached trousers, and the face mask. Imported, and noticeably heavier built than a printed Hulk suit. Fits most kids 3 to 9 years.',
    'Hulk ki dress with muscle padding aur mask — school fancy dress competition ke liye.',
    STORE_TAIL,
  ].join('\n'),
  meta_description:
    'Hulk fancy dress for kids with padded muscle suit and green Hulk mask included. Buy ₹1400 or rent ₹600 in Delhi NCR.',
  seo_title: 'Hulk Fancy Dress for Kids - Muscle Suit & Mask',
  alts: [
    'Hulk fancy dress for kids laid flat — padded green muscle top with sculpted chest and arms, torn maroon trousers and a green Hulk face mask',
    'Hulk muscle costume for kids laid flat, second view — moulded green Hulk mask with black hair above the padded suit and ragged torn trouser hems',
  ],
}

publishCatalogProducts(sb, [LISTING], {
  price: 1400,
  rentPrice: 600,
  rentDeposit: 1500,
  size: '3-9 yrs',
  primaryCategoryId: SUPERHERO_CATEGORY_ID,
  categoryIds: [SUPERHERO_CATEGORY_ID],
  apply: APPLY,
}).catch((e) => {
  console.error(e)
  process.exit(1)
})
