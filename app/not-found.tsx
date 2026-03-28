import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Tag } from 'lucide-react'

export default function NotFound() {
  const categories = [
    { name: 'Dance Costumes', slug: 'dance' },
    { name: 'Festival Costumes', slug: 'festival' },
    { name: 'Freedom Fighters', slug: 'freedom-fighters' },
    { name: 'Mythological', slug: 'mythological' },
  ]

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="text-6xl font-bold text-[#E8E5E0] mb-4">404</div>
      <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2 font-[family-name:var(--font-outfit)]">
        Page Not Found
      </h1>
      <p className="text-[#6B6B6B] mb-8 max-w-sm">
        Sorry, we couldn&apos;t find that page. Try browsing our costume collection instead.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
        <Link href="/products">
          <Button size="lg" variant="outline" className="gap-2">
            Browse All Costumes
          </Button>
        </Link>
      </div>
      <div className="w-full max-w-sm">
        <p className="text-xs text-[#9A9A9A] mb-3 uppercase tracking-wide">Popular Categories</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-2 p-3 rounded-lg bg-[#F5F3F0] hover:bg-[#FBF5EF] border border-[#E8E5E0] text-sm text-[#2D2D2D] transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-[#C8956C] shrink-0" />
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
