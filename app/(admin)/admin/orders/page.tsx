'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrderList } from '@/components/admin/OrderList'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select(`*, items:order_items(*)`)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-0 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Orders</h1>
      <OrderList orders={orders} />
    </div>
  )
}
