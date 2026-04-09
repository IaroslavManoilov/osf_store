import { createError, H3Event } from 'h3'
import type { ProductBadge } from '~/data/products'
import { getSupabaseAdmin } from './supabase-admin'

export type ProductOverrideRow = {
  product_id: string
  price: number | string | null
  badge: string | null
  is_active: boolean | null
  title_ru: string | null
  title_ro: string | null
  title_en: string | null
  short_description_ru: string | null
  short_description_ro: string | null
  short_description_en: string | null
  updated_at?: string | null
  updated_by?: string | null
}

export type ProductOverridePatch = {
  productId: string
  price?: number | null
  badge?: ProductBadge | null
  isActive?: boolean | null
  titleRu?: string | null
  titleRo?: string | null
  titleEn?: string | null
  shortDescriptionRu?: string | null
  shortDescriptionRo?: string | null
  shortDescriptionEn?: string | null
}

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const normalizePrice = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const raw = Number(value)
  if (!Number.isFinite(raw) || raw < 0 || raw > 1000000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid product price'
    })
  }
  return Math.round(raw)
}

const normalizeBadge = (value: unknown): ProductBadge | null => {
  if (value === null || value === undefined || value === '') return null
  const next = String(value).trim().toUpperCase()
  if (next !== 'NEW' && next !== 'HOT') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid product badge'
    })
  }
  return next
}

export const readProductOverrides = async (event: H3Event) => {
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('product_overrides')
    .select('product_id, price, badge, is_active, title_ru, title_ro, title_en, short_description_ru, short_description_ro, short_description_en, updated_at, updated_by')
    .order('product_id', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Product overrides load failed: ${error.message}`
    })
  }

  return (Array.isArray(data) ? data : []) as ProductOverrideRow[]
}

export const readProductOverridesSafe = async (event: H3Event) => {
  try {
    return await readProductOverrides(event)
  } catch {
    return [] as ProductOverrideRow[]
  }
}

export const upsertProductOverrides = async (event: H3Event, rows: ProductOverridePatch[], actor = 'admin') => {
  const supabase = getSupabaseAdmin(event)
  const payload = rows.map((row) => {
    const productId = String(row.productId || '').trim()
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid product id in bulk patch'
      })
    }

    const next: Record<string, unknown> = {
      product_id: productId,
      updated_by: actor.trim() || 'admin'
    }

    if ('price' in row) next.price = normalizePrice(row.price)
    if ('badge' in row) next.badge = normalizeBadge(row.badge)
    if ('isActive' in row) next.is_active = typeof row.isActive === 'boolean' ? row.isActive : null
    if ('titleRu' in row) next.title_ru = normalizeText(row.titleRu)
    if ('titleRo' in row) next.title_ro = normalizeText(row.titleRo)
    if ('titleEn' in row) next.title_en = normalizeText(row.titleEn)
    if ('shortDescriptionRu' in row) next.short_description_ru = normalizeText(row.shortDescriptionRu)
    if ('shortDescriptionRo' in row) next.short_description_ro = normalizeText(row.shortDescriptionRo)
    if ('shortDescriptionEn' in row) next.short_description_en = normalizeText(row.shortDescriptionEn)

    return next
  })

  if (!payload.length) return

  const { error } = await supabase
    .from('product_overrides')
    .upsert(payload, { onConflict: 'product_id' })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Product overrides update failed: ${error.message}`
    })
  }
}

