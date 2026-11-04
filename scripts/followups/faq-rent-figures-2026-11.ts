/**
 * FAQ answers still quoting rent figures after remove-rent-prices-2026-11.ts
 * (that script covered products, categories and blog posts, not the faqs table).
 * Rent rates are not published (owner, Aug 2026; reconfirmed 4 Nov 2026).
 *
 * Dry run:  npx tsx scripts/followups/faq-rent-figures-2026-11.ts
 * Apply:    npx tsx scripts/followups/faq-rent-figures-2026-11.ts --apply
 */
import { sb } from '../lib/festival-content'
import { revalidateSite } from '../lib/revalidate'

const APPLY = process.argv.includes('--apply')
const FIXES: [string, string, string][] = [
  [
    '247697a2-fbb5-44f9-9c72-2cc1208272d2',
    'It depends on the costume: ₹500 deposit for costumes up to ₹200 rent, ₹1,000 for ₹201–₹500 rent, and ₹2,000 for costumes above ₹500 rent.',
    'It is ₹500 to ₹2,000 depending on the costume; WhatsApp us the costume name and we will tell you the rent and deposit.',
  ],
  [
    'ed0505e3-1421-4623-82c4-6095cbff6066',
    'Rentals start from around ₹300 per event, with pickup',
    'Rent is per event, with pickup',
  ],
]

;(async () => {
  for (const [id, from, to] of FIXES) {
    const { data, error } = await sb.from('faqs').select('answer').eq('id', id).single()
    if (error) throw new Error(error.message)
    const answer = (data as { answer: string }).answer
    if (!answer.includes(from)) throw new Error(`${id}: text not found`)
    const next = answer.replace(from, to)
    console.log(`${id}\n  + ${next}`)
    if (APPLY) {
      const { error: e } = await sb.from('faqs').update({ answer: next }).eq('id', id)
      console.log(e ? `  ❌ ${e.message}` : '  ✅ written')
    }
  }
  if (APPLY) await revalidateSite('content')
  else console.log('Dry run only. Pass --apply to write.')
})()
