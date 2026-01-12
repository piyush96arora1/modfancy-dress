'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RestoreProductButtonProps {
  productId: string
  productName: string
  restoreAction: (id: string) => Promise<void>
}

export function RestoreProductButton({ productId, productName, restoreAction }: RestoreProductButtonProps) {
  const [restoring, setRestoring] = useState(false)
  const router = useRouter()

  const handleRestore = async () => {
    if (!confirm(`Are you sure you want to restore "${productName}"?`)) {
      return
    }

    setRestoring(true)
    try {
      await restoreAction(productId)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to restore product')
      setRestoring(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestore}
      loading={restoring}
      disabled={restoring}
      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
    >
      {restoring ? 'Restoring...' : 'Restore'}
    </Button>
  )
}

