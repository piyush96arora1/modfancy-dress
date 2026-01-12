'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Footer } from '@/components/public/Footer'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 md:gap-8">
              <Link href="/admin/products" className="text-lg md:text-xl font-bold text-gray-900">
                Admin Panel
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-4">
                <Link
                  href="/admin/products"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/admin/categories"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Categories
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Orders
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/" className="text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors">
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
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/admin/categories"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/admin/orders"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
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
