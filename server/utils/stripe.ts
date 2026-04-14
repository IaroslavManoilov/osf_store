import Stripe from 'stripe'
import { createError, getHeader, type H3Event } from 'h3'

export const getStripeClient = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const secretKey = String(config.stripeSecretKey || '').trim()
  if (!secretKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Stripe is not configured'
    })
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-03-31.basil'
  })
}

export const getStripeWebhookSecret = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  return String(config.stripeWebhookSecret || '').trim()
}

export const getStripeSignature = (event: H3Event) => String(getHeader(event, 'stripe-signature') || '').trim()

export const getSiteUrl = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  return String(config.public?.siteUrl || 'https://onestyleforever.com').replace(/\/+$/, '')
}
