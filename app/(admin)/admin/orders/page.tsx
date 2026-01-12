import { createClient } from '@/lib/supabase/server'
import { OrderList } from '@/components/admin/OrderList'

export const metadata = {
  title: 'Orders - Admin Panel',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 md:px-0 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Orders</h1>
      <OrderList orders={orders || []} />
    </div>
  )
}






