'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SearchBar } from '@/components/public/SearchBar'

export function Header() {
  const { getItemCount } = useCart()
  const { user, isAdmin, loading } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAdminPending, startAdminTransition] = useTransition()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const itemCount = getItemCount()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      setLoggingOut(false)
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#E8E5E0] safe-area-inset-top" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group truncate pr-2">
            <span className="font-[family-name:var(--font-outfit)] text-[1.1rem] sm:text-lg md:text-2xl font-bold text-[#1B2A4A] tracking-tight truncate">
              Mod Fancy Dress
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              prefetch={true}
              className="text-[#2D2D2D] hover:text-[#1B2A4A] transition-colors font-medium text-sm tracking-wide relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#C8956C] after:transition-all hover:after:w-full"
            >
              Products
            </Link>
            <Link
              href="/rent"
              prefetch={true}
              className="text-[#2D2D2D] hover:text-[#1B2A4A] transition-colors font-medium text-sm tracking-wide relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#C8956C] after:transition-all hover:after:w-full"
            >
              Rent
            </Link>
            <Link
              href="/about"
              prefetch={true}
              className="text-[#2D2D2D] hover:text-[#1B2A4A] transition-colors font-medium text-sm tracking-wide relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#C8956C] after:transition-all hover:after:w-full"
            >
              About
            </Link>
            <Link
              href="/faq"
              prefetch={true}
              className="text-[#2D2D2D] hover:text-[#1B2A4A] transition-colors font-medium text-sm tracking-wide relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#C8956C] after:transition-all hover:after:w-full"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              prefetch={true}
              className="text-[#2D2D2D] hover:text-[#1B2A4A] transition-colors font-medium text-sm tracking-wide relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#C8956C] after:transition-all hover:after:w-full"
            >
              Contact
            </Link>
            {isAdmin && (
              <Link
                href="/admin/products"
                onClick={(e) => {
                  e.preventDefault()
                  startAdminTransition(() => {
                    router.push('/admin/products')
                  })
                }}
                className={`text-[#2D2D2D] hover:text-[#1B2A4A] transition-opacity relative inline-flex items-center gap-2 font-medium text-sm ${isAdminPending ? 'opacity-50' : ''}`}
              >
                {isAdminPending && <LoadingSpinner size="sm" />}
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <Suspense fallback={<div className="h-10 bg-[#F5F3F0] rounded-lg animate-pulse" />}>
              <SearchBar variant="compact" />
            </Suspense>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-[#F5F3F0] rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 md:w-[22px] md:h-[22px] text-[#2D2D2D]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C8956C] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {!loading && (
              <>
                {user ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1B2A4A] flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{user.email?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-[#6B6B6B] hidden lg:inline max-w-[120px] truncate">{user.email}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout} loading={loggingOut} disabled={loggingOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="text-xs px-3">
                      <span className="hidden sm:inline">Login</span>
                      <User className="w-4 h-4 sm:hidden" />
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Admin Link */}
        {isAdmin && (
          <nav className="md:hidden pb-2 pt-1 border-t border-[#F5F3F0]">
            <Link
              href="/admin/products"
              onClick={(e) => {
                e.preventDefault()
                startAdminTransition(() => {
                  router.push('/admin/products')
                })
              }}
              className={`text-xs text-[#1B2A4A] hover:text-[#C8956C] transition-opacity relative inline-flex items-center gap-2 font-medium ${isAdminPending ? 'opacity-50' : ''}`}
            >
              {isAdminPending && <LoadingSpinner size="sm" />}
              Admin Panel
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
