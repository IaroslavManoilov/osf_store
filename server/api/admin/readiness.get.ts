import { defineEventHandler } from 'h3'
import { requireAdminCsrf } from '../../utils/admin-session'
import { assertRateLimit } from '../../utils/rate-limit'
import { getSupabaseAdmin } from '../../utils/supabase-admin'

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-readiness-get',
    limit: 90,
    windowMs: 60 * 1000
  })

  const config = useRuntimeConfig(event)

  const stripeSecret = String(config.stripeSecretKey || '').trim()
  const stripePublic = String(config.public?.stripePublishableKey || '').trim()
  const maibId = String(config.maibProjectId || '').trim()
  const maibSecret = String(config.maibProjectSecret || '').trim()
  const maibSignature = String(config.maibSignatureKey || '').trim()

  const hasStripe = !!stripeSecret && !!stripePublic
  const isStripeLive = hasStripe && stripeSecret.startsWith('sk_live_') && stripePublic.startsWith('pk_live_')
  const hasStripeWebhook = !!String(config.stripeWebhookSecret || '').trim()
  const hasMaib = !!maibId && !!maibSecret && !!maibSignature

  const hasTrackSecret = String(config.orderTrackSecret || '').trim().length >= 24
  const hasOtpSecret = String(config.orderOtpSecret || '').trim().length >= 24
  const hasTelegram = String(config.telegramBotToken || '').trim().length > 10
  const hasSupabase = !!String(config.supabaseUrl || '').trim() && !!String(config.supabaseServiceRoleKey || '').trim()
  const hasAdminKey = String(config.adminKey || '').trim().length >= 16
  const hasCleanupSecret = String(config.cleanupSecret || '').trim().length >= 16

  let reviewsCount = 0
  let orders30d = 0
  let trustedMetrics = false
  let dbPingOk = false

  if (hasSupabase) {
    try {
      const supabase = getSupabaseAdmin(event)
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [{ count: reviews }, { count: orders }, pingResult] = await Promise.all([
        supabase
          .from('product_reviews')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', fromDate),
        supabase
          .from('orders')
          .select('id')
          .limit(1)
      ])

      reviewsCount = Number(reviews || 0)
      orders30d = Number(orders || 0)
      trustedMetrics = true
      dbPingOk = !pingResult.error
    } catch {
      trustedMetrics = false
      dbPingOk = false
    }
  }

  return {
    success: true,
    updatedAt: new Date().toISOString(),
    checks: {
      payment: {
        hasStripe,
        isStripeLive,
        hasStripeWebhook,
        hasMaib,
        ready: hasMaib || isStripeLive
      },
      legal: {
        contacts: true,
        shipping: true,
        returns: true,
        privacy: true,
        faq: true,
        ready: true
      },
      customerTracking: {
        hasTrackSecret,
        hasOtpSecret,
        hasTelegram,
        ready: hasTrackSecret && hasOtpSecret && hasTelegram
      },
      reliability: {
        hasSupabase,
        dbPingOk,
        hasAdminKey,
        hasCleanupSecret,
        ready: hasSupabase && dbPingOk && hasAdminKey && hasCleanupSecret
      },
      trust: {
        trustedMetrics,
        reviewsCount,
        orders30d,
        ready: trustedMetrics && reviewsCount >= 5
      }
    }
  }
})
