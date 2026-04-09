import { createError, defineEventHandler, getQuery } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireAdminCsrf } from '../../utils/admin-session'
import { assertRateLimit } from '../../utils/rate-limit'

type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

type AdminOrder = {
  id: string
  createdAt: string
  customer: {
    name: string
    phone: string
    email?: string
    address: string
    comment?: string
  }
  items: Array<{
    id: string
    title: string
    price: number
    quantity: number
    selectedSize?: string
  }>
  total: number
  status: OrderStatus
  statusHistory: Array<{
    status: OrderStatus
    changedAt: string
    note?: string
    actor?: string
  }>
}

const validStatuses: OrderStatus[] = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
]

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-orders-get',
    limit: 120,
    windowMs: 60 * 1000
  })

  const supabase = getSupabaseAdmin(event)
  const query = getQuery(event)
  const status = String(query.status || '').trim() as OrderStatus | ''

  let ordersQuery = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && validStatuses.includes(status)) {
    ordersQuery = ordersQuery.eq('status', status)
  }

  const { data: ordersRows, error: ordersError } = await ordersQuery

  if (ordersError) {
    throw createError({
      statusCode: 500,
      statusMessage: ordersError.message
    })
  }

  const orderIds = (ordersRows || []).map((order) => String(order.id))

  const { data: itemsRows, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds.length ? orderIds : ['__none__'])

  if (itemsError) {
    throw createError({
      statusCode: 500,
      statusMessage: itemsError.message
    })
  }

  const { data: historyRows, error: historyError } = await supabase
    .from('order_status_history')
    .select('*')
    .in('order_id', orderIds.length ? orderIds : ['__none__'])
    .order('changed_at', { ascending: false })

  if (historyError) {
    throw createError({
      statusCode: 500,
      statusMessage: historyError.message
    })
  }

  const itemsByOrder = new Map<string, any[]>()
  for (const item of itemsRows || []) {
    const orderId = String(item.order_id)
    const current = itemsByOrder.get(orderId) || []
    current.push(item)
    itemsByOrder.set(orderId, current)
  }

  const historyByOrder = new Map<string, any[]>()
  for (const entry of historyRows || []) {
    const orderId = String(entry.order_id)
    const current = historyByOrder.get(orderId) || []
    current.push(entry)
    historyByOrder.set(orderId, current)
  }

  const orders: AdminOrder[] = (ordersRows || []).map((row: any) => {
    const orderId = String(row.id)

    return {
      id: orderId,
      createdAt: row.created_at,
      customer: {
        name: row.customer_name || '',
        phone: row.customer_phone || '',
        email: row.customer_email || '',
        address: row.customer_address || '',
        comment: row.customer_comment || ''
      },
      items: (itemsByOrder.get(orderId) || []).map((item: any) => ({
        id: String(item.id),
        title: item.title || '',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        selectedSize: item.selected_size || ''
      })),
      total: Number(row.total || 0),
      status: row.status as OrderStatus,
      statusHistory: (historyByOrder.get(orderId) || []).map((entry: any) => ({
        status: entry.status as OrderStatus,
        changedAt: entry.changed_at,
        note: entry.note || '',
        actor: entry.actor || ''
      }))
    }
  })

  return {
    success: true,
    orders
  }
})
