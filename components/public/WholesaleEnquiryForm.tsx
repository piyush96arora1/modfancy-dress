'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, Send, Package } from 'lucide-react'
import type { ProductWithDetails, PricingMode } from '@/types/database'
import { getProductPrice, formatPrice } from '@/lib/utils/pricing'

interface WholesaleEnquiryFormProps {
    product: ProductWithDetails
    sizes: string[]
    wholesaleDiscountPct?: number
}

export function WholesaleEnquiryForm({ product, sizes, wholesaleDiscountPct = 30 }: WholesaleEnquiryFormProps) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [quantity, setQuantity] = useState('10')
    const [selectedSize, setSelectedSize] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const wholesalePrice = getProductPrice(product, 'wholesale', wholesaleDiscountPct)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!name.trim() || !phone.trim()) {
            setError('Name and phone number are required.')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/wholesale/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: name.trim(),
                    customer_phone: phone.trim(),
                    customer_email: email.trim() || null,
                    message: message.trim() || null,
                    products: [{
                        product_id: product.id,
                        product_name: product.name,
                        slug: product.slug,
                        quantity: parseInt(quantity) || 10,
                        size: selectedSize || null,
                        wholesale_price: wholesalePrice,
                    }],
                }),
            })

            if (!res.ok) {
                throw new Error('Failed to submit enquiry')
            }

            setSubmitted(true)
        } catch (err) {
            setError('Something went wrong. Please try again or call us directly.')
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-8 px-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-1">
                    Enquiry Submitted!
                </h3>
                <p className="text-sm text-[#6B6B6B]">
                    We'll get back to you within 24 hours with pricing and availability details.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {/* Price Display */}
            <div>
                <p className="text-3xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                    {formatPrice(wholesalePrice)}
                    <span className="text-sm font-normal text-[#9A9A9A] ml-1">/piece (wholesale)</span>
                </p>
            </div>

            {/* Enquiry Form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-5 bg-[#F5F3F0] rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-[#1B2A4A]" />
                    <h3 className="font-semibold text-sm text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                        Send Wholesale Enquiry
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="enquiry-name" className="text-xs">Name *</Label>
                        <Input
                            id="enquiry-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                            className="bg-white"
                        />
                    </div>
                    <div>
                        <Label htmlFor="enquiry-phone" className="text-xs">Phone *</Label>
                        <Input
                            id="enquiry-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            required
                            className="bg-white"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="enquiry-email" className="text-xs">Email <span className="text-[#9A9A9A]">(optional)</span></Label>
                    <Input
                        id="enquiry-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-white"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="enquiry-qty" className="text-xs">Quantity (pieces)</Label>
                        <Input
                            id="enquiry-qty"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="10"
                            className="bg-white"
                        />
                    </div>
                    {sizes.length > 0 && (
                        <div>
                            <Label className="text-xs">Preferred Size</Label>
                            <div className="flex flex-wrap gap-1.5 mt-1">
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

                <div>
                    <Label htmlFor="enquiry-message" className="text-xs">Additional Requirements <span className="text-[#9A9A9A]">(optional)</span></Label>
                    <Textarea
                        id="enquiry-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="E.g., need customization, specific delivery date, multiple products..."
                        rows={3}
                        className="bg-white"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base font-semibold"
                    loading={submitting}
                    disabled={submitting}
                >
                    {submitting ? (
                        'Submitting...'
                    ) : (
                        <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Enquiry
                        </span>
                    )}
                </Button>

                <p className="text-[10px] text-[#9A9A9A] text-center">
                    Our team will contact you within 24 hours with pricing and availability.
                </p>
            </form>
        </div>
    )
}
