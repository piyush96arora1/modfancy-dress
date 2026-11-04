/**
 * Covers and "Shop this guide" grids for the 4 Nov blog posts (review, 4 Nov 2026).
 *
 * The five posts published on 4 Nov rendered as text only: no cover image (the
 * other 20 posts all have one) and no product grid, because the grid comes from
 * related_category_slugs or a category's guide_blog_slug and neither was set.
 * Image search drives 2.6× our web impressions, so a post without images also
 * misses that channel.
 *
 * Covers are real product photos only where the photo shows what the post is
 * about. Angel and Ambedkar get no product cover (we stock neither costume);
 * their covers come separately.
 *
 * Dry run:  npx tsx scripts/followups/blog-covers-and-shop-grids-2026-11.ts
 * Apply:    npx tsx scripts/followups/blog-covers-and-shop-grids-2026-11.ts --apply
 */
import { sb } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')

const POSTS: { slug: string; coverFrom?: string; related: string[] }[] = [
  { slug: 'angel-dialogues-for-fancy-dress-competition', related: ['cartoon-characters', 'imaginary-character', 'western-dance-dress'] },
  { slug: 'princess-speech-for-fancy-dress-competition', coverFrom: 'princess-frock-fancy-dress', related: ['cartoon-characters', 'imaginary-character'] },
  { slug: 'save-nature-fancy-dress-ideas', coverFrom: 'tree-fancy-dress-costume', related: ['nature-costumes', 'flower-costumes', 'bird-costumes'] },
  { slug: 'ambedkar-fancy-dress-speech', related: ['leaders-freedom-fighters'] },
  { slug: 'states-of-india-traditional-dresses', coverFrom: 'punjabi-fancy-dress-costume-boy-girl', related: ['states-fancy-dress', 'folk-dance-dress', 'rajasthani-dress'] },
]

;(async () => {
  const { data: cats } = await sb.from('categories').select('slug').eq('is_active', true)
  const active = new Set((cats ?? []).map((c) => c.slug))
  for (const p of POSTS) {
    for (const c of p.related) if (!active.has(c)) throw new Error(`${p.slug}: ${c} is not an active category`)
    const update: Record<string, unknown> = { related_category_slugs: p.related }
    if (p.coverFrom) {
      const { data: prod, error } = await sb.from('products').select('images:product_images(image_url,is_primary)').eq('slug', p.coverFrom).single()
      if (error) throw new Error(`${p.coverFrom}: ${error.message}`)
      const imgs = (prod as { images: { image_url: string; is_primary: boolean }[] }).images
      update.cover_image_url = (imgs.find((i) => i.is_primary) ?? imgs[0]).image_url
    }
    console.log(`${p.slug}: ${JSON.stringify(update)}`)
    if (APPLY) {
      const { error } = await sb.from('blog_posts').update(update).eq('slug', p.slug)
      console.log(error ? `   ❌ ${error.message}` : '   ✅ written')
    }
  }
  if (APPLY) await revalidateSite('content')
  else console.log('Dry run only. Pass --apply to write.')
})()
