'use client'

import Link from 'next/link'
import { useEnquiryBasket } from '@/lib/context/EnquiryBasketContext'
import { Package } from 'lucide-react'

export function FloatingEnquiryBadge() {
    const { itemCount } = useEnquiryBasket()

    if (itemCount === 0) return null

    return (
        <Link
            href="/wholesale/enquiry"
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 bg-[#1B2A4A] text-white pl-4 pr-5 py-3 rounded-full font-medium text-sm hover:bg-[#2a3d63] transition-all duration-300 hover:scale-105"
            style={{ boxShadow: '0 8px 32px rgba(27, 42, 74, 0.35)' }}
        >
            <Package className="w-4 h-4" />
            <span>Enquiry List</span>
            <span className="flex items-center justify-center w-6 h-6 bg-white text-[#1B2A4A] rounded-full text-xs font-bold ml-0.5">
                {itemCount}
            </span>
        </Link>
    )
}
