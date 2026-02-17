'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEnquiryBasket } from '@/lib/context/EnquiryBasketContext'
import { formatPrice } from '@/lib/utils/pricing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Send, Check, Package, ChevronRight } from 'lucide-react'

export default function WholesaleEnquiryPage() {
    const { items, removeItem, updateItem, clearBasket, itemCount } = useEnquiryBasket()
    const router = useRouter()

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!name.trim() || !phone.trim()) {
            setError('Name and phone number are required.')
            return
        }

        if (items.length === 0) {
            setError('Please add at least one product to your enquiry.')
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
                    products: items.map((item) => ({
                        product_id: item.product_id,
                        product_name: item.product_name,
                        slug: item.slug,
                        quantity: item.quantity,
                        size: item.size,
                        wholesale_price: item.wholesale_price,
                    })),
                }),
            })

            if (!res.ok) throw new Error('Failed to submit')

            setSubmitted(true)
            clearBasket()
        } catch {
            setError('Something went wrong. Please try again or call us directly.')
        } finally {
            setSubmitting(false)
        }
    }

    // Success state
    if (submitted) {
        return (
            <div className="fade-in max-w-lg mx-auto py-16 text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">
                    Enquiry Submitted!
                </h1>
                <p className="text-[#6B6B6B] mb-6">
                    Our team will review your requirements and get back to you within 24 hours with pricing and availability.
                </p>
                <div className="flex justify-center gap-3">
                    <Link
                        href="/wholesale"
                        className="px-5 py-2.5 bg-[#1B2A4A] text-white rounded-xl font-medium text-sm hover:bg-[#2a3d63] transition-colors"
                    >
                        Continue Browsing
                    </Link>
                    <Link
                        href="/"
                        className="px-5 py-2.5 border border-[#E8E5E0] text-[#6B6B6B] rounded-xl font-medium text-sm hover:bg-[#F5F3F0] transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        )
    }

    // Empty state
    if (itemCount === 0) {
        return (
            <div className="fade-in max-w-lg mx-auto py-16 text-center">
                <Package className="w-16 h-16 text-[#E8E5E0] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-2">
                    Your Enquiry List is Empty
                </h1>
                <p className="text-[#6B6B6B] mb-6">
                    Browse our wholesale products and add items you're interested in.
                </p>
                <Link
                    href="/wholesale"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B2A4A] text-white rounded-xl font-medium text-sm hover:bg-[#2a3d63] transition-colors"
                >
                    Browse Wholesale Products
                </Link>
            </div>
        )
    }

    const estimatedTotal = items.reduce((acc, item) => acc + item.wholesale_price * item.quantity, 0)

    return (
        <div className="fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-4 md:mb-6">
                <Link href="/" className="hover:text-[#1B2A4A] transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <Link href="/wholesale" className="hover:text-[#1B2A4A] transition-colors">Wholesale</Link>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className="text-[#2D2D2D]">Enquiry</span>
            </nav>

            <h1 className="text-xl md:text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)] mb-1">
                Wholesale Enquiry
            </h1>
            <p className="text-sm text-[#6B6B6B] mb-6">
                Review your products below, fill in your details, and we'll get back to you with the best prices.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                {/* Products list — wider */}
                <div className="lg:col-span-3 space-y-3">
                    <h2 className="text-sm font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                        Products ({itemCount})
                    </h2>

                    {items.map((item) => (
                        <div key={item.product_id} className="flex gap-3 p-3 bg-white rounded-xl border border-[#E8E5E0]">
                            {/* Image */}
                            <Link href={`/wholesale/${item.slug}`} className="flex-shrink-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 relative bg-[#F5F3F0] rounded-lg overflow-hidden">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.product_name}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#9A9A9A] text-xs">No img</div>
                                    )}
                                </div>
                            </Link>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/wholesale/${item.slug}`} className="text-sm font-semibold text-[#1B2A4A] hover:text-[#C8956C] transition-colors line-clamp-1">
                                    {item.product_name}
                                </Link>
                                <p className="text-xs text-[#9A9A9A] mt-0.5">
                                    {formatPrice(item.wholesale_price)}/piece
                                    {item.size && ` · Size: ${item.size}`}
                                </p>

                                {/* Quantity controls */}
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => updateItem(item.product_id, { quantity: Math.max(1, item.quantity - 5) })}
                                        className="w-6 h-6 rounded bg-[#F5F3F0] text-[#2D2D2D] text-xs font-bold hover:bg-[#E8E5E0] transition-colors"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.product_id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                        className="w-14 text-center border border-[#E8E5E0] rounded py-1 text-xs bg-white font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updateItem(item.product_id, { quantity: item.quantity + 5 })}
                                        className="w-6 h-6 rounded bg-[#F5F3F0] text-[#2D2D2D] text-xs font-bold hover:bg-[#E8E5E0] transition-colors"
                                    >
                                        +
                                    </button>
                                    <span className="text-xs text-[#6B6B6B] ml-1">pcs</span>
                                </div>
                            </div>

                            {/* Subtotal + Remove */}
                            <div className="flex flex-col items-end justify-between">
                                <button
                                    type="button"
                                    onClick={() => removeItem(item.product_id)}
                                    className="text-[#9A9A9A] hover:text-red-500 transition-colors p-0.5"
                                    aria-label={`Remove ${item.product_name}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="text-sm font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                                    {formatPrice(item.wholesale_price * item.quantity)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Summary */}
                    <div className="flex items-center justify-between p-3 bg-[#F5F3F0] rounded-xl">
                        <span className="text-sm text-[#6B6B6B]">Estimated Total</span>
                        <span className="text-lg font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                            {formatPrice(estimatedTotal)}
                        </span>
                    </div>
                    <p className="text-[10px] text-[#9A9A9A]">
                        * Final pricing may vary based on quantities and availability. Our team will confirm exact pricing.
                    </p>
                </div>

                {/* Contact form — narrower */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="sticky top-6 p-5 bg-white rounded-xl border border-[#E8E5E0] space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                        <h2 className="text-sm font-semibold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">
                            Your Details
                        </h2>

                        <div>
                            <Label htmlFor="enquiry-name" className="text-xs">Name *</Label>
                            <Input
                                id="enquiry-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required
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
                            />
                        </div>

                        <div>
                            <Label htmlFor="enquiry-email" className="text-xs">
                                Email <span className="text-[#9A9A9A]">(optional)</span>
                            </Label>
                            <Input
                                id="enquiry-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="enquiry-message" className="text-xs">
                                Message <span className="text-[#9A9A9A]">(optional)</span>
                            </Label>
                            <Textarea
                                id="enquiry-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Custom requirements, delivery timeline, etc."
                                rows={3}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full text-sm font-semibold"
                            loading={submitting}
                            disabled={submitting}
                        >
                            {submitting ? (
                                'Submitting...'
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Send Enquiry ({itemCount} {itemCount === 1 ? 'product' : 'products'})
                                </span>
                            )}
                        </Button>

                        <p className="text-[10px] text-[#9A9A9A] text-center leading-relaxed">
                            We'll contact you within 24 hours with pricing and availability.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
