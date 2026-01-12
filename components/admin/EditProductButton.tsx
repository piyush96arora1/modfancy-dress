'use client'

import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

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
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/admin/products/${productId}/edit`)
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      loading={isPending}
      disabled={isPending}
      className={className}
    >
      {isPending ? 'Loading...' : 'Edit'}
    </Button>
  )
}

