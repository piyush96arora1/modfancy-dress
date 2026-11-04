/**
 * Alt text for the 5 primary photos swapped on 4 Nov 2026 from
 * .scratch/ai-photos/batch-2026-11-05 (Punjabi boy-girl — was Sanskriti's composition;
 * Rajasthani boy, mango, kathak, Himachal — our biggest Google Images pages with
 * low-res or busy-background photos). Alts written from the new photos.
 */
import { sb } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const ALTS: Record<string, string> = {
  'punjabi-fancy-dress-costume-boy-girl': 'Punjabi fancy dress for a boy and girl: boy in pink kurta with blue gold-trim waistcoat and turla pagri, girl in pink kurta and salwar with blue dupatta',
  'rajasthani-boy-fancy-dress': 'Rajasthani boy fancy dress: red bandhani-print angrakha with green borders, cream dhoti and red-yellow pagdi',
  'mango-fancy-dress': 'Mango fancy dress for kids: yellow mango-shaped costume with a smiling face, green leaves and a green leaf cap',
  'kathak-fancy-dress': 'Kathak dress for girls: white anarkali with gold and red border, pink net dupatta, gold belt and ghungroo',
  'himachal-fancy-dress': 'Himachal fancy dress for girls: green lehenga with gold border, pink kurta, green half jacket, green dupatta and Himachali topi',
}
;(async () => {
  for (const [slug, alt] of Object.entries(ALTS)) {
    const { data: p, error } = await sb.from('products').select('id').eq('slug', slug).single()
    if (error) throw new Error(`${slug}: ${error.message}`)
    const { error: e } = await sb.from('product_images').update({ alt_text: alt }).eq('product_id', (p as { id: string }).id).eq('is_primary', true)
    console.log(e ? `❌ ${slug} ${e.message}` : `✅ ${slug}`)
  }
  await revalidateSite('catalog')
})()
