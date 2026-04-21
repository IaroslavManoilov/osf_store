import { createError, type H3Event } from 'h3'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null
let cachedUrl = ''
let cachedKey = ''
let cachedAnonClient: SupabaseClient | null = null
let cachedAnonUrl = ''
let cachedAnonKey = ''

export function getSupabaseAdmin(event: H3Event) {
  const config = useRuntimeConfig(event)
  const supabaseUrl = String(config.supabaseUrl || '').trim()
  const supabaseServiceRoleKey = String(config.supabaseServiceRoleKey || '').trim()

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase is not configured. Set NUXT_SUPABASE_URL and NUXT_SUPABASE_SERVICE_ROLE_KEY.'
    })
  }

  if (!cachedClient || cachedUrl !== supabaseUrl || cachedKey !== supabaseServiceRoleKey) {
    cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    cachedUrl = supabaseUrl
    cachedKey = supabaseServiceRoleKey
  }

  return cachedClient
}

export function getSupabaseAnon(event: H3Event) {
  const config = useRuntimeConfig(event)
  const supabaseUrl = String(config.public?.supabaseUrl || config.supabaseUrl || '').trim()
  const supabaseAnonKey = String(config.public?.supabaseAnonKey || '').trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase public auth is not configured. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.'
    })
  }

  if (!cachedAnonClient || cachedAnonUrl !== supabaseUrl || cachedAnonKey !== supabaseAnonKey) {
    cachedAnonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    cachedAnonUrl = supabaseUrl
    cachedAnonKey = supabaseAnonKey
  }

  return cachedAnonClient
}

export const getSupabaseAdminClient = getSupabaseAdmin
