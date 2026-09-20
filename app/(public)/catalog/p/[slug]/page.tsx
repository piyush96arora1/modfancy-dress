import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { getCatalogProductBySlugCached } from '@/lib/supabase/supplier-queries'
import { CatalogGallery } from '@/components/public/catalog/CatalogGallery'
import { ShareLinkButton } from '@/components/public/catalog/ShareLinkButton'
import { whatsappUrl } from '@/lib/constants/contact'

export const revalidate = 86400
export const dynamicParams = true

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getCatalogProductBySlugCached(slug)
  return {
    title: product ? `${product.name} | Catalogue` : 'Catalogue',
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  }
}

export default async function CatalogProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getCatalogProductBySlugCached(slug)
  if (!product) notFound()

  // Some products price each size separately; those rates are already marked up upstream.
  const hasPerSizePricing = Boolean(product.variants?.some((v) => v.priceLabel))

  const enquiry = whatsappUrl(
    `Hi, I'd like to know about "${product.name}" (${product.priceLabel}) from your catalogue.`
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <nav
        className="flex items-center gap-1 text-sm text-[#6B6B6B] mb-6 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/catalog" className="hover:text-[#8F6240]">
          Catalogue
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/catalog/${product.categorySlug}`} className="hover:text-[#8F6240]">
          {product.categoryName}
        </Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <CatalogGallery images={product.images} alt={product.name} />

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2C2C2C]">{product.name}</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">{product.categoryName}</p>

          <p className="text-3xl font-semibold text-[#2C2C2C] mt-5">{product.priceLabel}</p>

          {(product.setValue > 1 || product.minOrderQty > 0) && (
            <dl className="mt-4 space-y-1 text-sm text-[#2C2C2C]">
              {product.setValue > 1 && (
                <div className="flex gap-2">
                  <dt className="text-[#6B6B6B]">Set of</dt>
                  <dd>{product.setValue}</dd>
                </div>
              )}
              {product.minOrderQty > 0 && (
                <div className="flex gap-2">
                  <dt className="text-[#6B6B6B]">Minimum order</dt>
                  <dd>{product.minOrderQty}</dd>
                </div>
              )}
            </dl>
          )}

          {product.hasSizes && product.variants && product.variants.length > 0 && (
            <div className="mt-6">
              <h2 className="text-base font-medium text-[#2C2C2C] mb-2">Available options</h2>
              <div className="overflow-x-auto rounded-xl border border-[#E8E5E0] bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F3F0] text-[#6B6B6B]">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Colour</th>
                      <th className="text-left px-3 py-2 font-medium">Size</th>
                      {hasPerSizePricing && (
                        <th className="text-left px-3 py-2 font-medium">Price</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v, i) => (
                      <tr key={`${v.color}-${v.size}-${i}`} className="border-t border-[#E8E5E0]">
                        <td className="px-3 py-2">{v.color}</td>
                        <td className="px-3 py-2">{v.size}</td>
                        {hasPerSizePricing && (
                          <td className="px-3 py-2">{v.priceLabel ?? product.priceLabel}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={enquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8956C] text-white font-medium hover:bg-[#b8845c] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Enquire on WhatsApp
            </a>
            <ShareLinkButton label="Copy link" />
          </div>
        </div>
      </div>
    </div>
  )
}
