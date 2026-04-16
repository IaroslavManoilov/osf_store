import { createError, getHeader, type H3Event } from 'h3'

type MaibTokenResponse = {
  ok?: boolean
  result?: {
    accessToken?: string
    expiresIn?: number
  }
  errors?: Array<{
    errorCode?: string
    errorMessage?: string
    errorArgs?: string[]
  }>
}

type MaibPayResponse = {
  ok?: boolean
  result?: {
    payId?: string
    payUrl?: string
  }
  errors?: Array<{
    errorCode?: string
    errorMessage?: string
    errorArgs?: string[]
  }>
}

type MaibPayInfoResponse = {
  ok?: boolean
  result?: Record<string, unknown>
  errors?: Array<{
    errorCode?: string
    errorMessage?: string
    errorArgs?: string[]
  }>
}

type CreateMaibPaymentInput = {
  amount: number
  orderId: string
  description: string
  language?: 'ru' | 'en' | 'ro'
  callbackUrl: string
  okUrl: string
  failUrl: string
  customerIp?: string
}

const normalizeBaseUrl = (value: unknown) => {
  const raw = String(value || '').trim()
  return raw.replace(/\/+$/, '')
}

const getMaibConfig = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  return {
    projectId: String(config.maibProjectId || '').trim(),
    projectSecret: String(config.maibProjectSecret || '').trim(),
    signatureKey: String(config.maibSignatureKey || '').trim(),
    apiBaseUrl: normalizeBaseUrl(config.maibApiBaseUrl || 'https://api.maibmerchants.md/v1')
  }
}

const readMaibErrorMessage = (response: { errors?: Array<{ errorMessage?: string; errorCode?: string }> }) => {
  const first = response?.errors?.[0]
  if (!first) return 'Unknown MAIB API error'
  const code = String(first.errorCode || '').trim()
  const message = String(first.errorMessage || '').trim() || 'Unknown MAIB API error'
  return code ? `${code}: ${message}` : message
}

const getClientIp = (event: H3Event) => {
  const xff = String(getHeader(event, 'x-forwarded-for') || '').trim()
  if (xff) return xff.split(',')[0]?.trim() || ''
  const realIp = String(getHeader(event, 'x-real-ip') || '').trim()
  if (realIp) return realIp
  return ''
}

const createAccessToken = async (event: H3Event) => {
  const cfg = getMaibConfig(event)
  if (!cfg.projectId || !cfg.projectSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'MAIB is not configured'
    })
  }

  const tokenResponse = await $fetch<MaibTokenResponse>(`${cfg.apiBaseUrl}/generate-token`, {
    method: 'POST',
    body: {
      projectId: cfg.projectId,
      projectSecret: cfg.projectSecret
    }
  })

  if (!tokenResponse?.ok || !tokenResponse?.result?.accessToken) {
    throw createError({
      statusCode: 502,
      statusMessage: `MAIB token error: ${readMaibErrorMessage(tokenResponse || {})}`
    })
  }

  return tokenResponse.result.accessToken
}

export const isMaibConfigured = (event: H3Event) => {
  const cfg = getMaibConfig(event)
  return !!cfg.projectId && !!cfg.projectSecret
}

export const createMaibPayment = async (event: H3Event, input: CreateMaibPaymentInput) => {
  const token = await createAccessToken(event)
  const clientIp = String(input.customerIp || '').trim() || getClientIp(event) || '127.0.0.1'

  const paymentResponse = await $fetch<MaibPayResponse>(`${getMaibConfig(event).apiBaseUrl}/pay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      amount: Number(input.amount.toFixed(2)),
      currency: 'MDL',
      orderId: input.orderId,
      description: input.description,
      callbackUrl: input.callbackUrl,
      okUrl: input.okUrl,
      failUrl: input.failUrl,
      lang: input.language || 'ru',
      clientIp
    }
  })

  const checkoutUrl = String(paymentResponse?.result?.payUrl || '').trim()
  const payId = String(paymentResponse?.result?.payId || '').trim()
  if (!paymentResponse?.ok || !checkoutUrl || !payId) {
    throw createError({
      statusCode: 502,
      statusMessage: `MAIB payment create error: ${readMaibErrorMessage(paymentResponse || {})}`
    })
  }

  return {
    payId,
    checkoutUrl
  }
}

export const fetchMaibPaymentInfo = async (event: H3Event, payId: string) => {
  const cleanPayId = String(payId || '').trim()
  if (!cleanPayId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'payId is required'
    })
  }

  const token = await createAccessToken(event)
  const response = await $fetch<MaibPayInfoResponse>(`${getMaibConfig(event).apiBaseUrl}/pay-info/${encodeURIComponent(cleanPayId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response?.ok || !response?.result) {
    throw createError({
      statusCode: 502,
      statusMessage: `MAIB payment info error: ${readMaibErrorMessage(response || {})}`
    })
  }

  return response.result
}

const collectPrimitiveValues = (value: unknown, out: string[]) => {
  if (value === null || value === undefined) return

  if (Array.isArray(value)) {
    for (const item of value) collectPrimitiveValues(item, out)
    return
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of Object.keys(record).sort((a, b) => a.localeCompare(b))) {
      collectPrimitiveValues(record[key], out)
    }
    return
  }

  out.push(String(value))
}

export const isMaibCallbackSignatureValid = (event: H3Event, body: Record<string, unknown>) => {
  const cfg = getMaibConfig(event)
  if (!cfg.signatureKey) return false

  const signature = String(body?.signature || '').trim()
  const result = body?.result
  if (!signature || !result || typeof result !== 'object') return false

  const parts: string[] = []
  collectPrimitiveValues(result, parts)
  const payload = `${parts.join(':')}:${cfg.signatureKey}`
  const expected = Buffer.from(payload, 'utf8').toString('base64')
  return expected === signature
}
