import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata = generatePageMetadata({
  title: 'Privacy Policy — Mod Fancy Dress',
  description: 'Privacy policy for modfancydress.com. How we collect, use, and protect your information.',
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-6 font-[family-name:var(--font-outfit)]">
        Privacy Policy
      </h1>
      <p className="text-sm text-[#9A9A9A] mb-8">Last updated: March 2026</p>

      <div className="space-y-6 text-[#6B6B6B] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Information We Collect</h2>
          <p>When you contact us via WhatsApp, phone, or our enquiry form, we collect your name and contact details to process your order or enquiry. We do not collect payment information directly — all payments are handled in person or via standard payment methods.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">How We Use Your Information</h2>
          <p>We use your contact details only to respond to your enquiries and fulfil your costume orders. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Cookies</h2>
          <p>This website uses only essential cookies required for cart functionality and session management. No advertising or tracking cookies are used.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Data Retention</h2>
          <p>Order and contact information is retained only as long as necessary to complete your order and comply with applicable laws. You may request deletion of your data by contacting us at the number below.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">Contact</h2>
          <p>If you have questions about this privacy policy or your personal data, please contact us: <strong>+91 93113 65366</strong> or visit our store at S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051.</p>
        </section>
      </div>
    </div>
  )
}
