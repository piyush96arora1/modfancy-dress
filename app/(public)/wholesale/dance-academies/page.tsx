import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Music, Sparkles, Ruler, CalendarClock } from 'lucide-react'
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL, whatsappUrl } from '@/lib/constants/contact'
import { BreadcrumbSchema, FaqPageSchema } from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Dance Costumes in Bulk for Academies & Troupes — Wholesale Delhi',
  description:
    'Bulk dance costumes for academies, troupes and choreographers. Bharatanatyam, Kathak, Odissi, Kuchipudi, Bhangra, Garba and folk sets in matched colours across mixed sizes. Wholesale rates from 10 pieces, Krishna Nagar Delhi.',
  path: '/wholesale/dance-academies',
})

const pricingTiers = [
  { range: '10–49 pieces', discount: '15% off', note: 'Min. 10 of same costume' },
  { range: '50–99 pieces', discount: '20% off', note: 'Mixed styles allowed' },
  { range: '100–299 pieces', discount: '25% off', note: 'Dedicated coordinator' },
  { range: '300+ pieces', discount: '30% off', note: 'Custom quote + priority packing' },
]

type FormEntry = {
  name: string
  href: string
  linkLabel: string
  body: string
  extraHref?: string
  extraLabel?: string
}

const classicalForms: FormEntry[] = [
  {
    name: 'Bharatanatyam',
    href: '/category/bharatnatyam',
    linkLabel: 'Bharatanatyam costumes',
    body: 'The stitched costume — blouse, fitted bottom and the pleated fan that opens at aramandi — plus hip belt, temple jewellery, salangai ankle bells and plait ornaments.',
  },
  {
    name: 'Kathak',
    href: '/category/kathak-dress',
    linkLabel: 'Kathak dresses',
    body: 'A long flared ghagra with choli and dupatta, or angarkha over churidar, with ghungroo. Flare decides everything: chakkar spins need a hem with real sweep and weight.',
  },
  {
    name: 'Odissi',
    href: '/category/classical-dance-dress',
    linkLabel: 'classical dance costumes',
    body: 'A stitched costume in ikat-patterned fabric with pleated fan, blouse and waist belt. Silver-toned filigree jewellery, a seenthi head ornament and a tahia crown on the bun complete it.',
  },
  {
    name: 'Kuchipudi',
    href: '/category/classical-dance-dress',
    linkLabel: 'classical dance costumes',
    body: 'Close to Bharatanatyam but with a wider fan and lighter drape, since the form travels and jumps more. Temple jewellery, ankle bells and a decorated plait.',
  },
]

const folkForms: FormEntry[] = [
  {
    name: 'Bhangra & Giddha',
    href: '/category/bhangra-dress',
    linkLabel: 'Bhangra dresses',
    body: 'Bhangra: kurta, tehmat, waistcoat, turban with fan, tassels, rumal. Giddha: kurta-suthan with dupatta, paranda and jhumka. Drawstrings and seams take a season of punishment.',
    extraHref: '/category/gidda-dress',
    extraLabel: 'Giddha dresses',
  },
  {
    name: 'Garba & Chaniya Choli',
    href: '/category/garba-dress',
    linkLabel: 'Garba costumes',
    body: 'A mirror-work chaniya with strong flare, fitted choli and an odhani pinned to survive spins — plus oxidised jewellery and dandiya sticks.',
    extraHref: '/category/dandiya-dress',
    extraLabel: 'dandiya dresses',
  },
  {
    name: 'Rajasthani',
    href: '/category/rajasthani-dress',
    linkLabel: 'Rajasthani costumes',
    body: 'Ghagra, choli and odhni in bandhani or leheriya; dhoti-kurta with a bright safa. Ghoomar and kalbelia need maximum sweep, so size to the dancer.',
  },
  {
    name: 'Haryanvi',
    href: '/category/haryanvi-dress',
    linkLabel: 'Haryanvi dresses',
    body: 'Daaman, kurti and chunder with heavy neck and head jewellery for women; kurta-dhoti with a pagdi for men.',
  },
  {
    name: 'Assamese / Bihu',
    href: '/category/folk-dance-dress',
    linkLabel: 'folk dance costumes',
    body: 'Mekhela chador in off-white with red-and-gold borders and a gamosa; men wear dhoti-kurta, and a japi works as a prop.',
  },
  {
    name: 'Lavani',
    href: '/category/lavani-costume',
    linkLabel: 'Lavani costumes',
    body: 'The nine-yard nauvari saree draped kaccha-style so the legs stay free, with nath, mundavalya, Kolhapuri saaj and a gajra-wrapped bun.',
  },
]

const faqs = [
  {
    question: 'What is the minimum order for a dance academy to get wholesale rates?',
    answer:
      'From 10 pieces: 15% off on 10–49 (min. 10 of one costume), 20% off from 50 with mixed styles, 25% off from 100, and 30% off on 300+.',
  },
  {
    question: 'Can you supply matched sets across different sizes for a troupe?',
    answer:
      'Yes — the most common academy order. Send the style and a size list; we pack one colour across sizes, ages 3–14 for children and S to XL for adults.',
  },
  {
    question: 'Should we buy or rent costumes for a single competition?',
    answer:
      'Rent a one-off item — low per-dancer cost, nothing to store. Buy when it repeats across a season or is re-cast each year. Both start from ₹200.',
  },
  {
    question: 'How far in advance should we order for a competition season?',
    answer:
      'As early as your calendar allows. Season concentrates demand on the same styles in the same weeks, so early confirmation protects a full matched set in one colour lot.',
  },
  {
    question: 'Do you supply jewellery and accessories with dance costumes?',
    answer:
      'Yes — ankle bells, temple and oxidised jewellery, head ornaments, belts, dupattas and turbans. They count toward the same quantity tiers, so order them with the costumes.',
  },
  {
    question: 'Do you deliver bulk dance costume orders?',
    answer:
      'Porter or Rapido across Delhi NCR, or collect from the Krishna Nagar store, open daily 10 AM–9:30 PM. Above ₹10,000 a 30% advance applies; balance by cash or UPI.',
  },
]

export default function WholesaleDanceAcademiesPage() {
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Wholesale', url: '/wholesale' },
    { name: 'Dance Academies', url: '/wholesale/dance-academies' },
  ])
  const faqSchema = FaqPageSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="fade-in max-w-3xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
          <span>›</span>
          <Link href="/wholesale" className="hover:text-[#1B2A4A]">Wholesale</Link>
          <span>›</span>
          <span className="text-[#2D2D2D]">Dance Academies</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
          Dance Costumes in Bulk for Academies &amp; Troupes
        </h1>

        <div className="bg-[#FBF5EF] rounded-xl p-5 mb-6 border border-[#E8E5E0]">
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Matched Sets for Classical &amp; Folk Repertoire</p>
              <p className="text-sm text-[#6B6B6B]">Classical and folk costumes as matched sets across mixed sizes, to buy or rent. Send your size list on WhatsApp for stock and pricing.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <p>Academies do not shop the way schools do. A school needs one costume per child for one evening; an academy needs a <strong className="text-[#2D2D2D]">performance-grade set that survives a season</strong> — the same twelve costumes through weeks of rehearsal, a competition and a recital. With <strong className="text-[#2D2D2D]">15+ years</strong> and <strong className="text-[#2D2D2D]">400+ styles</strong> at our Krishna Nagar store, we build group orders around that. Everything here can be <Link href="/wholesale" className="text-[#8F6240] hover:underline">bought or rented in bulk</Link>, from ₹200.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Bulk Pricing for Group Orders</h2>
          <p>Discounts apply to the retail price per piece:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {pricingTiers.map((tier) => (
            <div key={tier.range} className="rounded-xl border border-[#E8E5E0] bg-white p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <p className="font-semibold text-[#1B2A4A] text-sm">{tier.range}</p>
              <p className="text-2xl font-bold text-[#8F6240] my-1">{tier.discount}</p>
              <p className="text-xs text-[#6B6B6B]">{tier.note}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">How a Group Order Works</h2>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>WhatsApp the <strong className="text-[#2D2D2D]">form, item, dancer count, size list and performance date</strong></li>
            <li>We confirm stock in one colour lot and send a price list</li>
            <li>Confirm — 30% advance above ₹10,000</li>
            <li>Costumes packed and labelled per size</li>
            <li>Porter/Rapido across Delhi NCR or pickup; balance by cash or UPI</li>
          </ol>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Costume Sets by Classical Dance Form</h2>
          <p>What a complete costume involves differs by form:</p>
        </div>

        <div className="space-y-3 mb-8">
          {classicalForms.map((form) => (
            <div key={form.name} className="rounded-xl border border-[#E8E5E0] bg-[#F5F3F0] p-4">
              <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1.5 font-[family-name:var(--font-outfit)]">{form.name}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{form.body}</p>
              <p className="text-xs mt-2">
                <Link href={form.href} className="text-[#8F6240] hover:underline">{form.linkLabel} →</Link>
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Folk &amp; Regional Costume Sets</h2>
        </div>

        <div className="space-y-3 mb-8">
          {folkForms.map((form) => (
            <div key={form.name} className="rounded-xl border border-[#E8E5E0] bg-white p-4">
              <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1.5 font-[family-name:var(--font-outfit)]">{form.name}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{form.body}</p>
              <p className="text-xs mt-2 flex flex-wrap gap-x-3">
                <Link href={form.href} className="text-[#8F6240] hover:underline">{form.linkLabel} →</Link>
                {form.extraHref && (
                  <Link href={form.extraHref} className="text-[#8F6240] hover:underline">{form.extraLabel} →</Link>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Matched Sets Across Mixed Sizes</h2>
          <p>Ten dancers of different heights should still read as one line from the audience — same colour, same border, only the fit changes. Send a plain size list: age or height per child, S/M/L/XL for adults, and the count per size.</p>

          <div className="rounded-xl border border-[#E8E5E0] bg-white p-4">
            <div className="flex items-start gap-3">
              <Ruler className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1 font-[family-name:var(--font-outfit)]">Sizing a Mixed-Age Troupe</h3>
                <ul className="space-y-1 text-xs text-[#6B6B6B]">
                  <li>• Children ages 3–14; adults S–XL for senior batches and teachers</li>
                  <li>• Go by height, not age, between sizes</li>
                  <li>• Size flared items individually — a short dancer in a long skirt loses the spin</li>
                  <li>• Add a spare in middle sizes for cast changes</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Built for the Stage, Not the Photo</h2>
          <p>Stage light changes fabric: under strong front light pastels wash out and fine detail dies past the third row, which is why performance costumes lean on saturated colour, contrast borders and reflective zari or mirror work. Movement is the second constraint — spins, ghoomar circles and Bhangra jumps all load waist drawstrings, armhole seams, hems and pleat stitching. Tell us how many rehearsals a costume must survive, because rehearsal wear finishes costumes long before the performance does.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Buy or Rent for a Competition</h2>
          <p>For a single competition or one recital item, <Link href="/rent" className="text-[#8F6240] hover:underline">renting</Link> keeps the per-dancer cost down and leaves nothing to store. Buying pays off when an item repeats across a season or is re-cast each year. Many academies do both — buy the signature items, rent the rest.</p>

          <div className="rounded-xl border border-[#E8E5E0] bg-[#FBF5EF] p-4">
            <div className="flex items-start gap-3">
              <CalendarClock className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1 font-[family-name:var(--font-outfit)]">Planning a Competition Season</h3>
                <p className="text-xs text-[#6B6B6B]">Season pushes every academy toward the same styles in the same weeks. Book early and plan the season in one enquiry rather than item by item — a larger order reaches a better tier and keeps the colour lot consistent.</p>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Accessories &amp; Jewellery</h2>
          <p>A costume is only finished once the jewellery is on. Ankle bells, temple and oxidised sets, head ornaments, belts, dupattas and turbans count toward the same quantity tiers, and mismatched jewellery reads more clearly from the audience than a slightly off fabric shade. Browse <Link href="/category/accessories" className="text-[#8F6240] hover:underline">accessories</Link>, <Link href="/category/dance-dress" className="text-[#8F6240] hover:underline">dance dress</Link> and <Link href="/category/states-fancy-dress" className="text-[#8F6240] hover:underline">state costumes</Link>.</p>

          <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3 mb-8">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-[#E8E5E0] bg-white p-4">
              <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1.5 font-[family-name:var(--font-outfit)]">{faq.question}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[#E8E5E0] bg-[#F5F3F0] p-4 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#8F6240] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1B2A4A] text-sm mb-1">Other bulk buyers we supply</p>
              <p className="text-sm text-[#6B6B6B]">
                <Link href="/wholesale/schools" className="text-[#8F6240] hover:underline">Schools</Link>,{' '}
                <Link href="/wholesale/resellers" className="text-[#8F6240] hover:underline">resellers</Link>, and the{' '}
                <Link href="/wholesale/delhi-market" className="text-[#8F6240] hover:underline">Delhi wholesale costume market</Link>. Unsure? <Link href="/contact" className="text-[#8F6240] hover:underline">Contact us</Link>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={whatsappUrl('Hi, I run a dance academy / troupe and need bulk dance costumes. Can you send pricing?')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button size="lg" className="w-full">WhatsApp for Academy Quote</Button>
          </a>
          <a href={`tel:${BUSINESS_PHONE_TEL}`} className="flex-1">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <Phone className="w-4 h-4" />
              {BUSINESS_PHONE_DISPLAY}
            </Button>
          </a>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#E8E5E0] text-sm text-[#6B6B6B] mb-6">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#8F6240] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D2D2D]">Store Address</p>
              <p>S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
              <p className="mt-1">
                <a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-[#8F6240] hover:underline">{BUSINESS_PHONE_DISPLAY}</a>
                {' '}— Open daily 10 AM – 9:30 PM
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-[#E8E5E0]">
          <iframe
            src="https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed"
            width="100%"
            height="240"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mod Fancy Dress store — Krishna Nagar, Delhi (bulk dance costume supplier)"
          />
        </div>
      </div>
    </>
  )
}
