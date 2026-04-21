import { defineEventHandler } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireCustomerAuth } from '../../utils/customer-auth'
import { createOrderTrackToken } from '../../utils/order-track-token'

type Row = {
  id: string
  created_at: string
  status: string
  total: number | string
  payment_method?: string | null
  payment_status?: string | null
  customer_phone?: string
  order_items?: Array<{
    product_id: string
    title: string
    quantity: number
    selected_size: string | null
    price: number | string
  }> | null
  order_status_history?: Array<{
    status: string
    changed_at: string
    note: string | null
    actor: string | null
  }> | null
}

const normalizeRows = (rows: Row[], secret: string) =>
  rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    total: Number(row.total) || 0,
    payment: {
      method: String(row.payment_method || 'cash_on_delivery'),
      status: String(row.payment_status || 'pending')
    },
    trackToken: createOrderTrackToken(secret, row.id, String(row.customer_phone || '')),
    items: Array.isArray(row.order_items)
      ? row.order_items.map((item) => ({
          id: String(item.product_id || ''),
          title: String(item.title || ''),
          quantity: Number(item.quantity) || 1,
          selectedSize: item.selected_size || undefined,
          price: Number(item.price) || 0
        }))
      : [],
    statusHistory: Array.isArray(row.order_status_history)
      ? row.order_status_history.map((entry) => ({
          status: String(entry.status || 'new'),
          changedAt: String(entry.changed_at || new Date().toISOString()),
          note: entry.note || undefined,
          actor: entry.actor || undefined
        }))
      : []
  }))

export default defineEventHandler(async (event) => {
  const customer = await requireCustomerAuth(event)
  let supabase: ReturnType<typeof getSupabaseAdmin> | null = null
  try {
    supabase = getSupabaseAdmin(event)
  } catch {
    supabase = null
  }
  const config = useRuntimeConfig(event)
  const secret = config.orderTrackSecret || config.adminKey || 'osf-order-track-secret'

  if (!supabase) {
    return { success: true, degradedMode: true, orders: [] }
  }

  try {
    const modern = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        total,
        payment_method,
        payment_status,
        customer_phone,
        order_items (
          product_id,
          title,
          quantity,
          selected_size,
          price
        ),
        order_status_history (
          status,
          changed_at,
          note,
          actor
        )
      `)
      .eq('customer_user_id', customer.userId)
      .order('created_at', { ascending: false })
      .order('id', { foreignTable: 'order_items', ascending: true })
      .order('changed_at', { foreignTable: 'order_status_history', ascending: false })

    if (!modern.error) {
      const rows = Array.isArray(modern.data) ? (modern.data as unknown as Row[]) : []
      return { success: true, orders: normalizeRows(rows, secret) }
    }
  } catch {
    // Fallback below.
  }

  try {
    // Legacy fallback when relation/columns are not migrated yet.
    const phones = new Set<string>()
    if (customer.phone) phones.add(String(customer.phone).trim())

    const profile = await supabase
      .from('customer_profiles')
      .select('phone')
      .eq('user_id', customer.userId)
      .maybeSingle()
    if (!profile.error && profile.data?.phone) {
      phones.add(String(profile.data.phone).trim())
    }

    let rows: Row[] = []
    for (const phone of phones) {
      if (!phone) continue
      const legacy = await supabase
        .from('orders')
        .select('id, created_at, status, total, customer_phone')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false })
      if (!legacy.error) {
        rows = Array.isArray(legacy.data) ? (legacy.data as unknown as Row[]) : []
        break
      }
    }

    return { success: true, orders: normalizeRows(rows, secret) }
  } catch {
    // Hard-safe mode: never break whole site because of account orders query.
    return { success: true, orders: [] }
  }
})
