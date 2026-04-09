import { createError, defineEventHandler, readBody } from 'h3'
import { assertRateLimit } from '../../../../../utils/rate-limit'
import { getSupabaseAdmin } from '../../../../../utils/supabase-admin'

type Payload = {
  token?: string
}

type TelegramUpdate = {
  update_id: number
  message?: {
    text?: string
    chat?: { id?: number; type?: string }
    from?: {
      id?: number
      username?: string
      first_name?: string
      last_name?: string
    }
  }
}

const parseLinkTokenFromText = (text: string) => {
  const normalized = String(text || '').trim()
  const match = normalized.match(/^\/start(?:@\w+)?\s+osf_link_([A-Za-z0-9_-]{10,})$/)
  return match?.[1] || ''
}

const findChatFromUpdates = (updates: TelegramUpdate[], token: string) => {
  for (const update of updates) {
    const text = String(update?.message?.text || '').trim()
    const parsed = parseLinkTokenFromText(text)
    if (!parsed || parsed !== token) continue

    const chatId = update?.message?.chat?.id
    if (!chatId) continue

    return {
      chatId: String(chatId),
      username: String(update?.message?.from?.username || '').trim() || null,
      firstName: String(update?.message?.from?.first_name || '').trim() || null,
      lastName: String(update?.message?.from?.last_name || '').trim() || null
    }
  }
  return null
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'order-telegram-link-confirm',
    limit: 20,
    windowMs: 10 * 60 * 1000
  })

  const body = await readBody<Payload>(event)
  const token = String(body?.token || '').trim()
  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token is required'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const { data: tokenRow, error: tokenReadError } = await supabase
    .from('telegram_link_tokens')
    .select('token,order_id,phone_norm,expires_at,used_at')
    .eq('token', token)
    .maybeSingle()

  if (tokenReadError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Link token read failed: ${tokenReadError.message}`
    })
  }

  if (!tokenRow) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Link token not found'
    })
  }

  if (tokenRow.used_at) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Link token already used'
    })
  }

  if (!tokenRow.expires_at || +new Date(tokenRow.expires_at) < Date.now()) {
    throw createError({
      statusCode: 410,
      statusMessage: 'Link token expired'
    })
  }

  const config = useRuntimeConfig(event)
  if (!config.telegramBotToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Telegram bot token is not configured'
    })
  }

  let updates: TelegramUpdate[] = []
  try {
    const response = await $fetch<{ ok: boolean; result?: TelegramUpdate[]; description?: string }>(
      `https://api.telegram.org/bot${config.telegramBotToken}/getUpdates?limit=100&timeout=0`,
      { method: 'GET' }
    )
    updates = Array.isArray(response?.result) ? response.result : []
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Telegram updates fetch failed: ${String(error)}`
    })
  }

  const found = findChatFromUpdates(updates, token)
  if (!found?.chatId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Telegram start command not found for this token'
    })
  }

  const { error: upsertContactError } = await supabase
    .from('customer_telegram_contacts')
    .upsert(
      {
        phone_norm: tokenRow.phone_norm,
        telegram_chat_id: found.chatId,
        telegram_username: found.username,
        telegram_first_name: found.firstName,
        telegram_last_name: found.lastName,
        linked_at: new Date().toISOString()
      },
      { onConflict: 'phone_norm' }
    )

  if (upsertContactError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Telegram contact save failed: ${upsertContactError.message}`
    })
  }

  const { error: markUsedError } = await supabase
    .from('telegram_link_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  if (markUsedError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Link token finalize failed: ${markUsedError.message}`
    })
  }

  return {
    success: true
  }
})
