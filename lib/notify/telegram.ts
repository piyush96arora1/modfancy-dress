/**
 * Owner alerts through a Telegram bot (free, instant push on the owner's phone).
 *
 * Set TELEGRAM_BOT_TOKEN (from @BotFather) and TELEGRAM_CHAT_ID: the chat id of each person
 * who messaged the bot, comma-separated for more than one (e.g. owner and shop staff).
 * Unset = alerts are skipped. Never throws: an alert must not break a checkout.
 *
 * Alerts carry name, items and amounts, never the phone or address (those stay in admin).
 */
export async function sendOwnerAlert(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!token || chatIds.length === 0) return false
  const results = await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
          signal: AbortSignal.timeout(4000),
        })
        if (!res.ok) console.error('Telegram alert failed', chatId, res.status)
        return res.ok
      } catch (error) {
        console.error('Telegram alert failed', chatId, error)
        return false
      }
    }),
  )
  // Delivered to at least one person counts: retrying would re-send to the others.
  return results.some(Boolean)
}

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export type AlertOrder = {
  order_number: string
  customer_name: string
  total_amount: number
  delivery_fee: number
  delivery_method: string | null
  payment_method: string
  payment_status: string
  payment_group?: string | null
  paid_amount?: number | null
  shipping_address: { city?: string; pincode?: string; event_date?: string } | null
  items: { product_name: string; size: string | null; quantity: number }[]
}

export function orderAlertText(o: AlertOrder, adminUrl: string): string {
  const head =
    o.payment_status === 'paid'
      ? `🟢 PAID ${rupees(o.paid_amount ?? o.total_amount)}${o.payment_group ? ` (${o.payment_group.toUpperCase()})` : ''}`
      : `🟡 PAY LATER ${rupees(o.total_amount)} — confirm on WhatsApp`
  const delivery =
    o.delivery_method === 'porter'
      ? `🛵 Porter → ${o.shipping_address?.city ?? ''} ${o.shipping_address?.pincode ?? ''} — WhatsApp the rider fare`
      : o.delivery_method === 'pickup'
        ? '🏬 Pickup from shop'
        : `📦 Courier → ${o.shipping_address?.city ?? ''} ${o.shipping_address?.pincode ?? ''}`
  const items = o.items
    .map((i) => `• ${i.product_name}${i.size ? ` (${i.size})` : ''} × ${i.quantity}`)
    .join('\n')
  const event = o.shipping_address?.event_date ? `\n📅 Needed by ${o.shipping_address.event_date}` : ''
  const mismatch =
    o.payment_status === 'paid' && o.paid_amount != null && Math.abs(o.paid_amount - o.total_amount) > 0.5
      ? `\n⚠️ Paid amount differs from order total ${rupees(o.total_amount)} — check Cashfree`
      : ''
  return `🛍️ New order ${o.order_number}\n${head}\n${o.customer_name}\n${items}\n${delivery}${event}${mismatch}\n${adminUrl}`
}
