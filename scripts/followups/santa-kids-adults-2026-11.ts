/**
 * Santa Claus dress now comes in Kids (₹500) and Adult (₹1000) sizes (owner, 4 Nov 2026;
 * prices set as product_variants). Retarget the page from "for kids" to the head term.
 *
 * Semrush (seodata/semrush-2026-11): "santa claus dress" 8,100/mo and "santa dress"
 * 8,100 vs "santa claus dress for kids" 260. Adult queries add ~3K more (santa claus
 * dress for adults 1,000, santa dresses for adults 1,000, mens santa suit/costume
 * 320 each, adult santa costume 260). fancydresswale ranks #2 for the head term
 * with one kids+adults page at /products/santa-claus-costume; bookmycostume's
 * winner is "santa-claus-dress-christmas-kids-adults".
 *
 *  - slug santa-claus-dress-for-kids -> santa-claus-dress (308; the older
 *    santa-clause-fancy-dress redirects are repointed so there is no chain);
 *  - name, seo_title, meta (priced "Buy ₹500 or rent" phrase), description.
 *
 * Dry run:  npx tsx scripts/followups/santa-kids-adults-2026-11.ts
 * Apply:    npx tsx scripts/followups/santa-kids-adults-2026-11.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../../lib/seo/copy-limits'
import { validateRedirects, type Redirect } from '../../lib/seo/redirect-graph'
import { revalidateSite } from '../lib/revalidate'

config({ path: resolve(process.cwd(), '.env.local'), quiet: true })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const APPLY = process.argv.includes('--apply')
const REDIRECTS_PATH = resolve(process.cwd(), 'redirects.json')
const LIVE_URLS_PATH = resolve(process.cwd(), 'seodata/live-urls.json')

const FROM = 'santa-claus-dress-for-kids'
const TO = 'santa-claus-dress'
const OLDER = 'santa-clause-fancy-dress'

const name = 'Santa Claus Dress for Kids & Adults'
const seo_title = 'Santa Claus Dress for Kids & Adults - Christmas Costume'

const description = [
  'A Santa Claus dress in kids and adult sizes, for the school Christmas programme, the office party or the Santa who hands out the gifts. The set in the photo is a red jacket with a white button placket and white trim at the hem and cuffs, matching red trousers with white cuffs, a pointed red Santa cap with a white band, a white beard with moustache, and a small red pouch on a white cord for toffees or gift cards. The soft red suit is easy to wear through a whole show or party. The kids size suits Christmas celebrations at school in the week before 25 December, carol and nativity programmes and a Christmas fancy dress competition, for boys and girls alike. The adult size is for teachers, parents and hosts playing Santa at a school, society or office Christmas party or a Secret Santa evening. Add black shoes and a sack of gifts to finish the look. Pick Kids or Adult above, and for a child tell us the age when you book so we set aside the right fit.',
  'Christmas ke liye Santa Claus ki dress — bachchon aur badon dono ke size mein, topi, daadhi aur potli ke saath.',
  'Buy or rent at Mod Fancy Dress, Krishna Nagar, Delhi NCR.',
].join('\n')

async function main() {
  const { data: p, error } = await sb
    .from('products')
    .select('id, price, product_variants(size, price_override)')
    .eq('slug', FROM)
    .is('deleted_at', null)
    .single()
  if (error) throw error
  if (!p.price) throw new Error('no buy price on the row')
  const meta = `Santa Claus dress for kids and adults: red suit with white trim, Santa cap, white beard and gift pouch for Christmas. Buy ₹${p.price} or rent in Delhi NCR.`

  const problems = checkCopy({ seoTitle: seo_title, metaDescription: meta })
  const { data: clash } = await sb.from('products').select('id').eq('slug', TO)
  if (clash?.length) problems.push(`slug ${TO} already taken`)

  const redirects: Redirect[] = JSON.parse(readFileSync(REDIRECTS_PATH, 'utf8'))
  const live = new Set<string>(JSON.parse(readFileSync(LIVE_URLS_PATH, 'utf8')))
  for (const base of ['/products', '/wholesale']) {
    for (const r of redirects) if (r.source === `${base}/${OLDER}`) r.destination = `${base}/${TO}`
    redirects.push({ source: `${base}/${FROM}`, destination: `${base}/${TO}`, permanent: true })
    live.delete(`${base}/${FROM}`)
    live.add(`${base}/${TO}`)
  }
  for (const i of validateRedirects(redirects, live)) problems.push(`redirects: ${i}`)

  console.log({ variants: p.product_variants, name, seo_title, titleLen: seo_title.length, meta, metaLen: meta.length })
  console.log(description)
  if (problems.length) throw new Error(problems.join('\n'))
  if (!APPLY) return console.log('\nDry run. Pass --apply to write.')

  const { error: ue } = await sb
    .from('products')
    .update({ slug: TO, name, seo_title, meta_description: meta, description })
    .eq('id', p.id)
  if (ue) throw ue
  writeFileSync(REDIRECTS_PATH, JSON.stringify(redirects, null, 2) + '\n')
  writeFileSync(LIVE_URLS_PATH, JSON.stringify([...live].sort(), null, 2) + '\n')
  console.log('\nApplied.')
  await revalidateSite('catalog')
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
