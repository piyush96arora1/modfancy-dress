import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CategoryListProps {
  categories: any[]
}

async function deleteCategory(formData: FormData) {
  'use server'
  const categoryId = formData.get('categoryId') as string
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
  
  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`)
  }
  
  revalidatePath('/admin/categories')
}

export async function CategoryList({ categories }: CategoryListProps) {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-gray-600">{category.slug}</td>
                <td className="px-6 py-4 text-gray-600">
                  {category.description || '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <form action={deleteCategory}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <Button variant="destructive" size="sm" type="submit">
                        Delete
                      </Button>
                    </form>
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
            <div>
              <div className="font-semibold text-lg mb-1 text-gray-900">{category.name}</div>
              <div className="text-sm text-gray-500 mb-2">/{category.slug}</div>
              {category.description && (
                <div className="text-sm text-gray-600">{category.description}</div>
              )}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Edit
                </Button>
              </Link>
              <form action={deleteCategory} className="flex-1">
                <input type="hidden" name="categoryId" value={category.id} />
                <Button variant="destructive" size="sm" type="submit" className="w-full">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}






