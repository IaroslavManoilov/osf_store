import { createError, getHeader, getQuery, getRequestIP, H3Event } from 'h3'

type AttemptState = {
  fails: number
  blockedUntil: number
}

const MAX_FAILS = 5
const BLOCK_MS = 5 * 60 * 1000
const attempts = new Map<string, AttemptState>()

function getAttemptKey(event: H3Event) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const ua = getHeader(event, 'user-agent') || 'unknown'
  return `${ip}:${ua.slice(0, 80)}`
}

export function assertAdminAccess(event: H3Event) {
  const config = useRuntimeConfig(event)
  const expectedKey = (config.adminKey || '').trim()

  if (!expectedKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin key is not configured'
    })
  }

  const attemptKey = getAttemptKey(event)
  const now = Date.now()
  const state = attempts.get(attemptKey)

  if (state && state.blockedUntil > now) {
    const retryMinutes = Math.max(1, Math.ceil((state.blockedUntil - now) / 60_000))
    throw createError({
      statusCode: 429,
      statusMessage: `Too many attempts. Retry in ${retryMinutes} minute(s).`
    })
  }

  const query = getQuery(event)
  const headerKey = getHeader(event, 'x-admin-key') || ''
  const queryKey = typeof query.key === 'string' ? query.key : ''
  const providedKey = (headerKey || queryKey).trim()

  if (!providedKey || providedKey !== expectedKey) {
    const nextFails = (state?.fails || 0) + 1
    const nextState: AttemptState = {
      fails: nextFails,
      blockedUntil: nextFails >= MAX_FAILS ? now + BLOCK_MS : 0
    }
    attempts.set(attemptKey, nextState)

    if (nextState.blockedUntil > now) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many failed attempts. Access blocked for 5 minutes.'
      })
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  attempts.delete(attemptKey)
}
