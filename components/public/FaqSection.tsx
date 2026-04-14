import type { Faq } from '@/types/database'

type FaqItem = Pick<Faq, 'id' | 'question' | 'answer'>

export function FaqSection({
  title,
  items,
  headingId,
}: {
  title: string
  items: FaqItem[]
  /** Stable id for aria-labelledby (unique per page when multiple sections). */
  headingId?: string
}) {
  if (!items.length) return null

  const hid = headingId ?? 'faq-heading'

  return (
    <section className="mt-10 md:mt-12 pt-8 border-t border-[#E8E5E0] first:mt-0 first:pt-0 first:border-t-0" aria-labelledby={hid}>
      <h2
        id={hid}
        className="text-lg md:text-xl font-bold text-[#1B2A4A] mb-4 font-[family-name:var(--font-outfit)]"
      >
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id}>
            <details
              className="group rounded-xl border border-[#E8E5E0] bg-white overflow-hidden"
              style={{ boxShadow: 'var(--shadow-xs)' }}
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-4 font-medium text-sm md:text-[15px] text-[#1B2A4A] hover:bg-[#FAFAF8] transition-colors [&::-webkit-details-marker]:hidden">
                <span className="text-left pr-2">{f.question}</span>
                <span className="text-[#C8956C] text-xs shrink-0 group-open:rotate-180 transition-transform" aria-hidden>
                  ▼
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-[#6B6B6B] leading-relaxed border-t border-[#F5F3F0] pt-3 whitespace-pre-line">
                {f.answer}
              </div>
            </details>
            {/* Answer text for AI crawlers that don't expand <details> elements */}
            <p className="sr-only">{f.question}: {f.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
