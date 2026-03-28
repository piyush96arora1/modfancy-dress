import { generatePageMetadata } from '@/lib/seo/metadata'
import Link from 'next/link'

export const metadata = generatePageMetadata({
  title: 'Returns & Refund Policy — Mod Fancy Dress',
  description: 'Returns and refund policy for Mod Fancy Dress. Information about exchanges, rental deposits, and order cancellations.',
  path: '/returns',
})

export default function ReturnsPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6 font-[family-name:var(--font-outfit)]">
        Returns &amp; Refund Policy
      </h1>
      <p className="text-sm text-[#9A9A9A] mb-8">Last updated: March 2026</p>

      <div className="space-y-6 text-[#6B6B6B] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Purchase Returns</h2>
          <p>Costumes that are unworn and in original condition may be exchanged within 7 days of purchase. Please bring the item to our store with proof of purchase. We do not offer cash refunds on purchased items — store credit or exchange only.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Rental Deposits</h2>
          <p>A refundable security deposit is collected for all rental items. The deposit is returned in full when the costume is returned on time and in its original condition. Deductions may be made for damage beyond normal wear and tear or late returns.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Bulk / School Orders</h2>
          <p>For bulk orders placed for school events, cancellations made more than 7 days before the event date will receive a full refund. Cancellations within 7 days of the event are non-refundable due to the preparation involved.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Contact Us</h2>
          <p>
            For return or refund queries, contact us at <strong>+91 93113 65366</strong> or{' '}
            <Link href="/contact" className="text-[#C8956C] hover:underline">visit our contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
