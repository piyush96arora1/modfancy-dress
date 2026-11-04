/**
 * Bharatanatyam, Odissi, Radha Rani lehenga, Bhagat Singh cap and the Republic
 * Day blogs (4 Nov 2026).
 *
 * Semrush India (Nov 2026):
 *   bharatanatyam dress (#29) · bharatnatyam costume · bharatanatyam dress for kids/girls
 *   odissi costume 2,900 (#47, competitor #1) · odissi dress 1,900
 *   radha rani lehenga 880 (#16)
 *   bhagat singh cap 1,300 · bhagat singh hat 720 (#14–19)
 * Annual-function season runs Nov–Feb, then Republic Day (Tue 26 Jan 2027).
 *
 * Every product description was written against its primary photo (checked 4 Nov).
 * Corrections found on the way:
 *  - bhagat-singh-cap: the meta said "yellow cap"; the photo is a black brimmed
 *    hat with a black-and-white checked band.
 *  - green-bharatnatyam-fancy-dress: sold as "emerald green"; the photo is green
 *    AND red (red drape and trousers, green blouse and fan).
 *  - orange / pink Bharatnatyam: "temple jewellery detailing" / "gold zari border";
 *    the borders are purple-and-gold and the jewellery is styling.
 *  - Radha kids lehengas had template copy ("devotional hues") and no alt text.
 *  - Odissi had no visual description at all; it is magenta with a
 *    purple-and-gold border and a silver-toned belt.
 *  - freedom-fighter-fancy-dress-ideas promised "a complete Bhagat Singh turban
 *    set" and "a Dr Ambedkar blazer with a Constitution prop"; we sell neither.
 *  - republic-day-fancy-dress-ideas-kids dressed Netaji in "navy or khaki";
 *    ours is olive green.
 * Jewellery, ghungroo, swords and flutes seen in photos are described as
 * "in the photo", not as part of the set.
 *
 * There is no Odissi category, so the Odissi product carries "odissi costume /
 * dress" and Classical Dance Dress links it. The six Bharatnatyam colours not yet
 * in Classical Dance Dress are attached (additive), and the adult Radha (filed
 * only under mythology) is attached to Janmashtami Dress.
 *
 * Dry run:  npx tsx scripts/followups/classical-radha-republic-2026-11.ts
 * Apply:    npx tsx scripts/followups/classical-radha-republic-2026-11.ts --apply
 */
import {
  assertCopy,
  assertLinks,
  attachProducts,
  fill,
  run,
  sb,
  updateCategory,
  updateProduct,
  upsertPost,
  wordCount,
  type Catalog,
} from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
let pass = 0

type Page = { slug: string; seo_title: string; meta: string; alt: string; description: string }

const WHERE = 'at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR'

const PRODUCTS: Page[] = [
  {
    slug: 'odissi-fancy-dress',
    seo_title: 'Odissi Costume – Magenta Odissi Dress for Girls & Women',
    meta: 'Odissi costume in magenta with a purple-and-gold border, pleated front and silver-toned belt. Buy {{price:odissi-fancy-dress}} or rent in Delhi NCR for recitals.',
    alt: 'Odissi costume: magenta Odissi dress with purple-and-gold border, pleated front panel and silver-toned waist belt',
    description: `An Odissi costume in magenta with a purple-and-gold border: a short-sleeved blouse, a bordered drape that runs from the shoulder across the chest, and pyjama-style trousers with a pleated front panel that falls from the waist to the ankles and opens out in chowk. A silver-toned waist belt with hanging pendants and red tassels sits over the pleats. In the photos it is styled with silver jewellery, a white flower hair piece and ghungroo; WhatsApp us to check which pieces come with the set.

Odissi, the classical dance of Odisha, is asked for at dance academy recitals, the classical segment of school annual day, Odisha Day on 1 April and states-of-India programmes. This Odissi dress is listed in {{size:odissi-fancy-dress}} size, which also fits teenage girls; WhatsApp your height for a fit check. Buy it for {{price:odissi-fancy-dress}} or rent it per event with a refundable deposit, ${WHERE}. For Bharatanatyam, see our Bharatanatyam dresses in seven colours.`,
  },
  {
    slug: 'green-bharatnatyam-fancy-dress',
    seo_title: 'Green & Red Bharatanatyam Dress – Gold Border, Buy or Rent',
    meta: 'Green and red Bharatanatyam dress: green blouse and pleated fan, red drape and trousers, wide gold borders. Buy {{price:green-bharatnatyam-fancy-dress}} or rent in Delhi NCR.',
    alt: 'Green and red Bharatanatyam dress with gold borders: green blouse, red drape, green pleated fan and red trousers',
    description: `A green and red Bharatanatyam dress: a green blouse with gold-bordered sleeves, a red drape edged in gold across the chest, and red pyjama-style trousers with a green pleated fan that opens between the knees in araimandi, all finished with wide gold borders. In the photo it is worn with a gold waist belt and ghungroo; WhatsApp us to check which pieces come with the set.

It is listed in {{size:green-bharatnatyam-fancy-dress}} size, which fits teenage girls and women, for classical dance recitals, school annual day and inter-school competitions. Buy it for {{price:green-bharatnatyam-fancy-dress}} or rent it per event with a refundable deposit, ${WHERE}.`,
  },
  {
    slug: 'orange-bharatnatyam-fancy-dress',
    seo_title: 'Orange Bharatanatyam Dress – Purple & Gold Border',
    meta: 'Orange Bharatanatyam dress with purple-and-gold borders and a striped pleated fan, for recitals and annual day. Buy {{price:orange-bharatnatyam-fancy-dress}} or rent in Delhi NCR.',
    alt: 'Orange Bharatanatyam dress with purple-and-gold borders, orange drape and striped pleated fan',
    description: `An orange Bharatanatyam dress with purple-and-gold borders: an orange blouse with bordered sleeves, an orange drape edged in purple and gold across the chest, and orange trousers with a pleated fan striped in purple and gold that opens wide in araimandi. In the photo it is worn with a gold waist belt, jewellery and flowers in the hair; WhatsApp us to check which pieces come with the set.

It is listed in {{size:orange-bharatnatyam-fancy-dress}} size, which fits teenage girls and women, for classical dance recitals, inter-school competitions and school annual functions. Buy it for {{price:orange-bharatnatyam-fancy-dress}} or rent it per event with a refundable deposit, ${WHERE}.`,
  },
  {
    slug: 'pink-bharatnatyam-fancy-dress',
    seo_title: 'Pink Bharatanatyam Dress – Purple & Gold Border',
    meta: 'Pink Bharatanatyam dress with purple-and-gold borders, a pink drape and striped pleated front, for recitals and annual day. Buy {{price:pink-bharatnatyam-fancy-dress}} or rent in Delhi.',
    alt: 'Pink Bharatanatyam dress with purple-and-gold borders, pink drape and striped pleated front',
    description: `A pink Bharatanatyam dress with purple-and-gold borders: a pink blouse with bordered sleeves, a pink drape edged in purple and gold across the chest, a pleated front striped in pink, purple and gold, and pink trousers with bordered hems. In the photo it is worn with a gold waist belt, temple-style jewellery and a hair ornament; WhatsApp us to check which pieces come with the set.

It is listed in {{size:pink-bharatnatyam-fancy-dress}} size, which fits teenage girls and women, for classical dance recitals, school annual day and inter-school cultural events. Buy it for {{price:pink-bharatnatyam-fancy-dress}} or rent it per event with a refundable deposit, ${WHERE}.`,
  },
  {
    slug: 'radha-rani-lehenga-dress-pink-golden-fancy-dress',
    seo_title: 'Radha Rani Lehenga for Girls – Pink & Gold, Janmashtami',
    meta: 'Radha Rani lehenga for girls: pink lehenga with gold embroidery, green-and-gold border, pink choli and gold dupatta. Buy {{price:radha-rani-lehenga-dress-pink-golden-fancy-dress}} or rent in Delhi.',
    alt: 'Radha Rani lehenga for girls: pink lehenga with gold vine embroidery, green-and-gold border, pink choli and gold net dupatta',
    description: `A Radha Rani lehenga for girls in pink and gold: a full-length pink lehenga embroidered all over with gold vines and flowers, finished with a wide green-and-gold border at the hem, a matching pink choli with green-and-gold trim, a gold waistband and a gold net dupatta worn over the head. In the photo it is styled with a maang tikka, earrings and gold bangles; WhatsApp us to add jewellery.

Choose it for Janmashtami school programmes, Radha Krishna jhanki, Raas Leela dance items and mythology fancy dress competitions, and pair it with one of our Krishna dresses for a matching pair. WhatsApp your child's age to check the size. Buy it for {{price:radha-rani-lehenga-dress-pink-golden-fancy-dress}} or rent it per event with a refundable deposit, ${WHERE}.`,
  },
  {
    slug: 'radha-rani-lehenga-choli-fancy-dress',
    seo_title: 'Radha Rani Lehenga Choli for Girls – Royal Blue & Gold',
    meta: 'Radha Rani lehenga choli for girls: royal blue lehenga with gold floral embroidery, gold border, blue choli and gold dupatta. Buy {{price:radha-rani-lehenga-choli-fancy-dress}} or rent.',
    alt: 'Radha Rani lehenga choli for girls: royal blue lehenga with gold floral embroidery, wide gold border, blue choli and gold net dupatta',
    description: `A Radha Rani lehenga choli for girls in royal blue and gold: a flared blue lehenga embroidered with gold vines and pink-and-gold flowers, a wide sequinned gold border at the hem, a matching blue choli with pink-trimmed sleeves and a gold net dupatta with a gold lace edge, draped over the head and across the front. In the photo it is styled with a maang tikka, a necklace and stacked gold bangles; WhatsApp us to add jewellery.

It suits Janmashtami school programmes, Radha Krishna jhanki, Raas Leela dances and mythology fancy dress, and the blue looks striking next to a yellow Krishna dress. WhatsApp your child's age to check the size. Buy it for {{price:radha-rani-lehenga-choli-fancy-dress}} or rent it per event with a refundable deposit, ${WHERE}.`,
  },
  {
    slug: 'radha-rani-dress-kids-fancy-dress',
    seo_title: 'Radha Rani Dress for Kids – Gold Lehenga & Red Choli',
    meta: 'Radha Rani dress for kids: gold net lehenga with a red-and-gold border, red embroidered choli and gold dupatta. Buy {{price:radha-rani-dress-kids-fancy-dress}} or rent in Delhi NCR.',
    alt: 'Radha Rani dress for kids: gold net lehenga with red-and-gold border, red embroidered choli, gold waistband and gold net dupatta',
    description: `A Radha Rani dress for kids: a full-flare gold net lehenga with a red border edged in gold lace, a red choli embroidered with gold thread, a gold waistband with a centre motif, and a gold net dupatta bordered in red, worn over the head. In the photo it is styled with a pearl necklace, maang tikka and bangles; WhatsApp us to add jewellery.

Choose it for Janmashtami school programmes, Radha Krishna jhanki, Raas Leela dance items and mythology fancy dress competitions, and pair it with one of our Krishna dresses for a brother-and-sister or class pair. WhatsApp your child's age to check the size. Buy it for {{price:radha-rani-dress-kids-fancy-dress}} or rent it per event with a refundable deposit, ${WHERE}.`,
  },
  {
    slug: 'bhagat-singh-cap',
    seo_title: 'Bhagat Singh Cap / Hat – Black Hat for Fancy Dress',
    meta: 'Bhagat Singh cap (hat) for fancy dress: black brimmed hat with a black-and-white checked band, for Republic Day. Buy {{price:bhagat-singh-cap}} or rent in Delhi NCR.',
    alt: 'Bhagat Singh cap / hat: black brimmed fancy dress hat with a black-and-white checked band',
    description: `A Bhagat Singh cap for fancy dress: a black hat with a short brim and a black-and-white checked band, in the style of the hat Bhagat Singh wears in his best-known photograph. Put it on with a white shirt or kurta, draw a thin moustache, and your child is ready to raise a fist and say "Inquilab Zindabad!"

The hat is sold on its own, so the rest of the look comes from clothes you already have, which makes it a quick, low-cost pick for 26 January Republic Day, 23 March Shaheed Diwas, 28 September (Bhagat Singh's birth anniversary), 15 August Independence Day and freedom-fighter fancy dress competitions. WhatsApp us to check the fit. Buy it for {{price:bhagat-singh-cap}} or rent it per event with a refundable deposit, ${WHERE}. More leader costumes are in freedom fighters and leaders.`,
  },
]

// ---------------------------------------------------------------- blogs

const REPUBLIC_KIDS = `Republic Day 2027 falls on Tuesday, 26 January. It is India's 78th Republic Day, marking the day in 1950 when the Constitution of India came into force. Schools hold their fancy dress competitions and patriotic programmes in the days around it, and rehearsals usually start in mid-December. Here are the costume ideas that work best on the school stage, what each one looks like, and a line your child can say.

## Key dates for Republic Day 2027

- **Saturday 23 January, Parakram Diwas:** Netaji Subhash Chandra Bose's birth anniversary. Many schools fold it into their Republic Day programme.
- **Tuesday 26 January, Republic Day:** the Constitution came into force on this day in 1950. Dr B.R. Ambedkar chaired the committee that drafted it.
- **Saturday 30 January, Martyrs' Day:** Mahatma Gandhi's death anniversary.
- Many Delhi schools close for a winter break in early January, so settle the costume in December.

## Freedom fighter and leader costumes for boys

- [Subhash Chandra Bose](/products/subhash-chandra-bose-fancy-dress): an olive green INA uniform with a four-pocket jacket, trousers and a side cap. Line to say: "Give me blood, and I will give you freedom!"
- [Mahatma Gandhi](/products/mahatma-gandhi-fancy-dress-costume): a white dhoti, a white shawl, a bald cap and round glasses. It is the easiest costume for the youngest children. Line to say: "Truth and non-violence are my weapons."
- [Jawaharlal Nehru](/products/jawahar-lal-nehru-fancy-dress): a navy Nehru jacket over a white kurta-pyjama, a white cap and a red rose. Line to say: "At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom."
- [Mangal Pandey](/products/mangal-pandey-fancy-dress): a red sepoy jacket with gold braid, black trousers and a tall red-and-black cap, for the story of 1857.
- Bhagat Singh: our [Bhagat Singh hat](/products/bhagat-singh-cap) is a black brimmed hat, the style from his best-known photograph. Add a white shirt or kurta and a drawn-on moustache. Line to say: "Inquilab Zindabad!"
- [Indian Army soldier](/products/army-fancy-dress-costume-kargil-print): a camouflage-print uniform shirt with pockets, a belt and trousers, for "our heroes" themes and soldier group dances.

## Freedom fighter and leader costumes for girls

- [Rani Laxmi Bai](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume): a red and gold warrior outfit with a dhoti-style drape, a gold waist sash and a red pagdi. The photo shows it with a sword and shield; ask us to add them. Line to say: "Main apni Jhansi nahi doongi!"
- [Bharat Mata](/products/bharat-mata-fancy-dress-costume): a white saree with a saffron-and-green border, a gold crown and a hand-held flag. Line to say: "I am Bharat Mata. Keep me united and keep me strong."
- [Indira Gandhi](/products/indira-gandhi-fancy-dress-costume): a white saree with a red border and a grey streak in the hair. Line to say: "I am Indira Gandhi, India's first woman Prime Minister."

Every leader we stock is in [Freedom Fighters & Leaders](/category/leaders-freedom-fighters), and our [freedom fighter fancy dress ideas](/blog/freedom-fighter-fancy-dress-ideas) post has longer speeches for each.

## Dr Ambedkar for Republic Day

Republic Day celebrates the Constitution, so Dr B.R. Ambedkar is one of the strongest choices for a speech competition. We do not stock an Ambedkar costume, and you do not need one: a blue blazer, a white shirt and tie, round glasses and a home-made Constitution book are enough. Our [Ambedkar fancy dress speech](/blog/ambedkar-fancy-dress-speech) guide shows the full look, with speeches by age and in Hindi.

## The tricolour theme

For children who want something simpler, an outfit in saffron, white and green, the colours of the Indian flag, needs no explanation. Our [tiranga dress](/products/tiranga-color-costume-for-boys-girls-fancy-dress) is made for both girls and boys, so a class can do a tricolour group dance in matching sets. A white kurta-pyjama with a tricolour dupatta or sash also works and is comfortable for long functions. More looks are in [Republic Day dress](/category/republic-day-dress).

## Indian states and folk costumes

Many schools use Republic Day to celebrate India's cultural diversity. A [Rajasthani dress](/category/rajasthani-dress), a [Kashmiri dress](/category/kashmiri-dress), a [Bharatanatyam dress](/category/bharatnatyam) or a [Garba outfit](/category/garba-dress) is always well received, and group items where each child represents a different state look spectacular on stage. See all of them in [state fancy dress](/category/states-fancy-dress).

## Tips for Republic Day costumes

- Book by mid-December. January is peak season and the popular leaders go first.
- Keep your child warm. 26 January mornings in North India are cold, so put a thin warm layer under the costume for outdoor functions.
- Confirm the theme with the school first. Some ask for freedom fighters, others for Indian states or national symbols.
- Match the line to the costume. Judges notice when the words and the look agree.

## Buy or rent in Delhi NCR

Every costume linked here can be rented per event with a refundable deposit, or bought, at our Krishna Nagar shop in East Delhi, with delivery across Delhi NCR. For a class or house group, see [bulk orders for schools](/wholesale/schools) or WhatsApp us the count and sizes. The same ideas are also available [in Hindi](/blog/republic-day-fancy-dress-hindi).`

type Fix = [from: string, to: string]

/** Ordered find/replace on a live post; every `from` must occur exactly once. */
async function patchPost(cat: Catalog, slug: string, fixes: Fix[], meta?: { title: string; excerpt: string }) {
  console.log(`\n--- blog (patch): ${slug}`)
  const { data: post, error } = await sb.from('blog_posts').select('id, content, published_at').eq('slug', slug).single()
  if (error) throw new Error(`${slug}: ${error.message}`)
  const p = post as { id: string; content: string; published_at: string | null }
  if (!p.published_at) throw new Error(`${slug}: unpublished`)
  let content = p.content
  for (const [from, to] of fixes) {
    const n = content.split(from).length - 1
    if (n !== 1) throw new Error(`${slug}: expected 1 match, found ${n}: ${from.slice(0, 70)}`)
    content = content.replace(from, () => to)
  }
  content = fill(cat, content)
  const links = assertLinks(cat, content)
  console.log(`   ${fixes.length} edits | words ${wordCount(p.content)} → ${wordCount(content)} | product links ${links.products} | category links ${links.categories}`)
  const update: Record<string, string> = { content }
  if (meta) {
    assertCopy(slug, meta.title, meta.excerpt)
    console.log(`   title: ${meta.title}\n   excerpt: ${meta.excerpt}`)
    Object.assign(update, meta)
  }
  if (APPLY && pass === 2) {
    const { error: e } = await sb.from('blog_posts').update(update).eq('id', p.id)
    console.log(e ? `   ❌ ${e.message}` : '   ✅ updated')
  }
}

const FREEDOM_FIXES: Fix[] = [
  [
    'short speeches your child can actually remember on stage.',
    'short speeches your child can actually remember on stage.\n\nRepublic Day 2027 falls on Tuesday, 26 January, the 78th since the Constitution came into force in 1950. Most schools rehearse from mid-December, so settle the character and the speech before the winter break.',
  ],
  ['**Why freedom fighter themes are so popular**', '## Why freedom fighter themes are so popular'],
  ['under [Leaders and Freedom Fighters](/category/leaders-freedom-fighters)', 'under [Freedom Fighters & Leaders](/category/leaders-freedom-fighters)'],
  ['**Bhagat Singh**\n\n', '## Bhagat Singh\n\n'],
  [
    'Bhagat Singh is the most requested costume for boys. The look is instantly recognisable: a yellow or mustard turban, a kurta, a thick moustache, and ideally a toy pistol or a book to hold. Keep the posture upright and proud.',
    'Bhagat Singh is the most requested costume for boys, and judges recognise two looks. The first is the hat from his best-known photograph: our [Bhagat Singh hat](/products/bhagat-singh-cap) is a black brimmed hat, worn with a white shirt or kurta and a thin moustache. The second is a yellow or mustard turban with a kurta. Either way, a book to hold suits him, since he was a keen reader. Keep the posture upright and proud.',
  ],
  ['**Subhash Chandra Bose (Netaji)**', '## Subhash Chandra Bose (Netaji)'],
  [
    'You need a military-style uniform or a dark coat, a round cap, and round spectacles. A confident salute on entry always gets applause.',
    'Our [Subhash Chandra Bose dress](/products/subhash-chandra-bose-fancy-dress) is an olive green INA uniform: a four-pocket jacket with shoulder straps, trousers and a side cap. Add round spectacles and black shoes. A confident salute on entry always gets applause, and his birth anniversary, Parakram Diwas on 23 January, falls just before Republic Day.',
  ],
  ['**Dr B. R. Ambedkar**', '## Dr B. R. Ambedkar'],
  [
    'a book or a copy of the Constitution to hold.',
    'a book or a copy of the Constitution to hold. We do not stock an Ambedkar costume, but our [Ambedkar fancy dress speech](/blog/ambedkar-fancy-dress-speech) guide shows how to put the look together at home, with speeches by age and in Hindi.',
  ],
  ['**Other leaders worth considering**', '## Other leaders worth considering'],
  [
    'Speech around truth and non-violence.',
    'Speech around truth and non-violence. See our [Mahatma Gandhi dress](/products/mahatma-gandhi-fancy-dress-costume).',
  ],
  [
    '- **Jawaharlal Nehru** — a white achkan with a red rose on the chest and a Gandhi cap. Easy to assemble.',
    '- **Jawaharlal Nehru** — a white kurta-pyjama, a Nehru jacket with a red rose on the chest and a white cap. Our [Jawaharlal Nehru dress](/products/jawahar-lal-nehru-fancy-dress) has a navy jacket.',
  ],
  [
    '"Main apni Jhansi nahi doongi!"',
    '"Main apni Jhansi nahi doongi!" Our [Rani Laxmi Bai dress](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume) is red and gold with a red pagdi.',
  ],
  [
    '- **Bharat Mata** — a saffron saree with a tricolour flag, popular for group entries and patriotic songs.',
    '- **Bharat Mata** — a saree in the tricolour with a crown and a flag, popular for group entries and patriotic songs. Our [Bharat Mata dress](/products/bharat-mata-fancy-dress-costume) is a white saree with a saffron-and-green border.',
  ],
  [
    'ideal for girls who prefer speaking to action poses.',
    'ideal for girls who prefer speaking to action poses.\n- **Indira Gandhi** — a white saree with a red border and a grey streak in the hair. See our [Indira Gandhi costume](/products/indira-gandhi-fancy-dress-costume).\n- **Mangal Pandey** — the sepoy whose stand in 1857 began the revolt, in a red jacket and a tall cap. See our [Mangal Pandey dress](/products/mangal-pandey-fancy-dress).\n- **An Indian Army soldier** — not one leader but every soldier, a favourite for Republic Day. See our [army dress](/products/army-fancy-dress-costume-kargil-print).',
  ],
  ['**Three tips that win competitions**', '## Three tips that win competitions'],
  ['1. **Match the props', '- **Match the props'],
  ['2. **Keep the speech', '- **Keep the speech'],
  ['3. **Practise the entry', '- **Practise the entry'],
  ['**Rent or buy?**', '## Rent or buy?'],
  [
    'Whether you want a complete Bhagat Singh turban set, a Subhash Chandra Bose uniform, or a Dr Ambedkar blazer with a Constitution prop, you will find it in our [Leaders and Freedom Fighters collection](/category/leaders-freedom-fighters).',
    'Whether you want a Bhagat Singh hat, a Subhash Chandra Bose uniform or a Rani Laxmi Bai dress, you will find it in our [Freedom Fighters & Leaders collection](/category/leaders-freedom-fighters), with tricolour looks in [Republic Day dress](/category/republic-day-dress) and more ideas in [Republic Day fancy dress ideas for kids](/blog/republic-day-fancy-dress-ideas-kids).',
  ],
]

const HINDI_FIXES: Fix[] = [
  [
    'तो आइए देखते हैं सबसे अच्छे आइडियाज।',
    'तो आइए देखते हैं सबसे अच्छे आइडियाज।\n\nइस बार 26 जनवरी 2027 को मंगलवार है और यह भारत का 78वां गणतंत्र दिवस है। इसी दिन 1950 में हमारा संविधान लागू हुआ था। ज़्यादातर स्कूल दिसंबर के बीच से रिहर्सल शुरू कर देते हैं, इसलिए ड्रेस दिसंबर में ही तय कर लें।',
  ],
  [
    'हर जज और हर बच्चा इसे जानता है।',
    'हर जज और हर बच्चा इसे जानता है। हमारी [गांधी जी की ड्रेस](/products/mahatma-gandhi-fancy-dress-costume) में धोती, शॉल, गंजी टोपी और गोल चश्मा है।',
  ],
  [
    'बहादुर दिखते हैं और स्टेज पर बहुत अच्छा इम्प्रेशन पड़ता है।',
    'बहादुर दिखते हैं और स्टेज पर बहुत अच्छा इम्प्रेशन पड़ता है। हमारी काली [भगत सिंह हैट](/products/bhagat-singh-cap) अलग से मिलती है, बाकी कपड़े घर से पूरे हो जाते हैं।',
  ],
  [
    'स्टेज पर बेहद ड्रामैटिक और यादगार लगता है।',
    'स्टेज पर बेहद ड्रामैटिक और यादगार लगता है। हमारी [रानी लक्ष्मी बाई ड्रेस](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume) लाल-सुनहरी है, साथ में लाल पगड़ी; फोटो में दिख रही तलवार और ढाल के लिए WhatsApp करें।',
  ],
  [
    '**सुभाष चंद्र बोस:** मिलिट्री स्टाइल यूनिफॉर्म कैप के साथ — आत्मविश्वासी स्पीच देने वाले बच्चों के लिए बेस्ट।',
    '**सुभाष चंद्र बोस:** आज़ाद हिंद फौज जैसी ऑलिव ग्रीन यूनिफॉर्म और साइड कैप — आत्मविश्वासी स्पीच देने वाले बच्चों के लिए बेस्ट। 23 जनवरी को नेताजी की जयंती (पराक्रम दिवस) भी है। देखें हमारी [सुभाष चंद्र बोस ड्रेस](/products/subhash-chandra-bose-fancy-dress)।',
  ],
  [
    'राजस्थानी ड्रेस, कश्मीरी पोशाक, पंजाबी भांगड़ा सूट,',
    '[राजस्थानी ड्रेस](/category/rajasthani-dress), [कश्मीरी पोशाक](/category/kashmiri-dress), [पंजाबी भांगड़ा सूट](/category/bhangra-dress),',
  ],
  [
    '## ध्यान दें',
    `## और किरदार

- [भारत माता](/products/bharat-mata-fancy-dress-costume): तिरंगे बॉर्डर वाली सफेद साड़ी, सुनहरा मुकुट और हाथ में झंडा।
- [इंदिरा गांधी](/products/indira-gandhi-fancy-dress-costume): लाल बॉर्डर वाली सफेद साड़ी और बालों में सफेद लट।
- [जवाहरलाल नेहरू](/products/jawahar-lal-nehru-fancy-dress): सफेद कुर्ता-पाजामा पर नेवी नेहरू जैकेट, सफेद टोपी और लाल गुलाब।
- [मंगल पांडे](/products/mangal-pandey-fancy-dress): सुनहरी पट्टियों वाली लाल सिपाही जैकेट, काली पैंट और लंबी लाल-काली टोपी।
- [भारतीय सेना की ड्रेस](/products/army-fancy-dress-costume-kargil-print): कैमोफ्लाज प्रिंट वाली यूनिफॉर्म और बेल्ट।
- डॉ. अंबेडकर: गणतंत्र दिवस संविधान का दिन है, इसलिए यह बढ़िया किरदार है। ड्रेस और स्पीच के लिए हमारी [अंबेडकर फैंसी ड्रेस स्पीच](/blog/ambedkar-fancy-dress-speech) गाइड पढ़ें।

सभी नेताओं की ड्रेस [स्वतंत्रता सेनानी और नेता](/category/leaders-freedom-fighters) में और तिरंगा ड्रेस [गणतंत्र दिवस ड्रेस](/category/republic-day-dress) में मिलेंगी।

## ध्यान दें`,
  ],
  [
    'हम Mod Fancy Dress, कृष्णा नगर दिल्ली में सभी गणतंत्र दिवस कॉस्टयूम स्टॉक करते हैं। स्कूल बल्क ऑर्डर पर स्पेशल रेट मिलता है।',
    'हम Mod Fancy Dress, कृष्णा नगर (पूर्वी दिल्ली) में गणतंत्र दिवस की ड्रेस किराए पर और खरीदने के लिए रखते हैं, और पूरे दिल्ली NCR में डिलीवरी करते हैं। स्कूल बल्क ऑर्डर के लिए [स्कूल ऑर्डर](/wholesale/schools) पेज देखें। अंग्रेज़ी में और आइडियाज के लिए [Republic Day fancy dress ideas](/blog/republic-day-fancy-dress-ideas-kids) पढ़ें।',
  ],
]

run(async (cat) => {
  pass++

  // ---- Bharatanatyam
  await updateCategory(cat, {
    slug: 'bharatnatyam',
    name: 'Bharatanatyam Dress',
    seo_title: 'Bharatanatyam Dress for Kids & Girls – Buy or Rent in Delhi',
    meta_description:
      'Bharatanatyam dress for kids, girls and women: stitched costume with pleated fan in 7 colours. Buy {{price:bharatnatyam-fancy-dress}} or rent in Delhi NCR for recitals.',
    description:
      'Bharatanatyam dress for kids, girls and women, to buy or rent in Delhi for classical dance recitals, school annual day and inter-school competitions. Each Bharatnatyam costume is a stitched set: a blouse, a bordered drape across the chest, and pyjama-style trousers with a pleated fan that opens between the knees in araimandi. Choose from [red and white](/products/bharatnatyam-fancy-dress), [green and red](/products/green-bharatnatyam-fancy-dress) and [yellow and red](/products/yellow-and-red-bharatnatyam-fancy-dress) with wide gold borders; [magenta](/products/magenta-bharatnatyam-fancy-dress), [orange](/products/orange-bharatnatyam-fancy-dress) and [pink](/products/pink-bharatnatyam-fancy-dress) with purple-and-gold borders; or [green and orange](/products/green-orange-bharatnatyam-fancy-dress) with a striped pleated front. In the photos the dancers wear a gold waist belt, temple-style jewellery and ghungroo, so ask on WhatsApp which pieces come with each set. Most colours are listed in adult size, which fits teenage girls; magenta is also in {{size:magenta-bharatnatyam-fancy-dress}}, so for a younger child WhatsApp her age and height and we will check what fits. Every colour costs {{price:bharatnatyam-fancy-dress}} to buy, or rent it per event with a refundable deposit, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. For a school or academy group we can match one colour across sizes through [bulk orders for schools](/wholesale/schools). For Odissi and Kathak, see [classical dance dress](/category/classical-dance-dress).',
  })

  // ---- Classical dance: carries Odissi
  await attachProducts(cat, 'classical-dance-dress', [
    'bharatnatyam-fancy-dress',
    'green-bharatnatyam-fancy-dress',
    'yellow-and-red-bharatnatyam-fancy-dress',
    'orange-bharatnatyam-fancy-dress',
    'pink-bharatnatyam-fancy-dress',
    'green-orange-bharatnatyam-fancy-dress',
  ])
  await updateCategory(cat, {
    slug: 'classical-dance-dress',
    seo_title: 'Classical Dance Costume – Bharatanatyam, Odissi & Kathak',
    meta_description:
      'Classical dance costumes in Delhi: Bharatanatyam in 7 colours, a magenta Odissi costume and Kathak dresses. Buy from {{price:kathak-fancy-dress}} or rent per event.',
    description:
      'Classical dance costumes to buy or rent in Delhi: Bharatanatyam, Odissi and Kathak dresses for recitals, school annual day and inter-school competitions, from our shop in Krishna Nagar, with rent per event plus a refundable deposit. Which classical dance costume is right for your child? Start with the teacher\'s note, because each form has its own silhouette. A [Bharatanatyam dress](/category/bharatnatyam) is a stitched costume with a pleated fan that opens between the knees in araimandi; ours comes in seven colours with gold or purple-and-gold borders. Our [Odissi costume](/products/odissi-fancy-dress) is magenta with a purple-and-gold border, a pleated front panel that falls to the ankles and a silver-toned waist belt with red tassels. [Kathak](/category/kathak-dress) is a flared anarkali over churidar, or a lehenga with a net dupatta over the head; look for a skirt that opens into a full circle on the spin. For Kerala classical items there are [Mohiniyattam](/category/mohiniyattam-dress) costumes too. Some schools want only a simple practice set, others want full jewellery and hair pieces, so WhatsApp us a photo of the dress-code note and we will shortlist what fits it. If your child is between sizes, go one size up: a slightly loose costume can be pinned, a tight one restricts the footwork. Rent for a single recital, or buy if the child performs every season, with delivery across Delhi NCR.',
  })

  // ---- Janmashtami / Radha Rani lehenga
  await attachProducts(cat, 'janmashtami-dress', ['radha-rani-fancy-dress'])
  await updateCategory(cat, {
    slug: 'janmashtami-dress',
    seo_title: 'Janmashtami Dress – Krishna Dress & Radha Rani Lehenga',
    meta_description:
      'Janmashtami dress for kids: Krishna dhoti sets with mukut and Radha Rani lehengas for girls, plus an adult Radha Krishna pair. Buy from {{price:krishna-fancy-dress-kid}} or rent.',
    description:
      'Janmashtami dress for kids and adults, for school Janmashtami celebrations, Radha Krishna jhanki, Raas Leela dance items and Krishna Leela plays. For boys there are Krishna dresses built around a yellow dhoti: a Bal Krishna set for toddlers in {{size:krishna-fancy-dress-kid}} from {{price:krishna-fancy-dress-kid}}, a yellow polka-dot dress, a green-print dress, a yellow dhoti kurta, and blue-and-yellow and pink-and-yellow sets with embroidered tops and a mukut. For girls, the Radha Rani lehenga comes in three looks, each with a gold net dupatta: [pink with gold embroidery and a green border](/products/radha-rani-lehenga-dress-pink-golden-fancy-dress), [royal blue and gold](/products/radha-rani-lehenga-choli-fancy-dress), and [gold net with a red choli](/products/radha-rani-dress-kids-fancy-dress), all at {{price:radha-rani-dress-kids-fancy-dress}}. For college events, temple programmes and adult couples there is a matching [Radha](/products/radha-rani-fancy-dress) and [Krishna](/products/krishna-fancy-dress) pair in maroon velvet and yellow sequinned net, and a Raja Krishna costume with a flower crown. Peacock-feather mukuts and flutes appear in many photos, so ask on WhatsApp which come with each set. Rent per event with a refundable deposit, or buy, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR, and book matching Radha Krishna sets for a class early. Our [Janmashtami Krishna dress guide](/blog/janmashtami-krishna-dress-guide) has more styling tips.',
  })

  // ---- Products (title, meta, body) + primary alt
  for (const p of PRODUCTS) {
    await updateProduct(cat, { slug: p.slug, seo_title: p.seo_title, meta_description: p.meta, description: p.description })
  }
  console.log('\n--- primary alt text')
  for (const p of PRODUCTS) {
    const live = cat.products.get(p.slug)!
    const { data: imgs, error } = await sb.from('product_images').select('id, alt_text, is_primary').eq('product_id', live.id)
    if (error) throw new Error(error.message)
    const primary = (imgs ?? []).find((i) => i.is_primary) ?? imgs?.[0]
    if (!primary) throw new Error(`${p.slug}: no image`)
    if (pass === 1) console.log(`   ${p.slug}: "${primary.alt_text}" → "${p.alt}"`)
    if (APPLY && pass === 2) {
      const { error: e } = await sb.from('product_images').update({ alt_text: p.alt }).eq('id', primary.id)
      console.log(e ? `   ❌ ${p.slug}: ${e.message}` : `   ✅ ${p.slug} alt written`)
    }
  }

  // ---- Republic Day blogs
  await upsertPost(cat, {
    slug: 'republic-day-fancy-dress-ideas-kids',
    title: 'Republic Day Fancy Dress Ideas for Kids – 26 January 2027',
    excerpt:
      'Republic Day fancy dress ideas for kids for 26 January 2027: Netaji, Gandhi, Bharat Mata, Rani Laxmi Bai, soldiers and tiranga looks, with a line to say.',
    content: REPUBLIC_KIDS,
  })
  await patchPost(cat, 'freedom-fighter-fancy-dress-ideas', FREEDOM_FIXES, {
    title: 'Freedom Fighters Fancy Dress Ideas & Speeches for Kids',
    excerpt:
      'Freedom fighter fancy dress ideas with costumes and short speeches for Bhagat Singh, Subhash Chandra Bose and Dr Ambedkar for school events.',
  })
  await patchPost(cat, 'republic-day-fancy-dress-hindi', HINDI_FIXES)

  if (APPLY && pass === 2) {
    await revalidateSite('catalog')
    await revalidateSite('content')
  }
})
