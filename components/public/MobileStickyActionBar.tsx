'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, LayoutGrid } from 'lucide-react'

export function MobileStickyActionBar() {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-2 pb-[68px] bg-white/95 backdrop-blur-md border-t shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 flex gap-2">
            <Button
                variant="outline"
                className="flex-[0.35] h-10 px-2 rounded-xl border-[#E8E5E0] bg-[#FAFAF8] text-[#1B2A4A] shadow-sm flex items-center justify-center gap-1.5"
                onClick={() => {
                    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                    if (searchInput) {
                        searchInput.focus(); // Synchronous focus to reliably open mobile keyboard
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
            >
                <Search className="w-3.5 h-3.5 text-[#C8956C] flex-shrink-0" />
                <span className="font-semibold text-xs">Search</span>
            </Button>
            <Link href="/products" className="flex-[0.65]">
                <Button className="w-full h-10 px-2 rounded-xl bg-[#1B2A4A] text-white shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#2A4070]">
                    <LayoutGrid className="w-3.5 h-3.5 text-[#C8956C] flex-shrink-0" />
                    <span className="font-semibold text-xs whitespace-nowrap">All Products</span>
                </Button>
            </Link>
        </div>
    )
}
