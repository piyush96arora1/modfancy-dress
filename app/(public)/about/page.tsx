import Link from 'next/link'
import { Award, MapPin, Users, Truck, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { OrganizationSchema, BreadcrumbSchema } from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'About Us - Mod Fancy Dress | Fancy Dress Costumes Delhi & NCR',
  description:
    'Learn about Mod Fancy Dress: 15+ years of fancy dress costumes for schools and events. Based in Krishna Nagar, Delhi; serving NCR and customers across India.',
  path: '/about',
})

export default function AboutPage() {
  const organizationSchema = OrganizationSchema()
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="fade-in max-w-4xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-[#2D2D2D]">About Us</span>
        </nav>

        <header className="text-center mb-10 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
            About Mod Fancy Dress
          </h1>
          <p className="text-sm md:text-base text-[#6B6B6B] max-w-2xl mx-auto leading-relaxed">
            We help schools, parents, and organisers look their best — with quality costumes, fair pricing, and
            dependable service across Delhi, NCR, and beyond.
          </p>
        </header>

        <section className="bg-[#F5F3F0] rounded-xl p-5 md:p-6 mb-6" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FBF5EF] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#C8956C]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">
                Our story
              </h2>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                For more than <strong className="text-[#2D2D2D]">15 years</strong>, Mod Fancy Dress has been a go-to
                source for fancy dress and performance outfits in Delhi. We&apos;ve supported{' '}
                <strong className="text-[#2D2D2D]">400+ school functions</strong> and countless celebrations — from
                annual days and dance competitions to themed events and cultural programmes.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="bg-white rounded-xl border border-[#E8E5E0] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="w-10 h-10 rounded-full bg-[#EEF1F7] flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-[#1B2A4A]" />
            </div>
            <h2 className="font-semibold text-[#1B2A4A] mb-2 text-sm font-[family-name:var(--font-outfit)]">
              Who we serve
            </h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              Schools, colleges, dance groups, parents, and bulk buyers. Whether you need one costume or outfits for an
              entire class, we work with you on sizes, themes, and timelines.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E8E5E0] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="w-10 h-10 rounded-full bg-[#FBF5EF] flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-[#C8956C]" />
            </div>
            <h2 className="font-semibold text-[#1B2A4A] mb-2 text-sm font-[family-name:var(--font-outfit)]">
              Where we reach
            </h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              Our store is in <strong className="text-[#2D2D2D]">Krishna Nagar, Delhi</strong>. We regularly serve
              customers across <strong className="text-[#2D2D2D]">Delhi, Noida, Gurugram, Ghaziabad, Faridabad</strong>
              , and the wider NCR — and we coordinate delivery and shipping for many other locations. Ask us what works
              for your pin code.
            </p>
          </div>
        </div>

        <section
          className="bg-white rounded-xl border border-[#E8E5E0] p-5 md:p-6 mb-8"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#1B2A4A] shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-[#1B2A4A] mb-2 text-sm font-[family-name:var(--font-outfit)]">
                Visit us
              </h2>
              <address className="not-italic text-sm text-[#6B6B6B] leading-relaxed">
                S64, South Anarkali, Som Bazar
                <br />
                Krishna Nagar, Delhi 110051
              </address>
              <p className="text-xs text-[#9A9A9A] mt-2">Open daily 10:00 – 21:30</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
          <Link href="/contact" className="sm:inline-flex">
            <Button size="lg" className="w-full sm:w-auto bg-[#1B2A4A] hover:bg-[#152238]">
              Contact us
            </Button>
          </Link>
          <Link href="/products" className="sm:inline-flex">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Browse products
            </Button>
          </Link>
          <Link href="/wholesale" className="sm:inline-flex">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Wholesale &amp; bulk
            </Button>
          </Link>
          <Link href="/faq" className="sm:inline-flex">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              FAQ
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
