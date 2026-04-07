import { clearAdminSessionCookie, requireAdminCsrf } from '../../../utils/admin-session'

export default defineEventHandler(async (event) => {
  try {
    requireAdminCsrf(event)
  } catch {
    // Even if CSRF/session already invalid, force cookie removal.
  }
  clearAdminSessionCookie(event)
  return {
    success: true
  }
})
