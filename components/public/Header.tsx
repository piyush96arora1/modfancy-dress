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
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-bold text-indigo-900 hover:text-indigo-700 transition-colors">
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

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
                  {itemCount}
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






