import { createError, defineEventHandler, readBody } from 'h3'
import { restoreInventory } from '../../utils/inventory'
import { verifyOrderTrackToken } from '../../utils/order-track-token'
import { patchOrderStatus, readOrderById } from '../../utils/order-storage'
import { assertRateLimit } from '../../utils/rate-limit'

type CancelPayload = {
  orderId?: string
  token?: string
}

const toPublicOrder = (order: NonNullable<Awaited<ReturnType<typeof readOrderById>>>) => ({
  id: order.id,
  createdAt: order.createdAt,
  status: order.status,
  total: order.total,
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
    namespace: 'order-cancel',
    limit: 12,
    windowMs: 60 * 1000
  })

  const body = await readBody<CancelPayload>(event)
  const orderId = String(body?.orderId || '').trim()
  const token = String(body?.token || '').trim()

  if (!orderId || !token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID and token are required'
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
  const tokenIsValid = verifyOrderTrackToken(secret, order.id, order.customer.phone, token)
  if (!tokenIsValid) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid order token'
    })
  }

  if (order.status === 'cancelled') {
    return {
      success: true,
      order: toPublicOrder(order)
    }
  }

  if (order.status !== 'new' && order.status !== 'confirmed') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Order can no longer be cancelled'
    })
  }

  const restoreItems = order.items
    .filter((item) => !!item.selectedSize)
    .map((item) => ({
      productId: item.id,
      size: String(item.selectedSize || ''),
      quantity: Number(item.quantity || 1)
    }))

  if (restoreItems.length) {
    await restoreInventory(event, restoreItems, {
      actor: 'customer',
      source: 'order_cancel',
      reason: `customer cancel ${order.id}`
    })
  }

  const updated = await patchOrderStatus(
    event,
    order.id,
    'cancelled',
    'Cancelled by customer in order tracking',
    'customer'
  )

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update order status'
    })
  }

  return {
    success: true,
    order: toPublicOrder(updated)
  }
})
