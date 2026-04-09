import { defineEventHandler, getQuery } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { readAdminAuditLog } from '../../utils/audit-log'
import { assertRateLimit } from '../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-audit-get',
    limit: 120,
    windowMs: 60 * 1000
  })

  const query = getQuery(event)
  const limit = Number(query.limit || 150)
  const entries = await readAdminAuditLog(event, limit)

  return {
    success: true,
    entries
  }
})

