'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

/**
 * Copies the current page URL. The owner shares these catalogue links with clients directly,
 * so a one-tap copy is the primary action on every listing page.
 */
export function ShareLinkButton({ label = 'Copy link' }: { label?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard is unavailable over plain http or when permission is denied; the user
          // can still copy from the address bar, so fail quietly rather than alarming them.
          setCopied(false)
        }
      }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E8E5E0] bg-white text-sm text-[#2C2C2C] hover:border-[#C8956C] transition-colors shrink-0"
    >
      {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      {copied ? 'Link copied' : label}
    </button>
  )
}
