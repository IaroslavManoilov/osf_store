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
      name: metaName,
      firstName: '',
      lastName: '',
      phone: metaPhone,
      email: normalizeEmail(user.value?.email || ''),
      login: metaLogin,
      about: '',
      currency: 'MDL',
      language: 'ru',
      notificationsEnabled: notificationsPreference.value
    }

    try {
      const data = await $fetch<{ success: boolean; legacySchema?: boolean; profile?: CustomerProfile }>('/api/account/profile', {
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
      const resolvedNotifications = legacySchema
        ? notificationsPreference.value
        : (serverProfile?.notificationsEnabled !== false)
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
        currency: (serverProfile?.currency || existing?.currency || fallbackProfile.currency || 'MDL') as CustomerProfile['currency'],
        language: (serverProfile?.language || existing?.language || fallbackProfile.language || 'ru') as CustomerProfile['language'],
        notificationsEnabled: resolvedNotifications
      }
      notificationsPreference.value = resolvedNotifications
      try {
        window.localStorage.setItem('osf_stock_notifications_v1', notificationsPreference.value ? 'enabled' : 'disabled')
      } catch {
        // Ignore localStorage write failures.
      }
    } catch {
      profile.value = fallbackProfile
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
    const currencyCandidate = input.currency !== undefined ? String(input.currency) : String(current?.currency || 'MDL')
    const currency = ['MDL', 'EUR', 'USD', 'RON'].includes(currencyCandidate.toUpperCase())
      ? (currencyCandidate.toUpperCase() as CustomerProfile['currency'])
      : ('MDL' as CustomerProfile['currency'])
    const languageCandidate = input.language !== undefined ? String(input.language) : String(current?.language || 'ru')
    const language = ['ru', 'ro', 'en'].includes(languageCandidate.toLowerCase())
      ? (languageCandidate.toLowerCase() as CustomerProfile['language'])
      : ('ru' as CustomerProfile['language'])
    const notificationsEnabled = input.notificationsEnabled !== undefined
      ? input.notificationsEnabled !== false
      : current?.notificationsEnabled !== false

    const data = await $fetch<{ success: boolean; legacySchema?: boolean; profile?: CustomerProfile }>('/api/account/profile', {
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
      await supabase.auth.updateUser({
        data: {
          name,
          phone,
          login,
          firstName: resolvedFirstName,
          lastName: resolvedLastName
        }
      })
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
    const supabase = getClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    session.value = null
    user.value = null
    profile.value = null
    notificationsPreference.value = false
  }

  const setNotificationsEnabled = async (enabled: boolean) => {
    const next = enabled === true
    if (isAuthenticated.value) {
      await saveProfile({
        notificationsEnabled: next
      })
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
    profile
    ,
    notificationsEnabled: notificationsPreference
  }
}
