import { createError, readBody } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { readOrderById } from '../../utils/order-storage'
import { verifyOrderTrackToken } from '../../utils/order-track-token'
import { assertRateLimit } from '../../utils/rate-limit'

type SavedTrack = {
  id?: string
  token?: string
}

type Payload = {
  productId?: string
  rating?: number
  text?: string
  photos?: string[]
  tracks?: SavedTrack[]
}

const normalizePhotos = (value: unknown) => {
  if (!Array.isArray(value)) return [] as string[]
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.slice(0, 400_000))
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'reviews-submit',
    limit: 12,
    windowMs: 60 * 1000
  })

  const body = await readBody<Payload>(event)
  const productId = String(body?.productId || '').trim()
  const rating = Math.round(Number(body?.rating || 0))
  const text = String(body?.text || '').trim().slice(0, 1200)
  const photos = normalizePhotos(body?.photos)
  const tracks = Array.isArray(body?.tracks) ? body!.tracks! : []

  if (!productId || !text || rating < 1 || rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid review payload'
    })
  }

  const config = useRuntimeConfig(event)
  const secret = config.orderTrackSecret || config.adminKey || 'osf-order-track-secret'

  let matchedOrderId = ''
  let matchedPhone = ''
  let matchedSize = ''

  for (const raw of tracks.slice(0, 40)) {
    const orderId = String(raw?.id || '').trim()
    const token = String(raw?.token || '').trim()
    if (!orderId || !token) continue

    const order = await readOrderById(event, orderId)
    if (!order || order.status !== 'delivered') continue

    const valid = verifyOrderTrackToken(secret, order.id, order.customer.phone, token)
    if (!valid) continue

    const matchedItem = order.items.find((item) => item.id === productId)
    if (!matchedItem) continue

    matchedOrderId = order.id
    matchedPhone = order.customer.phone
    matchedSize = String(matchedItem.selectedSize || '').trim().toUpperCase()
    break
  }

  if (!matchedOrderId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Review is available only after delivered purchase'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const { error } = await supabase
    .from('product_reviews')
    .upsert({
      order_id: matchedOrderId,
      product_id: productId,
      customer_phone: matchedPhone,
      selected_size: matchedSize || null,
      rating,
      review_text: text,
      photo_urls: photos,
      verified: true,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'order_id,product_id'
    })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Review save failed: ${error.message}`
    })
  }

  return {
    success: true
  }
})

