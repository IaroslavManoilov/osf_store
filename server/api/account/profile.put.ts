import { defineEventHandler, readBody } from 'h3'
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
  try {
    const customer = await requireCustomerAuth(event)
    const body = await readBody<ProfilePayload>(event)
    const hasName = !!body && Object.prototype.hasOwnProperty.call(body, 'name')
    const hasFirstName = !!body && Object.prototype.hasOwnProperty.call(body, 'firstName')
    const hasLastName = !!body && Object.prototype.hasOwnProperty.call(body, 'lastName')
    const hasLogin = !!body && Object.prototype.hasOwnProperty.call(body, 'login')
    const hasPhone = !!body && Object.prototype.hasOwnProperty.call(body, 'phone')
    const hasEmail = !!body && Object.prototype.hasOwnProperty.call(body, 'email')
    const hasAbout = !!body && Object.prototype.hasOwnProperty.call(body, 'about')
    const hasCurrency = !!body && Object.prototype.hasOwnProperty.call(body, 'currency')
    const hasLanguage = !!body && Object.prototype.hasOwnProperty.call(body, 'language')
    const hasNotificationsEnabled =
      !!body &&
      Object.prototype.hasOwnProperty.call(body, 'notificationsEnabled') &&
      typeof body.notificationsEnabled === 'boolean'

    const firstName = safeText(body?.firstName, 60)
    const lastName = safeText(body?.lastName, 60)
    const fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim()
    const name = safeText(body?.name, 100) || fallbackName
    const email = safeText(body?.email, 120)
    const login = safeLogin(body?.login)
    const about = safeText(body?.about, 500)
    const currency = normalizeCurrency(body?.currency)
    const language = normalizeLanguage(body?.language)
    const notificationsEnabled = hasNotificationsEnabled ? body.notificationsEnabled === true : undefined
    const phone = normalizePhone(body?.phone)

    // Keep profile updates resilient: account settings can be saved partially.
    // We only require user_id and persist available fields.

    let supabase: ReturnType<typeof getSupabaseAdmin> | null = null
    try {
      supabase = getSupabaseAdmin(event)
    } catch {
      supabase = null
    }
    const payload: Record<string, unknown> = {
      user_id: customer.userId,
      updated_at: new Date().toISOString()
    }

    if (hasName || hasFirstName || hasLastName) {
      payload.full_name = name || ''
    }
    if (hasFirstName) {
      payload.first_name = firstName
    }
    if (hasLastName) {
      payload.last_name = lastName
    }
    if (hasLogin) {
      payload.login = login || null
    }
    if (hasPhone) {
      payload.phone = phone || ''
    }
    if (hasEmail) {
      payload.email = email || null
    }
    if (hasAbout) {
      payload.about = about || null
    }
    if (hasCurrency) {
      payload.currency = currency
    }
    if (hasLanguage) {
      payload.preferred_language = language
    }
    if (typeof notificationsEnabled === 'boolean') {
      payload.notifications_enabled = notificationsEnabled
    }

    let usedLegacySchema = false
    let degradedMode = false
    let error: any = null
    if (!supabase) {
      degradedMode = true
      return {
        success: true,
        legacySchema: false,
        degradedMode,
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
    }

    const initial = await supabase
      .from('customer_profiles')
      .upsert(payload, { onConflict: 'user_id' })
    error = initial.error

    // Backward-compatible fallback for not yet migrated DB schema.
    if (supabase && error && /column .* does not exist/i.test(String(error.message || ''))) {
      usedLegacySchema = true
      const legacy = await supabase
        .from('customer_profiles')
        .upsert(
          {
            user_id: customer.userId,
            ...(hasName || hasFirstName || hasLastName ? { full_name: name || '' } : {}),
            ...(hasPhone ? { phone: phone || '' } : {}),
            ...(hasEmail ? { email: email || null } : {}),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
      error = legacy.error
    }

    if (error) {
      degradedMode = true
      return {
        success: true,
        legacySchema: usedLegacySchema,
        degradedMode,
        profile: {
          userId: customer.userId,
          name: hasName || hasFirstName || hasLastName ? name : '',
          firstName: hasFirstName ? firstName : '',
          lastName: hasLastName ? lastName : '',
          login: hasLogin ? login : '',
          phone: hasPhone ? phone : '',
          email: hasEmail ? email : '',
          about: hasAbout ? about : '',
          currency: hasCurrency ? currency : 'MDL',
          language: hasLanguage ? language : 'ru',
          notificationsEnabled
        }
      }
    }

    const fullSelect = await supabase
      .from('customer_profiles')
      .select('user_id, full_name, first_name, last_name, login, phone, email, about, currency, preferred_language, notifications_enabled')
      .eq('user_id', customer.userId)
      .maybeSingle()

    if (!fullSelect.error && fullSelect.data) {
      return {
        success: true,
        legacySchema: usedLegacySchema,
        degradedMode,
        profile: {
          userId: String(fullSelect.data.user_id || customer.userId),
          name: String(fullSelect.data.full_name || '').trim(),
          firstName: String(fullSelect.data.first_name || '').trim(),
          lastName: String(fullSelect.data.last_name || '').trim(),
          login: String(fullSelect.data.login || '').trim(),
          phone: String(fullSelect.data.phone || '').trim(),
          email: String(fullSelect.data.email || '').trim(),
          about: String(fullSelect.data.about || '').trim(),
          currency: String(fullSelect.data.currency || 'MDL').trim() || 'MDL',
          language: String(fullSelect.data.preferred_language || 'ru').trim() || 'ru',
          notificationsEnabled: fullSelect.data.notifications_enabled === true
        }
      }
    }

    return {
      success: true,
      legacySchema: usedLegacySchema,
      degradedMode,
      profile: {
        userId: customer.userId,
        name: hasName || hasFirstName || hasLastName ? name : '',
        firstName: hasFirstName ? firstName : '',
        lastName: hasLastName ? lastName : '',
        login: hasLogin ? login : '',
        phone: hasPhone ? phone : '',
        email: hasEmail ? email : '',
        about: hasAbout ? about : '',
        currency: hasCurrency ? currency : 'MDL',
        language: hasLanguage ? language : 'ru',
        notificationsEnabled
      }
    }
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || error?.status || 0)
    if (statusCode >= 400 && statusCode < 500) {
      throw error
    }
    return {
      success: true,
      legacySchema: false,
      degradedMode: true,
      profile: null
    }
  }
})
