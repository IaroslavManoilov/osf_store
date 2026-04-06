import { createError, getHeader, readBody } from 'h3'
import { assertAdminAccess } from '../../../utils/admin-auth'
import { patchOrderStatus, type AdminOrderStatus } from '../../../utils/order-storage'

type PatchBody = {
  status?: AdminOrderStatus
  note?: string
}

const validStatuses: AdminOrderStatus[] = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
]

export default defineEventHandler(async (event) => {
  assertAdminAccess(event)

  const id = String(event.context.params?.id || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Order id is required' })
  }

  const body = await readBody<PatchBody>(event)
  const status = body?.status

  if (!status || !validStatuses.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const actor = (getHeader(event, 'x-admin-actor') || '').trim() || 'admin'
  const updated = await patchOrderStatus(event, id, status, body?.note, actor)

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  return {
    success: true,
    order: updated
  }
})
