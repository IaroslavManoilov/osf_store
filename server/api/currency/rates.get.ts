import { defineEventHandler } from 'h3'

type CurrencyCode = 'MDL' | 'EUR' | 'USD' | 'RON'

type RatesPayload = {
  success: boolean
  base: 'MDL'
  updatedAt: string
  rates: Record<CurrencyCode, number>
  source: string
}

const fallbackRates: Record<CurrencyCode, number> = {
  MDL: 1,
  EUR: 0.052,
  USD: 0.056,
  RON: 0.258
}

const extractRate = (html: string, code: 'EUR' | 'USD' | 'RON') => {
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const direct = new RegExp(`${escaped}[\\s\\S]{0,220}?([0-9]{1,2}[\\.,][0-9]{2,6})`, 'i').exec(html)
  if (!direct) return 0
  const parsed = Number(String(direct[1] || '').replace(',', '.'))
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  // Curs.md usually displays how much MDL for 1 unit of foreign currency.
  return 1 / parsed
}

const clampRate = (rate: number, min: number, max: number, fallback: number) => {
  if (!Number.isFinite(rate) || rate <= 0) return fallback
  if (rate < min || rate > max) return fallback
  return rate
}

export default defineEventHandler(async (): Promise<RatesPayload> => {
  let rates: Record<CurrencyCode, number> = { ...fallbackRates }
  let source = 'fallback'

  try {
    const html = await $fetch<string>('https://www.curs.md/ru', {
      responseType: 'text',
      timeout: 5000
    })

    if (typeof html === 'string' && html.length > 1000) {
      const eur = extractRate(html, 'EUR')
      const usd = extractRate(html, 'USD')
      const ron = extractRate(html, 'RON')

      rates = {
        MDL: 1,
        EUR: clampRate(eur, 0.03, 0.09, fallbackRates.EUR),
        USD: clampRate(usd, 0.03, 0.09, fallbackRates.USD),
        RON: clampRate(ron, 0.15, 0.4, fallbackRates.RON)
      }
      source = 'curs.md'
    }
  } catch {
    rates = { ...fallbackRates }
    source = 'fallback'
  }

  return {
    success: true,
    base: 'MDL',
    updatedAt: new Date().toISOString(),
    rates,
    source
  }
})

