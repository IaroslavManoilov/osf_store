import { createError, defineEventHandler } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireCustomerAuth } from '../../utils/customer-auth'

export default defineEventHandler(async (event) => {
  const customer = await requireCustomerAuth(event)
  const supabase = getSupabaseAdmin(event)

  const { data, error } = await supabase
    .from('customer_profiles')
    .select('user_id, full_name, phone, email')
    .eq('user_id', customer.userId)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Profile load failed: ${error.message}`
    })
  }

  const profile = data
    ? {
        userId: String(data.user_id || customer.userId),
        name: String(data.full_name || '').trim(),
        phone: String(data.phone || customer.phone || '').trim(),
        email: String(data.email || customer.email || '').trim()
      }
    : {
        userId: customer.userId,
        name: '',
        phone: String(customer.phone || '').trim(),
        email: String(customer.email || '').trim()
      }

  return {
    success: true,
    profile
  }
})
