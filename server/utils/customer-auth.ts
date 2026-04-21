import { createError, getHeader, type H3Event } from 'h3'
import { getSupabaseAdmin, getSupabaseAnon } from './supabase-admin'

export type AuthenticatedCustomer = {
  userId: string
  phone: string
  email: string
}

const getBearerToken = (event: H3Event) => {
  const auth = String(getHeader(event, 'authorization') || '').trim()
  if (!auth.toLowerCase().startsWith('bearer ')) return ''
  return auth.slice(7).trim()
}

export const requireCustomerAuth = async (event: H3Event): Promise<AuthenticatedCustomer> => {
  const token = getBearerToken(event)
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  let supabase: ReturnType<typeof getSupabaseAdmin> | ReturnType<typeof getSupabaseAnon>
  try {
    supabase = getSupabaseAdmin(event)
  } catch {
    // Fallback for environments without service role key: token validation still works with anon.
    try {
      supabase = getSupabaseAnon(event)
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Customer auth is not configured. Set Supabase URL and keys.'
      })
    }
  }
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return {
    userId: data.user.id,
    phone: String(data.user.phone || data.user.user_metadata?.phone || '').trim(),
    email: String(data.user.email || '').trim()
  }
}
