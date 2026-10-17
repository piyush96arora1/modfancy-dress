import type { Metadata } from 'next'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export const metadata: Metadata = {
  title: 'Your cart & checkout',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <CheckoutClient />
}
