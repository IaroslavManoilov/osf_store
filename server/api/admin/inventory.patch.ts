import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { readInventory, readInventoryHistory, setInventoryForProduct } from '../../utils/inventory'
import { assertRateLimit } from '../../utils/rate-limit'
import { writeAdminAuditLog } from '../../utils/audit-log'

type InventoryPatchBody = {
  productId?: string
  sizes?: Record<string, number>
}

export default defineEventHandler(async (event) => {
  const { actor } = requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-inventory-patch',
    limit: 40,
    windowMs: 60 * 1000
  })

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
  await writeAdminAuditLog(event, {
    actor,
    action: 'inventory.update',
    targetType: 'product',
    targetId: productId,
    details: {
      sizes
    }
  })

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
