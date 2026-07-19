import Image from 'next/image'

interface ProductThumbProps {
  src: string | null
  alt: string
  /** Tailwind size classes for the square (default h-11 w-11 ≈ 44px). */
  className?: string
  /** next/image `sizes` hint; keep in sync with className. */
  sizes?: string
}

/** Small square product thumbnail for admin views, with a graceful no-image fallback. */
export function ProductThumb({
  src,
  alt,
  className = 'h-11 w-11',
  sizes = '44px',
}: ProductThumbProps) {
  return (
    <div
      className={`relative ${className} shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100`}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9px] leading-none text-gray-400">
          No img
        </div>
      )}
    </div>
  )
}
