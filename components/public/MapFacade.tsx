'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

/** Krishna Nagar store. The Maps URL is the canonical one used in the LocalBusiness schema `sameAs`. */
export const STORE_MAP_EMBED_SRC =
  'https://maps.google.com/maps?q=S64+South+Anarkali+Som+Bazar+Krishna+Nagar+Delhi+110051&output=embed'
export const STORE_MAPS_URL = 'https://www.google.com/maps?cid=17989257548569961947'

interface MapFacadeProps {
  /** Accessible title for the iframe, and the caption shown before it loads. */
  label: string
  embedSrc?: string
  mapsUrl?: string
  /** Pixel height of both the placeholder and the iframe, so nothing shifts on click. */
  height?: number
}

/**
 * A Google Maps embed costs ~475KB and most of the location pages' FCP. This
 * renders a lightweight placeholder with the address and an "Open in Google
 * Maps" link, and only mounts the iframe when the visitor asks for it.
 */
export function MapFacade({
  label,
  embedSrc = STORE_MAP_EMBED_SRC,
  mapsUrl = STORE_MAPS_URL,
  height = 240,
}: MapFacadeProps) {
  const [on, setOn] = useState(false)

  if (on) {
    return (
      <iframe
        src={embedSrc}
        title={label}
        width="100%"
        height={height}
        style={{ border: 0 }}
        className="block w-full"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    )
  }

  return (
    <div
      className="w-full bg-[#F5F3F0] flex flex-col items-center justify-center gap-3 text-center p-4"
      style={{ height }}
    >
      <MapPin className="w-6 h-6 text-[#8F6240]" aria-hidden="true" />
      <p className="text-sm text-[#1B2A4A] font-medium">{label}</p>
      <p className="text-xs text-[#6B6B6B]">S64, South Anarkali, Som Bazar, Krishna Nagar, Delhi 110051</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => setOn(true)}
          className="px-4 py-2 rounded-lg bg-[#1B2A4A] text-white text-sm font-medium hover:bg-[#24375F] transition-colors"
        >
          Show map
        </button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg border border-[#E8E5E0] bg-white text-sm font-medium text-[#1B2A4A] hover:border-[#C8956C] transition-colors"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  )
}
