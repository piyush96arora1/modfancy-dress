import type { CatalogProduct } from '@/lib/supabase/supplier-queries'
import { CatalogProductCard } from './CatalogProductCard'

/** Two columns on a phone, because clients open these links on their phones. */
export function CatalogGrid({
  products,
  titleTag = 'h3',
  emptyMessage = 'No items here yet.',
}: {
  products: CatalogProduct[]
  titleTag?: 'h3' | 'h4'
  emptyMessage?: string
}) {
  if (products.length === 0) {
    return <p className="text-[#9A9A9A] py-10 text-center">{emptyMessage}</p>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((p) => (
        <CatalogProductCard key={p.id} product={p} titleTag={titleTag} />
      ))}
    </div>
  )
}
