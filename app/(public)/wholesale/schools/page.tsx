import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, CheckCircle, Package } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Bulk Fancy Dress Costumes for Schools — Wholesale Supplier Delhi',
  description: 'Bulk fancy dress costume orders for school annual functions, Republic Day, Independence Day events. 10–300+ costumes, wholesale prices, matching sets guaranteed. Based in Krishna Nagar, Delhi. WhatsApp for quote.',
  path: '/wholesale/schools',
})

const pricingTiers = [
  { range: '10–49 pieces', discount: '15% off', note: 'Min. 10 of same costume' },
  { range: '50–99 pieces', discount: '20% off', note: 'Mixed styles allowed' },
  { range: '100–299 pieces', discount: '25% off', note: 'Dedicated coordinator' },
  { range: '300+ pieces', discount: '30% off', note: 'Custom quote + priority packing' },
]

const popularSets = [
  {
    event: 'Republic Day / Independence Day',
    costumes: ['Bhagat Singh', 'Subhas Chandra Bose', 'Mahatma Gandhi', 'Rani Lakshmibai', 'Sardar Patel', 'Jawaharlal Nehru', 'State folk costumes'],
  },
  {
    event: 'Annual Function / Cultural Programme',
    costumes: ['Bharatanatyam', 'Kathak', 'Garba / Chaniya Choli', 'Odissi', 'State costumes (all 28 states)', 'Tribal costumes'],
  },
  {
    event: 'Navratri / Diwali / Festive Events',
    costumes: ['Krishna / Radha sets', 'Durga / Lakshmi / Saraswati', 'Navratri chaniya choli', 'Ram / Sita / Hanuman', 'Diwali diyas and ethnic wear'],
  },
  {
    event: 'Career Day / Fancy Dress Competition',
    costumes: ['Doctor / Nurse', 'Police / Army', 'Chef / Baker', 'Scientist / Astronaut', 'Teacher / Engineer', 'Fruits, Vegetables, Animals'],
  },
]

export default function WholesaleSchoolsPage() {
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Wholesale', url: '/wholesale' },
    { name: 'Schools & Bulk Orders', url: '/wholesale/schools' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="fade-in max-w-3xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
          <span>›</span>
          <Link href="/wholesale" className="hover:text-[#1B2A4A]">Wholesale</Link>
          <span>›</span>
          <span className="text-[#2D2D2D]">Schools &amp; Bulk Orders</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
          Bulk Fancy Dress Costumes for Schools
        </h1>

        <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Trusted by 400+ Schools Across Delhi NCR</p>
              <p className="text-sm text-[#6B6B6B]">We supply matching sets of 10–300+ costumes for school annual functions, Republic Day, Independence Day, Navratri, and cultural programmes. WhatsApp us your requirement and we will send a price list within a few hours.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <p>Mod Fancy Dress is Delhi NCR's specialist supplier for school bulk costume orders. Our store in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong> stocks over <strong className="text-[#2D2D2D]">400 costume styles</strong> with dedicated inventory for bulk orders. Schools including <strong className="text-[#2D2D2D]">DAV, Lotus Valley, LPS, KR Mangalam</strong>, and hundreds of private and government schools across Delhi NCR have placed orders with us for their annual functions and national day celebrations.</p>

          <p>We understand the specific needs of school events: <strong className="text-[#2D2D2D]">matching sets</strong> in the same colour and style across multiple sizes, <strong className="text-[#2D2D2D]">child-safe materials</strong> suitable for stage performances, and <strong className="text-[#2D2D2D]">reliable delivery</strong> before the event date. We hold stock for the most popular school event costumes so we can fulfil large orders with short lead times.</p>

          <p>Both <strong className="text-[#2D2D2D]">purchase and rental</strong> options are available for bulk orders. Schools that need costumes for a one-time annual function often choose rental to keep costs low. Schools that host multiple events per year often buy so they can reuse the costumes. We can advise on the best option based on your use case.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Wholesale Pricing Tiers</h2>
          <p>Discounts apply to retail price per piece when ordering the same costume style in bulk:</p>
        </div>

        {/* Pricing table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {pricingTiers.map((tier) => (
            <div key={tier.range} className="rounded-xl border border-[#E8E5E0] bg-white p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <p className="font-semibold text-[#1B2A4A] text-sm">{tier.range}</p>
              <p className="text-2xl font-bold text-[#C8956C] my-1">{tier.discount}</p>
              <p className="text-xs text-[#9A9A9A]">{tier.note}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Popular Costume Sets for School Events</h2>
        </div>

        {/* Event costume sets */}
        <div className="space-y-4 mb-8">
          {popularSets.map((set) => (
            <div key={set.event} className="rounded-xl border border-[#E8E5E0] bg-[#F5F3F0] p-4">
              <p className="font-semibold text-[#1B2A4A] text-sm mb-2">{set.event}</p>
              <div className="flex flex-wrap gap-2">
                {set.costumes.map((c) => (
                  <span key={c} className="text-xs bg-white border border-[#E8E5E0] rounded-full px-2.5 py-1 text-[#6B6B6B]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">How to Place a School Bulk Order</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>WhatsApp or call us with: <strong className="text-[#2D2D2D]">costume names, total quantity, size breakdown (age/height), event date, and delivery address</strong></li>
            <li>We confirm stock availability and send a price list within a few hours</li>
            <li>You confirm the order — a 30% advance is required for orders above ₹10,000</li>
            <li>Costumes are packed per size and labelled for easy distribution at school</li>
            <li>Delivery via Porter/Rapido to Delhi NCR, or pickup from our Krishna Nagar store</li>
            <li>Pay balance on delivery via cash or UPI</li>
          </ol>

          <div className="rounded-xl border border-[#E8E5E0] bg-white p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1B2A4A] text-sm mb-1">What schools tell us they value most</p>
                <ul className="space-y-1 text-xs text-[#6B6B6B]">
                  <li>• Matching sets across all sizes — from 3 years to adult</li>
                  <li>• Stock confirmation before the event, not the day before</li>
                  <li>• Costumes labelled and packed per size for easy school distribution</li>
                  <li>• Flexible rental option for one-time events</li>
                  <li>• Responsive WhatsApp communication with the shop owner</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Sizing for School Bulk Orders</h2>
          <p>We stock costumes in sizes covering <strong className="text-[#2D2D2D]">ages 3 to 14</strong> for children, and <strong className="text-[#2D2D2D]">S, M, L, XL</strong> for adults (teachers, parents, organisers). For most school orders we recommend sending us the age or height list and we match each child to the right size before packing.</p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={whatsappUrl('Hi, I need bulk fancy dress costumes for a school event. Can you send pricing?')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button size="lg" className="w-full">WhatsApp for School Quote</Button>
          </a>
          <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex-1">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <Phone className="w-4 h-4" />
              {BUSINESS_PHONE_DISPLAY}
            </Button>
          </a>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B] mb-6">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D2D2D]">Store Address</p>
              <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
              <p className="mt-1">
                <a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#C8956C] hover:underline">{BUSINESS_PHONE_DISPLAY}</a>
                {' '}— Open daily 10 AM – 9:30 PM
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-[#E8E5E0]">
          <iframe
            src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
            width="100%"
            height="240"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mod Fancy Dress store — Krishna Nagar, Delhi (bulk school costume supplier)"
          />
        </div>
      </div>
    </>
  )
}
