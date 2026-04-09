import { createError, defineEventHandler, readBody } from 'h3'
import { assertRateLimit } from '../../../utils/rate-limit'
import { readOrderById } from '../../../utils/order-storage'
import { createOrderTrackToken, normalizeOrderPhone } from '../../../utils/order-track-token'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { normalizeOrderOtpPhone, verifyOrderOtpCodeHash } from '../../../utils/order-auth-code'

type VerifyOtpPayload = {
  orderId?: string
  phone?: string
  code?: string
}

const toPublicOrder = (order: NonNullable<Awaited<ReturnType<typeof readOrderById>>>) => ({
  id: order.id,
  createdAt: order.createdAt,
  status: order.status,
  total: order.total,
  customer: {
    name: order.customer.name
  },
  items: order.items.map((item) => ({
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    price: item.price
  })),
  statusHistory: order.statusHistory
})

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'order-auth-verify',
    limit: 20,
    windowMs: 10 * 60 * 1000
  })

  const body = await readBody<VerifyOtpPayload>(event)
  const orderId = String(body?.orderId || '').trim()
  const phone = String(body?.phone || '').trim()
  const code = String(body?.code || '').trim()
  const phoneNorm = normalizeOrderOtpPhone(phone)

  if (!orderId || !phoneNorm || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID, phone and code are required'
    })
  }

  if (!/^\d{6}$/.test(code)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid OTP format'
    })
  }

  const order = await readOrderById(event, orderId)
  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  if (normalizeOrderPhone(order.customer.phone) !== phoneNorm) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Phone does not match this order'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const { data: otpRow, error: otpReadError } = await supabase
    .from('order_auth_codes')
    .select('code_hash, expires_at, used_at, attempts, max_attempts')
    .eq('order_id', orderId)
    .eq('phone_norm', phoneNorm)
    .maybeSingle()

  if (otpReadError) {
    throw createError({
      statusCode: 500,
      statusMessage: `OTP read failed: ${otpReadError.message}`
    })
  }

  if (!otpRow) {
    throw createError({
      statusCode: 404,
      statusMessage: 'OTP code not requested'
    })
  }

  if (otpRow.used_at) {
    throw createError({
      statusCode: 409,
      statusMessage: 'OTP code already used'
    })
  }

  const attempts = Number(otpRow.attempts || 0)
  const maxAttempts = Math.max(1, Number(otpRow.max_attempts || 5))
  if (attempts >= maxAttempts) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many invalid code attempts'
    })
  }

  if (!otpRow.expires_at || +new Date(otpRow.expires_at) < Date.now()) {
    throw createError({
      statusCode: 410,
      statusMessage: 'OTP code expired'
    })
  }

  const valid = verifyOrderOtpCodeHash(
    String(otpRow.code_hash || ''),
    code,
    event,
    orderId,
    phoneNorm
  )

  if (!valid) {
    const { error: attemptsError } = await supabase
      .from('order_auth_codes')
      .update({ attempts: attempts + 1 })
      .eq('order_id', orderId)
      .eq('phone_norm', phoneNorm)

    if (attemptsError) {
      throw createError({
        statusCode: 500,
        statusMessage: `OTP attempts update failed: ${attemptsError.message}`
      })
    }

    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid OTP code'
    })
  }

  const nowIso = new Date().toISOString()
  const { error: otpUseError } = await supabase
    .from('order_auth_codes')
    .update({
      used_at: nowIso
    })
    .eq('order_id', orderId)
    .eq('phone_norm', phoneNorm)

  if (otpUseError) {
    throw createError({
      statusCode: 500,
      statusMessage: `OTP mark used failed: ${otpUseError.message}`
    })
  }

  const config = useRuntimeConfig(event)
  const secret = config.orderTrackSecret || config.adminKey || 'osf-order-track-secret'

  return {
    success: true,
    order: toPublicOrder(order),
    trackToken: createOrderTrackToken(secret, order.id, order.customer.phone)
  }
})
