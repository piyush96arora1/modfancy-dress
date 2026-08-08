import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Store, RefreshCw, CalendarDays, TrendingUp, Truck, Wallet, XCircle } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import { BreadcrumbSchema, FaqPageSchema } from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Wholesale for Retailers & Resellers — Costume Dealer Delhi',
  description: 'Buy costumes in bulk to resell. Tiered wholesale pricing from 10 pieces, fast restocking, a seasonal buying calendar and shipping across India from our Krishna Nagar, Delhi counter.',
  path: '/wholesale/resellers',
})

const pricingTiers = [
  { range: '10–49 pieces', discount: '15% off', note: 'Min. 10 of same costume' },
  { range: '50–99 pieces', discount: '20% off', note: 'Mixed styles allowed' },
  { range: '100–299 pieces', discount: '25% off', note: 'Dedicated coordinator' },
  { range: '300+ pieces', discount: '30% off', note: 'Custom quote + priority packing' },
]

const sellingSeasons = [
  {
    season: 'Republic Day — 26 January',
    buyWindow: 'Buy December to early January',
    stock: 'Freedom fighters, leaders, tricolour, states of India',
  },
  {
    season: 'Annual function season — November to February',
    buyWindow: 'Buy from October',
    stock: 'Classical dance, state costumes, professions, fruits, vegetables, animals',
  },
  {
    season: 'Independence Day — 15 August',
    buyWindow: 'Buy early July',
    stock: 'The same patriotic range, on its second run',
  },
  {
    season: 'Janmashtami — August / September',
    buyWindow: 'Buy four to six weeks ahead',
    stock: 'Krishna, Radha, gopi sets, mor pankh, flute',
  },
  {
    season: 'Navratri & Durga Puja — September / October',
    buyWindow: 'Buy in August',
    stock: 'Chaniya choli, garba wear, Durga, Lakshmi, Saraswati',
  },
  {
    season: 'Diwali — October / November',
    buyWindow: 'Buy in September',
    stock: 'Ram, Sita, Hanuman, Ravana, mythological sets',
  },
  {
    season: 'Christmas — December',
    buyWindow: 'Buy in November',
    stock: 'Santa, angel, snowman, reindeer, Christmas tree',
  },
]

const fastMovers = [
  { name: 'Mythological characters', why: 'Sell year-round, spike three times.' },
  { name: 'Freedom fighters & leaders', why: 'Two guaranteed national spikes.' },
  { name: 'States of India', why: 'Buy wide, not deep.' },
  { name: 'Classical dance costumes', why: 'Reordered outside festival season.' },
  { name: 'Professions & career day', why: 'Low seasonality, steady turnover.' },
  { name: 'Animals, fruits & vegetables', why: 'Nursery sizes, high repeat volume.' },
]

const notOffered = [
  { title: 'No dropshipping', detail: 'We do not ship single pieces to your customer under your name.' },
  { title: 'No exclusive territory', detail: 'You will not be the only reseller in your city or market.' },
  { title: 'No credit terms', detail: 'No credit account, no consignment, no payment after sale.' },
  { title: 'No evergreen stock guarantee', detail: 'Styles shift with season and supply — confirm before promising a customer.' },
]

const faqs = [
  {
    question: 'What is the minimum order to get reseller pricing?',
    answer: 'Pricing starts at 10 pieces of one costume (15% off); from 50 pieces you can mix styles (20% off). We do not publish a fixed minimum order value — WhatsApp us to discuss.',
  },
  {
    question: 'Do you offer dropshipping for online sellers?',
    answer: 'No. We do not dispatch single pieces under your name — you buy in bulk, hold the stock and fulfil your own orders.',
  },
  {
    question: 'Will you give me exclusive rights for my city?',
    answer: 'No. We do not offer exclusive territory or distributor rights. Any buyer who meets the piece count gets the same tier.',
  },
  {
    question: 'Can I pay after I sell the stock?',
    answer: 'No. Orders above ₹10,000 need a 30% advance, balance on delivery by cash or UPI. No credit accounts, consignment or sale-or-return.',
  },
  {
    question: 'Do you ship outside Delhi NCR?',
    answer: 'Yes. Porter or Rapido inside Delhi NCR, or pickup. Elsewhere we dispatch by transport or courier, and shipping charges are extra according to location — share your pin code for a quote.',
  },
  {
    question: 'When should I buy Republic Day and Independence Day stock?',
    answer: 'Buy the Republic Day range in December or early January and the Independence Day range in early July — the same stock both times, so buy it deep once.',
  },
]

export default function WholesaleResellersPage() {
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Wholesale', url: '/wholesale' },
    { name: 'Retailers & Resellers', url: '/wholesale/resellers' },
  ])

  const faqSchema = FaqPageSchema(faqs)

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
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
          <span>›</span>
          <Link href="/wholesale" className="hover:text-[#1B2A4A]">Wholesale</Link>
          <span>›</span>
          <span className="text-[#2D2D2D]">Retailers &amp; Resellers</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
          Fancy Dress Wholesale for Retailers &amp; Resellers
        </h1>

        <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1B2A4A] text-sm mb-1">For shops, online sellers and rental businesses</p>
              <p className="text-sm text-[#6B6B6B]">We supply costume shops, party-supply stores, Meesho, Amazon, Flipkart and Instagram sellers, event-rental firms and boutiques from our Krishna Nagar counter.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <p>If you buy costumes to sell on, you shop differently from a school. A school buys once, for one function, on one date. You are buying <strong className="text-[#2D2D2D]">stock</strong> — so cost per piece, how fast a style turns and what you still hold in February decide your margin. Buying for one school event instead? See <Link href="/wholesale/schools" className="text-[#C8956C] hover:underline">bulk costumes for schools</Link>.</p>

          <p>Mod Fancy Dress has supplied costumes for <strong className="text-[#2D2D2D]">15+ years</strong> from Krishna Nagar, inside the Delhi wholesale market. We carry <strong className="text-[#2D2D2D]">400+ styles</strong> in ages 3–14 and adult S–XL, have supplied <strong className="text-[#2D2D2D]">400+ school functions</strong>, and hold <strong className="text-[#2D2D2D]">700+ reviews at 4.7★</strong>.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Reseller Pricing — How the Tiers Work</h2>
          <p>Discounts apply to retail price per piece; the tier is set by total pieces on one order:</p>
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
          <p>The line that matters to a reseller is <strong className="text-[#2D2D2D]">50–99 pieces</strong>, where mixed styles are allowed — one order across eight or ten costumes, still at 20% off, which builds a shelf instead of dressing one event. The 15% tier needs 10 of the same costume: fine for a school&apos;s matching set, risky before a style has proved itself.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Minimum Order to Open a Reseller Account</h2>
          <p>No application form, no membership fee — the entry point is simply 10 pieces of one costume. We do not publish a fixed minimum order value, because the figure swings with your style mix; WhatsApp us the categories you want to stock and we will say what a workable first order looks like. Browse <Link href="/products" className="text-[#C8956C] hover:underline">the catalogue</Link> first.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Restocking and Repeat Orders</h2>
        </div>

        <div className="rounded-xl border border-[#E8E5E0] bg-white p-4 mb-8">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
            <p className="text-sm text-[#6B6B6B] leading-relaxed">Send the costume names and size breakdown from your last invoice back on the same WhatsApp thread — we check stock and return an updated quote. In peak weeks stock moves fast, so confirm before promising a date.</p>
          </div>
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Seasonality — Your Buying Calendar</h2>
          <p>Costume demand in India arrives in sharp, predictable spikes; margin depends on buying before a spike, not during it:</p>
        </div>

        {/* Seasonal buying calendar */}
        <div className="space-y-3 mb-8">
          {sellingSeasons.map((s) => (
            <div key={s.season} className="rounded-xl border border-[#E8E5E0] bg-[#F5F3F0] p-4">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-[#1B2A4A] text-sm">{s.season}</h3>
                  <p className="text-xs text-[#C8956C] font-medium mt-0.5">{s.buyWindow}</p>
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{s.stock}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <p>The patriotic range sells twice a year, so buy it deep once; annual-function season runs through January. <Link href="/wholesale/dance-academies" className="text-[#C8956C] hover:underline">Dance academies</Link> peak around recitals instead.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Which Categories Sell Fastest</h2>
        </div>

        {/* Fast movers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {fastMovers.map((c) => (
            <div key={c.name} className="rounded-xl border border-[#E8E5E0] bg-white p-4">
              <div className="flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-[#2D2D2D] text-sm">{c.name}</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{c.why}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Packaging, Labelling and How Stock Arrives</h2>
          <p>Orders are packed style-wise and size-wise with bundles labelled, so you can shelve or dispatch without opening everything. Tell us how to split it — by style for shop display, by size for marketplace picking. Need barcodes or MRP tags? WhatsApp us first.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Shipping Outside Delhi NCR</h2>
        </div>

        <div className="rounded-xl border border-[#E8E5E0] bg-[#FBF5EF] p-4 mb-8">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
            <p className="text-sm text-[#6B6B6B] leading-relaxed">Inside Delhi NCR: Porter or Rapido delivery, or pickup from the store. Outside NCR: transport or courier, with <strong className="text-[#2D2D2D]">shipping charges extra according to location</strong>, quoted separately from the goods. Send your city and pin code for a freight quote, and allow extra transit days — or make one buying trip a season, using the <Link href="/wholesale/delhi-market" className="text-[#C8956C] hover:underline">Delhi market guide</Link>.</p>
          </div>
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Payment Terms</h2>
          <div className="rounded-xl border border-[#E8E5E0] bg-white p-4">
            <div className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
              <p>A <strong className="text-[#2D2D2D]">30% advance</strong> on orders above ₹10,000, balance on delivery by <strong className="text-[#2D2D2D]">cash or UPI</strong>. Same on a first order and a tenth.</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">What We Do Not Offer</h2>
          <p>Saying this plainly saves us both a wasted enquiry:</p>
        </div>

        {/* Honest limitations */}
        <div className="space-y-3 mb-8">
          {notOffered.map((item) => (
            <div key={item.title} className="rounded-xl border border-[#E8E5E0] bg-[#F5F3F0] p-4">
              <div className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-[#9A9A9A] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-[#2D2D2D] text-sm">{item.title}</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ section — same Q/A as FaqPageSchema above */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
            Reseller Wholesale — FAQs
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
                <h3 className="font-semibold text-[#2D2D2D] text-sm mb-1.5">{faq.question}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-6">
          Send your categories, piece count, size split and delivery city for a tier price. Prefer to write it out? Use the <Link href="/contact" className="text-[#C8956C] hover:underline">contact page</Link>, or the <Link href="/wholesale" className="text-[#C8956C] hover:underline">wholesale overview</Link>.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={whatsappUrl('Hi, I am a reseller and want to buy fancy dress costumes in bulk to sell. Can you share reseller pricing?')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button size="lg" className="w-full">WhatsApp for Reseller Pricing</Button>
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
              <p className="font-medium text-[#2D2D2D]">Wholesale Counter</p>
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
            title="Mod Fancy Dress wholesale counter — Krishna Nagar, Delhi (costume wholesale dealer for resellers)"
          />
        </div>
      </div>
    </>
  )
}
