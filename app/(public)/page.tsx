import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/public/ProductGrid'
import { CategoryCard } from '@/components/public/CategoryCard'
import { SearchBar } from '@/components/public/SearchBar'
import { EventBanner } from '@/components/public/EventBanner'
import { TickerStrip } from '@/components/public/TickerStrip'
import { Button } from '@/components/ui/button'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BreadcrumbSchema } from '@/lib/seo/structured-data'
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
    .is('deleted_at', null) // Only show products that are not deleted
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
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
      <div>
      {/* Running Ticker Strip */}
      {tickerEnabled && tickerText && (
        <div className="-mt-8 -mx-4 md:mx-0">
          <TickerStrip text={tickerText} />
        </div>
      )}

      {/* Event Banner - Show prominently when available */}
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

      {/* Hero Section - Reduced size when banner is active */}
      <section className={`relative text-center overflow-hidden -mx-4 md:mx-0 rounded-lg md:rounded-xl shadow-lg ${
        hasEventBanner 
          ? 'py-6 md:py-8 mb-6 md:mb-8 mt-2 md:mt-3' 
          : 'py-12 md:py-16 lg:py-24 mb-8 md:mb-12 lg:mb-16'
      }`}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-50 rounded-lg md:rounded-xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)] rounded-lg md:rounded-xl" />
        
        <div className={`relative z-10 max-w-4xl mx-auto px-4 md:px-4 ${
          hasEventBanner ? 'max-w-3xl' : ''
        }`}>
          <h1 className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight ${
            hasEventBanner 
              ? 'text-2xl md:text-3xl mb-3' 
              : 'text-4xl md:text-5xl lg:text-6xl mb-6'
          }`}>
            Welcome to Mod Fancy Dress
          </h1>
          {!hasEventBanner && (
            <p className="text-xl md:text-2xl text-gray-700 mb-8 md:mb-10 font-medium">
              Discover amazing fancy dress costumes and accessories
            </p>
          )}
          
          {/* Search Bar */}
          <div className={`mx-auto ${hasEventBanner ? 'max-w-xl' : 'max-w-2xl'}`}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="mb-12 md:mb-16 px-2 md:px-4 lg:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mb-12 md:mb-16 px-2 md:px-4 lg:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
              View All Products
            </Button>
          </Link>
        </div>
        {products && products.length > 0 ? (
          <ProductGrid products={products as ProductWithDetails[]} />
        ) : (
          <p className="text-gray-500 text-center py-12">
            No products available yet. Check back soon!
          </p>
        )}
      </section>
    </div>
    </>
  )
}






