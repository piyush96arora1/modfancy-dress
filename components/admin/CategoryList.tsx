'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { EditCategoryButton } from './EditCategoryButton'
import Image from 'next/image'
import { Image as ImageIcon } from 'lucide-react'

interface CategoryListProps {
  categories: any[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter()
  const [toggling, setToggling] = useState<string | null>(null)

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    setToggling(categoryId)
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', categoryId)

    if (error) {
      alert(`Failed to update category status: ${error.message}`)
    }
    setToggling(null)
    router.refresh()
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No categories found.</p>
        <Link href="/admin/categories/new">
          <Button>Add Your First Category</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4">
                  <div className="w-10 h-10 rounded bg-gray-50 border overflow-hidden flex items-center justify-center flex-shrink-0">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-gray-600">{category.slug}</td>
                <td className="px-6 py-4 text-gray-600">{category.description || '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.is_active !== false} // Default to true if null
                      onCheckedChange={() => handleToggleActive(category.id, category.is_active !== false)}
                      disabled={toggling === category.id}
                    />
                    <span className="text-sm text-gray-600">
                      {category.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <EditCategoryButton categoryId={category.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded bg-gray-50 border overflow-hidden flex items-center justify-center flex-shrink-0">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg mb-0.5 text-gray-900 truncate">{category.name}</div>
                <div className="text-sm text-gray-500 mb-2">/{category.slug}</div>

                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-md w-fit">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.is_active !== false}
                      onCheckedChange={() => handleToggleActive(category.id, category.is_active !== false)}
                      disabled={toggling === category.id}
                      className="scale-75 origin-left"
                    />
                    <span className={`text-xs font-medium ${category.is_active !== false ? 'text-green-600' : 'text-gray-500'}`}>
                      {category.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {category.description && (
              <div className="text-sm text-gray-600 border-t pt-2">{category.description}</div>
            )}
            <div className="flex gap-2 pt-2 border-t">
              <div className="flex-1">
                <EditCategoryButton categoryId={category.id} className="w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
