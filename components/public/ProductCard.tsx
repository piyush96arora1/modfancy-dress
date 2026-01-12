'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ProductWithDetails } from '@/types/database'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ProductCardProps {
  product: ProductWithDetails
}

export function ProductCard({ product }: ProductCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]
  const displayPrice = product.variants.length > 0 && product.variants[0].price_override
    ? product.variants[0].price_override
    : product.price

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/products/${product.slug}`)
    })
  }

  return (
    <Link href={`/products/${product.slug}`} onClick={handleClick} className="group relative block">
      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="p-4 bg-white">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-indigo-900 group-hover:text-indigo-700 transition-colors">{product.name}</h3>
          {product.category && (
            <p className="text-sm text-teal-600 mb-2">{product.category.name}</p>
          )}
          {displayPrice && (
            <p className="text-xl font-bold text-indigo-900">₹{displayPrice.toFixed(2)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}





