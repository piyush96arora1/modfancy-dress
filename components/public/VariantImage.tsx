'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type VariantImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  /** Resized variant (lib/utils/image-variants.ts). */
  src: string
  /** The original upload, used when the variant does not exist (yet). */
  fallbackSrc: string
}

/**
 * next/image that swaps to the original URL if the resized variant fails to load.
 * Photos uploaded before the variants backfill or by an older admin build have no variant;
 * without this the card would show a broken image (Review Focus #3).
 */
export function VariantImage({ src, fallbackSrc, ...props }: VariantImageProps) {
  // Keyed on src so a new image (gallery selection, list re-render) starts on its variant.
  return <VariantImageInner key={src} src={src} fallbackSrc={fallbackSrc} {...props} />
}

function VariantImageInner({ src, fallbackSrc, alt, ...props }: VariantImageProps) {
  const [failed, setFailed] = useState(false)

  // An image that already failed before hydration never delivers onError to React, so
  // check when the element attaches: a complete image with no pixels is a failed load.
  const checkAlreadyFailed = (img: HTMLImageElement | null) => {
    if (img && !failed && img.complete && img.naturalWidth === 0 && src !== fallbackSrc) {
      setFailed(true)
    }
  }

  return (
    <Image
      {...props}
      ref={checkAlreadyFailed}
      alt={alt}
      src={failed || !src ? fallbackSrc : src}
      onError={() => {
        if (!failed && src !== fallbackSrc) setFailed(true)
      }}
    />
  )
}
