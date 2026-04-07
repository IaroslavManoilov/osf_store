import { createError, getRequestIP, H3Event } from 'h3'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export const assertRateLimit = (
  event: H3Event,
  options: {
    namespace: string
    limit: number
    windowMs: number
  }
) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const key = `${options.namespace}:${ip}`
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs
    })
    return
  }

  if (current.count >= options.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    throw createError({
      statusCode: 429,
      statusMessage: `Too many requests. Retry in ${retryAfterSec}s.`
    })
  }

  current.count += 1
  buckets.set(key, current)
}

