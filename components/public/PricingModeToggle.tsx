'use client'

import Link from 'next/link'
import { Store, Package } from 'lucide-react'
import { usePricingMode } from '@/lib/context/PricingModeContext'
import type { PricingMode } from '@/types/database'

interface PricingModeToggleProps {
    currentMode: PricingMode
    /** The current page path (without mode prefix) e.g., '' or '/category/dance-dress' */
    basePath?: string
}

export function PricingModeToggle({ currentMode, basePath = '' }: PricingModeToggleProps) {
    const { setMode } = usePricingMode()

    const retailHref = basePath ? `/products${basePath}` : '/products'
    const wholesaleHref = basePath ? `/wholesale${basePath}` : '/wholesale'

    return (
        <div className="inline-flex items-center rounded-xl border border-[#E8E5E0] p-1 bg-white" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <Link
                href={retailHref}
                onClick={() => setMode('retail')}
                className={`
          flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${currentMode === 'retail'
                        ? 'bg-[#1B2A4A] text-white shadow-sm'
                        : 'text-[#6B6B6B] hover:text-[#2D2D2D] hover:bg-[#F5F3F0]'
                    }
        `}
            >
                <Store className="w-3.5 h-3.5" />
                Retail
            </Link>
            <Link
                href={wholesaleHref}
                onClick={() => setMode('wholesale')}
                className={`
          flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${currentMode === 'wholesale'
                        ? 'bg-[#1B2A4A] text-white shadow-sm'
                        : 'text-[#6B6B6B] hover:text-[#2D2D2D] hover:bg-[#F5F3F0]'
                    }
        `}
            >
                <Package className="w-3.5 h-3.5" />
                Wholesale
            </Link>
        </div>
    )
}
