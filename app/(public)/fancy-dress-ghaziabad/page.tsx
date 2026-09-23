import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Truck, Star, Route } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import {
  BreadcrumbSchema,
  FaqPageSchema,
  localBusinessEntityId,
  siteUrl,
} from '@/lib/seo/structured-data'
import { MapFacade } from '@/components/public/MapFacade'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress in Ghaziabad — Rent or Buy',
  description:
    'Fancy dress for Ghaziabad from our Krishna Nagar, Delhi store: dandiya, garba, Ramleela and dance costumes. Delivery to Indirapuram, Vaishali and Vasundhara.',
  path: '/fancy-dress-ghaziabad',
})

const GOOGLE_PROFILE_URL = 'https://share.google/OvjwothbT7G0sBGws'

const AREAS = ['Indirapuram', 'Vaishali', 'Vasundhara', 'Kaushambi', 'Raj Nagar Extension']

const faqs = [
  {
    question: 'Do you have a fancy dress shop in Ghaziabad?',
    answer:
      'No. Our only store is in Krishna Nagar, East Delhi, just across the border from Ghaziabad. It is about 20–30 minutes by road from Indirapuram, Vaishali, Vasundhara and Kaushambi via Anand Vihar. We serve Ghaziabad with delivery, and you are welcome to visit the store in person.',
  },
  {
    question: 'Do you deliver fancy dress costumes to Indirapuram, Vaishali and Vasundhara?',
    answer:
      'Yes. We deliver to Indirapuram, Vaishali, Vasundhara, Kaushambi, Raj Nagar Extension and the rest of Ghaziabad through Porter or Rapido. The delivery charge depends on your location. Same-day delivery is often possible when the costume is in stock. WhatsApp us first to confirm.',
  },
  {
    question: 'Can I rent a costume for a school function in Ghaziabad?',
    answer:
      'Yes. Most of our costumes can be rented for a single event, with a refundable deposit returned when the costume comes back. Send the costume name, size and event date on WhatsApp and we will confirm availability. For school annual functions, Navratri and Ramleela season, book a few days ahead, because popular sizes go quickly.',
  },
  {
    question: 'Can Ghaziabad schools order costumes in bulk?',
    answer:
      'Yes. Send your costume list, quantities, size breakdown and event date on WhatsApp and we will send a per-piece price list. Bulk orders can be delivered together to the school or collected from the Krishna Nagar store. See our schools and bulk orders page for pricing tiers.',
  },
]

const seasonalLinks = [
  { href: '/category/dandiya-dress', label: 'Dandiya dress' },
  { href: '/category/garba-dress', label: 'Garba dress' },
  { href: '/category/ramleela-costumes', label: 'Ramleela costumes' },
  { href: '/category/dance-dress', label: 'Dance dress' },
  { href: '/category/helper-costumes', label: 'Community helper costumes' },
]

export default function FancyDressGhaziabadPage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...(() => {
          const { '@context': _omit, ...rest } = BreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Fancy Dress Ghaziabad', url: '/fancy-dress-ghaziabad' },
          ]) as Record<string, unknown>
          return rest
        })(),
        '@id': `${siteUrl}/fancy-dress-ghaziabad#breadcrumb`,
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/fancy-dress-ghaziabad#service`,
        name: 'Fancy dress costume rental & sales in Ghaziabad',
        serviceType: 'Fancy dress costume rental & sales',
        areaServed: [
          { '@type': 'City', name: 'Ghaziabad' },
          ...AREAS.map((name) => ({ '@type': 'Place', name: `${name}, Ghaziabad` })),
        ],
        provider: { '@id': localBusinessEntityId() },
        url: `${siteUrl}/fancy-dress-ghaziabad`,
      },
      (() => {
        const { '@context': _omit, ...rest } = FaqPageSchema(faqs) as Record<string, unknown>
        return rest
      })(),
    ],
  }

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <nav className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Ghaziabad</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Costumes for Ghaziabad
      </h1>
      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Delivery across Ghaziabad</p>
            <p className="text-sm text-[#6B6B6B]">We deliver to {AREAS.slice(0, -1).join(', ')} and {AREAS[AREAS.length - 1]} through Porter or Rapido. The delivery charge depends on your location. Same-day delivery is often possible when the costume is in stock, so WhatsApp us to confirm.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Mod Fancy Dress has supplied costumes for school functions, dance performances and festivals for 15+ years. Our only store is in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong>, just across the Delhi–Ghaziabad border, and we deliver across Ghaziabad. We have <strong className="text-[#2D2D2D]">700+ Google reviews at 4.7★</strong>.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Getting to the store from Ghaziabad</h2>
        <div className="flex items-start gap-3">
          <Route className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" aria-hidden="true" />
          <p>From Indirapuram, Vaishali, Vasundhara or Kaushambi, the drive is usually <strong className="text-[#2D2D2D]">20–30 minutes</strong>. Take NH-9 towards Delhi, cross at Anand Vihar, and continue to Krishna Nagar. From Raj Nagar Extension, allow extra time for traffic on the way to NH-9. Ask for &ldquo;Som Bazar, South Anarkali, Krishna Nagar&rdquo;. The market is well known to auto and cab drivers. If you would rather not travel, we deliver.</p>
        </div>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Costumes for school events and festivals</h2>
        <p>The categories most asked for through the school and festival season:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><Link href="/category/dandiya-dress" className="text-[#8F6240] hover:underline font-medium">Dandiya dress</Link> and <Link href="/category/garba-dress" className="text-[#8F6240] hover:underline font-medium">garba dress</Link> (chaniya choli, kediyu) for Navratri celebrations</li>
          <li><Link href="/category/ramleela-costumes" className="text-[#8F6240] hover:underline font-medium">Ramleela costumes</Link> (Ram, Sita, Lakshman, Hanuman, Ravan) for Dussehra plays</li>
          <li><Link href="/category/dance-dress" className="text-[#8F6240] hover:underline font-medium">Dance dress</Link> for annual functions and competitions</li>
          <li><Link href="/category/helper-costumes" className="text-[#8F6240] hover:underline font-medium">Community helper costumes</Link> (doctor, police, chef, postman) for primary classes</li>
        </ul>
        <p>You can <Link href="/rent" className="text-[#8F6240] hover:underline font-medium">rent a costume</Link> for a single event, with a refundable deposit returned when it comes back, or buy it outright.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">How to order from Ghaziabad</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Browse the costume catalogue on this website</li>
          <li>WhatsApp or call us with the costume name, size, event date and your Ghaziabad address</li>
          <li>We confirm availability, the delivery charge and the delivery time</li>
          <li>Pay on delivery by cash or UPI, or collect from the Krishna Nagar store</li>
        </ol>
        <p>For school bulk orders, see our <Link href="/wholesale/schools" className="text-[#8F6240] hover:underline font-medium">schools &amp; bulk orders page</Link>. You can also <Link href="/fancy-dress-delhi" className="text-[#8F6240] hover:underline font-medium">visit our Delhi store</Link> to see costumes before you order.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <a href={whatsappUrl('Hi, I need fancy dress costumes delivered to Ghaziabad.')} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full">WhatsApp for Ghaziabad Delivery</Button>
        </a>
        <Link href="/products" className="flex-1">
          <Button size="lg" variant="outline" className="w-full">Browse All Costumes</Button>
        </Link>
      </div>
      <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#8F6240] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2D2D2D]">Store address (Delhi; we deliver to Ghaziabad)</p>
            <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
            <p className="mt-1"><a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#8F6240] hover:underline">{BUSINESS_PHONE_DISPLAY}</a>. Open daily 10 AM – 9:30 PM</p>
            <p className="mt-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#8F6240] shrink-0" />
              <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-[#8F6240] hover:underline">View us on Google (700+ reviews, 4.7★)</a>
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-[#E8E5E0] mt-6">
        <MapFacade label="Mod Fancy Dress store — Krishna Nagar, Delhi (serves Ghaziabad)" height={240} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
          Fancy Dress in Ghaziabad — FAQs
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.question} className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
              <p className="font-medium text-[#2D2D2D] text-sm mb-1">{f.question}</p>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 bg-[#FBF5EF] rounded-xl p-5 border border-[#E8E5E0]">
        <p className="font-semibold text-[#1B2A4A] text-sm mb-2">Explore more</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/rent" className="text-[#8F6240] hover:underline font-medium">Costume rental</Link>
          {seasonalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-[#8F6240] hover:underline font-medium">{l.label}</Link>
          ))}
          <Link href="/fancy-dress-delhi" className="text-[#8F6240] hover:underline font-medium">Fancy dress Delhi</Link>
          <Link href="/fancy-dress-noida" className="text-[#8F6240] hover:underline font-medium">Fancy dress Noida</Link>
          <Link href="/fancy-dress-gurgaon" className="text-[#8F6240] hover:underline font-medium">Fancy dress Gurgaon</Link>
        </div>
      </div>
    </div>
  )
}
