import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { whatsappUrl, BUSINESS_PHONE_TEL, BUSINESS_PHONE_DISPLAY } from '@/lib/constants/contact'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'

export const metadata = generatePageMetadata({
  title: 'Mod Fancy Dress vs Amazon / Flipkart — Specialist Store vs Marketplace',
  description: 'Honest comparison of buying fancy dress costumes from a specialist store (Mod Fancy Dress) vs Amazon or Flipkart. Covers pricing, rental, sizing, bulk school orders, delivery, and returns.',
  path: '/compare/local-vs-online',
})

const comparisonRows = [
  {
    feature: 'Order online with delivery',
    mod: { value: 'Yes — modfancydress.com + Porter/Rapido', status: 'yes' as const },
    marketplace: { value: 'Yes — standard courier', status: 'yes' as const },
  },
  {
    feature: 'Visit store & try before buying',
    mod: { value: 'Yes — Krishna Nagar, Delhi', status: 'yes' as const },
    marketplace: { value: 'No physical store', status: 'no' as const },
  },
  {
    feature: 'Rental option (one-time events)',
    mod: { value: 'From ₹200/event — online enquiry or in-store', status: 'yes' as const },
    marketplace: { value: 'Not available', status: 'no' as const },
  },
  {
    feature: 'Same-day delivery',
    mod: { value: 'Yes via Porter / Rapido across Delhi NCR', status: 'yes' as const },
    marketplace: { value: 'Rare — usually 1–7 days', status: 'partial' as const },
  },
  {
    feature: 'Freedom fighter costumes',
    mod: { value: '10+ specific styles, well-stocked', status: 'yes' as const },
    marketplace: { value: 'Limited, quality inconsistent', status: 'partial' as const },
  },
  {
    feature: 'Classical dance costumes',
    mod: { value: 'Bharatanatyam, Kathak, Odissi, Garba — verified quality', status: 'yes' as const },
    marketplace: { value: 'Available but fabric/finish varies by seller', status: 'partial' as const },
  },
  {
    feature: 'Bulk school orders (50–300 pcs)',
    mod: { value: 'Speciality — matching sets across sizes, guaranteed stock', status: 'yes' as const },
    marketplace: { value: 'Not practical — stock varies, styles may not match', status: 'no' as const },
  },
  {
    feature: 'Expert sizing help',
    mod: { value: 'WhatsApp advice + in-store trial + size list coordination', status: 'yes' as const },
    marketplace: { value: 'Size chart only — returns if wrong', status: 'partial' as const },
  },
  {
    feature: 'Easy exchange if wrong size',
    mod: { value: 'Same-day exchange — WhatsApp to arrange', status: 'yes' as const },
    marketplace: { value: '7–14 days; worn costumes often non-returnable', status: 'no' as const },
  },
  {
    feature: 'Purchase price range',
    mod: { value: '₹350–₹2,500 (specialist quality)', status: 'yes' as const },
    marketplace: { value: '₹250–₹1,500 (quality varies widely)', status: 'partial' as const },
  },
  {
    feature: 'Know what you are getting',
    mod: { value: 'Real product photos, WhatsApp on request, in-store view', status: 'yes' as const },
    marketplace: { value: 'Depends on seller photos and reviews', status: 'partial' as const },
  },
]

const statusIcon = (status: 'yes' | 'no' | 'partial') => {
  if (status === 'yes') return <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
  if (status === 'no') return <XCircle className="w-4 h-4 text-red-500 shrink-0" />
  return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
}

export default function LocalVsOnlinePage() {
  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Specialist Store vs Marketplace', url: '/compare/local-vs-online' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="fade-in max-w-3xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-6">
          <Link href="/" className="hover:text-[#1B2A4A]">Home</Link>
          <span>›</span>
          <span className="text-[#2D2D2D]">Specialist Store vs Marketplace</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]">
          Mod Fancy Dress vs Amazon / Flipkart — Which Should You Use?
        </h1>
        <p className="text-xs text-[#9A9A9A] mb-4">By Piyush Arora, Mod Fancy Dress · Updated April 2026</p>

        <div className="space-y-4 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <p>Many parents in Delhi start their fancy dress search on Amazon or Flipkart. Both Mod Fancy Dress and Amazon/Flipkart let you order online and get home delivery — but they are fundamentally different types of sellers. Mod Fancy Dress is a specialist costume store: we sell exclusively online at <Link href="/products" className="text-[#C8956C] hover:underline">modfancydress.com</Link> with same-day Porter/Rapido delivery, and also have a <Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline">physical store in Krishna Nagar, Delhi</Link> you can visit. Amazon and Flipkart are general marketplaces with hundreds of sellers offering varying quality.</p>
          <p>The honest answer: <strong className="text-[#2D2D2D]">both work for simple costumes</strong>. A specialist store wins decisively when you need the right fit, a specific Indian theme, rental for a one-time event, bulk matching sets for school, or same-day delivery with a trusted product.</p>
        </div>

        {/* Comparison table */}
        <div className="rounded-xl border border-[#E8E5E0] overflow-hidden mb-8">
          <div className="grid grid-cols-3 bg-[#1B2A4A] text-white text-xs font-semibold px-4 py-3">
            <span>Feature</span>
            <span className="text-center">Mod Fancy Dress<br /><span className="font-normal text-white/70">Specialist — online + store</span></span>
            <span className="text-center">Amazon / Flipkart<br /><span className="font-normal text-white/70">General marketplace</span></span>
          </div>
          {comparisonRows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 px-4 py-3 text-xs gap-2 border-t border-[#E8E5E0] ${i % 2 === 0 ? 'bg-white' : 'bg-[#F5F3F0]'}`}
            >
              <span className="font-medium text-[#2D2D2D] self-center">{row.feature}</span>
              <span className="flex flex-col items-center gap-1 text-center text-[#6B6B6B]">
                {statusIcon(row.mod.status)}
                {row.mod.value}
              </span>
              <span className="flex flex-col items-center gap-1 text-center text-[#6B6B6B]">
                {statusIcon(row.marketplace.status)}
                {row.marketplace.value}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-6 text-[#6B6B6B] text-sm leading-relaxed mb-8">
          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">When Amazon or Flipkart makes sense</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Simple costume where exact fit and detail are not critical (basic cape, generic witch hat)</li>
              <li>You have 5–7 days before the event and are comfortable with returns if sizing is off</li>
              <li>You want the absolute lowest price and quality is secondary</li>
              <li>You need something very niche not stocked by Indian costume specialists</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">When Mod Fancy Dress makes more sense</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-[#2D2D2D]">School annual function</strong> — the costume needs to look right on stage and fit properly; WhatsApp us your child's age and height for a size recommendation before ordering</li>
              <li><strong className="text-[#2D2D2D]">Classical dance costumes</strong> — Bharatanatyam, Kathak, and Garba sets require specific fabric and sizing; quality on general marketplaces is unreliable</li>
              <li><strong className="text-[#2D2D2D]">Freedom fighter costumes</strong> — details matter (Bhagat Singh pagdi, Gandhi dhoti, Lakshmibai sword); we stock and vet these specifically</li>
              <li><strong className="text-[#2D2D2D]">Rental for a one-time event</strong> — Amazon and Flipkart don't offer rentals; we do from ₹200/event with refundable deposit</li>
              <li><strong className="text-[#2D2D2D]">Bulk school orders</strong> — matching sets of 50–300 costumes across sizes are our speciality; marketplace sellers cannot guarantee this</li>
              <li><strong className="text-[#2D2D2D]">Same-day need</strong> — Porter or Rapido delivery from our Delhi store reaches most Delhi NCR locations within hours; standard courier does not</li>
              <li><strong className="text-[#2D2D2D]">You want to see the product first</strong> — visit our <Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline">Krishna Nagar store</Link> before buying</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">The rental option changes the calculation</h2>
            <p>For a school annual function where a child wears a costume once, buying an ₹800 Bharatanatyam set from a marketplace means owning something that goes unused after the event. Renting the same costume from us for ₹250–₹400 and returning it after is a significantly better use of money. Marketplaces offer no rental option.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">Why bulk school orders don't work on Amazon</h2>
            <p>If a school needs 80 Bharatanatyam costumes across ages 6–12 for annual function, Amazon cannot reliably fulfil this. Different sizes may come from different sellers, styles won't match, and stock is inconsistent. A specialist supplier holds inventory, packs matching sets by size, and can coordinate with the school coordinator directly on WhatsApp. This is why schools like DAV, Lotus Valley, LPS, and KR Mangalam use Mod Fancy Dress for their events.</p>
          </div>
        </div>

        <div className="bg-[#FBF5EF] rounded-xl p-5 mb-8 border border-[#E8E5E0]">
          <p className="font-semibold text-[#1B2A4A] text-sm mb-2">Our verdict</p>
          <p className="text-sm text-[#6B6B6B]">Both options let you order online. For casual costumes where quality and fit are not critical: Amazon or Flipkart is fine. For anything that needs to look right — school functions, dance performances, cultural events — a specialist store like Mod Fancy Dress offers rental, same-day delivery, sizing help, bulk coordination, and the option to visit and try. These are things a general marketplace cannot provide.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <a href={whatsappUrl('Hi, I need a fancy dress costume. Can you help me choose?')} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="lg" className="w-full">WhatsApp for Advice</Button>
          </a>
          <Link href="/products" className="flex-1">
            <Button size="lg" variant="outline" className="w-full">Browse Our Costumes</Button>
          </Link>
        </div>

        <p className="text-xs text-[#9A9A9A] mb-8">
          <strong>Disclosure:</strong> This comparison was written by Mod Fancy Dress. We are one of the options being compared. Marketplace pricing data is approximate, based on publicly available listings as of April 2026 — check current prices before deciding.
        </p>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-[#1B2A4A]">Related guides</p>
          <ul className="space-y-1">
            <li><Link href="/blog/rent-or-buy-fancy-dress-costume" className="text-[#C8956C] hover:underline">Rent vs Buy a Fancy Dress Costume — Full Guide</Link></li>
            <li><Link href="/wholesale/schools" className="text-[#C8956C] hover:underline">Bulk Fancy Dress Costumes for Schools</Link></li>
            <li><Link href="/rent" className="text-[#C8956C] hover:underline">Rental Costumes from ₹200/event</Link></li>
            <li><Link href="/fancy-dress-delhi" className="text-[#C8956C] hover:underline">Visit our Krishna Nagar Store in Delhi</Link></li>
          </ul>
        </div>
      </div>
    </>
  )
}
