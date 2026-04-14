import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema, FaqPageSchema } from '@/lib/seo/structured-data'
import { rentalFaqPairs } from '@/lib/seo/rental-faq-data'
import { ChevronRight, MapPin, MessageCircle, Clock } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import { BUSINESS_PHONE_DISPLAY, whatsappUrl } from '@/lib/constants/contact'
import Image from 'next/image'

export const metadata = generatePageMetadata({
  title: 'Fancy Dress on Rent in Delhi - Krishna Nagar Shop',
  description:
    'Rent fancy dress costumes in Delhi — dance, festival and competition costumes from ₹200/event. Visit our Krishna Nagar shop or enquire on WhatsApp. Refundable deposit.',
  path: '/rent',
})

type RentCategory = {
  name: string
  slug: string
  image_url: string | null
  min_rent: number
  max_rent: number
  product_count: number
}

export default async function RentPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('products')
    .select('rent_price, category:categories(name, slug, image_url)')
    .eq('is_active', true)
    .is('deleted_at', null)
    .not('rent_price', 'is', null)

  const catMap = new Map<string, RentCategory>()
  for (const row of rows ?? []) {
    const rawCat = row.category as unknown
    const cat = Array.isArray(rawCat) ? rawCat[0] as { name: string; slug: string; image_url: string | null } | undefined : rawCat as { name: string; slug: string; image_url: string | null } | null
    if (!cat) continue
    const rp = Number(row.rent_price)
    const existing = catMap.get(cat.slug)
    if (existing) {
      existing.min_rent = Math.min(existing.min_rent, rp)
      existing.max_rent = Math.max(existing.max_rent, rp)
      existing.product_count++
    } else {
      catMap.set(cat.slug, {
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url,
        min_rent: rp,
        max_rent: rp,
        product_count: 1,
      })
    }
  }

  const categories = [...catMap.values()].sort((a, b) => b.product_count - a.product_count)

  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Rent', url: '/rent' },
  ])

  const faqs = rentalFaqPairs()
  const faqSchema = FaqPageSchema(faqs)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': 'https://www.modfancydress.com/rent#service',
    name: 'Fancy Dress Costume Rental',
    serviceType: 'Costume Rental',
    description: 'Rent fancy dress costumes in Delhi NCR. 400+ styles including dance, festival, and competition costumes. Prices from ₹200 per event with refundable deposit.',
    url: 'https://www.modfancydress.com/rent',
    provider: {
      '@type': 'ClothingStore',
      '@id': 'https://www.modfancydress.com/#organization',
      name: 'Mod Fancy Dress',
    },
    areaServed: [
      { '@type': 'City', name: 'Delhi' },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Gurgaon' },
      { '@type': 'City', name: 'Ghaziabad' },
      { '@type': 'City', name: 'Faridabad' },
      { '@type': 'City', name: 'Greater Noida' },
    ],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      priceRange: '₹200–₹1000',
      description: 'Rental price per event. Refundable security deposit of ₹500–₹2,000 required.',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="fade-in">
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-[#2D2D2D]">Rent</span>
        </nav>

        {/* Hero */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-3">
            Fancy Dress on Rent in Delhi
          </h1>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-2xl">
            Rent costumes for school annual functions, dance recitals, and competitions — starting from ₹200/event.
            Pick up from our Krishna Nagar, Delhi shop or get it delivered via Porter/Rapido.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <MapPin className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">Visit our shop</p>
                <p className="text-xs text-[#6B6B6B]">Krishna Nagar, East Delhi</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <Clock className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">Refundable deposit</p>
                <p className="text-xs text-[#6B6B6B]">₹500 – ₹2,000 based on costume</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <MessageCircle className="w-5 h-5 text-[#C8956C] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#1B2A4A]">WhatsApp enquiry</p>
                <p className="text-xs text-[#6B6B6B]">{BUSINESS_PHONE_DISPLAY}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Category grid */}
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4">
            Categories available on rent
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-[#E8E5E0] hover:border-[#C8956C]/40 transition-all duration-300 hover:-translate-y-0.5 group"
                style={{ boxShadow: 'var(--shadow-xs)' }}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#F5F3F0] group-hover:bg-[#FBF5EF] flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#C8956C]/20 transition-all">
                  {cat.image_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl(cat.image_url)}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <span className="text-2xl">🎭</span>
                  )}
                </div>
                <h3 className="text-center font-medium text-xs md:text-sm text-[#2D2D2D] group-hover:text-[#1B2A4A] leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[10px] md:text-xs text-[#C8956C] font-medium">
                  {cat.min_rent === cat.max_rent
                    ? `₹${cat.min_rent}/event`
                    : `₹${cat.min_rent}–₹${cat.max_rent}/event`}
                </p>
                <p className="text-[10px] text-[#9A9A9A]">{cat.product_count} costumes</p>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-12 md:mt-16 pt-8 border-t border-[#E8E5E0]">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4">
            How renting works
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#6B6B6B]">
            <li className="p-4 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <span className="block text-lg font-bold text-[#C8956C] mb-1">1</span>
              <strong className="text-[#1B2A4A]">Browse & enquire</strong> — pick a costume and send a WhatsApp message with your event date.
            </li>
            <li className="p-4 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <span className="block text-lg font-bold text-[#C8956C] mb-1">2</span>
              <strong className="text-[#1B2A4A]">Collect or get delivered</strong> — visit our Krishna Nagar shop to try the costume, or book a Porter/Rapido for doorstep delivery. Pay rent + refundable deposit.
            </li>
            <li className="p-4 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <span className="block text-lg font-bold text-[#C8956C] mb-1">3</span>
              <strong className="text-[#1B2A4A]">Return & get deposit back</strong> — bring it back after the event and collect your full deposit.
            </li>
          </ol>
        </section>

        {/* Rental FAQs */}
        <section className="mt-12 md:mt-16 pt-8 border-t border-[#E8E5E0]">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4">
            Common questions about renting
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-lg border border-[#E8E5E0] bg-white">
                <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#1B2A4A] hover:text-[#C8956C] transition-colors list-none flex items-center justify-between gap-2">
                  {faq.question}
                  <ChevronRight className="w-4 h-4 shrink-0 text-[#9A9A9A] group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-4 pb-3 text-sm text-[#6B6B6B] leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* WhatsApp CTA */}
        <div className="mt-10 md:mt-12">
          <a
            href={whatsappUrl('Hi, I want to rent a fancy dress costume. Can you help?')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full max-w-md mx-auto min-h-[48px] py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA851] text-white font-semibold text-sm transition-colors touch-manipulation"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
            <span>Enquire about renting on WhatsApp</span>
          </a>
        </div>
      </div>
    </>
  )
}
