import { computed } from 'vue'
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

type CustomerProfile = {
  userId: string
  name: string
  firstName?: string
  lastName?: string
  phone: string
  email: string
  login?: string
  about?: string
  currency?: 'MDL' | 'EUR' | 'USD' | 'RON'
  language?: 'ru' | 'ro' | 'en'
  notificationsEnabled?: boolean
}

let client: SupabaseClient | null = null
let initPromise: Promise<void> | null = null
let authSubscriptionSet = false

const safeText = (value: unknown, max = 120) => String(value || '').trim().slice(0, max)
const normalizePhone = (value: unknown) => String(value || '').replace(/[^\d+]/g, '').slice(0, 30)
const normalizeEmail = (value: unknown) => safeText(value, 160).toLowerCase()
const normalizeLogin = (value: unknown) => safeText(value, 60).replace(/\s+/g, '')
const normalizeCurrency = (value: unknown): CustomerProfile['currency'] => {
  const candidate = String(value || '').toUpperCase().trim()
  return ['MDL', 'EUR', 'USD', 'RON'].includes(candidate)
    ? (candidate as CustomerProfile['currency'])
    : 'MDL'
}
const normalizeLanguage = (value: unknown): CustomerProfile['language'] => {
  const candidate = String(value || '').toLowerCase().trim()
  return ['ru', 'ro', 'en'].includes(candidate)
    ? (candidate as CustomerProfile['language'])
    : 'ru'
}
const profileCacheKey = 'osf_customer_profile_cache_v1'
const preferNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    const normalized = String(value || '').trim()
    if (normalized) return normalized
  }
  return ''
}

const getUserMeta = (currentUser: User | null) => {
  const meta = currentUser?.user_metadata
  return meta && typeof meta === 'object' ? meta : {}
}

const getClient = () => {
  if (client) return client

  const runtimeConfig = useRuntimeConfig()
  const url = String(runtimeConfig.public.supabaseUrl || '').trim()
  const anonKey = String(runtimeConfig.public.supabaseAnonKey || '').trim()
  if (!url || !anonKey) return null

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  return client
}

export const useCustomerAuth = () => {
  const session = useState<Session | null>('customer-auth-session', () => null)
  const user = useState<User | null>('customer-auth-user', () => null)
  const profile = useState<CustomerProfile | null>('customer-auth-profile', () => null)
  const initialized = useState<boolean>('customer-auth-initialized', () => false)
  const notificationsPreference = useState<boolean>('customer-auth-notifications-enabled', () => false)

  const accessToken = computed(() => String(session.value?.access_token || ''))
  const isAuthenticated = computed(() => !!user.value?.id && !!accessToken.value)
  const notificationsEnabled = computed(() => {
    if (isAuthenticated.value && profile.value) {
      return profile.value.notificationsEnabled !== false
    }
    return notificationsPreference.value === true
  })

  const readProfileCache = (userId: string): CustomerProfile | null => {
    if (!import.meta.client || !userId) return null
    try {
      const raw = window.localStorage.getItem(profileCacheKey)
      if (!raw) return null
      const parsed = JSON.parse(raw) as Record<string, CustomerProfile>
      const cached = parsed?.[userId]
      if (!cached || typeof cached !== 'object') return null
      return {
        ...cached,
        userId,
        name: safeText(cached.name, 100),
        firstName: safeText(cached.firstName, 60),
        lastName: safeText(cached.lastName, 60),
        phone: normalizePhone(cached.phone),
        email: normalizeEmail(cached.email),
        login: normalizeLogin(cached.login),
        about: safeText(cached.about, 500),
        currency: normalizeCurrency(cached.currency || 'MDL'),
        language: normalizeLanguage(cached.language || 'ru'),
        notificationsEnabled: cached.notificationsEnabled !== false
      }
    } catch {
      return null
    }
  }

  const writeProfileCache = (nextProfile: CustomerProfile | null) => {
    if (!import.meta.client || !nextProfile?.userId) return
    try {
      const raw = window.localStorage.getItem(profileCacheKey)
      const current = raw ? (JSON.parse(raw) as Record<string, CustomerProfile>) : {}
      current[nextProfile.userId] = {
        ...nextProfile,
        userId: String(nextProfile.userId || ''),
        name: safeText(nextProfile.name, 100),
        firstName: safeText(nextProfile.firstName, 60),
        lastName: safeText(nextProfile.lastName, 60),
        phone: normalizePhone(nextProfile.phone),
        email: normalizeEmail(nextProfile.email),
        login: normalizeLogin(nextProfile.login),
        about: safeText(nextProfile.about, 500),
        currency: normalizeCurrency(nextProfile.currency || 'MDL'),
        language: normalizeLanguage(nextProfile.language || 'ru'),
        notificationsEnabled: nextProfile.notificationsEnabled !== false
      }
      window.localStorage.setItem(profileCacheKey, JSON.stringify(current))
    } catch {
      // Ignore cache write failures.
    }
  }

  const clearProfileCache = (userId: string) => {
    if (!import.meta.client || !userId) return
    try {
      const raw = window.localStorage.getItem(profileCacheKey)
      if (!raw) return
      const current = JSON.parse(raw) as Record<string, CustomerProfile>
      if (!current || typeof current !== 'object') return
      delete current[userId]
      window.localStorage.setItem(profileCacheKey, JSON.stringify(current))
    } catch {
      // Ignore cache cleanup failures.
    }
  }

  const refreshProfile = async () => {
    if (!import.meta.client || !isAuthenticated.value) {
      profile.value = null
      return
    }

    const meta = getUserMeta(user.value)
    const metaName = safeText(meta?.name || meta?.full_name, 100)
    const metaPhone = normalizePhone(meta?.phone)
    const metaLogin = normalizeLogin(meta?.login)
    const fallbackProfile: CustomerProfile = {
      userId: String(user.value?.id || ''),
      name: preferNonEmpty(safeText(profile.value?.name, 100), metaName),
      firstName: preferNonEmpty(safeText(profile.value?.firstName, 60), safeText(meta?.firstName || meta?.given_name, 60)),
      lastName: preferNonEmpty(safeText(profile.value?.lastName, 60), safeText(meta?.lastName || meta?.family_name, 60)),
      phone: preferNonEmpty(normalizePhone(profile.value?.phone), metaPhone),
      email: preferNonEmpty(normalizeEmail(profile.value?.email), normalizeEmail(user.value?.email || '')),
      login: preferNonEmpty(normalizeLogin(profile.value?.login), metaLogin),
      about: preferNonEmpty(
        safeText(profile.value?.about, 500),
        safeText(meta?.about, 500)
      ),
      currency: normalizeCurrency(profile.value?.currency || meta?.currency || 'MDL'),
      language: normalizeLanguage(profile.value?.language || meta?.language || 'ru'),
      notificationsEnabled: notificationsPreference.value
    }

    try {
      const data = await $fetch<{ success: boolean; legacySchema?: boolean; degradedMode?: boolean; profile?: CustomerProfile }>('/api/account/profile', {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      })
      const serverProfile = data?.profile || null
      const existing = profile.value
      const serverFirstName = safeText(serverProfile?.firstName, 60)
      const serverLastName = safeText(serverProfile?.lastName, 60)
      const fallbackFirstName = safeText(existing?.firstName || meta?.firstName || meta?.given_name, 60)
      const fallbackLastName = safeText(existing?.lastName || meta?.lastName || meta?.family_name, 60)
      const resolvedFirstName = preferNonEmpty(serverFirstName, fallbackFirstName)
      const resolvedLastName = preferNonEmpty(serverLastName, fallbackLastName)
      const resolvedName = preferNonEmpty(
        safeText(serverProfile?.name, 100),
        [resolvedFirstName, resolvedLastName].filter(Boolean).join(' ').trim(),
        safeText(existing?.name, 100),
        metaName
      )
      const resolvedPhone = preferNonEmpty(
        normalizePhone(serverProfile?.phone),
        normalizePhone(existing?.phone),
        metaPhone
      )
      const resolvedEmail = preferNonEmpty(
        normalizeEmail(serverProfile?.email),
        normalizeEmail(existing?.email),
        normalizeEmail(user.value?.email)
      )
      const resolvedLogin = preferNonEmpty(
        normalizeLogin(serverProfile?.login),
        normalizeLogin(existing?.login),
        metaLogin
      )
      const resolvedAbout = preferNonEmpty(
        safeText(serverProfile?.about, 500),
        safeText(existing?.about, 500)
      )
      const legacySchema = data?.legacySchema === true
      const degradedMode = data?.degradedMode === true
      const metaNotifications = typeof meta?.notificationsEnabled === 'boolean'
        ? meta.notificationsEnabled
        : undefined
      const resolvedNotifications = legacySchema || degradedMode
        ? notificationsPreference.value
        : (typeof serverProfile?.notificationsEnabled === 'boolean'
            ? serverProfile.notificationsEnabled
            : (metaNotifications ?? notificationsPreference.value))
      profile.value = {
        ...(serverProfile || fallbackProfile),
        userId: String(serverProfile?.userId || fallbackProfile.userId || ''),
        name: resolvedName,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        phone: resolvedPhone,
        email: resolvedEmail,
        login: resolvedLogin,
        about: resolvedAbout,
        currency: normalizeCurrency(serverProfile?.currency || existing?.currency || fallbackProfile.currency || 'MDL'),
        language: normalizeLanguage(serverProfile?.language || existing?.language || fallbackProfile.language || 'ru'),
        notificationsEnabled: resolvedNotifications
      }
      writeProfileCache(profile.value)
      notificationsPreference.value = resolvedNotifications
      try {
        window.localStorage.setItem('osf_stock_notifications_v1', notificationsPreference.value ? 'enabled' : 'disabled')
      } catch {
        // Ignore localStorage write failures.
      }
    } catch {
      profile.value = {
        ...(profile.value || {}),
        ...fallbackProfile
      }
      writeProfileCache(profile.value)
      notificationsPreference.value = fallbackProfile.notificationsEnabled !== false
    }
  }

  const initAuth = async () => {
    if (!import.meta.client) return
    if (initialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const rawMode = String(window.localStorage.getItem('osf_stock_notifications_v1') || '').trim().toLowerCase()
        notificationsPreference.value = rawMode === 'enabled'
      } catch {
        notificationsPreference.value = false
      }

      const supabase = getClient()
      if (!supabase) {
        initialized.value = true
        return
      }

      const { data } = await supabase.auth.getSession()
      session.value = data.session || null
      user.value = data.session?.user || null
      const cachedProfile = readProfileCache(String(user.value?.id || ''))
      if (cachedProfile) {
        profile.value = cachedProfile
        notificationsPreference.value = cachedProfile.notificationsEnabled !== false
      }

      if (!authSubscriptionSet) {
        const { data: authData } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          session.value = nextSession || null
          user.value = nextSession?.user || null
        })
        authSubscriptionSet = true
        if (import.meta.hot) {
          import.meta.hot.dispose(() => {
            authData.subscription.unsubscribe()
            authSubscriptionSet = false
          })
        }
      }

      initialized.value = true
      await refreshProfile()
    })()

    try {
      await initPromise
    } finally {
      initPromise = null
    }
  }

  const sendOtp = async (phoneRaw: string) => {
    const phone = String(phoneRaw || '').replace(/[^\d+]/g, '')
    if (!phone || phone.length < 7) {
      throw new Error('Invalid phone')
    }
    const supabase = getClient()
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true
      }
    })
    if (error) throw error
  }

  const verifyOtp = async (phoneRaw: string, codeRaw: string) => {
    const phone = String(phoneRaw || '').replace(/[^\d+]/g, '')
    const token = safeText(codeRaw, 12).replace(/[^\d]/g, '')
    if (!phone || !token) throw new Error('Invalid OTP payload')

    const supabase = getClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    if (error) throw error

    session.value = data.session || null
    user.value = data.user || data.session?.user || null
    await refreshProfile()
    return data
  }

  const saveProfile = async (input: {
    name?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    login?: string
    about?: string
    currency?: 'MDL' | 'EUR' | 'USD' | 'RON'
    language?: 'ru' | 'ro' | 'en'
    notificationsEnabled?: boolean
  }) => {
    if (!isAuthenticated.value) throw new Error('Unauthorized')
    const current = profile.value
    const resolvedFirstName = input.firstName !== undefined
      ? safeText(input.firstName, 60)
      : safeText(current?.firstName, 60)
    const resolvedLastName = input.lastName !== undefined
      ? safeText(input.lastName, 60)
      : safeText(current?.lastName, 60)
    const resolvedJoinedName = [resolvedFirstName, resolvedLastName].filter(Boolean).join(' ').trim()
    const resolvedName = input.name !== undefined
      ? safeText(input.name, 100)
      : safeText(current?.name, 100)
    const name = resolvedName || resolvedJoinedName || safeText(user.value?.user_metadata?.name || user.value?.user_metadata?.full_name, 100)
    const email = input.email !== undefined
      ? safeText(input.email, 120)
      : safeText(current?.email || user.value?.email, 120)
    const phone = input.phone !== undefined
      ? normalizePhone(input.phone)
      : normalizePhone(current?.phone || user.value?.phone || user.value?.user_metadata?.phone)
    const login = input.login !== undefined
      ? normalizeLogin(input.login)
      : normalizeLogin(current?.login || user.value?.user_metadata?.login)
    const about = input.about !== undefined
      ? safeText(input.about, 500)
      : safeText(current?.about, 500)
    const currency = normalizeCurrency(input.currency !== undefined ? input.currency : (current?.currency || 'MDL'))
    const language = normalizeLanguage(input.language !== undefined ? input.language : (current?.language || 'ru'))
    const notificationsEnabled = input.notificationsEnabled !== undefined
      ? input.notificationsEnabled !== false
      : current?.notificationsEnabled !== false

    let data: { success: boolean; legacySchema?: boolean; degradedMode?: boolean; profile?: CustomerProfile } | null = null
    try {
      data = await $fetch<{ success: boolean; legacySchema?: boolean; degradedMode?: boolean; profile?: CustomerProfile }>('/api/account/profile', {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${accessToken.value}`
        },
        body: {
          name,
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
          email,
          phone,
          login,
          about,
          currency,
          language,
          notificationsEnabled
        }
      })
      if (!data?.success) {
        throw new Error('Failed to save profile')
      }
    } catch {
      data = {
        success: true,
        legacySchema: true,
        degradedMode: true
      }
    }
    const legacySchema = data?.legacySchema === true
    const explicitNotifications = input.notificationsEnabled !== undefined ? (input.notificationsEnabled !== false) : undefined
    const resolvedNotifications = legacySchema
      ? (explicitNotifications !== undefined ? explicitNotifications : notificationsPreference.value)
      : notificationsEnabled
    profile.value = {
      ...(data?.profile || current || {
        userId: String(user.value?.id || ''),
        name,
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        phone,
        email
      }),
      name,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      login,
      about,
      currency,
      language,
      notificationsEnabled: resolvedNotifications
    }
    writeProfileCache(profile.value)
    notificationsPreference.value = resolvedNotifications
    if (import.meta.client) {
      try {
        window.localStorage.setItem('osf_stock_notifications_v1', notificationsPreference.value ? 'enabled' : 'disabled')
      } catch {
        // Ignore localStorage write failures.
      }
    }

    const supabase = getClient()
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: {
            name,
            phone,
            login,
            firstName: resolvedFirstName,
            lastName: resolvedLastName,
            about,
            currency,
            language,
            notificationsEnabled: resolvedNotifications
          }
        })
      } catch {
        // Keep UI flow stable even if auth metadata update fails.
      }
    }
  }

  const updatePassword = async (nextPasswordRaw: string) => {
    const nextPassword = String(nextPasswordRaw || '')
    if (nextPassword.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
    const supabase = getClient()
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.updateUser({
      password: nextPassword
    })
    if (error) throw error
  }

  const signInWithPassword = async (emailRaw: string, passwordRaw: string) => {
    const email = normalizeEmail(emailRaw)
    const password = String(passwordRaw || '')
    if (!email || !password) throw new Error('Email and password are required')
    const supabase = getClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error

    session.value = data.session || null
    user.value = data.user || data.session?.user || null
    await refreshProfile()
    return data
  }

  const signUpWithEmail = async (input: {
    email: string
    password: string
    name?: string
    phone?: string
    login?: string
  }) => {
    const email = normalizeEmail(input.email)
    const password = String(input.password || '')
    const name = safeText(input.name, 100)
    const phone = normalizePhone(input.phone)
    const login = normalizeLogin(input.login)

    if (!email) throw new Error('Email is required')
    if (password.length < 8) throw new Error('Password must be at least 8 characters')

    const supabase = getClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          login
        }
      }
    })

    if (error) throw error

    session.value = data.session || null
    user.value = data.user || null

    if (data.session) {
      await saveProfile({
        name,
        email,
        phone,
        login
      })
      await refreshProfile()
    }

    return {
      ...data,
      needsEmailConfirmation: !data.session
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple', redirectTo?: string) => {
    const supabase = getClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: redirectTo
        ? {
            redirectTo
          }
        : undefined
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    const previousUserId = String(user.value?.id || '')
    const supabase = getClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    session.value = null
    user.value = null
    profile.value = null
    notificationsPreference.value = false
    clearProfileCache(previousUserId)
  }

  const setNotificationsEnabled = async (enabled: boolean) => {
    const next = enabled === true
    if (isAuthenticated.value) {
      const previousPreference = notificationsPreference.value
      const previousProfile = profile.value ? { ...profile.value } : null
      notificationsPreference.value = next
      if (profile.value) {
        profile.value = {
          ...profile.value,
          notificationsEnabled: next
        }
      }
      try {
        await saveProfile({
          notificationsEnabled: next
        })
      } catch (error) {
        notificationsPreference.value = previousPreference
        profile.value = previousProfile
        throw error
      }
    } else {
      notificationsPreference.value = next
      if (import.meta.client) {
        try {
          window.localStorage.setItem('osf_stock_notifications_v1', next ? 'enabled' : 'disabled')
        } catch {
          // Ignore localStorage write failures.
        }
      }
    }
  }

  return {
    initAuth,
    sendOtp,
    verifyOtp,
    signInWithPassword,
    signUpWithEmail,
    signInWithOAuth,
    saveProfile,
    setNotificationsEnabled,
    updatePassword,
    refreshProfile,
    logout,
    isAuthenticated,
    accessToken,
    user,
    profile,
    notificationsEnabled
  }
}
