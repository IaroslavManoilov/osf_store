import { defineEventHandler } from 'h3'
import { readProductOverridesSafe } from '../utils/product-overrides'
import { assertRateLimit } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'catalog-overrides-get',
    limit: 180,
    windowMs: 60 * 1000
  })

  const rows = await readProductOverridesSafe(event)
  const overrides = rows.reduce<Record<string, any>>((acc, row) => {
    const id = String(row.product_id || '').trim()
    if (!id) return acc

    acc[id] = {
      price: row.price === null ? null : Number(row.price),
      badge: row.badge || null,
      isActive: row.is_active === null ? null : !!row.is_active,
      titleRu: row.title_ru || null,
      titleRo: row.title_ro || null,
      titleEn: row.title_en || null,
      shortDescriptionRu: row.short_description_ru || null,
      shortDescriptionRo: row.short_description_ro || null,
      shortDescriptionEn: row.short_description_en || null
    }
    return acc
  }, {})

  return {
    success: true,
    overrides
  }
})

