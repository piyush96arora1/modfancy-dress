import Link from 'next/link'
import { getRentCategoriesCached, getAllActiveProductsCached } from '@/lib/supabase/cached-queries'
import { ProductGrid } from '@/components/public/ProductGrid'
import type { ProductCardData } from '@/types/database'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema, FaqPageSchema } from '@/lib/seo/structured-data'
import { rentalFaqPairs } from '@/lib/seo/rental-faq-data'
import { ChevronRight, MapPin, MessageCircle, Clock } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import { BUSINESS_WHATSAPP_DISPLAY, whatsappUrl } from '@/lib/constants/contact'
import Image from 'next/image'

export const revalidate = 604800 // weekly; edits revalidate on demand via /api/revalidate

export const metadata = generatePageMetadata({
  title: 'Costumes & Fancy Dress on Rent in Delhi NCR – From ₹200',
  description:
    'Costume rental near you in Delhi NCR: 300+ fancy dress costumes on rent from ₹200 per event for school functions, dance and competitions. Try them at our Krishna Nagar shop or get delivery.',
  path: '/rent',
})

/**
 * Categories shown first in the "on rent now" grid, in order. Update per season
 * (see seodata/SEASONAL-CALENDAR.md): Nov–Jan = Children's Day, annual functions,
 * Christmas and Republic Day.
 */
const SEASON_CATEGORIES = [
  'leaders-freedom-fighters',
  'republic-day-dress',
  'independence-day-dress',
  'states-fancy-dress',
  'folk-dance-dress',
  'kathak-dress',
  'western-dance-dress',
  'cartoon-characters',
  'animal-costumes',
  'festival-costumes',
  'ramleela-costumes',
  'nature-costumes',
  'fruit-costumes',
  'rajasthani-dress',
]
const PER_CATEGORY = 3
const GRID_SIZE = 24

type RentProduct = ProductCardData & { category: { name: string; slug?: string } | null }

/** Round-robin across the season categories so the grid isn't one category deep. */
function pickSeasonProducts(products: RentProduct[]): RentProduct[] {
  const slugsOf = (p: RentProduct) => [
    p.category?.slug,
    ...(p.categories ?? []).map((c) => c.category?.slug),
  ]
  const buckets = SEASON_CATEGORIES.map((slug) =>
    products.filter((p) => p.images.length > 0 && p.category?.slug !== 'accessories' && slugsOf(p).includes(slug)).slice(0, PER_CATEGORY * 2)
  )
  const picked: RentProduct[] = []
  const seen = new Set<string>()
  for (let round = 0; round < PER_CATEGORY && picked.length < GRID_SIZE; round++) {
    for (const bucket of buckets) {
      const next = bucket.find((p) => !seen.has(p.id))
      if (!next) continue
      seen.add(next.id)
      picked.push(next)
      if (picked.length >= GRID_SIZE) break
    }
  }
  return picked
}

export default async function RentPage() {
  const [categories, allProducts] = await Promise.all([
    getRentCategoriesCached(),
    getAllActiveProductsCached(),
  ])
  const rentable = (allProducts as unknown as RentProduct[]).filter((p) => p.rent_price != null)
  const seasonProducts = pickSeasonProducts(rentable)
  const costumeCount = Math.floor(
    rentable.filter((p) => p.category?.slug !== 'accessories').length / 50
  ) * 50

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
    description: 'Rent fancy dress costumes in Delhi NCR. 300+ styles including dance, festival, and competition costumes. Prices from ₹200 per event with refundable deposit.',
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
        <nav className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-[#2D2D2D]">Rent</span>
        </nav>

        {/* Hero */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-3">
            Costumes &amp; Fancy Dress on Rent in Delhi NCR
          </h1>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-2xl">
            Rent {costumeCount}+ fancy dress costumes for school annual functions, dance performances and
            competitions, from ₹200 per event. Try them at our Krishna Nagar, Delhi shop or get delivery
            anywhere in Delhi, Noida, Gurgaon, Ghaziabad and Faridabad.
          </p>

          <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="flex items-start gap-3 p-2 sm:p-3 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <MapPin className="hidden sm:block w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#1B2A4A]">Visit our shop</p>
                <p className="hidden sm:block text-xs text-[#6B6B6B]">Krishna Nagar, East Delhi</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 sm:p-3 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <Clock className="hidden sm:block w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#1B2A4A]">Refundable deposit</p>
                <p className="hidden sm:block text-xs text-[#6B6B6B]">₹500 – ₹2,000 based on costume</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 sm:p-3 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <MessageCircle className="hidden sm:block w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#1B2A4A]">WhatsApp enquiry</p>
                <p className="hidden sm:block text-xs text-[#6B6B6B]">{BUSINESS_WHATSAPP_DISPLAY}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Season products */}
        {seasonProducts.length > 0 && (
          <section className="mb-12 md:mb-16">
            <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-1">
              Costumes on rent this season
            </h2>
            <p className="text-sm text-[#6B6B6B] mb-4">
              Leaders, Republic Day, annual-function dance and theme costumes. Every one is available on rent; WhatsApp us the costume name for the rent and to book.
            </p>
            <ProductGrid products={seasonProducts} productTitleTag="h3" priorityCount={4} />
          </section>
        )}

        {/* Category grid */}
        <section>
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4">
            All costume categories on rent
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
                <p className="text-xs text-[#6B6B6B]">{cat.product_count} costumes</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Rental guide */}
        <section className="mt-12 md:mt-16 pt-8 border-t border-[#E8E5E0] max-w-3xl space-y-3 text-sm text-[#6B6B6B] leading-relaxed">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
            Costume rental near you in Delhi NCR
          </h2>
          <p>
            Most fancy dress is worn once: a school annual function, a dance competition, Children&apos;s Day or a
            Republic Day programme. Renting costs a fraction of buying and leaves nothing to store. Every costume in
            our shop can be rented, from freedom fighters and state dresses to Kathak, Garba, western dance, cartoon,
            animal and fruit costumes, in kids&apos; sizes and selected adult sizes.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Rent and deposit.</strong> Rent starts at ₹200 per event and depends on
            the costume, so send us the costume name on WhatsApp for the exact rent. A refundable deposit of ₹500–₹2,000
            is taken with the rent, and you get it back in full when the costume comes back.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Pickup or delivery.</strong> Visit our{' '}
            <Link href="/fancy-dress-delhi" className="text-[#8F6240] hover:underline font-medium">Krishna Nagar costume shop in East Delhi</Link>{' '}
            to try sizes, or book a Porter or Rapido and we send it to your door in{' '}
            <Link href="/fancy-dress-noida" className="text-[#8F6240] hover:underline">Noida</Link>,{' '}
            <Link href="/fancy-dress-gurgaon" className="text-[#8F6240] hover:underline">Gurgaon</Link>,{' '}
            <Link href="/fancy-dress-ghaziabad" className="text-[#8F6240] hover:underline">Ghaziabad</Link> or Faridabad.
            Rentals are for Delhi NCR only. Outside NCR you can{' '}
            <Link href="/products" className="text-[#8F6240] hover:underline">buy any costume</Link> with courier delivery across India.
          </p>
          <p>
            <strong className="text-[#2D2D2D]">Schools and dance academies.</strong> Renting 10 or more costumes for a
            class, house or group dance? Send the list on WhatsApp for a group rate, or see{' '}
            <Link href="/wholesale" className="text-[#8F6240] hover:underline">wholesale</Link> if you want to buy in bulk.
            Book a week ahead from November to February, when annual functions and Republic Day keep costumes busy.
          </p>
        </section>

        {/* How it works */}
        <section className="mt-12 md:mt-16 pt-8 border-t border-[#E8E5E0]">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-4">
            How renting works
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#6B6B6B]">
            <li className="p-4 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <span className="block text-lg font-bold text-[#8F6240] mb-1">1</span>
              <strong className="text-[#1B2A4A]">Browse & enquire</strong> — pick a costume and send a WhatsApp message with your event date.
            </li>
            <li className="p-4 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <span className="block text-lg font-bold text-[#8F6240] mb-1">2</span>
              <strong className="text-[#1B2A4A]">Collect or get delivered</strong> — visit our Krishna Nagar shop to try the costume, or book a Porter/Rapido for doorstep delivery. Pay rent + refundable deposit.
            </li>
            <li className="p-4 rounded-lg bg-[#F5F3F0] border border-[#E8E5E0]">
              <span className="block text-lg font-bold text-[#8F6240] mb-1">3</span>
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
                <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#1B2A4A] hover:text-[#8F6240] transition-colors list-none flex items-center justify-between gap-2">
                  {faq.question}
                  <ChevronRight className="w-4 h-4 shrink-0 text-[#6B6B6B] group-open:rotate-90 transition-transform" />
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
            className="flex items-center justify-center gap-2 w-full max-w-md mx-auto min-h-[48px] py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA851] text-[#1B2A4A] font-semibold text-sm transition-colors touch-manipulation"
          >
            <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
            <span>Enquire about renting on WhatsApp</span>
          </a>
        </div>
      </div>
    </>
  )
}
