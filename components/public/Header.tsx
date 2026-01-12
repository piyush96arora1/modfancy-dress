'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/cart'
import { useAuth } from '@/lib/hooks/useAuth'
import { ShoppingCart, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function Header() {
  const { getItemCount } = useCart()
  const { user, isAdmin, loading } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAdminPending, startAdminTransition] = useTransition()
  const [isProductsPending, startProductsTransition] = useTransition()
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
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all">
            Mod Fancy Dress
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/products" 
              onClick={(e) => {
                e.preventDefault()
                startProductsTransition(() => {
                  router.push('/products')
                })
              }}
              className={`text-indigo-700 hover:text-indigo-900 transition-opacity relative inline-flex items-center gap-2 ${isProductsPending ? 'opacity-50' : ''}`}
            >
              {isProductsPending && <LoadingSpinner size="sm" />}
              Products
            </Link>
            <Link 
              href="/contact" 
              className="text-indigo-700 hover:text-indigo-900 transition-colors inline-flex items-center"
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
                className={`text-indigo-700 hover:text-indigo-900 transition-opacity relative inline-flex items-center gap-2 ${isAdminPending ? 'opacity-50' : ''}`}
              >
                {isAdminPending && <LoadingSpinner size="sm" />}
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="text-sm hidden lg:inline">{user.email}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout} loading={loggingOut} disabled={loggingOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="text-xs md:text-sm px-2 md:px-4">
                      <span className="hidden sm:inline">Login</span>
                      <User className="w-4 h-4 sm:hidden" />
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden mt-3 pt-3 border-t flex items-center gap-4">
          <Link 
            href="/products" 
            onClick={(e) => {
              e.preventDefault()
              startProductsTransition(() => {
                router.push('/products')
              })
            }}
            className={`text-sm text-indigo-700 hover:text-indigo-900 transition-opacity relative inline-flex items-center gap-2 ${isProductsPending ? 'opacity-50' : ''}`}
          >
            {isProductsPending && <LoadingSpinner size="sm" />}
            Products
          </Link>
          <Link 
            href="/contact" 
            className="text-sm text-indigo-700 hover:text-indigo-900 transition-colors inline-flex items-center"
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
              className={`text-sm text-indigo-700 hover:text-indigo-900 transition-opacity relative inline-flex items-center gap-2 ${isAdminPending ? 'opacity-50' : ''}`}
            >
              {isAdminPending && <LoadingSpinner size="sm" />}
              Admin
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-2 ml-auto">
              <User className="w-4 h-4 text-gray-900" />
              <span className="text-xs text-gray-600 truncate max-w-[120px]">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} loading={loggingOut} disabled={loggingOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}






