'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select(`*, items:order_items(*)`)
        .eq('id', id)
        .single()

      if (error || !data) {
        router.replace('/admin/orders')
        return
      }

      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [id, router])

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl px-4 md:px-0">
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Link>
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      <div className="bg-white rounded-lg border p-4 md:p-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-2">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Order Number:</span>
              <span className="ml-2 font-medium">{order.order_number}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium">{order.status}</span>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-bold">₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Customer Information</h2>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2">{order.customer_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2">{order.customer_email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2">{order.customer_phone}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <div className="text-sm">
            {typeof order.shipping_address === 'object' && (
              <div>
                <div>{order.shipping_address.street}</div>
                <div>
                  {order.shipping_address.city}, {order.shipping_address.state}{' '}
                  {order.shipping_address.zip}
                </div>
                <div>{order.shipping_address.country}</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Order Items</h2>

          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Size</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Color</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.product_name}</td>
                    <td className="px-4 py-2 text-gray-600">{item.size || '—'}</td>
                    <td className="px-4 py-2 text-gray-600">{item.color || '—'}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-2 font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-2">
                <div className="font-semibold">{item.product_name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.size && (
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-1">{item.size}</span>
                    </div>
                  )}
                  {item.color && (
                    <div>
                      <span className="text-gray-600">Color:</span>
                      <span className="ml-1">{item.color}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <span className="ml-1 font-medium">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-1">₹{item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold text-lg">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
