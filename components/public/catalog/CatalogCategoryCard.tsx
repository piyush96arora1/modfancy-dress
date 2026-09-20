import Link from 'next/link'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import type { CatalogCategory } from '@/lib/supabase/supplier-queries'

export function CatalogCategoryCard({ category }: { category: CatalogCategory }) {
  const img = category.thumbnailUrl ?? category.imageUrl
  return (
    <Link href={`/catalog/${category.slug}`} className="group block">
      <div
        className="bg-white rounded-xl overflow-hidden border border-[#E8E5E0] group-hover:border-[#C8956C]/30 transition-all duration-300 group-hover:-translate-y-1 h-full"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* alt="" on purpose: the heading below already names this card, and a
            duplicate alt makes the link announce its name twice to a screen reader. */}
        <div className="aspect-square relative bg-[#F5F3F0] overflow-hidden">
          {img ? (
            <Image
              src={img}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            // 10 of the 61 categories have no supplier image. Show a neutral mark rather than
            // the category name, which the heading below already states — repeating it renders
            // the name twice and makes the link announce it twice.
            <div className="w-full h-full flex items-center justify-center text-[#8F6240]/30">
              <ImageOff className="w-8 h-8" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-medium text-[#2C2C2C] group-hover:text-[#8F6240] transition-colors line-clamp-2">
            {category.name}
          </h3>
          {category.childCount > 0 && (
            <p className="text-xs text-[#6B6B6B] mt-1">{category.childCount} sub-categories</p>
          )}
        </div>
      </div>
    </Link>
  )
}
