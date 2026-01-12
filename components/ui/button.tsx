import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from './loading-spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      default: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus-visible:ring-indigo-500 shadow-md hover:shadow-lg',
      outline: 'border-2 border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 focus-visible:ring-indigo-500 shadow-sm hover:shadow-md',
      ghost: 'hover:bg-gray-100 text-gray-700 hover:text-indigo-600',
      destructive: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500 shadow-md hover:shadow-lg',
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    }

    const isDisabled = disabled || loading

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <LoadingSpinner 
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} 
            className={cn(
              'mr-2',
              variant === 'default' || variant === 'destructive' ? 'border-white border-t-transparent' : ''
            )}
          />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }






