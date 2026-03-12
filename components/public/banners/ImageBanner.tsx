'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/imageUrl'

export interface ImageBannerProps {
  imagePath: string
  imageAlt?: string
  linkTo?: string
  height?: 'sm' | 'md' | 'lg' | 'auto'
  priority?: boolean
}

export function ImageBanner({
  imagePath,
  imageAlt = 'Promotional Banner',
  linkTo,
  height = 'md',
  priority = false,
}: ImageBannerProps) {
  const heightClasses = {
    sm: 'h-[300px] md:h-[400px]',
    md: 'h-[400px] md:h-[500px]',
    lg: 'h-[500px] md:h-[600px]',
    auto: 'h-auto',
  }

  const bannerContent = (
    <div className={`relative w-full overflow-hidden rounded-2xl shadow-lg ${heightClasses[height]}`}>
      <Image
        src={getImageUrl(imagePath)}
        alt={imageAlt}
        fill
        className="object-cover"
        priority={priority}
        sizes="100vw"
      />
    </div>
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="block">
        {bannerContent}
      </Link>
    )
  }

  return bannerContent
}

