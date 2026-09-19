/**
 * Publishes the padded muscle-suit superhero costumes from the supplier
 * catalogue into Superhero Costumes at ₹1400 each.
 *
 * Why this category needed the stock:
 *
 *   Superhero Costumes had exactly ONE live product (Balveer) when the Hulk was
 *   added, while its own category copy promises "Captain America, Green Hulk,
 *   Chota Bheem" and its meta_description says "Hulk, Batman and more". Both
 *   Hulk products it referred to were soft-deleted in Mar and Aug 2026, so the
 *   page was advertising stock it no longer had.
 *
 *   The Semrush gap export puts the site at position 0 on every superhero term:
 *   `kids superhero costumes` 720/mo, `superhero dress` 390, `superhero dress
 *   for boy` 320, `superhero fancy dress` 260, `hulk fancy dress` 170.
 *
 * Both sets are the IMPORTED build, not the Indian one. The catalogue carries a
 * cheaper Indian Ironman at ₹375 cost with visible press studs down the front;
 * the owner chose the imported version so the two products match in build and
 * carry the same 2.15x markup over cost.
 *
 * Copy is written against the catalogue photographs — the padding, the arc
 * reactor, the torn hem, the moulded masks and the colour shading are all in
 * frame. All are flat-lays, so the alt text says so rather than describing a
 * child.
 *
 * Owner set price ₹1400, rent ₹600, deposit ₹1500, size 3-9 yrs for both.
 *
 * Dry run:  npx tsx scripts/import-superhero-muscle-costumes.ts
 * Apply:    npx tsx scripts/import-superhero-muscle-costumes.ts --apply
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

const LISTINGS: Listing[] = [
  {
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
  },
  {
    supplierSlug: 'ironman-muscles-imp',
    slug: 'iron-man-muscle-fancy-dress-with-mask',
    name: 'Iron Man Muscle Fancy Dress with Mask',
    description: [
      'An Iron Man fancy dress cut as a single padded jumpsuit, with the chest and biceps moulded into armour plating so the suit holds its shape instead of hanging flat on a child. The arc reactor sits raised and pale in the centre of the chest, the red deepens to a darker maroon down the legs, and the gold shoulder caps, forearm gauntlets and thigh plates are printed into the same piece — nothing to strap on or lose. The moulded Iron Man face mask is included, gold with a red brow and the angular slit eyes.',
      'Two pieces — the padded muscle jumpsuit and the face mask. Imported, and more sculpted than the flat printed Iron Man suits. Fits most kids 3 to 9 years.',
      'Iron Man ki dress with muscle padding aur mask — Avengers theme aur fancy dress competition ke liye.',
      STORE_TAIL,
    ].join('\n'),
    meta_description:
      'Iron Man fancy dress for kids with padded muscle suit and gold Iron Man mask included. Buy ₹1400 or rent ₹600 in Delhi NCR.',
    seo_title: 'Iron Man Fancy Dress for Kids - Muscle Suit & Mask',
    alts: [
      'Iron Man fancy dress for kids laid flat — red and gold padded muscle jumpsuit with a raised arc reactor on the chest and a gold Iron Man face mask',
    ],
  },
]

publishCatalogProducts(sb, LISTINGS, {
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
