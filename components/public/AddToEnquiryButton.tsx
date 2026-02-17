'use client'

import { useState } from 'react'
import { useEnquiryBasket, type EnquiryItem } from '@/lib/context/EnquiryBasketContext'
import { getProductPrice, formatPrice } from '@/lib/utils/pricing'
import { Check, Plus, Package } from 'lucide-react'
import type { ProductWithDetails } from '@/types/database'

interface AddToEnquiryButtonProps {
    product: ProductWithDetails
    sizes: string[]
    wholesaleDiscountPct?: number
}

export function AddToEnquiryButton({ product, sizes, wholesaleDiscountPct = 30 }: AddToEnquiryButtonProps) {
    const { addItem, removeItem, isInBasket } = useEnquiryBasket()
    const [quantity, setQuantity] = useState(10)
    const [selectedSize, setSelectedSize] = useState('')
    const [justAdded, setJustAdded] = useState(false)

    const inBasket = isInBasket(product.id)
    const wholesalePrice = getProductPrice(product, 'wholesale', wholesaleDiscountPct)
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]

    const handleAdd = () => {
        const item: EnquiryItem = {
            product_id: product.id,
            product_name: product.name,
            slug: product.slug,
            image_url: primaryImage?.image_url || null,
            quantity,
            size: selectedSize || null,
            wholesale_price: wholesalePrice,
        }
        addItem(item)
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000)
    }

    const handleRemove = () => {
        removeItem(product.id)
        setJustAdded(false)
    }

    return (
        <div className="space-y-4">
            {/* Price Display */}
            <div>
                <p className="text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                    {formatPrice(wholesalePrice)}
                    <span className="text-sm font-normal text-[#9A9A9A] ml-1">/piece</span>
                </p>
                <p className="text-xs text-[#9A9A9A] mt-0.5">Wholesale price</p>
            </div>

            {/* Quantity & Size selectors */}
            <div className="p-4 bg-[#F5F3F0] rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-[#2D2D2D] mb-1 block">Quantity (pieces)</label>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 5))}
                                className="w-8 h-8 rounded-lg bg-white border border-[#E8E5E0] text-[#2D2D2D] font-bold hover:bg-[#F5F3F0] transition-colors text-sm"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-16 text-center border border-[#E8E5E0] rounded-lg py-1.5 text-sm bg-white font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setQuantity(quantity + 5)}
                                className="w-8 h-8 rounded-lg bg-white border border-[#E8E5E0] text-[#2D2D2D] font-bold hover:bg-[#F5F3F0] transition-colors text-sm"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-[#9A9A9A]">Estimated total</p>
                        <p className="text-lg font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                            {formatPrice(wholesalePrice * quantity)}
                        </p>
                    </div>
                </div>

                {sizes.length > 0 && (
                    <div>
                        <label className="text-xs font-medium text-[#2D2D2D] mb-1.5 block">Preferred Size</label>
                        <div className="flex flex-wrap gap-1.5">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 font-medium ${selectedSize === size
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
            </div>

            {/* Action Button */}
            {inBasket ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Added to enquiry list</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="flex-1 text-sm py-2.5 bg-[#1B2A4A] text-white rounded-xl font-medium hover:bg-[#2a3d63] transition-colors"
                        >
                            Update quantity
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="text-sm px-4 py-2.5 border border-[#E8E5E0] text-[#6B6B6B] rounded-xl font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleAdd}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 ${justAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1B2A4A] text-white hover:bg-[#2a3d63]'
                        }`}
                >
                    {justAdded ? (
                        <>
                            <Check className="w-5 h-5" />
                            Added!
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Add to Enquiry List
                        </>
                    )}
                </button>
            )}

            <p className="text-[10px] text-[#9A9A9A] text-center leading-relaxed">
                Add products to your enquiry list, then submit all at once with your details.
            </p>
        </div>
    )
}
