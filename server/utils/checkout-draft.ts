import { getCookie, setCookie, type H3Event } from 'h3'

export const CHECKOUT_DRAFT_COOKIE = 'osf_checkout_draft_key'

const buildDraftKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `draft_${crypto.randomUUID()}`
  }
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export const getOrCreateCheckoutDraftKey = (event: H3Event) => {
  const existing = String(getCookie(event, CHECKOUT_DRAFT_COOKIE) || '').trim()
  if (existing) return existing

  const created = buildDraftKey()
  setCookie(event, CHECKOUT_DRAFT_COOKIE, created, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90
  })
  return created
}

export const normalizeCheckoutDraftPhone = (value: unknown) =>
  String(value || '')
    .replace(/[^\d+]/g, '')
    .slice(0, 22)
