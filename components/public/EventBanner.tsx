import Image from 'next/image'
import Link from 'next/link'

interface EventBannerProps {
  desktopImage: string
  mobileImage: string
  linkUrl?: string
  alt?: string
}

export function EventBanner({ desktopImage, mobileImage, linkUrl, alt = 'Upcoming Event' }: EventBannerProps) {
  const bannerContent = (
    <div className="relative w-full overflow-hidden rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Desktop Banner */}
      <div className="hidden md:block relative w-full aspect-[16/5] rounded-lg md:rounded-xl overflow-hidden">
        <Image
          src={desktopImage}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      
      {/* Mobile Banner */}
      <div className="block md:hidden relative w-full aspect-[2.16/1] rounded-lg overflow-hidden">
        <Image
          src={mobileImage}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
    </div>
  )

  if (linkUrl) {
    return (
      <Link href={linkUrl} className="block hover:opacity-95 transition-opacity">
        {bannerContent}
      </Link>
    )
  }

  return bannerContent
}


