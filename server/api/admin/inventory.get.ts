import { defineEventHandler } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { readInventory, readInventoryHistory } from '../../utils/inventory'

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)

  const [inventory, history] = await Promise.all([
    readInventory(event),
    readInventoryHistory(event, 80)
  ])

  return {
    success: true,
    ...inventory,
    ...history
  }
})
