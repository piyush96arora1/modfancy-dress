import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-[#E8E5E0] bg-white px-3.5 py-2.5 text-sm text-[#2D2D2D] ring-offset-white placeholder:text-[#9A9A9A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A]/10 focus-visible:border-[#1B2A4A] disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }






