'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BannerManagement } from '@/components/admin/BannerManagement'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminBannerPage() {
  const [bannerSettings, setBannerSettings] = useState<any>(null)
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      const supabase = createClient()

      // Fetch singleton settings (for Ticker)
      const { data: settingsData } = await supabase
        .from('banner_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Fetch multiple banners (for Carousel)
      const { data: bannersData } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true })

      setBannerSettings(settingsData || null)
      setBanners(bannersData || [])
      setLoading(false)
    }
    fetchBanners()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Banner Management</h1>
      </div>
      <BannerManagement initialSettings={bannerSettings} initialBanners={banners} />
    </div>
  )
}
