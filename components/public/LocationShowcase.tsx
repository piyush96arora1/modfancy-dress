import Link from 'next/link'
import { getActiveCategoriesDailyCached, getDatedHomepageSectionsCached, getNonEmptyCategoryIdsCached } from '@/lib/supabase/cached-seo-queries'
import { getProductsForCategoryCached } from '@/lib/supabase/cached-queries'
import { EVERGREEN_CATEGORY_SLUGS, interleaveUnique, pickTiles, preferCostumes, seasonalCategoryIds } from '@/lib/location/showcase'
import { todayIST } from '@/lib/utils/seasonal'
import { toProductCardData, type ProductCardRow } from '@/lib/utils/product-card-data'
import { cardImageUrl } from '@/lib/utils/image-variants'
import { getImageUrl } from '@/lib/imageUrl'
import { ProductGrid } from './ProductGrid'
import { VariantImage } from './VariantImage'

/**
 * Occasion tiles + one in-season product row for the location landing pages.
 * Server-rendered so every link is in the HTML; images are 400w variants and lazy,
 * so the H1 and store card stay the LCP. See docs/superpowers/plans/2026-09-25-location-page-showcase.md.
 */
export async function LocationShowcase({ city }: { city: string }) {
  const [sections, nonEmptyIds, activeCategories] = await Promise.all([
    getDatedHomepageSectionsCached(),
    getNonEmptyCategoryIdsCached(),
    getActiveCategoriesDailyCached(),
  ])
  const nonEmpty = new Set(nonEmptyIds)
  const categories = activeCategories.filter((c) => nonEmpty.has(c.id))
  const idBySlug = new Map(categories.map((c) => [c.slug, c.id]))
  const evergreenIds = EVERGREEN_CATEGORY_SLUGS.map((s) => idBySlug.get(s)).filter((id): id is string => !!id)

  // Products for every candidate category: gives min_products counts, tile covers and the row.
  const candidateIds = [...new Set([
    ...sections.map((s) => s.category_id).filter((id): id is string => !!id && nonEmpty.has(id)),
    ...evergreenIds,
  ])]
  const productsById = new Map(
    await Promise.all(candidateIds.map(async (id) => [id, (await getProductsForCategoryCached(id)) ?? []] as const))
  )

  const seasonalIds = seasonalCategoryIds(sections, todayIST(), (id) => productsById.get(id)?.length ?? 0)
  const tiles = pickTiles({
    orderedIds: [...seasonalIds, ...evergreenIds],
    categories,
    coverFor: (id) => {
      const p = preferCostumes(productsById.get(id) ?? [])[0]
      const img = p?.images?.find((i: { is_primary: boolean }) => i.is_primary) ?? p?.images?.[0]
      return img?.image_url ?? null
    },
  })
  const rowSource = seasonalIds.length ? seasonalIds : evergreenIds.slice(0, 2)
  const products = interleaveUnique(rowSource.map((id) => preferCostumes(productsById.get(id) ?? [])), 8).map((p) => toProductCardData(p as unknown as ProductCardRow))

  if (tiles.length === 0 && products.length === 0) return null

  return (
    <div className="mb-10 space-y-10">
      {tiles.length > 0 && (
        <section aria-labelledby="shop-by-occasion">
          <h2 id="shop-by-occasion" className="text-lg font-semibold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]">
            Shop Costumes by Occasion
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tiles.map((t) => (
              <li key={t.slug}>
                <Link href={`/category/${t.slug}`} className="group block rounded-xl overflow-hidden bg-white border border-[#E8E5E0] hover:border-[#C8956C]/60 transition-colors">
                  <div className="relative aspect-square bg-[#F5F3F0]">
                    <VariantImage
                      src={cardImageUrl(t.image)}
                      fallbackSrc={getImageUrl(t.image)}
                      alt={`${t.name} costumes`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 180px"
                    />
                  </div>
                  <p className="px-2 py-2 text-center text-xs md:text-sm font-medium text-[#2D2D2D] group-hover:text-[#1B2A4A] leading-tight">{t.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {products.length > 0 && (
        <section aria-labelledby="popular-now">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 id="popular-now" className="text-lg font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
              Popular in {city} Right Now
            </h2>
            <Link href="/products" className="text-sm text-[#8F6240] hover:underline font-medium shrink-0">View all costumes →</Link>
          </div>
          <ProductGrid products={products} productTitleTag="h3" />
        </section>
      )}
    </div>
  )
}
