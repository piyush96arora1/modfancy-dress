import Link from 'next/link'
import { Phone, MessageCircle, MapPin, Calendar, Award, ExternalLink, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, BUSINESS_WHATSAPP_E164, whatsappUrl } from '@/lib/constants/contact'

export const metadata = generatePageMetadata({
  title: 'Contact Us - Mod Fancy Dress | Delhi Fancy Dress Shop',
  description: `Contact Mod Fancy Dress in Delhi. 15+ years experience, 400+ school functions. Call ${BUSINESS_PHONE_DISPLAY} or WhatsApp. Visit us at S64 South Anarkali, Krishna Nagar, Delhi 110051.`,
  path: '/contact',
})

export default function ContactPage() {
  const reviews = [
    { initials: 'PS', name: 'Priya Sharma', date: 'January 15, 2024', stars: 5, text: 'Excellent service! They provided amazing costumes for our school annual function. Very professional and on-time delivery. Highly recommended!', bg: 'bg-[#EEF1F7]', color: 'text-[#1B2A4A]' },
    { initials: 'RK', name: 'Rajesh Kumar', date: 'February 20, 2024', stars: 5, text: 'Great quality costumes at reasonable prices. They have a huge collection and helped us choose the perfect outfits for our dance performance. Will definitely come back!', bg: 'bg-[#FBF5EF]', color: 'text-[#C8956C]' },
    { initials: 'AM', name: 'Anita Mehta', date: 'March 10, 2024', stars: 5, text: '15 years of experience shows! They understand school requirements perfectly. Completed our function smoothly. Highly recommended for school functions.', bg: 'bg-[#F5F3F0]', color: 'text-[#6B6B6B]' },
    { initials: 'VS', name: 'Vikram Singh', date: 'April 5, 2024', stars: 4, text: 'Best fancy dress shop in Delhi. They have completed 400+ school functions and it shows in their service quality. Great collection and reasonable prices.', bg: 'bg-[#EEF1F7]', color: 'text-[#1B2A4A]' },
    { initials: 'SD', name: 'Sunita Devi', date: 'May 12, 2024', stars: 5, text: 'Very reliable and professional. They delivered exactly what we needed for our school event. Will definitely use their services again. Thank you!', bg: 'bg-[#FBF5EF]', color: 'text-[#C8956C]' },
  ]

  return (
    <div className="fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#2D2D2D]">Contact</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
              Contact Us
            </h1>
            <p className="text-sm md:text-base text-[#6B6B6B]">
              We&apos;re here to help you find the perfect fancy dress costume
            </p>
          </div>

          {/* About */}
          <div className="bg-[#F5F3F0] rounded-xl p-5 md:p-6 mb-6" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FBF5EF] flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-[#C8956C]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1B2A4A] mb-1.5 font-[family-name:var(--font-outfit)]">About Us</h2>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  We have been in the fancy dress business for over <strong className="text-[#2D2D2D]">15 years</strong>.
                  We have successfully completed more than <strong className="text-[#2D2D2D]">400 school functions</strong> —
                  from small events to large celebrations.
                </p>
              </div>
            </div>
          </div>

          {/* Bulk Orders */}
          <div className="bg-white rounded-xl p-5 md:p-6 mb-6 border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1B2A4A] mb-1 font-[family-name:var(--font-outfit)]">Bulk Orders</h2>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Planning a large event? We specialize in bulk orders. <strong className="text-[#2D2D2D]">Contact us first</strong> for a customized quotation.
                </p>
              </div>
            </div>
            <div className="bg-[#F5F3F0] rounded-lg p-4 mb-4">
              <ul className="space-y-1.5 text-sm text-[#6B6B6B]">
                <li className="flex items-center gap-2"><span className="text-emerald-600 text-xs">✓</span> Better pricing for bulk orders</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 text-xs">✓</span> Customized quotation based on needs</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 text-xs">✓</span> Flexible payment & delivery options</li>
                <li className="flex items-center gap-2"><span className="text-emerald-600 text-xs">✓</span> Expert guidance on costume selection</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex-1">
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Call for Quote
                </Button>
              </a>
              <a href={whatsappUrl("Hi, I'm interested in placing a bulk order.")} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" variant="outline" className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp for Quote
                </Button>
              </a>
            </div>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Phone */}
            <div className="bg-white rounded-xl p-5 border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#EEF1F7] rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#1B2A4A]" />
                </div>
                <h3 className="text-base font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Call Us</h3>
              </div>
              <div className="space-y-2">
                <a href={`tel:${BUSINESS_PHONE_TEL}`} className="block text-base text-[#1B2A4A] hover:text-[#C8956C] font-semibold transition-colors">{BUSINESS_PHONE_DISPLAY}</a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-xl p-5 border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">WhatsApp</h3>
              </div>
              <p className="text-sm text-[#6B6B6B] mb-3">Chat with us on WhatsApp</p>
              <a href={`https://wa.me/${BUSINESS_WHATSAPP_E164}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl p-5 border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#FBF5EF] rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#C8956C]" />
                </div>
                <h3 className="text-base font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Visit Us</h3>
              </div>
              <address className="text-sm text-[#6B6B6B] leading-relaxed not-italic">
                S64, South Anarkali<br />
                Som Bazar, Krishna Nagar<br />
                Delhi - 110051, India
              </address>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl p-5 border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#F5F3F0] rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#6B6B6B]" />
                </div>
                <h3 className="text-base font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Business Hours</h3>
              </div>
              <p className="text-sm text-[#6B6B6B]"><strong className="text-[#2D2D2D]">Daily:</strong> 10:00 AM - 9:30 PM</p>
              <p className="text-xs text-[#9A9A9A] mt-1">Open all days</p>
            </div>
          </div>

          {/* Map */}
          <div className="mb-6 rounded-xl overflow-hidden border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <iframe
              src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mod Fancy Dress — S64 South Anarkali, Krishna Nagar, Delhi"
            />
          </div>

          {/* Google Business */}
          <div className="bg-white rounded-xl p-5 border border-[#E8E5E0] mb-8" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <h3 className="text-base font-bold text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]">Find Us Online</h3>
            <div className="space-y-2">
              <a href="https://share.google/j5z6wKKjqsCHJKajh" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[#F5F3F0] hover:bg-[#FBF5EF] rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center" style={{ boxShadow: 'var(--shadow-xs)' }}>
                    <ExternalLink className="w-4 h-4 text-[#1B2A4A]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#2D2D2D]">Google Business Profile</p>
                    <p className="text-xs text-[#9A9A9A]">View our business information</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9A9A9A] group-hover:text-[#C8956C]" />
              </a>
              <a href="https://g.page/r/CdvlhuNtrqb5EAI/review" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[#F5F3F0] hover:bg-[#FBF5EF] rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center" style={{ boxShadow: 'var(--shadow-xs)' }}>
                    <Award className="w-4 h-4 text-[#C8956C]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#2D2D2D]">Leave a Review</p>
                    <p className="text-xs text-[#9A9A9A]">Share your experience with us</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9A9A9A] group-hover:text-[#C8956C]" />
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-10">
            <p className="text-sm text-[#6B6B6B] mb-4">Need help choosing the perfect costume?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`tel:${BUSINESS_PHONE_TEL}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </a>
              <a href={`https://wa.me/${BUSINESS_WHATSAPP_E164}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl p-5 md:p-6 border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3 mb-5">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Customer Reviews</h3>
                <p className="text-xs text-[#9A9A9A]">4.7 out of 5 stars from 700+ reviews</p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className={`${i < reviews.length - 1 ? 'border-b border-[#F5F3F0] pb-4' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 ${review.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`${review.color} font-bold text-xs`}>{review.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-sm text-[#2D2D2D]">{review.name}</h4>
                        <div className="flex items-center gap-0.5">
                          {[...Array(review.stars)].map((_, j) => (
                            <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                          {review.stars < 5 && [...Array(5 - review.stars)].map((_, j) => (
                            <Star key={j} className="w-3 h-3 text-[#E8E5E0]" />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#9A9A9A]">{review.date}</span>
                      </div>
                      <p className="text-sm text-[#6B6B6B] leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Google link */}
            <div className="mt-5 pt-4 border-t border-[#F5F3F0] text-center">
              <a href="https://g.page/r/CdvlhuNtrqb5EAI/review" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#C8956C] hover:text-[#A07048] font-medium transition-colors">
                <Award className="w-4 h-4" />
                Leave a Review on Google
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
  )
}
