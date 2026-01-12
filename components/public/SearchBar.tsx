'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
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
      const category = searchParams.get('category')
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      const queryString = params.toString()
      router.push(queryString ? `/products?${queryString}` : '/products')
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10 text-gray-900 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      <Button 
        type="submit" 
        variant="default" 
        disabled={isPending} 
        className="min-w-[100px] px-4"
      >
        {isPending ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            <span className="hidden sm:inline">Searching...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Search</span>
          </>
        )}
      </Button>
    </form>
  )
}






