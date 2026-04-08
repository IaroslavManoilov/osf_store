import { createHmac, timingSafeEqual } from 'node:crypto'

const normalizePhone = (value: string) => value.replace(/\D/g, '')

const toBase64Url = (input: Buffer) =>
  input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const signRaw = (secret: string, payload: string) =>
  toBase64Url(createHmac('sha256', secret).update(payload).digest()).slice(0, 32)

export const createOrderTrackToken = (secret: string, orderId: string, phone: string) => {
  const payload = `${orderId.trim()}:${normalizePhone(phone)}`
  return signRaw(secret, payload)
}

export const verifyOrderTrackToken = (
  secret: string,
  orderId: string,
  phone: string,
  token: string
) => {
  const provided = token.trim()
  if (!provided) return false

  const expected = createOrderTrackToken(secret, orderId, phone)
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)

  if (expectedBuffer.length !== providedBuffer.length) return false
  return timingSafeEqual(expectedBuffer, providedBuffer)
}

export const normalizeOrderPhone = normalizePhone
