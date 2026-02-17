import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { CategoryCard } from '@/components/public/CategoryCard'
import { SearchBar } from '@/components/public/SearchBar'
import { EventBanner } from '@/components/public/EventBanner'
import { TickerStrip } from '@/components/public/TickerStrip'
import { AssetPreloader } from '@/components/public/AssetPreloader'
import { Button } from '@/components/ui/button'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
import { Star, Award, Calendar } from 'lucide-react'
import type { ProductWithDetails } from '@/types/database'

export const metadata = generatePageMetadata({
  title: 'Premium Fancy Dress Costumes & Accessories in Delhi',
  description: 'Shop premium fancy dress costumes and accessories in Delhi. 15+ years experience, 400+ successful school functions. Quality costumes for dance performances, school events, and celebrations.',
  path: '/',
})

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch banner settings from database
  const { data: bannerSettings } = await supabase
    .from('banner_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const hasEventBanner =
    bannerSettings?.is_enabled &&
    bannerSettings?.desktop_image_url &&
    bannerSettings?.mobile_image_url

  const desktopBannerUrl = bannerSettings?.desktop_image_url || null
  const mobileBannerUrl = bannerSettings?.mobile_image_url || null
  const bannerLinkUrl = bannerSettings?.link_url || null
  const bannerAltText = bannerSettings?.alt_text || 'Upcoming Event'
  const tickerText = bannerSettings?.ticker_text || null
  const tickerEnabled = bannerSettings?.ticker_enabled || false

  // Fetch featured products (active products with images, not deleted)
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const breadcrumbSchema = BreadcrumbSchema([
    { name: 'Home', url: '/' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {products && products.length > 0 && (
        <AssetPreloader
          products={products as ProductWithDetails[]}
          bannerImages={{
            desktop: desktopBannerUrl,
            mobile: mobileBannerUrl
          }}
        />
      )}
      <div>
        {/* Running Ticker Strip */}
        {tickerEnabled && tickerText && (
          <div className="relative -mt-4 md:-mt-8 mb-2 md:mb-0" style={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw'
          }}>
            <TickerStrip text={tickerText} />
          </div>
        )}

        {/* Event Banner */}
        {hasEventBanner && desktopBannerUrl && mobileBannerUrl && (
          <section className={`-mx-4 md:mx-0 ${tickerEnabled && tickerText ? 'mt-3 md:mt-4' : ''}`}>
            <div className="px-4 md:px-0">
              <EventBanner
                desktopImage={desktopBannerUrl}
                mobileImage={mobileBannerUrl}
                linkUrl={bannerLinkUrl || undefined}
                alt={bannerAltText}
              />
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section className={`relative text-center -mx-4 md:mx-0 rounded-xl fade-in ${hasEventBanner
          ? 'py-6 md:py-8 mb-6 md:mb-8 mt-2 md:mt-3'
          : 'py-10 md:py-16 lg:py-20 mb-8 md:mb-12'
          }`}>
          {/* Warm gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF8] via-[#F5F3F0] to-[#F0EDE8] rounded-xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,149,108,0.08),transparent_50%)] rounded-xl" />

          <div className={`relative z-10 max-w-3xl mx-auto px-4 ${hasEventBanner ? 'max-w-2xl' : ''
            }`}>
            <h1 className={`font-[family-name:var(--font-outfit)] font-bold text-[#1B2A4A] leading-tight ${hasEventBanner
              ? 'text-2xl md:text-3xl mb-3'
              : 'text-3xl md:text-5xl lg:text-[3.5rem] mb-4 md:mb-5'
              }`}>
              Discover Stunning
              <span className="block text-[#C8956C]">Fancy Dress Costumes</span>
            </h1>
            {!hasEventBanner && (
              <p className="text-base md:text-lg text-[#6B6B6B] mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed">
                Premium costumes for school functions, dance performances, and celebrations. Trusted by 400+ schools across Delhi.
              </p>
            )}

            {/* Search Bar */}
            <div className={`mx-auto ${hasEventBanner ? 'max-w-xl' : 'max-w-2xl'}`}>
              <SearchBar />
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="mb-8 md:mb-12 fade-in">
          <div className="flex items-center justify-center gap-4 md:gap-8 py-4 px-4 rounded-xl bg-white border border-[#E8E5E0]" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#FBF5EF] flex items-center justify-center mb-1.5">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-[#C8956C]" />
              </div>
              <span className="text-sm md:text-base font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">15+ Years</span>
              <span className="text-[10px] md:text-xs text-[#9A9A9A]">Experience</span>
            </div>
            <div className="w-px h-10 bg-[#E8E5E0]" />
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#FBF5EF] flex items-center justify-center mb-1.5">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#C8956C]" />
              </div>
              <span className="text-sm md:text-base font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">400+</span>
              <span className="text-[10px] md:text-xs text-[#9A9A9A]">School Events</span>
            </div>
            <div className="w-px h-10 bg-[#E8E5E0]" />
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#FBF5EF] flex items-center justify-center mb-1.5">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-[#C8956C]" />
              </div>
              <span className="text-sm md:text-base font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">4.7★</span>
              <span className="text-[10px] md:text-xs text-[#9A9A9A]">700+ Reviews</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <section className="mb-8 md:mb-14 fade-in">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Shop by Category</h2>
            </div>
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible pb-2 md:pb-0">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="mb-20 md:mb-16 fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 md:mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">New Arrivals</h2>
              <PricingModeToggle currentMode="retail" />
            </div>
            <Link
              href="/products"
              prefetch={true}
              className="w-full sm:w-auto"
            >
              <Button variant="outline" className="w-full sm:w-auto text-sm">
                View All Products →
              </Button>
            </Link>
          </div>
          {products && products.length > 0 ? (
            <ProductGrid products={products as ProductWithDetails[]} />
          ) : (
            <p className="text-[#9A9A9A] text-center py-12">
              No products available yet. Check back soon!
            </p>
          )}
        </section>
      </div>
    </>
  )
}
