'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HomepageSectionsManagement } from '@/components/admin/HomepageSectionsManagement'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { HomepageSection } from '@/types/database'

type CategoryOption = { id: string; name: string; slug: string }

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [{ data: sectionsData }, { data: categoriesData }] = await Promise.all([
        supabase.from('homepage_sections').select('*').order('sort_order', { ascending: true }),
        supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
      ])
      setSections((sectionsData as HomepageSection[]) || [])
      setCategories((categoriesData as CategoryOption[]) || [])
      setLoading(false)
    }
    fetchData()
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure the product rows shown on the homepage. Enable more than one section to
          feature overlapping occasions (e.g. Independence Day + Janmashtami). Changes go live
          within a few seconds of saving.
        </p>
      </div>
      <HomepageSectionsManagement initialSections={sections} categories={categories} />
    </div>
  )
}
