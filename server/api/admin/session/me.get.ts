import { requireAdminSession } from '../../../utils/admin-session'
import { assertRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'admin-session-me',
    limit: 120,
    windowMs: 60 * 1000
  })

  const session = requireAdminSession(event)

  return {
    success: true,
    actor: session.actor,
    csrfToken: session.csrf
  }
})
