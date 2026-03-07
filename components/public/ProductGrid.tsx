import { ProductCard } from './ProductCard'
import type { ProductWithDetails, PricingMode } from '@/types/database'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ProductGridProps {
  products: ProductWithDetails[]
  pricingMode?: PricingMode
  wholesaleDiscountPct?: number
  showViewAllCard?: boolean
}

export function ProductGrid({ products, pricingMode = 'retail', wholesaleDiscountPct = 30, showViewAllCard = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#9A9A9A] text-sm">No products found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} pricingMode={pricingMode} wholesaleDiscountPct={wholesaleDiscountPct} />
      ))}

      {showViewAllCard && (
        <Link
          href="/products"
          className="group flex flex-col items-center justify-center p-6 text-center bg-[#FAFAF8] border border-[#E8E5E0] rounded-2xl hover:bg-[#F5F3F0] transition-all duration-300 min-h-[280px]"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <ArrowRight className="w-5 h-5 text-[#C8956C]" />
          </div>
          <h3 className="font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] text-lg mb-2">
            View All Costumes
          </h3>
          <p className="text-sm text-[#6B6B6B]">
            Explore our entire collection of costumes & accessories
          </p>
        </Link>
      )}
    </div>
  )
}
