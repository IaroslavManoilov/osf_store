import { computed } from 'vue'
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

type CustomerProfile = {
  userId: string
  name: string
  phone: string
  email: string
  login?: string
}

let client: SupabaseClient | null = null
let initPromise: Promise<void> | null = null
let authSubscriptionSet = false

const safeText = (value: unknown, max = 120) => String(value || '').trim().slice(0, max)
const normalizePhone = (value: unknown) => String(value || '').replace(/[^\d+]/g, '').slice(0, 30)
const normalizeEmail = (value: unknown) => safeText(value, 160).toLowerCase()
const normalizeLogin = (value: unknown) => safeText(value, 60).replace(/\s+/g, '')

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
      phone: metaPhone,
      email: normalizeEmail(user.value?.email || ''),
      login: metaLogin
    }

    try {
      const data = await $fetch<{ success: boolean; profile?: CustomerProfile }>('/api/account/profile', {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      })
      profile.value = {
        ...(data?.profile || fallbackProfile),
        login: normalizeLogin(data?.profile?.login || metaLogin)
      }
    } catch {
      profile.value = fallbackProfile
    }
  }

  const initAuth = async () => {
    if (!import.meta.client) return
    if (initialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
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

  const saveProfile = async (input: { name?: string; email?: string; phone?: string; login?: string }) => {
    if (!isAuthenticated.value) throw new Error('Unauthorized')
    const name = safeText(input.name, 100)
    const email = safeText(input.email, 120)
    const phone = normalizePhone(input.phone)
    const login = normalizeLogin(input.login)

    const data = await $fetch<{ success: boolean; profile?: CustomerProfile }>('/api/account/profile', {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${accessToken.value}`
      },
      body: {
        name,
        email,
        phone
      }
    })
    profile.value = {
      ...(data?.profile || profile.value || {
        userId: String(user.value?.id || ''),
        name,
        phone,
        email
      }),
      login
    }

    const supabase = getClient()
    if (supabase) {
      await supabase.auth.updateUser({
        data: {
          name,
          phone,
          login
        }
      })
    }
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
  }

  return {
    initAuth,
    sendOtp,
    verifyOtp,
    signInWithPassword,
    signUpWithEmail,
    signInWithOAuth,
    saveProfile,
    refreshProfile,
    logout,
    isAuthenticated,
    accessToken,
    user,
    profile
  }
}
