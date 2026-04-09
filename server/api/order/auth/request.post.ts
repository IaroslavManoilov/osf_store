import { createError, defineEventHandler, readBody } from 'h3'
import { assertRateLimit } from '../../../utils/rate-limit'
import { readOrderById } from '../../../utils/order-storage'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { generateOrderOtpCode, hashOrderOtpCode, normalizeOrderOtpPhone } from '../../../utils/order-auth-code'

type RequestOtpPayload = {
  orderId?: string
  phone?: string
  channel?: 'telegram' | 'sms'
}

const TG_RESEND_COOLDOWN_SEC = 45
const OTP_TTL_MINUTES = 10

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'order-auth-request',
    limit: 8,
    windowMs: 10 * 60 * 1000
  })

  const body = await readBody<RequestOtpPayload>(event)
  const orderId = String(body?.orderId || '').trim()
  const phone = String(body?.phone || '').trim()
  const phoneNorm = normalizeOrderOtpPhone(phone)
  const channel = body?.channel === 'sms' ? 'sms' : 'telegram'

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

  if (channel === 'sms') {
    throw createError({
      statusCode: 501,
      statusMessage: 'SMS OTP is not configured yet'
    })
  }

  const config = useRuntimeConfig(event)
  const chatId = config.orderOtpTelegramChatId || config.telegramChatId
  if (!config.telegramBotToken || !chatId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Telegram OTP is not configured'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const { data: existingRow } = await supabase
    .from('order_auth_codes')
    .select('last_sent_at, used_at')
    .eq('order_id', orderId)
    .eq('phone_norm', phoneNorm)
    .maybeSingle()

  const lastSentAt = existingRow?.last_sent_at ? +new Date(existingRow.last_sent_at) : 0
  if (lastSentAt && Date.now() - lastSentAt < TG_RESEND_COOLDOWN_SEC * 1000) {
    throw createError({
      statusCode: 429,
      statusMessage: `Try again in ${TG_RESEND_COOLDOWN_SEC} seconds`
    })
  }

  const code = generateOrderOtpCode()
  const codeHash = hashOrderOtpCode(event, orderId, phoneNorm, code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString()
  const nowIso = new Date().toISOString()

  const { error: saveError } = await supabase
    .from('order_auth_codes')
    .upsert(
      {
        order_id: orderId,
        phone_norm: phoneNorm,
        code_hash: codeHash,
        expires_at: expiresAt,
        used_at: null,
        attempts: 0,
        max_attempts: 5,
        delivery_channel: channel,
        last_sent_at: nowIso
      },
      { onConflict: 'order_id,phone_norm' }
    )

  if (saveError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to save OTP: ${saveError.message}`
    })
  }

  const maskedPhone = `${phoneNorm.slice(0, 3)}***${phoneNorm.slice(-2)}`
  const tgMessage = [
    '🔐 Код входа в кабинет заказа',
    `Заказ: ${orderId}`,
    `Телефон: ${maskedPhone}`,
    `Код: ${code}`,
    `Действует: ${OTP_TTL_MINUTES} минут`
  ].join('\n')

  try {
    await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: chatId,
        text: tgMessage
      }
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Telegram OTP send failed: ${String(error)}`
    })
  }

  return {
    success: true,
    channel,
    expiresInSec: OTP_TTL_MINUTES * 60
  }
})
