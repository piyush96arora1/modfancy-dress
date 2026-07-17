import Link from 'next/link'
import { ProductGrid } from './ProductGrid'
import { PricingModeToggle } from './PricingModeToggle'
import { Button } from '@/components/ui/button'
import { siteUrl } from '@/lib/seo/structured-data'
import type { ProductWithDetails } from '@/types/database'

interface HomepageSectionProps {
  title: string
  /** Unique id linking the <section> to its <h2> for a11y + SEO outline. */
  headingId: string
  /** Where the "View all →" link points (category page, or /products for latest). */
  viewAllHref: string
  products: ProductWithDetails[]
  /** Show the retail/wholesale toggle — only on the first section, matching prior layout. */
  showPricingToggle?: boolean
}

/**
 * A single admin-configured homepage product row. Server-rendered: content ships
 * in the initial HTML (SEO), product images lazy-load via ProductCard (below the
 * fold, protects the banner LCP), fixed card aspect ratios avoid CLS.
 */
export function HomepageSection({
  title,
  headingId,
  viewAllHref,
  products,
  showPricingToggle = false,
}: HomepageSectionProps) {
  if (!products || products.length === 0) return null

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}/products/${p.slug}`,
      name: p.name,
    })),
  }

  return (
    <section className="mb-8 md:mb-14 fade-in" aria-labelledby={headingId}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 md:mb-8">
        <div className="flex items-center gap-3">
          <h2
            id={headingId}
            className="text-lg md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]"
          >
            {title}
          </h2>
          {showPricingToggle && <PricingModeToggle currentMode="retail" />}
        </div>
        <Link href={viewAllHref} prefetch={true} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto text-sm">
            View All →
          </Button>
        </Link>
      </div>
      <ProductGrid products={products} productTitleTag="h4" />
    </section>
  )
}
