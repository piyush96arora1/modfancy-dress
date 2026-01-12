'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Calculate total
      const totalAmount = getTotal()

      // Generate order number
      const orderNumber = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          shipping_address: {
            street: formData.shippingStreet,
            city: formData.shippingCity,
            state: formData.shippingState,
            zip: formData.shippingZip,
            country: formData.shippingCountry,
          },
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order creation error:', orderError)
        console.error('Error details:', {
          message: orderError.message,
          code: orderError.code,
          details: orderError.details,
          hint: orderError.hint
        })
        throw orderError
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
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

      // Clear cart and redirect
      clearCart()
      alert('Order placed successfully! Order number: ' + order.order_number)
      router.push('/')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <Button onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Shopping Cart</h1>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 96px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-2 text-gray-900">{item.name}</h3>
                  {item.size && <p className="text-sm text-gray-600 mb-1">Size: {item.size}</p>}
                  {item.color && <p className="text-sm text-gray-600 mb-2">Color: {item.color}</p>}
                  <p className="font-bold text-lg mb-3 text-gray-900">₹{item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, item.variantId, parseInt(e.target.value) || 1)
                      }
                      className="w-20"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 md:p-6 lg:sticky lg:top-24 bg-white">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-2 text-gray-900">
              <span>Subtotal:</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
              <span>Total:</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Name *</Label>
              <Input
                id="customerName"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone *</Label>
              <Input
                id="customerPhone"
                type="tel"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="shippingStreet">Street Address *</Label>
              <Input
                id="shippingStreet"
                required
                value={formData.shippingStreet}
                onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="shippingCity">City *</Label>
                <Input
                  id="shippingCity"
                  required
                  value={formData.shippingCity}
                  onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingState">State *</Label>
                <Input
                  id="shippingState"
                  required
                  value={formData.shippingState}
                  onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="shippingZip">ZIP Code *</Label>
                <Input
                  id="shippingZip"
                  required
                  value={formData.shippingZip}
                  onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingCountry">Country *</Label>
                <Input
                  id="shippingCountry"
                  required
                  value={formData.shippingCountry}
                  onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}

