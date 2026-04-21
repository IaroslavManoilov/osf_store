import { createError, defineEventHandler, readBody } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireCustomerAuth } from '../../utils/customer-auth'

type ProfilePayload = {
  name?: string
  firstName?: string
  lastName?: string
  login?: string
  phone?: string
  email?: string
  about?: string
  currency?: string
  language?: string
  notificationsEnabled?: boolean
}

const safeText = (value: unknown, max = 120) => String(value || '').trim().slice(0, max)
const normalizePhone = (value: unknown) => String(value || '').replace(/[^\d+]/g, '').slice(0, 30)
const safeLogin = (value: unknown) => safeText(value, 60).replace(/\s+/g, '')
const normalizeCurrency = (value: unknown) => {
  const v = String(value || '').toUpperCase().trim()
  return ['MDL', 'EUR', 'USD', 'RON'].includes(v) ? v : 'MDL'
}
const normalizeLanguage = (value: unknown) => {
  const v = String(value || '').toLowerCase().trim()
  return ['ru', 'ro', 'en'].includes(v) ? v : 'ru'
}

export default defineEventHandler(async (event) => {
  const customer = await requireCustomerAuth(event)
  const body = await readBody<ProfilePayload>(event)

  const firstName = safeText(body?.firstName, 60)
  const lastName = safeText(body?.lastName, 60)
  const fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const name = safeText(body?.name, 100) || fallbackName
  const email = safeText(body?.email, 120)
  const login = safeLogin(body?.login)
  const about = safeText(body?.about, 500)
  const currency = normalizeCurrency(body?.currency)
  const language = normalizeLanguage(body?.language)
  const notificationsEnabled = body?.notificationsEnabled === false ? false : true
  const phone = normalizePhone(body?.phone || customer.phone)

  // Keep profile updates resilient: account settings can be saved partially.
  // We only require user_id and persist available fields.

  const supabase = getSupabaseAdmin(event)
  const payload = {
    user_id: customer.userId,
    full_name: name || '',
    first_name: firstName,
    last_name: lastName,
    login: login || null,
    phone: phone || '',
    email: email || null,
    about: about || null,
    currency,
    preferred_language: language,
    notifications_enabled: notificationsEnabled,
    updated_at: new Date().toISOString()
  }

  let { error } = await supabase
    .from('customer_profiles')
    .upsert(payload, { onConflict: 'user_id' })

  // Backward-compatible fallback for not yet migrated DB schema.
  if (error && /column .* does not exist/i.test(String(error.message || ''))) {
    const legacy = await supabase
      .from('customer_profiles')
      .upsert(
        {
          user_id: customer.userId,
          full_name: name,
          phone,
          email: email || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
    error = legacy.error
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Profile save failed: ${error.message}`
    })
  }

  return {
    success: true,
    profile: {
      userId: customer.userId,
      name,
      firstName,
      lastName,
      login,
      phone,
      email,
      about,
      currency,
      language,
      notificationsEnabled
    }
  }
})
