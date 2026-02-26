'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AdminSearchBarProps {
  categories?: { id: string; name: string; slug: string }[]
}

export function AdminSearchBar({ categories = [] }: AdminSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [isPending, startTransition] = useTransition()

  // Sync query and category with URL search params
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setQuery(decodeURIComponent(searchParam))
    } else {
      setQuery('')
    }

    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setCategory(categoryParam)
    } else {
      setCategory('all')
    }
  }, [searchParams])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedQuery = query.trim()
    const params = new URLSearchParams()

    if (trimmedQuery) params.set('search', trimmedQuery)
    if (category && category !== 'all') params.set('category', category)

    startTransition(() => {
      router.push(`/admin/products${params.toString() ? '?' + params.toString() : ''}`)
    })
  }

  const handleClear = () => {
    setQuery('')
    setCategory('all')
    startTransition(() => {
      router.push('/admin/products')
    })
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl bg-white p-2 sm:p-0 rounded-xl sm:rounded-none shadow-sm border sm:border-0 sm:shadow-none mb-4 md:mb-0">

      {/* Category Dropdown (using native select for simplicity in forms unless you prefer the UI component) */}
      <div className="w-full sm:w-[180px] flex-shrink-0">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
          }}
          className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search products by name or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10 text-gray-900 bg-white border-gray-300 focus:border-gray-500 focus:ring-gray-500"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="default"
          disabled={isPending}
          className="flex-1 sm:min-w-[100px] px-4 bg-[#1B2A4A] hover:bg-[#2A3F6A]"
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
      </div>
    </form>
  )
}


