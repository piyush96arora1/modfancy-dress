import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getCategoryBySlugCached,
  getCategoryMetaBySlugCached,
  getProductsForCategoryCached,
  getActiveCategorySlugsCached,
} from '@/lib/supabase/cached-queries'
import { ProductGrid } from '@/components/public/ProductGrid'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { CategoryListingJsonLd } from '@/lib/seo/structured-data'
import { ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import { getFaqsForCategoryPage } from '@/lib/faqs/queries'
import { FaqSection } from '@/components/public/FaqSection'
import { SizeGuideTable } from '@/components/public/seo-tables/SizeGuideTable'
import { ClassicalDanceComparisonTable } from '@/components/public/seo-tables/ClassicalDanceComparisonTable'
import { isClassicalCostumeCategorySlug } from '@/lib/seo/classical-category-slugs'
import type { ProductWithDetails } from '@/types/database'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getActiveCategorySlugsCached()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryMetaBySlugCached(slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  const description =
    category.meta_description ??
    (category.description && category.description.trim()
      ? category.description.trim().slice(0, 155) + (category.description.length > 155 ? '…' : '')
      : `Browse our collection of ${category.name} fancy dress costumes. Quality costumes for school functions and events. 15+ years experience, 400+ successful events.`)

  return generatePageMetadata({
    title: category.seo_title || `${category.name} Costumes | Buy Online`,
    description,
    path: `/category/${slug}`,
    image: getImageUrl(category.image_url),
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlugCached(slug)

  if (!category) {
    notFound()
  }

  const products = await getProductsForCategoryCached(category.id)

  const categoryFaqs = await getFaqsForCategoryPage(slug)

  const categoryListingJsonLd = CategoryListingJsonLd({
    variant: 'retail',
    slug,
    categoryName: category.name,
    description: category.description,
    products: (products ?? []).map((p) => ({ slug: p.slug, name: p.name })),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryListingJsonLd) }}
      />
      <div className="fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6">
          <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link href="/products" className="hover:text-[#1B2A4A] transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-[#2D2D2D]">{category.name}</span>
        </nav>

        {/* Category Header — compact so products are above the fold */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
            {category.name}
            {products && (
              <span className="text-sm font-normal text-[#9A9A9A] ml-2">({products.length} {products.length === 1 ? 'product' : 'products'})</span>
            )}
          </h1>
          <PricingModeToggle currentMode="retail" basePath={`/category/${slug}`} />
        </div>

        {/* Products — h2 so outline is h1 → h2 → h4 (product names) */}
        <section className="mb-2" aria-labelledby="category-products-heading">
          <h2
            id="category-products-heading"
            className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]"
          >
            Products in this category
          </h2>
          {products && products.length > 0 ? (
            <ProductGrid products={products as ProductWithDetails[]} productTitleTag="h4" />
          ) : (
            <div className="text-center py-16">
              <p className="text-[#9A9A9A] text-sm">No products found in this category.</p>
            </div>
          )}
        </section>

        {category.description && (
          <section className="mt-10 md:mt-12 pt-8 border-t border-[#E8E5E0]" aria-labelledby="category-about-heading">
            <h2
              id="category-about-heading"
              className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]"
            >
              About this category
            </h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-3xl">{category.description}</p>
          </section>
        )}

        <SizeGuideTable
          categoryId={category.id}
          categoryName={category.name}
          className="mt-8 pt-8 border-t border-[#E8E5E0]"
        />

        {isClassicalCostumeCategorySlug(slug) && (
          <ClassicalDanceComparisonTable
            className="mt-8 pt-8 border-t border-[#E8E5E0]"
            headingId={`classical-compare-category-${slug}`}
          />
        )}

        <section className="mt-8 pt-6 border-t border-[#E8E5E0]" aria-labelledby="category-guides-heading">
          <h2
            id="category-guides-heading"
            className="text-base md:text-lg font-semibold text-[#1B2A4A] mb-3 font-[family-name:var(--font-outfit)]"
          >
            Costume guides & ideas
          </h2>
          <Link href="/blog" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
            Fancy dress ideas & costume guides on our blog →
          </Link>
        </section>

        {categoryFaqs.length > 0 && (
          <div>
            <FaqSection
              title="Questions about ordering & delivery"
              headingId={`category-faq-${slug}`}
              items={categoryFaqs.map(({ id, question, answer }) => ({ id, question, answer }))}
            />
            <p className="mt-4 text-center">
              <Link href="/faq" className="text-sm font-medium text-[#C8956C] hover:text-[#A07048] transition-colors">
                View all FAQs →
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
