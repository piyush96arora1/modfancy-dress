import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Truck, Star } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import {
  BreadcrumbSchema,
  FaqPageSchema,
  localBusinessEntityId,
  siteUrl,
} from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Costume Shop in Noida — Buy or Rent',
  description:
    'Noida fancy dress costume shop — Krishna Nagar (Delhi) store, buy or rent from ₹200. 700+ reviews, 4.7★. WhatsApp for same-day Noida delivery.',
  path: '/fancy-dress-noida',
})

const GOOGLE_PROFILE_URL = 'https://share.google/OvjwothbT7G0sBGws'

const faqs = [
  {
    question: 'Do you have a fancy dress shop in Noida?',
    answer:
      'Our physical store is in Krishna Nagar, East Delhi — about 20–30 minutes from most Noida sectors. We do not have a separate Noida outlet, but we serve all of Noida with delivery via Porter and Rapido, and you are welcome to visit the Krishna Nagar store in person.',
  },
  {
    question: 'How do I get a costume on rent in Noida?',
    answer:
      'WhatsApp or call us with the costume name, size and your Noida address. Rental costumes start at ₹200 per event with a small refundable deposit returned when the costume comes back. We deliver to Sector 18, Sector 62, Sector 137, Greater Noida and Noida Extension.',
  },
  {
    question: 'How fast can you deliver fancy dress to Noida sectors?',
    answer:
      'Same-day delivery is usually possible within 2–4 hours when the costume is in stock, otherwise next morning. We deliver across all Noida and Greater Noida sectors. Call to confirm availability before placing a rush order.',
  },
  {
    question: 'Can Noida schools order costumes in bulk?',
    answer:
      'Yes. Many Noida schools order 50–200 costumes from us for annual functions, Republic Day and Independence Day events. We handle bulk freedom-fighter, classical dance and states-of-India sets and deliver them together to the school.',
  },
]

export default function FancyDressNoidaPage() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...(() => {
          const { '@context': _omit, ...rest } = BreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Fancy Dress Noida', url: '/fancy-dress-noida' },
          ]) as Record<string, unknown>
          return rest
        })(),
        '@id': `${siteUrl}/fancy-dress-noida#breadcrumb`,
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/fancy-dress-noida#service`,
        name: 'Fancy dress costume rental & sales in Noida',
        serviceType: 'Fancy dress costume rental & sales',
        areaServed: { '@type': 'City', name: 'Noida' },
        provider: { '@id': localBusinessEntityId() },
        url: `${siteUrl}/fancy-dress-noida`,
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
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Noida</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Costume Shop Serving Noida
      </h1>
      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Delivery to All Noida Sectors</p>
            <p className="text-sm text-[#6B6B6B]">We deliver fancy dress costumes to Sector 18, Sector 62, Sector 137, Greater Noida, Noida Extension, and all sectors via Porter and Rapido. Same-day delivery available — call to confirm availability.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Mod Fancy Dress is Delhi NCR&apos;s most trusted source for school function costumes, dance performance outfits, and special occasion fancy dress. While our store is located in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong> — just 20–30 minutes from most Noida sectors — we regularly deliver to Noida customers for school annual functions, Republic Day and Independence Day events, Diwali celebrations, Navratri performances, and themed parties. With 15+ years of experience and <strong className="text-[#2D2D2D]">700+ Google reviews at 4.7★</strong>, Noida families and schools rely on us every season.</p>
        <p>Our collection covers over <strong className="text-[#2D2D2D]">400 costume styles</strong>, including <Link href="/category/leaders-freedom-fighters" className="text-[#C8956C] hover:underline font-medium">freedom fighter costumes</Link> (Bhagat Singh, Subhas Chandra Bose, Gandhi), <Link href="/category/classical-dance-dress" className="text-[#C8956C] hover:underline font-medium">classical dance costumes</Link> (Bharatanatyam, Kathak, Garba), <Link href="/category/janmashtami-dress" className="text-[#C8956C] hover:underline font-medium">Janmashtami costumes</Link> (Krishna, Radha), <Link href="/category/states-fancy-dress" className="text-[#C8956C] hover:underline font-medium">states of India fancy dress</Link>, festival wear, mythological characters, and international fancy dress (doctor, police, chef, astronaut). Many Noida schools trust us for bulk orders of 50–200 costumes for annual functions.</p>
        <p>We also offer <Link href="/rent" className="text-[#C8956C] hover:underline font-medium">rental costumes</Link> starting at <strong className="text-[#2D2D2D]">₹200 per event</strong> — ideal for one-time school events where buying isn&apos;t practical. Rental costumes are available in child and adult sizes. A refundable deposit is taken and returned when the costume is returned.</p>
        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">How to Order from Noida</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Browse our costume catalogue on this website</li>
          <li>WhatsApp or call us with the costume name, size, and your delivery address</li>
          <li>We confirm availability and delivery time (usually 2–4 hours for same-day, or next morning)</li>
          <li>Pay on delivery via cash or UPI</li>
        </ol>
        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Popular Costumes for Noida Schools</h2>
        <p>Based on orders from Noida, the most popular costumes are: freedom fighter costumes for Republic Day (Jan 26) and Independence Day (Aug 15); classical dance costumes for annual functions; Navratri/Garba costumes; and professional costumes (doctor, nurse, police) for career-day events.</p>
        <p>For school bulk orders of 50+ costumes, see our <Link href="/wholesale/schools" className="text-[#C8956C] hover:underline font-medium">dedicated schools &amp; bulk orders page</Link>. You can also <Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline font-medium">visit our Delhi store</Link> in Krishna Nagar if you prefer to browse in person before ordering delivery to Noida.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <a href={whatsappUrl('Hi, I need fancy dress costumes delivered to Noida.')} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full">WhatsApp for Noida Delivery</Button>
        </a>
        <Link href="/products" className="flex-1">
          <Button size="lg" variant="outline" className="w-full">Browse All Costumes</Button>
        </Link>
      </div>
      <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2D2D2D]">Store Address (also available to visit)</p>
            <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
            <p className="mt-1"><a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#C8956C] hover:underline">{BUSINESS_PHONE_DISPLAY}</a> — Open daily 10 AM – 9:30 PM</p>
            <p className="mt-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#C8956C] shrink-0" />
              <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-[#C8956C] hover:underline">View us on Google (700+ reviews, 4.7★)</a>
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
          title="Mod Fancy Dress store — Krishna Nagar, Delhi (serves Noida)"
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
          Fancy Dress in Noida — FAQs
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
          <Link href="/rent" className="text-[#C8956C] hover:underline font-medium">Costume rental</Link>
          <Link href="/category/leaders-freedom-fighters" className="text-[#C8956C] hover:underline font-medium">Freedom fighter costumes</Link>
          <Link href="/category/classical-dance-dress" className="text-[#C8956C] hover:underline font-medium">Classical dance dress</Link>
          <Link href="/category/janmashtami-dress" className="text-[#C8956C] hover:underline font-medium">Janmashtami dress</Link>
          <Link href="/category/states-fancy-dress" className="text-[#C8956C] hover:underline font-medium">States fancy dress</Link>
          <Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline font-medium">Fancy dress Delhi</Link>
          <Link href="/fancy-dress-gurgaon" className="text-[#C8956C] hover:underline font-medium">Fancy dress Gurgaon</Link>
        </div>
      </div>
    </div>
  )
}
