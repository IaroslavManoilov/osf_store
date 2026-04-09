import { clearAdminSessionCookie, requireAdminCsrf } from '../../../utils/admin-session'
import { writeAdminAuditLog } from '../../../utils/audit-log'

export default defineEventHandler(async (event) => {
  let actor = 'admin'
  try {
    actor = requireAdminCsrf(event).actor
  } catch {
    // Even if CSRF/session already invalid, force cookie removal.
  }
  clearAdminSessionCookie(event)
  await writeAdminAuditLog(event, {
    actor,
    action: 'admin.logout',
    targetType: 'session'
  })
  return {
    success: true
  }
})
