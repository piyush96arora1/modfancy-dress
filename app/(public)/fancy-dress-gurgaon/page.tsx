import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Truck, Star } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import {
  BreadcrumbSchema,
  FaqPageSchema,
  localBusinessEntityId,
} from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Costume on Rent in Gurgaon — Fancy Dress',
  description:
    'Fancy dress costume shop serving Gurgaon from our Krishna Nagar, Delhi store. Buy or rent from ₹200. 700+ reviews, 4.7★. Visit or WhatsApp for Gurugram delivery.',
  path: '/fancy-dress-gurgaon',
})

const GOOGLE_PROFILE_URL = 'https://share.google/OvjwothbT7G0sBGws'

const faqs = [
  {
    question: 'Do you have a fancy dress shop in Gurgaon?',
    answer:
      'Our physical store is in Krishna Nagar, East Delhi (S64, South Anarkali, Som Bazar). We do not have a Gurgaon outlet, but we regularly serve Gurgaon customers with costume delivery to DLF Phases, Sohna Road, Golf Course Road, Cyber City and other areas, plus the option to visit our Delhi store.',
  },
  {
    question: 'Can I get a costume on rent in Gurgaon?',
    answer:
      'Yes. Rental costumes start from ₹200 per event with a refundable deposit, and we deliver to Gurgaon. Please book at least 2 days in advance for outstation delivery so we can confirm availability and timing for your area.',
  },
  {
    question: 'How much does fancy dress cost in Gurgaon?',
    answer:
      'You can buy or rent costumes from ₹200. We stock 400+ styles across school, classical dance, freedom fighter, Janmashtami and state costume themes. Bulk and school orders get tiered pricing — share your list on WhatsApp for an exact quote.',
  },
  {
    question: 'How do I order fancy dress costumes for a Gurgaon school function?',
    answer:
      'Browse the catalogue, note costume names, sizes and your event date, then WhatsApp or call us with your Gurgaon delivery address. We confirm availability, delivery charges and timing, and you pay on delivery by cash or UPI. We have coordinated 100–300 costume sets for Gurgaon school productions.',
  },
]

function stripContext(node: Record<string, unknown>): Record<string, unknown> {
  const { '@context': _ctx, ...rest } = node
  return rest
}

const cityUrl = 'https://www.modfancydress.com/fancy-dress-gurgaon'

const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      ...stripContext(
        BreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Fancy Dress Gurgaon', url: '/fancy-dress-gurgaon' },
        ]) as Record<string, unknown>
      ),
      '@id': `${cityUrl}#breadcrumb`,
    },
    {
      '@type': 'Service',
      '@id': `${cityUrl}#service`,
      serviceType: 'Fancy dress costume rental & sales',
      name: 'Fancy dress costume rental & sales in Gurgaon',
      areaServed: { '@type': 'City', name: 'Gurugram' },
      provider: { '@id': localBusinessEntityId() },
    },
    stripContext(FaqPageSchema(faqs) as Record<string, unknown>),
  ],
}

export default function FancyDressGurgaonPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Gurgaon</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Costume on Rent &amp; Fancy Dress in Gurgaon
      </h1>
      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Serving Gurgaon (Gurugram) with delivery</p>
            <p className="text-sm text-[#6B6B6B]">We deliver to DLF Phases, Sohna Road, Golf Course Road, Cyber City, and other Gurgaon areas. Advance booking recommended — call us to confirm availability and timing for your area.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Looking for a fancy dress costume in Gurgaon? Most local shops carry limited stock, especially for niche categories like classical dance costumes, freedom fighter outfits, or multi-character school sets. Mod Fancy Dress is a fancy dress costume shop based in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong> — with 15+ years of experience, 700+ Google reviews and a 4.7★ rating — and we regularly serve Gurgaon (Gurugram) with delivery for school events and occasions. We do not have a Gurgaon outlet; you buy or rent through delivery or by visiting our Delhi store.</p>
        <p>You can <strong className="text-[#2D2D2D]">buy or rent costumes from ₹200</strong>. We stock over 400 styles, including <Link href="/category/leaders-freedom-fighters" className="text-[#C8956C] hover:underline font-medium">leaders &amp; freedom fighters</Link>, <Link href="/category/classical-dance-dress" className="text-[#C8956C] hover:underline font-medium">classical dance dresses</Link>, <Link href="/category/janmashtami-dress" className="text-[#C8956C] hover:underline font-medium">Janmashtami costumes</Link> and <Link href="/category/states-fancy-dress" className="text-[#C8956C] hover:underline font-medium">states of India fancy dress</Link>. Need a costume just for one event? See our <Link href="/rent" className="text-[#C8956C] hover:underline font-medium">rental range</Link> starting at ₹200 per event.</p>
        <p>We specialise in <strong className="text-[#2D2D2D]">bulk orders for Gurgaon schools</strong> — many corporate school campuses in Gurgaon host large annual functions requiring 100–300 costumes. We have experience coordinating multi-character sets for entire school productions, including classical Indian dance, historical, and folk costume themes.</p>
        <p>For school bulk orders of 100–300 costumes, see our <Link href="/wholesale/schools" className="text-[#C8956C] hover:underline font-medium">schools &amp; bulk orders page</Link> for pricing tiers and the ordering process. You can also <Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline font-medium">visit our Delhi store</Link> to see costumes before placing a large order, or check how we serve nearby <Link href="/fancy-dress-noida" className="text-[#C8956C] hover:underline font-medium">Noida</Link>.</p>
        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Ordering Process for Gurgaon</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Browse the full catalogue at modfancydress.com/products</li>
          <li>Note the costume names, sizes needed, and your event date</li>
          <li>WhatsApp or call with your requirements and Gurgaon delivery address</li>
          <li>We confirm availability, delivery charges, and timing</li>
          <li>Pay on delivery via cash or UPI</li>
        </ol>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <a href={whatsappUrl('Hi, I need fancy dress costumes delivered to Gurgaon.')} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full">WhatsApp for Gurgaon Delivery</Button>
        </a>
        <Link href="/products" className="flex-1">
          <Button size="lg" variant="outline" className="w-full">Browse All Costumes</Button>
        </Link>
      </div>

      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-8 border border-[#E8E5E0]">
        <h2 className="text-base font-semibold text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]">Explore</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/rent" className="text-[#C8956C] hover:underline">Costume Rentals</Link>
          <Link href="/category/leaders-freedom-fighters" className="text-[#C8956C] hover:underline">Leaders &amp; Freedom Fighters</Link>
          <Link href="/category/classical-dance-dress" className="text-[#C8956C] hover:underline">Classical Dance Dress</Link>
          <Link href="/category/janmashtami-dress" className="text-[#C8956C] hover:underline">Janmashtami Dress</Link>
          <Link href="/category/states-fancy-dress" className="text-[#C8956C] hover:underline">States Fancy Dress</Link>
          <Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline">Fancy Dress Delhi</Link>
          <Link href="/fancy-dress-noida" className="text-[#C8956C] hover:underline">Fancy Dress Noida</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2D2D2D]">Store Address (serving Gurgaon)</p>
            <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
            <p className="mt-1"><a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#C8956C] hover:underline">{BUSINESS_PHONE_DISPLAY}</a> — Open daily 10 AM – 9:30 PM</p>
            <p className="mt-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#C8956C] shrink-0" />
              <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956C] hover:underline font-medium">View us on Google — 700+ reviews, 4.7★</a>
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-[#E8E5E0] mt-6">
        <iframe
          src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
          width="100%"
          height="240"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mod Fancy Dress store — Krishna Nagar, Delhi (serves Gurgaon)"
        />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">Fancy Dress in Gurgaon — FAQs</h2>
        <div className="space-y-5">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-[#2D2D2D] text-sm mb-1">{faq.question}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
