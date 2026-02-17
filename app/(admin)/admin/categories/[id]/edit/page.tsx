'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').eq('id', id).single()

      if (!data) {
        router.replace('/admin/categories')
        return
      }

      setCategory(data)
      setLoading(false)
    }
    fetchCategory()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  )
}
