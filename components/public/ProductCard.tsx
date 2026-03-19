'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ProductWithDetails, PricingMode } from '@/types/database'
import { getImageUrl } from '@/lib/imageUrl'

import { getProductPrice, formatPrice } from '@/lib/utils/pricing'
import { usePricingMode } from '@/lib/context/PricingModeContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ProductCardProps {
  product: ProductWithDetails
  pricingMode?: PricingMode
  wholesaleDiscountPct?: number
}

export function ProductCard({ product, pricingMode: propMode, wholesaleDiscountPct = 30 }: ProductCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { mode: globalMode } = usePricingMode()

  // Use prop if explicitly passed, otherwise fall back to global mode
  const pricingMode = propMode ?? globalMode

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]

  const retailPrice = product.variants.length > 0 && product.variants[0].price_override
    ? product.variants[0].price_override
    : product.price || 0

  const wholesalePrice = getProductPrice(product, 'wholesale', wholesaleDiscountPct)
  const displayPrice = pricingMode === 'wholesale' ? wholesalePrice : retailPrice

  const basePath = pricingMode === 'wholesale' ? '/wholesale' : '/products'

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`${basePath}/${product.slug}`)
    })
  }

  return (
    <Link href={`${basePath}/${product.slug}`} onClick={handleClick} className="group relative block">
      {isPending && (
        <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-10 rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
          <LoadingSpinner size="lg" />
        </div>
      )}
      <div className="bg-white rounded-xl overflow-hidden border border-[#E8E5E0] group-hover:border-[#C8956C]/30 transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col" style={{ boxShadow: 'var(--shadow-card)' }}>
        {/* Image */}
        <div className="aspect-[3/4] relative bg-[#F5F3F0] overflow-hidden">
          {primaryImage ? (
            <Image
              src={getImageUrl(primaryImage.image_url)}
              alt={primaryImage.alt_text || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9A9A9A]">
              <span className="text-xs">No Image</span>
            </div>
          )}
          {/* Category badge */}
          {product.categories && product.categories.length > 0 ? (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#1B2A4A] rounded-full font-medium" style={{ boxShadow: 'var(--shadow-xs)' }}>
                {product.categories[0].category.name}
              </span>
            </div>
          ) : product.category && (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#1B2A4A] rounded-full font-medium" style={{ boxShadow: 'var(--shadow-xs)' }}>
                {product.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 md:p-4 flex-1 flex flex-col">
          <h3 className="font-[family-name:var(--font-outfit)] font-semibold text-sm md:text-base mb-1 line-clamp-2 text-[#2D2D2D] group-hover:text-[#1B2A4A] transition-colors leading-snug">
            {product.name}
          </h3>
          {displayPrice > 0 && (
            <div className="mt-auto pt-1.5">
              <p className="text-base md:text-lg font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                {formatPrice(displayPrice)}
                {pricingMode === 'wholesale' && (
                  <span className="text-[10px] font-normal text-[#9A9A9A] ml-1">/piece</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
