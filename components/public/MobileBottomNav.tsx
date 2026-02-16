'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, Phone } from 'lucide-react'
import { useCart } from '@/lib/store/cart'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  // Don't show on admin pages or auth pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null
  }

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/products',
      label: 'Shop',
      icon: Search,
      active: pathname?.startsWith('/products') || pathname?.startsWith('/category'),
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      active: pathname === '/cart',
      badge: itemCount > 0 ? itemCount : undefined,
    },
    {
      href: '/contact',
      label: 'Contact',
      icon: Phone,
      active: pathname === '/contact',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-t border-[#E8E5E0]/60 safe-area-inset-bottom md:hidden" style={{ boxShadow: '0 -4px 20px rgba(27, 42, 74, 0.06)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`
                flex flex-col items-center justify-center 
                flex-1 h-full relative
                transition-all duration-200
                ${isActive
                  ? 'text-[#1B2A4A]'
                  : 'text-[#9A9A9A] active:text-[#1B2A4A]'
                }
              `}
            >
              <div className="relative">
                <Icon
                  className={`
                    w-5 h-5 transition-all duration-200
                    ${isActive ? 'scale-110' : 'scale-100'}
                  `}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C8956C] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`
                  text-[10px] mt-1 font-medium transition-all duration-200
                  ${isActive ? 'text-[#1B2A4A]' : 'text-[#9A9A9A]'}
                `}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8956C]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
