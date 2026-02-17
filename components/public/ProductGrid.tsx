import { ProductCard } from './ProductCard'
import type { ProductWithDetails, PricingMode } from '@/types/database'

interface ProductGridProps {
  products: ProductWithDetails[]
  pricingMode?: PricingMode
  wholesaleDiscountPct?: number
}

export function ProductGrid({ products, pricingMode = 'retail', wholesaleDiscountPct = 30 }: ProductGridProps) {
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
    </div>
  )
}
