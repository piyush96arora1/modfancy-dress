import { Camera } from 'lucide-react'
import { whatsappUrl } from '@/lib/constants/contact'

/**
 * Shown where a product has no photo yet (e.g. while its photo is being reshot).
 * `compact` is for cards, which are links themselves, so no button inside.
 * The full version offers WhatsApp for real photos. It is shorter than a photo on phones
 * (4:3 instead of square) so the price and Buy/Rent buttons stay on the first screen.
 */
export function PhotoComingSoon({ productName, compact = false }: { productName: string; compact?: boolean }) {
  if (compact) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2 text-center text-[#6B6B6B]">
        <Camera className="w-6 h-6" aria-hidden="true" />
        <span className="text-xs font-medium">Photo coming soon</span>
      </div>
    )
  }
  return (
    <div className="aspect-[4/3] md:aspect-square rounded-xl bg-[#F5F3F0] border border-[#E8E5E0] flex flex-col items-center justify-center gap-3 px-6 text-center">
      <Camera className="w-10 h-10 text-[#8F6240]" aria-hidden="true" />
      <p className="text-base font-semibold text-[#2C2C2C]">Real photo coming soon</p>
      <p className="text-sm text-[#6B6B6B] max-w-xs">We&apos;re photographing this costume. WhatsApp us and we&apos;ll send you photos right away.</p>
      <a
        href={whatsappUrl(`Hi, please send me photos of the ${productName}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1EBE5A] transition-colors"
      >
        WhatsApp for photos
      </a>
    </div>
  )
}
