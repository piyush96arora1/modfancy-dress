'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUpload } from './ImageUpload'
import { getImageUrl } from '@/lib/imageUrl'
import { X } from 'lucide-react'
import Image from 'next/image'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image_url: z.string().optional().nullable(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
  }
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(category?.image_url || null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      image_url: category.image_url || null,
    } : {
      name: '',
      slug: '',
      description: undefined,
      image_url: null,
    },
  })

  const name = watch('name')

  // Auto-generate slug from name
  useEffect(() => {
    if (!category && name) {
      setValue('slug', slugify(name))
    }
  }, [name, category, setValue])

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        image_url: imageUrl
      }

      if (category) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', category.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(payload)

        if (error) throw error
      }

      router.push('/admin/categories')
      router.refresh()
    } catch (error: any) {
      alert('Error saving category: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setImageUrl(url)
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Category Name"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="md:col-span-1">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="category-slug"
          />
          {errors.slug && (
            <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Category description (optional)"
          rows={3}
        />
      </div>

      <div>
        <Label className="mb-2 block">Category Image</Label>
        {imageUrl ? (
          <div className="relative w-40 h-40 group">
            <div className="relative w-full h-full rounded-lg overflow-hidden border">
              <Image
                src={getImageUrl(imageUrl)}
                alt="Category preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-sm hover:bg-red-200 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-50 border flex items-center justify-center text-2xl" role="img" aria-label="Fallback">
              📸
            </div>
            <ImageUpload
              onUpload={handleImageUpload}
              pathPrefix="categories-webp/"
              label="Select Image"
            />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Choose a representative image for this category. Recommended size: 200x200 or larger (square).
        </p>
      </div>

      <div className="flex gap-4 pt-2">
        <Button type="submit" loading={loading} disabled={loading}>
          {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}






