import { clearAdminSessionCookie } from '../../../utils/admin-session'

export default defineEventHandler(async (event) => {
  clearAdminSessionCookie(event)
  return {
    success: true
  }
})
