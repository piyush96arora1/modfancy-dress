'use client'

import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Footer } from '@/components/public/Footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Client-side auth guard
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const role = user.user_metadata?.role
      if (role !== 'admin') {
        router.replace('/')
        return
      }

      setIsAuthorized(true)
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!authChecked || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const navLinks = [
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/enquiries', label: 'Enquiries' },
    { href: '/admin/catalogues', label: 'Catalogues' },
    { href: '/admin/banner', label: 'Banner' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 md:gap-8">
              <Link
                href="/admin/products"
                className="text-lg md:text-xl font-bold text-gray-900"
              >
                Admin Panel
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${pathname.startsWith(link.href)
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/"
                className="text-xs md:text-sm text-gray-600 hover:text-gray-900"
              >
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
            <div className="md:hidden py-4 border-t space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${pathname.startsWith(link.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">{children}</main>
      <Footer />
    </div>
  )
}
