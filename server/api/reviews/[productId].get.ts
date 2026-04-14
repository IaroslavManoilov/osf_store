import { createError, getRouterParam } from 'h3'
import { getSupabaseAdmin } from '../../utils/supabase-admin'
import { assertRateLimit } from '../../utils/rate-limit'

type ReviewRow = {
  rating: number
  review_text: string
  created_at: string
  photo_urls: unknown
  verified: boolean | null
  selected_size: string | null
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'reviews-get-product',
    limit: 120,
    windowMs: 60 * 1000
  })

  const productId = String(getRouterParam(event, 'productId') || '').trim()
  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('product_reviews')
    .select('rating, review_text, created_at, photo_urls, verified, selected_size')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(120)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Review read failed: ${error.message}`
    })
  }

  const rows = (Array.isArray(data) ? data : []) as ReviewRow[]

  const reviews = rows.map((row) => ({
    rating: Math.max(1, Math.min(5, Number(row.rating || 0) || 5)),
    text: String(row.review_text || '').trim(),
    createdAt: String(row.created_at || new Date().toISOString()),
    photos: Array.isArray(row.photo_urls)
      ? row.photo_urls.filter((item): item is string => typeof item === 'string').slice(0, 2)
      : [],
    verified: row.verified !== false,
    selectedSize: String(row.selected_size || '').trim().toUpperCase() || undefined
  }))

  const bySize: Record<string, { count: number; average: number }> = {}
  const bucket = new Map<string, { sum: number; count: number }>()
  for (const item of reviews) {
    const size = String(item.selectedSize || '').trim().toUpperCase()
    if (!size) continue
    const current = bucket.get(size) || { sum: 0, count: 0 }
    current.sum += item.rating
    current.count += 1
    bucket.set(size, current)
  }
  for (const [size, stat] of bucket.entries()) {
    bySize[size] = {
      count: stat.count,
      average: Number((stat.sum / stat.count).toFixed(1))
    }
  }

  return {
    success: true,
    reviews,
    bySize
  }
})

