import { createError, defineEventHandler } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { requireCustomerAuth } from '../../utils/customer-auth'

type ReviewRow = {
  id: number
  order_id: string
  product_id: string
  rating: number
  review_text: string
  photo_urls: unknown
  created_at: string
}

export default defineEventHandler(async (event) => {
  const customer = await requireCustomerAuth(event)
  const supabase = getSupabaseAdmin(event)

  const { data: orderRows, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .eq('customer_user_id', customer.userId)

  if (orderError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Orders load failed: ${orderError.message}`
    })
  }

  const orderIds = Array.isArray(orderRows) ? orderRows.map((row) => String(row.id || '')).filter(Boolean) : []
  if (!orderIds.length) {
    return {
      success: true,
      reviews: []
    }
  }

  const { data: reviewRows, error: reviewError } = await supabase
    .from('product_reviews')
    .select('id, order_id, product_id, rating, review_text, photo_urls, created_at')
    .in('order_id', orderIds)
    .order('created_at', { ascending: false })

  if (reviewError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Reviews load failed: ${reviewError.message}`
    })
  }

  const { data: itemRows, error: itemError } = await supabase
    .from('order_items')
    .select('order_id, product_id, title')
    .in('order_id', orderIds)

  if (itemError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Order items load failed: ${itemError.message}`
    })
  }

  const titleMap = new Map<string, string>()
  if (Array.isArray(itemRows)) {
    for (const row of itemRows) {
      const key = `${String(row.order_id || '')}:${String(row.product_id || '')}`
      if (!titleMap.has(key)) {
        titleMap.set(key, String(row.title || '').trim())
      }
    }
  }

  const reviews = Array.isArray(reviewRows) ? (reviewRows as ReviewRow[]).map((row) => {
    const title = titleMap.get(`${row.order_id}:${row.product_id}`) || row.product_id
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      title,
      rating: Number(row.rating) || 0,
      text: String(row.review_text || '').trim(),
      photos: Array.isArray(row.photo_urls)
        ? row.photo_urls.map((photo) => String(photo || '').trim()).filter(Boolean)
        : [],
      createdAt: row.created_at
    }
  }) : []

  return {
    success: true,
    reviews
  }
})

