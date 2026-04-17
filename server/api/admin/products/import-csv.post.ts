import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminCsrf } from '../../../utils/admin-session'
import { assertRateLimit } from '../../../utils/rate-limit'
import { upsertProductOverrides, type ProductOverridePatch } from '../../../utils/product-overrides'
import { setInventoryForProduct } from '../../../utils/inventory'
import { writeAdminAuditLog } from '../../../utils/audit-log'

type BodyPayload = {
  csv?: string
}

type CsvRow = Record<string, string>

const normalizeHeader = (value: string) => String(value || '').trim().toLowerCase()

const parseCsvLine = (line: string, delimiter: string) => {
  const out: string[] = []
  let token = ''
  let quoted = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      const next = line[i + 1]
      if (quoted && next === '"') {
        token += '"'
        i += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (!quoted && char === delimiter) {
      out.push(token.trim())
      token = ''
      continue
    }

    token += char
  }

  out.push(token.trim())
  return out
}

const detectDelimiter = (headerLine: string) => {
  const comma = parseCsvLine(headerLine, ',').length
  const semicolon = parseCsvLine(headerLine, ';').length
  return semicolon > comma ? ';' : ','
}

const parseCsv = (csv: string): CsvRow[] => {
  const lines = String(csv || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (!lines.length) return []
  const headerLine = String(lines[0] || '')
  const delimiter = detectDelimiter(headerLine)
  const headers = parseCsvLine(headerLine, delimiter).map(normalizeHeader)

  if (!headers.length) return []

  const rows: CsvRow[] = []
  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(String(lines[index] || ''), delimiter)
    const row: CsvRow = {}

    for (let col = 0; col < headers.length; col += 1) {
      const key = headers[col]
      if (!key) continue
      row[key] = String(values[col] ?? '').trim()
    }

    rows.push(row)
  }

  return rows
}

const boolFromCsv = (value: string): boolean | null => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return null
  if (['1', 'true', 'yes', 'y', 'on', 'active'].includes(normalized)) return true
  if (['0', 'false', 'no', 'n', 'off', 'inactive'].includes(normalized)) return false
  return null
}

const intFromCsv = (value: string): number | null => {
  const normalized = String(value || '').trim()
  if (!normalized.length) return null
  const parsed = Number(normalized.replace(',', '.'))
  if (!Number.isFinite(parsed)) return null
  return Math.round(parsed)
}

const textFromCsv = (value: string): string | null => {
  const normalized = String(value || '').trim()
  return normalized.length ? normalized : null
}

const pick = (row: CsvRow, keys: string[]) => {
  for (const key of keys) {
    const normalized = normalizeHeader(key)
    if (normalized in row) return row[normalized] ?? ''
  }
  return ''
}

export default defineEventHandler(async (event) => {
  const { actor } = requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-products-import-csv',
    limit: 10,
    windowMs: 60 * 1000
  })

  const body = await readBody<BodyPayload>(event)
  const rawCsv = String(body?.csv || '')
  if (!rawCsv.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CSV is empty'
    })
  }

  const rows = parseCsv(rawCsv)
  if (!rows.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CSV rows not found'
    })
  }

  if (rows.length > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Too many rows. Max 1000'
    })
  }

  const productPatchById = new Map<string, ProductOverridePatch>()
  const inventoryById = new Map<string, Record<string, number>>()
  const errors: string[] = []

  rows.forEach((row, idx) => {
    const line = idx + 2
    const productId = String(
      pick(row, ['product_id', 'productid', 'id', 'sku', 'code'])
    ).trim()

    if (!productId) {
      errors.push(`Line ${line}: product_id is required`)
      return
    }

    const currentPatch = productPatchById.get(productId) || { productId }
    const priceRaw = pick(row, ['price'])
    const badgeRaw = pick(row, ['badge'])
    const activeRaw = pick(row, ['is_active', 'active', 'enabled'])
    const titleRuRaw = pick(row, ['title_ru', 'ru_title'])
    const titleRoRaw = pick(row, ['title_ro', 'ro_title'])
    const titleEnRaw = pick(row, ['title_en', 'en_title'])
    const shortRuRaw = pick(row, ['short_ru', 'short_description_ru', 'ru_short'])
    const shortRoRaw = pick(row, ['short_ro', 'short_description_ro', 'ro_short'])
    const shortEnRaw = pick(row, ['short_en', 'short_description_en', 'en_short'])

    if (String(priceRaw || '').trim().length) {
      const parsedPrice = intFromCsv(priceRaw)
      if (parsedPrice === null || parsedPrice < 0 || parsedPrice > 1000000) {
        errors.push(`Line ${line}: invalid price`)
      } else {
        currentPatch.price = parsedPrice
      }
    }

    if (String(badgeRaw || '').trim().length) {
      const badge = String(badgeRaw || '').trim().toUpperCase()
      if (badge === 'NEW' || badge === 'HOT') {
        currentPatch.badge = badge
      } else {
        errors.push(`Line ${line}: invalid badge (use NEW/HOT)`)
      }
    }

    if (String(activeRaw || '').trim().length) {
      const parsedActive = boolFromCsv(activeRaw)
      if (parsedActive === null) {
        errors.push(`Line ${line}: invalid is_active (use true/false or 1/0)`)
      } else {
        currentPatch.isActive = parsedActive
      }
    }

    if (String(titleRuRaw || '').trim().length) currentPatch.titleRu = textFromCsv(titleRuRaw)
    if (String(titleRoRaw || '').trim().length) currentPatch.titleRo = textFromCsv(titleRoRaw)
    if (String(titleEnRaw || '').trim().length) currentPatch.titleEn = textFromCsv(titleEnRaw)
    if (String(shortRuRaw || '').trim().length) currentPatch.shortDescriptionRu = textFromCsv(shortRuRaw)
    if (String(shortRoRaw || '').trim().length) currentPatch.shortDescriptionRo = textFromCsv(shortRoRaw)
    if (String(shortEnRaw || '').trim().length) currentPatch.shortDescriptionEn = textFromCsv(shortEnRaw)

    productPatchById.set(productId, currentPatch)

    const stockSRaw = pick(row, ['stock_s', 's', 'size_s'])
    const stockMRaw = pick(row, ['stock_m', 'm', 'size_m'])
    const stockLRaw = pick(row, ['stock_l', 'l', 'size_l'])
    const nextInventory = inventoryById.get(productId) || {}

    if (String(stockSRaw || '').trim().length) {
      const parsed = intFromCsv(stockSRaw)
      if (parsed === null || parsed < 0 || parsed > 9999) errors.push(`Line ${line}: invalid stock_s`)
      else nextInventory.S = parsed
    }
    if (String(stockMRaw || '').trim().length) {
      const parsed = intFromCsv(stockMRaw)
      if (parsed === null || parsed < 0 || parsed > 9999) errors.push(`Line ${line}: invalid stock_m`)
      else nextInventory.M = parsed
    }
    if (String(stockLRaw || '').trim().length) {
      const parsed = intFromCsv(stockLRaw)
      if (parsed === null || parsed < 0 || parsed > 9999) errors.push(`Line ${line}: invalid stock_l`)
      else nextInventory.L = parsed
    }

    if (Object.keys(nextInventory).length) {
      inventoryById.set(productId, nextInventory)
    }
  })

  if (errors.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `CSV validation failed: ${errors.slice(0, 8).join('; ')}`
    })
  }

  const productPatches = Array.from(productPatchById.values()).filter((item) => {
    return (
      'price' in item ||
      'badge' in item ||
      'isActive' in item ||
      'titleRu' in item ||
      'titleRo' in item ||
      'titleEn' in item ||
      'shortDescriptionRu' in item ||
      'shortDescriptionRo' in item ||
      'shortDescriptionEn' in item
    )
  })

  if (productPatches.length) {
    await upsertProductOverrides(event, productPatches, actor)
    await writeAdminAuditLog(event, {
      actor,
      action: 'products.csv_import',
      targetType: 'product',
      details: {
        count: productPatches.length,
        ids: productPatches.map((item) => item.productId).slice(0, 100)
      }
    })
  }

  const inventoryEntries = Array.from(inventoryById.entries())
  for (const [productId, sizes] of inventoryEntries) {
    await setInventoryForProduct(event, productId, sizes, actor)
  }

  if (inventoryEntries.length) {
    await writeAdminAuditLog(event, {
      actor,
      action: 'inventory.csv_import',
      targetType: 'product',
      details: {
        count: inventoryEntries.length,
        ids: inventoryEntries.map(([productId]) => productId).slice(0, 100)
      }
    })
  }

  return {
    success: true,
    importedRows: rows.length,
    updatedProducts: productPatches.length,
    updatedInventory: inventoryEntries.length
  }
})
