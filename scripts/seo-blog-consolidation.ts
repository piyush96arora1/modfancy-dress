/**
 * Blog consolidation from docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md
 * (Task 13 step 3 and Task 17 step 2).
 *
 * Annual function (English): two posts competed for the same queries.
 *   keep   fancy-dress-ideas-school-annual-function  (614 words, ten ideas)
 *   fold   school-annual-function-fancy-dress-guide  (123 words; its timing and
 *          theme advice is merged into the keeper) -> unpublished, 301 to keeper
 *   The keeper is expanded to ~1,000 words with product and category links and
 *   prices read from the DB. The Hindi sibling
 *   school-annual-function-fancy-dress-ideas-hindi stays as it is (1,084
 *   impressions in 90 days), apart from its excerpt.
 *
 * Classical dance: which-classical-dance-costume-for-your-child (105 words) is
 *   folded into /category/classical-dance-dress by scripts/seo-kathak-dance-hub.ts
 *   -> unpublished here, 301 to /category/classical-dance-dress.
 *
 * Republic Day: republic-independence-day-fancy-dress-ideas (77 impressions) is
 *   folded into independence-day-fancy-dress-ideas (14,217) as a "Republic Day"
 *   section -> unpublished, 301 to independence-day-fancy-dress-ideas. The
 *   keeper's dead links to two soft-deleted products (Bhagat Singh costume,
 *   Subhas Chandra Bose costume) now point at the live Bhagat Singh cap and
 *   the live Bose costume.
 *
 * Excerpts double as the meta description, so the four over 160 characters are
 * cut to fit (how-to-choose-kathak-dance-costume, republic-day-fancy-dress-ideas-kids,
 * the Hindi annual-function post, and the annual-function keeper).
 *
 * Unpublishing sets published_at = null (the public read policy and every blog
 * query require it). The 301s go in redirects.json, which this script does not
 * touch. Every touched row gets updated_at = now().
 *
 * Dry run:  npx tsx scripts/seo-blog-consolidation.ts
 * Apply:    npx tsx scripts/seo-blog-consolidation.ts --apply
 */
import { META_MAX, META_MIN } from '../lib/seo/copy-limits'
import { APPLY, Catalog, Problems, banner, diff, fromPrices, loadCatalog, product, sb } from './lib/seo-copy-run'

const KEEP_ANNUAL = 'fancy-dress-ideas-school-annual-function'
const FOLD_ANNUAL = 'school-annual-function-fancy-dress-guide'
const FOLD_CLASSICAL = 'which-classical-dance-costume-for-your-child'
const KEEP_INDEPENDENCE = 'independence-day-fancy-dress-ideas'
const FOLD_REPUBLIC = 'republic-independence-day-fancy-dress-ideas'

function annualFunctionPost(cat: Catalog) {
  const kathak = fromPrices(cat, 'kathak-dress')
  const fruit = fromPrices(cat, 'fruit-costumes')
  const western = fromPrices(cat, 'western-dance-dress')
  const cartoon = fromPrices(cat, 'cartoon-characters')
  const whiteRed = product(cat, 'kathak-anarkali-fancy-dress-style-white-red')
  const content = [
    `Every year it is the same panic. The school sends home a note about the annual function, and suddenly you have a week to find a costume. We have dressed Delhi NCR children for these functions for over 15 years from our shop in Krishna Nagar, so here are ten ideas that actually work on stage — they read from the back row, survive a long evening backstage, and do not cost a fortune.`,
    `## When annual function season starts`,
    `Most Delhi schools hold their annual function between late November and February, with the busiest weeks in December and January. Rehearsals start three to four weeks before the day, and that is usually when the costume note comes home. Order at least a week ahead in peak season, and 10–15 days ahead if you want time for a fit check.`,
    `## Start with the theme`,
    `Read the note before you shop. Schools usually announce one of four things: a patriotic theme, a classical dance item, a folk or "Unity in Diversity" item, or a free fancy dress round. If it is open, pick a costume your child can walk, sit and wait in for two to three hours, because that is how long most annual functions keep children backstage.`,
    `## 1. Fruit or vegetable`,
    `This one never fails for the younger classes. A watermelon, mango or tomato costume is recognisable instantly, easy to move in, and light enough that nobody overheats under the stage lights. See [fruit costumes](/category/fruit-costumes) (from ₹${fruit.buy}) and [vegetable costumes](/category/vegetable-costumes).`,
    `## 2. Kathak dance dress`,
    `If the school has a classical dance item, a kathak dress is the most common ask. An anarkali cut spins into a full circle; a lehenga cut with a net dupatta gives the Mughal-court look. We stock kathak dresses in thirteen colours, and renting starts at ₹${kathak.rent}, which is what most parents do for a single evening. The [white and red kathak dress](/products/kathak-anarkali-fancy-dress-style-white-red) (₹${whiteRed.price} to buy) is the safe pick when the note just says "kathak". Browse every colour in [kathak dress](/category/kathak-dress).`,
    `## 3. Rajasthani or kalbelia`,
    `One of the most popular choices for cultural programmes. A Rajasthani lehenga for girls or an angrakha with a pagdi for boys stands out in group items, and a [kalbelia dress](/products/kalbelia-dance-dress-costume-fancy-dress) is the folk look for a faster dance. See [Rajasthani dress](/category/rajasthani-dress).`,
    `## 4. Freedom fighter or national leader`,
    `Gandhi ji, Rani Lakshmibai, Nehru — perennial favourites when the function has a patriotic segment. The costume is simple, the audience understands it instantly, and it pairs with a two-line speech. See the [Mahatma Gandhi costume](/products/mahatma-gandhi-fancy-dress-costume), the [Jhansi Ki Rani costume](/products/jhansi-ki-rani-laxmi-bai-fancy-dress-costume) and the full [leaders and freedom fighters](/category/leaders-freedom-fighters) range.`,
    `## 5. Cartoon character`,
    `For nursery and the junior classes, nothing beats a character every child in the audience knows. [Chutki](/products/chutki-fancy-dress), [Tweety](/products/tweety-fancy-dress) and [Mickey Mouse](/products/mickey-mouse) are easy entries with a lot of energy. See [cartoon characters](/category/cartoon-characters), from ₹${cartoon.buy}.`,
    `## 6. Bharatnatyam costume`,
    `Classical costumes have a stage presence nothing else matches: the pleated fan, the temple jewellery, the posture it asks for. Even a child who only walks on looks like a performer. See [bharatnatyam costumes](/category/bharatnatyam), and for help choosing between kathak, bharatnatyam and odissi, see our [classical dance costume guide](/category/classical-dance-dress).`,
    `## 7. Animal or bird`,
    `A peacock, parrot or elephant works brilliantly for a group skit or a nature-themed item. They are easy to wear, comfortable to sit in while waiting, and always a crowd favourite. See [animal costumes](/category/animal-costumes) and [bird costumes](/category/bird-costumes).`,
    `## 8. Garba or Punjabi folk`,
    `A garba chaniya choli or a bhangra set brings colour and movement to a folk medley, and both are easy to dance in. See [garba dress](/category/garba-dress) and [bhangra dress](/category/bhangra-dress).`,
    `## 9. State costume for "Unity in Diversity"`,
    `Very common in Indian schools: each child represents a state. A Kashmiri pheran, an Assamese mekhela chador, a Maharashtrian nauvari or a Kerala kasavu saree all read clearly on stage. See [states fancy dress](/category/states-fancy-dress), with a note on which school day each costume suits, and [Kashmiri dress](/category/kashmiri-dress).`,
    `## 10. Western dance costume`,
    `For a western or Bollywood group item, bold matching outfits make the line look coordinated and professional on camera. Sequin tops, frocks and ballroom sets start at ₹${western.buy}. See [western dance dress](/category/western-dance-dress).`,
    `For every dance in one place — kathak, bharatnatyam, bhangra, garba, kalbelia, bihu and western — see our [dance costumes on rent in Delhi](/category/dance-dress) hub.`,
    `## Quick tips before you buy or rent`,
    [
      `- Confirm the theme and any colour rule with the class teacher first.`,
      `- Order a week ahead in December–January, earlier if you want a practice wear at home.`,
      `- For flared dance skirts, size by height, not age: a short dancer in a long skirt loses the spin.`,
      `- Keep props simple. A flag, a flute or a stick is enough; extra accessories get dropped on stage.`,
      `- Pick something your child can sit in. Annual functions involve long waits backstage.`,
    ].join('\n'),
    `## Rent or buy?`,
    `Most annual function costumes are worn once, so renting is cheaper and saves cupboard space. You pay the rent plus a refundable deposit, collect the costume from the shop or get it delivered, and get the full deposit back when you return it after the function. See [how renting works](/rent). Buy if a younger sibling will wear it next year, or if the child performs the same dance every season.`,
    `## Costumes for a whole class or house`,
    `If you are a teacher or a parent coordinator ordering ten or more of the same costume, send us the costume, the count, the size list and the function date on WhatsApp. We match one colour across every size, pack and label per size, and quote a bulk price. See [bulk costumes for schools](/wholesale/schools) and, for academies, [dance academy sets](/wholesale/dance-academies).`,
    `## Where to get them in Delhi`,
    `Everything above is in stock at Mod Fancy Dress, S64 South Anarkali, Som Bazar, Krishna Nagar, a five-minute walk from Krishna Nagar Metro on the Pink Line. You can try the costume in the shop, or book Porter/Rapido delivery anywhere in Delhi NCR. Prefer Hindi? Read the same guide in [Hindi](/blog/school-annual-function-fancy-dress-ideas-hindi).`,
  ].join('\n\n')
  return {
    title: '10 Fancy Dress Ideas for School Annual Function 2026–27',
    excerpt:
      'Ten school annual function fancy dress ideas that work on stage: kathak, Rajasthani, freedom fighters, cartoons, states and more, to buy or rent in Delhi.',
    content,
  }
}

const REPUBLIC_SECTION = [
  `## Republic Day (26 January): what changes`,
  `Republic Day 2027 falls on Tuesday 26 January, so most schools hold their programme between 22 and 25 January. Nearly every idea above works for both days, but the tone is different:`,
  [
    `- **Independence Day** looks back at the freedom struggle, so Gandhi, Bhagat Singh, Bose and Bharat Mata are the natural picks.`,
    `- **Republic Day** celebrates the Constitution, so leaders who shaped it fit best: Dr B. R. Ambedkar, Jawaharlal Nehru and Sardar Patel, each with a short line about the Constitution.`,
    `- The parade is the other Republic Day theme: army, air force and police uniforms for a march-past segment. See the [Kargil soldier uniform](/products/kargil-fancy-dress), the [Indian Air Force uniform](/products/indian-air-force-fancy-dress-costume) and our [helper costumes](/category/helper-costumes).`,
    `- The Rajpath tableaux inspire the third: a "Unity in Diversity" line where each child wears a different state. See [states fancy dress](/category/states-fancy-dress).`,
  ].join('\n'),
  `Bharat Mata works for both days and is the showstopper for girls from about six years old. For a whole class, pick one theme so the stage looks coordinated on camera. Browse the [Republic Day dress collection](/category/republic-day-dress), or read [Republic Day ideas for kids](/blog/republic-day-fancy-dress-ideas-kids) and the [Hindi guide](/blog/republic-day-fancy-dress-hindi).`,
].join('\n\n')

function independencePost(current: string) {
  // Two products this post linked to were soft-deleted; point at the live ones.
  let content = current
    .replace(
      'See the [Bhagat Singh costume](/products/bhagat-singh-fancy-dress-costume).',
      'We stock the [Bhagat Singh cap](/products/bhagat-singh-cap); pair it with a plain kurta.'
    )
    .replace('/products/subash-chandra-bose-fancy-dress-costume', '/products/subhash-chander-bose-fancy-dress')
  if (!content.includes('## Republic Day (26 January)')) {
    const anchor = '## Rent or buy, and where to get them'
    if (!content.includes(anchor)) throw new Error(`${KEEP_INDEPENDENCE}: section "${anchor}" not found`)
    content = content.replace(anchor, `${REPUBLIC_SECTION}\n\n${anchor}`)
  }
  return content
}

const EXCERPTS: Record<string, string> = {
  'how-to-choose-kathak-dance-costume':
    "How to choose a kathak dance costume for your child's school performance: anarkali or lehenga, fit, fabric and what to check before the show.",
  'republic-day-fancy-dress-ideas-kids':
    'Republic Day fancy dress ideas for kids for 26 January: freedom fighters, Bharat Mata, soldiers and state costumes that look great on the school stage.',
  // Hindi post: the excerpt stays Hindi (it is that page's own meta); only the length is fixed.
  'school-annual-function-fancy-dress-ideas-hindi':
    'स्कूल के एनुअल फंक्शन के लिए 10 आसान फैंसी ड्रेस आइडियाज — कथक, राजस्थानी, फ्रीडम फाइटर और कार्टून, और दिल्ली में कहाँ से खरीदें या किराए पर लें।',
}

async function main() {
  banner()
  const cat = await loadCatalog()
  const problems = new Problems()
  const { data: posts, error } = await sb.from('blog_posts').select('id, slug, title, excerpt, content, published_at, language')
  if (error) throw error
  const bySlug = new Map((posts ?? []).map((p) => [p.slug, p]))
  const get = (slug: string) => {
    const p = bySlug.get(slug)
    if (!p) throw new Error(`blog post ${slug} not found`)
    return p
  }

  const now = new Date().toISOString()
  type Update = { slug: string; id: string; before: Record<string, unknown>; patch: Record<string, unknown> }
  const updates: Update[] = []
  const unpublished = [FOLD_ANNUAL, FOLD_CLASSICAL, FOLD_REPUBLIC]
  // Links to posts this run unpublishes are not allowed in the kept copy.
  const livePosts = [...cat.publishedPosts].filter((s) => !unpublished.includes(s))
  const liveCat = { ...cat, publishedPosts: new Set(livePosts) }

  // Annual-function keeper
  const annual = annualFunctionPost(cat)
  const words = annual.content.split(/\s+/).length
  if (words < 900) problems.add(`${KEEP_ANNUAL}: only ${words} words`)
  problems.copy(KEEP_ANNUAL, annual.title, annual.excerpt)
  problems.body(liveCat, KEEP_ANNUAL, annual.content)
  const a = get(KEEP_ANNUAL)
  updates.push({ slug: KEEP_ANNUAL, id: a.id, before: a, patch: { ...annual, updated_at: now } })

  // Independence Day keeper + Republic Day section
  const ind = get(KEEP_INDEPENDENCE)
  const indContent = independencePost(ind.content)
  problems.body(liveCat, KEEP_INDEPENDENCE, indContent)
  updates.push({ slug: KEEP_INDEPENDENCE, id: ind.id, before: ind, patch: { content: indContent, updated_at: now } })

  // Excerpts
  for (const [slug, excerpt] of Object.entries(EXCERPTS)) {
    const p = get(slug)
    // Only the excerpt changes here, so only its length is checked (titles are untouched).
    if (excerpt.length > META_MAX || excerpt.length < META_MIN) problems.add(`${slug}: excerpt ${excerpt.length} chars`)
    if (p.language === 'en' && /[\u0900-\u097F]/.test(excerpt)) problems.add(`${slug}: English post, non-English excerpt`)
    updates.push({ slug, id: p.id, before: p, patch: { excerpt, updated_at: now } })
  }

  // Unpublish the folded posts
  for (const slug of unpublished) {
    const p = get(slug)
    updates.push({ slug, id: p.id, before: p, patch: { published_at: null, updated_at: now } })
  }

  problems.abortIfAny()

  console.log(`${KEEP_ANNUAL}: ${words} words\n`)
  for (const u of updates) {
    console.log(u.slug)
    let changed = false
    for (const [k, v] of Object.entries(u.patch)) {
      if (k === 'updated_at') continue
      const before = (u.before[k] as string | null) ?? '(null — unpublished)'
      changed = diff('post', k, before, (v as string | null) ?? '(null — unpublished)') || changed
    }
    if (APPLY && changed) {
      const { error: e } = await sb.from('blog_posts').update(u.patch).eq('id', u.id)
      console.log(e ? `   ❌ ${e.message}` : '   ✅ written')
    }
  }
  console.log('\nRedirects needed in redirects.json (301):')
  console.log(`   /blog/${FOLD_ANNUAL} -> /blog/${KEEP_ANNUAL}`)
  console.log(`   /blog/${FOLD_CLASSICAL} -> /category/classical-dance-dress`)
  console.log(`   /blog/${FOLD_REPUBLIC} -> /blog/${KEEP_INDEPENDENCE}`)
  if (!APPLY) console.log('\n(dry run — nothing written)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
