import { createError, readBody } from 'h3'
import { assertRateLimit } from '../../utils/rate-limit'
import { getSupabaseAdminClient } from '../../utils/supabase-admin'
import { getOrCreateCheckoutDraftKey, normalizeCheckoutDraftPhone } from '../../utils/checkout-draft'

type DraftBody = {
  draft?: Record<string, unknown>
  savedAt?: string
  phoneNorm?: string
}

const sanitizeDraft = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const source = value as Record<string, unknown>
  const allowedKeys = [
    'name',
    'phoneCode',
    'phoneLocal',
    'email',
    'deliveryType',
    'city',
    'street',
    'house',
    'apartment',
    'postalCode',
    'pickupPoint',
    'mapQuery',
    'comment'
  ]

  const result: Record<string, unknown> = {}
  for (const key of allowedKeys) {
    if (typeof source[key] === 'string') {
      result[key] = String(source[key] || '').slice(0, 800)
    }
  }
  return result
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'checkout-draft-post',
    limit: 40,
    windowMs: 60 * 1000
  })

  const body = await readBody<DraftBody>(event).catch(() => ({}))
  const draft = sanitizeDraft(body?.draft)
  const savedAt = String(body?.savedAt || new Date().toISOString())
  const phoneNorm = normalizeCheckoutDraftPhone(body?.phoneNorm || '')
  const draftKey = getOrCreateCheckoutDraftKey(event)

  if (!Object.keys(draft).length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Draft payload is empty'
    })
  }

  let supabase
  try {
    supabase = getSupabaseAdminClient(event)
  } catch {
    return {
      success: true,
      saved: false
    }
  }

  try {
    const { error } = await supabase
      .from('checkout_drafts')
      .upsert(
        {
          draft_key: draftKey,
          phone_norm: phoneNorm || null,
          draft_data: draft,
          saved_at: savedAt
        },
        {
          onConflict: 'draft_key'
        }
      )

    if (error) {
      return {
        success: true,
        saved: false
      }
    }

    return {
      success: true,
      saved: true,
      savedAt
    }
  } catch {
    return {
      success: true,
      saved: false
    }
  }
})
