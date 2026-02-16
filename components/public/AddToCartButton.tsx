'use client'

import { useState } from 'react'
import { useCart } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'
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
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]

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

    await new Promise(resolve => setTimeout(resolve, 300))

    try {
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

      setSelectedSize('')
      setSelectedColor('')
      setQuantity(1)

      // Show inline success instead of alert
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2500)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Price */}
      <div>
        <p className="text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">₹{currentPrice.toFixed(0)}</p>
        {selectedSize && (
          <p className="text-xs text-[#9A9A9A] mt-1">Price for size: {selectedSize}</p>
        )}
      </div>

      {/* Size Pills */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-[#2D2D2D]">Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 font-medium ${selectedSize === size
                    ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                    : 'bg-white text-[#2D2D2D] border-[#E8E5E0] hover:border-[#1B2A4A]'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Pills */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2 text-[#2D2D2D]">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 font-medium ${selectedColor === color
                    ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                    : 'bg-white text-[#2D2D2D] border-[#E8E5E0] hover:border-[#1B2A4A]'
                  }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium mb-2 text-[#2D2D2D]">Quantity</label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg border border-[#E8E5E0] flex items-center justify-center text-[#2D2D2D] hover:border-[#1B2A4A] transition-colors text-lg font-medium"
          >
            −
          </button>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-16 text-center h-10 rounded-lg"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-lg border border-[#E8E5E0] flex items-center justify-center text-[#2D2D2D] hover:border-[#1B2A4A] transition-colors text-lg font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        size="lg"
        className={`w-full text-base font-semibold transition-all duration-300 ${justAdded ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
        loading={adding}
        disabled={adding}
      >
        {justAdded ? (
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            Added to Cart!
          </span>
        ) : adding ? (
          'Adding...'
        ) : (
          'Add to Cart'
        )}
      </Button>
    </div>
  )
}
