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
      className="bg-white rounded-xl p-6 md:p-8 text-center shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:border-indigo-200 relative block group overflow-hidden"
    >
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-xl">
          <LoadingSpinner size="md" />
        </div>
      )}
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50 group-hover:to-purple-50 transition-all duration-300" />
      <h3 className={`relative z-10 font-bold text-lg md:text-xl text-gray-900 group-hover:text-indigo-600 transition-all duration-300 ${isPending ? 'opacity-50' : ''}`}>
        {category.name}
      </h3>
    </Link>
  )
}

