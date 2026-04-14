import { createError, defineEventHandler, readRawBody } from 'h3'
import { getSupabaseAdmin } from '../../../utils/supabase-admin'
import { getStripeClient, getStripeSignature, getStripeWebhookSecret } from '../../../utils/stripe'

export default defineEventHandler(async (event) => {
  const webhookSecret = getStripeWebhookSecret(event)
  if (!webhookSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Stripe webhook secret is not configured'
    })
  }

  const signature = getStripeSignature(event)
  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Stripe signature'
    })
  }

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing webhook body'
    })
  }

  const stripe = getStripeClient(event)
  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Stripe signature'
    })
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { received: true }
  }

  const session = stripeEvent.data.object
  const orderId = String(
    session.metadata?.order_id ||
      session.client_reference_id ||
      ''
  ).trim()

  if (!orderId) {
    return { received: true }
  }

  const supabase = getSupabaseAdmin(event)

  await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: 'confirmed',
    changed_at: new Date().toISOString(),
    note: 'Stripe payment confirmed',
    actor: 'stripe-webhook'
  })

  return { received: true }
})
