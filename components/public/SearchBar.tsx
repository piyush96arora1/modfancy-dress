'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // Sync query with URL search params
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setQuery(decodeURIComponent(searchParam))
    } else {
      // Clear input when search param is removed
      setQuery('')
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      startTransition(() => {
        // Preserve category param if it exists
        const category = searchParams.get('category')
        const params = new URLSearchParams()
        params.set('search', trimmedQuery)
        if (category) params.set('category', category)
        router.push(`/products?${params.toString()}`)
      })
    } else {
      // If query is empty, remove search param
      clearSearch()
    }
  }

  const clearSearch = () => {
    setQuery('')
    startTransition(() => {
      const category = searchParams.get('category')
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      const queryString = params.toString()
      router.push(queryString ? `/products?${queryString}` : '/products')
    })
  }

  const hasSearchQuery = Boolean(query || searchParams.get('search'))

  return (
    <form onSubmit={handleSearch} className="flex gap-3 w-full">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search for costumes, accessories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full ${hasSearchQuery ? 'pr-12' : 'pr-12'} h-12 md:h-14 text-base text-gray-900 bg-white border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg shadow-sm hover:shadow-md transition-all`}
        />
        {hasSearchQuery ? (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      <Button 
        type="submit" 
        variant="default" 
        disabled={isPending} 
        className="min-w-[120px] md:min-w-[140px] h-12 md:h-14 px-6 text-base font-semibold"
      >
        {isPending ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            <span>Searching...</span>
          </>
        ) : (
          <span>Shop Now</span>
        )}
      </Button>
    </form>
  )
}






