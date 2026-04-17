import { createError, defineEventHandler, readBody } from 'h3'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { fetchMaibPaymentInfo, isMaibCallbackSignatureValid } from '../../../utils/maib'

const safeText = (value: unknown) => String(value || '').trim()

export default defineEventHandler(async (event) => {
  const body = (await readBody<Record<string, unknown>>(event).catch(() => ({} as Record<string, unknown>))) || {}
  const result = (body.result && typeof body.result === 'object' ? body.result : {}) as Record<string, unknown>

  const orderId = safeText(result.orderId || body.orderId)
  const payId = safeText(result.payId || body.payId)
  const callbackStatus = safeText(result.status || body.status).toUpperCase()

  if (!orderId) {
    return { received: true, ignored: 'missing_order_id' }
  }

  const signatureValid = isMaibCallbackSignatureValid(event, body)
  if (!signatureValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid MAIB callback signature'
    })
  }

  let paymentInfoStatus = callbackStatus
  if (payId) {
    try {
      const paymentInfo = await fetchMaibPaymentInfo(event, payId)
      paymentInfoStatus = safeText(paymentInfo.status || paymentInfoStatus).toUpperCase()
    } catch {
      // If pay-info request fails, keep callback status and do not break callback response contract.
    }
  }

  if (paymentInfoStatus !== 'OK' && paymentInfoStatus !== 'PAID') {
    return { received: true, orderId, status: paymentInfoStatus || 'UNKNOWN' }
  }

  const supabase = getSupabaseAdmin(event)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { received: true, ignored: 'order_not_found', orderId }
  }

  const previousStatus = safeText(order.status)
  const previousPaymentStatus = safeText(order.payment_status)
  const nextStatus = previousStatus === 'new' ? 'confirmed' : previousStatus || 'confirmed'
  const nowIso = new Date().toISOString()

  const updatePayload: Record<string, unknown> = {
    payment_status: 'paid',
    updated_at: nowIso
  }
  if (previousStatus === 'new') {
    updatePayload.status = 'confirmed'
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message
    })
  }

  if (previousStatus === 'new') {
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: 'confirmed',
      changed_at: nowIso,
      note: 'MAIB payment confirmed',
      actor: 'maib-webhook'
    })
  } else if (previousPaymentStatus !== 'paid') {
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: nextStatus,
      changed_at: nowIso,
      note: 'MAIB payment confirmed',
      actor: 'maib-webhook'
    })
  }

  return {
    received: true,
    orderId,
    paymentStatus: 'paid',
    status: nextStatus
  }
})
