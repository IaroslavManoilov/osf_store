import { createError, defineEventHandler, readBody } from 'h3'
import { readOrderById } from '../../utils/order-storage'
import { normalizeOrderPhone, verifyOrderTrackToken } from '../../utils/order-track-token'
import { assertRateLimit } from '../../utils/rate-limit'

type LookupPayload = {
  orderId?: string
  phone?: string
  token?: string
}

const toPublicOrder = (order: NonNullable<Awaited<ReturnType<typeof readOrderById>>>) => ({
  id: order.id,
  createdAt: order.createdAt,
  status: order.status,
  total: order.total,
  customer: {
    name: order.customer.name
  },
  items: order.items.map((item) => ({
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    price: item.price
  })),
  statusHistory: order.statusHistory
})

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'order-lookup',
    limit: 20,
    windowMs: 60 * 1000
  })

  const body = await readBody<LookupPayload>(event)
  const orderId = String(body?.orderId || '').trim()
  const phone = String(body?.phone || '').trim()
  const token = String(body?.token || '').trim()

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }

  const order = await readOrderById(event, orderId)
  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  const config = useRuntimeConfig(event)
  const secret = config.orderTrackSecret || config.adminKey || 'osf-order-track-secret'

  const tokenIsValid = token
    ? verifyOrderTrackToken(secret, order.id, order.customer.phone, token)
    : false
  const phoneMatches = phone
    ? normalizeOrderPhone(phone) === normalizeOrderPhone(order.customer.phone)
    : false

  if (!tokenIsValid && !phoneMatches) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Phone or token does not match this order'
    })
  }

  return {
    success: true,
    order: toPublicOrder(order)
  }
})
