import { defineEventHandler, readBody } from 'h3'
import { readOrderById } from '../../utils/order-storage'
import { verifyOrderTrackToken } from '../../utils/order-track-token'

type TrackedOrderInput = {
  id?: string
  token?: string
}

type Payload = {
  orders?: TrackedOrderInput[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Payload>(event)
  const entries = Array.isArray(body?.orders) ? body.orders : []

  const config = useRuntimeConfig(event)
  const secret = config.orderTrackSecret || config.adminKey || 'osf-order-track-secret'

  const result: Array<{
    id: string
    createdAt: string
    status: string
    total: number
    items: Array<{
      id: string
      title: string
      quantity: number
      selectedSize?: string
      price: number
    }>
    statusHistory: Array<{
      status: string
      changedAt: string
      note?: string
      actor?: string
    }>
  }> = []

  for (const raw of entries.slice(0, 30)) {
    const id = String(raw?.id || '').trim()
    const token = String(raw?.token || '').trim()
    if (!id || !token) continue

    const order = await readOrderById(event, id)
    if (!order) continue

    const valid = verifyOrderTrackToken(secret, order.id, order.customer.phone, token)
    if (!valid) continue

    result.push({
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
  }

  return {
    success: true,
    orders: result
  }
})
