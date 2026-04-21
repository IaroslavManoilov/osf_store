<template>
  <div class="account-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card account-hero">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title account-title">{{ ui.title }}</h1>
          <p class="section-text account-subtitle">{{ ui.subtitle }}</p>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="account-layout">
          <aside class="surface-card account-sidebar">
            <strong>{{ ui.quickMenu }}</strong>
            <NuxtLink :to="localePath('/orders')" class="account-side-link">{{ ui.myOrders }}</NuxtLink>
            <a href="#profile" class="account-side-link">{{ ui.profile }}</a>
            <a href="#settings" class="account-side-link">{{ ui.settings }}</a>
            <a href="#security" class="account-side-link">{{ ui.security }}</a>
            <button type="button" class="btn-alt logout-btn" @click="logout">{{ ui.logout }}</button>
          </aside>

          <div class="account-main">
            <section id="profile" class="surface-card account-card">
              <h2>{{ ui.profile }}</h2>
              <p class="account-help">{{ ui.profileHelp }}</p>
              <form class="account-form" @submit.prevent="saveProfile">
                <label class="field">
                  <span>{{ ui.firstName }}</span>
                  <input v-model.trim="form.firstName" type="text" autocomplete="given-name" required />
                </label>
                <label class="field">
                  <span>{{ ui.lastName }}</span>
                  <input v-model.trim="form.lastName" type="text" autocomplete="family-name" />
                </label>
                <label class="field">
                  <span>{{ ui.login }}</span>
                  <input v-model.trim="form.login" type="text" autocomplete="username" required />
                </label>
                <label class="field">
                  <span>{{ ui.phone }}</span>
                  <input v-model.trim="form.phone" type="tel" autocomplete="tel" required />
                </label>
                <label class="field field-wide">
                  <span>{{ ui.email }}</span>
                  <input v-model.trim="form.email" type="email" autocomplete="email" required />
                </label>
                <label class="field field-wide">
                  <span>{{ ui.about }}</span>
                  <textarea v-model.trim="form.about" rows="4" :placeholder="ui.aboutPlaceholder" />
                </label>
                <div class="field-wide account-form-actions">
                  <button type="submit" class="btn-main" :disabled="savingProfile">
                    {{ savingProfile ? ui.saving : ui.saveProfile }}
                  </button>
                </div>
              </form>
            </section>

            <section id="settings" class="surface-card account-card">
              <h2>{{ ui.settings }}</h2>
              <p class="account-help">{{ ui.settingsHelp }}</p>
              <div class="account-settings-grid">
                <label class="field">
                  <span>{{ ui.currency }}</span>
                  <select v-model="form.currency">
                    <option value="MDL">MDL</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="RON">RON</option>
                  </select>
                </label>
                <label class="field">
                  <span>{{ ui.language }}</span>
                  <select v-model="form.language">
                    <option value="ru">RU</option>
                    <option value="ro">RO</option>
                    <option value="en">EN</option>
                  </select>
                </label>
                <label class="field field-wide">
                  <span>{{ ui.notifications }}</span>
                  <div class="toggle-row">
                    <button
                      type="button"
                      class="toggle-btn"
                      :class="{ active: form.notificationsEnabled }"
                      :disabled="savingNotifications"
                      @click="toggleNotificationsSetting"
                    >
                      {{ form.notificationsEnabled ? ui.notificationsOn : ui.notificationsOff }}
                    </button>
                    <small>{{ ui.notificationsHint }}</small>
                  </div>
                </label>
              </div>
            </section>

            <section id="security" class="surface-card account-card">
              <h2>{{ ui.security }}</h2>
              <p class="account-help">{{ ui.securityHelp }}</p>
              <form class="account-form" @submit.prevent="changePassword">
                <label class="field field-wide">
                  <span>{{ ui.newPassword }}</span>
                  <div class="password-row">
                    <input
                      v-model="passwordForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      minlength="8"
                      required
                    />
                    <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                      {{ showPassword ? ui.hide : ui.show }}
                    </button>
                  </div>
                </label>
                <label class="field field-wide">
                  <span>{{ ui.confirmPassword }}</span>
                  <input
                    v-model="passwordForm.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    minlength="8"
                    required
                  />
                </label>
                <div class="field-wide account-form-actions">
                  <button type="submit" class="btn-main" :disabled="savingPassword">
                    {{ savingPassword ? ui.saving : ui.changePassword }}
                  </button>
                </div>
              </form>
            </section>

            <section class="surface-card account-card">
              <h2>{{ ui.myOrders }}</h2>
              <p class="account-help">{{ ui.ordersHelp }}</p>
              <div class="stats-row">
                <div class="stat-item">
                  <strong>{{ orders.length }}</strong>
                  <span>{{ ui.ordersCount }}</span>
                </div>
                <div class="stat-item">
                  <strong>{{ activeOrdersCount }}</strong>
                  <span>{{ ui.activeOrders }}</span>
                </div>
                <div class="stat-item">
                  <strong>{{ deliveredOrdersCount }}</strong>
                  <span>{{ ui.deliveredOrders }}</span>
                </div>
              </div>
              <div v-if="orders.length" class="orders-preview">
                <article v-for="order in orders.slice(0, 3)" :key="order.id" class="preview-item">
                  <div>
                    <strong>{{ order.id }}</strong>
                    <span>{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <div>
                    <span class="status-pill">{{ statusLabel(order.status) }}</span>
                    <strong>{{ formatOrderTotal(order.total) }}</strong>
                  </div>
                </article>
              </div>
              <p v-if="ratesSourceLabel" class="rates-note">{{ ratesSourceLabel }}</p>
              <NuxtLink :to="localePath('/orders')" class="btn-alt orders-link">{{ ui.openOrders }}</NuxtLink>
            </section>

            <section class="surface-card account-card">
              <h2>{{ ui.messages }}</h2>
              <p class="account-help">{{ ui.messagesHelp }}</p>
              <div v-if="messages.length" class="messages-list">
                <article v-for="message in messages.slice(0, 8)" :key="message.id" class="message-item">
                  <strong>{{ message.title }}</strong>
                  <p>{{ message.text }}</p>
                  <span>{{ formatDate(message.createdAt) }}</span>
                </article>
              </div>
              <p v-else class="empty-note">{{ ui.emptyMessages }}</p>
            </section>

            <section class="surface-card account-card">
              <h2>{{ ui.myReviews }}</h2>
              <p class="account-help">{{ ui.reviewsHelp }}</p>
              <div v-if="reviews.length" class="reviews-list">
                <article v-for="review in reviews.slice(0, 8)" :key="review.id" class="review-item">
                  <div class="review-head">
                    <strong>{{ review.title }}</strong>
                    <span>{{ '★'.repeat(Math.max(1, Math.min(5, review.rating))) }}</span>
                  </div>
                  <p>{{ review.text }}</p>
                  <small>{{ formatDate(review.createdAt) }}</small>
                </article>
              </div>
              <p v-else class="empty-note">{{ ui.emptyReviews }}</p>
            </section>

            <p v-if="infoMessage" class="account-info">{{ infoMessage }}</p>
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

type AccountOrder = {
  id: string
  createdAt: string
  status: string
  total: number
  statusHistory?: Array<{ status: string; changedAt: string; note?: string }>
}

type AccountReview = {
  id: number
  title: string
  rating: number
  text: string
  createdAt: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const auth = useCustomerAuth()
const profileDraftStorageKey = 'osf_account_profile_draft_v1'

const savingProfile = ref(false)
const savingPassword = ref(false)
const savingNotifications = ref(false)
const showPassword = ref(false)
const infoMessage = ref('')
const errorMessage = ref('')

const orders = ref<AccountOrder[]>([])
const reviews = ref<AccountReview[]>([])
const currencyRates = ref<Record<'MDL' | 'EUR' | 'USD' | 'RON', number>>({
  MDL: 1,
  EUR: 0.052,
  USD: 0.056,
  RON: 0.258
})
const ratesSource = ref('fallback')

const form = reactive({
  firstName: '',
  lastName: '',
  login: '',
  phone: '',
  email: '',
  about: '',
  currency: 'MDL' as 'MDL' | 'EUR' | 'USD' | 'RON',
  language: 'ru' as 'ru' | 'ro' | 'en',
  notificationsEnabled: true
})

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

const saveProfileDraft = () => {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem(
      profileDraftStorageKey,
      JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        login: form.login,
        phone: form.phone,
        email: form.email,
        about: form.about,
        currency: form.currency,
        language: form.language,
        notificationsEnabled: form.notificationsEnabled
      })
    )
  } catch {
    // ignore localStorage write failures
  }
}

const restoreProfileDraft = () => {
  if (!import.meta.client) return
  try {
    const raw = window.localStorage.getItem(profileDraftStorageKey)
    if (!raw) return
    const draft = JSON.parse(raw) as Partial<typeof form> | null
    if (!draft || typeof draft !== 'object') return

    const currentFilled = [
      form.firstName,
      form.lastName,
      form.login,
      form.phone,
      form.about
    ].some((value) => String(value || '').trim().length > 0)

    if (currentFilled) return

    form.firstName = String(draft.firstName || '').trim()
    form.lastName = String(draft.lastName || '').trim()
    form.login = String(draft.login || '').trim()
    form.phone = String(draft.phone || '').trim()
    form.email = String(draft.email || form.email || '').trim()
    form.about = String(draft.about || '').trim()
    form.currency = (draft.currency || form.currency || 'MDL') as typeof form.currency
    form.language = (draft.language || form.language || locale.value || 'ru') as typeof form.language
    form.notificationsEnabled = draft.notificationsEnabled === false ? false : form.notificationsEnabled
  } catch {
    // ignore localStorage parse failures
  }
}

const ui = computed(() => {
  if (locale.value === 'en') {
    return {
      label: 'Account',
      title: 'My account',
      subtitle: 'Manage profile, settings, orders, notifications, and reviews.',
      quickMenu: 'Quick menu',
      myOrders: 'My orders',
      profile: 'Profile',
      settings: 'Settings',
      security: 'Security',
      logout: 'Sign out',
      profileHelp: 'Your personal data visible only in your account.',
      firstName: 'First name',
      lastName: 'Last name',
      login: 'Login',
      phone: 'Phone',
      email: 'Email',
      about: 'About me',
      aboutPlaceholder: 'Add short info about yourself',
      saveProfile: 'Save profile',
      settingsHelp: 'Preferred language, currency, and notifications.',
      currency: 'Currency',
      language: 'Language',
      notifications: 'Notifications',
      notificationsOn: 'Enabled',
      notificationsOff: 'Disabled',
      notificationsHint: 'Order updates and status alerts on website',
      securityHelp: 'Change your account password.',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      changePassword: 'Change password',
      show: 'Show',
      hide: 'Hide',
      saving: 'Saving...',
      ordersHelp: 'Recent orders and current status.',
      ordersCount: 'Total orders',
      activeOrders: 'Active',
      deliveredOrders: 'Delivered',
      openOrders: 'Open all orders',
      messages: 'Messages',
      messagesHelp: 'System updates and order status timeline.',
      emptyMessages: 'No messages yet.',
      myReviews: 'My reviews',
      reviewsHelp: 'Your reviews from completed orders.',
      emptyReviews: 'No reviews yet.',
      profileSaved: 'Profile updated.',
      passwordUpdated: 'Password updated.',
      passwordMismatch: 'Passwords do not match.',
      passwordLength: 'Password must be at least 8 characters.',
      ratesSourceLive: 'Exchange rate source: curs.md',
      ratesSourceFallback: 'Exchange rate source: fallback'
    }
  }

  if (locale.value === 'ro') {
    return {
      label: 'Cont',
      title: 'Contul meu',
      subtitle: 'Gestionează profilul, setările, comenzile, notificările și recenziile.',
      quickMenu: 'Meniu rapid',
      myOrders: 'Comenzile mele',
      profile: 'Profil',
      settings: 'Setări',
      security: 'Securitate',
      logout: 'Ieșire din cont',
      profileHelp: 'Datele tale personale vizibile doar în contul tău.',
      firstName: 'Prenume',
      lastName: 'Nume',
      login: 'Login',
      phone: 'Telefon',
      email: 'Email',
      about: 'Despre mine',
      aboutPlaceholder: 'Adaugă câteva informații despre tine',
      saveProfile: 'Salvează profilul',
      settingsHelp: 'Limba, valuta și notificările preferate.',
      currency: 'Valută',
      language: 'Limbă',
      notifications: 'Notificări',
      notificationsOn: 'Activate',
      notificationsOff: 'Dezactivate',
      notificationsHint: 'Actualizări comenzi și status direct pe site',
      securityHelp: 'Schimbă parola contului.',
      newPassword: 'Parolă nouă',
      confirmPassword: 'Confirmă parola',
      changePassword: 'Schimbă parola',
      show: 'Arată',
      hide: 'Ascunde',
      saving: 'Se salvează...',
      ordersHelp: 'Comenzi recente și statusul lor.',
      ordersCount: 'Total comenzi',
      activeOrders: 'Active',
      deliveredOrders: 'Livrate',
      openOrders: 'Deschide toate comenzile',
      messages: 'Mesaje',
      messagesHelp: 'Actualizări sistem și timeline de status pentru comenzi.',
      emptyMessages: 'Nu există mesaje.',
      myReviews: 'Recenziile mele',
      reviewsHelp: 'Recenzii scrise după comenzi finalizate.',
      emptyReviews: 'Încă nu ai recenzii.',
      profileSaved: 'Profil actualizat.',
      passwordUpdated: 'Parolă actualizată.',
      passwordMismatch: 'Parolele nu coincid.',
      passwordLength: 'Parola trebuie să aibă minim 8 caractere.',
      ratesSourceLive: 'Sursa cursului: curs.md',
      ratesSourceFallback: 'Sursa cursului: rezervă'
    }
  }

  return {
    label: 'Аккаунт',
    title: 'Мой аккаунт',
    subtitle: 'Управляй профилем, настройками, заказами, уведомлениями и отзывами.',
    quickMenu: 'Быстрое меню',
    myOrders: 'Мои заказы',
    profile: 'Профиль',
    settings: 'Настройки',
    security: 'Безопасность',
    logout: 'Выйти из аккаунта',
    profileHelp: 'Личные данные, которые видны только в твоем аккаунте.',
    firstName: 'Имя',
    lastName: 'Фамилия',
    login: 'Логин',
    phone: 'Телефон',
    email: 'Email',
    about: 'Обо мне',
    aboutPlaceholder: 'Коротко расскажи о себе',
    saveProfile: 'Сохранить профиль',
    settingsHelp: 'Предпочитаемый язык, валюта и уведомления.',
    currency: 'Валюта',
    language: 'Язык',
    notifications: 'Уведомления',
    notificationsOn: 'Включены',
    notificationsOff: 'Выключены',
    notificationsHint: 'Обновления по заказам и статусам на сайте',
    securityHelp: 'Измени пароль для входа в аккаунт.',
    newPassword: 'Новый пароль',
    confirmPassword: 'Повтори пароль',
    changePassword: 'Изменить пароль',
    show: 'Показать',
    hide: 'Скрыть',
    saving: 'Сохраняем...',
    ordersHelp: 'Последние заказы и текущие статусы.',
    ordersCount: 'Всего заказов',
    activeOrders: 'Активные',
    deliveredOrders: 'Доставлены',
    openOrders: 'Открыть все заказы',
    messages: 'Сообщения',
    messagesHelp: 'Системные сообщения и история статусов заказов.',
    emptyMessages: 'Пока сообщений нет.',
    myReviews: 'Мои отзывы',
    reviewsHelp: 'Твои отзывы после завершенных заказов.',
    emptyReviews: 'Пока отзывов нет.',
    profileSaved: 'Профиль обновлен.',
    passwordUpdated: 'Пароль обновлен.',
    passwordMismatch: 'Пароли не совпадают.',
    passwordLength: 'Пароль должен быть минимум 8 символов.',
    ratesSourceLive: 'Источник курса: curs.md',
    ratesSourceFallback: 'Источник курса: резервный'
  }
})

const statusLabel = (status: string) => {
  if (locale.value === 'en') {
    const map: Record<string, string> = {
      new: 'New',
      confirmed: 'Confirmed',
      assembled: 'Assembled',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    }
    return map[status] || status
  }
  if (locale.value === 'ro') {
    const map: Record<string, string> = {
      new: 'Nouă',
      confirmed: 'Confirmată',
      assembled: 'Asamblată',
      shipped: 'În livrare',
      delivered: 'Livrată',
      cancelled: 'Anulată',
      returned: 'Returnată'
    }
    return map[status] || status
  }
  const map: Record<string, string> = {
    new: 'Новый',
    confirmed: 'Подтвержден',
    assembled: 'Собран',
    shipped: 'В доставке',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
    returned: 'Возврат'
  }
  return map[status] || status
}

const activeOrdersCount = computed(() => orders.value.filter((item) => ['new', 'confirmed', 'assembled', 'shipped'].includes(item.status)).length)
const deliveredOrdersCount = computed(() => orders.value.filter((item) => item.status === 'delivered').length)

const messages = computed(() => {
  const rows: Array<{ id: string; title: string; text: string; createdAt: string }> = []
  for (const order of orders.value) {
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
    for (const entry of history) {
      const status = statusLabel(String(entry.status || 'new'))
      rows.push({
        id: `${order.id}-${entry.changedAt}-${entry.status}`,
        title: `${order.id} · ${status}`,
        text: String(entry.note || ''),
        createdAt: String(entry.changedAt || order.createdAt)
      })
    }
  }
  return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
})

const ratesSourceLabel = computed(() =>
  ratesSource.value === 'curs.md' ? ui.value.ratesSourceLive : ui.value.ratesSourceFallback
)

const convertFromMDL = (value: number) => {
  const target = form.currency
  const rate = Number(currencyRates.value[target] || 1)
  const converted = (Number(value) || 0) * (Number.isFinite(rate) && rate > 0 ? rate : 1)
  return target === 'MDL' ? Math.round(converted) : Number(converted.toFixed(2))
}

const formatOrderTotal = (value: number) => {
  const amount = convertFromMDL(value)
  return `${amount} ${form.currency}`
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleString(localeCode, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadOrders = async () => {
  if (!auth.accessToken.value) return
  try {
    const response = await $fetch<{ success: boolean; orders: AccountOrder[] }>('/api/account/orders', {
      headers: {
        authorization: `Bearer ${auth.accessToken.value}`
      }
    })
    orders.value = Array.isArray(response.orders) ? response.orders : []
  } catch {
    orders.value = []
  }
}

const loadReviews = async () => {
  if (!auth.accessToken.value) return
  try {
    const response = await $fetch<{ success: boolean; reviews: AccountReview[] }>('/api/account/reviews', {
      headers: {
        authorization: `Bearer ${auth.accessToken.value}`
      }
    })
    reviews.value = Array.isArray(response.reviews) ? response.reviews : []
  } catch {
    reviews.value = []
  }
}

const loadCurrencyRates = async () => {
  try {
    const response = await $fetch<{
      success: boolean
      source: string
      rates?: Partial<Record<'MDL' | 'EUR' | 'USD' | 'RON', number>>
    }>('/api/currency/rates')
    if (response?.success && response.rates) {
      currencyRates.value = {
        MDL: Number(response.rates.MDL || 1) || 1,
        EUR: Number(response.rates.EUR || 0.052) || 0.052,
        USD: Number(response.rates.USD || 0.056) || 0.056,
        RON: Number(response.rates.RON || 0.258) || 0.258
      }
      ratesSource.value = String(response.source || 'fallback')
    }
  } catch {
    ratesSource.value = 'fallback'
  }
}

const syncFormFromProfile = () => {
  const profile = auth.profile.value
  if (!profile) {
    restoreProfileDraft()
    return
  }
  form.firstName = String(profile.firstName || '').trim()
  form.lastName = String(profile.lastName || '').trim()
  form.login = String(profile.login || '').trim()
  form.phone = String(profile.phone || '').trim()
  form.email = String(profile.email || '').trim()
  form.about = String(profile.about || '').trim()
  form.currency = (profile.currency || 'MDL') as typeof form.currency
  form.language = (profile.language || locale.value || 'ru') as typeof form.language
  form.notificationsEnabled = profile.notificationsEnabled !== false
  restoreProfileDraft()
}

const saveProfile = async () => {
  errorMessage.value = ''
  infoMessage.value = ''
  savingProfile.value = true
  try {
    await auth.saveProfile({
      name: [form.firstName, form.lastName].filter(Boolean).join(' ').trim(),
      firstName: form.firstName,
      lastName: form.lastName,
      login: form.login,
      phone: form.phone,
      email: form.email,
      about: form.about,
      currency: form.currency,
      language: form.language,
      notificationsEnabled: form.notificationsEnabled
    })
    await auth.refreshProfile()
    syncFormFromProfile()

    if (import.meta.client) {
      try {
        window.localStorage.setItem('osf_pref_currency_v1', form.currency)
        window.localStorage.setItem('osf_pref_language_v1', form.language)
        window.localStorage.setItem('osf_stock_notifications_v1', form.notificationsEnabled ? 'enabled' : 'disabled')
      } catch {
        // ignore localStorage write failures
      }
    }

    if (form.language !== locale.value) {
      await navigateTo(switchLocalePath(form.language) || localePath('/account'))
      return
    }

    infoMessage.value = ui.value.profileSaved
    saveProfileDraft()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save profile'
  } finally {
    savingProfile.value = false
  }
}

const toggleNotificationsSetting = async () => {
  const nextValue = !form.notificationsEnabled
  form.notificationsEnabled = nextValue
  savingNotifications.value = true
  errorMessage.value = ''
  infoMessage.value = ''
  try {
    await auth.saveProfile({
      notificationsEnabled: nextValue
    })
    if (import.meta.client) {
      try {
        window.localStorage.setItem('osf_stock_notifications_v1', nextValue ? 'enabled' : 'disabled')
      } catch {
        // ignore localStorage write failures
      }
    }
    infoMessage.value = ui.value.profileSaved
    saveProfileDraft()
  } catch (error) {
    form.notificationsEnabled = !nextValue
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update notifications'
  } finally {
    savingNotifications.value = false
  }
}

const changePassword = async () => {
  errorMessage.value = ''
  infoMessage.value = ''
  if (passwordForm.password.length < 8) {
    errorMessage.value = ui.value.passwordLength
    return
  }
  if (passwordForm.password !== passwordForm.confirmPassword) {
    errorMessage.value = ui.value.passwordMismatch
    return
  }
  savingPassword.value = true
  try {
    await auth.updatePassword(passwordForm.password)
    passwordForm.password = ''
    passwordForm.confirmPassword = ''
    infoMessage.value = ui.value.passwordUpdated
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update password'
  } finally {
    savingPassword.value = false
  }
}

const logout = async () => {
  await auth.logout()
  await navigateTo(localePath('/'))
}

onMounted(async () => {
  await auth.initAuth()
  if (!auth.isAuthenticated.value || !auth.accessToken.value) {
    await navigateTo(
      localePath({
        path: '/auth',
        query: { next: '/account' }
      })
    )
    return
  }

  await auth.refreshProfile()
  syncFormFromProfile()
  restoreProfileDraft()
  await Promise.all([loadOrders(), loadReviews(), loadCurrencyRates()])
})

watch(
  () => auth.profile.value,
  () => {
    syncFormFromProfile()
  },
  { deep: true }
)

watch(
  () => ({
    firstName: form.firstName,
    lastName: form.lastName,
    login: form.login,
    phone: form.phone,
    email: form.email,
    about: form.about,
    currency: form.currency,
    language: form.language,
    notificationsEnabled: form.notificationsEnabled
  }),
  () => {
    saveProfileDraft()
  },
  { deep: true }
)
</script>

<style scoped>
.account-page {
  padding-bottom: 84px;
}

.account-hero,
.account-sidebar,
.account-card {
  padding: clamp(16px, 2vw, 24px);
}

.account-title,
.account-subtitle {
  margin: 0;
}

.account-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 14px;
}

.account-sidebar {
  display: grid;
  gap: 10px;
  align-content: start;
  position: sticky;
  top: 90px;
  height: fit-content;
}

.account-side-link {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  font-weight: 700;
}

.logout-btn {
  width: 100%;
}

.account-main {
  display: grid;
  gap: 14px;
}

.account-card h2 {
  margin: 0;
  font-size: 30px;
}

.account-help {
  margin: 8px 0 0;
  color: var(--muted);
}

.account-form,
.account-settings-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field {
  display: grid;
  gap: 6px;
}

.field-wide {
  grid-column: 1 / -1;
}

.field span {
  font-size: 14px;
  font-weight: 800;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 0 12px;
  min-height: 48px;
  color: var(--text);
}

.field textarea {
  min-height: 110px;
  padding: 12px;
  resize: vertical;
}

.account-form-actions {
  display: flex;
  justify-content: flex-start;
}

.toggle-row {
  display: grid;
  gap: 8px;
}

.toggle-btn {
  min-height: 42px;
  width: fit-content;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 16px;
  font-weight: 800;
  cursor: pointer;
}

.toggle-btn.active {
  background: #ecf3ea;
  border-color: #bdd5c2;
  color: #1f6b43;
}

.password-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.password-toggle {
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 12px;
  font-weight: 700;
  cursor: pointer;
}

.stats-row {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 12px;
  display: grid;
}

.stat-item strong {
  font-size: 28px;
}

.stat-item span {
  color: var(--muted);
  font-weight: 700;
}

.orders-preview,
.messages-list,
.reviews-list {
  margin-top: 14px;
  display: grid;
  gap: 8px;
}

.preview-item,
.message-item,
.review-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.preview-item span,
.message-item span,
.review-item small {
  color: var(--muted);
  font-size: 13px;
}

.status-pill {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  margin-right: 8px;
}

.orders-link {
  margin-top: 12px;
}

.message-item p,
.review-item p {
  margin: 6px 0;
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.rates-note {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}

.account-info {
  margin: 0;
  color: #1f6b43;
  font-weight: 700;
}

@media (max-width: 1020px) {
  .account-layout {
    grid-template-columns: 1fr;
  }

  .account-sidebar {
    position: static;
  }
}

@media (max-width: 760px) {
  .account-card h2 {
    font-size: 24px;
  }

  .account-form,
  .account-settings-grid,
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
