'use client'

import Image from 'next/image'
import { useState } from 'react'

export function CatalogGallery({
  images,
  alt,
}: {
  images: { url: string; thumbUrl: string }[]
  alt: string
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-xl bg-[#F5F3F0] border border-[#E8E5E0] flex items-center justify-center text-[#9A9A9A]">
        No Image
      </div>
    )
  }

  return (
    <div>
      <div
        className="aspect-[3/4] relative rounded-xl overflow-hidden bg-[#F5F3F0] border border-[#E8E5E0]"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <Image
          src={images[active].url}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`relative w-16 h-20 shrink-0 rounded-lg overflow-hidden border transition-colors ${
                i === active ? 'border-[#C8956C]' : 'border-[#E8E5E0] hover:border-[#C8956C]/50'
              }`}
            >
              <Image src={img.thumbUrl} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
