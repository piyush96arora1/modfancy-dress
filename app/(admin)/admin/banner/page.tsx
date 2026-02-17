'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BannerManagement } from '@/components/admin/BannerManagement'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminBannerPage() {
  const [bannerSettings, setBannerSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanner = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('banner_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setBannerSettings(data || null)
      setLoading(false)
    }
    fetchBanner()
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
      <BannerManagement initialSettings={bannerSettings} />
    </div>
  )
}
