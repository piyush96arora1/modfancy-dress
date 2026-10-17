'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { whatsappUrl } from '@/lib/constants/contact'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'

/** Order lookup without an account. A match opens the full order page (same view as after
 *  checkout); the server never says whether an order number exists on its own. */
export function TrackOrderClient({ initialOrder }: { initialOrder: string }) {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState(initialOrder)
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderNumber, phone }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) throw new Error(data.error || 'Order not found')
      router.push(`/order/${data.order.orderNumber}?t=${encodeURIComponent(data.token)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <div className="fade-in max-w-md mx-auto py-4">
      <h1 className="text-2xl font-bold text-[#1B2A4A] font-[family-name:var(--font-outfit)]">Track your order</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Enter the order number from your confirmation and the mobile number you ordered with.</p>
      <form onSubmit={submit} className="mt-5 space-y-3.5" noValidate>
        <div>
          <label htmlFor="orderNumber" className="block text-sm font-medium text-[#2D2D2D] mb-1">Order number</label>
          <input
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="MFD-261018-K3X9P"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="next"
            required
            className="block w-full h-12 rounded-xl border border-[#B9B5AC] px-3.5 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/15 focus:border-[#1B2A4A]"
          />
        </div>
        <div>
          <label htmlFor="trackPhone" className="block text-sm font-medium text-[#2D2D2D] mb-1">Mobile number</label>
          <input
            id="trackPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            enterKeyHint="search"
            required
            className="block w-full h-12 rounded-xl border border-[#B9B5AC] px-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/15 focus:border-[#1B2A4A]"
          />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full min-h-[50px] rounded-xl bg-[#1B2A4A] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Search className="w-4 h-4" /> {busy ? 'Finding your order…' : 'Show my order'}
        </button>
      </form>
      <a
        href={whatsappUrl('Hi! I want to check the status of my order.')}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 min-h-[44px] text-sm text-[#1B2A4A] font-medium"
      >
        <WhatsAppIcon className="w-4 h-4 text-[#25D366]" /> Can’t find it? WhatsApp us
      </a>
    </div>
  )
}
