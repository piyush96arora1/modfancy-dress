'use client'

import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface ViewOrderButtonProps {
  orderId: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ViewOrderButton({ 
  orderId, 
  variant = 'outline', 
  size = 'sm',
  className 
}: ViewOrderButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/admin/orders/${orderId}`)
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
      {isPending ? 'Loading...' : 'View'}
    </Button>
  )
}

