'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadCompressedImage } from '@/lib/utils/upload'
import { getImageUrl } from '@/lib/imageUrl'
import { Button } from '@/components/ui/button'
import { Upload, X, Save, Plus, ArrowUp, ArrowDown, Settings2 } from 'lucide-react'
import Image from 'next/image'
import type { Banner } from '@/types/database'

interface BannerSettings {
  id?: string
  ticker_text: string | null
  ticker_enabled: boolean
}

interface BannerManagementProps {
  initialSettings: BannerSettings | null
  initialBanners: Banner[]
}

export function BannerManagement({ initialSettings, initialBanners }: BannerManagementProps) {
  const [tickerSettings, setTickerSettings] = useState<BannerSettings>({
    id: initialSettings?.id,
    ticker_text: initialSettings?.ticker_text || null,
    ticker_enabled: initialSettings?.ticker_enabled || false,
  })

  // State for multiple banners
  const [banners, setBanners] = useState<Banner[]>(
    initialBanners.length > 0
      ? initialBanners
      : [] // Start empty if none exist
  )

  const [savingTicker, setSavingTicker] = useState(false)
  const [savingBanners, setSavingBanners] = useState(false)
  const [uploadingState, setUploadingState] = useState<{ id: string | 'new', type: 'desktop' | 'mobile' } | null>(null)

  // State for a "new" draft banner before saving to DB
  const [newBannerDraft, setNewBannerDraft] = useState<Partial<Banner> | null>(null)

  const supabase = createClient()

  const handleUpload = async (
    file: File,
    type: 'desktop' | 'mobile',
    bannerId: string | 'new'
  ) => {
    try {
      setUploadingState({ id: bannerId, type })

      const publicUrl = await uploadCompressedImage(file, 'banners-webp')

      if (bannerId === 'new') {
        setNewBannerDraft((prev) => ({
          ...prev,
          ...(type === 'desktop' ? { desktop_image_url: publicUrl } : { mobile_image_url: publicUrl })
        }))
      } else {
        setBanners(prev => prev.map(b =>
          b.id === bannerId
            ? { ...b, [type === 'desktop' ? 'desktop_image_url' : 'mobile_image_url']: publicUrl }
            : b
        ))
      }
    } catch (error: any) {
      alert(`Error uploading ${type} image: ${error.message}`)
    } finally {
      setUploadingState(null)
    }
  }

  const handleSaveTicker = async () => {
    try {
      setSavingTicker(true)
      const updateData = {
        ticker_text: tickerSettings.ticker_text || null,
        ticker_enabled: tickerSettings.ticker_enabled,
        updated_at: new Date().toISOString(),
      }

      if (tickerSettings.id) {
        const { error } = await supabase
          .from('banner_settings')
          .update(updateData)
          .eq('id', tickerSettings.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('banner_settings').insert(updateData)
        if (error) throw error
      }
      alert('Global ticker settings saved successfully!')
    } catch (error: any) {
      alert('Error saving ticker: ' + error.message)
    } finally {
      setSavingTicker(false)
    }
  }

  const handleSaveBanners = async () => {
    try {
      setSavingBanners(true)

      // Update existing banners
      if (banners.length > 0) {
        const { error } = await supabase
          .from('banners')
          .upsert(
            banners.map((b, index) => ({
              ...b,
              sort_order: index, // Enforce current visual order
              updated_at: new Date().toISOString()
            }))
          )
        if (error) throw error
      }

      // Add new banner if draft exists and is complete
      if (newBannerDraft && newBannerDraft.desktop_image_url && newBannerDraft.mobile_image_url) {
        const { error } = await supabase.from('banners').insert({
          desktop_image_url: newBannerDraft.desktop_image_url,
          mobile_image_url: newBannerDraft.mobile_image_url,
          link_url: newBannerDraft.link_url || null,
          alt_text: newBannerDraft.alt_text || 'Promotional Banner',
          sort_order: banners.length,
          is_enabled: newBannerDraft.is_enabled ?? true
        })
        if (error) throw error
        setNewBannerDraft(null)
      } else if (newBannerDraft) {
        alert("Please upload both Desktop and Mobile images for the new banner before saving.")
        setSavingBanners(false)
        return
      }

      alert('Banners saved successfully!')
      window.location.reload()
    } catch (error: any) {
      alert('Error saving banners: ' + error.message)
    } finally {
      setSavingBanners(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
      setBanners(prev => prev.filter(b => b.id !== id))
    } catch (error: any) {
      alert("Error deleting banner: " + error.message)
    }
  }

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners]
    if (direction === 'up' && index > 0) {
      const temp = newBanners[index]
      newBanners[index] = newBanners[index - 1]
      newBanners[index - 1] = temp
    } else if (direction === 'down' && index < newBanners.length - 1) {
      const temp = newBanners[index]
      newBanners[index] = newBanners[index + 1]
      newBanners[index + 1] = temp
    }
    setBanners(newBanners)
  }

  const updateBannerField = (id: string, field: keyof Banner, value: any) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
  }

  return (
    <div className="space-y-8">
      {/* GLOBAL SETTINGS (TICKER) */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
          <Settings2 className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900">Global Settings</h2>
        </div>

        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Running Ticker Strip</h3>
              <p className="text-sm text-gray-600">
                Display scrolling text across the very top of the homepage
              </p>
            </div>
            <button
              onClick={() => setTickerSettings((prev) => ({ ...prev, ticker_enabled: !prev.ticker_enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${tickerSettings.ticker_enabled ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tickerSettings.ticker_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
          <div>
            <input
              type="text"
              value={tickerSettings.ticker_text || ''}
              onChange={(e) => setTickerSettings((prev) => ({ ...prev, ticker_text: e.target.value }))}
              placeholder="Book Your costumes now. Happy Republic Day"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveTicker} disabled={savingTicker} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {savingTicker ? 'Saving...' : 'Save Ticker'}
            </Button>
          </div>
        </div>
      </div>

      {/* CAROUSEL BANNERS MANAGEMENT */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Carousel Banners</h2>
          <Button onClick={handleSaveBanners} disabled={savingBanners}>
            <Save className="w-4 h-4 mr-2" />
            {savingBanners ? 'Saving Changes...' : 'Save All Banners'}
          </Button>
        </div>

        {/* Existing Banners */}
        <div className="space-y-6">
          {banners.map((banner, index) => (
            <div key={banner.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">

              {/* Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <span className="text-sm font-medium mr-2 text-gray-500">Slide {index + 1}</span>
                <button onClick={() => moveBanner(index, 'up')} disabled={index === 0} className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ArrowUp className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => moveBanner(index, 'down')} disabled={index === banners.length - 1} className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => handleDeleteBanner(banner.id)} className="p-1.5 bg-red-50 border border-red-200 rounded hover:bg-red-100 ml-2">
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => updateBannerField(banner.id, 'is_enabled', !banner.is_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${banner.is_enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${banner.is_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {banner.is_enabled ? 'Active' : 'Hidden'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Desktop Preview/Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Desktop Image (1920x600)</label>
                  <input
                    id={`desktop-${banner.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'desktop', banner.id)}
                    disabled={uploadingState?.id === banner.id}
                    className="hidden"
                  />
                  {banner.desktop_image_url ? (
                    <div className="relative w-full aspect-[16/5] rounded bg-gray-200 overflow-hidden border">
                      <Image src={getImageUrl(banner.desktop_image_url)} alt="Desktop preview" fill className="object-cover" />
                      <button onClick={() => document.getElementById(`desktop-${banner.id}`)?.click()} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition cursor-pointer">
                        {uploadingState?.id === banner.id && uploadingState?.type === 'desktop' ? 'Uploading...' : 'Change Image'}
                      </button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full h-24" onClick={() => document.getElementById(`desktop-${banner.id}`)?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> Upload Desktop
                    </Button>
                  )}
                </div>

                {/* Mobile Preview/Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Image (1080x500)</label>
                  <input
                    id={`mobile-${banner.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'mobile', banner.id)}
                    disabled={uploadingState?.id === banner.id}
                    className="hidden"
                  />
                  {banner.mobile_image_url ? (
                    <div className="relative w-1/2 mx-auto aspect-[2.16/1] rounded bg-gray-200 overflow-hidden border">
                      <Image src={getImageUrl(banner.mobile_image_url)} alt="Mobile preview" fill className="object-cover" />
                      <button onClick={() => document.getElementById(`mobile-${banner.id}`)?.click()} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition cursor-pointer">
                        {uploadingState?.id === banner.id && uploadingState?.type === 'mobile' ? 'Uploading...' : 'Change'}
                      </button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full h-24" onClick={() => document.getElementById(`mobile-${banner.id}`)?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> Upload Mobile
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={banner.link_url || ''}
                    onChange={(e) => updateBannerField(banner.id, 'link_url', e.target.value)}
                    placeholder="/products or https://example.com"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Alt Text (SEO)</label>
                  <input
                    type="text"
                    value={banner.alt_text || ''}
                    onChange={(e) => updateBannerField(banner.id, 'alt_text', e.target.value)}
                    placeholder="Promotional Banner"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* New Banner Form */}
        {!newBannerDraft ? (
          <Button variant="outline" className="w-full py-8 border-dashed" onClick={() => setNewBannerDraft({ is_enabled: true })}>
            <Plus className="w-5 h-5 mr-2" /> Add New Banner Slide
          </Button>
        ) : (
          <div className="p-4 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-indigo-900">New Banner Draft</h3>
              <button onClick={() => setNewBannerDraft(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Desktop Draft */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Desktop Image (Required)</label>
                <input
                  id="desktop-new"
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'desktop', 'new')}
                  className="hidden"
                />
                {newBannerDraft.desktop_image_url ? (
                  <div className="relative w-full aspect-[16/5] rounded bg-gray-200 overflow-hidden border">
                    <Image src={getImageUrl(newBannerDraft.desktop_image_url)} alt="Desktop preview" fill className="object-cover" />
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full h-24" onClick={() => document.getElementById('desktop-new')?.click()}>
                    {uploadingState?.id === 'new' && uploadingState?.type === 'desktop' ? 'Uploading...' : 'Upload Desktop'}
                  </Button>
                )}
              </div>

              {/* Mobile Draft */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Image (Required)</label>
                <input
                  id="mobile-new"
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'mobile', 'new')}
                  className="hidden"
                />
                {newBannerDraft.mobile_image_url ? (
                  <div className="relative w-1/2 mx-auto aspect-[2.16/1] rounded bg-gray-200 overflow-hidden border">
                    <Image src={getImageUrl(newBannerDraft.mobile_image_url)} alt="Mobile preview" fill className="object-cover" />
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full h-24" onClick={() => document.getElementById('mobile-new')?.click()}>
                    {uploadingState?.id === 'new' && uploadingState?.type === 'mobile' ? 'Uploading...' : 'Upload Mobile'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Link URL</label>
                <input
                  type="text"
                  value={newBannerDraft.link_url || ''}
                  onChange={(e) => setNewBannerDraft(prev => ({ ...prev!, link_url: e.target.value }))}
                  placeholder="/products"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={newBannerDraft.alt_text || ''}
                  onChange={(e) => setNewBannerDraft(prev => ({ ...prev!, alt_text: e.target.value }))}
                  placeholder="Promotional Banner"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <p className="text-xs text-indigo-600 mt-4 text-right">
              Click "Save All Banners" at the top to publish this new banner to the site.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

