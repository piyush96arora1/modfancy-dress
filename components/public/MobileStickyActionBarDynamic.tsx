'use client'

import dynamic from 'next/dynamic'

// Dynamically import the action bar with SSR disabled for optimal first paint performance
const DynamicActionBar = dynamic(
    () => import('@/components/public/MobileStickyActionBar').then(mod => mod.MobileStickyActionBar),
    { ssr: false }
)

export function MobileStickyActionBarDynamic() {
    return <DynamicActionBar />
}
