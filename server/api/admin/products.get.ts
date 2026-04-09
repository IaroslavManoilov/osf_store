import { defineEventHandler } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { readProductOverrides } from '../../utils/product-overrides'
import { assertRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-products-get',
    limit: 120,
    windowMs: 60 * 1000
  })

  const rows = await readProductOverrides(event)
  return {
    success: true,
    rows
  }
})

