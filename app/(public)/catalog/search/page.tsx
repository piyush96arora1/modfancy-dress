import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { searchCatalog } from '@/lib/supabase/supplier-queries'
import { CatalogGrid } from '@/components/public/catalog/CatalogGrid'
import { CatalogSearchBox } from '@/components/public/catalog/CatalogSearchBox'

// Search terms are unbounded, so this page is rendered per request rather than cached.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search | Catalogue',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default async function CatalogSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const term = q.trim()
  const results = term.length >= 2 ? await searchCatalog(term) : []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <nav className="flex items-center gap-1 text-sm text-[#9A9A9A] mb-4" aria-label="Breadcrumb">
        <Link href="/catalog" className="hover:text-[#C8956C]">
          Catalogue
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#2C2C2C]">Search</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C] mb-6">
        {term ? `Results for “${term}”` : 'Search the catalogue'}
      </h1>

      <div className="mb-8">
        <CatalogSearchBox defaultValue={term} autoFocus={!term} />
      </div>

      {term.length >= 2 && (
        <p className="text-[#9A9A9A] mb-4">
          {results.length} {results.length === 1 ? 'item' : 'items'} found
        </p>
      )}

      {term.length >= 2 ? (
        <CatalogGrid products={results} emptyMessage={`Nothing matched “${term}”.`} />
      ) : (
        <p className="text-[#9A9A9A]">Type at least two characters to search.</p>
      )}
    </div>
  )
}
