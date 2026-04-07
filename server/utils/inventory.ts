import { createError, H3Event } from 'h3'
import { getSupabaseAdmin } from './supabase-admin'

type ReserveItem = {
  productId: string
  size: string
  quantity: number
}

type InventoryRow = {
  product_id: string
  size: string
  quantity: number
}

export const reserveInventory = async (event: H3Event, items: ReserveItem[]) => {
  const supabase = getSupabaseAdmin(event)

  const payload = items.map((item) => ({
    product_id: item.productId,
    size: item.size,
    quantity: item.quantity
  }))

  const { error } = await supabase.rpc('reserve_order_stock', {
    order_items: payload
  })

  if (error) {
    const message = (error.message || '').toLowerCase()
    if (message.includes('out_of_stock') || message.includes('insufficient')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Недостаточно товара на складе'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Inventory reserve failed: ${error.message}`
    })
  }
}

export const restoreInventory = async (event: H3Event, items: ReserveItem[]) => {
  const supabase = getSupabaseAdmin(event)

  const payload = items.map((item) => ({
    product_id: item.productId,
    size: item.size,
    quantity: item.quantity
  }))

  const { error } = await supabase.rpc('restore_order_stock', {
    order_items: payload
  })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory restore failed: ${error.message}`
    })
  }
}

export const readInventory = async (event: H3Event, productId?: string) => {
  const supabase = getSupabaseAdmin(event)
  let query = supabase
    .from('product_inventory')
    .select('product_id, size, quantity')

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data, error } = await query

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory load failed: ${error.message}`
    })
  }

  const rows = (data || []) as InventoryRow[]
  const totals: Record<string, number> = {}
  const bySize: Record<string, Record<string, number>> = {}

  for (const row of rows) {
    const id = String(row.product_id || '')
    const size = String(row.size || '')
    const qty = Number(row.quantity || 0)
    if (!id || !size) continue

    totals[id] = (totals[id] || 0) + qty
    bySize[id] = bySize[id] || {}
    bySize[id][size] = qty
  }

  return { totals, bySize }
}

