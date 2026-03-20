import type { ReactNode } from 'react'

/** Shared semantic table chrome — mobile horizontal scroll, readable typography. */
export function SeoTableWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-[#E8E5E0] bg-white shadow-[var(--shadow-xs)] ${className}`}
    >
      {children}
    </div>
  )
}

export const seoTableClass =
  'w-full min-w-[520px] text-left text-sm border-collapse caption-bottom [&_th]:bg-[#F5F3F0] [&_th]:text-[#1B2A4A] [&_th]:font-semibold [&_th]:px-3 [&_th]:py-2.5 [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-[#2D2D2D] [&_tbody_tr]:border-t [&_tbody_tr]:border-[#E8E5E0]'
