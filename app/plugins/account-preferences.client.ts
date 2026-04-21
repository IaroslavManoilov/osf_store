import type { Ref } from 'vue'

export default defineNuxtPlugin(async () => {
  const auth = useCustomerAuth()
  const nuxtApp = useNuxtApp()
  const i18n = nuxtApp.$i18n as
    | {
        locale?: Ref<string>
        setLocale?: (locale: 'ru' | 'ro' | 'en') => Promise<void> | void
      }
    | undefined

  if (!import.meta.client) return

  try {
    await auth.initAuth()
  } catch {
    // Ignore auth init failures here.
  }

  const savedLanguage = String(window.localStorage.getItem('osf_pref_language_v1') || '').trim().toLowerCase()
  const profileLanguage = String(auth.profile.value?.language || '').trim().toLowerCase()
  const targetLanguage = ['ru', 'ro', 'en'].includes(profileLanguage)
    ? profileLanguage
    : ['ru', 'ro', 'en'].includes(savedLanguage)
      ? savedLanguage
      : ''

  if (targetLanguage && targetLanguage !== i18n?.locale?.value) {
    if (typeof i18n?.setLocale === 'function') {
      await i18n.setLocale(targetLanguage as 'ru' | 'ro' | 'en')
    } else if (i18n?.locale) {
      i18n.locale.value = targetLanguage
    }
  }

  const profileNotices = auth.profile.value?.notificationsEnabled
  if (typeof profileNotices === 'boolean') {
    try {
      window.localStorage.setItem('osf_stock_notifications_v1', profileNotices ? 'enabled' : 'disabled')
    } catch {
      // Ignore localStorage write failures.
    }
  }
})
