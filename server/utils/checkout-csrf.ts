import { createError, getCookie, getHeader, H3Event, setCookie } from 'h3'
import { randomBytes, timingSafeEqual } from 'node:crypto'

const CHECKOUT_CSRF_COOKIE = 'osf_checkout_csrf'
const CHECKOUT_CSRF_TTL_SECONDS = 2 * 60 * 60

const normalize = (value: string) => String(value || '').trim()

export const issueCheckoutCsrf = (event: H3Event) => {
  const token = randomBytes(24).toString('base64url')

  setCookie(event, CHECKOUT_CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CHECKOUT_CSRF_TTL_SECONDS
  })

  return token
}

export const requireCheckoutCsrf = (event: H3Event) => {
  const cookieToken = normalize(getCookie(event, CHECKOUT_CSRF_COOKIE) || '')
  const headerToken = normalize(getHeader(event, 'x-checkout-csrf') || '')

  if (!cookieToken || !headerToken) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Missing checkout CSRF token'
    })
  }

  const cookieBuffer = Buffer.from(cookieToken)
  const headerBuffer = Buffer.from(headerToken)

  if (cookieBuffer.length !== headerBuffer.length || !timingSafeEqual(cookieBuffer, headerBuffer)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid checkout CSRF token'
    })
  }
}

