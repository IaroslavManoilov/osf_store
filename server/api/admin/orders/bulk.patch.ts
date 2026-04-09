import { createError, defineEventHandler, readBody } from 'h3'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { requireAdminCsrf } from '../../../utils/admin-session'
import { reserveInventory, restoreInventory } from '../../../utils/inventory'
import { assertRateLimit } from '../../../utils/rate-limit'
import { writeAdminAuditLog } from '../../../utils/audit-log'

type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'assembled'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

const validStatuses: OrderStatus[] = [
  'new',
  'confirmed',
  'assembled',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
]

type Body = {
  orderIds?: string[]
  status?: OrderStatus
  note?: string
}

const isFinalStockStatus = (status: OrderStatus) => status === 'cancelled' || status === 'returned'

export default defineEventHandler(async (event) => {
  const { actor } = requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-order-status-bulk-patch',
    limit: 20,
    windowMs: 60 * 1000
  })

  const body = await readBody<Body>(event)
  const nextStatus = body?.status
  const note = String(body?.note || '').trim()
  const orderIds = Array.isArray(body?.orderIds)
    ? Array.from(new Set(body.orderIds.map((id) => String(id || '').trim()).filter(Boolean))).slice(0, 120)
    : []

  if (!orderIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one order id is required'
    })
  }
  if (!nextStatus || !validStatuses.includes(nextStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid order status'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const updatedIds: string[] = []
  const failed: Array<{ orderId: string; reason: string }> = []

  for (const orderId of orderIds) {
    try {
      const { data: existingOrder, error: existingOrderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (existingOrderError || !existingOrder) {
        failed.push({
          orderId,
          reason: 'Order not found'
        })
        continue
      }

      const previousStatus = String(existingOrder.status || '') as OrderStatus
      if (!validStatuses.includes(previousStatus)) {
        failed.push({
          orderId,
          reason: 'Current status is invalid'
        })
        continue
      }

      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

      if (orderItemsError) {
        failed.push({
          orderId,
          reason: orderItemsError.message
        })
        continue
      }

      const inventoryItems = (orderItems || [])
        .filter((item: any) => !!item?.selected_size)
        .map((item: any) => ({
          productId: String(item.product_id || ''),
          size: String(item.selected_size || ''),
          quantity: Number(item.quantity || 0)
        }))
        .filter((item) => !!item.productId && !!item.size && item.quantity > 0)

      const shouldRestoreStock = isFinalStockStatus(nextStatus) && !isFinalStockStatus(previousStatus)
      const shouldReserveStock = !isFinalStockStatus(nextStatus) && isFinalStockStatus(previousStatus)

      if (shouldRestoreStock && inventoryItems.length) {
        await restoreInventory(event, inventoryItems, {
          actor,
          source: 'admin_status_bulk',
          reason: `bulk ${previousStatus} -> ${nextStatus} (${orderId})`
        })
      }

      if (shouldReserveStock && inventoryItems.length) {
        await reserveInventory(event, inventoryItems, {
          actor,
          source: 'admin_status_bulk',
          reason: `bulk ${previousStatus} -> ${nextStatus} (${orderId})`
        })
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: nextStatus
        })
        .eq('id', orderId)

      if (updateError) {
        if (shouldRestoreStock && inventoryItems.length) {
          await reserveInventory(event, inventoryItems, {
            actor: 'system',
            source: 'admin_status_bulk_rollback',
            reason: `rollback ${previousStatus} <- ${nextStatus} (${orderId})`
          })
        }

        if (shouldReserveStock && inventoryItems.length) {
          await restoreInventory(event, inventoryItems, {
            actor: 'system',
            source: 'admin_status_bulk_rollback',
            reason: `rollback ${previousStatus} <- ${nextStatus} (${orderId})`
          })
        }

        failed.push({
          orderId,
          reason: updateError.message
        })
        continue
      }

      const historyNote = note || `${previousStatus} -> ${nextStatus} (bulk)`
      const { error: historyInsertError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: nextStatus,
          changed_at: new Date().toISOString(),
          note: historyNote,
          actor
        })

      if (historyInsertError) {
        failed.push({
          orderId,
          reason: historyInsertError.message
        })
        continue
      }

      updatedIds.push(orderId)
    } catch (error) {
      failed.push({
        orderId,
        reason: String((error as any)?.statusMessage || (error as any)?.message || error)
      })
    }
  }

  await writeAdminAuditLog(event, {
    actor,
    action: 'order.status_bulk_update',
    targetType: 'order',
    targetId: updatedIds.length ? updatedIds.join(',') : undefined,
    details: {
      nextStatus,
      note: note || null,
      requestedCount: orderIds.length,
      updatedCount: updatedIds.length,
      failed
    }
  })

  return {
    success: true,
    updatedIds,
    failed
  }
})
