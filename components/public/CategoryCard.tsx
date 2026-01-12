'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/category/${category.slug}`)
    })
  }

  return (
    <Link 
      href={`/category/${category.slug}`} 
      onClick={handleClick}
      className="bg-white rounded-2xl p-4 md:p-5 text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-indigo-300 hover:-translate-y-1 relative block group overflow-hidden"
    >
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-2xl">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-indigo-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/20 transition-all duration-300 rounded-2xl" />
      <h3 className={`relative z-10 font-semibold text-sm md:text-base text-gray-800 group-hover:text-indigo-600 transition-all duration-300 leading-tight ${isPending ? 'opacity-50' : ''}`}>
        {category.name}
      </h3>
    </Link>
  )
}

