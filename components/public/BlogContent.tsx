'use client'

import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

/** Parse inline **bold** and [text](url) markdown into React nodes. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
  let last = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    if (m[1] !== undefined) {
      const label = m[1]
      const href = m[2]
      nodes.push(
        href.startsWith('/') ? (
          <Link key={key++} href={href} className="text-[#C8956C] hover:underline font-medium">{label}</Link>
        ) : (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-[#C8956C] hover:underline font-medium">{label}</a>
        )
      )
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={key++} className="text-[#2D2D2D]">{m[3]}</strong>)
    }
    last = regex.lastIndex
  }
  if (last < text.length) nodes.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return nodes
}

/** Renders blog content: headings (##/###), bullet lists, and paragraphs with inline links/bold. */
export function BlogContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter(Boolean)
  return (
    <div className="blog-content space-y-1">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        const heading = /^(#{2,3})\s+(.+)$/.exec(trimmed)
        if (heading && !trimmed.includes('\n')) {
          const content2 = renderInline(heading[2])
          return heading[1].length === 2 ? (
            <h2 key={i} className="text-xl font-bold text-[#1B2A4A] mt-6 mb-2 font-[family-name:var(--font-outfit)]">{content2}</h2>
          ) : (
            <h3 key={i} className="text-lg font-semibold text-[#1B2A4A] mt-4 mb-2 font-[family-name:var(--font-outfit)]">{content2}</h3>
          )
        }

        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean)
        const allBullets = lines.length > 0 && lines.every((l) => l.startsWith('- '))
        if (allBullets) {
          return (
            <ul key={i} className="list-disc list-inside space-y-1 my-3 text-[#6B6B6B] text-sm">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^- /, ''))}</li>
              ))}
            </ul>
          )
        }

        const text = trimmed.replace(/\n/g, ' ')
        return (
          <p key={i} className="my-3 text-[#6B6B6B] text-sm leading-relaxed">
            {renderInline(text)}
          </p>
        )
      })}
    </div>
  )
}
