import { createError, getQuery } from 'h3'
import { assertRateLimit } from '../../utils/rate-limit'

type GeoSuggestKind = 'city' | 'street' | 'address'

type GeoSuggestEntry = {
  value: string
  city?: string
  street?: string
  house?: string
  postalCode?: string
}

type NominatimItem = {
  display_name?: string
  name?: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
    road?: string
    pedestrian?: string
    house_number?: string
    postcode?: string
  }
}

const providerUrl = 'https://nominatim.openstreetmap.org/search'

const countryCodesByPhoneCode: Record<string, string> = {
  '+373': 'md',
  '+40': 'ro',
  '+380': 'ua',
  '+7': 'ru,kz',
  '+49': 'de'
}

const uniqueTrimmed = (items: string[]) =>
  Array.from(
    new Set(items.map((item) => String(item || '').trim()).filter(Boolean))
  ).slice(0, 8)

const normalizeEntry = (entry: GeoSuggestEntry): GeoSuggestEntry | null => {
  const value = String(entry.value || '').trim()
  if (!value) return null
  const city = String(entry.city || '').trim()
  const street = String(entry.street || '').trim()
  const postalCode = String(entry.postalCode || '').trim()
  return {
    value,
    city: city || undefined,
    street: street || undefined,
    house: String(entry.house || '').trim() || undefined,
    postalCode: postalCode || undefined
  }
}

const uniqueEntries = (items: GeoSuggestEntry[]) => {
  const map = new Map<string, GeoSuggestEntry>()
  for (const raw of items) {
    const normalized = normalizeEntry(raw)
    if (!normalized) continue
    if (!map.has(normalized.value)) {
      map.set(normalized.value, normalized)
    }
  }
  return Array.from(map.values()).slice(0, 8)
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'geo-suggest',
    limit: 24,
    windowMs: 60 * 1000
  })

  const query = getQuery(event)
  const kind = String(query.kind || 'city') as GeoSuggestKind
  const q = String(query.q || '').trim()
  const phoneCode = String(query.phoneCode || '+373').trim()
  const city = String(query.city || '').trim()

  if (kind !== 'city' && kind !== 'street' && kind !== 'address') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid kind'
    })
  }

  if (q.length < 2) {
    return {
      success: true,
      entries: [] as GeoSuggestEntry[],
      items: [] as string[]
    }
  }

  const countrycodes = countryCodesByPhoneCode[phoneCode] || 'md'
  const composedQuery = (kind === 'street' || kind === 'address') && city ? `${q}, ${city}` : q
  const endpoint = `${providerUrl}?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(composedQuery)}&countrycodes=${encodeURIComponent(countrycodes)}`

  try {
    const response = await $fetch<NominatimItem[]>(endpoint, {
      headers: {
        'accept-language': 'ru,ro,en',
        'user-agent': 'ONE STYLE FOREVER / osf-store'
      }
    })

    const entries = (Array.isArray(response) ? response : []).map((item) => {
      const cityValue =
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.address?.municipality ||
        item.address?.state ||
        ''
      const streetValue =
        item.address?.road ||
        item.address?.pedestrian ||
        ''
      const houseNumber = item.address?.house_number || ''
      const postalCode = item.address?.postcode || ''

      if (kind === 'city') {
        return {
          value: cityValue || item.name || item.display_name || '',
          city: cityValue,
          postalCode
        } satisfies GeoSuggestEntry
      }

      if (kind === 'address') {
        const addressLine = [streetValue, houseNumber].filter(Boolean).join(' ')
        const addressDisplay = [addressLine, cityValue].filter(Boolean).join(', ')
        return {
          value: addressDisplay || item.display_name || item.name || '',
          city: cityValue,
          street: streetValue || undefined,
          house: houseNumber || undefined,
          postalCode
        } satisfies GeoSuggestEntry
      }

      return {
        value: streetValue || item.name || item.display_name || '',
        city: cityValue,
        street: streetValue,
        postalCode
      } satisfies GeoSuggestEntry
    })

    const normalizedEntries = uniqueEntries(entries)

    return {
      success: true,
      entries: normalizedEntries,
      items: uniqueTrimmed(normalizedEntries.map((item) => item.value))
    }
  } catch {
    return {
      success: true,
      entries: [] as GeoSuggestEntry[],
      items: [] as string[]
    }
  }
})
