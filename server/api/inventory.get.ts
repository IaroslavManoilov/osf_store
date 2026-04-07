import { getQuery } from 'h3'
import { readInventory } from '../utils/inventory'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const productId = typeof query.productId === 'string' ? query.productId.trim() : ''
  const inventory = await readInventory(event, productId || undefined)

  return {
    success: true,
    ...inventory
  }
})

