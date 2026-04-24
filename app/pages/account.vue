<template>
  <div class="account-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card account-hero">
          <div class="account-hero-grid">
            <div>
              <span class="section-label">{{ ui.label }}</span>
              <h1 class="section-title account-title">{{ ui.title }}</h1>
              <p class="section-text account-subtitle">{{ ui.subtitle }}</p>
              <div class="hero-meta">
                <span class="hero-pill">{{ ui.profileCompletion }}: {{ profileCompletionPercent }}%</span>
                <span class="hero-pill">{{ ui.notifications }}: {{ form.notificationsEnabled ? ui.notificationsOn : ui.notificationsOff }}</span>
                <span class="hero-pill">{{ ui.currency }}: {{ form.currency }}</span>
                <span class="hero-pill">{{ ui.language }}: {{ form.language.toUpperCase() }}</span>
                <span v-if="lastSavedLabel" class="hero-pill">{{ lastSavedLabel }}</span>
              </div>
              <div class="account-toolbar">
                <button
                  type="button"
                  class="btn-main toolbar-btn"
                  :disabled="savingProfile || savingSettings || !hasUnsavedChanges"
                  @click="saveAllChanges"
                >
                  {{ ui.saveAll }}
                </button>
                <button
                  type="button"
                  class="btn-alt toolbar-btn"
                  :disabled="savingProfile || savingSettings || !hasUnsavedChanges"
                  @click="resetAllChanges"
                >
                  {{ ui.discardAll }}
                </button>
                <NuxtLink :to="localePath('/orders')" class="btn-alt toolbar-btn">{{ ui.openOrders }}</NuxtLink>
              </div>
              <div class="hero-stats">
                <article class="hero-stat">
                  <strong>{{ orders.length }}</strong>
                  <span>{{ ui.ordersCount }}</span>
                </article>
                <article class="hero-stat">
                  <strong>{{ activeOrdersCount }}</strong>
                  <span>{{ ui.activeOrders }}</span>
                </article>
                <article class="hero-stat">
                  <strong>{{ deliveredOrdersCount }}</strong>
                  <span>{{ ui.deliveredOrders }}</span>
                </article>
                <article class="hero-stat">
                  <strong>{{ reviews.length }}</strong>
                  <span>{{ ui.myReviews }}</span>
                </article>
              </div>
            </div>
            <div class="account-identity">
              <div class="identity-avatar">{{ profileInitials }}</div>
              <div class="identity-text">
                <strong>{{ profileDisplayName }}</strong>
                <span>{{ profileDisplayEmail }}</span>
                <small>{{ ui.phone }}: {{ profileDisplayPhone }}</small>
                <small>{{ ui.memberSince }}: {{ memberSince }}</small>
              </div>
              <div class="identity-actions">
                <a href="#profile" class="btn-alt identity-btn">{{ ui.profile }}</a>
                <NuxtLink :to="localePath('/orders')" class="btn-main identity-btn">{{ ui.myOrders }}</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="surface-card account-sections">
          <a href="#profile" class="section-chip">{{ ui.profile }}</a>
          <a href="#settings" class="section-chip">{{ ui.settings }}</a>
          <a href="#security" class="section-chip">{{ ui.security }}</a>
          <a href="#messages" class="section-chip">{{ ui.messages }}</a>
          <a href="#reviews" class="section-chip">{{ ui.myReviews }}</a>
        </div>
        <div class="account-layout">
          <aside class="surface-card account-sidebar">
            <strong>{{ ui.quickMenu }}</strong>
            <NuxtLink :to="localePath('/orders')" class="account-side-link">{{ ui.myOrders }}</NuxtLink>
            <a href="#profile" class="account-side-link">{{ ui.profile }}</a>
            <a href="#settings" class="account-side-link">{{ ui.settings }}</a>
            <a href="#security" class="account-side-link">{{ ui.security }}</a>
            <a href="#messages" class="account-side-link">{{ ui.messages }}</a>
            <a href="#reviews" class="account-side-link">{{ ui.myReviews }}</a>
            <div class="side-health">
              <span>{{ ui.profileCompletion }}</span>
              <div class="side-progress">
                <span :style="{ width: `${profileCompletionPercent}%` }" />
              </div>
              <small>{{ profileCompletionPercent }}%</small>
            </div>
            <button type="button" class="btn-alt logout-btn" @click="logout">{{ ui.logout }}</button>
          </aside>

          <div class="account-main">
            <section id="profile" class="surface-card account-card">
              <div class="section-head">
                <h2>{{ ui.profile }}</h2>
                <span v-if="profileDirty" class="dirty-pill">{{ ui.unsaved }}</span>
              </div>
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
                  <button type="submit" class="btn-main" :disabled="savingProfile || !profileDirty">
                    {{ savingProfile ? ui.saving : ui.saveProfile }}
                  </button>
                </div>
              </form>
            </section>

            <section id="settings" class="surface-card account-card">
              <div class="section-head">
                <h2>{{ ui.settings }}</h2>
                <span v-if="settingsDirty" class="dirty-pill">{{ ui.unsaved }}</span>
              </div>
              <p class="account-help">{{ ui.settingsHelp }}</p>
              <form class="account-settings-grid" @submit.prevent="saveSettings">
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
                <div class="field-wide account-form-actions">
                  <button type="submit" class="btn-main" :disabled="savingSettings || savingNotifications || !settingsDirty">
                    {{ savingSettings ? ui.saving : ui.saveSettings }}
                  </button>
                  <button type="button" class="btn-alt" :disabled="savingSettings || savingNotifications" @click="resetSettings">
                    {{ ui.resetSettings }}
                  </button>
                </div>
              </form>
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
              <h2 id="messages">{{ ui.messages }}</h2>
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

            <section id="reviews" class="surface-card account-card">
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

    <transition name="dock-fade">
      <div v-if="hasUnsavedChanges" class="account-save-dock">
        <div class="site-container save-dock-inner">
          <span>{{ ui.unsaved }}</span>
          <div class="save-dock-actions">
            <button type="button" class="btn-alt" :disabled="savingProfile || savingSettings" @click="resetAllChanges">
              {{ ui.resetSettings }}
            </button>
            <button type="button" class="btn-main" :disabled="savingProfile || savingSettings" @click="saveAllChanges">
              {{ ui.saveProfile }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

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

const savingProfile = ref(false)
const savingSettings = ref(false)
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
  notificationsEnabled: false
})

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

const baselineProfile = reactive({
  firstName: '',
  lastName: '',
  login: '',
  phone: '',
  email: '',
  about: ''
})

const baselineSettings = reactive({
  currency: 'MDL' as 'MDL' | 'EUR' | 'USD' | 'RON',
  language: 'ru' as 'ru' | 'ro' | 'en',
  notificationsEnabled: false
})

const lastSavedAt = ref<number | null>(null)

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
      saveSettings: 'Save settings',
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
      unsaved: 'Unsaved changes',
      profileCompletion: 'Profile completion',
      memberSince: 'Member since',
      resetSettings: 'Reset settings',
      savedAt: 'Saved',
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
      ratesSourceFallback: 'Exchange rate source: fallback',
      draftRestored: 'Draft restored from this device.',
      saveAll: 'Save all changes',
      discardAll: 'Discard changes'
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
      saveSettings: 'Salvează setările',
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
      unsaved: 'Modificări nesalvate',
      profileCompletion: 'Completare profil',
      memberSince: 'Membru din',
      resetSettings: 'Resetează setările',
      savedAt: 'Salvat',
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
      ratesSourceFallback: 'Sursa cursului: rezervă',
      draftRestored: 'Am restaurat schița de pe acest dispozitiv.',
      saveAll: 'Salvează tot',
      discardAll: 'Renunță la modificări'
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
    saveSettings: 'Сохранить настройки',
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
    unsaved: 'Есть несохраненные изменения',
    profileCompletion: 'Заполненность профиля',
    memberSince: 'С нами с',
    resetSettings: 'Сбросить настройки',
    savedAt: 'Сохранено',
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
    ratesSourceFallback: 'Источник курса: резервный',
    draftRestored: 'Черновик восстановлен на этом устройстве.',
    saveAll: 'Сохранить все',
    discardAll: 'Отменить изменения'
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

const profileDirty = computed(() =>
  form.firstName !== baselineProfile.firstName
  || form.lastName !== baselineProfile.lastName
  || form.login !== baselineProfile.login
  || form.phone !== baselineProfile.phone
  || form.email !== baselineProfile.email
  || form.about !== baselineProfile.about
)

const settingsDirty = computed(() =>
  form.currency !== baselineSettings.currency
  || form.language !== baselineSettings.language
  || form.notificationsEnabled !== baselineSettings.notificationsEnabled
)

const profileCompletionPercent = computed(() => {
  const checks = [
    form.firstName.trim().length > 0,
    form.lastName.trim().length > 0,
    form.login.trim().length > 0,
    form.phone.trim().length > 0,
    form.email.trim().length > 0,
    form.about.trim().length > 0
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
})

const lastSavedLabel = computed(() => {
  if (!lastSavedAt.value) return ''
  return `${ui.value.savedAt}: ${new Date(lastSavedAt.value).toLocaleTimeString()}`
})

const profileDisplayName = computed(() => {
  const full = [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
  return full || form.login || form.email || 'OSF Client'
})

const profileDisplayEmail = computed(() => form.email || 'email@account')
const profileDisplayPhone = computed(() => form.phone || '—')
const memberSince = computed(() => {
  const createdAt = String(auth.user.value?.created_at || '')
  if (!createdAt) return '—'
  return formatDate(createdAt)
})

const profileInitials = computed(() => {
  const source = [form.firstName, form.lastName].filter(Boolean).join(' ').trim() || form.login || form.email
  const cleaned = String(source || '').replace(/[^a-zA-Zа-яА-Я0-9\s]/g, ' ').trim()
  if (!cleaned) return 'OS'
  const parts = cleaned.split(/\s+/).filter(Boolean)
  const joined = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
  return joined || cleaned.slice(0, 2).toUpperCase()
})

const hasUnsavedChanges = computed(() => profileDirty.value || settingsDirty.value)
const accountDraftKey = computed(() => {
  const userId = String(auth.user.value?.id || '').trim()
  return userId ? `osf_account_draft_v1_${userId}` : ''
})
const draftHydrated = ref(false)
let draftSaveTimer: ReturnType<typeof setTimeout> | null = null

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
  if (!profile) return

  const keep = (...values: unknown[]) => {
    for (const value of values) {
      const text = String(value || '').trim()
      if (text) return text
    }
    return ''
  }

  form.firstName = keep(profile.firstName, baselineProfile.firstName, form.firstName)
  form.lastName = keep(profile.lastName, baselineProfile.lastName, form.lastName)
  form.login = keep(profile.login, baselineProfile.login, form.login)
  form.phone = keep(profile.phone, baselineProfile.phone, form.phone)
  form.email = keep(profile.email, baselineProfile.email, form.email)
  form.about = keep(profile.about, baselineProfile.about, form.about)
  form.currency = (['MDL', 'EUR', 'USD', 'RON'].includes(String(profile.currency || '').toUpperCase())
    ? String(profile.currency).toUpperCase()
    : baselineSettings.currency) as typeof form.currency
  form.language = (['ru', 'ro', 'en'].includes(String(profile.language || '').toLowerCase())
    ? String(profile.language).toLowerCase()
    : baselineSettings.language) as typeof form.language
  form.notificationsEnabled = typeof profile.notificationsEnabled === 'boolean'
    ? profile.notificationsEnabled
    : baselineSettings.notificationsEnabled

  baselineProfile.firstName = form.firstName
  baselineProfile.lastName = form.lastName
  baselineProfile.login = form.login
  baselineProfile.phone = form.phone
  baselineProfile.email = form.email
  baselineProfile.about = form.about

  baselineSettings.currency = form.currency
  baselineSettings.language = form.language
  baselineSettings.notificationsEnabled = form.notificationsEnabled
}

const applyProfileBaselineFromForm = () => {
  baselineProfile.firstName = String(form.firstName || '').trim()
  baselineProfile.lastName = String(form.lastName || '').trim()
  baselineProfile.login = String(form.login || '').trim()
  baselineProfile.phone = String(form.phone || '').trim()
  baselineProfile.email = String(form.email || '').trim()
  baselineProfile.about = String(form.about || '').trim()
}

const applySettingsBaselineFromForm = () => {
  baselineSettings.currency = form.currency
  baselineSettings.language = form.language
  baselineSettings.notificationsEnabled = form.notificationsEnabled === true
}

const saveDraft = () => {
  if (!import.meta.client || !draftHydrated.value || !accountDraftKey.value) return
  try {
    const payload = {
      updatedAt: Date.now(),
      data: {
        firstName: form.firstName,
        lastName: form.lastName,
        login: form.login,
        phone: form.phone,
        email: form.email,
        about: form.about,
        currency: form.currency,
        language: form.language
      }
    }
    window.localStorage.setItem(accountDraftKey.value, JSON.stringify(payload))
  } catch {
    // Ignore draft write failures.
  }
}

const clearDraft = () => {
  if (!import.meta.client || !accountDraftKey.value) return
  try {
    window.localStorage.removeItem(accountDraftKey.value)
  } catch {
    // Ignore draft cleanup failures.
  }
}

const restoreDraft = () => {
  if (!import.meta.client || !accountDraftKey.value) return
  try {
    const raw = window.localStorage.getItem(accountDraftKey.value)
    if (!raw) return
    const parsed = JSON.parse(raw) as {
      updatedAt?: number
      data?: Partial<typeof form>
    }
    if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') return

    const draftUpdatedAt = Number(parsed.updatedAt || 0)
    if (draftUpdatedAt && Date.now() - draftUpdatedAt > 1000 * 60 * 60 * 24 * 14) {
      clearDraft()
      return
    }

    const draft = parsed.data
    form.firstName = String(draft.firstName || form.firstName || '').trim()
    form.lastName = String(draft.lastName || form.lastName || '').trim()
    form.login = String(draft.login || form.login || '').trim()
    form.phone = String(draft.phone || form.phone || '').trim()
    form.email = String(draft.email || form.email || '').trim()
    form.about = String(draft.about || form.about || '').trim()
    form.currency = (['MDL', 'EUR', 'USD', 'RON'].includes(String(draft.currency || '').toUpperCase())
      ? String(draft.currency).toUpperCase()
      : form.currency) as typeof form.currency
    form.language = (['ru', 'ro', 'en'].includes(String(draft.language || '').toLowerCase())
      ? String(draft.language).toLowerCase()
      : form.language) as typeof form.language
    infoMessage.value = ui.value.draftRestored
  } catch {
    // Ignore invalid draft content.
  }
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
    applyProfileBaselineFromForm()
    applySettingsBaselineFromForm()

    if (import.meta.client) {
      try {
        window.localStorage.setItem('osf_pref_currency_v1', form.currency)
        window.localStorage.setItem('osf_pref_language_v1', form.language)
      } catch {
        // ignore localStorage write failures
      }
    }

    clearDraft()

    if (form.language !== locale.value) {
      await navigateTo(switchLocalePath(form.language) || localePath('/account'))
      return
    }

    infoMessage.value = ui.value.profileSaved
    lastSavedAt.value = Date.now()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save profile'
  } finally {
    savingProfile.value = false
  }
}

const saveSettings = async () => {
  errorMessage.value = ''
  infoMessage.value = ''
  savingSettings.value = true
  try {
    await auth.saveProfile({
      currency: form.currency,
      language: form.language,
      notificationsEnabled: form.notificationsEnabled
    })
    applySettingsBaselineFromForm()

    if (import.meta.client) {
      try {
        window.localStorage.setItem('osf_pref_currency_v1', form.currency)
        window.localStorage.setItem('osf_pref_language_v1', form.language)
      } catch {
        // ignore localStorage write failures
      }
    }

    clearDraft()

    if (form.language !== locale.value) {
      await navigateTo(switchLocalePath(form.language) || localePath('/account'))
      return
    }

    infoMessage.value = ui.value.profileSaved
    lastSavedAt.value = Date.now()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save settings'
  } finally {
    savingSettings.value = false
  }
}

const toggleNotificationsSetting = async () => {
  const nextValue = !form.notificationsEnabled
  form.notificationsEnabled = nextValue
  savingNotifications.value = true
  errorMessage.value = ''
  infoMessage.value = ''
  try {
    await auth.setNotificationsEnabled(nextValue)
    form.notificationsEnabled = auth.notificationsEnabled.value === true
    applySettingsBaselineFromForm()
    clearDraft()
    infoMessage.value = ui.value.profileSaved
    lastSavedAt.value = Date.now()
  } catch (error) {
    form.notificationsEnabled = !nextValue
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update notifications'
  } finally {
    savingNotifications.value = false
  }
}

const resetSettings = () => {
  form.currency = baselineSettings.currency
  form.language = baselineSettings.language
  form.notificationsEnabled = baselineSettings.notificationsEnabled
}

const resetAllChanges = () => {
  form.firstName = baselineProfile.firstName
  form.lastName = baselineProfile.lastName
  form.login = baselineProfile.login
  form.phone = baselineProfile.phone
  form.email = baselineProfile.email
  form.about = baselineProfile.about
  resetSettings()
  errorMessage.value = ''
}

const saveAllChanges = async () => {
  if (profileDirty.value) {
    await saveProfile()
  }
  if (settingsDirty.value) {
    await saveSettings()
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
  clearDraft()
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
  await Promise.all([loadOrders(), loadReviews(), loadCurrencyRates()])
  restoreDraft()
  draftHydrated.value = true
})

onBeforeUnmount(() => {
  if (draftSaveTimer) {
    clearTimeout(draftSaveTimer)
    draftSaveTimer = null
  }
})

watch(
  () => auth.notificationsEnabled.value,
  (value) => {
    const next = value === true
    form.notificationsEnabled = next
    baselineSettings.notificationsEnabled = next
  },
  { immediate: true }
)

watch(
  () => auth.profile.value,
  () => {
    if (hasUnsavedChanges.value && draftHydrated.value) return
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
    if (!draftHydrated.value) return
    if (draftSaveTimer) {
      clearTimeout(draftSaveTimer)
    }
    draftSaveTimer = setTimeout(() => {
      saveDraft()
    }, 220)
  },
  { deep: true }
)

</script>

<style scoped>
.account-page {
  padding-bottom: 84px;
}

.account-hero,
.account-sections,
.account-sidebar,
.account-card {
  padding: clamp(16px, 2vw, 24px);
}

.account-hero {
  background:
    radial-gradient(1000px 360px at 5% -10%, #eef8f1 0%, transparent 42%),
    radial-gradient(700px 280px at 95% 10%, #f6f8fc 0%, transparent 44%),
    #fff;
}

.account-title,
.account-subtitle {
  margin: 0;
}

.account-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.account-identity {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #fff;
  padding: 14px;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.identity-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid #b8d8c3;
  background: linear-gradient(135deg, #f3faf5, #e6f3ea);
  color: #1f6b43;
  font-size: 18px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.identity-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.identity-text strong,
.identity-text span,
.identity-text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity-text strong {
  font-size: 16px;
}

.identity-text span {
  color: var(--muted);
  font-size: 13px;
}

.identity-text small {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.identity-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
}

.identity-btn {
  flex: 1;
  justify-content: center;
}

.hero-meta {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.account-toolbar {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-btn {
  min-width: 168px;
}

.hero-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.hero-stat {
  min-height: 78px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 10px;
  display: grid;
  align-content: center;
  gap: 2px;
}

.hero-stat strong {
  font-size: 24px;
  line-height: 1;
}

.hero-stat span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.hero-pill {
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.account-sections {
  margin-bottom: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section-chip {
  min-height: 38px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  font-weight: 800;
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

.side-health {
  margin-top: 6px;
  display: grid;
  gap: 6px;
}

.side-health span {
  font-size: 12px;
  color: var(--muted);
  font-weight: 700;
}

.side-progress {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #edf2ec;
  overflow: hidden;
}

.side-progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #2a7b4f, #66a677);
}

.side-health small {
  font-size: 12px;
  font-weight: 800;
  color: #1f6b43;
}

.account-main {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.dirty-pill {
  min-height: 28px;
  border-radius: 999px;
  border: 1px solid #e8d6a8;
  background: #fff9ea;
  color: #8a6428;
  font-size: 12px;
  font-weight: 800;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
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

.empty-note {
  margin: 10px 0 0;
  color: var(--muted);
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

.account-save-dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 85;
  pointer-events: none;
}

.save-dock-inner {
  min-height: 58px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 45px rgba(21, 26, 42, 0.14);
  backdrop-filter: blur(8px);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  pointer-events: auto;
}

.save-dock-inner span {
  font-size: 13px;
  font-weight: 800;
  color: #7d5a1f;
}

.save-dock-actions {
  display: flex;
  gap: 8px;
}

.dock-fade-enter-active,
.dock-fade-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.dock-fade-enter-from,
.dock-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1020px) {
  .account-layout {
    grid-template-columns: 1fr;
  }

  .account-sidebar {
    position: static;
  }

  .account-hero-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .save-dock-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .save-dock-actions > * {
    flex: 1;
  }

  .toolbar-btn {
    width: 100%;
  }
}
</style>
