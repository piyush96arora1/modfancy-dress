'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CategoryList } from '@/components/admin/CategoryList'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('name')
      setCategories(data || [])
      setLoading(false)
    }
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Link href="/admin/categories/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Add New Category</Button>
        </Link>
      </div>
      <CategoryList categories={categories} />
    </div>
  )
}
