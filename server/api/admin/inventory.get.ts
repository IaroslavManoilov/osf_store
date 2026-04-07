import { defineEventHandler } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { readInventory } from '../../utils/inventory'

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)

  const inventory = await readInventory(event)

  return {
    success: true,
    ...inventory
  }
})
