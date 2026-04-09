import { defineEventHandler } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'

const ALLOWED_STATUSES = new Set(['confirmed', 'shipped', 'delivered'])

export default defineEventHandler(async (event) => {
  const productId = String(event.context.params?.id || '').trim()
  if (!productId) {
    return {
      success: true,
      productId: '',
      buyers7d: 0,
      orders7d: 0
    }
  }

  const client = getSupabaseAdmin(event)
  const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await client
    .from('order_items')
    .select(`
      order_id,
      orders!inner (
        status,
        created_at,
        customer_phone
      )
    `)
    .eq('product_id', productId)
    .gte('orders.created_at', fromDate)

  if (error) {
    return {
      success: false,
      productId,
      buyers7d: 0,
      orders7d: 0
    }
  }

  const rows = Array.isArray(data) ? data : []
  const orderIds = new Set<string>()
  const buyers = new Set<string>()

  for (const row of rows as Array<{ order_id?: string; orders?: { status?: string; customer_phone?: string } }>) {
    const status = String(row?.orders?.status || '').trim()
    if (!ALLOWED_STATUSES.has(status)) continue

    const orderId = String(row?.order_id || '').trim()
    const phone = String(row?.orders?.customer_phone || '').trim()

    if (orderId) orderIds.add(orderId)
    if (phone) buyers.add(phone)
  }

  return {
    success: true,
    productId,
    buyers7d: buyers.size,
    orders7d: orderIds.size
  }
})

