'use client'

import { useEffect } from 'react'
import type { ProductWithDetails } from '@/types/database'
import { getImageUrl } from '@/lib/imageUrl'
import { cardImageUrl } from '@/lib/utils/image-variants'

interface AssetPreloaderProps {
  products: ProductWithDetails[]
  bannerImages?: {
    desktop?: string | null
    mobile?: string | null
  }
}

export function AssetPreloader({ products, bannerImages }: AssetPreloaderProps) {
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false

    // 1) Preload ONLY the banner — it's the LCP element. Product images sit below
    //    the fold and must not compete for bandwidth here (no rel=preload for them).
    //    No crossOrigin, so this matches the plain <img> in EventBanner and is
    //    actually reused (avoids a duplicate fetch of the hero image).
    const bannerUrl = isMobile ? bannerImages?.mobile : bannerImages?.desktop
    if (bannerUrl) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = getImageUrl(bannerUrl)
      link.fetchPriority = 'high'
      document.head.appendChild(link)
    }

    // 2) No route or API prefetching here. /products is ~750KB of HTML and
    //    /api/products ~1.8MB of JSON; prefetching them on page load competed
    //    with the hero image on slow mobile connections (home LCP 8.9s -> 16.9s
    //    in Lighthouse, 23 Sep 2026). next/link already prefetches on demand.

    // 3) Warm the first section's product images on idle so they're cached by the
    //    time the user scrolls — without blocking the banner LCP. Warm the 400w card
    //    variant the cards actually render, not the ~450KB original (20 of those was ~9MB).
    const warmProductImages = () => {
      products.slice(0, 20).forEach((product) => {
        const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
        if (primaryImage?.image_url) {
          const img = new Image()
          img.src = cardImageUrl(primaryImage.image_url)
        }
      })
    }
    if ('requestIdleCallback' in window) {
      requestIdleCallback(warmProductImages)
    } else {
      setTimeout(warmProductImages, 2000)
    }
  }, [products, bannerImages])

  return null // This component doesn't render anything
}
