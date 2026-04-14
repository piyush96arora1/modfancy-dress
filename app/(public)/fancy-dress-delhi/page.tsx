import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Phone } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress Shop in Delhi — Krishna Nagar Store',
  description: "Mod Fancy Dress is Delhi's most trusted fancy dress costume shop. Located in Krishna Nagar, East Delhi. 400+ costumes for school functions, dance performances, and events. Visit us or order online.",
  path: '/fancy-dress-delhi',
})

export default function FancyDressDelhiPage() {
  return (
    <div className="fade-in max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
        <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
        <span>›</span>
        <span className="text-[#2D2D2D]">Fancy Dress Delhi</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
        Fancy Dress Shop in Delhi — Krishna Nagar
      </h1>

      {/* Store card */}
      <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Physical Store — Open Daily</p>
            <p className="text-sm text-[#6B6B6B]">S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051. Open 10 AM – 9:30 PM, all 7 days. Visit us in person to try sizes and see the full collection.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
        <p>Mod Fancy Dress has been Delhi's go-to costume shop for over <strong className="text-[#2D2D2D]">15 years</strong>. Our store in <strong className="text-[#2D2D2D]">Krishna Nagar, East Delhi</strong> stocks more than <strong className="text-[#2D2D2D]">400 fancy dress styles</strong> for children and adults — from classical Indian dance costumes and freedom fighter outfits to superhero costumes and international character dress. We have served <strong className="text-[#2D2D2D]">400+ school functions</strong> across Delhi NCR and hold over <strong className="text-[#2D2D2D]">700 Google reviews</strong> with a 4.7-star rating.</p>

        <p>Our store is easily accessible from most Delhi areas: <strong className="text-[#2D2D2D]">Krishna Nagar Metro Station</strong> (Blue Line) is a 5-minute walk. We regularly serve customers from East Delhi (Shahdara, Preet Vihar, Laxmi Nagar, Mayur Vihar), Central Delhi (Connaught Place, Karol Bagh), South Delhi (Saket, Hauz Khas, Greater Kailash), and North Delhi (Model Town, Pitampura, Rohini). Delivery is also available to all Delhi pin codes via Porter and Rapido.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">What We Stock</h2>
        <p>Our Delhi store stocks costumes across every category schools and events need:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[#2D2D2D]">Freedom Fighter costumes</strong> — Bhagat Singh, Subhas Chandra Bose, Gandhi, Lakshmibai, Sardar Patel. Most popular for Republic Day (26 Jan) and Independence Day (15 Aug).</li>
          <li><strong className="text-[#2D2D2D]">Classical dance costumes</strong> — Bharatanatyam, Kathak, Odissi, Garba, Kuchipudi. Available in multiple sizes for children from age 3 to adults.</li>
          <li><strong className="text-[#2D2D2D]">Mythological costumes</strong> — Krishna, Ram, Sita, Durga, Hanuman, Radha. Perfect for Janmashtami, Navratri, and school dramas.</li>
          <li><strong className="text-[#2D2D2D]">Professional costumes</strong> — Doctor, nurse, police, chef, scientist, astronaut. Used widely for career-day events and school functions.</li>
          <li><strong className="text-[#2D2D2D]">Fancy dress competition costumes</strong> — National leaders, world leaders, cartoon characters, animals, fruits, vegetables.</li>
          <li><strong className="text-[#2D2D2D]">Festival costumes</strong> — Navratri chaniya choli, Diwali traditional wear, Eid outfits, Christmas costumes.</li>
        </ul>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Buy or Rent — Both Available in Delhi</h2>
        <p>Delhi customers can both buy and rent from our Krishna Nagar store. <strong className="text-[#2D2D2D]">Purchase prices</strong> start from ₹350 for simple costumes and go up to ₹2,500 for elaborate classical dance sets. <strong className="text-[#2D2D2D]">Rental prices</strong> start at ₹200 per event — ideal for one-time occasions like school annual functions where buying is not practical. A refundable security deposit (₹500–₹2,000 depending on the costume) is taken and returned when you bring the costume back.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Bulk Orders for Delhi Schools</h2>
        <p>We specialise in bulk orders of 50–300 costumes for Delhi school annual functions. Schools from across Delhi — <strong className="text-[#2D2D2D]">DAV, Lotus Valley, LPS, KR Mangalam</strong>, and hundreds of local schools — have trusted us to supply matching sets for dance performances and dramatic presentations. Wholesale pricing is available for orders of 10 or more pieces of the same costume. Contact us on WhatsApp with your requirement and we will send you a price list within a few hours.</p>

        <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">How to Reach Our Krishna Nagar Store</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Take the Blue Line Metro to <strong className="text-[#2D2D2D]">Krishna Nagar Station</strong> — we are a 5-minute walk from Exit 2</li>
          <li>By road: Enter Krishna Nagar from the GT Road side, turn into South Anarkali market. Look for Mod Fancy Dress at S64, Som Bazar</li>
          <li>By auto or cab: Tell the driver "Som Bazar, South Anarkali, Krishna Nagar" — it is a well-known market</li>
          <li>Parking is available on the market street for two-wheelers. For cars, use the parking near Krishna Nagar Metro</li>
        </ol>
      </div>

      {/* Google Maps embed */}
      <div className="rounded-xl overflow-hidden border border-[#E8E5E0] mb-6">
        <iframe
          src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
          width="100%"
          height="280"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mod Fancy Dress store location — Krishna Nagar, Delhi"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <a href={whatsappUrl('Hi, I want to visit your Krishna Nagar store or order fancy dress costumes in Delhi.')} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="lg" className="w-full">WhatsApp Us</Button>
        </a>
        <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex-1">
          <Button size="lg" variant="outline" className="w-full gap-2">
            <Phone className="w-4 h-4" />
            {BUSINESS_PHONE_DISPLAY}
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#6B6B6B]">
        <div className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D2D2D]">Store Hours</p>
              <p>Open daily: 10:00 AM – 9:30 PM</p>
              <p className="text-xs text-[#9A9A9A] mt-1">Including Sundays and public holidays</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E8E5E0]">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#C8956C] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D2D2D]">Store Address</p>
              <address className="not-italic text-xs leading-relaxed">
                S64, South Anarkali, Som Bazar,<br />
                Krishna Nagar, Delhi 110051
              </address>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
