import { createError, type H3Event } from 'h3'
import { getSupabaseAdmin } from './supabase-admin'

export type AdminOrderStatus =
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type AdminOrderHistoryEntry = {
  status: AdminOrderStatus
  changedAt: string
  note?: string
  actor?: string
}

export type AdminOrder = {
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
  status: AdminOrderStatus
  source: 'web'
  notifications: {
    telegramSent: boolean
    emailSent: boolean
  }
  statusHistory: AdminOrderHistoryEntry[]
}

type OrderRow = {
  id: string
  created_at: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_address: string
  customer_comment: string | null
  total: number | string
  status: string
  source: string | null
  telegram_sent: boolean | null
  email_sent: boolean | null
  order_items?: OrderItemRow[] | null
  order_status_history?: OrderHistoryRow[] | null
}

type OrderItemRow = {
  product_id: string
  title: string
  price: number | string
  quantity: number
  selected_size: string | null
}

type OrderHistoryRow = {
  status: string
  changed_at: string
  note: string | null
  actor: string | null
}

const VALID_STATUSES: AdminOrderStatus[] = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
]

const VALID_STATUS_SET = new Set<AdminOrderStatus>(VALID_STATUSES)

function normalizeStatus(value: unknown): AdminOrderStatus {
  if (typeof value === 'string' && VALID_STATUS_SET.has(value as AdminOrderStatus)) {
    return value as AdminOrderStatus
  }

  return 'new'
}

function toAdminOrder(row: OrderRow): AdminOrder {
  const items = Array.isArray(row.order_items) ? row.order_items : []
  const history = Array.isArray(row.order_status_history) ? row.order_status_history : []

  return {
    id: row.id,
    createdAt: row.created_at,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email || undefined,
      address: row.customer_address,
      comment: row.customer_comment || undefined
    },
    items: items.map((item) => ({
      id: item.product_id,
      title: item.title,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      selectedSize: item.selected_size || undefined
    })),
    total: Number(row.total) || 0,
    status: normalizeStatus(row.status),
    source: 'web',
    notifications: {
      telegramSent: !!row.telegram_sent,
      emailSent: !!row.email_sent
    },
    statusHistory: history
      .map((entry) => ({
        status: normalizeStatus(entry.status),
        changedAt: entry.changed_at,
        note: entry.note || undefined,
        actor: entry.actor || 'admin'
      }))
      .sort((a, b) => +new Date(b.changedAt) - +new Date(a.changedAt))
  }
}

async function fetchOrders(event: H3Event, options?: { status?: string; id?: string }) {
  const client = getSupabaseAdmin(event)

  let query = client
    .from('orders')
    .select(
      `
      id,
      created_at,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      customer_comment,
      total,
      status,
      source,
      telegram_sent,
      email_sent,
      order_items (
        product_id,
        title,
        price,
        quantity,
        selected_size
      ),
      order_status_history (
        status,
        changed_at,
        note,
        actor
      )
    `
    )

  const requestedStatus = typeof options?.status === 'string' ? options.status.trim() : ''
  if (requestedStatus && VALID_STATUS_SET.has(requestedStatus as AdminOrderStatus)) {
    query = query.eq('status', requestedStatus)
  }

  const requestedId = typeof options?.id === 'string' ? options.id.trim() : ''
  if (requestedId) {
    query = query.eq('id', requestedId)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { foreignTable: 'order_items', ascending: true })
    .order('changed_at', { foreignTable: 'order_status_history', ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Supabase read failed: ${error.message}`
    })
  }

  const rows = Array.isArray(data) ? (data as OrderRow[]) : []
  return rows.map(toAdminOrder)
}

export async function readOrders(event: H3Event, status?: string): Promise<AdminOrder[]> {
  return fetchOrders(event, { status })
}

export async function readOrderById(event: H3Event, id: string): Promise<AdminOrder | null> {
  const [order] = await fetchOrders(event, { id })
  return order || null
}

export async function saveOrder(event: H3Event, order: AdminOrder) {
  const client = getSupabaseAdmin(event)

  const { error: insertOrderError } = await client.from('orders').insert({
    id: order.id,
    created_at: order.createdAt,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || null,
    customer_address: order.customer.address,
    customer_comment: order.customer.comment || null,
    total: order.total,
    status: normalizeStatus(order.status),
    source: order.source || 'web',
    telegram_sent: !!order.notifications.telegramSent,
    email_sent: !!order.notifications.emailSent
  })

  if (insertOrderError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Supabase insert failed: ${insertOrderError.message}`
    })
  }

  if (order.items.length) {
    const itemsPayload = order.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      selected_size: item.selectedSize || null
    }))

    const { error: insertItemsError } = await client.from('order_items').insert(itemsPayload)
    if (insertItemsError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Supabase items insert failed: ${insertItemsError.message}`
      })
    }
  }

  if (order.statusHistory.length) {
    const historyPayload = order.statusHistory.map((entry) => ({
      order_id: order.id,
      status: normalizeStatus(entry.status),
      changed_at: entry.changedAt,
      note: entry.note || null,
      actor: entry.actor?.trim() || 'system'
    }))

    const { error: insertHistoryError } = await client
      .from('order_status_history')
      .insert(historyPayload)

    if (insertHistoryError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Supabase history insert failed: ${insertHistoryError.message}`
      })
    }
  }
}

export async function patchOrderStatus(
  event: H3Event,
  orderId: string,
  status: AdminOrderStatus,
  note?: string,
  actor = 'admin'
) {
  const client = getSupabaseAdmin(event)
  const normalizedStatus = normalizeStatus(status)
  const cleanedOrderId = orderId.trim()

  if (!cleanedOrderId) {
    return null
  }

  const { data: updatedOrder, error: updateError } = await client
    .from('orders')
    .update({
      status: normalizedStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', cleanedOrderId)
    .select('id')
    .maybeSingle()

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Supabase update failed: ${updateError.message}`
    })
  }

  if (!updatedOrder) {
    return null
  }

  const { error: historyError } = await client.from('order_status_history').insert({
    order_id: cleanedOrderId,
    status: normalizedStatus,
    changed_at: new Date().toISOString(),
    note: note?.trim() || null,
    actor: actor.trim() || 'admin'
  })

  if (historyError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Supabase history update failed: ${historyError.message}`
    })
  }

  const [order] = await fetchOrders(event, { id: cleanedOrderId })
  return order || null
}
