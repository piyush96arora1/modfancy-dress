import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Phone,
  Clock,
  ClipboardList,
  MessageCircle,
  Package,
} from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import { BreadcrumbSchema, FaqPageSchema } from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Wholesale Market in Delhi — Krishna Nagar Supplier',
  description:
    'Visit the fancy dress wholesale market in Krishna Nagar, East Delhi. How to reach us, shop timings, what to bring, bulk discount tiers, and how to order on WhatsApp.',
  path: '/wholesale/delhi-market',
})

const pricingTiers = [
  { range: '10–49 pieces', discount: '15% off' },
  { range: '50–99 pieces', discount: '20% off' },
  { range: '100–299 pieces', discount: '25% off' },
  { range: '300+ pieces', discount: '30% off' },
]

const whatToBring = [
  'A written requirement list — costume names or themes, not "something for annual day"',
  'Total quantity, and how many of each style',
  'A size breakdown by age (ages 3–14) or S/M/L/XL for adults',
  'Your event date — it decides stock versus lead time',
  'A rough budget per piece, so we show the right shelf first',
  'Reference photos if the costume must match a theme',
]

const remoteSteps = [
  'Send your requirement list, quantity, size breakdown and event date',
  'We confirm what is in stock and send rates against your tier',
  'Ask for photos or a video of the actual pieces before you commit',
  'Pay the 30% advance on orders above ₹10,000 to hold the stock',
  'We pack and label per size, so the box needs no re-sorting',
  'Pay the balance on delivery by cash or UPI',
]

const FAQS = [
  {
    question: 'Where is the fancy dress wholesale market in Delhi?',
    answer:
      'The costume market most Delhi buyers mean is Krishna Nagar in East Delhi. Mod Fancy Dress is at S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051, open daily 10 AM to 9:30 PM including Sundays.',
  },
  {
    question: 'What is the nearest metro station to the Krishna Nagar costume market?',
    answer:
      'Krishna Nagar metro station is the nearest Metro stop. From there the market is a short walk, or a very quick auto ride into the South Anarkali and Som Bazar lanes.',
  },
  {
    question: 'What is the minimum order for wholesale fancy dress prices in Delhi?',
    answer:
      'Wholesale pricing starts at 10 pieces: 15% off for 10–49, 20% off for 50–99, 25% off for 100–299, and 30% off for 300 and above. Below 10 pieces we sell at retail, from ₹200 to buy or rent.',
  },
  {
    question: 'Can I buy fancy dress wholesale from Delhi without visiting the market?',
    answer:
      'Yes. Send your requirement list, quantity, size breakdown and event date on WhatsApp and we will confirm stock and send rates. Orders above ₹10,000 need a 30% advance, balance on delivery by cash or UPI. Within Delhi NCR we deliver via Porter or Rapido, or you can arrange pickup.',
  },
]

export default function WholesaleDelhiMarketPage() {
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Wholesale', url: '/wholesale' },
    { name: 'Delhi Wholesale Market', url: '/wholesale/delhi-market' },
  ])
  const faqSchema = FaqPageSchema(FAQS)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="fade-in max-w-3xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
          <span>›</span>
          <Link href="/wholesale" className="hover:text-[#1B2A4A]">Wholesale</Link>
          <span>›</span>
          <span className="text-[#2D2D2D]">Delhi Wholesale Market</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
          Fancy Dress Wholesale Market in Delhi — Krishna Nagar
        </h1>

        <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1B2A4A] text-sm mb-1">S64, Som Bazar, Krishna Nagar — open daily</p>
              <p className="text-sm text-[#6B6B6B]">Message us before a bulk visit and we will have your sizes ready on the counter.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <p>If you are searching for the fancy dress wholesale market in Delhi, you are looking for <strong className="text-[#2D2D2D]">Krishna Nagar in East Delhi</strong>. Mod Fancy Dress has supplied costumes from this market for over <strong className="text-[#2D2D2D]">15 years</strong>. This page is for buyers, not browsers: where the market is, how to reach it, what a bulk visit looks like, and how to order remotely.</p>


          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Where the Market Is</h2>
          <p>Our shop is at <strong className="text-[#2D2D2D]">S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</strong>. Krishna Nagar is a long-established retail and wholesale market area in East Delhi, and the South Anarkali and Som Bazar lanes are where costume buyers get pointed. It is a dense street market — narrow lanes, shops close together, stock stacked high — which is the point: you can handle real inventory and settle sizing in an afternoon, not over weeks of couriered samples.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Why Buyers Come Here for Costumes</h2>
          <p>Costumes are a category where photographs only take you so far. A dance set that photographs beautifully can be the wrong weight for children under stage lights, and a kurta cut for a ten-year-old looks identical on screen to one cut for a six-year-old. When you are dressing forty children in one colour, the only way to be sure piece one matches piece forty is to see them side by side.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Visiting the Market — How to Reach Us</h2>

          <h3 className="text-base font-semibold text-[#2D2D2D] font-[family-name:var(--font-outfit)]">By Metro</h3>
          <p><strong className="text-[#2D2D2D]">Krishna Nagar metro station</strong> is the nearest Metro stop. From there the market is a short walk, or a very quick auto ride if you are carrying bags.</p>

          <h3 className="text-base font-semibold text-[#2D2D2D] font-[family-name:var(--font-outfit)]">By Road, Auto or Cab</h3>
          <p>Enter Krishna Nagar from the GT Road side and turn into the South Anarkali market lane. In an auto or cab, just say <strong className="text-[#2D2D2D]">&ldquo;Som Bazar, South Anarkali, Krishna Nagar&rdquo;</strong> — East Delhi drivers know it without an address.</p>

          <h3 className="text-base font-semibold text-[#2D2D2D] font-[family-name:var(--font-outfit)]">Parking and Timings</h3>
          <p>We are open <strong className="text-[#2D2D2D]">daily, 10 AM to 9:30 PM</strong>, including Sundays and public holidays. Parking is street parking, as in most older Delhi market lanes: two-wheelers usually park on the market street, while cars are easier to leave near Krishna Nagar Metro. For a bulk visit, come on a <strong className="text-[#2D2D2D]">weekday morning between 10 AM and 1 PM</strong> — the lanes are calmer and you get unhurried attention.
</p>


          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">What to Expect When You Visit</h2>
          <p>Expect a working market, not a showroom. Stock sits by category rather than on mannequins, so tell us what you need and we will pull the sets out. We carry <strong className="text-[#2D2D2D]">400+ costume styles</strong> — classical and folk dance, freedom fighters, mythological characters, states of India, professions, animals and festival wear — most available to buy or rent from ₹200. Sizes run from <strong className="text-[#2D2D2D]">age 3 to 14</strong> for children and <strong className="text-[#2D2D2D]">S to XL</strong> for adults. If a size is not on the shelf, we will say whether we can arrange it before your date.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">What to Bring to the Market</h2>
          <p>Buyers who settle everything in an hour are the ones who arrive prepared:</p>
          <ul className="list-disc pl-5 space-y-1">
            {whatToBring.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Wholesale Rates at the Shop</h2>
          <p>Wholesale pricing starts at 10 pieces of the same costume style:</p>
        </div>

        {/* Pricing tiers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {pricingTiers.map((tier) => (
            <div key={tier.range} className="rounded-xl border border-[#E8E5E0] bg-white p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <p className="font-semibold text-[#1B2A4A] text-xs">{tier.range}</p>
              <p className="text-xl font-bold text-[#8F6240] mt-1">{tier.discount}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <p>For orders above <strong className="text-[#2D2D2D]">₹10,000</strong> we take a <strong className="text-[#2D2D2D]">30% advance</strong>, balance on delivery by cash or UPI. Carrying the stock away yourself? Settle at the counter and walk out with it.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Buying Remotely if You&apos;re Outside Delhi</h2>
          <p>Plenty of our bulk buyers never set foot in the market — the whole order runs over WhatsApp.</p>
          <ol className="list-decimal pl-5 space-y-2">
            {remoteSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>Within <strong className="text-[#2D2D2D]">Delhi NCR</strong> we send orders through Porter or Rapido. You can also collect from the shop, or have a transporter pick it up. Outside NCR, tell us where you are based and how you want the goods moved, and we will work out the practical option before you pay.</p>
          <p>Ordering remotely, over-communicate on sizes — send ages or heights rather than shirt sizes. It is the single biggest cause of a bulk costume order needing a swap.</p>

          <div className="rounded-xl border border-[#E8E5E0] bg-[#F5F3F0] p-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Who we supply from this market</p>
                <p className="text-xs text-[#6B6B6B]">
                  <strong className="text-[#2D2D2D]">400+ school functions</strong> supplied, <strong className="text-[#2D2D2D]">700+ reviews at 4.7★</strong>. See{' '}
                  <Link href="/wholesale/schools" className="text-[#8F6240] hover:underline">schools &amp; bulk orders</Link>,{' '}
                  <Link href="/wholesale/resellers" className="text-[#8F6240] hover:underline">reseller supply</Link>, or{' '}
                  <Link href="/wholesale/dance-academies" className="text-[#8F6240] hover:underline">dance academies</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={whatsappUrl('Hi, I want to buy fancy dress costumes wholesale from your Krishna Nagar shop. Can you share rates?')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button size="lg" className="w-full gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp for Wholesale Rates
            </Button>
          </a>
          <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex-1">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <Phone className="w-4 h-4" />
              {BUSINESS_PHONE_DISPLAY}
            </Button>
          </a>
        </div>

        {/* Address + timings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#6B6B6B] mb-6">
          <div className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#2D2D2D]">Shop Address</p>
                <address className="not-italic text-xs leading-relaxed">
                  S64, South Anarkali, Som Bazar,<br />
                  Krishna Nagar, Delhi 110051
                </address>
                <p className="mt-1 text-xs">
                  <a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#8F6240] hover:underline">{BUSINESS_PHONE_DISPLAY}</a>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#2D2D2D]">Market Timings</p>
                <p className="text-xs">Open daily 10:00 AM – 9:30 PM</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Best for bulk visits: weekdays, 10 AM – 1 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-[#E8E5E0] mb-8">
          <iframe
            src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
            width="100%"
            height="240"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mod Fancy Dress — fancy dress wholesale market, Krishna Nagar, Delhi"
          />
        </div>

        {/* FAQ section — same Q/A as FaqPageSchema above */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
            Krishna Nagar Fancy Dress Market — FAQs
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
                <h3 className="font-semibold text-[#2D2D2D] text-sm mb-1.5">{faq.question}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]">
            Next Steps
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Link href="/wholesale" className="text-sm px-3 py-1.5 rounded-full bg-[#FBF5EF] border border-[#E8E5E0] text-[#1B2A4A] hover:border-[#C8956C]">Wholesale Catalogue</Link>
            <Link href="/wholesale/schools" className="text-sm px-3 py-1.5 rounded-full bg-[#FBF5EF] border border-[#E8E5E0] text-[#1B2A4A] hover:border-[#C8956C]">Schools &amp; Bulk Orders</Link>
            <Link href="/wholesale/resellers" className="text-sm px-3 py-1.5 rounded-full bg-[#FBF5EF] border border-[#E8E5E0] text-[#1B2A4A] hover:border-[#C8956C]">Resellers &amp; Shops</Link>
            <Link href="/wholesale/dance-academies" className="text-sm px-3 py-1.5 rounded-full bg-[#FBF5EF] border border-[#E8E5E0] text-[#1B2A4A] hover:border-[#C8956C]">Dance Academies</Link>
            <Link href="/fancy-dress-delhi" className="text-sm px-3 py-1.5 rounded-full bg-[#FBF5EF] border border-[#E8E5E0] text-[#1B2A4A] hover:border-[#C8956C]">Fancy Dress in Delhi</Link>
          </div>
          <p className="text-sm text-[#6B6B6B] leading-relaxed flex items-start gap-2">
            <ClipboardList className="w-4 h-4 text-[#8F6240] shrink-0 mt-0.5" />
            <span>
              Buying one costume rather than a bulk lot? Our{' '}
              <Link href="/fancy-dress-delhi" className="font-semibold text-[#1B2A4A] underline decoration-[#C8956C] underline-offset-2">Delhi costume shop page</Link>{' '}
              covers retail and rental from the same shop. For a stock check before you travel,{' '}
              <Link href="/contact" className="font-semibold text-[#1B2A4A] underline decoration-[#C8956C] underline-offset-2">get in touch</Link>.
            </span>
          </p>
        </section>
      </div>
    </>
  )
}
