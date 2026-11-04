/**
 * Alt text for the primary photos replaced on 4 Nov 2026 (low-resolution / screenshot
 * photos regenerated with ChatGPT, see .scratch/ai-photos/lowres-2026-11). The swap
 * keeps the old primary alt, and for these five it was generic or empty. Written
 * from the new photos.
 *
 * Dry run:  npx tsx scripts/followups/ai-photo-alts-2026-11.ts
 * Apply:    npx tsx scripts/followups/ai-photo-alts-2026-11.ts --apply
 */
import { sb } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
const ALTS: Record<string, string> = {
  'astronaut-fancy-dress': 'Silver astronaut costume: shiny silver space suit with black straps and belt, worn with a white and black helmet under the arm',
  'sun-flower-fancy-dress': 'Sunflower costume for kids: green jumpsuit with a big sunflower on the chest and a sunflower petal headpiece',
  'gabbar-fancy-dress': 'Gabbar fancy dress: olive green shirt and trousers with a bullet bandolier, brown belt, holster, wrist bands and toy pistol',
  'kargil-fancy-dress': 'Kargil army dress for kids: green camouflage uniform with pockets, belt, army cap and black boots',
  'kalbelia-dress-costume-for-girls-fancy-dress': 'Kalbelia dress for girls: black lehenga with yellow, red and white bands, black choli, net veil and silver jewellery',
}

;(async () => {
  for (const [slug, alt] of Object.entries(ALTS)) {
    const { data: p, error } = await sb.from('products').select('id').eq('slug', slug).single()
    if (error) throw new Error(`${slug}: ${error.message}`)
    const { data: img } = await sb.from('product_images').select('id, alt_text').eq('product_id', (p as { id: string }).id).eq('is_primary', true).single()
    const row = img as { id: string; alt_text: string | null }
    console.log(`${slug}\n  - ${row.alt_text}\n  + ${alt}`)
    if (APPLY) {
      const { error: e } = await sb.from('product_images').update({ alt_text: alt }).eq('id', row.id)
      console.log(e ? `  ❌ ${e.message}` : '  ✅')
    }
  }
  if (APPLY) await revalidateSite('catalog')
  else console.log('Dry run only. Pass --apply to write.')
})()
