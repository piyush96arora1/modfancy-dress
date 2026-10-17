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

type PaymentFields = { status?: string; payment_status?: string | null; payment_method?: string | null }

/** Online payment state, so the owner can tell "paid — ship it" from "confirm on WhatsApp". */
function PaymentBadge({ order }: { order: PaymentFields }) {
  const map: Record<string, [string, string]> = {
    paid: ['Paid online', 'bg-emerald-100 text-emerald-800'],
    awaiting_payment: ['Awaiting payment', 'bg-amber-100 text-amber-800'],
    failed: ['Payment failed', 'bg-red-100 text-red-800'],
    refunded: ['Refunded', 'bg-gray-100 text-gray-700'],
    partially_refunded: ['Part refunded', 'bg-gray-100 text-gray-700'],
  }
  const [label, cls] = map[order.payment_status ?? ''] ?? ['Pay later', 'bg-sky-100 text-sky-800']
  return <span className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${cls}`}>{label}</span>
}

function DeliveryBadge({ method }: { method?: string | null }) {
  if (!method) return null
  const label = method === 'porter' ? 'Porter — send fare' : method === 'pickup' ? 'Shop pickup' : 'Courier'
  return <span className="px-2 py-0.5 text-xs rounded whitespace-nowrap bg-gray-100 text-gray-700">{label}</span>
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

/** Total with its split: what the products cost vs what delivery added, and what was paid. */
function OrderAmount({ order, large }: { order: { total_amount: number; items_subtotal?: number | null; delivery_fee?: number | null; delivery_method?: string | null; payment_status?: string | null; paid_amount?: number | null }; large?: boolean }) {
  const fee = Number(order.delivery_fee ?? 0)
  const products = order.items_subtotal != null ? Number(order.items_subtotal) : Number(order.total_amount) - fee
  const deliveryText = fee > 0 ? inr(fee) : order.delivery_method === 'porter' ? 'rider fare (paid to rider)' : order.delivery_method === 'pickup' ? 'pickup, free' : null
  return (
    <div className={large ? 'text-right' : ''}>
      <div className={`font-bold text-gray-900 ${large ? 'text-lg' : ''}`}>{inr(Number(order.total_amount))}</div>
      <div className="text-xs text-gray-500 whitespace-nowrap">Products {inr(products)}</div>
      {deliveryText && <div className="text-xs text-gray-500 whitespace-nowrap">Delivery {deliveryText}</div>}
      {order.payment_status === 'paid' && (
        <div className="text-xs font-medium text-emerald-700 whitespace-nowrap">Paid {inr(Number(order.paid_amount ?? order.total_amount))}</div>
      )}
    </div>
  )
}

const NEXT_STATUS: Record<string, string> = { pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered', delivered: 'pending', cancelled: 'pending' }
const NEXT_LABEL: Record<string, string> = { pending: 'Confirm', confirmed: 'Ship', shipped: 'Delivered', delivered: 'Reset', cancelled: 'Reopen' }

type Filter = 'all' | 'to_ship' | 'to_confirm' | 'awaiting'
const FILTERS: [Filter, string][] = [['all', 'All'], ['to_ship', 'Paid – to ship'], ['to_confirm', 'Pay later – to confirm'], ['awaiting', 'Awaiting payment']]

function matches(order: PaymentFields, f: Filter): boolean {
  const open = order.status === 'pending' || order.status === 'confirmed'
  if (f === 'to_ship') return order.payment_status === 'paid' && open
  if (f === 'to_confirm') return (order.payment_method ?? 'pay_later') === 'pay_later' && order.status === 'pending'
  if (f === 'awaiting') return order.payment_status === 'awaiting_payment' || order.payment_status === 'failed'
  return true
}

export function OrderList({ orders }: OrderListProps) {
  const router = useRouter()
  const [localOrders, setLocalOrders] = useState(orders)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
    const newStatus = NEXT_STATUS[currentStatus] ?? 'pending'

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

  const visible = localOrders.filter((o) => matches(o, filter))

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(([key, label]) => {
          const count = localOrders.filter((o) => matches(o, key)).length
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm border ${filter === key ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

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
            {visible.map((order) => {
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
                  <td className="px-6 py-4"><OrderAmount order={order} /></td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800'
                        : order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status}
                    </span>
                    <div className="mt-1.5 flex flex-col items-start gap-1">
                      <PaymentBadge order={order} />
                      <DeliveryBadge method={order.delivery_method} />
                    </div>
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
                        {updating === order.id ? '...' : (NEXT_LABEL[order.status] ?? 'Reset')}
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
        {visible.map((order) => {
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
                    : order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <PaymentBadge order={order} />
                <DeliveryBadge method={order.delivery_method} />
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
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Total:</span>
                  <OrderAmount order={order} large />
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
                    {updating === order.id ? '...' : (NEXT_LABEL[order.status] ?? 'Reset')}
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
