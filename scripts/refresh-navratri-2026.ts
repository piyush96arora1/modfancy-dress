/**
 * Navratri 2026 content refresh (festival-season plan, Task 1).
 *
 * Navratri runs 11–19 Oct 2026 (Durga Ashtami and Maha Navami both on 19 Oct in
 * Delhi), Dussehra 20 Oct. Dates and the nine-colour list are from Drik Panchang's
 * New Delhi calendar, fetched 23 Sep 2026, and are cited in the post.
 *
 * Phase 1  Overwrite seo_title / meta_description / description on
 *          `dandiya-dress` and `garba-dress`. The old copy targeted kids only,
 *          but autocomplete leads with "for women", "for men" and "for couple".
 *          Category descriptions render as one plain <p> (no markdown), so the
 *          plan's H2 sections are written as lead-in phrases.
 * Phase 2  Report copy gaps (description / meta / title) on every live product
 *          in either category. It writes nothing: on 23 Sep every product had all
 *          three. Alt text is left to the Task 6 alt-text backfill.
 * Phase 3  Overwrite the pillar post `navratri-garba-dandiya-dress-guide` with
 *          scripts/content/navratri-garba-dandiya-dress-guide.md, merging the kids
 *          advice from `garba-navratri-costume-kids-guide`.
 * Phase 4  Unpublish `garba-navratri-costume-kids-guide` (published_at = null;
 *          it needs a redirect to the pillar, added separately to redirects.json)
 *          and link the Hindi post `garba-navratri-dress-guide-hindi` to the pillar.
 *          The pillar already links back to it.
 *
 * Every price comes from the live catalog at run time (scripts/lib/seo-copy-helpers.ts).
 * Every title/meta goes through checkCopy, and any violation aborts before a write.
 *
 * Dry run:  npx tsx scripts/refresh-navratri-2026.ts
 * Apply:    npx tsx scripts/refresh-navratri-2026.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { checkCopy } from '../lib/seo/copy-limits'
import { loadCatalog, fillTokens, checkLinks, wordCount, inCategory } from './lib/seo-copy-helpers'

config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const APPLY = process.argv.includes('--apply')

const PILLAR = 'navratri-garba-dandiya-dress-guide'
const KIDS_POST = 'garba-navratri-costume-kids-guide'
const HINDI_POST = 'garba-navratri-dress-guide-hindi'

const CATEGORY_COPY = [
  {
    slug: 'dandiya-dress',
    seo_title: 'Dandiya Dress for Women, Men & Kids – Rent in Delhi',
    meta_description:
      'Dandiya night dresses for women, men, couples and kids: mirror-work lehengas, chaniya choli and kediyu. Rent from ₹{MIN_RENT:dandiya-dress} in Delhi NCR for Navratri 2026.',
    description: [
      'Dandiya dress for Navratri 2026 (11–19 October): chaniya choli, mirror-work lehengas and kediyu for women, men, couples and kids, to buy or rent in Delhi NCR.',
      'Dandiya dress for women: most of this collection is three-piece sets in adult free size (a flared chaniya, a matching choli and a dupatta) in Kutchi embroidery, mirror work, patchwork and printed ghoomar styles. Deep maroons and blacks hold their colour under night-time lights, and the whites, yellows and greens suit the Navratri colour days.',
      'For men and boys (kediyu): the kediyu is the short Gujarati top that flares into frills at the waist, worn with a dhoti and pagdi. Our kediya sets are cut for boys; adult men can WhatsApp us to check sizes in the shop.',
      'Couple dandiya outfits: choose her chaniya choli first, then pick one colour from its border for his kediyu, pagdi or dupatta rather than matching the whole outfit.',
      "Dandiya dress for kids: girls' chaniya cholis and boys' kediya sets for school Navratri days are in our garba dress collection.",
      'Dandiya dress on rent in Delhi: rent from ₹{MIN_RENT:dandiya-dress} per event with a refundable deposit, returned in full when the outfit comes back. Try sizes at our store at S64, South Anarkali, Som Bazar, Krishna Nagar (open 10 AM – 9:30 PM daily, five minutes from Krishna Nagar Metro), or WhatsApp +91 99537 64137 to reserve and have it delivered by Porter or Rapido. Book at least a week ahead in October.',
      'Dandiya ki dress rent pe chahiye? Krishna Nagar store aaiye ya WhatsApp karein.',
    ].join(' '),
  },
  {
    slug: 'garba-dress',
    seo_title: 'Garba Dress & Chaniya Choli – Buy or Rent, Delhi',
    meta_description:
      'Garba dresses and chaniya choli for women, girls and boys for Navratri 2026 (11–19 Oct). Buy from ₹{MIN_BUY:garba-dress} or rent in Delhi NCR, pickup in Krishna Nagar.',
    description: [
      'Garba dress and chaniya choli for Navratri 2026 (11–19 October), for women, girls and boys. Buy from ₹{MIN_BUY:garba-dress} or rent in Delhi NCR.',
      'Garba dress for women: flared three-piece chaniya cholis in adult free size, from Kutchi embroidery and mirror work to printed and patchwork gujrati lehengas. Judge a garba skirt by its gher (flare), not its weight: a wide, light skirt opens on every spin.',
      "Garba costume for kids (school events): girls' chaniya cholis with mirror work and boys' kediya and kedia sets with dhoti and pagdi, for school Navratri days, garba competitions and Gujarat theme days. Keep it light, because heavy layers tire children out and stone work on the hem comes loose mid-dance. For under-sixes, a simple half-lehenga is plenty.",
      'Garba dress on rent in Delhi: rent any piece per event from ₹{MIN_RENT:garba-dress} with a refundable deposit. Try sizes and collect from our Krishna Nagar store, a five-minute walk from Krishna Nagar Metro (Pink Line), or have it sent by Porter or Rapido. Groups of ten or more get group rates.',
      'For the day-by-day Navratri 2026 colours and what to wear each night, read the Navratri garba and dandiya dress guide on our blog.',
      'Garba ki dress chahiye? Krishna Nagar aaiye ya WhatsApp karein.',
    ].join(' '),
  },
]

const PILLAR_TITLE = 'Navratri 2026 Garba and Dandiya Dress Guide'
const PILLAR_EXCERPT =
  'Navratri 2026 (11–19 Oct) outfit guide: dandiya dress for women, men, couples and kids, the 9 Navratri colours, and where to buy or rent garba dresses in Delhi.'

const HINDI_LINK = `/blog/${PILLAR}`
const HINDI_PARAGRAPH = `नवरात्रि 2026 की तारीखें (11–19 अक्टूबर), नौ दिनों के रंग, और महिलाओं, पुरुषों, कपल और बच्चों के लिए गरबा-डांडिया ड्रेस की पूरी गाइड अंग्रेज़ी में पढ़ें: [Navratri 2026 garba and dandiya dress guide](${HINDI_LINK})।`

function abort(msg: string): never {
  console.error(`❌ ${msg}`)
  process.exit(1)
}

async function main() {
  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (pass --apply to write) ===\n')
  const cat = await loadCatalog(sb)

  // ---------- Build and validate everything before any write ----------
  const cats = CATEGORY_COPY.map((c) => ({
    slug: c.slug,
    seo_title: fillTokens(c.seo_title, cat),
    meta_description: fillTokens(c.meta_description, cat),
    description: fillTokens(c.description, cat),
  }))
  for (const c of cats) {
    const v = checkCopy({ seoTitle: c.seo_title, metaDescription: c.meta_description })
    if (v.length) abort(`${c.slug}: ${v.join('; ')}`)
    if (c.description.includes('{')) abort(`${c.slug}: unfilled token`)
  }

  const pillarBody = fillTokens(readFileSync(resolve(__dirname, 'content', `${PILLAR}.md`), 'utf8').trim(), cat)
  {
    const v = checkCopy({ seoTitle: PILLAR_TITLE, metaDescription: PILLAR_EXCERPT })
    if (v.length) abort(`pillar: ${v.join('; ')}`)
    const { errors, productLinks } = checkLinks(pillarBody, cat, { droppedPosts: [KIDS_POST] })
    if (errors.length) abort(`pillar links: ${errors.join('; ')}`)
    const words = wordCount(pillarBody)
    console.log(`pillar: ${words} words, ${productLinks.length} product links`)
    if (words < 1200) abort('pillar under 1,200 words')
    if (productLinks.length < 6) abort('pillar has fewer than 6 product links')
  }

  // ---------- Phase 1: categories (overwrite) ----------
  console.log('\n=== PHASE 1: CATEGORY COPY (overwrite) ===')
  for (const c of cats) {
    const { data: row } = await sb
      .from('categories')
      .select('id, seo_title, meta_description, description')
      .eq('slug', c.slug)
      .single()
    if (!row) abort(`${c.slug} not found`)
    console.log(`${c.slug}`)
    console.log(`   title: "${row.seo_title}"\n       -> "${c.seo_title}" (${c.seo_title.length})`)
    console.log(`   meta:  "${row.meta_description}"\n       -> "${c.meta_description}" (${c.meta_description.length})`)
    console.log(`   desc:  ${row.description?.length ?? 0} -> ${c.description.length} chars, ${wordCount(c.description)} words`)
    if (APPLY) {
      const { error } = await sb
        .from('categories')
        .update({ seo_title: c.seo_title, meta_description: c.meta_description, description: c.description, updated_at: new Date().toISOString() })
        .eq('id', row.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  // ---------- Phase 2: product copy gaps (report only) ----------
  console.log('\n=== PHASE 2: PRODUCT COPY GAPS (report only) ===')
  const catIds = ['dandiya-dress', 'garba-dress'].map((s) => cat.categories.get(s)!.id)
  const { data: prods } = await sb
    .from('products')
    .select('slug, description, meta_description, seo_title, category_id, product_categories(category_id)')
    .eq('is_active', true)
    .is('deleted_at', null)
  const members = (prods ?? []).filter((p) => inCategory(p, catIds))
  const gaps = members.filter((p) => !p.description?.trim() || !p.meta_description?.trim() || !p.seo_title?.trim())
  console.log(`${members.length} live garba/dandiya products, ${gaps.length} with a copy gap`)
  for (const g of gaps)
    console.log(`   ⚠️  ${g.slug}: ${[!g.description?.trim() && 'desc', !g.meta_description?.trim() && 'meta', !g.seo_title?.trim() && 'title'].filter(Boolean).join(', ')} — write copy from its photos`)

  // ---------- Phase 3: pillar post (overwrite) ----------
  console.log('\n=== PHASE 3: PILLAR POST (overwrite) ===')
  const { data: pillar } = await sb.from('blog_posts').select('id, title, excerpt, content').eq('slug', PILLAR).single()
  if (!pillar) abort('pillar post not found')
  console.log(`title:   "${pillar.title}" -> "${PILLAR_TITLE}"`)
  console.log(`excerpt: ${PILLAR_EXCERPT.length} chars`)
  console.log(`content: ${wordCount(pillar.content)} -> ${wordCount(pillarBody)} words`)
  if (APPLY) {
    const { error } = await sb
      .from('blog_posts')
      .update({ title: PILLAR_TITLE, excerpt: PILLAR_EXCERPT, content: pillarBody, updated_at: new Date().toISOString() })
      .eq('id', pillar.id)
    console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
  }

  // ---------- Phase 4: consolidate posts ----------
  console.log('\n=== PHASE 4: CONSOLIDATE POSTS ===')
  const { data: kids } = await sb.from('blog_posts').select('id, published_at').eq('slug', KIDS_POST).maybeSingle()
  if (!kids) console.log(`${KIDS_POST}: not found, skipping`)
  else if (!kids.published_at) console.log(`${KIDS_POST}: already unpublished`)
  else {
    console.log(`${KIDS_POST}: unpublish (was ${kids.published_at}); needs redirect /blog/${KIDS_POST} -> /blog/${PILLAR}`)
    if (APPLY) {
      const { error } = await sb.from('blog_posts').update({ published_at: null, updated_at: new Date().toISOString() }).eq('id', kids.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ unpublished')
    }
  }

  // Warn about other posts that link to the post being unpublished (they are not edited here).
  const { data: all } = await sb.from('blog_posts').select('slug, content').not('published_at', 'is', null)
  for (const p of all ?? [])
    if (p.slug !== KIDS_POST && p.content?.includes(`/blog/${KIDS_POST}`)) console.log(`   ⚠️  ${p.slug} links to ${KIDS_POST}; the redirect will cover it`)

  const { data: hindi } = await sb.from('blog_posts').select('id, content').eq('slug', HINDI_POST).single()
  if (!hindi) abort('Hindi post not found')
  if (hindi.content.includes(HINDI_LINK)) console.log(`${HINDI_POST}: already links to the pillar`)
  else {
    // Insert before the closing shop paragraph so the post still ends on the call to action.
    const blocks = hindi.content.trim().split(/\n\n+/)
    blocks.splice(blocks.length - 1, 0, HINDI_PARAGRAPH)
    const content = blocks.join('\n\n')
    console.log(`${HINDI_POST}: add link to the pillar before the final paragraph`)
    if (APPLY) {
      const { error } = await sb.from('blog_posts').update({ content, updated_at: new Date().toISOString() }).eq('id', hindi.id)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }

  console.log(APPLY ? '\nDone.' : '\nDry run complete. Re-run with --apply to write.')
}

main().catch((e) => abort(e instanceof Error ? e.message : String(e)))
