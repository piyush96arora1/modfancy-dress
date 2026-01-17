'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search')
  const [isPending, startTransition] = useTransition()
  const [clickedPage, setClickedPage] = useState<number | null>(null)

  // Build URL with preserved search param
  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    if (search) {
      params.set('search', search)
    }
    if (page > 1) {
      params.set('page', page.toString())
    }
    const queryString = params.toString()
    return `/admin/products${queryString ? `?${queryString}` : ''}`
  }

  // Handle page navigation with loading state
  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number) => {
    e.preventDefault()
    setClickedPage(page)
    startTransition(() => {
      router.push(buildUrl(page))
      // Reset clicked page after navigation starts
      setTimeout(() => setClickedPage(null), 100)
    })
  }

  if (totalPages <= 1) {
    return null
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium text-gray-900">{startItem}</span> to{' '}
        <span className="font-medium text-gray-900">{endItem}</span> of{' '}
        <span className="font-medium text-gray-900">{totalItems}</span> products
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2 relative">
        {/* Loading overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        {/* Previous button */}
        <Link 
          href={buildUrl(currentPage - 1)}
          onClick={(e) => handlePageClick(e, currentPage - 1)}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isPending}
            loading={isPending && clickedPage === currentPage - 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </Link>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage
            const isClicked = clickedPage === pageNum

            return (
              <Link 
                key={pageNum} 
                href={buildUrl(pageNum)}
                onClick={(e) => handlePageClick(e, pageNum)}
              >
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  disabled={isPending}
                  loading={isPending && isClicked}
                  className={`min-w-[2.5rem] transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : isPending && !isClicked
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-indigo-50'
                  }`}
                >
                  {pageNum}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Next button */}
        <Link 
          href={buildUrl(currentPage + 1)}
          onClick={(e) => handlePageClick(e, currentPage + 1)}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || isPending}
            loading={isPending && clickedPage === currentPage + 1}
            className="flex items-center gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

