import { createError, defineEventHandler, readBody } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireCustomerAuth } from '../../utils/customer-auth'

type ProfilePayload = {
  name?: string
  phone?: string
  email?: string
}

const safeText = (value: unknown, max = 120) => String(value || '').trim().slice(0, max)
const normalizePhone = (value: unknown) => String(value || '').replace(/[^\d+]/g, '').slice(0, 30)

export default defineEventHandler(async (event) => {
  const customer = await requireCustomerAuth(event)
  const body = await readBody<ProfilePayload>(event)

  const name = safeText(body?.name, 100)
  const email = safeText(body?.email, 120)
  const phone = normalizePhone(body?.phone || customer.phone)

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }

  if (!phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone is required'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const { error } = await supabase
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
      phone,
      email
    }
  }
})
