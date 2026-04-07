import { createError, deleteCookie, getCookie, H3Event, setCookie } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'

const ADMIN_COOKIE = 'osf_admin_session'
const SESSION_TTL_SECONDS = 30 * 60

type SessionPayload = {
  actor: string
  exp: number
}

const toBase64Url = (value: string) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : ''
  return Buffer.from(normalized + pad, 'base64').toString('utf8')
}

const sign = (payloadPart: string, adminKey: string) =>
  createHmac('sha256', adminKey).update(payloadPart).digest('base64url')

export const createAdminSessionToken = (adminKey: string, actor: string) => {
  const payload: SessionPayload = {
    actor: (actor || 'Owner').trim() || 'Owner',
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  }

  const payloadPart = toBase64Url(JSON.stringify(payload))
  const signature = sign(payloadPart, adminKey)
  return `${payloadPart}.${signature}`
}

const parseAndVerifyToken = (token: string, adminKey: string): SessionPayload | null => {
  const [payloadPart, signature] = token.split('.')
  if (!payloadPart || !signature) return null

  const expectedSignature = sign(payloadPart, adminKey)
  const expectedBuffer = Buffer.from(expectedSignature)
  const actualBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== actualBuffer.length) return null
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null

  try {
    const raw = fromBase64Url(payloadPart)
    const parsed = JSON.parse(raw) as Partial<SessionPayload>

    if (typeof parsed.exp !== 'number' || !Number.isFinite(parsed.exp)) return null
    if (parsed.exp <= Math.floor(Date.now() / 1000)) return null

    return {
      actor: typeof parsed.actor === 'string' && parsed.actor.trim() ? parsed.actor.trim() : 'Owner',
      exp: parsed.exp
    }
  } catch {
    return null
  }
}

export const setAdminSessionCookie = (event: H3Event, token: string) => {
  setCookie(event, ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  })
}

export const clearAdminSessionCookie = (event: H3Event) => {
  deleteCookie(event, ADMIN_COOKIE, {
    path: '/'
  })
}

export const requireAdminSession = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const adminKey = String(config.adminKey || '').trim()

  if (!adminKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin key is not configured'
    })
  }

  const token = getCookie(event, ADMIN_COOKIE) || ''
  const payload = parseAndVerifyToken(token, adminKey)

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return payload
}

