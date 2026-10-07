'use client'

import { useEffect } from 'react'
import { ecommerce, track, type GaItem } from '@/lib/analytics/gtag'

/** Fires GA4 view_item once per product page view. Renders nothing. */
export function TrackViewItem({ item, hasRent }: { item: GaItem; hasRent: boolean }) {
  useEffect(() => {
    // gtag loads afterInteractive; a short delay lets a first-load PDP view land.
    const t = setTimeout(() => track('view_item', { ...ecommerce([item]), has_rent: hasRent }), 1500)
    return () => clearTimeout(t)
  }, [item.item_id]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
