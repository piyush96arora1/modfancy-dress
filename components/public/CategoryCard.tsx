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
      className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-indigo-300 transition-all bg-white relative block group"
    >
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size="md" />
        </div>
      )}
      <h3 className={`font-semibold text-indigo-900 group-hover:text-indigo-700 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {category.name}
      </h3>
    </Link>
  )
}

