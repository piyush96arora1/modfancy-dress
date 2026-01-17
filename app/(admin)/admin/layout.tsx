'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Footer } from '@/components/public/Footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isHomePending, startHomeTransition] = useTransition()
  const [isAdminPanelPending, startAdminPanelTransition] = useTransition()
  const [isProductsPending, startProductsTransition] = useTransition()
  const [isCategoriesPending, startCategoriesTransition] = useTransition()
  const [isOrdersPending, startOrdersPending] = useTransition()
  const [isBannerPending, startBannerTransition] = useTransition()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 md:gap-8">
              <Link 
                href="/admin/products" 
                onClick={(e) => {
                  e.preventDefault()
                  startAdminPanelTransition(() => {
                    router.push('/admin/products')
                  })
                }}
                className={`text-lg md:text-xl font-bold text-gray-900 transition-opacity relative inline-flex items-center gap-2 ${isAdminPanelPending ? 'opacity-50' : ''}`}
              >
                {isAdminPanelPending && <LoadingSpinner size="sm" />}
                Admin Panel
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-4">
                <Link
                  href="/admin/products"
                  onClick={(e) => {
                    e.preventDefault()
                    startProductsTransition(() => {
                      router.push('/admin/products')
                    })
                  }}
                  className={`text-gray-600 hover:text-gray-900 transition-opacity relative inline-flex items-center gap-2 ${isProductsPending ? 'opacity-50' : ''}`}
                >
                  {isProductsPending && <LoadingSpinner size="sm" />}
                  Products
                </Link>
                <Link
                  href="/admin/categories"
                  onClick={(e) => {
                    e.preventDefault()
                    startCategoriesTransition(() => {
                      router.push('/admin/categories')
                    })
                  }}
                  className={`text-gray-600 hover:text-gray-900 transition-opacity relative inline-flex items-center gap-2 ${isCategoriesPending ? 'opacity-50' : ''}`}
                >
                  {isCategoriesPending && <LoadingSpinner size="sm" />}
                  Categories
                </Link>
                <Link
                  href="/admin/orders"
                  onClick={(e) => {
                    e.preventDefault()
                    startOrdersPending(() => {
                      router.push('/admin/orders')
                    })
                  }}
                  className={`text-gray-600 hover:text-gray-900 transition-opacity relative inline-flex items-center gap-2 ${isOrdersPending ? 'opacity-50' : ''}`}
                >
                  {isOrdersPending && <LoadingSpinner size="sm" />}
                  Orders
                </Link>
                <Link
                  href="/admin/banner"
                  onClick={(e) => {
                    e.preventDefault()
                    startBannerTransition(() => {
                      router.push('/admin/banner')
                    })
                  }}
                  className={`text-gray-600 hover:text-gray-900 transition-opacity relative inline-flex items-center gap-2 ${isBannerPending ? 'opacity-50' : ''}`}
                >
                  {isBannerPending && <LoadingSpinner size="sm" />}
                  Banner
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link 
                href="/" 
                onClick={(e) => {
                  e.preventDefault()
                  startHomeTransition(() => {
                    router.push('/')
                  })
                }}
                className={`text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-opacity relative inline-flex items-center gap-2 ${isHomePending ? 'opacity-50' : ''}`}
              >
                {isHomePending && <LoadingSpinner size="sm" />}
                Back to Site
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t space-y-2">
              <Link
                href="/admin/products"
                className={`block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-opacity relative flex items-center gap-2 ${isProductsPending ? 'opacity-50' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  startProductsTransition(() => {
                    router.push('/admin/products')
                  })
                }}
              >
                {isProductsPending && <LoadingSpinner size="sm" />}
                Products
              </Link>
              <Link
                href="/admin/categories"
                className={`block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-opacity relative flex items-center gap-2 ${isCategoriesPending ? 'opacity-50' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  startCategoriesTransition(() => {
                    router.push('/admin/categories')
                  })
                }}
              >
                {isCategoriesPending && <LoadingSpinner size="sm" />}
                Categories
              </Link>
              <Link
                href="/admin/orders"
                className={`block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-opacity relative flex items-center gap-2 ${isOrdersPending ? 'opacity-50' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  startOrdersPending(() => {
                    router.push('/admin/orders')
                  })
                }}
              >
                {isOrdersPending && <LoadingSpinner size="sm" />}
                Orders
              </Link>
              <Link
                href="/admin/banner"
                className={`block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-opacity relative flex items-center gap-2 ${isBannerPending ? 'opacity-50' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  startBannerTransition(() => {
                    router.push('/admin/banner')
                  })
                }}
              >
                {isBannerPending && <LoadingSpinner size="sm" />}
                Banner
              </Link>
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">{children}</main>
      <Footer />
    </div>
  )
}
