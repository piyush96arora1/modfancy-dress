'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { EditProductButton } from './EditProductButton'

interface ProductListProps {
  products: any[]
  showDeleted?: boolean
}

export function ProductList({ products, showDeleted = false }: ProductListProps) {
  const router = useRouter()
  const [acting, setActing] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    setActing(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) alert(`Failed to delete product: ${error.message}`)
    setActing(null)
    router.refresh()
  }

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Restore "${name}"?`)) return
    setActing(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: null })
      .eq('id', id)
    if (error) alert(`Failed to restore product: ${error.message}`)
    setActing(null)
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No products found.</p>
        <Link href="/admin/products/new">
          <Button>Add Your First Product</Button>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    {primaryImage ? (
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        <Image src={primaryImage.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.categories && product.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((pc: any, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                            {pc.category?.name || '—'}
                          </span>
                        ))}
                      </div>
                    ) : product.category?.name ? (
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">{product.category.name}</span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {product.price ? `₹${product.price.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {showDeleted ? (
                      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Deleted</span>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {showDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={acting === product.id}
                          onClick={() => handleRestore(product.id, product.name)}
                        >
                          {acting === product.id ? '...' : 'Restore'}
                        </Button>
                      ) : (
                        <>
                          <EditProductButton productId={product.id} />
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={acting === product.id}
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            {acting === product.id ? '...' : 'Delete'}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.map((product) => {
          const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
          return (
            <div key={product.id} className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex gap-4">
                {primaryImage ? (
                  <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <Image src={primaryImage.image_url} alt={product.name} fill className="object-cover" sizes="80px" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0">No Image</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg mb-1 text-gray-900">{product.name}</div>
                  <div className="text-sm mb-2">
                    {product.categories && product.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((pc: any, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                            {pc.category?.name || '—'}
                          </span>
                        ))}
                      </div>
                    ) : product.category?.name ? (
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">{product.category.name}</span>
                    ) : (
                      <span className="text-gray-500">No category</span>
                    )}
                  </div>
                  {product.price && (
                    <div className="font-bold text-lg text-gray-900">₹{product.price.toFixed(2)}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                {showDeleted ? (
                  <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Deleted</span>
                ) : (
                  <span className={`px-2 py-1 text-xs rounded ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                )}

                <div className="flex gap-2">
                  {showDeleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={acting === product.id}
                      onClick={() => handleRestore(product.id, product.name)}
                    >
                      {acting === product.id ? '...' : 'Restore'}
                    </Button>
                  ) : (
                    <>
                      <EditProductButton productId={product.id} />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={acting === product.id}
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        {acting === product.id ? '...' : 'Delete'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
