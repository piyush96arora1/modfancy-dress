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
      setQuery('')
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      startTransition(() => {
        const category = searchParams.get('category')
        const params = new URLSearchParams()
        params.set('search', trimmedQuery)
        if (category) params.set('category', category)
        router.push(`/products?${params.toString()}`)
      })
    } else {
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
    <form onSubmit={handleSearch} className="flex gap-2.5 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A] pointer-events-none" />
        <Input
          type="text"
          placeholder="Search costumes, accessories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 h-11 md:h-12 text-sm bg-white border-[#E8E5E0] focus:border-[#1B2A4A] focus:ring-[#1B2A4A]/10 rounded-lg"
        />
        {hasSearchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9A9A9A] hover:text-[#2D2D2D] rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        variant="default"
        disabled={isPending}
        className="min-w-[80px] md:min-w-[100px] h-11 md:h-12 px-4 text-sm font-medium rounded-lg"
      >
        {isPending ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span>Search</span>
        )}
      </Button>
    </form>
  )
}
