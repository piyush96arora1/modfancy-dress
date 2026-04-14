import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Truck } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Costumes in Gurgaon — Delivery Available',
  description: 'Fancy dress costumes delivered to Gurgaon from our Delhi store. School function specialists with 400+ costume styles. Call or WhatsApp for delivery to DLF, Sohna Road, Cyber City area.',
  path: '/fancy-dress-gurgaon',
})

export default function FancyDressGurgaonPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Gurgaon</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Costumes in Gurgaon
      </h1>
      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Delivery to Gurgaon</p>
            <p className="text-sm text-[#6B6B6B]">We deliver to DLF Phases, Sohna Road, Golf Course Road, Cyber City, and other Gurgaon areas. Advance booking recommended — call us to confirm availability and timing for your area.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Getting quality fancy dress costumes in Gurgaon can be challenging. Most local shops have limited stock, especially for niche categories like classical dance costumes, freedom fighter outfits, or multi-character school sets. Mod Fancy Dress, based in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong>, stocks over 400 costume styles and regularly delivers to Gurgaon for school events and occasions.</p>
        <p>We specialise in <strong className="text-[#2D2D2D]">bulk orders for Gurgaon schools</strong> — many corporate school campuses in Gurgaon host large annual functions requiring 100–300 costumes. We have experience coordinating multi-character sets for entire school productions, including classical Indian dance, historical, and folk costume themes.</p>
        <p>Rental costumes are also available from ₹200/event with delivery to Gurgaon. Please book at least 2 days in advance for outstation delivery to ensure availability.</p>
        <p>For school bulk orders of 100–300 costumes, see our <Link href="/wholesale/schools" className="text-[#C8956C] hover:underline font-medium">schools &amp; bulk orders page</Link> for pricing tiers and the ordering process. You can also <Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline font-medium">visit our Delhi store</Link> to see costumes before placing a large order.</p>
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
      <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B]">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2D2D2D]">Store Address</p>
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
          title="Mod Fancy Dress store — Krishna Nagar, Delhi (serves Gurgaon)"
        />
      </div>
    </div>
  )
}
