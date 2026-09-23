/**
 * Turn the first mention of each named product/category in the hub category
 * descriptions into a markdown link.
 *
 * Why: the dance, Krishna/mythology, states, Ramleela and Dandiya hubs were written
 * (23 Sep 2026) to point readers at the right product or sub-category, but category
 * descriptions rendered as plain text, so none of those mentions were links. Internal
 * links are how Google learns which page is the authority for a query; the category
 * page now renders its description with BlogContent, so markdown links work.
 *
 * Only the FIRST occurrence of each phrase is linked, never inside an existing link,
 * and only to a URL verified live at run time (live product slug, or an active
 * category with at least one live product). Phrases not found are reported.
 *
 * Usage:
 *   npx tsx scripts/link-hub-categories.ts          # dry run
 *   npx tsx scripts/link-hub-categories.ts --apply  # write
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(__dirname, '../.env.local') })
const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const P = (slug: string) => `/products/${slug}`
const C = (slug: string) => `/category/${slug}`

const LINKS: Record<string, [phrase: string, href: string][]> = {
  'dance-dress': [
    ['Kathak', C('kathak-dress')],
    ['Classical Dance Dress', C('classical-dance-dress')],
    ['Bhangra', C('bhangra-dress')],
    ['chaniya choli and kediyu', C('dandiya-dress')],
    ['Haryanvi', C('haryanvi-dress')],
    ['Kashmiri', C('kashmiri-dress')],
    ['Bulk for schools and academies', '/wholesale/schools'],
  ],
  'indian-mythology-costumes': [
    ['yellow Bal Krishna dress', P('krishna-fancy-dress-kid')],
    ['Raja Krishna costume', P('krishna-fancy-dress-king')],
    ['Ramleela', C('ramleela-costumes')],
    ['Vanvasi Ram', P('vanvasi-ram-fancy-dress')],
    ['Rani Sita', P('rani-sita-fancy-dress-costume-for-ramleela')],
  ],
  'states-fancy-dress': [
    ['Assam mekhela chador', P('assam-fancy-dress')],
    ['Kerala kasavu saree', P('kerala-fancy-dress')],
    ['Kathakali', P('kathakali-fancy-dress')],
    ['Manipuri potloi', P('manipur-fancy-dress')],
    ['Manipur boy dhoti', P('manipur-boy-fancy-dress')],
    ['Nagaland girl', P('nagaland-girl-fancy-dress')],
    ['Maharashtra nauvari', P('maharashtra-fancy-dress')],
    ['Gujarati boy kediyu', P('gujrati-boy-fancy-dress')],
    ['Sikkim', P('sikkim-fancy-dress')],
    ['Himachali', P('himachal-fancy-dress')],
    ['Pahadi', P('pahadi-boy-fancy-dress')],
  ],
  'ramleela-costumes': [
    ['Raja Ram', P('raja-ram-fancy-dress')],
    ['saffron Vanvasi Ram', P('vanvasi-ram-fancy-dress')],
    ['black-and-gold Ravan', P('ravan-fancy-dress')],
    ['royal blue Meghnath', P('meghnath-fancy-dress')],
    ['heavy velvet Kumbhkaran', P('kumbhkaran-fancy-dress')],
  ],
  'dandiya-dress': [
    ['kediyu', C('garba-dress')],
  ],
}

/** Link the first occurrence of `phrase` that isn't already inside [..](..). */
export function linkFirst(text: string, phrase: string, href: string): string | null {
  let from = 0
  while (true) {
    const i = text.indexOf(phrase, from)
    if (i === -1) return null
    const before = text.slice(0, i)
    const insideLink = before.lastIndexOf('[') > before.lastIndexOf(']')
    const wordBoundary = !/[A-Za-z]/.test(text[i - 1] ?? '') && !/[A-Za-z]/.test(text[i + phrase.length] ?? '')
    if (!insideLink && wordBoundary) return `${before}[${phrase}](${href})${text.slice(i + phrase.length)}`
    from = i + phrase.length
  }
}

async function liveUrls(): Promise<Set<string>> {
  const [{ data: products }, { data: cats }, { data: pc }] = await Promise.all([
    sb.from('products').select('slug, category_id').eq('is_active', true).is('deleted_at', null),
    sb.from('categories').select('id, slug').eq('is_active', true),
    sb.from('product_categories').select('category_id, products!inner(is_active, deleted_at)')
      .eq('products.is_active', true).is('products.deleted_at', null),
  ])
  const nonEmpty = new Set<string>([
    ...(products ?? []).map((p) => p.category_id as string).filter(Boolean),
    ...(pc ?? []).map((r) => r.category_id as string),
  ])
  return new Set([
    ...(products ?? []).map((p) => P(p.slug as string)),
    ...(cats ?? []).filter((c) => nonEmpty.has(c.id as string)).map((c) => C(c.slug as string)),
    '/wholesale/schools',
  ])
}

async function main() {
  const live = await liveUrls()
  for (const [slug, links] of Object.entries(LINKS)) {
    const { data: cat, error } = await sb.from('categories').select('id, description').eq('slug', slug).single()
    if (error || !cat?.description) { console.log(`skip ${slug}: ${error?.message ?? 'no description'}`); continue }
    let text = cat.description as string
    const done: string[] = [], missing: string[] = []
    for (const [phrase, href] of links) {
      if (!live.has(href)) { missing.push(`${phrase} -> ${href} (not live)`); continue }
      if (text.includes(`](${href})`)) continue // already linked on a previous run
      const next = linkFirst(text, phrase, href)
      if (next) { text = next; done.push(phrase) } else missing.push(`${phrase} (phrase not found)`)
    }
    console.log(`${slug}: +${done.length} links [${done.join(', ')}]${missing.length ? `\n  not linked: ${missing.join('; ')}` : ''}`)
    if (APPLY && done.length) {
      const { error: e } = await sb.from('categories').update({ description: text }).eq('id', cat.id)
      if (e) throw e
    }
  }
  if (!APPLY) console.log('dry run: nothing written')
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1) })
