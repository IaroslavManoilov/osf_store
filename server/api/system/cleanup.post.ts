import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { assertRateLimit } from '../../utils/rate-limit'

type CleanupBody = {
  secret?: string
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'system-cleanup',
    limit: 8,
    windowMs: 60 * 1000
  })

  const config = useRuntimeConfig(event)
  const expectedSecret = String(config.cleanupSecret || '').trim()
  if (!expectedSecret) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cleanup endpoint is disabled'
    })
  }

  const body = await readBody<CleanupBody>(event).catch(() => ({} as CleanupBody))
  const providedSecret = String(getHeader(event, 'x-cleanup-secret') || body?.secret || '').trim()
  if (!providedSecret || providedSecret !== expectedSecret) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid cleanup secret'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const now = new Date()
  const nowIso = now.toISOString()
  const usedBeforeIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const auditBeforeIso = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()

  const deleted = {
    orderAuthCodesExpired: 0,
    orderAuthCodesUsed: 0,
    telegramLinkTokensExpired: 0,
    telegramLinkTokensUsed: 0,
    adminAuditOld: 0
  }

  const removeExpiredOtp = await supabase
    .from('order_auth_codes')
    .delete()
    .lt('expires_at', nowIso)
    .is('used_at', null)
    .select('id')
  if (removeExpiredOtp.error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Cleanup failed (order_auth_codes expired): ${removeExpiredOtp.error.message}`
    })
  }
  deleted.orderAuthCodesExpired = (removeExpiredOtp.data || []).length

  const removeUsedOtp = await supabase
    .from('order_auth_codes')
    .delete()
    .not('used_at', 'is', null)
    .lt('used_at', usedBeforeIso)
    .select('id')
  if (removeUsedOtp.error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Cleanup failed (order_auth_codes used): ${removeUsedOtp.error.message}`
    })
  }
  deleted.orderAuthCodesUsed = (removeUsedOtp.data || []).length

  const removeExpiredLinkTokens = await supabase
    .from('telegram_link_tokens')
    .delete()
    .lt('expires_at', nowIso)
    .is('used_at', null)
    .select('token')
  if (removeExpiredLinkTokens.error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Cleanup failed (telegram_link_tokens expired): ${removeExpiredLinkTokens.error.message}`
    })
  }
  deleted.telegramLinkTokensExpired = (removeExpiredLinkTokens.data || []).length

  const removeUsedLinkTokens = await supabase
    .from('telegram_link_tokens')
    .delete()
    .not('used_at', 'is', null)
    .lt('used_at', usedBeforeIso)
    .select('token')
  if (removeUsedLinkTokens.error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Cleanup failed (telegram_link_tokens used): ${removeUsedLinkTokens.error.message}`
    })
  }
  deleted.telegramLinkTokensUsed = (removeUsedLinkTokens.data || []).length

  const removeOldAudit = await supabase
    .from('admin_audit_log')
    .delete()
    .lt('created_at', auditBeforeIso)
    .select('id')
  if (removeOldAudit.error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Cleanup failed (admin_audit_log): ${removeOldAudit.error.message}`
    })
  }
  deleted.adminAuditOld = (removeOldAudit.data || []).length

  return {
    success: true,
    deleted
  }
})
