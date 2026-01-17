'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, X, Save, Power } from 'lucide-react'
import Image from 'next/image'

interface BannerSettings {
  id?: string
  is_enabled: boolean
  desktop_image_url: string | null
  mobile_image_url: string | null
  link_url: string | null
  alt_text: string | null
  ticker_text: string | null
  ticker_enabled: boolean
}

interface BannerManagementProps {
  initialSettings: BannerSettings | null
}

export function BannerManagement({ initialSettings }: BannerManagementProps) {
  const [settings, setSettings] = useState<BannerSettings>({
    is_enabled: initialSettings?.is_enabled || false,
    desktop_image_url: initialSettings?.desktop_image_url || null,
    mobile_image_url: initialSettings?.mobile_image_url || null,
    link_url: initialSettings?.link_url || null,
    alt_text: initialSettings?.alt_text || 'Upcoming Event',
    ticker_text: initialSettings?.ticker_text || null,
    ticker_enabled: initialSettings?.ticker_enabled || false,
  })

  const [uploadingDesktop, setUploadingDesktop] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)
  const [saving, setSaving] = useState(false)
  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (
    file: File,
    type: 'desktop' | 'mobile',
    setUploading: (value: boolean) => void
  ) => {
    try {
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `banner-${type}-${Date.now()}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          upsert: true,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath)

      if (type === 'desktop') {
        setSettings((prev) => ({ ...prev, desktop_image_url: publicUrl }))
      } else {
        setSettings((prev) => ({ ...prev, mobile_image_url: publicUrl }))
      }
    } catch (error: any) {
      alert(`Error uploading ${type} image: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDesktopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    await handleUpload(e.target.files[0], 'desktop', setUploadingDesktop)
    if (desktopInputRef.current) {
      desktopInputRef.current.value = ''
    }
  }

  const handleMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    await handleUpload(e.target.files[0], 'mobile', setUploadingMobile)
    if (mobileInputRef.current) {
      mobileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const updateData = {
        is_enabled: settings.is_enabled,
        desktop_image_url: settings.desktop_image_url,
        mobile_image_url: settings.mobile_image_url,
        link_url: settings.link_url || null,
        alt_text: settings.alt_text || 'Upcoming Event',
        ticker_text: settings.ticker_text || null,
        ticker_enabled: settings.ticker_enabled,
        updated_at: new Date().toISOString(),
      }

      if (initialSettings?.id) {
        const { error } = await supabase
          .from('banner_settings')
          .update(updateData)
          .eq('id', initialSettings.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('banner_settings').insert(updateData)

        if (error) throw error
      }

      alert('Banner settings saved successfully!')
      window.location.reload()
    } catch (error: any) {
      alert('Error saving banner settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const removeImage = (type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setSettings((prev) => ({ ...prev, desktop_image_url: null }))
    } else {
      setSettings((prev) => ({ ...prev, mobile_image_url: null }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Ticker Strip Section */}
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Running Ticker Strip</h3>
            <p className="text-sm text-gray-600">
              Display scrolling text above the banner/gradient section
            </p>
          </div>
          <button
            onClick={() => setSettings((prev) => ({ ...prev, ticker_enabled: !prev.ticker_enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.ticker_enabled ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.ticker_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div>
          <label htmlFor="ticker_text" className="block text-sm font-medium text-gray-700 mb-2">
            Ticker Text
          </label>
          <input
            id="ticker_text"
            type="text"
            value={settings.ticker_text || ''}
            onChange={(e) => setSettings((prev) => ({ ...prev, ticker_text: e.target.value }))}
            placeholder="Book Your costumes now. Happy Republic Day"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            This text will scroll continuously across the top of the homepage
          </p>
        </div>
      </div>

      {/* Toggle Banner */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-900">Banner Status</h3>
          <p className="text-sm text-gray-600">
            {settings.is_enabled ? 'Banner is currently visible on homepage' : 'Banner is hidden'}
          </p>
        </div>
        <button
          onClick={() => setSettings((prev) => ({ ...prev, is_enabled: !prev.is_enabled }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.is_enabled ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.is_enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Desktop Banner */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desktop Banner Image
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Recommended size: 1920x600px (16:5 aspect ratio)
          </p>
          <input
            ref={desktopInputRef}
            type="file"
            accept="image/*"
            onChange={handleDesktopUpload}
            disabled={uploadingDesktop}
            className="hidden"
          />
          {settings.desktop_image_url ? (
            <div className="relative group">
              <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={settings.desktop_image_url}
                  alt="Desktop banner preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => removeImage('desktop')}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={uploadingDesktop}
              onClick={() => desktopInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingDesktop ? 'Uploading...' : 'Upload Desktop Banner'}
            </Button>
          )}
        </div>

        {/* Mobile Banner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Banner Image
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Recommended size: 1080x500px (2.16:1 aspect ratio)
          </p>
          <input
            ref={mobileInputRef}
            type="file"
            accept="image/*"
            onChange={handleMobileUpload}
            disabled={uploadingMobile}
            className="hidden"
          />
          {settings.mobile_image_url ? (
            <div className="relative group">
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={settings.mobile_image_url}
                  alt="Mobile banner preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => removeImage('mobile')}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={uploadingMobile}
              onClick={() => mobileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingMobile ? 'Uploading...' : 'Upload Mobile Banner'}
            </Button>
          )}
        </div>
      </div>

      {/* Link URL */}
      <div>
        <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-2">
          Link URL (Optional)
        </label>
        <input
          id="link_url"
          type="text"
          value={settings.link_url || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, link_url: e.target.value }))}
          placeholder="/products or https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Alt Text */}
      <div>
        <label htmlFor="alt_text" className="block text-sm font-medium text-gray-700 mb-2">
          Alt Text
        </label>
        <input
          id="alt_text"
          type="text"
          value={settings.alt_text || ''}
          onChange={(e) => setSettings((prev) => ({ ...prev, alt_text: e.target.value }))}
          placeholder="Upcoming Event"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}

