'use client'

import { PromotionalBanner } from './PromotionalBanner'
import { Flag } from 'lucide-react'

export function RepublicDayBanner() {
  return (
    <PromotionalBanner
      title="REPUBLIC DAY"
      subtitle="COSTUME COLLECTION"
      description="Premium Quality Costumes"
      buttonText="SHOP NOW"
      buttonLink="/products"
      buttonIcon={Flag}
      backgroundColor="from-blue-100 via-orange-50 to-amber-100"
      titleColor="text-orange-600"
      subtitleBgColor="bg-green-600"
      subtitleTextColor="text-white"
      buttonColor="bg-red-600 hover:bg-red-700"
      showFlags={true}
      flagColors={['bg-orange-500', 'bg-white', 'bg-green-500']}
      height="md"
    />
  )
}

