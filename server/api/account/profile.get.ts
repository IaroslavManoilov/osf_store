import { createError, defineEventHandler } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireCustomerAuth } from '../../utils/customer-auth'

export default defineEventHandler(async (event) => {
  const customer = await requireCustomerAuth(event)
  const supabase = getSupabaseAdmin(event)

  let data: any = null
  let error: any = null
  let usedLegacySchema = false

  const fullSelect = await supabase
    .from('customer_profiles')
    .select('user_id, full_name, first_name, last_name, login, phone, email, about, currency, preferred_language, notifications_enabled')
    .eq('user_id', customer.userId)
    .maybeSingle()

  data = fullSelect.data
  error = fullSelect.error

  // Backward-compatible fallback for databases where new profile columns are not migrated yet.
  if (error && /column .* does not exist/i.test(String(error.message || ''))) {
    usedLegacySchema = true
    const legacy = await supabase
      .from('customer_profiles')
      .select('user_id, full_name, phone, email')
      .eq('user_id', customer.userId)
      .maybeSingle()
    data = legacy.data
    error = legacy.error
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Profile load failed: ${error.message}`
    })
  }

  const fullName = String(data?.full_name || '').trim()
  const firstName = String(data?.first_name || '').trim()
  const lastName = String(data?.last_name || '').trim()

  const profile = data
    ? {
        userId: String(data.user_id || customer.userId),
        name: fullName || [firstName, lastName].filter(Boolean).join(' ').trim(),
        firstName,
        lastName,
        login: String(data.login || '').trim(),
        phone: String(data.phone || customer.phone || '').trim(),
        email: String(data.email || customer.email || '').trim(),
        about: String(data.about || '').trim(),
        currency: String(data.currency || 'MDL').trim() || 'MDL',
        language: String(data.preferred_language || 'ru').trim() || 'ru',
        notificationsEnabled: data.notifications_enabled === false ? false : true
      }
    : {
        userId: customer.userId,
        name: '',
        firstName: '',
        lastName: '',
        login: '',
        phone: String(customer.phone || '').trim(),
        email: String(customer.email || '').trim(),
        about: '',
        currency: 'MDL',
        language: 'ru',
        notificationsEnabled: true
      }

  return {
    success: true,
    legacySchema: usedLegacySchema,
    profile
  }
})
