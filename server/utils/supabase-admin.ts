import { createError, type H3Event } from 'h3'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null
let cachedUrl = ''
let cachedKey = ''

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
