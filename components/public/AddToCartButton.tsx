'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { ProductWithDetails, ProductVariant } from '@/types/database'

interface AddToCartButtonProps {
  product: ProductWithDetails
  sizes: string[]
  colors: string[]
  variants: ProductVariant[]
}

export function AddToCartButton({ product, sizes, colors, variants }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const { addItem } = useCart()

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]

  // Calculate current price based on selected size/color
  const getCurrentPrice = () => {
    if (selectedSize || selectedColor) {
      const variant = variants.find(
        (v) =>
          (!selectedSize || v.size === selectedSize) &&
          (!selectedColor || v.color === selectedColor)
      )
      if (variant?.price_override !== undefined && variant.price_override !== null) {
        return variant.price_override
      }
    }
    return product.price || 0
  }

  const currentPrice = getCurrentPrice()

  const handleAddToCart = async () => {
    setAdding(true)
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      // Find matching variant if size/color selected
      let variant: ProductVariant | undefined
      if (selectedSize || selectedColor) {
        variant = variants.find(
          (v) =>
            (!selectedSize || v.size === selectedSize) &&
            (!selectedColor || v.color === selectedColor)
        )
      }

      const price = variant?.price_override || product.price || 0

      addItem({
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        image: primaryImage?.image_url || '',
        price,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      })

      // Reset form
      setSelectedSize('')
      setSelectedColor('')
      setQuantity(1)
      
      // Show success feedback
      alert('Added to cart!')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Display Price */}
      <div>
        <p className="text-3xl font-bold text-gray-900">₹{currentPrice.toFixed(2)}</p>
        {selectedSize && (
          <p className="text-sm text-gray-600 mt-1">Price for size: {selectedSize}</p>
        )}
      </div>

      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Size</label>
          <Select
            value={selectedSize}
            onChange={(e) => {
              setSelectedSize(e.target.value)
              // Price will update automatically via getCurrentPrice()
            }}
            className="text-gray-900"
          >
            <option value="">Select Size</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Color</label>
          <Select
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value)
              // Price will update automatically via getCurrentPrice()
            }}
            className="text-gray-900"
          >
            <option value="">Select Color</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Quantity</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-24"
        />
      </div>

      <Button onClick={handleAddToCart} size="lg" className="w-full" loading={adding} disabled={adding}>
        {adding ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  )
}






