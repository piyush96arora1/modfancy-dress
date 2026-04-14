import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Truck } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Noida — Delivery Available',
  description: 'Looking for fancy dress costumes in Noida? Mod Fancy Dress (Krishna Nagar, Delhi) delivers to all sectors of Noida. 400+ costume styles, school function specialists. Call or WhatsApp for same-day delivery.',
  path: '/fancy-dress-noida',
})

export default function FancyDressNoidaPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Noida</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Costumes in Noida
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
        <p>Mod Fancy Dress is Delhi NCR&apos;s most trusted source for school function costumes, dance performance outfits, and special occasion fancy dress. While our store is located in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong> — just 20–30 minutes from most Noida sectors — we regularly deliver to Noida customers for school annual functions, Republic Day and Independence Day events, Diwali celebrations, Navratri performances, and themed parties.</p>
        <p>Our collection covers over <strong className="text-[#2D2D2D]">400 costume styles</strong>, including freedom fighter costumes (Bhagat Singh, Subhas Chandra Bose, Gandhi), classical dance costumes (Bharatanatyam, Kathak, Garba), festival wear, mythological characters (Ram, Sita, Krishna, Durga), and international fancy dress (doctor, police, chef, astronaut). Many Noida schools trust us for bulk orders of 50–200 costumes for annual functions.</p>
        <p>We also offer <strong className="text-[#2D2D2D]">rental costumes</strong> starting at ₹200 per event — ideal for one-time school events where buying isn&apos;t practical. Rental costumes are available in child and adult sizes. A refundable deposit is taken and returned when the costume is returned.</p>
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
    </div>
  )
}
