'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string; slug: string }>
  currentCategory: string | null
  searchQuery: string | null
}

export function CategoryFilter({ categories, currentCategory, searchQuery }: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const searchParams = useSearchParams()

  // Close expanded section whenever URL params change (i.e., a category was clicked)
  useEffect(() => {
    setIsExpanded(false)
  }, [searchParams])

  const buildUrl = (catSlug: string | null) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (catSlug) params.set('category', catSlug)
    const queryString = params.toString()
    return queryString ? `/products?${queryString}` : '/products'
  }

  const clearCategory = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    const queryString = params.toString()
    return queryString ? `/products?${queryString}` : '/products'
  }

  // Show first 6 categories, rest expandable
  const visibleCategories = categories.slice(0, 6)
  const hiddenCategories = categories.slice(6)

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {/* All pill */}
        <Link
          href={buildUrl(null)}
          className={`flex-shrink-0 px-3.5 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-200 whitespace-nowrap font-medium ${!currentCategory
            ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
            : 'bg-white text-[#6B6B6B] border-[#E8E5E0] hover:border-[#1B2A4A] hover:text-[#1B2A4A]'
            }`}
        >
          All
        </Link>

        {/* Visible category pills */}
        {visibleCategories.map((cat) => (
          <Link
            key={cat.id}
            href={buildUrl(cat.slug)}
            className={`flex-shrink-0 px-3.5 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-200 whitespace-nowrap font-medium ${currentCategory === cat.slug
              ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
              : 'bg-white text-[#6B6B6B] border-[#E8E5E0] hover:border-[#1B2A4A] hover:text-[#1B2A4A]'
              }`}
          >
            {cat.name}
          </Link>
        ))}

        {/* More toggle */}
        {hiddenCategories.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 px-3.5 py-1.5 text-xs sm:text-sm rounded-full border border-[#E8E5E0] bg-white text-[#6B6B6B] hover:border-[#1B2A4A] hover:text-[#1B2A4A] transition-all duration-200 flex items-center gap-1 font-medium"
          >
            {isExpanded ? (
              <>Less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>+{hiddenCategories.length} <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}

        {/* Clear filter */}
        {currentCategory && (
          <Link
            href={clearCategory()}
            className="flex-shrink-0 p-1.5 text-[#9A9A9A] hover:text-[#2D2D2D] transition-colors rounded-full"
            title="Clear category filter"
          >
            <X className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Expanded categories */}
      {isExpanded && hiddenCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[#F5F3F0]">
          {hiddenCategories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl(cat.slug)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-200 font-medium ${currentCategory === cat.slug
                ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                : 'bg-white text-[#6B6B6B] border-[#E8E5E0] hover:border-[#1B2A4A] hover:text-[#1B2A4A]'
                }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
