import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-lg border border-[#E8E5E0] bg-white px-3 py-2 text-sm text-[#2D2D2D] ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A]/10 focus-visible:border-[#1B2A4A] disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

export { Select }






