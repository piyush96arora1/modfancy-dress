import Link from 'next/link'
import { Phone, MessageCircle, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#1B2A4A] text-white mt-auto pb-20 md:pb-0">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
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
            <h4 className="font-[family-name:var(--font-outfit)] font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
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
                <Link href="/cart" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-[#C8956C] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-[family-name:var(--font-outfit)] font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <a href="tel:+919211077110" className="flex items-center gap-2 text-white/70 hover:text-[#C8956C] transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +91 92110 77110
              </a>
              <a href="https://wa.me/919211077110" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-[#C8956C] transition-colors">
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                WhatsApp Us
              </a>
              <div className="flex items-start gap-2 text-white/70">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <address className="not-italic text-xs leading-relaxed">
                  S64, South Anarkali, Som Bazar<br />
                  Krishna Nagar, Delhi 110051
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Mod Fancy Dress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
