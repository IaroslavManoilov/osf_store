import { createError, readBody } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { readOrderById } from '../../utils/order-storage'
import { verifyOrderTrackToken } from '../../utils/order-track-token'
import { assertRateLimit } from '../../utils/rate-limit'

type SavedTrack = {
  id?: string
  token?: string
}

type Payload = {
  orders?: SavedTrack[]
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'reviews-pending',
    limit: 40,
    windowMs: 60 * 1000
  })

  const body = await readBody<Payload>(event)
  const tracks = Array.isArray(body?.orders) ? body.orders : []
  if (!tracks.length) {
    return { success: true, items: [] }
  }

  const config = useRuntimeConfig(event)
  const secret = config.orderTrackSecret || config.adminKey || 'osf-order-track-secret'

  const validDeliveredOrders: Array<{
    id: string
    productIds: string[]
    createdAt: string
  }> = []

  for (const raw of tracks.slice(0, 30)) {
    const orderId = String(raw?.id || '').trim()
    const token = String(raw?.token || '').trim()
    if (!orderId || !token) continue

    const order = await readOrderById(event, orderId)
    if (!order || order.status !== 'delivered') continue

    const valid = verifyOrderTrackToken(secret, order.id, order.customer.phone, token)
    if (!valid) continue

    validDeliveredOrders.push({
      id: order.id,
      productIds: order.items.map((item) => String(item.id || '').trim()).filter(Boolean),
      createdAt: order.createdAt
    })
  }

  if (!validDeliveredOrders.length) {
    return { success: true, items: [] }
  }

  const orderIds = validDeliveredOrders.map((item) => item.id)
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('product_reviews')
    .select('order_id, product_id')
    .in('order_id', orderIds)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Review pending read failed: ${error.message}`
    })
  }

  const reviewed = new Set(
    (Array.isArray(data) ? data : [])
      .map((row) => `${String((row as any).order_id || '').trim()}::${String((row as any).product_id || '').trim()}`)
      .filter(Boolean)
  )

  const pending: Array<{ orderId: string; productId: string; createdAt: string }> = []
  for (const order of validDeliveredOrders) {
    for (const productId of order.productIds) {
      if (reviewed.has(`${order.id}::${productId}`)) continue
      pending.push({
        orderId: order.id,
        productId,
        createdAt: order.createdAt
      })
    }
  }

  return {
    success: true,
    items: pending.slice(0, 12)
  }
})

