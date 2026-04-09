import { createError, defineEventHandler, readBody } from 'h3'
import { randomBytes } from 'node:crypto'
import { assertRateLimit } from '../../../../../utils/rate-limit'
import { readOrderById } from '../../../../../utils/order-storage'
import { getSupabaseAdmin } from '../../../../../utils/supabase-admin'
import { normalizeOrderOtpPhone } from '../../../../../utils/order-auth-code'

type Payload = {
  orderId?: string
  phone?: string
}

const TTL_MINUTES = 15

const buildBotLink = (username: string, token: string) =>
  `https://t.me/${username.replace(/^@/, '')}?start=osf_link_${token}`

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'order-telegram-link-start',
    limit: 8,
    windowMs: 10 * 60 * 1000
  })

  const body = await readBody<Payload>(event)
  const orderId = String(body?.orderId || '').trim()
  const phoneNorm = normalizeOrderOtpPhone(String(body?.phone || ''))

  if (!orderId || !phoneNorm) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID and phone are required'
    })
  }

  const order = await readOrderById(event, orderId)
  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  if (normalizeOrderOtpPhone(order.customer.phone) !== phoneNorm) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Phone does not match this order'
    })
  }

  const config = useRuntimeConfig(event)
  const botUsername = String(config.telegramBotUsername || '').trim().replace(/^@/, '')
  if (!botUsername || !config.telegramBotToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Telegram bot username/token is not configured'
    })
  }

  const token = randomBytes(18).toString('base64url')
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000).toISOString()
  const supabase = getSupabaseAdmin(event)

  const { error } = await supabase.from('telegram_link_tokens').insert({
    token,
    order_id: orderId,
    phone_norm: phoneNorm,
    expires_at: expiresAt
  })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Link token save failed: ${error.message}`
    })
  }

  return {
    success: true,
    token,
    botLink: buildBotLink(botUsername, token),
    expiresInSec: TTL_MINUTES * 60
  }
})
