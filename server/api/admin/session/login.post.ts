import { createError, readBody } from 'h3'
import { assertAdminKey } from '../../../utils/admin-auth'
import { createAdminSession, setAdminSessionCookie } from '../../../utils/admin-session'
import { assertRateLimit } from '../../../utils/rate-limit'
import { writeAdminAuditLog } from '../../../utils/audit-log'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'admin-login',
    limit: 10,
    windowMs: 60 * 1000
  })

  const config = useRuntimeConfig(event)
  const body = await readBody<{ key?: string; actor?: string }>(event)

  const key = String(body?.key || '').trim()
  const actor = String(body?.actor || 'Owner').trim() || 'Owner'

  if (!key) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Enter admin key'
    })
  }

  assertAdminKey(event, key)

  const adminKey = String(config.adminKey || '').trim()
  const session = createAdminSession(adminKey, actor)
  setAdminSessionCookie(event, session.token)
  await writeAdminAuditLog(event, {
    actor,
    action: 'admin.login',
    targetType: 'session'
  })

  return {
    success: true,
    actor,
    csrfToken: session.csrfToken
  }
})
