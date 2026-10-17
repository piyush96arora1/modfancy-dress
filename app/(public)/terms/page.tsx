import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_WHATSAPP_DISPLAY } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Terms & Conditions — Mod Fancy Dress',
  description: 'Terms for buying and renting costumes from Mod Fancy Dress, Krishna Nagar, Delhi: orders, prices, online payment, delivery, cancellations and returns.',
  path: '/terms',
})

const H2 = 'text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]'

export default function TermsPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6 font-[family-name:var(--font-outfit)]">
        Terms &amp; Conditions
      </h1>
      <p className="text-sm text-[#6B6B6B] mb-8">Last updated: October 2026</p>

      <div className="space-y-6 text-[#6B6B6B] text-sm leading-relaxed">
        <section>
          <h2 className={H2}>Who we are</h2>
          <p>
            modfancydress.com is run by Mod Fancy Dress, S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051, India. Contact: {BUSINESS_PHONE_DISPLAY} (call) or {BUSINESS_WHATSAPP_DISPLAY} (WhatsApp). By placing an order you agree to these terms.
          </p>
        </section>
        <section>
          <h2 className={H2}>Products and prices</h2>
          <p>All prices are in Indian Rupees (₹) and include applicable taxes unless stated otherwise. Photos are representative; colours, embellishments and accessories can vary slightly between batches. We may correct obvious pricing errors before confirming an order.</p>
        </section>
        <section>
          <h2 className={H2}>Placing an order</h2>
          <p>You can pay online at checkout, or place the order and pay later after we confirm it on WhatsApp. An order is accepted when payment is received or when we confirm it with you. If an item turns out to be unavailable, we will offer an alternative or a full refund.</p>
        </section>
        <section>
          <h2 className={H2}>Online payment</h2>
          <p>Online payments (UPI, cards, net banking, wallets) are processed securely by Cashfree Payments. We never see or store your card details or UPI PIN. If a payment fails but money is debited, it is returned to you by your bank or Cashfree, normally within 3–5 working days.</p>
        </section>
        <section>
          <h2 className={H2}>Delivery</h2>
          <p>Delivery options, charges and timelines are described in our <Link href="/shipping-policy" className="text-[#8F6240] hover:underline">Shipping &amp; Delivery Policy</Link>.</p>
        </section>
        <section>
          <h2 className={H2}>Cancellations, returns and refunds</h2>
          <p>You can cancel a prepaid order for a full refund until it is dispatched or handed over. After delivery, our <Link href="/returns" className="text-[#8F6240] hover:underline">Returns &amp; Refund Policy</Link> applies. Rentals are governed by the deposit terms shared at booking.</p>
        </section>
        <section>
          <h2 className={H2}>Use of costumes</h2>
          <p>Costumes, wigs and accessories should be used under adult supervision for young children. Please check sizes before your event; we are happy to help on WhatsApp.</p>
        </section>
        <section>
          <h2 className={H2}>Liability</h2>
          <p>Our liability for any order is limited to the amount you paid for it. We are not responsible for delays caused by couriers, weather, strikes or other events outside our control, but we will always help you find a solution.</p>
        </section>
        <section>
          <h2 className={H2}>Governing law</h2>
          <p>These terms are governed by the laws of India, and courts in Delhi have jurisdiction.</p>
        </section>
        <section>
          <h2 className={H2}>Privacy</h2>
          <p>How we handle your details is explained in our <Link href="/privacy-policy" className="text-[#8F6240] hover:underline">Privacy Policy</Link>.</p>
        </section>
      </div>
    </div>
  )
}
