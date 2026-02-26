import { SearchBar } from '@/components/public/SearchBar'
import { PricingModeToggle } from '@/components/public/PricingModeToggle'

export default function Loading() {
    return (
        <div className="fade-in">
            {/* Page Header Skeleton */}
            <div className="mb-5 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-48 bg-[#F5F3F0] rounded-md animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-24 bg-[#F5F3F0] rounded-md animate-pulse" />
                        <PricingModeToggle currentMode="wholesale" />
                    </div>
                </div>

                {/* Wholesale banner placeholder */}
                <div className="mb-4 px-4 py-3 rounded-xl bg-[#F5F3F0] border border-[#E8E5E0] animate-pulse h-12" />

                {/* Search */}
                <div className="w-full mb-3">
                    <div className="h-12 bg-[#F5F3F0] rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 auto-rows-fr">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white rounded-[14px] overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent">
                        <div className="aspect-[3/4] bg-[#F5F3F0]/80 relative" />
                        <div className="p-3 md:p-4 flex-1 flex flex-col gap-3">
                            <div className="h-4 bg-[#F5F3F0] rounded-md w-3/4" />
                            <div className="h-3 bg-[#F5F3F0] rounded-md w-1/2 mt-auto" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
