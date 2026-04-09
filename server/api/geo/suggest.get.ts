import { createError, getQuery } from 'h3'
import { assertRateLimit } from '../../utils/rate-limit'

type GeoSuggestKind = 'city' | 'street'

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

  if (kind !== 'city' && kind !== 'street') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid kind'
    })
  }

  if (q.length < 2) {
    return {
      success: true,
      items: [] as string[]
    }
  }

  const countrycodes = countryCodesByPhoneCode[phoneCode] || 'md'
  const composedQuery = kind === 'street' && city ? `${q}, ${city}` : q
  const endpoint = `${providerUrl}?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(composedQuery)}&countrycodes=${encodeURIComponent(countrycodes)}`

  try {
    const response = await $fetch<NominatimItem[]>(endpoint, {
      headers: {
        'accept-language': 'ru,ro,en',
        'user-agent': 'ONE STYLE FOREVER / osf-store'
      }
    })

    const mapped = (Array.isArray(response) ? response : []).map((item) => {
      if (kind === 'city') {
        return (
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.municipality ||
          item.address?.state ||
          item.name ||
          item.display_name ||
          ''
        )
      }

      return (
        item.address?.road ||
        item.address?.pedestrian ||
        item.name ||
        item.display_name ||
        ''
      )
    })

    return {
      success: true,
      items: uniqueTrimmed(mapped)
    }
  } catch {
    return {
      success: true,
      items: [] as string[]
    }
  }
})
