'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { usePricingMode } from '@/lib/context/PricingModeContext'

// Auto-map category names to emojis
function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('animal') || lower.includes('zoo')) return '🦁'
  if (lower.includes('bird') || lower.includes('parrot') || lower.includes('peacock')) return '🦚'
  if (lower.includes('fruit') || lower.includes('vegetable') || lower.includes('food')) return '🍎'
  if (lower.includes('flower') || lower.includes('plant') || lower.includes('tree')) return '🌸'
  if (lower.includes('freedom') || lower.includes('national') || lower.includes('patriot') || lower.includes('leader')) return '🇮🇳'
  if (lower.includes('mythology') || lower.includes('god') || lower.includes('goddess') || lower.includes('religious')) return '🙏'
  if (lower.includes('fairy') || lower.includes('princess') || lower.includes('queen') || lower.includes('king')) return '👑'
  if (lower.includes('superhero') || lower.includes('hero')) return '🦸'
  if (lower.includes('profession') || lower.includes('doctor') || lower.includes('police') || lower.includes('community')) return '👨‍⚕️'
  if (lower.includes('dance') || lower.includes('folk') || lower.includes('classical')) return '💃'
  if (lower.includes('cartoon') || lower.includes('character') || lower.includes('disney')) return '🎭'
  if (lower.includes('halloween') || lower.includes('horror') || lower.includes('scary')) return '🎃'
  if (lower.includes('christmas') || lower.includes('santa') || lower.includes('festival')) return '🎄'
  if (lower.includes('sport') || lower.includes('game')) return '⚽'
  if (lower.includes('school') || lower.includes('education')) return '📚'
  if (lower.includes('insect') || lower.includes('bug') || lower.includes('butterfly')) return '🦋'
  if (lower.includes('sea') || lower.includes('fish') || lower.includes('ocean') || lower.includes('marine') || lower.includes('aquatic')) return '🐠'
  if (lower.includes('western') || lower.includes('foreign')) return '🤠'
  if (lower.includes('indian') || lower.includes('traditional')) return '🪷'
  if (lower.includes('space') || lower.includes('astronaut')) return '🚀'
  if (lower.includes('accessory') || lower.includes('accessories') || lower.includes('prop')) return '✨'
  return '🎪'
}

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { mode } = usePricingMode()

  const basePath = mode === 'wholesale' ? '/wholesale/category' : '/category'

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`${basePath}/${category.slug}`)
    })
  }

  const emoji = getCategoryEmoji(category.name)

  return (
    <Link
      href={`${basePath}/${category.slug}`}
      onClick={handleClick}
      className="flex-shrink-0 w-24 md:w-auto flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-white border border-[#E8E5E0] hover:border-[#C8956C]/40 transition-all duration-300 hover:-translate-y-0.5 relative group"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      {isPending && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-xl">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {/* Emoji Circle */}
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#F5F3F0] group-hover:bg-[#FBF5EF] flex items-center justify-center transition-colors duration-300">
        <span className="text-xl md:text-2xl" role="img" aria-label={category.name}>{emoji}</span>
      </div>
      <h3 className={`text-center font-medium text-xs md:text-sm text-[#2D2D2D] group-hover:text-[#1B2A4A] transition-colors leading-tight ${isPending ? 'opacity-50' : ''}`}>
        {category.name}
      </h3>
    </Link>
  )
}
