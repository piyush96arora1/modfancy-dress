'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string; slug: string }>
  currentCategory: string | null
  searchQuery: string | null
}

export function CategoryFilter({ categories, currentCategory, searchQuery }: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  // Show first 5 categories, rest in dropdown
  const visibleCategories = categories.slice(0, 5)
  const hiddenCategories = categories.slice(5)

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          
          {/* All Categories Link */}
          <Link
            href={buildUrl(null)}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-colors whitespace-nowrap ${
              !currentCategory
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-700'
            }`}
          >
            All
          </Link>

          {/* Visible Categories */}
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl(cat.slug)}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-colors whitespace-nowrap ${
                currentCategory === cat.slug
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-700'
              }`}
            >
              {cat.name}
            </Link>
          ))}

          {/* More Categories Toggle */}
          {hiddenCategories.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 text-xs sm:text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:border-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  +{hiddenCategories.length} More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Clear Category Filter */}
        {currentCategory && (
          <Link
            href={clearCategory()}
            className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            title="Clear category filter"
          >
            <X className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Expanded Categories */}
      {isExpanded && hiddenCategories.length > 0 && (
        <div className="border-t p-3 pt-3 flex flex-wrap gap-2">
          {hiddenCategories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl(cat.slug)}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-700'
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

