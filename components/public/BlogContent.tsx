'use client'

/** Renders blog content: paragraphs and bullet lists from plain text. */
export function BlogContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter(Boolean)
  return (
    <div className="blog-content space-y-1">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null
        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean)
        const allBullets = lines.length > 0 && lines.every((l) => l.startsWith('- '))
        if (allBullets) {
          return (
            <ul key={i} className="list-disc list-inside space-y-1 my-3 text-[#6B6B6B] text-sm">
              {lines.map((line, j) => (
                <li key={j}>{line.replace(/^- /, '')}</li>
              ))}
            </ul>
          )
        }
        const text = trimmed.replace(/\n/g, ' ')
        return (
          <p key={i} className="my-3 text-[#6B6B6B] text-sm leading-relaxed">
            {text}
          </p>
        )
      })}
    </div>
  )
}
