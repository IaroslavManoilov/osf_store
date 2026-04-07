import {
  createError,
  defineEventHandler,
  readBody
} from 'h3'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { requireAdminCsrf } from '../../../utils/admin-session'

type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

const validStatuses: OrderStatus[] = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
]

export default defineEventHandler(async (event) => {
  const { actor } = requireAdminCsrf(event)

  const orderId = String(event.context.params?.id || '').trim()
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order id is required'
    })
  }

  const body = await readBody<{ status?: OrderStatus; note?: string }>(event)
  const nextStatus = body?.status

  if (!nextStatus || !validStatuses.includes(nextStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid order status'
    })
  }

  const supabase = getSupabaseAdmin(event)

  const { data: existingOrder, error: existingOrderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (existingOrderError || !existingOrder) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: nextStatus
    })
    .eq('id', orderId)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    })
  }

  const note = body?.note?.trim() || `${existingOrder.status} -> ${nextStatus}`

  const { error: historyInsertError } = await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: nextStatus,
      changed_at: new Date().toISOString(),
      note,
      actor
    })

  if (historyInsertError) {
    throw createError({
      statusCode: 500,
      statusMessage: historyInsertError.message
    })
  }

  const { data: updatedOrder, error: updatedOrderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (updatedOrderError || !updatedOrder) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load updated order'
    })
  }

  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (orderItemsError) {
    throw createError({
      statusCode: 500,
      statusMessage: orderItemsError.message
    })
  }

  const { data: statusHistory, error: statusHistoryError } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('changed_at', { ascending: false })

  if (statusHistoryError) {
    throw createError({
      statusCode: 500,
      statusMessage: statusHistoryError.message
    })
  }

  return {
    success: true,
    order: {
      id: String(updatedOrder.id),
      createdAt: updatedOrder.created_at,
      customer: {
        name: updatedOrder.customer_name || '',
        phone: updatedOrder.customer_phone || '',
        email: updatedOrder.customer_email || '',
        address: updatedOrder.customer_address || '',
        comment: updatedOrder.customer_comment || ''
      },
      items: (orderItems || []).map((item: any) => ({
        id: String(item.id),
        title: item.title || '',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        selectedSize: item.selected_size || ''
      })),
      total: Number(updatedOrder.total || 0),
      status: updatedOrder.status as OrderStatus,
      statusHistory: (statusHistory || []).map((entry: any) => ({
        status: entry.status as OrderStatus,
        changedAt: entry.changed_at,
        note: entry.note || '',
        actor: entry.actor || ''
      }))
    }
  }
})
