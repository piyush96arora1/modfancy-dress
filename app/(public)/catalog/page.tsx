import type { Metadata } from 'next'
import {
  getCatalogRootCategoriesCached,
  getCatalogCountsCached,
} from '@/lib/supabase/supplier-queries'
import { CatalogCategoryCard } from '@/components/public/catalog/CatalogCategoryCard'
import { CatalogSearchBox } from '@/components/public/catalog/CatalogSearchBox'
import { ShareLinkButton } from '@/components/public/catalog/ShareLinkButton'

export const revalidate = 86400

/**
 * Private catalogue. Kept out of search engines by four independent layers: this robots
 * block, a robots.txt disallow, absence from the sitemap, and an X-Robots-Tag response
 * header set in next.config.ts.
 */
export const metadata: Metadata = {
  title: 'Catalogue',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default async function CatalogIndexPage() {
  const [categories, counts] = await Promise.all([
    getCatalogRootCategoriesCached(),
    getCatalogCountsCached(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C]">Catalogue</h1>
          <p className="text-[#6B6B6B] mt-1">
            {counts.products} items across {counts.categories} categories
          </p>
        </div>
        <ShareLinkButton />
      </div>

      <div className="mb-8">
        <CatalogSearchBox />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {categories.map((c) => (
          <CatalogCategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  )
}
