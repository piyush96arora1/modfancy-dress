'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductForm } from '@/components/admin/ProductForm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function NewProductPage() {
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
    <div className="px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
