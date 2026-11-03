'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof Link>, 'prefetch' | 'href'> & { href: string }

/**
 * Link for product and category cards: prefetches on intent (hover, focus or
 * touch start) instead of when the card scrolls into view. A grid of viewport-
 * prefetching cards fetched every visible card's route segments, which was most
 * of the site's CDN requests (Hobby plan limit, Nov 2026). Touch start still
 * lands ~100ms before the tap, and the pages are CDN-cached, so taps stay quick.
 */
export function IntentLink({ href, onPointerEnter, onTouchStart, onFocus, ...rest }: Props) {
  const router = useRouter()
  const prefetch = () => router.prefetch(href)
  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={(e) => { prefetch(); onPointerEnter?.(e) }}
      onTouchStart={(e) => { prefetch(); onTouchStart?.(e) }}
      onFocus={(e) => { prefetch(); onFocus?.(e) }}
      {...rest}
    />
  )
}
