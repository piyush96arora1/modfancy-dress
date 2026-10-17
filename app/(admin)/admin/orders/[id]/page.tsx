'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { ProductThumb } from '@/components/admin/ProductThumb'
import { whatsappChatUrl } from '@/lib/constants/contact'
import { primaryImageUrl } from '@/lib/imageUrl'

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
        .select(`*, items:order_items(*, product:products(images:product_images(image_url, is_primary)))`)
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
              <span className="text-gray-600">Products:</span>
              <span className="ml-2">
                ₹{Number(order.items_subtotal ?? Number(order.total_amount) - Number(order.delivery_fee ?? 0)).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Delivery charge:</span>
              <span className="ml-2">
                {Number(order.delivery_fee ?? 0) > 0
                  ? `₹${Number(order.delivery_fee).toFixed(2)}`
                  : order.delivery_method === 'porter'
                    ? '₹0 online (customer pays the rider)'
                    : order.delivery_method === 'pickup'
                      ? '₹0 (shop pickup)'
                      : '—'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-bold">₹{order.total_amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Amount received online:</span>
              <span className="ml-2 font-bold">
                {order.payment_status === 'paid' ? `₹${Number(order.paid_amount ?? order.total_amount).toFixed(2)}` : '₹0 (not paid online)'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Payment &amp; Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Payment:</span>
              <span className="ml-2 font-medium">
                {order.payment_status === 'paid'
                  ? `Paid online ₹${Number(order.paid_amount ?? order.total_amount).toFixed(0)}${order.payment_group ? ` (${order.payment_group})` : ''}`
                  : order.payment_status === 'awaiting_payment'
                    ? 'Awaiting online payment'
                    : order.payment_status === 'failed'
                      ? 'Online payment failed'
                      : order.payment_status === 'refunded'
                        ? 'Refunded'
                        : 'Pay later — confirm on WhatsApp'}
              </span>
            </div>
            {order.paid_at && (
              <div>
                <span className="text-gray-600">Paid at:</span>
                <span className="ml-2">{new Date(order.paid_at).toLocaleString('en-IN')}</span>
              </div>
            )}
            {order.cf_payment_id && (
              <div>
                <span className="text-gray-600">Cashfree payment ID:</span>
                <span className="ml-2 font-mono text-xs">{order.cf_payment_id}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Delivery:</span>
              <span className="ml-2 font-medium">
                {order.delivery_method === 'porter'
                  ? 'Same-day Porter — customer pays the rider'
                  : order.delivery_method === 'pickup'
                    ? 'Pickup from shop'
                    : order.delivery_method === 'courier'
                      ? `Courier (₹${Number(order.delivery_fee ?? 0).toFixed(0)} charged)`
                      : '—'}
              </span>
            </div>
          </div>
          {order.customer_phone && (
            <div className="mt-3 flex flex-wrap gap-2">
              {order.delivery_method === 'porter' && (
                <a
                  href={whatsappChatUrl(order.customer_phone, `Hi ${order.customer_name}, your Mod Fancy Dress order ${order.order_number} is packed. The Porter fare is ₹___ — please pay the rider on delivery. Thank you!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-[#1B2A4A] text-sm font-medium"
                >
                  <WhatsAppIcon className="w-4 h-4" /> Send Porter fare
                </a>
              )}
              {order.delivery_method === 'pickup' && (
                <a
                  href={whatsappChatUrl(order.customer_phone, `Hi ${order.customer_name}, your Mod Fancy Dress order ${order.order_number} is ready to pick up at our Krishna Nagar shop (S64, South Anarkali, Som Bazar). See you soon!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-[#1B2A4A] text-sm font-medium"
                >
                  <WhatsAppIcon className="w-4 h-4" /> Ready for pickup
                </a>
              )}
              {order.delivery_method === 'courier' && (
                <a
                  href={whatsappChatUrl(order.customer_phone, `Hi ${order.customer_name}, your Mod Fancy Dress order ${order.order_number} has shipped. Tracking: ___`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-[#1B2A4A] text-sm font-medium"
                >
                  <WhatsAppIcon className="w-4 h-4" /> Shipped message
                </a>
              )}
              {order.payment_method === 'pay_later' && order.payment_status !== 'paid' && (
                <a
                  href={whatsappChatUrl(order.customer_phone, `Hi ${order.customer_name}, thank you for your order ${order.order_number} (₹${Number(order.total_amount).toFixed(0)}). It's available — `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#25D366] text-[#1B2A4A] text-sm font-medium"
                >
                  <WhatsAppIcon className="w-4 h-4" /> Confirm order
                </a>
              )}
            </div>
          )}
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
            <div className="flex items-center">
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2">{order.customer_phone}</span>
              {order.customer_phone && (
                <a
                  href={whatsappChatUrl(order.customer_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  aria-label="Chat with customer on WhatsApp"
                  className="ml-2 inline-flex items-center text-[#25D366] hover:text-[#1da851] transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <div className="text-sm">
            {typeof order.shipping_address === 'object' && (
              <div className="text-[#6B6B6B] mt-2 text-sm leading-relaxed">
                <div>{(order.shipping_address as any).address || (order.shipping_address as any).street}</div>
                <div>
                  {order.shipping_address.city}
                  {(order.shipping_address as any).state ? `, ${(order.shipping_address as any).state}` : ''}
                  {' - '}
                  {(order.shipping_address as any).pincode || (order.shipping_address as any).zip}
                </div>
                {(order.shipping_address as any).country && (
                  <div>{(order.shipping_address as any).country}</div>
                )}
                {order.shipping_address.event_date && (
                  <div className="mt-2 text-[#1B2A4A]">
                    <strong>Event date:</strong>{' '}
                    {new Date(`${order.shipping_address.event_date}T00:00:00`).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                )}
                {order.shipping_address.delivery_estimate && (
                  <div className="text-[#1B2A4A]">
                    <strong>Delivery promised:</strong> {order.shipping_address.delivery_estimate}
                  </div>
                )}
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
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <ProductThumb
                          src={primaryImageUrl(item.product?.images)}
                          alt={item.product_name}
                        />
                        <span>{item.product_name}</span>
                      </div>
                    </td>
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
                <div className="flex items-center gap-3">
                  <ProductThumb
                    src={primaryImageUrl(item.product?.images)}
                    alt={item.product_name}
                  />
                  <div className="font-semibold">{item.product_name}</div>
                </div>
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
