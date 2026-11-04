/**
 * Striking-distance product pages + uniforms (4 Nov 2026).
 *
 * Semrush positions (3–4 Nov) and the keyword gap:
 *   police dress 6,600 · police dress for kids 6,600 (competitors #6–15, we don't rank)
 *   army dress 9,900 · army dress for kids 1,600 (rentmycostume #15, we don't rank)
 *   chutki fancy dress competition 1,600 (#6) · peacock fancy dress 720 (#16)
 *   traffic police dress / competition 720×2 (#13–19) · mango fancy dress 880 (#17)
 * Uniform costumes peak for Republic Day and community-helper weeks (Dec–Feb).
 *
 * Same recipe as the leader pages: title leads with the searched phrase,
 * meta carries "Buy ₹X or rent ₹Y", primary-image alt uses the same words,
 * description written from the photo (checked 4 Nov). The traffic police
 * title said "Khaki Uniform"; the photo is a white shirt, navy trousers, navy
 * peaked cap and whistle, so that is corrected. The army costume is a maroon,
 * brown and beige camouflage print (sold as "Kargil print").
 *
 * Dry run:  npx tsx scripts/followups/striking-distance-products-2026-11.ts
 * Apply:    npx tsx scripts/followups/striking-distance-products-2026-11.ts --apply
 */
import { run, sb, updateProduct } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

type Page = { slug: string; seo_title: string; meta: string; alt: string; description: string }

const PAGES: Page[] = [
  {
    slug: 'army-fancy-dress-costume-kargil-print',
    seo_title: 'Army Dress for Kids – Indian Army Fancy Dress Costume',
    meta: 'Army dress for kids: camouflage-print uniform shirt with pockets, belt and trousers. Buy {{price:army-fancy-dress-costume-kargil-print}} or rent {{rent:army-fancy-dress-costume-kargil-print}} in Delhi NCR for Republic Day.',
    alt: 'Army dress for kids: Indian Army fancy dress costume with camouflage-print uniform shirt, belt and trousers',
    description: `An army dress for kids in a camouflage print (the "Kargil print"): a full-sleeve uniform shirt with flap pockets and shoulder straps, a belt with buckle, and matching trousers. Add black shoes and a salute, and your child is a fauji ready for the stage.

It is one of the most popular boys' costumes for 26 January Republic Day, 15 August Independence Day, Kargil Vijay Diwas (26 July), Army Day (15 January) and "our heroes" or community-helper fancy dress competitions, and it works for a group soldier dance too. Rent it for {{rent:army-fancy-dress-costume-kargil-print}} with a refundable deposit of {{deposit:army-fancy-dress-costume-kargil-print}}, or buy it for {{price:army-fancy-dress-costume-kargil-print}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. For a class or house group, WhatsApp us the number of children and their sizes.`,
  },
  {
    slug: 'police-fancy-dress',
    seo_title: 'Police Dress for Kids – Khaki Police Fancy Dress',
    meta: 'Police dress for kids: khaki uniform shirt with pockets and shoulder straps, khaki trousers and cap. Buy {{price:police-fancy-dress}} or rent {{rent:police-fancy-dress}} in Delhi NCR.',
    alt: 'Police dress for kids: khaki police fancy dress uniform with pocket shirt, trousers and peaked cap',
    description: `A police dress for kids in classic Indian khaki: a uniform shirt with two flap pockets and shoulder straps, matching khaki trousers and a khaki peaked cap. With black shoes and a confident salute it reads as "Inspector" from the back of the hall.

Choose it for community-helper fancy dress competitions ("I am a police officer, I keep you safe"), Republic Day and Independence Day programmes, road-safety weeks and school plays. Rent it for {{rent:police-fancy-dress}} with a refundable deposit of {{deposit:police-fancy-dress}}, or buy it for {{price:police-fancy-dress}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. A white-and-navy [traffic police dress is also available for road-safety themes.`,
  },
  {
    slug: 'traffic-police-fancy-dress-costume',
    seo_title: 'Traffic Police Dress for Kids – Fancy Dress Costume',
    meta: 'Traffic police dress for kids: white shirt, navy trousers, navy peaked cap and whistle on a red cord. Buy {{price:traffic-police-fancy-dress-costume}} or rent {{rent:traffic-police-fancy-dress-costume}} in Delhi NCR.',
    alt: 'Traffic police dress for kids: white uniform shirt, navy trousers, navy peaked cap and whistle on a red cord',
    description: `A traffic police dress for kids: a white full-sleeve uniform shirt with shoulder straps, navy trousers, a navy peaked cap and a whistle on a red lanyard. Stretch out one arm to stop the traffic and blow the whistle, and the look is complete.

It is a favourite for road-safety week, community-helper fancy dress competitions and traffic-rules skits, where a child can explain the red, amber and green lights in two lines. Pair it with our traffic light costume for a duo item. Rent it for {{rent:traffic-police-fancy-dress-costume}} with a refundable deposit of {{deposit:traffic-police-fancy-dress-costume}}, or buy it for {{price:traffic-police-fancy-dress-costume}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. For the khaki look, see the police dress for kids.`,
  },
  {
    slug: 'chutki-fancy-dress',
    seo_title: 'Chutki Fancy Dress for Girls – Chhota Bheem Costume',
    meta: 'Chutki fancy dress for girls: purple jumpsuit with peach sleeves and a big Chutki face mask with pigtails. Buy {{price:chutki-fancy-dress}} or rent {{rent:chutki-fancy-dress}} in Delhi NCR.',
    alt: 'Chutki fancy dress for girls: Chhota Bheem Chutki costume with purple jumpsuit, peach sleeves and big face mask with pigtails',
    description: `A Chutki fancy dress for girls, Chhota Bheem's best friend from Dholakpur: a purple jumpsuit with peach sleeves and a big smiling Chutki face mask, complete with her two pigtails, worn on top of the head so your child's own face stays visible.

Little ones love it for nursery and kindergarten fancy dress competitions, cartoon-character theme days, annual-function dances to the Chhota Bheem song and birthday parties. It pairs naturally with a Chhota Bheem costume for a sibling or friend. Rent it for {{rent:chutki-fancy-dress}} with a refundable deposit of {{deposit:chutki-fancy-dress}}, or buy it for {{price:chutki-fancy-dress}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. More characters are in cartoon costumes.`,
  },
  {
    slug: 'peacock-fancy-dress',
    seo_title: 'Peacock Fancy Dress for Kids – National Bird Costume',
    meta: 'Peacock fancy dress for kids: shiny blue jumpsuit with wing sleeves and a peacock hood with crest. Buy {{price:peacock-fancy-dress}} or rent {{rent:peacock-fancy-dress}} in Delhi NCR.',
    alt: 'Peacock fancy dress for kids: shiny metallic blue jumpsuit with wing sleeves and peacock hood with crest',
    description: `A peacock fancy dress for kids in shimmering metallic blue: a jumpsuit with wide wing sleeves that open out when the arms are raised, and a peacock hood with a beak, eyes and a crest of feathers on top. It catches the stage lights beautifully during a dance.

The peacock is India's national bird, which makes this a strong pick for "national symbols" and bird-theme fancy dress competitions, Republic Day and Independence Day programmes, nature and save-birds days and annual-function dances such as "Mor bani thanghat kare". Rent it for {{rent:peacock-fancy-dress}} with a refundable deposit of {{deposit:peacock-fancy-dress}}, or buy it for {{price:peacock-fancy-dress}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. More birds are in bird costumes.`,
  },
  {
    slug: 'mango-fancy-dress',
    seo_title: 'Mango Fancy Dress for Kids – Fruit Costume',
    meta: 'Mango fancy dress for kids: yellow mango-shaped costume with a smiling face, green leaves and a leaf cap. Buy {{price:mango-fancy-dress}} or rent {{rent:mango-fancy-dress}} in Delhi NCR.',
    alt: 'Mango fancy dress for kids: yellow mango-shaped fruit costume with smiling face, green leaves and green leaf cap',
    description: `A mango fancy dress for kids: a bright yellow mango-shaped costume with a smiling face and green leaves at the neck, worn over the child's own clothes, with a green leaf cap on top. It slips on in seconds, which makes it ideal for the youngest children.

The mango is the king of fruits and India's national fruit, so it is a favourite for nursery and kindergarten fruit-theme fancy dress, "eat healthy" days, summer-season themes and national-symbols competitions. A two-line speech such as "I am a mango, the king of fruits, sweet and juicy" is all it needs. Rent it for {{rent:mango-fancy-dress}} with a refundable deposit of {{deposit:mango-fancy-dress}}, or buy it for {{price:mango-fancy-dress}}, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. More fruits are in fruit costumes.`,
  },
]

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++
  for (const p of PAGES) {
    await updateProduct(cat, { slug: p.slug, seo_title: p.seo_title, description: p.description, meta_description: p.meta })
  }
  for (const p of PAGES) {
    const live = cat.products.get(p.slug)!
    const { data: imgs, error } = await sb.from('product_images').select('id, alt_text, is_primary').eq('product_id', live.id)
    if (error) throw new Error(error.message)
    const primary = (imgs ?? []).find((i) => i.is_primary) ?? imgs?.[0]
    if (!primary) throw new Error(`${p.slug}: no image`)
    if (APPLY && pass === 2) {
      const { error: e } = await sb.from('product_images').update({ alt_text: p.alt }).eq('id', primary.id)
      console.log(e ? `   ❌ ${p.slug}: ${e.message}` : `   ✅ ${p.slug} alt written`)
    }
  }
  if (APPLY && pass === 2) await revalidateSite('catalog')
})
