import Link from 'next/link'
import { Phone, MessageCircle, MapPin } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, BUSINESS_WHATSAPP_E164 } from '@/lib/constants/contact'

export function Footer() {
  return (
    <footer className="bg-[#1B2A4A] text-white mt-auto pb-20 md:pb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-[family-name:var(--font-outfit)] font-bold text-xl md:text-2xl mb-3 text-white">
              Mod Fancy Dress
            </h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-4">
              Delhi's trusted fancy dress destination. 15+ years of experience crafting memorable costumes for school functions, dance performances, and celebrations.
            </p>
            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <span className="text-[#C8956C] font-semibold">15+</span> Years
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="flex items-center gap-1">
                <span className="text-[#C8956C] font-semibold">400+</span> Events
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span className="flex items-center gap-1">
                <span className="text-[#C8956C] font-semibold">700+</span> Reviews
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-[family-name:var(--font-outfit)] font-semibold text-sm uppercase tracking-wider text-white/40 mb-3">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <li>
                <Link href="/products" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/wholesale/schools" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  Bulk / Schools
                </Link>
              </li>
              <li>
                <Link href="/fancy-dress-delhi" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  Delhi Store
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-[family-name:var(--font-outfit)] font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex items-center gap-2 text-white/70 hover:text-[#C8956C] transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                {BUSINESS_PHONE_DISPLAY}
              </a>
              <a href={`https://wa.me/${BUSINESS_WHATSAPP_E164}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-[#C8956C] transition-colors">
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                WhatsApp Us
              </a>
<div className="flex items-start gap-2 text-white/70">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <address className="not-italic text-xs leading-relaxed">
                  S64, South Anarkali, Som Bazar,<br />
                  Krishna Nagar, Delhi 110051
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-5 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Link href="/privacy-policy" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/returns" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Returns &amp; Refunds
            </Link>
          </div>
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Mod Fancy Dress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
