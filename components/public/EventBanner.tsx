'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import type { Banner } from '@/types/database'
import { getImageUrl } from '@/lib/imageUrl'


interface EventBannerProps {
  banners: Banner[]
}

export function EventBanner({ banners }: EventBannerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)
  // Track which slides have entered the viewport so we only ever download the
  // images that have actually been shown. Slide 0 is visible on first paint.
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]))

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const markSlidesInView = useCallback(() => {
    if (!emblaApi) return
    setLoadedSlides((prev) => {
      const next = new Set(prev)
      for (const i of emblaApi.slidesInView()) next.add(i)
      return next
    })
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    markSlidesInView()
    emblaApi.on('select', onSelect)
    emblaApi.on('select', markSlidesInView)
    emblaApi.on('slidesInView', markSlidesInView)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('reInit', markSlidesInView)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('select', markSlidesInView)
      emblaApi.off('slidesInView', markSlidesInView)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('reInit', markSlidesInView)
    }
  }, [emblaApi, onSelect, markSlidesInView])

  if (!banners || banners.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden rounded-lg md:rounded-xl shadow-lg group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {banners.map((banner, index) => {
            const isPriority = index === 0
            // Only mount the image once its slide has been in view (slide 0 always).
            const shouldLoad = isPriority || loadedSlides.has(index)

            const bannerContent = (
              <div className="relative w-full flex-none overflow-hidden">
                {/* One responsive container: mobile aspect below md, desktop aspect at md+.
                    <picture> lets the browser download ONLY the matching device image. */}
                <div className="relative w-full aspect-[2.16/1] md:aspect-[16/5] overflow-hidden bg-[#F5F3F0]">
                  {shouldLoad && (
                    <picture>
                      <source
                        media="(min-width: 768px)"
                        srcSet={getImageUrl(banner.desktop_image_url)}
                      />
                      <img
                        src={getImageUrl(banner.mobile_image_url)}
                        alt={banner.alt_text || 'Promotional Banner'}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading={isPriority ? 'eager' : 'lazy'}
                        fetchPriority={isPriority ? 'high' : 'auto'}
                        decoding="async"
                      />
                    </picture>
                  )}
                </div>
              </div>
            )

            return (
              <div key={banner.id} className="min-w-0 flex-[0_0_100%]">
                {banner.link_url ? (
                  <Link href={banner.link_url} className="block hover:opacity-95 transition-opacity">
                    {bannerContent}
                  </Link>
                ) : (
                  bannerContent
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Subtle bottom gradient to ensure dots are always visible over light images */}
      {banners.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-0" />
      )}

      {/* Dots Indicator (Only show if > 1 banner) */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-center gap-0 z-10 px-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              // Outer button serves as the large transparent touch target
              className="p-1.5 outline-none flex items-center justify-center cursor-pointer drop-shadow-md"
              aria-label={`Go to slide ${index + 1}`}
            >
              {/* Inner div is the strictly small visual dot */}
              <div
                className={`rounded-full transition-all duration-300 ${index === selectedIndex
                  ? 'h-[5px] w-[18px] md:h-[8px] md:w-[24px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
                  : 'h-[5px] w-[5px] md:h-[8px] md:w-[8px] bg-white/70 hover:bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                  }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

