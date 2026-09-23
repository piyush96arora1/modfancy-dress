/**
 * Link categories to their guide posts and give every post a cover image
 * (plan: docs/superpowers/plans/2026-09-23-seo-growth-festival-season.md, Task 15).
 *
 * - categories.guide_blog_slug: set for the obvious festival/topic pairs below,
 *   only where it is still null and only when the post exists and is published.
 * - blog_posts.cover_image_url: only where null, the primary image of the top
 *   (newest live) product in the post's most relevant category.
 *
 * Needs migration 20260923_blog_links.sql. related_category_slugs is left to the
 * content pass; until it is set, a post's "Shop this guide" grid falls back to the
 * categories that name the post as their guide.
 *
 * Dry run:  npx tsx scripts/seed-guide-links.ts
 * Apply:    npx tsx scripts/seed-guide-links.ts --apply
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APPLY = process.argv.includes('--apply')

/** Resolved at run time: the English annual-function post with the most content. */
const ANNUAL_FUNCTION = '<annual-function>'

const GUIDE_FOR_CATEGORY: Record<string, string> = {
  'dandiya-dress': 'navratri-garba-dandiya-dress-guide',
  'garba-dress': 'navratri-garba-dandiya-dress-guide',
  'ramleela-costumes': 'dussehra-ramleela-costume-ideas',
  'leaders-freedom-fighters': 'freedom-fighter-fancy-dress-ideas',
  'indian-mythology-costumes': 'indian-mythological-characters-for-fancy-dress',
  'dance-dress': ANNUAL_FUNCTION,
  'classical-dance-dress': ANNUAL_FUNCTION,
  'helper-costumes': 'childrens-day-fancy-dress-ideas',
  'festival-costumes': 'diwali-fancy-dress-competition-ideas',
  halloween: 'halloween-costume-ideas-india',
}

/** Most relevant category per post, for the cover image. Unlisted posts are reported, not guessed. */
const COVER_CATEGORY_FOR_POST: Record<string, string> = {
  'navratri-garba-dandiya-dress-guide': 'dandiya-dress',
  'garba-navratri-dress-guide-hindi': 'garba-dress',
  'garba-navratri-costume-kids-guide': 'garba-dress',
  'dussehra-ramleela-costume-ideas': 'ramleela-costumes',
  'freedom-fighter-fancy-dress-ideas': 'leaders-freedom-fighters',
  'independence-day-fancy-dress-ideas': 'independence-day-dress',
  'independence-day-fancy-dress-hindi': 'independence-day-dress',
  'republic-day-fancy-dress-ideas-kids': 'republic-day-dress',
  'republic-day-fancy-dress-hindi': 'republic-day-dress',
  'republic-independence-day-fancy-dress-ideas': 'republic-day-dress',
  'indian-mythological-characters-for-fancy-dress': 'indian-mythology-costumes',
  'janmashtami-krishna-dress-guide': 'janmashtami-dress',
  'how-to-choose-kathak-dance-costume': 'kathak-dress',
  'kathak-dance-dress-guide-hindi': 'kathak-dress',
  'which-classical-dance-costume-for-your-child': 'classical-dance-dress',
  'fancy-dress-ideas-school-annual-function': 'dance-dress',
  'school-annual-function-fancy-dress-guide': 'dance-dress',
  'school-annual-function-fancy-dress-ideas-hindi': 'dance-dress',
  'fancy-dress-competition-ideas': 'animal-costumes',
  'fancy-dress-on-rent-guide-for-parents': 'states-fancy-dress',
  'rent-or-buy-fancy-dress-costume': 'states-fancy-dress',
  'childrens-day-fancy-dress-ideas': 'helper-costumes',
  'diwali-fancy-dress-competition-ideas': 'festival-costumes',
  'halloween-costume-ideas-india': 'halloween',
}

type Post = { slug: string; language: string; content: string | null; published_at: string | null; cover_image_url: string | null }
type Cat = { id: string; slug: string; is_active: boolean; guide_blog_slug: string | null }

async function write(label: string, op: () => PromiseLike<{ error: { message: string } | null }>) {
  if (!APPLY) return console.log(`  [dry] ${label}`)
  const { error } = await op()
  if (error) throw new Error(`${label}: ${error.message}`)
  console.log(`  [ok]  ${label}`)
}

/** Primary image of the newest live product in a category (primary category or junction). */
async function topProductImage(categoryId: string): Promise<{ slug: string; url: string } | null> {
  const { data: junction } = await sb.from('product_categories').select('product_id').eq('category_id', categoryId)
  const ids = (junction ?? []).map((j) => j.product_id)
  let q = sb
    .from('products')
    .select('slug, created_at, images:product_images(image_url, is_primary)')
    .eq('is_active', true)
    .is('deleted_at', null)
  q = ids.length > 0 ? q.or(`category_id.eq.${categoryId},id.in.(${ids.join(',')})`) : q.eq('category_id', categoryId)
  const { data, error } = await q.order('created_at', { ascending: false }).limit(10)
  if (error) throw error
  for (const p of data ?? []) {
    const imgs = (p.images ?? []) as { image_url: string; is_primary: boolean | null }[]
    const img = imgs.find((i) => i.is_primary) ?? imgs[0]
    if (img?.image_url) return { slug: p.slug, url: img.image_url }
  }
  return null
}

async function main() {
  const probe = await sb.from('categories').select('guide_blog_slug').limit(1)
  const probe2 = await sb.from('blog_posts').select('cover_image_url').limit(1)
  if (probe.error || probe2.error) {
    console.error('Migration 20260923_blog_links.sql is not applied yet (guide_blog_slug / cover_image_url missing). Apply it, then re-run.')
    process.exit(1)
  }
  console.log(APPLY ? 'APPLY' : 'dry run')

  const { data: posts, error: pErr } = await sb.from('blog_posts').select('slug, language, content, published_at, cover_image_url')
  if (pErr) throw pErr
  const { data: cats, error: cErr } = await sb.from('categories').select('id, slug, is_active, guide_blog_slug')
  if (cErr) throw cErr
  const published = new Map((posts as Post[]).filter((p) => p.published_at).map((p) => [p.slug, p]))
  const catBySlug = new Map((cats as Cat[]).map((c) => [c.slug, c]))

  const annual = [...published.values()]
    .filter((p) => p.language === 'en' && p.slug.includes('annual-function'))
    .sort((a, b) => (b.content?.length ?? 0) - (a.content?.length ?? 0))[0]?.slug

  console.log('\nCategory → guide')
  for (const [catSlug, target] of Object.entries(GUIDE_FOR_CATEGORY)) {
    const postSlug = target === ANNUAL_FUNCTION ? annual : target
    const cat = catBySlug.get(catSlug)
    if (!cat) { console.log(`  [skip] ${catSlug}: no such category`); continue }
    if (!postSlug || !published.has(postSlug)) { console.log(`  [skip] ${catSlug}: post ${postSlug ?? target} not published`); continue }
    if (cat.guide_blog_slug) { console.log(`  [keep] ${catSlug} already → ${cat.guide_blog_slug}`); continue }
    await write(`${catSlug} → ${postSlug}`, () =>
      sb.from('categories').update({ guide_blog_slug: postSlug }).eq('id', cat.id).is('guide_blog_slug', null))
  }

  console.log('\nPost covers (only where null)')
  for (const post of published.values()) {
    if (post.cover_image_url) { console.log(`  [keep] ${post.slug}`); continue }
    const catSlug = COVER_CATEGORY_FOR_POST[post.slug]
    const cat = catSlug ? catBySlug.get(catSlug) : undefined
    if (!cat) { console.log(`  [skip] ${post.slug}: no cover category mapped`); continue }
    const top = await topProductImage(cat.id)
    if (!top) { console.log(`  [skip] ${post.slug}: ${catSlug} has no live product with an image`); continue }
    await write(`${post.slug} ← ${catSlug}/${top.slug}`, () =>
      sb.from('blog_posts').update({ cover_image_url: top.url }).eq('slug', post.slug).is('cover_image_url', null))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
