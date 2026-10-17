import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { COURIER_FEE, FREE_COURIER_ABOVE, SHOP_PICKUP_LABEL } from '@/lib/delivery/config'
import { SAME_DAY_CUTOFF_HOUR_IST } from '@/lib/delivery/pincode'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_WHATSAPP_DISPLAY } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Shipping & Delivery Policy — Mod Fancy Dress',
  description: `Courier across India for ₹${COURIER_FEE} in 3–5 business days, same-day bike delivery in Delhi NCR, or free pickup from our Krishna Nagar shop.`,
  path: '/shipping-policy',
})

const H2 = 'text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]'

export default function ShippingPolicyPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6 font-[family-name:var(--font-outfit)]">
        Shipping &amp; Delivery Policy
      </h1>
      <p className="text-sm text-[#6B6B6B] mb-8">Last updated: October 2026</p>

      <div className="space-y-6 text-[#6B6B6B] text-sm leading-relaxed">
        <section>
          <h2 className={H2}>Delivery across India (courier)</h2>
          <p>
            Orders outside Delhi NCR are sent by courier and usually arrive in 3–5 business days. The delivery charge is a flat{' '}
            <strong>₹{COURIER_FEE}</strong> per order{FREE_COURIER_ABOVE != null ? `, free on orders of ₹${FREE_COURIER_ABOVE} or more` : ''}, shown at checkout and included in the amount you pay. We dispatch within 1 business day of confirming your order and share the courier tracking details on WhatsApp.
          </p>
        </section>
        <section>
          <h2 className={H2}>Same-day delivery in Delhi NCR</h2>
          <p>
            For Delhi, Noida, Ghaziabad, Gurugram and Faridabad we send your order by bike (Porter or a similar service) from our shop. Orders confirmed before {SAME_DAY_CUTOFF_HOUR_IST} pm go out the same day; later orders go out the next morning. The bike fare depends on distance and is <strong>paid by you to the rider on delivery</strong> — we WhatsApp you the exact fare before sending. It is not included in the online payment.
          </p>
        </section>
        <section>
          <h2 className={H2}>Free pickup from our shop</h2>
          <p>Choose “Pick up from our shop” at checkout and collect your order from {SHOP_PICKUP_LABEL} (S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051). We WhatsApp you when it is ready.</p>
        </section>
        <section>
          <h2 className={H2}>Outside India</h2>
          <p>We ship worldwide on request. Send your country and postal code on WhatsApp for a quote before ordering.</p>
        </section>
        <section>
          <h2 className={H2}>Delays and wrong addresses</h2>
          <p>Courier timelines can slip around festivals and in remote areas; if your event date is close, tell us on WhatsApp before ordering. If a parcel is returned because the address was incomplete or nobody was available, re-delivery may be charged again.</p>
        </section>
        <section>
          <h2 className={H2}>Questions</h2>
          <p>
            WhatsApp {BUSINESS_WHATSAPP_DISPLAY} or call {BUSINESS_PHONE_DISPLAY}. You can check an order any time on the{' '}
            <Link href="/track" className="text-[#8F6240] hover:underline">Track order</Link> page. See also our{' '}
            <Link href="/returns" className="text-[#8F6240] hover:underline">Returns &amp; Refund Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
