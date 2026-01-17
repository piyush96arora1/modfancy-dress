'use client'

import { useEffect, useRef, useState } from 'react'

interface TickerStripProps {
  text: string
  speed?: number // pixels per second
}

export function TickerStrip({ text, speed = 80 }: TickerStripProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [duplicatedText, setDuplicatedText] = useState<string[]>([])
  const [animationDuration, setAnimationDuration] = useState('15s')

  useEffect(() => {
    if (!contentRef.current || !containerRef.current) return

    // Wait for layout to calculate
    const timer = setTimeout(() => {
      if (!contentRef.current || !containerRef.current) return

      // Force a reflow to get accurate measurements
      const singleItemWidth = contentRef.current.offsetWidth
      
      if (singleItemWidth === 0) {
        // Retry if width is 0
        setTimeout(() => {
          if (contentRef.current) {
            const width = contentRef.current.offsetWidth
            if (width > 0) {
              const copies = Math.max(4, Math.ceil((window.innerWidth * 3) / width))
              setDuplicatedText(Array(copies).fill(text))
              setAnimationDuration(`${width / speed}s`)
            }
          }
        }, 100)
        return
      }
      
      // Create enough copies for seamless infinite scroll
      // Animation moves -50%, so we need even number of copies
      // Minimum 4 copies (2 sets) for seamless loop
      const viewportWidth = window.innerWidth || containerRef.current.offsetWidth
      const copiesNeeded = Math.max(4, Math.ceil((viewportWidth * 3) / singleItemWidth))
      // Ensure even number for perfect loop
      const evenCopies = copiesNeeded % 2 === 0 ? copiesNeeded : copiesNeeded + 1
      
      setDuplicatedText(Array(evenCopies).fill(text))
      
      // Calculate animation duration
      // Animation moves -50% of total width
      // With even copies, -50% = exactly half the items = seamless loop
      // Duration = distance (half total width) / speed
      const totalWidth = singleItemWidth * evenCopies
      const duration = (totalWidth / 2) / speed
      setAnimationDuration(`${Math.max(10, duration)}s`)
    }, 200)

    return () => clearTimeout(timer)
  }, [text, speed])

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden bg-indigo-600 py-2.5 md:py-3 shadow-sm rounded-b-lg"
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600/30 to-indigo-600 opacity-60 rounded-b-lg" />
      
      {/* Animated content */}
      <div 
        className="flex whitespace-nowrap items-center relative z-10"
        style={{
          animation: `ticker-scroll ${animationDuration} linear infinite`,
        }}
      >
        {duplicatedText.length > 0 ? (
          <>
            {duplicatedText.map((txt, index) => (
              <div
                key={index}
                ref={index === 0 ? contentRef : null}
                className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6"
              >
                <span className="text-white text-xs md:text-sm font-medium tracking-normal drop-shadow-sm">
                  {txt}
                </span>
                {/* Subtle separator */}
                <span className="text-white/40 text-xs">●</span>
              </div>
            ))}
          </>
        ) : (
          <div 
            ref={contentRef} 
            className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6"
          >
            <span className="text-white text-xs md:text-sm font-medium tracking-normal drop-shadow-sm">
              {text}
            </span>
            <span className="text-white/40 text-xs">●</span>
          </div>
        )}
      </div>
      
      {/* Soft gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-4 md:w-6 bg-gradient-to-r from-indigo-600 via-indigo-600/70 to-transparent pointer-events-none z-10 rounded-b-lg" />
      <div className="absolute right-0 top-0 bottom-0 w-4 md:w-6 bg-gradient-to-l from-indigo-600 via-indigo-600/70 to-transparent pointer-events-none z-10 rounded-b-lg" />
    </div>
  )
}

