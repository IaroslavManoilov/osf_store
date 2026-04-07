import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { setInventoryForProduct, readInventory } from '../../utils/inventory'

type InventoryPatchBody = {
  productId?: string
  sizes?: Record<string, number>
}

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)

  const body = await readBody<InventoryPatchBody>(event)
  const productId = String(body?.productId || '').trim()
  const sizes = body?.sizes || {}

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is required'
    })
  }

  await setInventoryForProduct(event, productId, sizes)

  const inventory = await readInventory(event, productId)

  return {
    success: true,
    productId,
    ...inventory
  }
})
