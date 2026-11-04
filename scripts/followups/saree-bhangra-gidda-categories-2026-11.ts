/**
 * Kids saree, Bhangra and Gidda categories (4 Nov 2026).
 *
 * Semrush: "fancy dress competition saree" 1,300 (#12, through a single printed-saree
 * product), "saree fancy dress" 170 (#13 product, #44 category); "bhangra dress"
 * 880 (#15, an adult product ranks, not the category); "punjabi dance costume"
 * 480 split across two products and the category (#59/#83/#96).
 *
 * Photos checked 4 Nov:
 *  - The boys' Bhangra sets (blue-yellow, orange) sat only under Folk Dance, so the
 *    Bhangra category was missing its best kids' costumes. Attached, with the four
 *    safa colours so a parent can complete the look on one page.
 *  - The two "Bhangra Suit" products are girls' red Punjabi salwar suits with a
 *    dupatta (a Gidda look); they also go into the Gidda category, as does the red
 *    and blue Punjabi folk dance suit for girls. Attachments are additive.
 *
 * Dry run:  npx tsx scripts/followups/saree-bhangra-gidda-categories-2026-11.ts
 * Apply:    npx tsx scripts/followups/saree-bhangra-gidda-categories-2026-11.ts --apply
 */
import { run, updateCategory, attachProducts } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
let pass = 0

run(async (cat) => {
  pass++

  await attachProducts(cat, 'bhangra-dress', [
    'bhangra-dance-fancy-dress-costume-blue-yellow',
    'bhangra-dance-costume-for-boys-orange-fancy-dress',
    'sikh-punjabi-safa-pagadi-orange-fancy-dress',
    'sikh-punjabi-safa-red-fancy-dress',
    'sikh-punjabi-safa-pagadi-yellow-fancy-dress',
    'sikh-punjabi-safa-pagadi-black-fancy-dress',
  ])
  await attachProducts(cat, 'gidda-dress', [
    'bhangra-suit-fancy-dress',
    'bhangra-suit-for-adult-fancy-dress',
    'punjabi-folk-dance-fancy-dress-costume',
  ])

  await updateCategory(cat, {
    slug: 'kids-saree',
    seo_title: 'Saree Fancy Dress for Girls – Kids Saree Costumes',
    meta_description:
      'Saree fancy dress for girls: ready-to-wear kids sarees: Bengali, Assamese, white-red, pink, blue, printed. Rent from ₹250 or buy from ₹375, Delhi.',
    description:
      'Saree fancy dress for girls, ready to wear so there is no draping on the morning of the event. Choose a white saree with a red border or a Bengali saree for a Bengali or Durga Puja look, a Bihu saree or mekhela chador for Assam, an Indian folk saree for states-of-India themes, or a simple pink, blue-with-golden-border or printed saree for teacher, mother or "Indian culture" roles. A kids saree is the go-to costume for fancy dress competitions on women leaders, Teachers\' Day, grandparents\' day skits and school annual functions, and it photographs beautifully on stage. Rent from ₹250 per event with a refundable deposit, or buy from ₹375, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. For leader looks in a saree, see [Indira Gandhi](/products/indira-gandhi-fancy-dress-costume) and [Bharat Mata](/products/bharat-mata-fancy-dress-costume).',
  })

  await updateCategory(cat, {
    slug: 'bhangra-dress',
    seo_title: 'Bhangra Dress for Boys & Men – Bhangra Costume on Rent',
    meta_description:
      'Bhangra dress for boys and men: kurta, jacket, tehmat, turla pagri and ramals, plus safas. Rent from ₹250 or buy from ₹1,000 in Delhi NCR.',
    description:
      'Bhangra dress for boys and men, for Lohri, Baisakhi, school annual functions and Punjabi folk dance competitions. The full Bhangra costume comes as a white kurta with an embroidered green jacket, a green tehmat, the fan-topped turla pagri and the ramal handkerchiefs dancers swing on stage, in a kids\' size and a men\'s size. For boys there are also a yellow kurta with a navy jacket and blue patiala salwar, and an orange kurta with a green jacket and green dhoti, both with a matching turban. Sikh safas in orange, red, yellow and black complete a look on their own. For the girls in a Bhangra-Gidda pair dance, see [Gidda dress](/category/gidda-dress). Rent from ₹250 per event with a refundable deposit, or buy a full costume from ₹1,000, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. Doing a group Bhangra for Lohri? Send the number of boys and their sizes on WhatsApp.',
  })

  await updateCategory(cat, {
    slug: 'gidda-dress',
    seo_title: 'Gidda Dress for Girls – Punjabi Dance Suit Costume',
    meta_description:
      'Gidda dress for girls: Punjabi salwar suits with patiala and dupatta in red, orange, pink and blue for Lohri and folk dance. Rent from ₹250, Delhi NCR.',
    description:
      'Gidda dress for girls and women, the Punjabi folk dance costume for Lohri, Baisakhi, school annual functions and Bhangra-Gidda pair items. Choose a red Punjabi salwar suit with a gold-trimmed kurta and net dupatta (in girls\' and adult sizes), an orange Giddha suit with matching patiala, a pink kurta with blue patiala and dupatta, or a red and blue Punjabi folk dance suit. Bright colours, wide patiala salwars and a dupatta that frames the face make the Gidda look stand out in a group. Rent from ₹250 per event with a refundable deposit, or buy, at our Krishna Nagar shop in East Delhi with delivery across Delhi NCR. For the boys, see [Bhangra dress](/category/bhangra-dress).',
  })

  if (APPLY && pass === 2) await revalidateSite('catalog')
})
