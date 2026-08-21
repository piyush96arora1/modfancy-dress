'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function CatalogSearchBox({
  defaultValue = '',
  autoFocus = false,
}: {
  defaultValue?: string
  autoFocus?: boolean
}) {
  const router = useRouter()
  const [q, setQ] = useState(defaultValue)
  const tooShort = q.trim().length < 2

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!tooShort) router.push(`/catalog/search?q=${encodeURIComponent(q.trim())}`)
      }}
      className="relative w-full max-w-xl"
      role="search"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A] pointer-events-none" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search costumes, wigs, accessories..."
        aria-label="Search the catalogue"
        className="w-full pl-11 pr-24 py-3 rounded-xl border border-[#E8E5E0] bg-white text-[#2C2C2C] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#C8956C] transition-colors"
        style={{ boxShadow: 'var(--shadow-card)' }}
      />
      <button
        type="submit"
        disabled={tooShort}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-[#C8956C] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b8845c] transition-colors"
      >
        Search
      </button>
    </form>
  )
}
