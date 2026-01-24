'use client'

import { Button } from '@/components/ui/button'

interface EditProductButtonProps {
  productId: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EditProductButton({ 
  productId, 
  variant = 'outline', 
  size = 'sm',
  className 
}: EditProductButtonProps) {
  const handleClick = () => {
    window.open(`/admin/products/${productId}/edit`, '_blank')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      Edit
    </Button>
  )
}

