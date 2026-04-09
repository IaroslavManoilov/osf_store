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
            <div class="orders-live-row">
              <p class="orders-live">{{ ui.autoRefresh }}</p>
              <button type="button" class="btn-alt notice-toggle" @click="toggleNotices">
                {{ noticeModeLabel }}
              </button>
            </div>

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

                <div class="order-actions">
                  <button type="button" class="btn-alt order-btn" @click="repeatOrder(order)">
                    {{ ui.repeatOrder }}
                  </button>
                  <button
                    v-if="canCancelOrder(order.status)"
                    type="button"
                    class="btn-alt order-btn danger"
                    :disabled="!!cancelLoadingById[order.id]"
                    @click="cancelOrder(order)"
                  >
                    {{ cancelLoadingById[order.id] ? ui.canceling : ui.cancelOrder }}
                  </button>
                </div>

                <div v-if="order.statusHistory?.length" class="order-history">
                  <strong>{{ ui.history }}</strong>
                  <ul>
                    <li v-for="(entry, idx) in order.statusHistory" :key="`${order.id}-h-${idx}`">
                      <span>{{ statusLabel(entry.status) }}</span>
                      <time>{{ formatDate(entry.changedAt) }}</time>
                    </li>
                  </ul>
                </div>
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
              <div class="order-actions">
                <button type="button" class="btn-alt order-btn" @click="repeatOrder(lookupResult)">
                  {{ ui.repeatOrder }}
                </button>
              </div>
            </article>

            <div class="notice-center">
              <div class="notice-head">
                <strong>{{ ui.noticeCenter }}</strong>
                <button
                  v-if="orderNotices.length"
                  type="button"
                  class="btn-alt notice-clear"
                  @click="clearOrderNotices"
                >
                  {{ ui.clearNoticeCenter }}
                </button>
              </div>
              <p v-if="!orderNotices.length" class="notice-empty">{{ ui.noticeCenterEmpty }}</p>
              <ul v-else class="notice-list">
                <li v-for="notice in orderNotices" :key="notice.id" class="notice-item">
                  <p>{{ notice.text }}</p>
                  <time>{{ formatDate(notice.changedAt) }}</time>
                </li>
              </ul>
            </div>

            <NuxtLink :to="localePath('/catalog')" class="btn-alt back-link">{{ ui.backCatalog }}</NuxtLink>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProducts, type ProductSize } from '~/data/products'

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

type OrderNotice = {
  id: string
  orderId: string
  text: string
  status: PublicOrder['status']
  changedAt: string
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
  history: string
  repeatOrder: string
  repeatSuccess: string
  repeatEmpty: string
  cancelOrder: string
  canceling: string
  cancelSuccess: string
  cancelError: string
  statusChanged: string
  autoRefresh: string
  noticeCenter: string
  clearNoticeCenter: string
  noticeCenterEmpty: string
  noticesOn: string
  noticesCenterOnly: string
  noticesOff: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const shopStore = useShopStore()
const uiStore = useUiStore()

const tracksKey = 'osf_order_tracks_v1'
const noticesKey = 'osf_order_notices_v1'
const noticesEnabledKeyLegacy = 'osf_order_notices_enabled_v1'
const noticesModeKey = 'osf_order_notices_mode_v1'
const maxNotices = 20

const trackedOrders = ref<PublicOrder[]>([])
const trackedLoading = ref(false)
const lookupLoading = ref(false)
const lookupError = ref('')
const lookupResult = ref<PublicOrder | null>(null)
const cancelLoadingById = ref<Record<string, boolean>>({})
const trackTokenByOrderId = ref<Record<string, string>>({})
const ordersPollTimer = ref<ReturnType<typeof setInterval> | null>(null)
const knownStatusByOrderId = ref<Record<string, PublicOrder['status']>>({})
const knownHistoryByOrderId = ref<Record<string, number>>({})
const orderNotices = ref<OrderNotice[]>([])
const notificationsMode = ref<'all' | 'history' | 'off'>('all')

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
      lookupError: 'Comanda nu a fost găsită sau telefonul nu coincide.',
      history: 'Istoric status',
      repeatOrder: 'Repetă comanda',
      repeatSuccess: 'Produsele au fost adăugate în coș.',
      repeatEmpty: 'Nu am putut adăuga produse în coș.',
      cancelOrder: 'Anulează comanda',
      canceling: 'Se anulează...',
      cancelSuccess: 'Comanda a fost anulată.',
      cancelError: 'Nu am reușit anularea comenzii.',
      statusChanged: 'Status actualizat',
      autoRefresh: 'Actualizare automată activă',
      noticeCenter: 'Notificări comandă',
      clearNoticeCenter: 'Curăță',
      noticeCenterEmpty: 'Nu există notificări încă.',
      noticesOn: 'Notificări: ON',
      noticesCenterOnly: 'Notificări: doar centru',
      noticesOff: 'Notificări: OFF'
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
      lookupError: 'Order not found or phone does not match.',
      history: 'Status history',
      repeatOrder: 'Repeat order',
      repeatSuccess: 'Products were added to cart.',
      repeatEmpty: 'Could not add products to cart.',
      cancelOrder: 'Cancel order',
      canceling: 'Cancelling...',
      cancelSuccess: 'Order was cancelled.',
      cancelError: 'Could not cancel order.',
      statusChanged: 'Status updated',
      autoRefresh: 'Auto refresh is active',
      noticeCenter: 'Order notifications',
      clearNoticeCenter: 'Clear',
      noticeCenterEmpty: 'No notifications yet.',
      noticesOn: 'Notifications: ON',
      noticesCenterOnly: 'Notifications: center only',
      noticesOff: 'Notifications: OFF'
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
    lookupError: 'Заказ не найден или телефон не совпадает.',
    history: 'История статусов',
    repeatOrder: 'Повторить заказ',
    repeatSuccess: 'Товары добавлены в корзину.',
    repeatEmpty: 'Не удалось добавить товары в корзину.',
    cancelOrder: 'Отменить заказ',
    canceling: 'Отменяем...',
    cancelSuccess: 'Заказ отменен.',
    cancelError: 'Не удалось отменить заказ.',
    statusChanged: 'Статус обновлен',
    autoRefresh: 'Автообновление включено',
    noticeCenter: 'Уведомления по заказам',
    clearNoticeCenter: 'Очистить',
    noticeCenterEmpty: 'Пока нет уведомлений.',
    noticesOn: 'Уведомления: ВКЛ',
    noticesCenterOnly: 'Уведомления: только центр',
    noticesOff: 'Уведомления: ВЫКЛ'
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

const noticeModeLabel = computed(() => {
  if (notificationsMode.value === 'history') return ui.value.noticesCenterOnly
  if (notificationsMode.value === 'off') return ui.value.noticesOff
  return ui.value.noticesOn
})

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

const parseSavedTracks = (): SavedTrack[] => {
  if (!import.meta.client) return []
  try {
    const raw = window.localStorage.getItem(tracksKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((item): item is SavedTrack =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as SavedTrack).id === 'string' &&
        typeof (item as SavedTrack).token === 'string'
      )
      : []
  } catch {
    return []
  }
}

const persistTrack = (track: SavedTrack) => {
  if (!import.meta.client || !track.id || !track.token) return

  const current = parseSavedTracks()
  const next = [
    {
      id: String(track.id || '').trim(),
      token: String(track.token || '').trim(),
      createdAt: track.createdAt || new Date().toISOString()
    },
    ...current.filter((item) => item.id !== track.id)
  ].slice(0, 30)

  try {
    window.localStorage.setItem(tracksKey, JSON.stringify(next))
  } catch {
    // Ignore local storage write failures.
  }
}

const saveNotices = () => {
  if (!import.meta.client) return
  window.localStorage.setItem(noticesKey, JSON.stringify(orderNotices.value))
}

const saveNoticesMode = () => {
  if (!import.meta.client) return
  window.localStorage.setItem(noticesModeKey, notificationsMode.value)
}

const loadNoticesMode = () => {
  if (!import.meta.client) return
  const mode = window.localStorage.getItem(noticesModeKey)
  if (mode === 'all' || mode === 'history' || mode === 'off') {
    notificationsMode.value = mode
    return
  }

  // Backward compatibility with previous boolean key.
  const legacy = window.localStorage.getItem(noticesEnabledKeyLegacy)
  notificationsMode.value = legacy === '0' ? 'off' : 'all'
}

const loadNotices = () => {
  if (!import.meta.client) return
  try {
    const raw = window.localStorage.getItem(noticesKey)
    const parsed = raw ? JSON.parse(raw) : []
    const next = Array.isArray(parsed)
      ? parsed
        .filter((item): item is OrderNotice =>
          !!item &&
          typeof item === 'object' &&
          typeof (item as OrderNotice).id === 'string' &&
          typeof (item as OrderNotice).orderId === 'string' &&
          typeof (item as OrderNotice).text === 'string' &&
          typeof (item as OrderNotice).status === 'string' &&
          typeof (item as OrderNotice).changedAt === 'string'
        )
        .slice(0, maxNotices)
      : []
    orderNotices.value = next
  } catch {
    orderNotices.value = []
  }
}

const pushOrderNotice = (order: PublicOrder) => {
  if (notificationsMode.value === 'off') return

  const text = `${ui.value.statusChanged}: ${order.id} → ${statusLabel(order.status)}`
  const next: OrderNotice[] = [
    {
      id: `${order.id}-${order.status}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: order.id,
      text,
      status: order.status,
      changedAt: new Date().toISOString()
    },
    ...orderNotices.value
  ].slice(0, maxNotices)

  orderNotices.value = next
  saveNotices()
  if (notificationsMode.value === 'all') {
    uiStore.showToast(text, 'info')
  }
}

const toggleNotices = () => {
  if (notificationsMode.value === 'all') {
    notificationsMode.value = 'history'
  } else if (notificationsMode.value === 'history') {
    notificationsMode.value = 'off'
  } else {
    notificationsMode.value = 'all'
  }
  saveNoticesMode()
}

const clearOrderNotices = () => {
  orderNotices.value = []
  saveNotices()
}

const rememberTrackedState = (orders: PublicOrder[]) => {
  const nextStatusMap: Record<string, PublicOrder['status']> = {}
  const nextHistoryMap: Record<string, number> = {}

  for (const order of orders) {
    nextStatusMap[order.id] = order.status
    nextHistoryMap[order.id] = Array.isArray(order.statusHistory) ? order.statusHistory.length : 0
  }

  knownStatusByOrderId.value = nextStatusMap
  knownHistoryByOrderId.value = nextHistoryMap
}

const canCancelOrder = (status: PublicOrder['status']) => status === 'new' || status === 'confirmed'

const productsById = computed(() => {
  return new Map(getProducts(locale.value).map((product) => [product.id, product]))
})

const repeatOrder = (order: PublicOrder) => {
  let added = 0

  for (const item of order.items) {
    const product = productsById.value.get(item.id)
    if (!product) continue

    const fallbackSize = product.sizes[0] as ProductSize
    const rawSize = String(item.selectedSize || '').trim().toUpperCase() as ProductSize
    const selectedSize = product.sizes.includes(rawSize) ? rawSize : fallbackSize
    const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity || 1))))

    for (let idx = 0; idx < quantity; idx += 1) {
      shopStore.addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        description: product.description,
        selectedSize
      })
      added += 1
    }
  }

  if (added > 0) {
    uiStore.showToast(ui.value.repeatSuccess, 'success')
    return
  }

  uiStore.showToast(ui.value.repeatEmpty, 'error')
}

const cancelOrder = async (order: PublicOrder) => {
  const orderId = order.id
  if (!canCancelOrder(order.status)) return

  const token = trackTokenByOrderId.value[orderId] || ''
  if (!token) {
    uiStore.showToast(ui.value.cancelError, 'error')
    return
  }

  cancelLoadingById.value = {
    ...cancelLoadingById.value,
    [orderId]: true
  }

  try {
    const response = await $fetch<{ success: boolean; order: PublicOrder }>('/api/order/cancel', {
      method: 'POST',
      body: {
        orderId,
        token
      }
    })

    trackedOrders.value = trackedOrders.value.map((item) => item.id === orderId ? response.order : item)
    rememberTrackedState(trackedOrders.value)
    if (lookupResult.value?.id === orderId) {
      lookupResult.value = response.order
    }
    uiStore.showToast(ui.value.cancelSuccess, 'success')
  } catch {
    uiStore.showToast(ui.value.cancelError, 'error')
  } finally {
    const next = { ...cancelLoadingById.value }
    delete next[orderId]
    cancelLoadingById.value = next
  }
}

const loadTrackedOrders = async (options?: { silent?: boolean; detectChanges?: boolean }) => {
  if (!import.meta.client) return
  const silent = !!options?.silent
  const detectChanges = !!options?.detectChanges
  if (!silent) {
    trackedLoading.value = true
  }

  try {
    const tracks = parseSavedTracks()
    const tokenMap: Record<string, string> = {}
    for (const entry of tracks) {
      tokenMap[entry.id] = entry.token
    }
    trackTokenByOrderId.value = tokenMap

    if (!tracks.length) {
      trackedOrders.value = []
      knownStatusByOrderId.value = {}
      knownHistoryByOrderId.value = {}
      return
    }

    const response = await $fetch<{ success: boolean; orders: PublicOrder[] }>('/api/order/tracked', {
      method: 'POST',
      body: {
        orders: tracks
      }
    })

    const nextOrders = Array.isArray(response.orders) ? response.orders : []

    if (detectChanges) {
      for (const order of nextOrders) {
        const previousStatus = knownStatusByOrderId.value[order.id]
        const previousHistoryLen = knownHistoryByOrderId.value[order.id] || 0
        const currentHistoryLen = Array.isArray(order.statusHistory) ? order.statusHistory.length : 0
        const statusChanged = !!previousStatus && previousStatus !== order.status
        const historyAppended = previousHistoryLen > 0 && currentHistoryLen > previousHistoryLen

        if (statusChanged || historyAppended) {
          pushOrderNotice(order)
        }
      }
    }

    trackedOrders.value = nextOrders
    rememberTrackedState(nextOrders)
  } catch {
    trackedOrders.value = []
  } finally {
    if (!silent) {
      trackedLoading.value = false
    }
  }
}

const lookupOrder = async () => {
  lookupLoading.value = true
  lookupError.value = ''
  lookupResult.value = null

  try {
    const response = await $fetch<{ success: boolean; order: PublicOrder; trackToken?: string }>('/api/order/lookup', {
      method: 'POST',
      body: {
        orderId: lookup.orderId,
        phone: lookup.phone
      }
    })
    lookupResult.value = response.order
    if (response.trackToken) {
      persistTrack({
        id: response.order.id,
        token: response.trackToken,
        createdAt: response.order.createdAt
      })
      await loadTrackedOrders({ silent: true })
    }
  } catch {
    lookupError.value = ui.value.lookupError
  } finally {
    lookupLoading.value = false
  }
}

const applyOrdersLinkTrack = async () => {
  if (!import.meta.client) return
  const rawOrderId = route.query.orderId
  const rawToken = route.query.trackToken
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId
  const trackToken = Array.isArray(rawToken) ? rawToken[0] : rawToken

  if (!orderId || !trackToken) return

  persistTrack({
    id: String(orderId).trim(),
    token: String(trackToken).trim(),
    createdAt: new Date().toISOString()
  })

  await loadTrackedOrders({ silent: true })
}

onMounted(() => {
  loadNoticesMode()
  loadNotices()
  loadTrackedOrders()
  applyOrdersLinkTrack()
  ordersPollTimer.value = setInterval(() => {
    loadTrackedOrders({ silent: true, detectChanges: true })
  }, 15000)
})

onBeforeUnmount(() => {
  if (ordersPollTimer.value) {
    clearInterval(ordersPollTimer.value)
    ordersPollTimer.value = null
  }
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

.orders-live {
  margin: 8px 0 0;
  color: #2d6a43;
  font-size: 13px;
  font-weight: 700;
}

.orders-live-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.orders-live-row .orders-live {
  margin: 0;
}

.notice-toggle {
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
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

.order-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.order-btn {
  min-height: 38px;
  padding: 0 14px;
}

.order-btn.danger {
  color: #8a2a2a;
  border-color: #efcaca;
}

.order-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.order-history {
  border-top: 1px solid var(--border);
  padding-top: 10px;
  display: grid;
  gap: 8px;
}

.order-history strong {
  font-size: 13px;
}

.order-history ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.order-history li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--muted);
  font-size: 13px;
}

.order-history li span {
  color: #23334a;
  font-weight: 700;
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

.notice-center {
  margin-top: 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 12px;
  display: grid;
  gap: 10px;
}

.notice-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.notice-head strong {
  font-size: 14px;
}

.notice-clear {
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
}

.notice-empty {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.notice-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
  max-height: 260px;
  overflow: auto;
}

.notice-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
}

.notice-item p {
  margin: 0;
  font-size: 13px;
  color: #23334a;
  font-weight: 700;
}

.notice-item time {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
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

  .orders-live-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-actions {
    flex-direction: column;
  }

  .order-btn {
    width: 100%;
  }
}
</style>
