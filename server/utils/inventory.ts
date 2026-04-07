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

export const setInventoryForProduct = async (
  event: H3Event,
  productId: string,
  sizes: Record<string, number>
) => {
  const id = String(productId || '').trim()
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is required'
    })
  }

  const allowedSizes = ['S', 'M', 'L'] as const
  const payload = allowedSizes.map((size) => {
    const raw = Number(sizes?.[size] ?? 0)
    const quantity = Number.isFinite(raw) ? Math.floor(raw) : 0

    if (quantity < 0 || quantity > 9999) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid quantity for size ${size}`
      })
    }

    return {
      product_id: id,
      size,
      quantity
    }
  })

  const supabase = getSupabaseAdmin(event)
  const { error } = await supabase
    .from('product_inventory')
    .upsert(payload, { onConflict: 'product_id,size' })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory update failed: ${error.message}`
    })
  }
}
