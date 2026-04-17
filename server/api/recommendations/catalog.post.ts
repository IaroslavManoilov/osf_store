import { createError, defineEventHandler, readBody } from 'h3'
import { getSupabaseAdminClient } from '../../utils/supabase-admin'

type RequestBody = {
  cartIds?: string[]
  viewedIds?: string[]
}

const ALLOWED_STATUSES = new Set(['confirmed', 'assembled', 'shipped', 'delivered'])

const getRecencyWeight = (createdAt: unknown) => {
  const ms = new Date(String(createdAt || '')).getTime()
  if (!Number.isFinite(ms)) return 0.65

  const daysAgo = Math.max(0, (Date.now() - ms) / (1000 * 60 * 60 * 24))

  if (daysAgo <= 7) return 1.85
  if (daysAgo <= 14) return 1.55
  if (daysAgo <= 30) return 1.3
  if (daysAgo <= 60) return 1
  if (daysAgo <= 90) return 0.8
  return 0.6
}

const normalizeIds = (value: unknown, limit = 12) => {
  if (!Array.isArray(value)) return [] as string[]
  const cleaned = value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
  return Array.from(new Set(cleaned)).slice(0, limit)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event).catch(() => ({} as RequestBody))
  const cartIds = normalizeIds(body?.cartIds, 10)
  const viewedIds = normalizeIds(body?.viewedIds, 10)

  if (!cartIds.length && !viewedIds.length) {
    return {
      success: true,
      togetherIds: [] as string[],
      recommendIds: [] as string[]
    }
  }

  let supabase
  try {
    supabase = getSupabaseAdminClient(event)
  } catch {
    return {
      success: true,
      togetherIds: [] as string[],
      recommendIds: [] as string[]
    }
  }

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString()

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      order_id,
      product_id,
      quantity,
      orders!inner (
        status,
        created_at
      )
    `)
    .gte('orders.created_at', since)
    .limit(5000)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Recommendations query failed: ${error.message}`
    })
  }

  type Row = {
    order_id?: string
    product_id?: string
    quantity?: number
    orders?: {
      status?: string
      created_at?: string
    }
  }

  const rows = Array.isArray(data) ? (data as Row[]) : []
  const orderToProducts = new Map<string, { products: Set<string>; weight: number }>()
  const popularity = new Map<string, number>()

  for (const row of rows) {
    const status = String(row?.orders?.status || '').trim()
    if (!ALLOWED_STATUSES.has(status)) continue

    const orderId = String(row?.order_id || '').trim()
    const productId = String(row?.product_id || '').trim()
    if (!orderId || !productId) continue
    const recencyWeight = getRecencyWeight(row?.orders?.created_at)
    const qty = Math.max(1, Number(row?.quantity || 1))

    if (!orderToProducts.has(orderId)) {
      orderToProducts.set(orderId, {
        products: new Set(),
        weight: recencyWeight
      })
    }
    const meta = orderToProducts.get(orderId)!
    meta.products.add(productId)
    meta.weight = Math.max(meta.weight, recencyWeight)
    popularity.set(productId, (popularity.get(productId) || 0) + qty * recencyWeight)
  }

  const cartSet = new Set(cartIds)
  const viewedSet = new Set(viewedIds)
  const togetherScore = new Map<string, number>()
  const recommendScore = new Map<string, number>()

  for (const orderMeta of orderToProducts.values()) {
    const ids = Array.from(orderMeta.products)
    const orderWeight = orderMeta.weight
    const cartMatches = ids.filter((id) => cartSet.has(id)).length
    const viewedMatches = ids.filter((id) => viewedSet.has(id)).length

    for (const id of ids) {
      if (!cartSet.has(id) && cartMatches > 0) {
        togetherScore.set(id, (togetherScore.get(id) || 0) + cartMatches * orderWeight)
      }
      if (!cartSet.has(id) && viewedMatches > 0) {
        recommendScore.set(id, (recommendScore.get(id) || 0) + viewedMatches * orderWeight)
      }
    }
  }

  const sortedTogether = Array.from(togetherScore.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 8)

  const sortedRecommend = Array.from(recommendScore.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)

  const fallbackPopular = Array.from(popularity.entries())
    .filter(([id]) => !cartSet.has(id))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)

  const recommendIds = Array.from(new Set([...sortedRecommend, ...sortedTogether, ...fallbackPopular])).slice(0, 8)

  return {
    success: true,
    togetherIds: sortedTogether,
    recommendIds
  }
})
