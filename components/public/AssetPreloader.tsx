'use client'

import { useEffect } from 'react'
import type { ProductWithDetails } from '@/types/database'
import { getImageUrl } from '@/lib/imageUrl'


interface AssetPreloaderProps {
  products: ProductWithDetails[]
  bannerImages?: {
    desktop?: string | null
    mobile?: string | null
  }
}

export function AssetPreloader({ products, bannerImages }: AssetPreloaderProps) {
  useEffect(() => {
    if (!products || products.length === 0) return

    // Preload critical product images
    const preloadImages = () => {
      const imageUrls: string[] = []

      // Preload featured product images (first 8 products, primary images)
      products.slice(0, 8).forEach((product) => {
        const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
        if (primaryImage?.image_url) {
          imageUrls.push(getImageUrl(primaryImage.image_url))
        }
      })

      // Preload banner images if available - only preload the one that fits the current viewport
      const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

      if (isMobile && bannerImages?.mobile) {
        imageUrls.push(getImageUrl(bannerImages.mobile))
      } else if (!isMobile && bannerImages?.desktop) {
        imageUrls.push(getImageUrl(bannerImages.desktop))
      }

      // Preload images with link preload
      imageUrls.forEach((url) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = url
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      })

      // Also preload using Image objects for browser cache
      imageUrls.forEach((url) => {
        const img = new Image()
        img.src = url
      })
    }

    // Preload critical routes
    const preloadRoutes = () => {
      const routes = ['/products', '/contact']
      routes.forEach((route) => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route
        document.head.appendChild(link)
      })

      // Prefetch products API endpoint for instant navigation
      const apiLink = document.createElement('link')
      apiLink.rel = 'prefetch'
      apiLink.href = '/api/products'
      document.head.appendChild(apiLink)
    }

    // Run preloading
    preloadImages()
    preloadRoutes()

    // Preload additional product images on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (products.length > 8) {
          products.slice(8, 20).forEach((product) => {
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
            if (primaryImage?.image_url) {
              const img = new Image()
              img.src = getImageUrl(primaryImage.image_url)
            }
          })
        }
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        if (products.length > 8) {
          products.slice(8, 20).forEach((product) => {
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
            if (primaryImage?.image_url) {
              const img = new Image()
              img.src = getImageUrl(primaryImage.image_url)
            }
          })
        }
      }, 2000)
    }
  }, [products, bannerImages])

  return null // This component doesn't render anything
}

