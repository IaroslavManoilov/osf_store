import { createHash, timingSafeEqual, randomInt } from 'node:crypto'

const normalizePhone = (value: string) => String(value || '').replace(/\D/g, '')

const getOtpSecret = (event: Parameters<typeof useRuntimeConfig>[0]) => {
  const cfg = useRuntimeConfig(event)
  return cfg.orderOtpSecret || cfg.orderTrackSecret || cfg.adminKey || 'osf-order-otp-secret'
}

export const normalizeOrderOtpPhone = normalizePhone

export const generateOrderOtpCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0')

export const hashOrderOtpCode = (
  event: Parameters<typeof useRuntimeConfig>[0],
  orderId: string,
  phone: string,
  code: string
) => {
  const secret = getOtpSecret(event)
  const payload = `${String(orderId || '').trim()}:${normalizePhone(phone)}:${String(code || '').trim()}:${secret}`
  return createHash('sha256').update(payload).digest('base64url')
}

export const verifyOrderOtpCodeHash = (
  expectedHash: string,
  providedCode: string,
  event: Parameters<typeof useRuntimeConfig>[0],
  orderId: string,
  phone: string
) => {
  const computed = hashOrderOtpCode(event, orderId, phone, providedCode)
  const a = Buffer.from(String(expectedHash || ''))
  const b = Buffer.from(computed)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
