import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface OrderListProps {
  orders: any[]
}

async function updateOrderStatus(formData: FormData) {
  'use server'
  const orderId = formData.get('orderId') as string
  const currentStatus = formData.get('currentStatus') as string
  
  // Calculate new status
  const newStatus = currentStatus === 'pending' 
    ? 'confirmed' 
    : currentStatus === 'confirmed' 
    ? 'shipped' 
    : 'pending'
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
  
  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`)
  }
  
  revalidatePath('/admin/orders')
}

export async function OrderList({ orders }: OrderListProps) {

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No orders found.</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const itemCount = order.items?.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0
              ) || 0

              return (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{itemCount} item(s)</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ₹{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'shipped'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="currentStatus" value={order.status} />
                        <Button variant="outline" size="sm" type="submit">
                          {order.status === 'pending'
                            ? 'Confirm'
                            : order.status === 'confirmed'
                            ? 'Ship'
                            : 'Reset'}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => {
          const itemCount = order.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
          ) || 0

          return (
            <div key={order.id} className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg text-gray-900">{order.order_number}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                    order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'shipped'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <div className="font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-gray-500 text-xs">{order.customer_email}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium text-gray-900">{itemCount} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg text-gray-900">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Link href={`/admin/orders/${order.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View
                  </Button>
                </Link>
                <form action={updateOrderStatus} className="flex-1">
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="currentStatus" value={order.status} />
                  <Button variant="outline" size="sm" type="submit" className="w-full">
                    {order.status === 'pending'
                      ? 'Confirm'
                      : order.status === 'confirmed'
                      ? 'Ship'
                      : 'Reset'}
                  </Button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}





