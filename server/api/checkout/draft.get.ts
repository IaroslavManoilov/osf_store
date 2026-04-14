import { getQuery } from 'h3'
import { assertRateLimit } from '../../utils/rate-limit'
import { getSupabaseAdminClient } from '../../utils/supabase-admin'
import { getOrCreateCheckoutDraftKey, normalizeCheckoutDraftPhone } from '../../utils/checkout-draft'

type DraftRecord = {
  draft_key?: string
  phone_norm?: string | null
  draft_data?: Record<string, unknown> | null
  saved_at?: string | null
}

const toTimestamp = (value: unknown) => {
  const ms = new Date(String(value || '')).getTime()
  return Number.isFinite(ms) ? ms : 0
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'checkout-draft-get',
    limit: 30,
    windowMs: 60 * 1000
  })

  const draftKey = getOrCreateCheckoutDraftKey(event)
  const query = getQuery(event)
  const phoneNorm = normalizeCheckoutDraftPhone(query.phoneNorm)

  let supabase
  try {
    supabase = getSupabaseAdminClient(event)
  } catch {
    return {
      success: true,
      draft: null,
      savedAt: null
    }
  }

  try {
    const { data: ownData } = await supabase
      .from('checkout_drafts')
      .select('draft_key,phone_norm,draft_data,saved_at')
      .eq('draft_key', draftKey)
      .maybeSingle()

    let picked: DraftRecord | null = (ownData as DraftRecord | null) || null

    if (phoneNorm) {
      const { data: phoneData } = await supabase
        .from('checkout_drafts')
        .select('draft_key,phone_norm,draft_data,saved_at')
        .eq('phone_norm', phoneNorm)
        .order('saved_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const phoneRecord = (phoneData as DraftRecord | null) || null
      if (phoneRecord && toTimestamp(phoneRecord.saved_at) > toTimestamp(picked?.saved_at)) {
        picked = phoneRecord
      }
    }

    return {
      success: true,
      draft: picked?.draft_data || null,
      savedAt: picked?.saved_at || null
    }
  } catch {
    return {
      success: true,
      draft: null,
      savedAt: null
    }
  }
})
