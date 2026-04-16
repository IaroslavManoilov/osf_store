import { createError, defineEventHandler, readBody } from 'h3'
import { getSupabaseAdmin } from '../../../../utils/supabase-admin'
import { requireAdminCsrf } from '../../../../utils/admin-session'
import { assertRateLimit } from '../../../../utils/rate-limit'
import { writeAdminAuditLog } from '../../../../utils/audit-log'

type PaymentStatus = 'pending' | 'paid' | 'cash_on_delivery'

export default defineEventHandler(async (event) => {
  const { actor } = requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-order-payment-patch',
    limit: 60,
    windowMs: 60 * 1000
  })

  const orderId = String(event.context.params?.id || '').trim()
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order id is required'
    })
  }

  const body = await readBody<{ status?: PaymentStatus }>(event)
  const nextPaymentStatus = body?.status || 'paid'

  if (nextPaymentStatus !== 'paid') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only paid status is allowed for manual confirmation'
    })
  }

  const supabase = getSupabaseAdmin(event)

  const { data: existingOrder, error: existingOrderError } = await supabase
    .from('orders')
    .select('id, payment_method, payment_status')
    .eq('id', orderId)
    .single()

  if (existingOrderError || !existingOrder) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found'
    })
  }

  const paymentMethod = String(existingOrder.payment_method || 'cash_on_delivery')
  const previousPaymentStatus = String(existingOrder.payment_status || 'cash_on_delivery')

  if (paymentMethod !== 'phone_transfer') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Manual confirmation is available only for phone transfer orders'
    })
  }

  if (previousPaymentStatus === 'paid') {
    return {
      success: true,
      orderId,
      paymentStatus: 'paid' as PaymentStatus
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid'
    })
    .eq('id', orderId)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    })
  }

  await writeAdminAuditLog(event, {
    actor,
    action: 'order.payment_confirm_manual',
    targetType: 'order',
    targetId: orderId,
    details: {
      previousPaymentStatus,
      nextPaymentStatus: 'paid',
      paymentMethod
    }
  })

  return {
    success: true,
    orderId,
    paymentStatus: 'paid' as PaymentStatus
  }
})
