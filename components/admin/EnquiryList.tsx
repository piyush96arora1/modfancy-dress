'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, Mail, Clock, Package, ChevronDown, ChevronUp } from 'lucide-react'

interface Enquiry {
    id: string
    customer_name: string
    customer_phone: string
    customer_email: string | null
    message: string | null
    products: Array<{
        product_id: string
        product_name: string
        slug: string
        quantity: number
        size: string | null
        wholesale_price: number
    }>
    status: string
    admin_notes: string | null
    created_at: string
    updated_at: string
}

interface EnquiryListProps {
    enquiries: Enquiry[]
}

const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-600',
}

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'closed']

export function EnquiryList({ enquiries: initialEnquiries }: EnquiryListProps) {
    const [enquiries, setEnquiries] = useState(initialEnquiries)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const supabase = createClient()

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id)
        try {
            const { error } = await supabase
                .from('wholesale_enquiries')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (!error) {
                setEnquiries(enquiries.map(e =>
                    e.id === id ? { ...e, status: newStatus } : e
                ))
            }
        } catch (err) {
            console.error('Error updating status:', err)
        } finally {
            setUpdatingId(null)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (enquiries.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No wholesale enquiries yet.</p>
                <p className="text-sm mt-1">Enquiries from the wholesale product pages will appear here.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">{enquiries.length} total enquiries</p>

            {enquiries.map((enquiry) => (
                <div key={enquiry.id} className="border rounded-lg overflow-hidden">
                    {/* Header row */}
                    <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === enquiry.id ? null : enquiry.id)}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">{enquiry.customer_name}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[enquiry.status] || STATUS_COLORS.new}`}>
                                    {enquiry.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {enquiry.customer_phone}
                                </span>
                                {enquiry.customer_email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {enquiry.customer_email}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(enquiry.created_at)}
                                </span>
                            </div>
                        </div>
                        <div className="ml-2">
                            {expandedId === enquiry.id ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Expanded details */}
                    {expandedId === enquiry.id && (
                        <div className="border-t px-4 py-4 bg-gray-50">
                            {/* Products */}
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Products Enquired</h4>
                            <div className="space-y-2 mb-4">
                                {enquiry.products.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded border">
                                        <div>
                                            <p className="font-medium text-gray-900">{product.product_name}</p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {product.quantity} {product.size ? `| Size: ${product.size}` : ''}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900">₹{product.wholesale_price}/pc</p>
                                    </div>
                                ))}
                            </div>

                            {/* Message */}
                            {enquiry.message && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Message</h4>
                                    <p className="text-sm text-gray-600 bg-white p-3 rounded border">{enquiry.message}</p>
                                </div>
                            )}

                            {/* Status update */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Status:</span>
                                {STATUS_OPTIONS.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => updateStatus(enquiry.id, status)}
                                        disabled={updatingId === enquiry.id || enquiry.status === status}
                                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${enquiry.status === status
                                            ? STATUS_COLORS[status] + ' ring-2 ring-offset-1 ring-gray-300'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            } ${updatingId === enquiry.id ? 'opacity-50' : ''}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {/* Quick actions */}
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                                <a
                                    href={`tel:${enquiry.customer_phone}`}
                                    className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 transition-colors"
                                >
                                    📞 Call
                                </a>
                                <a
                                    href={`https://wa.me/${enquiry.customer_phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 transition-colors"
                                >
                                    💬 WhatsApp
                                </a>
                                {enquiry.customer_email && (
                                    <a
                                        href={`mailto:${enquiry.customer_email}`}
                                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
                                    >
                                        ✉️ Email
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
