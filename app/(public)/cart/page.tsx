'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/imageUrl'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingBag, ChevronRight, Check } from 'lucide-react'

/**
 * Generate a client-side UUID for the order so we don't need to read the row
 * back after insert. This keeps checkout working once RLS is enabled on
 * `orders` (anon can INSERT but not SELECT — keeps customer PII private).
 */
function generateOrderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0'))
  return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({})
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPincode: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const totalAmount = getTotal()
      const orderNumber = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      const orderId = generateOrderId()

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          shipping_address: {
            address: formData.shippingAddress,
            city: formData.shippingCity,
            pincode: formData.shippingPincode,
          },
          total_amount: totalAmount,
          status: 'pending',
        })
      // No .select(): once RLS is enabled, anon can INSERT an order but cannot
      // read it back (customer PII stays private). We use the client orderId below.

      if (orderError) {
        console.error('Order creation error:', orderError)
        throw orderError
      }

      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        variant_id: item.variantId || null,
        product_name: item.name,
        size: item.size || null,
        color: item.color || null,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      clearCart()
      setOrderSuccess(orderNumber)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Order success state
  if (orderSuccess) {
    return (
      <div className="text-center py-16 max-w-md mx-auto fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">Order Placed!</h1>
        <p className="text-[#6B6B6B] text-sm mb-1">Your order number is:</p>
        <p className="text-lg font-bold text-[#C8956C] mb-6 font-[family-name:var(--font-outfit)]">{orderSuccess}</p>
        <Button onClick={() => router.push('/')}>Continue Shopping</Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 fade-in">
        <div className="w-16 h-16 rounded-full bg-[#F5F3F0] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7 text-[#9A9A9A]" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Your Cart is Empty</h1>
        <p className="text-[#6B6B6B] text-sm mb-6">Add some products to get started!</p>
        <Button onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6">
        <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2D2D2D]">Shopping Cart</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-xl md:text-2xl font-bold mb-5 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Shopping Cart ({items.length})</h1>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="bg-white border border-[#E8E5E0] rounded-xl p-4 flex flex-col sm:flex-row gap-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className="relative w-full sm:w-24 h-32 sm:h-24 bg-[#F5F3F0] rounded-lg overflow-hidden flex-shrink-0">
                  {item.image && (
                    <Image
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 96px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 text-[#2D2D2D] font-[family-name:var(--font-outfit)]">{item.name}</h3>
                  {item.size && <p className="text-xs text-[#9A9A9A] mb-0.5">Size: {item.size}</p>}
                  {item.color && <p className="text-xs text-[#9A9A9A] mb-1">Color: {item.color}</p>}
                  <p className="font-bold text-base text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">₹{item.price.toFixed(0)}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={async (e) => {
                        const itemKey = `${item.productId}-${item.variantId || 'none'}`
                        setUpdatingItems(prev => ({ ...prev, [itemKey]: true }))
                        await new Promise(resolve => setTimeout(resolve, 200))
                        updateQuantity(item.productId, item.variantId, parseInt(e.target.value) || 1)
                        setUpdatingItems(prev => ({ ...prev, [itemKey]: false }))
                      }}
                      disabled={updatingItems[`${item.productId}-${item.variantId || 'none'}`]}
                      className="w-16 h-8 text-sm text-center"
                    />
                    <button
                      onClick={async () => {
                        const itemKey = `${item.productId}-${item.variantId || 'none'}`
                        setRemovingItems(prev => ({ ...prev, [itemKey]: true }))
                        await new Promise(resolve => setTimeout(resolve, 300))
                        removeItem(item.productId, item.variantId)
                        setRemovingItems(prev => ({ ...prev, [itemKey]: false }))
                      }}
                      disabled={removingItems[`${item.productId}-${item.variantId || 'none'}`]}
                      className="p-1.5 text-[#9A9A9A] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E8E5E0] rounded-xl p-5 md:p-6 lg:sticky lg:top-20" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-lg font-bold mb-4 text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Order Summary</h2>
            <div className="mb-5">
              <div className="flex justify-between mb-2 text-sm text-[#6B6B6B]">
                <span>Subtotal</span>
                <span className="text-[#2D2D2D] font-medium">₹{getTotal().toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[#E8E5E0] text-[#1B2A4A]">
                <span>Total</span>
                <span>₹{getTotal().toFixed(0)}</span>
              </div>
              <p className="text-[10px] text-[#9A9A9A] mt-1 text-right italic">
                * Shipping charges are extra according to location.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="customerName" className="text-xs">Name *</Label>
                <Input
                  id="customerName"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail" className="text-xs">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone" className="text-xs">Phone *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="shippingAddress" className="text-xs">Address *</Label>
                <Input
                  id="shippingAddress"
                  required
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="shippingCity" className="text-xs">City *</Label>
                  <Input
                    id="shippingCity"
                    required
                    value={formData.shippingCity}
                    onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="shippingPincode" className="text-xs">Pincode *</Label>
                  <Input
                    id="shippingPincode"
                    required
                    value={formData.shippingPincode}
                    onChange={(e) => setFormData({ ...formData, shippingPincode: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full mt-2" loading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
