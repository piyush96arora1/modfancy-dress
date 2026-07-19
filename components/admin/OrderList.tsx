'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ViewOrderButton } from './ViewOrderButton'
import { ProductThumb } from './ProductThumb'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { whatsappChatUrl } from '@/lib/constants/contact'
import { primaryImageUrl } from '@/lib/imageUrl'

interface OrderListProps {
  orders: any[]
}

/** Row of product thumbnails for an order, capped with a +N overflow badge. */
function OrderThumbnails({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null
  const shown = items.slice(0, 4)
  const extra = items.length - shown.length
  return (
    <div className="flex items-center gap-1">
      {shown.map((item: any) => (
        <ProductThumb
          key={item.id}
          src={primaryImageUrl(item.product?.images)}
          alt={item.product_name}
          className="h-8 w-8"
          sizes="32px"
        />
      ))}
      {extra > 0 && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-xs font-medium text-gray-500">
          +{extra}
        </span>
      )}
    </div>
  )
}

/** Green WhatsApp link showing the customer's number. */
function CustomerWhatsApp({ phone }: { phone?: string }) {
  if (!phone) return null
  return (
    <a
      href={whatsappChatUrl(phone)}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
      aria-label="Chat with customer on WhatsApp"
      className="mt-1 inline-flex items-center gap-1 text-sm text-[#25D366] hover:text-[#1da851] transition-colors"
    >
      <WhatsAppIcon className="w-4 h-4" />
      {phone}
    </a>
  )
}

export function OrderList({ orders }: OrderListProps) {
  const router = useRouter()
  const [localOrders, setLocalOrders] = useState(orders)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending'
      ? 'confirmed'
      : currentStatus === 'confirmed'
        ? 'shipped'
        : 'pending'

    setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setUpdating(orderId)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      alert(`Failed to update order status: ${error.message}`)
      setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: currentStatus } : o))
    }
    setUpdating(null)
    router.refresh()
  }

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}?`)) return

    setLocalOrders(prev => prev.filter(o => o.id !== orderId))
    setDeleting(orderId)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      alert(`Failed to delete order: ${error.message}`)
      router.refresh()
    } else {
      router.refresh()
    }
    setDeleting(null)
  }

  if (localOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No orders found.</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {localOrders.map((order) => {
              const itemCount = order.items?.reduce(
                (sum: number, item: any) => sum + item.quantity, 0
              ) || 0

              return (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                      <CustomerWhatsApp phone={order.customer_phone} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    <div className="space-y-1.5">
                      <OrderThumbnails items={order.items} />
                      <div>{itemCount} item(s)</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">₹{order.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800'
                        : order.status === 'shipped' ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <ViewOrderButton orderId={order.id} />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updating === order.id}
                        onClick={() => handleStatusUpdate(order.id, order.status)}
                      >
                        {updating === order.id ? '...' : (
                          order.status === 'pending' ? 'Confirm'
                            : order.status === 'confirmed' ? 'Ship'
                              : 'Reset'
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleting === order.id}
                        onClick={() => handleDelete(order.id, order.order_number)}
                      >
                        {deleting === order.id ? '...' : 'Delete'}
                      </Button>
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
        {localOrders.map((order) => {
          const itemCount = order.items?.reduce(
            (sum: number, item: any) => sum + item.quantity, 0
          ) || 0

          return (
            <div key={order.id} className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg text-gray-900">{order.order_number}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded whitespace-nowrap ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                  : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800'
                    : order.status === 'shipped' ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-600">Customer:</span>
                  <div className="font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-gray-500 text-xs">{order.customer_email}</div>
                  <CustomerWhatsApp phone={order.customer_phone} />
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium text-gray-900">{itemCount} item(s)</span>
                  </div>
                  <div className="mt-2">
                    <OrderThumbnails items={order.items} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg text-gray-900">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <div className="flex-1">
                  <ViewOrderButton orderId={order.id} className="w-full" />
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={updating === order.id}
                    onClick={() => handleStatusUpdate(order.id, order.status)}
                  >
                    {updating === order.id ? '...' : (
                      order.status === 'pending' ? 'Confirm'
                        : order.status === 'confirmed' ? 'Ship'
                          : 'Reset'
                    )}
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={deleting === order.id}
                    onClick={() => handleDelete(order.id, order.order_number)}
                  >
                    {deleting === order.id ? '...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
