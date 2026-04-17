import { createError, defineEventHandler } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireCustomerAuth } from '../../utils/customer-auth'
import { createOrderTrackToken } from '../../utils/order-track-token'

type Row = {
  id: string
  created_at: string
  status: string
  total: number | string
  payment_method: string | null
  payment_status: string | null
  customer_phone: string
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

export default defineEventHandler(async (event) => {
  const customer = await requireCustomerAuth(event)
  const supabase = getSupabaseAdmin(event)

  const modernSelect = `
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
  `

  const userSelect = await supabase
    .from('orders')
    .select(modernSelect)
    .eq('customer_user_id', customer.userId)
    .order('created_at', { ascending: false })
    .order('id', { foreignTable: 'order_items', ascending: true })
    .order('changed_at', { foreignTable: 'order_status_history', ascending: false })

  let data: Row[] | null = Array.isArray(userSelect.data) ? (userSelect.data as any as Row[]) : []
  let error = userSelect.error

  // Fallback: older DB schema may miss relations/columns from modern query.
  if (error) {
    const byUserLite = await supabase
      .from('orders')
      .select('id, created_at, status, total, payment_method, payment_status, customer_phone')
      .eq('customer_user_id', customer.userId)
      .order('created_at', { ascending: false })

    data = Array.isArray(byUserLite.data) ? (byUserLite.data as any as Row[]) : []
    error = byUserLite.error
  }

  // Legacy fallback: very old schema may not have customer_user_id yet.
  if (error) {
    let profilePhone = ''
    const profile = await supabase
      .from('customer_profiles')
      .select('phone')
      .eq('user_id', customer.userId)
      .maybeSingle()
    if (!profile.error) {
      profilePhone = String(profile.data?.phone || '').trim()
    }

    const phoneCandidates = Array.from(new Set([String(customer.phone || '').trim(), profilePhone].filter(Boolean)))
    let legacyData: Row[] = []
    let legacyError: any = null

    for (const phone of phoneCandidates) {
      const legacy = await supabase
        .from('orders')
        .select('id, created_at, status, total, customer_phone')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false })

      if (!legacy.error) {
        legacyData = Array.isArray(legacy.data) ? (legacy.data as any as Row[]) : []
        legacyError = null
        break
      }
      legacyError = legacy.error
    }

    if (!phoneCandidates.length) {
      legacyData = []
      legacyError = null
    }

    data = legacyData
    error = legacyError
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Orders load failed: ${error.message}`
    })
  }

  const config = useRuntimeConfig(event)
  const secret = config.orderTrackSecret || config.adminKey || 'osf-order-track-secret'
  const rows = Array.isArray(data) ? (data as Row[]) : []

  return {
    success: true,
    orders: rows.map((row) => ({
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
  }
})
