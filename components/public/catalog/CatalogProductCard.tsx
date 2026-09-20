import Link from 'next/link'
import Image from 'next/image'
import type { CatalogProduct } from '@/lib/supabase/supplier-queries'

/**
 * Card for the private catalog. Mirrors the retail ProductCard's visual language deliberately
 * — same radius, border, shadow token and hover lift — but takes the client-safe
 * CatalogProduct shape and shows a single price, so it does not touch PricingModeContext.
 */
export function CatalogProductCard({
  product,
  titleTag = 'h3',
}: {
  product: CatalogProduct
  titleTag?: 'h3' | 'h4'
}) {
  const TitleTag = titleTag
  return (
    <Link href={`/catalog/p/${product.slug}`} className="group relative block">
      <div
        className="bg-white rounded-xl overflow-hidden border border-[#E8E5E0] group-hover:border-[#C8956C]/30 transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* alt="" on purpose: the heading below already names this card, and a
            duplicate alt makes the link announce its name twice to a screen reader. */}
        <div className="aspect-[3/4] relative bg-[#F5F3F0] overflow-hidden">
          {product.thumbUrl ? (
            <Image
              src={product.thumbUrl}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <TitleTag className="text-sm sm:text-base font-medium text-[#2C2C2C] line-clamp-2 group-hover:text-[#8F6240] transition-colors">
            {product.name}
          </TitleTag>
          <p className="mt-auto pt-2 text-base sm:text-lg font-semibold text-[#2C2C2C]">
            {product.priceLabel}
          </p>
          {product.setValue > 1 && (
            <p className="text-xs text-[#6B6B6B]">Set of {product.setValue}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
