import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { selectRelatedWithTopUp, relatedHeading } from '@/lib/utils/related-products'
import type { ProductWithDetails } from '@/types/database'

interface RelatedProductsProps {
  /** Every active product in the category, including the one being viewed. */
  categoryProducts: ProductWithDetails[]
  /** Fill-ins, in priority order, used only if the category can't fill the block. */
  topUpProducts?: ProductWithDetails[][]
  currentProductId: string
  categoryName: string
  categorySlug: string
  className?: string
}

/**
 * "More <Category> Costumes" on a product page.
 *
 * Server component on a statically prerendered route, so these links ship in
 * the page's HTML — no client fetch, no streaming, nothing for Googlebot to
 * wait on. Which sibling products appear is decided by `selectRelatedProducts`;
 * see that file for why it is a ring rather than "first 8 in the category".
 *
 * Mobile renders a horizontal snap rail (the third card peeks, so the scroll
 * affordance is visible without a scrollbar) — a product page's bounce happens
 * at the buy box, and a rail one screen down catches it without costing the
 * vertical space a grid would. Desktop renders the same DOM as a grid.
 */
export function RelatedProducts({
  categoryProducts,
  topUpProducts = [],
  currentProductId,
  categoryName,
  categorySlug,
  className,
}: RelatedProductsProps) {
  const related = selectRelatedWithTopUp(
    { main: { categoryId: categorySlug, categoryName, categorySlug, products: categoryProducts }, topUp: topUpProducts },
    currentProductId
  )
  if (related.length === 0) return null

  return (
    <section className={className} aria-labelledby="related-products-heading">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2
          id="related-products-heading"
          className="font-semibold text-sm text-[#1B2A4A] font-[family-name:var(--font-outfit)]"
        >
          {relatedHeading(categoryName)}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[#6B6B6B] hover:text-[#8F6240] transition-colors"
        >
          View all
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Rail on mobile, grid from md up. `-mx-4` lets the rail bleed to the
          screen edges inside the layout's `px-4` main. */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0">
        {related.map((product) => (
          <div key={product.id} className="w-[45%] shrink-0 snap-start md:w-auto">
            {/* h4 keeps the outline h1 -> h2 -> h4, matching the category grid. */}
            <ProductCard product={product} titleTag="h4" showCategoryBadge={false} />
          </div>
        ))}
      </div>
    </section>
  )
}
