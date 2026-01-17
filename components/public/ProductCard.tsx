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
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-2xl shadow-lg">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-indigo-200 group-hover:-translate-y-0.5 h-full flex flex-col">
        <div className="aspect-[4/3] relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden rounded-t-xl">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-xs">No Image</span>
            </div>
          )}
          {/* Hover overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-2 md:p-3 bg-white flex-1 flex flex-col">
          <h3 className="font-semibold text-xs md:text-sm lg:text-base mb-1 md:mb-1.5 line-clamp-2 text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
            {product.name}
          </h3>
          {/* Show multiple categories if available, otherwise show single category */}
          {product.categories && product.categories.length > 0 ? (
            <div className="flex flex-wrap gap-0.5 md:gap-1 mb-1 md:mb-2">
              {product.categories.slice(0, 2).map((pc, idx) => (
                <span key={idx} className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">
                  {pc.category.name}
                </span>
              ))}
              {product.categories.length > 2 && (
                <span className="text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                  +{product.categories.length - 2}
                </span>
              )}
            </div>
          ) : product.category && (
            <p className="text-[10px] md:text-xs text-indigo-600 mb-1 md:mb-2 font-medium">{product.category.name}</p>
          )}
          {displayPrice && (
            <div className="mt-auto pt-0.5 md:pt-1">
              <p className="text-base md:text-lg lg:text-xl font-bold text-gray-900">
                ₹{displayPrice.toFixed(2)}
              </p>
              {product.price && product.variants.length > 0 && product.variants[0].price_override && (
                <p className="text-[10px] md:text-xs text-gray-500 line-through">₹{product.price.toFixed(2)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}





