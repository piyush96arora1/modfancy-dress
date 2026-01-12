'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function AdminSearchBar() {
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
        router.push(`/admin/products?search=${encodeURIComponent(trimmedQuery)}`)
      })
    } else {
      // If query is empty, remove search param
      router.push('/admin/products')
    }
  }

  const handleClear = () => {
    setQuery('')
    startTransition(() => {
      router.push('/admin/products')
    })
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10 text-gray-900 bg-white border-gray-300 focus:border-gray-500 focus:ring-gray-500"
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
      {query && (
        <Button 
          type="button"
          variant="outline" 
          onClick={handleClear}
          disabled={isPending}
          className="px-3"
        >
          Clear
        </Button>
      )}
    </form>
  )
}

