type AnalyticsPayload = Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export const useAnalytics = () => {
  const track = (event: string, payload: AnalyticsPayload = {}) => {
    if (!import.meta.client) return

    const record = {
      event,
      timestamp: new Date().toISOString(),
      ...payload
    }

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(record)

    // Keep a lightweight local trail for debugging funnels in dev.
    try {
      const key = 'osf_analytics_events_v1'
      const raw = window.localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : []
      const events = Array.isArray(parsed) ? parsed : []
      events.push(record)
      window.localStorage.setItem(key, JSON.stringify(events.slice(-200)))
    } catch {
      // Ignore storage failures in private mode.
    }
  }

  return { track }
}

