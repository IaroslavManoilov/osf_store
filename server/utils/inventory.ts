import { createError, H3Event } from 'h3'
import { getSupabaseAdmin } from './supabase-admin'

type ReserveItem = {
  productId: string
  size: string
  quantity: number
}

type InventoryLogMeta = {
  actor?: string
  source?: string
  reason?: string
}

type InventoryRow = {
  product_id: string
  size: string
  quantity: number
}

type InventoryHistoryRow = {
  id: number
  product_id: string
  size: string
  prev_quantity: number
  next_quantity: number
  delta: number
  changed_at: string
  actor: string
  source?: string
  reason?: string
}

type InventoryKey = `${string}::${string}`

const toKey = (productId: string, size: string): InventoryKey => `${productId}::${size}`

const sanitizeMeta = (meta?: InventoryLogMeta, fallbackSource = 'system', fallbackReason = 'stock update') => ({
  actor: String(meta?.actor || 'system').trim() || 'system',
  source: String(meta?.source || fallbackSource).trim() || fallbackSource,
  reason: String(meta?.reason || fallbackReason).trim() || fallbackReason
})

const normalizeReserveItems = (items: ReserveItem[]) => {
  const merged = new Map<InventoryKey, ReserveItem>()

  for (const item of items || []) {
    const productId = String(item?.productId || '').trim()
    const size = String(item?.size || '').trim().toUpperCase()
    const quantityRaw = Number(item?.quantity || 0)
    const quantity = Number.isFinite(quantityRaw) ? Math.max(0, Math.floor(quantityRaw)) : 0
    if (!productId || !size || quantity <= 0) continue

    const key = toKey(productId, size)
    const prev = merged.get(key)
    if (prev) {
      prev.quantity += quantity
    } else {
      merged.set(key, {
        productId,
        size,
        quantity
      })
    }
  }

  return Array.from(merged.values())
}

const readQuantitiesByItems = async (event: H3Event, items: ReserveItem[]) => {
  const supabase = getSupabaseAdmin(event)
  const ids = Array.from(new Set(items.map((item) => item.productId)))
  const sizes = Array.from(new Set(items.map((item) => item.size)))

  if (!ids.length || !sizes.length) {
    return new Map<InventoryKey, number>()
  }

  const { data, error } = await supabase
    .from('product_inventory')
    .select('product_id, size, quantity')
    .in('product_id', ids)
    .in('size', sizes)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory snapshot failed: ${error.message}`
    })
  }

  const map = new Map<InventoryKey, number>()
  for (const row of (data || []) as InventoryRow[]) {
    const productId = String(row.product_id || '').trim()
    const size = String(row.size || '').trim().toUpperCase()
    const quantity = Number(row.quantity || 0)
    if (!productId || !size) continue
    map.set(toKey(productId, size), Number.isFinite(quantity) ? quantity : 0)
  }

  return map
}

const writeInventoryLog = async (
  event: H3Event,
  rows: Array<{
    productId: string
    size: string
    prevQuantity: number
    nextQuantity: number
    delta: number
  }>,
  meta?: InventoryLogMeta
) => {
  if (!rows.length) return

  const supabase = getSupabaseAdmin(event)
  const safeMeta = sanitizeMeta(meta)

  const payload = rows
    .filter((row) => row.delta !== 0)
    .map((row) => ({
      product_id: row.productId,
      size: row.size,
      prev_quantity: row.prevQuantity,
      next_quantity: row.nextQuantity,
      delta: row.delta,
      actor: safeMeta.actor,
      source: safeMeta.source,
      reason: safeMeta.reason
    }))

  if (!payload.length) return

  const { error } = await supabase
    .from('inventory_change_log')
    .insert(payload)

  if (!error) return

  const message = String(error.message || '').toLowerCase()
  if (!(message.includes('source') || message.includes('reason'))) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory audit write failed: ${error.message}`
    })
  }

  const fallbackPayload = payload.map(({ source: _source, reason: _reason, ...rest }) => rest)
  const { error: fallbackError } = await supabase
    .from('inventory_change_log')
    .insert(fallbackPayload)

  if (fallbackError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory audit write failed: ${fallbackError.message}`
    })
  }
}

export const reserveInventory = async (event: H3Event, items: ReserveItem[], meta?: InventoryLogMeta) => {
  const normalized = normalizeReserveItems(items)
  if (!normalized.length) return

  const beforeQty = await readQuantitiesByItems(event, normalized)
  const supabase = getSupabaseAdmin(event)

  const payload = normalized.map((item) => ({
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

  const afterQty = await readQuantitiesByItems(event, normalized)
  const logRows = normalized.map((item) => {
    const key = toKey(item.productId, item.size)
    const prev = Number(beforeQty.get(key) || 0)
    const next = Number(afterQty.get(key) || 0)
    return {
      productId: item.productId,
      size: item.size,
      prevQuantity: prev,
      nextQuantity: next,
      delta: next - prev
    }
  })

  await writeInventoryLog(event, logRows, sanitizeMeta(meta, 'reserve', 'order reserve'))
}

export const restoreInventory = async (event: H3Event, items: ReserveItem[], meta?: InventoryLogMeta) => {
  const normalized = normalizeReserveItems(items)
  if (!normalized.length) return

  const beforeQty = await readQuantitiesByItems(event, normalized)
  const supabase = getSupabaseAdmin(event)

  const payload = normalized.map((item) => ({
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

  const afterQty = await readQuantitiesByItems(event, normalized)
  const logRows = normalized.map((item) => {
    const key = toKey(item.productId, item.size)
    const prev = Number(beforeQty.get(key) || 0)
    const next = Number(afterQty.get(key) || 0)
    return {
      productId: item.productId,
      size: item.size,
      prevQuantity: prev,
      nextQuantity: next,
      delta: next - prev
    }
  })

  await writeInventoryLog(event, logRows, sanitizeMeta(meta, 'restore', 'stock return'))
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
  sizes: Record<string, number>,
  actor = 'admin'
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
  const { data: existingRows, error: existingError } = await supabase
    .from('product_inventory')
    .select('size, quantity')
    .eq('product_id', id)

  if (existingError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory load before update failed: ${existingError.message}`
    })
  }

  const prevBySize: Record<string, number> = {}
  for (const row of existingRows || []) {
    const size = String((row as any).size || '')
    prevBySize[size] = Number((row as any).quantity || 0)
  }

  const { error } = await supabase
    .from('product_inventory')
    .upsert(payload, { onConflict: 'product_id,size' })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory update failed: ${error.message}`
    })
  }

  const historyPayload = payload
    .map((row) => {
      const prev = Number(prevBySize[row.size] || 0)
      const next = Number(row.quantity || 0)
      const delta = next - prev

      return {
        product_id: id,
        size: row.size,
        prev_quantity: prev,
        next_quantity: next,
        delta,
        actor: actor.trim() || 'admin'
      }
    })
    .filter((row) => row.delta !== 0)

  await writeInventoryLog(
    event,
    historyPayload.map((row) => ({
      productId: row.product_id,
      size: row.size,
      prevQuantity: row.prev_quantity,
      nextQuantity: row.next_quantity,
      delta: row.delta
    })),
    {
      actor,
      source: 'admin_manual',
      reason: 'manual stock edit'
    }
  )
}

export const readInventoryHistory = async (event: H3Event, limit = 80) => {
  const supabase = getSupabaseAdmin(event)
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(300, Math.floor(limit))) : 80

  const primaryQuery = await supabase
    .from('inventory_change_log')
    .select('id, product_id, size, prev_quantity, next_quantity, delta, changed_at, actor, source, reason')
    .order('changed_at', { ascending: false })
    .limit(safeLimit)

  let rows = primaryQuery.data as InventoryHistoryRow[] | null
  let error = primaryQuery.error

  if (error) {
    const message = String(error.message || '').toLowerCase()
    const columnsMissing = message.includes('source') || message.includes('reason')
    if (!columnsMissing) {
      throw createError({
        statusCode: 500,
        statusMessage: `Inventory history load failed: ${error.message}`
      })
    }

    const fallbackQuery = await supabase
      .from('inventory_change_log')
      .select('id, product_id, size, prev_quantity, next_quantity, delta, changed_at, actor')
      .order('changed_at', { ascending: false })
      .limit(safeLimit)

    rows = fallbackQuery.data as InventoryHistoryRow[] | null
    error = fallbackQuery.error
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Inventory history load failed: ${error.message}`
    })
  }

  return {
    history: ((rows || []) as InventoryHistoryRow[]).map((row) => ({
      id: Number(row.id),
      productId: String(row.product_id || ''),
      size: String(row.size || ''),
      prevQuantity: Number(row.prev_quantity || 0),
      nextQuantity: Number(row.next_quantity || 0),
      delta: Number(row.delta || 0),
      changedAt: String(row.changed_at || ''),
      actor: String(row.actor || ''),
      source: String(row.source || ''),
      reason: String(row.reason || '')
    }))
  }
}
