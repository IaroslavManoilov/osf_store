import { getQuery } from 'h3'
import { assertAdminAccess } from '../../utils/admin-auth'
import { readOrders } from '../../utils/order-storage'

export default defineEventHandler(async (event) => {
  assertAdminAccess(event)

  const query = getQuery(event)
  const status = typeof query.status === 'string' ? query.status.trim() : ''

  const orders = await readOrders(event, status)

  return {
    success: true,
    orders
  }
})
