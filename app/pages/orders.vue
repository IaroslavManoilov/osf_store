<template>
  <div class="orders-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card orders-intro">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title orders-title">{{ ui.title }}</h1>
          <p class="section-text orders-text">{{ ui.subtitle }}</p>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="orders-layout">
          <div class="surface-card orders-track">
            <h2>{{ ui.myOrders }}</h2>
            <p class="orders-help">{{ ui.myOrdersHelp }}</p>

            <div v-if="trackedLoading" class="orders-loading">{{ ui.loading }}</div>
            <div v-else-if="trackedOrders.length" class="orders-list">
              <article v-for="order in trackedOrders" :key="order.id" class="order-card">
                <div class="order-top">
                  <div>
                    <strong>{{ order.id }}</strong>
                    <span>{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <div class="order-status" :class="`status-${order.status}`">{{ statusLabel(order.status) }}</div>
                </div>

                <p class="eta">{{ etaLabel(order.status) }}</p>
                <p v-if="deliveryDateText(order)" class="eta-date">{{ deliveryDateText(order) }}</p>

                <ul class="items">
                  <li v-for="(item, idx) in order.items" :key="`${order.id}-${idx}`">
                    {{ item.title }} · {{ ui.size }} {{ item.selectedSize || '-' }} · {{ item.quantity }} × {{ item.price }} MDL
                  </li>
                </ul>

                <div class="order-total">{{ ui.total }}: {{ order.total }} MDL</div>
              </article>
            </div>
            <div v-else class="empty-note">{{ ui.noOrders }}</div>
          </div>

          <aside class="surface-card orders-lookup">
            <h2>{{ ui.lookupTitle }}</h2>
            <p class="orders-help">{{ ui.lookupHelp }}</p>

            <form class="lookup-form" @submit.prevent="lookupOrder">
              <label class="field">
                <span>{{ ui.orderId }}</span>
                <input v-model.trim="lookup.orderId" type="text" placeholder="OSF-000001" required />
              </label>

              <label class="field">
                <span>{{ ui.phone }}</span>
                <input v-model.trim="lookup.phone" type="tel" :placeholder="ui.phonePlaceholder" required />
              </label>

              <button type="submit" class="btn-main" :disabled="lookupLoading">
                {{ lookupLoading ? ui.loading : ui.find }}
              </button>
            </form>

            <p v-if="lookupError" class="error-text">{{ lookupError }}</p>

            <article v-if="lookupResult" class="order-card lookup-result">
              <div class="order-top">
                <div>
                  <strong>{{ lookupResult.id }}</strong>
                  <span>{{ formatDate(lookupResult.createdAt) }}</span>
                </div>
                <div class="order-status" :class="`status-${lookupResult.status}`">{{ statusLabel(lookupResult.status) }}</div>
              </div>

              <p class="eta">{{ etaLabel(lookupResult.status) }}</p>
              <p v-if="deliveryDateText(lookupResult)" class="eta-date">{{ deliveryDateText(lookupResult) }}</p>
              <div class="order-total">{{ ui.total }}: {{ lookupResult.total }} MDL</div>
            </article>

            <NuxtLink :to="localePath('/catalog')" class="btn-alt back-link">{{ ui.backCatalog }}</NuxtLink>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type PublicOrder = {
  id: string
  createdAt: string
  status: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  total: number
  items: Array<{
    id: string
    title: string
    quantity: number
    selectedSize?: string
    price: number
  }>
  statusHistory?: Array<{
    status: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
    changedAt: string
    note?: string
    actor?: string
  }>
}

type SavedTrack = {
  id: string
  token: string
  createdAt: string
}

type Ui = {
  label: string
  title: string
  subtitle: string
  myOrders: string
  myOrdersHelp: string
  lookupTitle: string
  lookupHelp: string
  orderId: string
  phone: string
  phonePlaceholder: string
  find: string
  loading: string
  noOrders: string
  total: string
  size: string
  backCatalog: string
  statusNew: string
  statusConfirmed: string
  statusShipped: string
  statusDelivered: string
  statusCancelled: string
  statusReturned: string
  etaNew: string
  etaConfirmed: string
  etaShipped: string
  etaDelivered: string
  etaCancelled: string
  etaReturned: string
  deliveryExpected: string
  deliveredAt: string
  lookupError: string
}

const { locale } = useI18n()
const localePath = useLocalePath()

const tracksKey = 'osf_order_tracks_v1'

const trackedOrders = ref<PublicOrder[]>([])
const trackedLoading = ref(false)
const lookupLoading = ref(false)
const lookupError = ref('')
const lookupResult = ref<PublicOrder | null>(null)

const lookup = reactive({
  orderId: '',
  phone: ''
})

const ui = computed<Ui>(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Comenzile mele',
      title: 'Urmărire comandă',
      subtitle: 'Vezi statusul comenzilor tale fără să aștepți mesaj manual.',
      myOrders: 'Comenzi din acest dispozitiv',
      myOrdersHelp: 'Comenzile plasate aici apar automat.',
      lookupTitle: 'Caută orice comandă',
      lookupHelp: 'Introdu ID comenzii și telefonul din checkout.',
      orderId: 'ID comandă',
      phone: 'Telefon',
      phonePlaceholder: '+373 68 123 456',
      find: 'Găsește comanda',
      loading: 'Se încarcă...',
      noOrders: 'Încă nu există comenzi salvate pe acest dispozitiv.',
      total: 'Total',
      size: 'Mărime',
      backCatalog: 'Înapoi la catalog',
      statusNew: 'Nouă',
      statusConfirmed: 'Confirmată',
      statusShipped: 'Expediată',
      statusDelivered: 'Livrată',
      statusCancelled: 'Anulată',
      statusReturned: 'Returnată',
      etaNew: 'Comanda este primită. Confirmăm în scurt timp.',
      etaConfirmed: 'Confirmată. Pregătim expedierea.',
      etaShipped: 'În drum. Livrare estimată 1-3 zile.',
      etaDelivered: 'Livrată cu succes.',
      etaCancelled: 'Comanda a fost anulată.',
      etaReturned: 'Comanda a fost returnată.',
      deliveryExpected: 'Livrare estimată',
      deliveredAt: 'Livrat la',
      lookupError: 'Comanda nu a fost găsită sau telefonul nu coincide.'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'My orders',
      title: 'Order tracking',
      subtitle: 'Track your order status without waiting for manual updates.',
      myOrders: 'Orders from this device',
      myOrdersHelp: 'Orders placed here appear automatically.',
      lookupTitle: 'Find any order',
      lookupHelp: 'Enter order ID and checkout phone number.',
      orderId: 'Order ID',
      phone: 'Phone',
      phonePlaceholder: '+373 68 123 456',
      find: 'Find order',
      loading: 'Loading...',
      noOrders: 'No saved orders on this device yet.',
      total: 'Total',
      size: 'Size',
      backCatalog: 'Back to catalog',
      statusNew: 'New',
      statusConfirmed: 'Confirmed',
      statusShipped: 'Shipped',
      statusDelivered: 'Delivered',
      statusCancelled: 'Cancelled',
      statusReturned: 'Returned',
      etaNew: 'Order received. We will confirm it soon.',
      etaConfirmed: 'Confirmed. Preparing shipment.',
      etaShipped: 'On the way. Estimated delivery in 1-3 days.',
      etaDelivered: 'Delivered successfully.',
      etaCancelled: 'Order was cancelled.',
      etaReturned: 'Order was returned.',
      deliveryExpected: 'Estimated delivery',
      deliveredAt: 'Delivered on',
      lookupError: 'Order not found or phone does not match.'
    }
  }

  return {
    label: 'Мои заказы',
    title: 'Отслеживание заказа',
    subtitle: 'Смотри статус заказа без ожидания ручного ответа.',
    myOrders: 'Заказы на этом устройстве',
    myOrdersHelp: 'Заказы, оформленные здесь, появляются автоматически.',
    lookupTitle: 'Найти любой заказ',
    lookupHelp: 'Введи ID заказа и телефон из checkout.',
    orderId: 'ID заказа',
    phone: 'Телефон',
    phonePlaceholder: '+373 68 123 456',
    find: 'Найти заказ',
    loading: 'Загрузка...',
    noOrders: 'На этом устройстве пока нет сохраненных заказов.',
    total: 'Итого',
    size: 'Размер',
    backCatalog: 'Назад в каталог',
    statusNew: 'Новый',
    statusConfirmed: 'Подтвержден',
    statusShipped: 'Отправлен',
    statusDelivered: 'Доставлен',
    statusCancelled: 'Отменен',
    statusReturned: 'Возврат',
    etaNew: 'Заказ получен. Скоро подтвердим.',
    etaConfirmed: 'Заказ подтвержден. Готовим к отправке.',
    etaShipped: 'В пути. Ожидаемая доставка 1-3 дня.',
    etaDelivered: 'Заказ успешно доставлен.',
    etaCancelled: 'Заказ отменен.',
    etaReturned: 'По заказу оформлен возврат.',
    deliveryExpected: 'Ожидаемая доставка',
    deliveredAt: 'Доставлен',
    lookupError: 'Заказ не найден или телефон не совпадает.'
  }
})

const statusLabel = (status: PublicOrder['status']) => {
  if (status === 'confirmed') return ui.value.statusConfirmed
  if (status === 'shipped') return ui.value.statusShipped
  if (status === 'delivered') return ui.value.statusDelivered
  if (status === 'cancelled') return ui.value.statusCancelled
  if (status === 'returned') return ui.value.statusReturned
  return ui.value.statusNew
}

const etaLabel = (status: PublicOrder['status']) => {
  if (status === 'confirmed') return ui.value.etaConfirmed
  if (status === 'shipped') return ui.value.etaShipped
  if (status === 'delivered') return ui.value.etaDelivered
  if (status === 'cancelled') return ui.value.etaCancelled
  if (status === 'returned') return ui.value.etaReturned
  return ui.value.etaNew
}

const formatDate = (value: string) => {
  const code = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return new Date(value).toLocaleString(code, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const findDeliveredDate = (order: PublicOrder) => {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
  const delivered = history.find((item) => item.status === 'delivered' && item.changedAt)
  return delivered?.changedAt || ''
}

const shiftDays = (iso: string, days: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

const deliveryDateText = (order: PublicOrder | null) => {
  if (!order) return ''

  if (order.status === 'cancelled' || order.status === 'returned') return ''

  if (order.status === 'delivered') {
    const deliveredAt = findDeliveredDate(order) || order.createdAt
    return `${ui.value.deliveredAt}: ${formatDate(deliveredAt)}`
  }

  const start = order.status === 'shipped' ? shiftDays(order.createdAt, 1) : shiftDays(order.createdAt, 2)
  const end = order.status === 'shipped' ? shiftDays(order.createdAt, 2) : shiftDays(order.createdAt, 3)

  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(localeCode, { day: 'numeric', month: 'long' })

  return `${ui.value.deliveryExpected}: ${fmt(start)} - ${fmt(end)}`
}

const loadTrackedOrders = async () => {
  if (!import.meta.client) return
  trackedLoading.value = true

  try {
    const raw = window.localStorage.getItem(tracksKey)
    const parsed = raw ? JSON.parse(raw) : []
    const tracks = Array.isArray(parsed)
      ? parsed.filter((item): item is SavedTrack =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as SavedTrack).id === 'string' &&
        typeof (item as SavedTrack).token === 'string'
      )
      : []

    if (!tracks.length) {
      trackedOrders.value = []
      return
    }

    const response = await $fetch<{ success: boolean; orders: PublicOrder[] }>('/api/order/tracked', {
      method: 'POST',
      body: {
        orders: tracks
      }
    })

    trackedOrders.value = Array.isArray(response.orders) ? response.orders : []
  } catch {
    trackedOrders.value = []
  } finally {
    trackedLoading.value = false
  }
}

const lookupOrder = async () => {
  lookupLoading.value = true
  lookupError.value = ''
  lookupResult.value = null

  try {
    const response = await $fetch<{ success: boolean; order: PublicOrder }>('/api/order/lookup', {
      method: 'POST',
      body: {
        orderId: lookup.orderId,
        phone: lookup.phone
      }
    })
    lookupResult.value = response.order
  } catch {
    lookupError.value = ui.value.lookupError
  } finally {
    lookupLoading.value = false
  }
}

onMounted(() => {
  loadTrackedOrders()
})

const siteUrl = 'https://onestyleforever.com'
const previewImage = `${siteUrl}/logo-preview.png`

useSeoMeta({
  title: () => `ONE STYLE FOREVER | ${ui.value.title}`,
  description: () => ui.value.subtitle,
  ogTitle: () => `ONE STYLE FOREVER | ${ui.value.title}`,
  ogDescription: () => ui.value.subtitle,
  ogImage: previewImage,
  ogType: 'website'
})
</script>

<style scoped>
.orders-page {
  padding-top: 18px;
  padding-bottom: 84px;
}

.orders-intro,
.orders-track,
.orders-lookup {
  padding: 30px;
}

.orders-title {
  font-size: clamp(34px, 4.2vw, 56px);
  line-height: 0.95;
}

.orders-text {
  margin-top: 12px;
  max-width: 760px;
}

.orders-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
}

.orders-track h2,
.orders-lookup h2 {
  margin: 0;
  font-size: 34px;
  line-height: 1;
}

.orders-help {
  margin: 10px 0 0;
  color: var(--muted);
}

.orders-list {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.orders-loading,
.empty-note {
  margin-top: 18px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--muted);
}

.order-card {
  margin-top: 16px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: #fff;
  display: grid;
  gap: 10px;
}

.order-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
}

.order-top strong {
  display: block;
  font-size: 18px;
}

.order-top span {
  color: var(--muted);
  font-size: 13px;
}

.order-status {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.status-new,
.status-confirmed {
  color: #1f5e3b;
  background: #ecf7ef;
}

.status-shipped {
  color: #25569f;
  background: #edf3ff;
}

.status-delivered {
  color: #155c40;
  background: #e6f6ec;
}

.status-cancelled,
.status-returned {
  color: #9f3131;
  background: #fff0f0;
}

.eta {
  margin: 0;
  font-size: 14px;
  color: #356446;
  font-weight: 700;
}

.eta-date {
  margin: -4px 0 0;
  font-size: 13px;
  color: #4b5f76;
  font-weight: 700;
}

.items {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
  display: grid;
  gap: 4px;
}

.order-total {
  font-size: 16px;
  font-weight: 800;
}

.lookup-form {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 14px;
  font-weight: 800;
}

.field input {
  width: 100%;
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid var(--border);
  padding: 0 14px;
  font: inherit;
}

.lookup-result {
  margin-top: 14px;
}

.error-text {
  margin-top: 12px;
  color: #b42318;
  font-weight: 700;
}

.back-link {
  margin-top: 12px;
  width: 100%;
}

@media (max-width: 1100px) {
  .orders-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .orders-intro,
  .orders-track,
  .orders-lookup {
    padding: 18px;
  }

  .orders-track h2,
  .orders-lookup h2 {
    font-size: 28px;
  }
}
</style>
