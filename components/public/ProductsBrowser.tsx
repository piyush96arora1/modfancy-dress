'use client'

import { Suspense, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/public/SearchBar'
import { CategoryFilter } from '@/components/public/CategoryFilter'
import { ProductGrid } from '@/components/public/ProductGrid'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'
import type { ProductWithDetails, PricingMode } from '@/types/database'

interface ProductsBrowserProps {
  /** Full active catalog. Rendered in full server-side (SEO); filtered client-side. */
  products: ProductWithDetails[]
  categories: Array<{ id: string; name: string; slug: string; image_url?: string | null }>
  /** Heading shown when there is no active search. */
  heading: string
  basePath: '/products' | '/wholesale'
  pricingMode: PricingMode
  wholesaleDiscountPct?: number
  /** Static slot rendered between the header and the search bar (e.g. wholesale banner + price table). */
  children?: ReactNode
}

function matchesCategory(product: ProductWithDetails, slug: string): boolean {
  const primary = product.category as { slug?: string } | null
  if (primary?.slug === slug) return true
  return (product.categories ?? []).some(
    (junction) => (junction?.category as { slug?: string } | undefined)?.slug === slug
  )
}

function filterProducts(
  products: ProductWithDetails[],
  search: string,
  category: string
): ProductWithDetails[] {
  let list = products
  if (category) list = list.filter((p) => matchesCategory(p, category))
  if (search) {
    const q = search.toLowerCase()
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
    )
  }
  return list
}

/**
 * Presentational listing. Pure (no hooks that force dynamic rendering), so it
 * renders fully on the server — including all product cards — into the static
 * HTML. With no search/category it shows the whole catalog, which is exactly
 * what crawlers (and the canonical /products URL) should see.
 */
function Listing({
  products,
  categories,
  heading,
  basePath,
  pricingMode,
  wholesaleDiscountPct = 30,
  children,
  search,
  category,
}: ProductsBrowserProps & { search: string; category: string }) {
  const filtered = useMemo(
    () => filterProducts(products, search, category),
    [products, search, category]
  )
  const count = filtered.length
  const isWholesale = pricingMode === 'wholesale'
  const clearSearchHref = category ? `${basePath}?category=${category}` : basePath

  return (
    <div className="mb-5 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
            {search
              ? isWholesale
                ? `Wholesale Results for "${search}"`
                : `Results for "${search}"`
              : heading}
          </h1>
          {search && (
            <Link
              href={clearSearchHref}
              className="text-xs text-[#C8956C] hover:text-[#A07048] font-medium transition-colors"
            >
              Clear search
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {count > 0 && (
            <p className="text-xs text-[#9A9A9A] font-medium">
              {count} {count === 1 ? 'product' : 'products'}
            </p>
          )}
          <PricingModeToggle currentMode={pricingMode} />
        </div>
      </div>

      {children}

      {/* Search — self-contained Suspense (uses useSearchParams). */}
      <div className="w-full mb-3">
        <Suspense fallback={<div className="h-12 bg-[#F5F3F0] rounded-lg animate-pulse" />}>
          <SearchBar />
        </Suspense>
      </div>

      {/* Category filter — self-contained Suspense (uses useSearchParams). */}
      <Suspense fallback={<div className="h-9" />}>
        <CategoryFilter categories={categories} />
      </Suspense>

      <div className="mt-5 md:mt-8">
        {count > 0 ? (
          <ProductGrid
            products={filtered}
            pricingMode={pricingMode}
            wholesaleDiscountPct={wholesaleDiscountPct}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-[#9A9A9A] mb-2 text-base">
              {search ? `No products found for "${search}"` : 'No products found.'}
            </p>
            {(search || category) && (
              <Link
                href={basePath}
                className="text-sm text-[#C8956C] hover:text-[#A07048] underline font-medium transition-colors"
              >
                {isWholesale ? 'Browse all wholesale products' : 'Browse all products'}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Reads the URL filter state (client-only) and renders the filtered listing. */
function FilteredListing(props: ProductsBrowserProps) {
  const searchParams = useSearchParams()
  const search = (searchParams.get('search') ?? '').trim()
  const category = searchParams.get('category') ?? ''
  return <Listing {...props} search={search} category={category} />
}

/**
 * Static-friendly browse experience for /products and /wholesale.
 *
 * The Suspense fallback is the FULL, unfiltered listing — it renders on the
 * server into the static HTML (every product card + image present for
 * crawlers). On the client the boundary resolves and re-renders the listing
 * filtered by the URL's ?search / ?category params. Canonical stays the base
 * path, so this is SEO-neutral while keeping the page statically cached.
 */
export function ProductsBrowser(props: ProductsBrowserProps) {
  return (
    <div className="fade-in">
      <Suspense fallback={<Listing {...props} search="" category="" />}>
        <FilteredListing {...props} />
      </Suspense>
    </div>
  )
}
