import { assertRateLimit } from '../../utils/rate-limit'
import { getSupabaseAdminClient } from '../../utils/supabase-admin'
import { getOrCreateCheckoutDraftKey } from '../../utils/checkout-draft'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'checkout-draft-delete',
    limit: 20,
    windowMs: 60 * 1000
  })

  const draftKey = getOrCreateCheckoutDraftKey(event)

  let supabase
  try {
    supabase = getSupabaseAdminClient(event)
  } catch {
    return {
      success: true,
      deleted: false
    }
  }

  try {
    await supabase
      .from('checkout_drafts')
      .delete()
      .eq('draft_key', draftKey)

    return {
      success: true,
      deleted: true
    }
  } catch {
    return {
      success: true,
      deleted: false
    }
  }
})
