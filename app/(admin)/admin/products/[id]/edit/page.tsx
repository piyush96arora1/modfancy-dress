'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductForm } from '@/components/admin/ProductForm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const [productRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            images:product_images(*),
            variants:product_variants(*),
            product_categories:product_categories(category_id)
          `)
          .eq('id', id)
          .single(),
        supabase.from('categories').select('*').order('name'),
      ])

      if (!productRes.data) {
        router.replace('/admin/products')
        return
      }

      const productCategoryIds = productRes.data.product_categories?.map((pc: any) => pc.category_id) || []
      setProduct({
        ...productRes.data,
        category_ids: productCategoryIds,
        category_id: productCategoryIds.length > 0 ? productCategoryIds[0] : productRes.data.category_id,
      })
      setCategories(categoriesRes.data || [])
      setLoading(false)
    }
    fetchData()
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
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  )
}
