type CatalogOverridesResponse = {
  success: boolean
  overrides?: Record<string, unknown>
}

export default defineNuxtPlugin(async () => {
  const state = useState<Record<string, unknown>>('catalog-overrides-map', () => ({}))

  try {
    const response = await $fetch<CatalogOverridesResponse>('/api/catalog-overrides')
    state.value = response?.overrides && typeof response.overrides === 'object' ? response.overrides : {}
  } catch {
    state.value = {}
  }

  const globalKey = '__OSF_CATALOG_OVERRIDES__'
  if (import.meta.client) {
    ;(window as unknown as Record<string, unknown>)[globalKey] = state.value
  } else {
    ;(globalThis as unknown as Record<string, unknown>)[globalKey] = state.value
  }
})

