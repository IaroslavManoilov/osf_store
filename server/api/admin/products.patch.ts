import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { readProductOverrides, upsertProductOverrides, type ProductOverridePatch } from '../../utils/product-overrides'
import { writeAdminAuditLog } from '../../utils/audit-log'
import { assertRateLimit } from '../../utils/rate-limit'

type BodyPayload = {
  rows?: ProductOverridePatch[]
}

export default defineEventHandler(async (event) => {
  const { actor } = requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-products-patch',
    limit: 30,
    windowMs: 60 * 1000
  })

  const body = await readBody<BodyPayload>(event)
  const rows = Array.isArray(body?.rows) ? body.rows : []
  if (!rows.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No product rows provided'
    })
  }

  if (rows.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Too many product rows in one request'
    })
  }

  await upsertProductOverrides(event, rows, actor)
  await writeAdminAuditLog(event, {
    actor,
    action: 'products.bulk_update',
    targetType: 'product',
    details: {
      count: rows.length,
      ids: rows.map((item) => item.productId).slice(0, 50)
    }
  })

  const nextRows = await readProductOverrides(event)

  return {
    success: true,
    rows: nextRows
  }
})

