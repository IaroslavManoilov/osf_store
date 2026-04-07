import { requireAdminSession } from '../../../utils/admin-session'

export default defineEventHandler(async (event) => {
  const session = requireAdminSession(event)

  return {
    success: true,
    actor: session.actor,
    csrfToken: session.csrf
  }
})
