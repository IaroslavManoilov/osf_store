import { computed } from 'vue'
import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

type CustomerProfile = {
  userId: string
  name: string
  phone: string
  email: string
}

let client: SupabaseClient | null = null
let initPromise: Promise<void> | null = null
let authSubscriptionSet = false

const safeText = (value: unknown, max = 120) => String(value || '').trim().slice(0, max)

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

    try {
      const data = await $fetch<{ success: boolean; profile?: CustomerProfile }>('/api/account/profile', {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      })
      profile.value = data?.profile || null
    } catch {
      profile.value = null
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

  const saveProfile = async (input: { name?: string; email?: string; phone?: string }) => {
    if (!isAuthenticated.value) throw new Error('Unauthorized')
    const name = safeText(input.name, 100)
    const email = safeText(input.email, 120)
    const phone = String(input.phone || '').replace(/[^\d+]/g, '').slice(0, 30)

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
    profile.value = data?.profile || profile.value

    const supabase = getClient()
    if (supabase) {
      await supabase.auth.updateUser({
        data: {
          name,
          phone
        }
      })
    }
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
    saveProfile,
    refreshProfile,
    logout,
    isAuthenticated,
    accessToken,
    user,
    profile
  }
}
