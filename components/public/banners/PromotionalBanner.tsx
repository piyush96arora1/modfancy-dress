'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

export interface PromotionalBannerProps {
  title: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  buttonIcon?: LucideIcon
  backgroundColor?: string
  titleColor?: string
  subtitleBgColor?: string
  subtitleTextColor?: string
  buttonColor?: string
  showFlags?: boolean
  flagColors?: string[]
  height?: 'sm' | 'md' | 'lg'
}

export function PromotionalBanner({
  title,
  subtitle,
  description,
  buttonText = 'SHOP NOW',
  buttonLink = '/products',
  buttonIcon: ButtonIcon,
  backgroundColor = 'from-blue-100 via-orange-50 to-amber-100',
  titleColor = 'text-orange-600',
  subtitleBgColor = 'bg-green-600',
  subtitleTextColor = 'text-white',
  buttonColor = 'bg-red-600 hover:bg-red-700',
  showFlags = true,
  flagColors = ['bg-orange-500', 'bg-white', 'bg-green-500'],
  height = 'md',
}: PromotionalBannerProps) {
  const heightClasses = {
    sm: 'h-[300px] md:h-[400px]',
    md: 'h-[400px] md:h-[500px]',
    lg: 'h-[500px] md:h-[600px]',
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
      {/* Background with gradient */}
      <div className={`relative bg-gradient-to-b ${backgroundColor} ${heightClasses[height]}`}>
        {/* Decorative flags at top */}
        {showFlags && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-10">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 md:w-12 md:h-12 ${flagColors[i % flagColors.length]}`}
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
          {/* Brand/Logo Section (optional) */}
          {description && (
            <div className="mb-4">
              <p className="text-sm md:text-base text-gray-700">{description}</p>
            </div>
          )}

          {/* Main Headline */}
          <div className="mb-4">
            <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-2 ${titleColor}`}>
              {title}
            </h2>
            {subtitle && (
              <div className={`${subtitleBgColor} px-6 py-3 rounded-lg inline-block`}>
                <h3 className={`text-xl md:text-3xl lg:text-4xl font-bold ${subtitleTextColor}`}>
                  {subtitle}
                </h3>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <Link href={buttonLink}>
            <Button
              size="lg"
              className={`${buttonColor} text-white font-bold text-lg md:text-xl px-8 md:px-12 py-6 md:py-7 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
            >
              {ButtonIcon && <ButtonIcon className="w-5 h-5 md:w-6 md:h-6 mr-2" />}
              {buttonText}
            </Button>
          </Link>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-200 to-transparent opacity-50" />
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-orange-300 rounded-full" />
          <div className="absolute top-32 right-20 w-24 h-24 border-4 border-green-300 rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-20 h-20 border-4 border-white rounded-full" />
        </div>
      </div>
    </div>
  )
}

