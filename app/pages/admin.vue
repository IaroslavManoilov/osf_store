<template>
  <div class="admin-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card admin-hero">
          <span class="section-label">OSF Admin</span>
          <h1 class="section-title admin-title">{{ ui.title }}</h1>
          <p class="section-text admin-subtitle">{{ ui.subtitle }}</p>

          <div class="admin-access">
            <input
              v-model.trim="adminKey"
              type="password"
              :placeholder="ui.keyPlaceholder"
              autocomplete="off"
              @keyup.enter="loadOrders"
            />
            <input
              v-model.trim="adminActor"
              type="text"
              :placeholder="ui.actorPlaceholder"
              autocomplete="off"
            />
            <button type="button" class="btn-main" :disabled="loading" @click="loadOrders">
              {{ loading ? ui.loading : ui.load }}
            </button>
          </div>

          <div class="admin-actions" v-if="loaded || adminKey">
            <button type="button" class="btn-alt" @click="logout()">{{ ui.logout }}</button>
          </div>

          <p v-if="errorMessage" class="admin-error">{{ errorMessage }}</p>
        </div>
      </div>
    </section>

    <section v-if="orders.length" class="section-space">
      <div class="site-container">
        <div class="admin-topbar">
          <strong>{{ ui.ordersCount }}: {{ orders.length }}</strong>

          <select v-model="statusFilter" class="status-filter" @change="loadOrders">
            <option value="">{{ ui.statusAll }}</option>
            <option v-for="status in statuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
          </select>
        </div>

        <div class="orders-grid">
          <article v-for="order in orders" :key="order.id" class="surface-card order-card">
            <div class="order-head">
              <div>
                <h2>{{ order.id }}</h2>
                <p>{{ formatDate(order.createdAt) }}</p>
              </div>
              <span class="status-pill" :class="`s-${order.status}`">{{ statusLabel(order.status) }}</span>
            </div>

            <div class="order-meta">
              <p><strong>{{ ui.customer }}</strong> {{ order.customer.name }}</p>
              <p><strong>{{ ui.phone }}</strong> {{ order.customer.phone }}</p>
              <p><strong>{{ ui.address }}</strong> {{ order.customer.address }}</p>
              <p v-if="order.customer.email"><strong>Email:</strong> {{ order.customer.email }}</p>
              <p v-if="order.customer.comment"><strong>{{ ui.comment }}</strong> {{ order.customer.comment }}</p>
            </div>

            <div class="order-items">
              <strong>{{ ui.items }}</strong>
              <ul>
                <li v-for="(item, index) in order.items" :key="`${order.id}-${index}`">
                  {{ item.title }} · {{ item.quantity }} × {{ item.price }} MDL
                  <span v-if="item.selectedSize"> · {{ ui.size }}: {{ item.selectedSize }}</span>
                </li>
              </ul>
            </div>

            <div class="order-foot">
              <strong>{{ ui.total }}: {{ order.total }} MDL</strong>
              <div class="update-row">
                <select v-model="draftStatus[order.id]" class="status-select">
                  <option v-for="status in statuses" :key="`${order.id}-${status}`" :value="status">
                    {{ statusLabel(status) }}
                  </option>
                </select>
                <button
                  type="button"
                  class="btn-alt"
                  :disabled="savingId === order.id"
                  @click="updateStatus(order.id)"
                >
                  {{ savingId === order.id ? ui.saving : ui.saveStatus }}
                </button>
              </div>
            </div>

            <div class="order-audit">
              <strong>{{ ui.auditTitle }}</strong>
              <ul v-if="order.statusHistory?.length">
                <li v-for="(entry, index) in order.statusHistory" :key="`${order.id}-history-${index}`">
                  {{ formatDate(entry.changedAt) }} · {{ statusLabel(entry.status) }} · {{ ui.changedBy }} {{ entry.actor || ui.auditUnknown }}
                  <span v-if="entry.note"> · {{ entry.note }}</span>
                </li>
              </ul>
              <p v-else class="audit-empty">{{ ui.auditEmpty }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section v-else-if="loaded" class="section-space">
      <div class="site-container">
        <div class="surface-card empty-box">
          <h2>{{ ui.emptyTitle }}</h2>
          <p>{{ ui.emptyText }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

type AdminOrder = {
  id: string
  createdAt: string
  customer: {
    name: string
    phone: string
    email?: string
    address: string
    comment?: string
  }
  items: Array<{
    id: string
    title: string
    price: number
    quantity: number
    selectedSize?: string
  }>
  total: number
  status: OrderStatus
  statusHistory?: Array<{
    status: OrderStatus
    changedAt: string
    note?: string
    actor?: string
  }>
}

const { locale } = useI18n()
const uiStore = useUiStore()

const statuses: OrderStatus[] = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned']
const adminActorStorageKey = 'osf_admin_actor_v1'

const adminKey = ref('')
const adminActor = ref('Owner')
const loading = ref(false)
const loaded = ref(false)
const savingId = ref('')
const statusFilter = ref('')
const errorMessage = ref('')
const orders = ref<AdminOrder[]>([])
const draftStatus = reactive<Record<string, OrderStatus>>({})

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      title: 'Panou administrare comenzi',
      subtitle: 'Vezi comenzile noi, actualizează statusul și urmărește procesarea în timp real.',
      keyPlaceholder: 'Cheie admin',
      actorPlaceholder: 'Operator (nume)',
      load: 'Încarcă comenzi',
      loading: 'Se încarcă...',
      logout: 'Ieșire',
      ordersCount: 'Comenzi',
      statusAll: 'Toate statusurile',
      customer: 'Client:',
      phone: 'Telefon:',
      address: 'Adresă:',
      comment: 'Comentariu:',
      items: 'Produse',
      size: 'Mărime',
      total: 'Total',
      saveStatus: 'Salvează status',
      saving: 'Se salvează...',
      auditTitle: 'Audit status',
      changedBy: 'De:',
      auditUnknown: 'admin',
      auditEmpty: 'Nu există istoric de status.',
      emptyTitle: 'Nu există comenzi',
      emptyText: 'După checkout, comenzile vor apărea aici.',
      sessionExpired: 'Sesiunea admin a expirat. Conectează-te din nou.'
    }
  }

  if (locale.value === 'en') {
    return {
      title: 'Order admin panel',
      subtitle: 'View incoming orders, update statuses, and track fulfillment flow.',
      keyPlaceholder: 'Admin key',
      actorPlaceholder: 'Operator (name)',
      load: 'Load orders',
      loading: 'Loading...',
      logout: 'Logout',
      ordersCount: 'Orders',
      statusAll: 'All statuses',
      customer: 'Customer:',
      phone: 'Phone:',
      address: 'Address:',
      comment: 'Comment:',
      items: 'Items',
      size: 'Size',
      total: 'Total',
      saveStatus: 'Save status',
      saving: 'Saving...',
      auditTitle: 'Status audit',
      changedBy: 'By:',
      auditUnknown: 'admin',
      auditEmpty: 'No status history yet.',
      emptyTitle: 'No orders yet',
      emptyText: 'Orders from checkout will appear here.',
      sessionExpired: 'Admin session expired. Please sign in again.'
    }
  }

  return {
    title: 'Админ-панель заказов',
    subtitle: 'Смотри новые заказы, обновляй статусы и контролируй обработку.',
    keyPlaceholder: 'Ключ администратора',
    actorPlaceholder: 'Оператор (имя)',
    load: 'Загрузить заказы',
    loading: 'Загрузка...',
    logout: 'Выйти',
    ordersCount: 'Заказы',
    statusAll: 'Все статусы',
    customer: 'Клиент:',
    phone: 'Телефон:',
    address: 'Адрес:',
    comment: 'Комментарий:',
    items: 'Товары',
    size: 'Размер',
    total: 'Итого',
    saveStatus: 'Сохранить статус',
    saving: 'Сохранение...',
    auditTitle: 'Аудит статусов',
    changedBy: 'Кто:',
    auditUnknown: 'admin',
    auditEmpty: 'История статусов пока пуста.',
    emptyTitle: 'Заказов пока нет',
    emptyText: 'После checkout заказы появятся здесь.',
    sessionExpired: 'Сессия админа истекла. Войдите снова.'
  }
})

const statusLabel = (status: OrderStatus) => {
  if (locale.value === 'ro') {
    return {
      new: 'Nou',
      confirmed: 'Confirmat',
      shipped: 'Expediat',
      delivered: 'Livrat',
      cancelled: 'Anulat',
      returned: 'Returnat'
    }[status]
  }

  if (locale.value === 'en') {
    return {
      new: 'New',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    }[status]
  }

  return {
    new: 'Новый',
    confirmed: 'Подтвержден',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
    returned: 'Возврат'
  }[status]
}

const formatDate = (iso: string) => {
  const date = new Date(iso)
  const code = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleString(code)
}

const fetchOrders = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<{ success: boolean; orders: AdminOrder[] }>('/api/admin/orders', {
      query: statusFilter.value ? { status: statusFilter.value } : undefined
    })

    orders.value = response.orders.map((order) => ({
      ...order,
      statusHistory: Array.isArray(order.statusHistory)
        ? order.statusHistory
            .filter((entry) => !!entry?.status && !!entry?.changedAt)
            .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
        : []
    }))
    for (const order of orders.value) {
      draftStatus[order.id] = order.status
    }

    loaded.value = true
  } catch (error) {
    errorMessage.value = resolveErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const loadOrders = async () => {
  if (!loaded.value) {
    if (!adminKey.value) {
      errorMessage.value = locale.value === 'en' ? 'Enter admin key' : locale.value === 'ro' ? 'Introdu cheia admin' : 'Введите ключ администратора'
      return
    }

    try {
      await $fetch('/api/admin/session/login', {
        method: 'POST',
        body: {
          key: adminKey.value,
          actor: adminActor.value.trim() || 'Owner'
        }
      })
      persistAdminActor()
    } catch (error) {
      errorMessage.value = resolveErrorMessage(error)
      return
    }
  }

  await fetchOrders()
}

const updateStatus = async (orderId: string) => {
  const nextStatus = draftStatus[orderId]
  if (!nextStatus) return

  const target = orders.value.find((item) => item.id === orderId)
  const previousStatus = target?.status
  savingId.value = orderId

  try {
    const response = await $fetch<{ success: boolean; order: AdminOrder }>(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: {
        status: nextStatus,
        note: previousStatus && previousStatus !== nextStatus ? `${previousStatus} -> ${nextStatus}` : undefined
      }
    })

    if (target) {
      target.status = nextStatus
      target.statusHistory = Array.isArray(response.order.statusHistory)
        ? response.order.statusHistory
            .filter((entry) => !!entry?.status && !!entry?.changedAt)
            .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
        : []
    }

    uiStore.showToast(locale.value === 'en' ? 'Status updated' : locale.value === 'ro' ? 'Status actualizat' : 'Статус обновлен', 'success')
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    savingId.value = ''
  }
}

const resolveErrorMessage = (error: unknown) => {
  const maybe = error as {
    data?: { statusMessage?: string }
    statusMessage?: string
    message?: string
  }

  return (
    maybe?.data?.statusMessage ||
    maybe?.statusMessage ||
    maybe?.message ||
    String(error)
  )
}

const persistAdminActor = () => {
  if (!import.meta.client) return
  window.localStorage.setItem(adminActorStorageKey, adminActor.value.trim() || 'Owner')
}

const logout = async (showToast = false) => {
  try {
    await $fetch('/api/admin/session/logout', { method: 'POST' })
  } catch {
    // Ignore logout API failures.
  }

  adminKey.value = ''
  orders.value = []
  loaded.value = false
  errorMessage.value = ''

  if (showToast) {
    uiStore.showToast(ui.value.sessionExpired, 'info')
  }
}

onMounted(() => {
  if (!import.meta.client) return
  const savedActor = window.localStorage.getItem(adminActorStorageKey) || ''
  if (savedActor) {
    adminActor.value = savedActor
  }

  $fetch<{ success: boolean; actor?: string }>('/api/admin/session/me')
    .then((response) => {
      if (response?.actor) {
        adminActor.value = response.actor
        persistAdminActor()
      }
      return fetchOrders()
    })
    .catch(() => {
      loaded.value = false
    })
})

onBeforeUnmount(() => {
  persistAdminActor()
})

useSeoMeta({
  title: 'Admin | ONE STYLE FOREVER',
  robots: 'noindex, nofollow'
})
</script>

<style scoped>
.admin-page {
  padding-top: 18px;
}

.admin-hero {
  padding: 28px;
}

.admin-title {
  font-size: clamp(32px, 4vw, 52px);
  line-height: 0.97;
}

.admin-subtitle {
  margin-top: 12px;
  max-width: 760px;
}

.admin-access {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 240px) minmax(0, 220px) auto;
  gap: 10px;
  align-items: center;
}

.admin-actions {
  margin-top: 10px;
}

.admin-access input,
.status-filter,
.status-select {
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 12px;
  font: inherit;
  color: var(--text);
  outline: none;
}

.admin-error {
  margin: 10px 0 0;
  color: #b62828;
}

.admin-topbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.orders-grid {
  display: grid;
  gap: 12px;
}

.order-card {
  padding: 16px;
}

.order-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.order-head h2 {
  margin: 0;
  font-size: 20px;
}

.order-head p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.status-pill {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.s-new { background: #eef7f0; color: #1f5d3b; border-color: #bcdac4; }
.s-confirmed { background: #edf4fb; color: #2a5678; border-color: #c7d9ec; }
.s-shipped { background: #fff7eb; color: #80511f; border-color: #edd7bb; }
.s-delivered { background: #edf9f0; color: #1f6f41; border-color: #bfe0c9; }
.s-cancelled { background: #fff1f1; color: #8a2a2a; border-color: #efcaca; }
.s-returned { background: #f7f2ff; color: #5f3c8b; border-color: #dbcbef; }

.order-meta {
  margin-top: 12px;
  display: grid;
  gap: 6px;
}

.order-meta p {
  margin: 0;
  color: #334b62;
  font-size: 14px;
}

.order-items {
  margin-top: 12px;
}

.order-items strong {
  font-size: 14px;
}

.order-items ul {
  margin: 8px 0 0;
  padding-left: 16px;
  display: grid;
  gap: 4px;
  color: #334b62;
}

.order-foot {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.order-audit {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.order-audit strong {
  font-size: 13px;
}

.order-audit ul {
  margin: 8px 0 0;
  padding-left: 16px;
  display: grid;
  gap: 4px;
  color: #4a5a70;
  font-size: 13px;
}

.audit-empty {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.update-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.empty-box {
  padding: 24px;
}

@media (max-width: 780px) {
  .admin-hero,
  .empty-box {
    padding: 18px;
  }

  .admin-access {
    grid-template-columns: 1fr;
  }

  .admin-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .update-row {
    width: 100%;
  }

  .status-select,
  .update-row .btn-alt {
    width: 100%;
  }
}
</style>
