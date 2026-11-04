/**
 * Girls / boys collections for /fancy-dress-for-girls and /fancy-dress-for-boys.
 *
 * The catalogue has no gender field, so membership is a curated rule over data the
 * cached product list already carries (name, slug, categories, description):
 *
 *   1. Drop anything that is not a kids' costume: no photo, accessories, adult-only
 *      sizing (name or description), or listed in EXCLUDE.
 *   2. INCLUDE wins: a slug listed there is in that collection, full stop.
 *   3. A name/slug that says "girl" or "boy" (and not the other) decides alone.
 *   4. Otherwise a girls/boys category or a girls/boys name keyword puts it in;
 *      a product can land in both (e.g. "Tiranga ... for Boys Girls").
 *
 * Maintaining it: when a new upload lands in the wrong place (or nowhere), add its
 * slug to INCLUDE / EXCLUDE rather than bending the keyword lists, then run
 * `pickGenderCollection` over the live product list in a scratch script and eyeball
 * the names. Adult-only sizing is read from the catalogue copy (ADULT_DESCRIPTION),
 * so a description that says "listed in Adult size" drops a product automatically.
 */

export type Audience = 'girls' | 'boys'

type Categorised = {
  slug: string
  name: string
  description?: string | null
  category: { name: string; slug?: string } | null
  categories?: { category: { name: string; slug?: string } | null }[]
  images: unknown[]
}

/** Categories whose costumes are worn by girls. */
const GIRLS_CATEGORIES = new Set([
  'kids-saree',
  'saree',
  'lehenga',
  'frock-dress',
  'gidda-dress',
  'lavani-costume',
  'kathak-dress',
  'bharatnatyam',
  'mohiniyattam-dress',
  'classical-dance-dress',
  'qawwali-dress',
])

/** Categories whose costumes are worn by boys. */
const BOYS_CATEGORIES = new Set(['bhangra-dress', 'superhero-costumes'])

const GIRL_WORDS =
  /\b(girls?|lehenga|lehnga|ghagra|frock|saree|sari|skirt|rani|princess|gown|chaniya|choli|sharara|mekhla|daaman|kalbelia|angel|mermaid|radha|sita|durga|manthara|chutki|snow white|air hostess|mother teresa|indira|bharat mata|laxmi bai|giddha?|lavani|kathak|bharatnatyam|odissi|mohiniyattam)\b/i

const BOY_WORDS =
  /\b(boys?|king|raja|kurta|dhoti|kediyu|kediya|kedia|bhangra|angrakha|angarkha|sherwani|nehru|mahatma gandhi|subhash|bose|tilak|mangal pandey|shivaji|maratha|police|army|kargil|air force|fire fighter|ram|laxman|hanuman|ravan|meghnath|kumbhkaran|dashrath|mahishasur|rishi|jaamvant|ganesh|krishna|iron man|hulk|balveer|harry potter)\b/i

/** Explicit membership for products the words and categories don't catch. */
const INCLUDE: Record<Audience, string[]> = {
  girls: [
    'kashmiri-fancy-dress',
    'manipur-fancy-dress',
    'sambhalpuri-fancy-dress',
    'rajasthani-fancy-dress', // photo shows a boy and a girl pair
    'kajari-folk-dance-fancy-dress-costume',
    'manipuri-folk-dance-fancy-dress-costume', // phanek skirt
    'rajasthani-folk-dance-fancy-dress', // layered skirt and odhni
    'sambalpuri-dance-costume-ghumra-dance-fancy-dress', // blouse and drape
    'green-western-dance-fancy-dress-costumes',
    'western-dance-fancy-dress-costume-green', // frill skirt
    // sequin skirt-and-top sets (western-dance-dress category copy)
    'orange-sequence-fancy-dress',
    'red-and-blue-sequence-fancy-dress',
    'green-sequence-dance-fancy-dress',
    'santa-claus-dress', // kids & adult sizes, for boys and girls
  ],
  boys: [
    'harem-and-tshirt-fancy-dress',
    // western sets that pair with the girls' outfits (western-dance-dress category copy)
    'western-white-and-red-fancy-dress',
    'blue-western-fancy-dress',
    'santa-claus-dress',
    'rajasthani-fancy-dress',
  ],
}

/** Never shown on either page (adult-only, or a girls/boys word that misleads). */
const EXCLUDE = new Set([
  'odissi-fancy-dress', // teens and adults only
  'bhangra-fancy-dress', // size 40 only
  'krishna-fancy-dress-king', // teens and adults
  'gabbar-fancy-dress', // adult size
  'rajasthani-dance-fancy-dress-for-men',
  'radha-rani-fancy-dress', // adult Radha of the adult Radha-Krishna pair
])

const ACCESSORY_CATEGORY = 'accessories'
/** Single props sold on their own; "Dress With Mask" style sets are kept. */
const ACCESSORY_WORDS = /\b(cap|topi|hat|mask|mukut|pagdi|pagadi|safa|turban|wig|wings|sticks?)\b/i

const ADULT_NAME = /\b(adults?|men|women|ladies)\b/i
const KID_NAME = /\b(kids?|child|children|boys?|girls?)\b/i
/** Phrases the catalogue copy uses for adult-only sizing. */
const ADULT_DESCRIPTION =
  /sized for (adults|women|teens and adults)|adult free size|(stocked|available) in adult size|listed in adult size|photographed on an adult|\bfor women\b|women's|adult men's/i

function categorySlugs(p: Categorised): string[] {
  const slugs = [p.category?.slug, ...(p.categories ?? []).map((c) => c.category?.slug)]
  return slugs.filter((s): s is string => !!s)
}

function isKidsCostume(p: Categorised): boolean {
  if (p.images.length === 0 || EXCLUDE.has(p.slug)) return false
  if (categorySlugs(p).includes(ACCESSORY_CATEGORY)) return false
  if (ACCESSORY_WORDS.test(p.name) && !/\bwith\b/i.test(p.name)) return false
  if (ADULT_NAME.test(p.name) && !KID_NAME.test(p.name)) return false
  if (ADULT_DESCRIPTION.test(p.description ?? '')) return false
  return true
}

export function audiencesFor(p: Categorised): Audience[] {
  if (!isKidsCostume(p)) return []
  const included = (Object.keys(INCLUDE) as Audience[]).filter((a) => INCLUDE[a].includes(p.slug))
  if (included.length > 0) return included

  const text = `${p.name} ${p.slug.replace(/-/g, ' ')}`
  const saysGirl = /\bgirls?\b/i.test(text)
  const saysBoy = /\bboys?\b/i.test(text)
  if (saysGirl !== saysBoy) return [saysGirl ? 'girls' : 'boys']

  const cats = categorySlugs(p)
  const out: Audience[] = []
  if (saysGirl || cats.some((c) => GIRLS_CATEGORIES.has(c)) || GIRL_WORDS.test(p.name)) out.push('girls')
  if (saysBoy || cats.some((c) => BOYS_CATEGORIES.has(c)) || BOY_WORDS.test(p.name)) out.push('boys')
  return out
}

/**
 * The collection for one audience, round-robin across primary categories (largest
 * first) so the first screen shows a mix of themes rather than eight kathak dresses in
 * a row. Input order (newest first) is kept within each category.
 */
/**
 * Lead products shown first (season + strongest photos), in this order, when they are in
 * the collection. Update per season: Nov–Jan = leaders, Republic Day, Christmas,
 * annual-function dance. Everything else follows in the round-robin order below.
 */
const LEAD: Record<Audience, string[]> = {
  girls: [
    'jhansi-ki-rani-laxmi-bai-fancy-dress-costume',
    'kathak-fancy-dress',
    'bharat-mata-fancy-dress-costume',
    'angel-fancy-dress',
    'indira-gandhi-fancy-dress-costume',
    'himachal-fancy-dress',
    'kalbelia-dress-costume-for-girls-fancy-dress',
    'punjabi-fancy-dress-costume-boy-girl',
  ],
  boys: [
    'subhash-chandra-bose-fancy-dress',
    'rajasthani-boy-fancy-dress',
    'jawahar-lal-nehru-fancy-dress',
    'army-fancy-dress-costume-kargil-print',
    'santa-claus-dress',
    'mahatma-gandhi-fancy-dress-costume',
    'police-fancy-dress',
    'mangal-pandey-fancy-dress',
  ],
}

export function pickGenderCollection<T extends Categorised>(products: T[], audience: Audience): T[] {
  const all = products.filter((p) => audiencesFor(p).includes(audience))
  const lead = LEAD[audience].map((s) => all.find((p) => p.slug === s)).filter((p): p is T => !!p)
  const members = all.filter((p) => !lead.includes(p))
  const buckets = new Map<string, T[]>()
  for (const p of members) {
    const key = p.category?.slug ?? 'other'
    const bucket = buckets.get(key)
    if (bucket) bucket.push(p)
    else buckets.set(key, [p])
  }
  const queues = [...buckets.values()].sort((a, b) => b.length - a.length)
  const out: T[] = []
  for (let i = 0; out.length < members.length; i++) {
    for (const q of queues) if (q[i]) out.push(q[i])
  }
  return [...lead, ...out]
}

/** Categories never offered as theme chips (too generic to help). */
const CHIP_SKIP = new Set(['costumes', 'kids', 'accessories', 'dance-dress'])

/**
 * Theme chips: the active categories the collection's products sit in, most products
 * first. `activeSlugs` comes from the cached active-category list so a disabled
 * category never gets a link.
 */
export function themeChips(
  products: Categorised[],
  activeSlugs: Set<string>,
  limit = 12
): { slug: string; name: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>()
  for (const p of products) {
    const seen = new Set<string>()
    const all = [p.category, ...(p.categories ?? []).map((c) => c.category)]
    for (const c of all) {
      if (!c?.slug || seen.has(c.slug) || CHIP_SKIP.has(c.slug) || !activeSlugs.has(c.slug)) continue
      seen.add(c.slug)
      const entry = counts.get(c.slug)
      if (entry) entry.count++
      else counts.set(c.slug, { name: c.name, count: 1 })
    }
  }
  return [...counts.entries()]
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name))
    .slice(0, limit)
    .map(([slug, v]) => ({ slug, ...v }))
}
