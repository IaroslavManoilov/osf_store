export default defineNuxtPlugin(async () => {
  const auth = useCustomerAuth()
  const { locale, setLocale } = useI18n()

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

  if (targetLanguage && targetLanguage !== locale.value) {
    await setLocale(targetLanguage as 'ru' | 'ro' | 'en')
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
