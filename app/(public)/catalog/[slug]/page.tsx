import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  getCatalogCategoryBySlugCached,
  getCatalogProductsForCategoryCached,
} from '@/lib/supabase/supplier-queries'
import { CatalogGrid } from '@/components/public/catalog/CatalogGrid'
import { CatalogCategoryCard } from '@/components/public/catalog/CatalogCategoryCard'
import { CatalogPagination } from '@/components/public/catalog/CatalogPagination'
import { CatalogSearchBox } from '@/components/public/catalog/CatalogSearchBox'
import { ShareLinkButton } from '@/components/public/catalog/ShareLinkButton'

/**
 * Rendered per request, not prerendered: reading `searchParams` for pagination makes the route
 * dynamic in the App Router, so generateStaticParams would have no effect here. The data layer
 * is still cached for 24h via unstable_cache, so a request is a cheap render rather than a
 * database round trip — and this is a private, low-traffic section.
 */
export const revalidate = 86400

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await getCatalogCategoryBySlugCached(slug)
  return {
    title: found ? `${found.category.name} | Catalogue` : 'Catalogue',
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  }
}

export default async function CatalogCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? '1') || 1)

  const found = await getCatalogCategoryBySlugCached(slug)
  if (!found) notFound()

  const { products, total, pageSize } = await getCatalogProductsForCategoryCached(slug, page)
  // An out-of-range page is a dead end, not an empty listing.
  if (page > 1 && products.length === 0) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <nav
        className="flex items-center gap-1 text-sm text-[#6B6B6B] mb-4 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/catalog" className="hover:text-[#8F6240]">
          Catalogue
        </Link>
        {found.parent && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/catalog/${found.parent.slug}`} className="hover:text-[#8F6240]">
              {found.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#2C2C2C]">{found.category.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C]">
            {found.category.name}
          </h1>
          <p className="text-[#6B6B6B] mt-1">
            {total} {total === 1 ? 'item' : 'items'}
          </p>
        </div>
        <ShareLinkButton />
      </div>

      <div className="mb-8">
        <CatalogSearchBox />
      </div>

      {found.children.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">Browse by type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {found.children.map((c) => (
              <CatalogCategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      <section>
        {found.children.length > 0 && (
          <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">All items</h2>
        )}
        <CatalogGrid products={products} titleTag={found.children.length > 0 ? 'h4' : 'h3'} />
        <CatalogPagination
          page={page}
          total={total}
          pageSize={pageSize}
          basePath={`/catalog/${slug}`}
        />
      </section>
    </div>
  )
}
