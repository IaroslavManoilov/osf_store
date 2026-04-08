import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { readInventory, readInventoryHistory, setInventoryForProduct } from '../../utils/inventory'

type InventoryPatchBody = {
  productId?: string
  sizes?: Record<string, number>
}

export default defineEventHandler(async (event) => {
  const { actor } = requireAdminCsrf(event)

  const body = await readBody<InventoryPatchBody>(event)
  const productId = String(body?.productId || '').trim()
  const sizes = body?.sizes || {}

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is required'
    })
  }

  await setInventoryForProduct(event, productId, sizes, actor)

  const [inventory, history] = await Promise.all([
    readInventory(event, productId),
    readInventoryHistory(event, 80)
  ])

  return {
    success: true,
    productId,
    ...inventory,
    ...history
  }
})
