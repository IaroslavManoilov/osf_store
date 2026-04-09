const RECENTLY_VIEWED_KEY = 'osf_recently_viewed_v1'
const RECENTLY_VIEWED_LIMIT = 12

type RecentlyViewedEntry = {
  id: string
  viewedAt: string
}

const safeParseRecentlyViewed = (raw: string | null) => {
  if (!raw) return [] as RecentlyViewedEntry[]
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is RecentlyViewedEntry =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as RecentlyViewedEntry).id === 'string'
      )
      .map((item) => ({
        id: String(item.id || '').trim(),
        viewedAt: typeof item.viewedAt === 'string' ? item.viewedAt : ''
      }))
      .filter((item) => !!item.id)
  } catch {
    return []
  }
}

export const getRecentlyViewedIds = () => {
  if (!import.meta.client) return [] as string[]
  const list = safeParseRecentlyViewed(window.localStorage.getItem(RECENTLY_VIEWED_KEY))
  return list
    .sort((a, b) => String(b.viewedAt || '').localeCompare(String(a.viewedAt || '')))
    .map((item) => item.id)
}

export const addRecentlyViewed = (id: string) => {
  if (!import.meta.client) return
  const normalized = String(id || '').trim()
  if (!normalized) return

  const existing = safeParseRecentlyViewed(window.localStorage.getItem(RECENTLY_VIEWED_KEY))
  const next: RecentlyViewedEntry[] = [
    { id: normalized, viewedAt: new Date().toISOString() },
    ...existing.filter((item) => item.id !== normalized)
  ].slice(0, RECENTLY_VIEWED_LIMIT)

  try {
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
  } catch {
    // Ignore localStorage write errors.
  }
}
