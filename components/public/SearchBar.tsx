'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Search, X, FolderOpen, ArrowRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface SearchProduct {
  id: string
  name: string
  slug: string
  price: number | null
  image_url: string | null
  category_name: string | null
}

interface SearchCategory {
  id: string
  name: string
  slug: string
  product_count: number
}

interface SearchResults {
  products: SearchProduct[]
  categories: SearchCategory[]
}

interface SearchBarProps {
  variant?: 'default' | 'compact'
  onNavigate?: () => void
}

export function SearchBar({ variant = 'default', onNavigate }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync query with URL search params (default variant only)
  useEffect(() => {
    if (variant === 'default') {
      const searchParam = searchParams.get('search')
      if (searchParam) {
        setQuery(decodeURIComponent(searchParam))
      } else {
        setQuery('')
      }
    }
  }, [searchParams, variant])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  const fetchResults = useCallback(async (term: string) => {
    if (term.length < 3) {
      setResults(null)
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
      const data: SearchResults = await res.json()
      setResults(data)
      setIsOpen(
        (data.products?.length || 0) > 0 || (data.categories?.length || 0) > 0
      )
      setActiveIndex(-1)
    } catch {
      setResults(null)
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(value.trim()), 300)
  }

  // Full search navigation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      setIsOpen(false)
      startTransition(() => {
        const category = searchParams.get('category')
        const params = new URLSearchParams()
        params.set('search', trimmedQuery)
        if (category) params.set('category', category)
        router.push(`/products?${params.toString()}`)
      })
      onNavigate?.()
    } else {
      clearSearch()
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults(null)
    setIsOpen(false)
    if (variant === 'default') {
      startTransition(() => {
        const category = searchParams.get('category')
        const params = new URLSearchParams()
        if (category) params.set('category', category)
        const queryString = params.toString()
        router.push(queryString ? `/products?${queryString}` : '/products')
      })
    }
  }

  const navigateTo = (path: string) => {
    setIsOpen(false)
    setQuery('')
    startTransition(() => {
      router.push(path)
    })
    onNavigate?.()
  }

  // Build flat list of results for keyboard nav
  const allItems: { type: 'category' | 'product'; data: SearchCategory | SearchProduct }[] = []
  if (results?.categories) {
    results.categories.forEach((c) => allItems.push({ type: 'category', data: c }))
  }
  if (results?.products) {
    results.products.forEach((p) => allItems.push({ type: 'product', data: p }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allItems.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < allItems.length) {
          const item = allItems[activeIndex]
          if (item.type === 'category') {
            navigateTo(`/products?category=${(item.data as SearchCategory).slug}`)
          } else {
            navigateTo(`/products/${(item.data as SearchProduct).slug}`)
          }
        } else {
          handleSearch(e)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const hasSearchQuery = Boolean(query || searchParams.get('search'))

  const isCompact = variant === 'compact'

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearch} className="flex gap-2.5 w-full">
        <div className="relative flex-1">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A] pointer-events-none`} />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search costumes, accessories..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results && ((results.products?.length || 0) > 0 || (results.categories?.length || 0) > 0)) {
                setIsOpen(true)
              }
            }}
            className={`w-full pl-10 pr-10 text-sm bg-white border-[#E8E5E0] focus:border-[#1B2A4A] focus:ring-[#1B2A4A]/10 rounded-lg ${isCompact ? 'h-10' : 'h-11 md:h-12'
              }`}
            autoComplete="off"
          />
          {isLoading ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[#9A9A9A] animate-spin" />
            </div>
          ) : hasSearchQuery ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9A9A9A] hover:text-[#2D2D2D] rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
        {!isCompact && (
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
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && results && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E8E5E0] overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"
          style={{ boxShadow: '0 12px 40px rgba(27, 42, 74, 0.12), 0 4px 12px rgba(0,0,0,0.06)' }}
        >
          {/* Categories */}
          {results.categories && results.categories.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] uppercase tracking-widest text-[#9A9A9A] font-semibold px-3 py-1.5">
                Categories
              </p>
              {results.categories.map((cat, idx) => {
                const flatIdx = idx
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigateTo(`/products?category=${cat.slug}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeIndex === flatIdx
                        ? 'bg-[#1B2A4A]/5'
                        : 'hover:bg-[#F5F3F0]'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-4 h-4 text-[#1B2A4A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2D2D2D] truncate">
                        {cat.name}
                      </p>
                      <p className="text-[11px] text-[#9A9A9A]">
                        {cat.product_count} {cat.product_count === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C8956C] flex-shrink-0 opacity-0 group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Divider */}
          {results.categories?.length > 0 && results.products?.length > 0 && (
            <div className="border-t border-[#E8E5E0]/60 mx-3" />
          )}

          {/* Products */}
          {results.products && results.products.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] uppercase tracking-widest text-[#9A9A9A] font-semibold px-3 py-1.5">
                Products
              </p>
              {results.products.map((product, idx) => {
                const flatIdx = (results.categories?.length || 0) + idx
                return (
                  <button
                    key={product.id}
                    onClick={() => navigateTo(`/products/${product.slug}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeIndex === flatIdx
                        ? 'bg-[#1B2A4A]/5'
                        : 'hover:bg-[#F5F3F0]'
                      }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-[#F5F3F0] overflow-hidden flex-shrink-0 relative">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="w-3.5 h-3.5 text-[#9A9A9A]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2D2D2D] truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {product.category_name && (
                          <span className="text-[11px] text-[#9A9A9A] truncate">
                            {product.category_name}
                          </span>
                        )}
                        {product.price && (
                          <span className="text-[11px] font-semibold text-[#1B2A4A]">
                            ₹{product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* View all results */}
          {query.trim().length >= 3 && (
            <button
              onClick={() => handleSearch(new Event('submit') as any)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-[#E8E5E0]/60 text-sm font-medium text-[#C8956C] hover:bg-[#F5F3F0] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              View all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
