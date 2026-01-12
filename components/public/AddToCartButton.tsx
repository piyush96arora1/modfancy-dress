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
  const { addItem } = useCart()

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]

  const handleAddToCart = () => {
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
    alert('Added to cart!')
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <Select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
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
          <label className="block text-sm font-medium mb-2">Color</label>
          <Select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
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

      <Button onClick={handleAddToCart} size="lg" className="w-full">
        Add to Cart
      </Button>
    </div>
  )
}






