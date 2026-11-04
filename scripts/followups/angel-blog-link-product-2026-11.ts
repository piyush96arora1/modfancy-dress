/**
 * Angel dialogues post: link the angel dress uploaded 4 Nov and use its photo as the
 * cover (the post had no cover because we stocked no angel costume when it was written).
 * One-off, applied 4 Nov 2026; re-running throws once the anchor text is gone.
 */
import { sb } from '../lib/festival-content'
;(async () => {
  const { data: prod } = await sb.from('products').select('images:product_images(image_url,is_primary)').eq('slug', 'angel-fancy-dress').single()
  const imgs = (prod as { images: { image_url: string; is_primary: boolean }[] }).images; const cover = (imgs.find((i) => i.is_primary) ?? imgs[0]).image_url
  const { data: post } = await sb.from('blog_posts').select('id, content').eq('slug', 'angel-dialogues-for-fancy-dress-competition').single()
  const p = post as { id: string; content: string }
  let c = p.content
  const from = 'An angel look has four parts, and you can put it together in an evening:'
  const to = 'The quickest option is our ready-made [angel dress](/products/angel-fancy-dress): a white lace frock with sequin tiers, wings, a wand and a headband, ready to rent or buy. To put the look together yourself, an angel has four parts:'
  if (!c.includes(from)) throw new Error('anchor not found')
  c = c.replace(from, to)
  const { error } = await sb.from('blog_posts').update({ content: c, cover_image_url: cover }).eq('id', p.id)
  console.log(error ? error.message : 'ok ' + cover.split('/').pop())
})()
