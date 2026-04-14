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

    <section v-if="loaded" class="section-space">
      <div class="site-container">
        <div class="surface-card inventory-card">
          <div class="inventory-head">
            <h2>{{ ui.inventoryTitle }}</h2>
            <div class="inventory-actions">
              <button type="button" class="btn-alt" :disabled="loadingInventory" @click="loadInventory">
                {{ loadingInventory ? ui.loading : ui.refreshInventory }}
              </button>
              <button type="button" class="btn-alt" :disabled="exportingCsv" @click="exportOrdersCsv">
                {{ exportingCsv ? ui.loading : ui.exportCsv }}
              </button>
            </div>
          </div>

          <div class="inventory-grid" v-if="inventoryProducts.length">
            <article v-for="product in inventoryProducts" :key="product.id" class="inventory-item">
              <div class="inventory-item-head">
                <h3>{{ product.title }}</h3>
                <span>{{ ui.inventoryProductCode }}: {{ product.id }}</span>
              </div>

              <div class="inventory-sizes">
                <label v-for="size in sizes" :key="`${product.id}-${size}`">
                  <span>{{ size }}</span>
                  <input
                    :value="inventoryValue(product.id, size)"
                    type="number"
                    min="0"
                    max="9999"
                    step="1"
                    @input="onInventoryInput(product.id, size, $event)"
                  />
                </label>
              </div>

              <div class="inventory-foot">
                <strong>{{ ui.inventoryTotal }}: {{ inventoryTotal(product.id) }}</strong>
                <button
                  type="button"
                  class="btn-alt"
                  :disabled="savingInventoryId === product.id"
                  @click="saveInventory(product.id)"
                >
                  {{ savingInventoryId === product.id ? ui.saving : ui.saveInventory }}
                </button>
              </div>
            </article>
          </div>

          <div class="low-stock-box" v-if="lowStockItems.length">
            <div class="inventory-history-head">
              <strong>{{ ui.lowStockTitle }}</strong>
              <span>{{ ui.lowStockThresholdLabel }}: {{ lowStockThreshold }}</span>
            </div>
            <ul>
              <li v-for="entry in lowStockItems" :key="`${entry.productId}-${entry.size}`">
                {{ ui.inventoryProductCode }}: {{ entry.productId }} · {{ ui.size }} {{ entry.size }} · {{ entry.quantity }}
              </li>
            </ul>
          </div>

          <div class="inventory-history" v-if="inventoryHistory.length">
            <div class="inventory-history-head">
              <strong>{{ ui.inventoryLogTitle }}</strong>
            </div>
            <ul>
              <li v-for="entry in inventoryHistory" :key="entry.id">
                {{ formatDate(entry.changedAt) }} ·
                {{ ui.inventoryProductCode }}: {{ entry.productId }} ·
                {{ ui.size }} {{ entry.size }} ·
                {{ entry.prevQuantity }} → {{ entry.nextQuantity }} ({{ formatDelta(entry.delta) }}) ·
                {{ ui.changedBy }} {{ entry.actor || ui.auditUnknown }} ·
                {{ ui.source }}: {{ sourceLabel(entry.source || '') }} ·
                {{ ui.reason }}: {{ entry.reason || '-' }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section v-if="loaded" class="section-space">
      <div class="site-container">
        <div class="surface-card products-card">
          <div class="products-head">
            <h2>{{ ui.productsTitle }}</h2>
            <div class="products-head-actions">
              <button type="button" class="btn-alt" :disabled="csvImportBusy" @click="downloadCsvTemplate">
                {{ ui.csvTemplate }}
              </button>
              <button type="button" class="btn-alt" :disabled="savingProducts" @click="saveProductsBulk">
                {{ savingProducts ? ui.saving : ui.saveProducts }}
              </button>
            </div>
          </div>

          <div class="csv-import-box">
            <div>
              <strong>{{ ui.csvImportTitle }}</strong>
              <p>{{ ui.csvImportHint }}</p>
              <p class="csv-file-name" v-if="csvFileName">{{ csvFileName }}</p>
            </div>
            <div class="csv-import-actions">
              <input
                ref="csvInputEl"
                class="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                @change="onCsvFilePicked"
              />
              <button type="button" class="btn-alt" :disabled="csvImportBusy" @click="triggerCsvPick">
                {{ ui.csvChoose }}
              </button>
              <button type="button" class="btn-main" :disabled="csvImportBusy || !csvContent" @click="importProductsCsv">
                {{ csvImportBusy ? ui.loading : ui.csvImport }}
              </button>
            </div>
          </div>

          <div class="products-grid">
            <article v-for="product in editableProducts" :key="product.id" class="products-item">
              <div class="products-item-head">
                <strong>{{ product.id }}</strong>
                <label class="toggle-active">
                  <input v-model="product.isActive" type="checkbox" />
                  <span>{{ ui.productActive }}</span>
                </label>
              </div>

              <div class="products-row">
                <label>
                  <span>{{ ui.productPrice }}</span>
                  <input v-model.number="product.price" type="number" min="0" max="1000000" step="1" />
                </label>
                <label>
                  <span>{{ ui.productBadge }}</span>
                  <select v-model="product.badge">
                    <option value="NEW">NEW</option>
                    <option value="HOT">HOT</option>
                  </select>
                </label>
              </div>

              <div class="products-row columns-3">
                <label>
                  <span>{{ ui.productTitleRu }}</span>
                  <input v-model.trim="product.titleRu" type="text" />
                </label>
                <label>
                  <span>{{ ui.productTitleRo }}</span>
                  <input v-model.trim="product.titleRo" type="text" />
                </label>
                <label>
                  <span>{{ ui.productTitleEn }}</span>
                  <input v-model.trim="product.titleEn" type="text" />
                </label>
              </div>

              <div class="products-row columns-3">
                <label>
                  <span>{{ ui.productShortRu }}</span>
                  <input v-model.trim="product.shortRu" type="text" />
                </label>
                <label>
                  <span>{{ ui.productShortRo }}</span>
                  <input v-model.trim="product.shortRo" type="text" />
                </label>
                <label>
                  <span>{{ ui.productShortEn }}</span>
                  <input v-model.trim="product.shortEn" type="text" />
                </label>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section v-if="loaded && auditEntries.length" class="section-space">
      <div class="site-container">
        <div class="surface-card audit-card">
          <div class="audit-head">
            <h2>{{ ui.globalAuditTitle }}</h2>
            <button type="button" class="btn-alt" :disabled="loadingAudit" @click="loadAudit">
              {{ loadingAudit ? ui.loading : ui.refreshAudit }}
            </button>
          </div>

          <ul class="global-audit-list">
            <li v-for="entry in auditEntries" :key="entry.id">
              {{ formatDate(entry.createdAt) }} · {{ entry.actor || ui.auditUnknown }} · {{ entry.action }}
              <span v-if="entry.targetType || entry.targetId"> · {{ entry.targetType || '-' }} / {{ entry.targetId || '-' }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section v-if="loaded && orders.length" class="section-space">
      <div class="site-container">
        <div class="admin-topbar">
          <div class="orders-filters">
            <strong>{{ ui.ordersCount }}: {{ orders.length }}</strong>
            <select v-model="statusFilter" class="status-filter" @change="loadOrders">
              <option value="">{{ ui.statusAll }}</option>
              <option v-for="status in statuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
            </select>
            <input v-model="dateFrom" type="date" class="status-filter date-filter" />
            <input v-model="dateTo" type="date" class="status-filter date-filter" />
            <button type="button" class="btn-alt" @click="loadOrders">{{ ui.applyFilters }}</button>
            <button type="button" class="btn-alt" @click="resetOrderFilters">{{ ui.resetFilters }}</button>
          </div>
        </div>

        <div class="surface-card bulk-status-card">
          <div class="bulk-row">
            <label class="bulk-check-all">
              <input type="checkbox" :checked="allVisibleSelected" @change="toggleAllVisible($event)" />
              <span>{{ ui.selectAllVisible }}</span>
            </label>
            <strong>{{ ui.selectedOrders }}: {{ selectedCount }}</strong>
          </div>
          <div class="bulk-row">
            <select v-model="bulkStatus" class="status-select">
              <option v-for="status in statuses" :key="`bulk-${status}`" :value="status">
                {{ statusLabel(status) }}
              </option>
            </select>
            <input
              v-model.trim="bulkNote"
              class="status-note-input"
              type="text"
              :placeholder="ui.bulkNotePlaceholder"
            />
            <button
              type="button"
              class="btn-main"
              :disabled="bulkLoading || !selectedCount"
              @click="applyBulkStatus"
            >
              {{ bulkLoading ? ui.loading : ui.applyBulk }}
            </button>
          </div>
        </div>

        <div class="orders-grid">
          <article v-for="order in orders" :key="order.id" class="surface-card order-card">
            <div class="order-head">
              <div>
                <label class="order-select-row">
                  <input type="checkbox" :checked="isOrderSelected(order.id)" @change="toggleOrderSelection(order.id, $event)" />
                  <span>{{ ui.selectOrder }}</span>
                </label>
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
	                <input
	                  v-model.trim="draftNote[order.id]"
	                  class="status-note-input"
	                  type="text"
	                  :placeholder="ui.statusNotePlaceholder"
	                />
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
import { getProducts } from '../data/products'

type OrderStatus = 'new' | 'confirmed' | 'assembled' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

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

type InventorySize = 'S' | 'M' | 'L'
type InventoryHistoryEntry = {
  id: number
  productId: string
  size: InventorySize
  prevQuantity: number
  nextQuantity: number
  delta: number
  changedAt: string
  actor?: string
  source?: string
  reason?: string
}

type ProductOverrideRow = {
  productId: string
  price: number | null
  badge: 'NEW' | 'HOT' | null
  isActive: boolean | null
  titleRu: string | null
  titleRo: string | null
  titleEn: string | null
  shortRu: string | null
  shortRo: string | null
  shortEn: string | null
}

type EditableProduct = {
  id: string
  price: number
  badge: 'NEW' | 'HOT'
  isActive: boolean
  titleRu: string
  titleRo: string
  titleEn: string
  shortRu: string
  shortRo: string
  shortEn: string
}

type AuditEntry = {
  id: number
  createdAt: string
  actor: string
  action: string
  targetType?: string
  targetId?: string
}

const { locale } = useI18n()
const uiStore = useUiStore()

const statuses: OrderStatus[] = ['new', 'confirmed', 'assembled', 'shipped', 'delivered', 'cancelled', 'returned']
const adminActorStorageKey = 'osf_admin_actor_v1'

const adminKey = ref('')
const adminActor = ref('Owner')
const loading = ref(false)
const loaded = ref(false)
const savingId = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const errorMessage = ref('')
const csrfToken = ref('')
const orders = ref<AdminOrder[]>([])
const selectedOrderIds = ref<string[]>([])
const bulkStatus = ref<OrderStatus>('confirmed')
const bulkNote = ref('')
const bulkLoading = ref(false)
const draftStatus = reactive<Record<string, OrderStatus>>({})
const draftNote = reactive<Record<string, string>>({})
const sizes: InventorySize[] = ['S', 'M', 'L']
const stockBySize = ref<Record<string, Record<string, number>>>({})
const loadingInventory = ref(false)
const savingInventoryId = ref('')
const inventoryDraft = reactive<Record<string, Record<InventorySize, number>>>({})
const inventoryProducts = computed(() => getProducts(locale.value))
const inventoryHistory = ref<InventoryHistoryEntry[]>([])
const lowStockThreshold = ref(3)
const editableProducts = ref<EditableProduct[]>([])
const savingProducts = ref(false)
const exportingCsv = ref(false)
const loadingAudit = ref(false)
const auditEntries = ref<AuditEntry[]>([])
const csvInputEl = ref<HTMLInputElement | null>(null)
const csvContent = ref('')
const csvFileName = ref('')
const csvImportBusy = ref(false)

const selectedCount = computed(() => selectedOrderIds.value.length)
const allVisibleSelected = computed(() => !!orders.value.length && orders.value.every((order) => selectedOrderIds.value.includes(order.id)))

const lowStockItems = computed(() => {
  const threshold = Number(lowStockThreshold.value || 0)
  const out: Array<{ productId: string; size: InventorySize; quantity: number }> = []

  for (const productId of Object.keys(stockBySize.value)) {
    const bySize = stockBySize.value[productId] || {}
    for (const size of sizes) {
      const quantity = Number(bySize[size] || 0)
      if (quantity <= threshold) {
        out.push({
          productId,
          size,
          quantity
        })
      }
    }
  }

  out.sort((a, b) => a.quantity - b.quantity)
  return out
})

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
      applyFilters: 'Aplică filtre',
      resetFilters: 'Resetează filtre',
      selectAllVisible: 'Selectează tot din listă',
      selectedOrders: 'Selectate',
      selectOrder: 'Selectează',
      bulkNotePlaceholder: 'Notă comună (opțional)',
      applyBulk: 'Aplică în masă',
      customer: 'Client:',
      phone: 'Telefon:',
      address: 'Adresă:',
      comment: 'Comentariu:',
      items: 'Produse',
      size: 'Mărime',
      total: 'Total',
      statusNotePlaceholder: 'Comentariu status (opțional)',
      saveStatus: 'Salvează status',
      saveInventory: 'Salvează stoc',
      refreshInventory: 'Reîncarcă stocuri',
      saving: 'Se salvează...',
      inventoryTitle: 'Stoc pe mărimi',
      inventoryProductCode: 'Cod produs',
      inventoryTotal: 'Total stoc',
      inventoryLogTitle: 'Jurnal modificări stoc',
      lowStockTitle: 'Alerte stoc mic',
      lowStockThresholdLabel: 'Prag',
      source: 'Sursă',
      reason: 'Motiv',
      productsTitle: 'Editare produse în masă',
      saveProducts: 'Salvează produse',
      csvTemplate: 'Template CSV',
      csvImportTitle: 'Import CSV (prețuri + stocuri)',
      csvImportHint: 'Coloane: product_id, price, badge, is_active, stock_s, stock_m, stock_l (+ titluri/opisuri pe limbi).',
      csvChoose: 'Alege fișier',
      csvImport: 'Importă CSV',
      productActive: 'Activ',
      productPrice: 'Preț',
      productBadge: 'Badge',
      productTitleRu: 'Titlu (RU)',
      productTitleRo: 'Titlu (RO)',
      productTitleEn: 'Titlu (EN)',
      productShortRu: 'Scurt (RU)',
      productShortRo: 'Scurt (RO)',
      productShortEn: 'Scurt (EN)',
      exportCsv: 'Export CSV',
      globalAuditTitle: 'Jurnal acțiuni admin',
      refreshAudit: 'Reîncarcă jurnal',
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
      applyFilters: 'Apply filters',
      resetFilters: 'Reset filters',
      selectAllVisible: 'Select all visible',
      selectedOrders: 'Selected',
      selectOrder: 'Select',
      bulkNotePlaceholder: 'Bulk note (optional)',
      applyBulk: 'Apply bulk status',
      customer: 'Customer:',
      phone: 'Phone:',
      address: 'Address:',
      comment: 'Comment:',
      items: 'Items',
      size: 'Size',
      total: 'Total',
      statusNotePlaceholder: 'Status note (optional)',
      saveStatus: 'Save status',
      saveInventory: 'Save stock',
      refreshInventory: 'Refresh stock',
      saving: 'Saving...',
      inventoryTitle: 'Inventory by size',
      inventoryProductCode: 'Product code',
      inventoryTotal: 'Total stock',
      inventoryLogTitle: 'Inventory change log',
      lowStockTitle: 'Low stock alerts',
      lowStockThresholdLabel: 'Threshold',
      source: 'Source',
      reason: 'Reason',
      productsTitle: 'Bulk product editor',
      saveProducts: 'Save products',
      csvTemplate: 'CSV template',
      csvImportTitle: 'CSV import (prices + inventory)',
      csvImportHint: 'Columns: product_id, price, badge, is_active, stock_s, stock_m, stock_l (+ titles/short text per language).',
      csvChoose: 'Choose file',
      csvImport: 'Import CSV',
      productActive: 'Active',
      productPrice: 'Price',
      productBadge: 'Badge',
      productTitleRu: 'Title (RU)',
      productTitleRo: 'Title (RO)',
      productTitleEn: 'Title (EN)',
      productShortRu: 'Short text (RU)',
      productShortRo: 'Short text (RO)',
      productShortEn: 'Short text (EN)',
      exportCsv: 'Export CSV',
      globalAuditTitle: 'Admin action log',
      refreshAudit: 'Refresh log',
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
    applyFilters: 'Применить фильтры',
    resetFilters: 'Сбросить фильтры',
    selectAllVisible: 'Выбрать все в списке',
    selectedOrders: 'Выбрано',
    selectOrder: 'Выбрать',
    bulkNotePlaceholder: 'Общий комментарий (необязательно)',
    applyBulk: 'Применить массово',
    customer: 'Клиент:',
    phone: 'Телефон:',
    address: 'Адрес:',
    comment: 'Комментарий:',
    items: 'Товары',
    size: 'Размер',
    total: 'Итого',
    statusNotePlaceholder: 'Комментарий к статусу (необязательно)',
    saveStatus: 'Сохранить статус',
    saveInventory: 'Сохранить остатки',
    refreshInventory: 'Обновить остатки',
    saving: 'Сохранение...',
    inventoryTitle: 'Остатки по размерам',
    inventoryProductCode: 'Код товара',
    inventoryTotal: 'Всего на складе',
    inventoryLogTitle: 'Журнал изменений остатков',
    lowStockTitle: 'Низкие остатки',
    lowStockThresholdLabel: 'Порог',
    source: 'Источник',
    reason: 'Причина',
    productsTitle: 'Массовое редактирование товаров',
    saveProducts: 'Сохранить товары',
    csvTemplate: 'Шаблон CSV',
    csvImportTitle: 'Импорт CSV (цены + остатки)',
    csvImportHint: 'Колонки: product_id, price, badge, is_active, stock_s, stock_m, stock_l (+ названия/короткие тексты по языкам).',
    csvChoose: 'Выбрать файл',
    csvImport: 'Импорт CSV',
    productActive: 'Активен',
    productPrice: 'Цена',
    productBadge: 'Бейдж',
    productTitleRu: 'Название (RU)',
    productTitleRo: 'Название (RO)',
    productTitleEn: 'Название (EN)',
    productShortRu: 'Коротко (RU)',
    productShortRo: 'Коротко (RO)',
    productShortEn: 'Коротко (EN)',
    exportCsv: 'Экспорт CSV',
    globalAuditTitle: 'Журнал действий админа',
    refreshAudit: 'Обновить журнал',
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
      assembled: 'Asamblat',
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
      assembled: 'Packed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    }[status]
  }

  return {
    new: 'Новый',
    confirmed: 'Подтвержден',
    assembled: 'Собран',
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

const formatDelta = (delta: number) => {
  return delta > 0 ? `+${delta}` : String(delta)
}

const sourceLabel = (source: string) => {
  const key = String(source || '').trim().toLowerCase()
  if (!key) return '-'

  const labelsByLocale = {
    ru: {
      admin_manual: 'Ручное изменение',
      checkout: 'Оформление заказа',
      order_cancel: 'Отмена заказа',
      admin_status: 'Смена статуса админом',
      admin_status_rollback: 'Откат статуса'
    },
    en: {
      admin_manual: 'Manual edit',
      checkout: 'Checkout flow',
      order_cancel: 'Order cancellation',
      admin_status: 'Admin status change',
      admin_status_rollback: 'Status rollback'
    },
    ro: {
      admin_manual: 'Editare manuală',
      checkout: 'Checkout',
      order_cancel: 'Anulare comandă',
      admin_status: 'Schimbare status admin',
      admin_status_rollback: 'Rollback status'
    }
  } as const

  const dict = labelsByLocale[locale.value as 'ru' | 'en' | 'ro'] || labelsByLocale.ru
  return dict[key as keyof typeof dict] || source
}

const applyInventoryDraft = () => {
  for (const product of inventoryProducts.value) {
    const current = stockBySize.value[product.id] || {}
    const next: Record<InventorySize, number> = {
      S: Number(current.S || 0),
      M: Number(current.M || 0),
      L: Number(current.L || 0)
    }

    inventoryDraft[product.id] = next
  }
}

const inventoryValue = (productId: string, size: InventorySize) => {
  return inventoryDraft[productId]?.[size] ?? 0
}

const onInventoryInput = (productId: string, size: InventorySize, event: Event) => {
  const target = event.target as HTMLInputElement | null
  const raw = Number(target?.value ?? 0)
  const safe = Number.isFinite(raw) ? Math.max(0, Math.min(9999, Math.floor(raw))) : 0

  if (!inventoryDraft[productId]) {
    inventoryDraft[productId] = { S: 0, M: 0, L: 0 }
  }
  inventoryDraft[productId][size] = safe
}

const inventoryTotal = (productId: string) => {
  const row = inventoryDraft[productId]
  if (!row) return 0
  return Number(row.S || 0) + Number(row.M || 0) + Number(row.L || 0)
}

const isOrderSelected = (orderId: string) => selectedOrderIds.value.includes(orderId)

const toggleOrderSelection = (orderId: string, event: Event) => {
  const target = event.target as HTMLInputElement | null
  const checked = !!target?.checked
  const current = new Set(selectedOrderIds.value)

  if (checked) current.add(orderId)
  else current.delete(orderId)

  selectedOrderIds.value = Array.from(current)
}

const toggleAllVisible = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const checked = !!target?.checked

  if (checked) {
    selectedOrderIds.value = Array.from(new Set([...selectedOrderIds.value, ...orders.value.map((item) => item.id)]))
  } else {
    const visible = new Set(orders.value.map((item) => item.id))
    selectedOrderIds.value = selectedOrderIds.value.filter((id) => !visible.has(id))
  }
}

const loadInventory = async () => {
  if (!csrfToken.value) return

  loadingInventory.value = true
  try {
    const response = await $fetch<{
      success: boolean
      bySize: Record<string, Record<string, number>>
      history?: InventoryHistoryEntry[]
    }>('/api/admin/inventory', {
      headers: {
        'x-csrf-token': csrfToken.value
      }
    })

    stockBySize.value = response?.bySize || {}
    inventoryHistory.value = Array.isArray(response?.history) ? response.history : []
    applyInventoryDraft()
  } catch (error) {
    const message = resolveErrorMessage(error)
    uiStore.showToast(message, 'error')
  } finally {
    loadingInventory.value = false
  }
}

const buildDefaultEditableProducts = () => {
  const baseRu = getProducts('ru')
  const baseRo = getProducts('ro')
  const baseEn = getProducts('en')
  const byRo = new Map(baseRo.map((item) => [item.id, item]))
  const byEn = new Map(baseEn.map((item) => [item.id, item]))

  editableProducts.value = baseRu.map((product) => ({
    id: product.id,
    price: product.price,
    badge: product.badge,
    isActive: true,
    titleRu: product.title,
    titleRo: byRo.get(product.id)?.title || '',
    titleEn: byEn.get(product.id)?.title || '',
    shortRu: product.shortDescription,
    shortRo: byRo.get(product.id)?.shortDescription || '',
    shortEn: byEn.get(product.id)?.shortDescription || ''
  }))
}

const mergeProductOverrides = (rows: ProductOverrideRow[]) => {
  if (!editableProducts.value.length) {
    buildDefaultEditableProducts()
  }
  const byId = new Map(rows.map((row) => [row.productId, row]))

  editableProducts.value = editableProducts.value.map((product) => {
    const row = byId.get(product.id)
    if (!row) return product

    return {
      ...product,
      price: Number.isFinite(Number(row.price)) ? Math.max(0, Math.round(Number(row.price))) : product.price,
      badge: row.badge === 'HOT' || row.badge === 'NEW' ? row.badge : product.badge,
      isActive: row.isActive === false ? false : true,
      titleRu: row.titleRu || product.titleRu,
      titleRo: row.titleRo || product.titleRo,
      titleEn: row.titleEn || product.titleEn,
      shortRu: row.shortRu || product.shortRu,
      shortRo: row.shortRo || product.shortRo,
      shortEn: row.shortEn || product.shortEn
    }
  })
}

const loadProductOverrides = async () => {
  if (!csrfToken.value) return
  if (!editableProducts.value.length) {
    buildDefaultEditableProducts()
  }

  try {
    const response = await $fetch<{ success: boolean; rows: Array<any> }>('/api/admin/products', {
      headers: {
        'x-csrf-token': csrfToken.value
      }
    })

    const rows: ProductOverrideRow[] = (Array.isArray(response?.rows) ? response.rows : []).map((row) => ({
      productId: String(row.product_id || '').trim(),
      price: row.price === null || row.price === undefined ? null : Number(row.price),
      badge: row.badge === 'HOT' || row.badge === 'NEW' ? row.badge : null,
      isActive: row.is_active === null || row.is_active === undefined ? null : !!row.is_active,
      titleRu: row.title_ru || null,
      titleRo: row.title_ro || null,
      titleEn: row.title_en || null,
      shortRu: row.short_description_ru || null,
      shortRo: row.short_description_ro || null,
      shortEn: row.short_description_en || null
    }))

    mergeProductOverrides(rows)
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  }
}

const saveProductsBulk = async () => {
  if (!csrfToken.value || !editableProducts.value.length) return

  savingProducts.value = true
  try {
    await $fetch('/api/admin/products', {
      method: 'PATCH',
      headers: {
        'x-csrf-token': csrfToken.value
      },
      body: {
        rows: editableProducts.value.map((product) => ({
          productId: product.id,
          price: Number(product.price || 0),
          badge: product.badge,
          isActive: !!product.isActive,
          titleRu: product.titleRu,
          titleRo: product.titleRo,
          titleEn: product.titleEn,
          shortDescriptionRu: product.shortRu,
          shortDescriptionRo: product.shortRo,
          shortDescriptionEn: product.shortEn
        }))
      }
    })

    uiStore.showToast(locale.value === 'en' ? 'Products updated' : locale.value === 'ro' ? 'Produse actualizate' : 'Товары обновлены', 'success')
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    savingProducts.value = false
  }
}

const triggerCsvPick = () => {
  csvInputEl.value?.click()
}

const onCsvFilePicked = async (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  try {
    csvContent.value = await file.text()
    csvFileName.value = file.name
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
    csvContent.value = ''
    csvFileName.value = ''
  }
}

const importProductsCsv = async () => {
  if (!csrfToken.value || !csvContent.value.trim()) return

  csvImportBusy.value = true
  try {
    const response = await $fetch<{
      success: boolean
      importedRows: number
      updatedProducts: number
      updatedInventory: number
    }>('/api/admin/products/import-csv', {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken.value
      },
      body: {
        csv: csvContent.value
      }
    })

    await Promise.all([loadInventory(), loadProductOverrides(), loadAudit()])

    const msg = locale.value === 'en'
      ? `Imported: ${response.importedRows}, products: ${response.updatedProducts}, inventory: ${response.updatedInventory}`
      : locale.value === 'ro'
        ? `Importat: ${response.importedRows}, produse: ${response.updatedProducts}, stocuri: ${response.updatedInventory}`
        : `Импорт: ${response.importedRows}, товары: ${response.updatedProducts}, остатки: ${response.updatedInventory}`
    uiStore.showToast(msg, 'success')
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    csvImportBusy.value = false
  }
}

const downloadCsvTemplate = () => {
  if (!import.meta.client) return
  const csv = [
    'product_id,price,badge,is_active,stock_s,stock_m,stock_l,title_ru,title_ro,title_en,short_ru,short_ro,short_en',
    'white-halfzip-osf,699,NEW,1,6,8,5,Свитер полузамок белый OSF,Pulover halfzip alb OSF,White halfzip sweater OSF,Светлая модель,Model luminos,Light model',
    'black-halfzip-osf,699,HOT,1,0,3,7,Свитер полузамок черный OSF,Pulover halfzip negru OSF,Black halfzip sweater OSF,Темный вариант,Variant închis,Dark variant'
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'osf-products-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const exportOrdersCsv = async () => {
  if (!csrfToken.value) return
  exportingCsv.value = true
  try {
    const csv = await $fetch<string>('/api/admin/orders/export.csv', {
      headers: {
        'x-csrf-token': csrfToken.value
      },
      query: {
        ...(statusFilter.value ? { status: statusFilter.value } : {}),
        ...(dateFrom.value ? { from: dateFrom.value } : {}),
        ...(dateTo.value ? { to: dateTo.value } : {})
      },
      responseType: 'text'
    })

    if (import.meta.client) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    exportingCsv.value = false
  }
}

const loadAudit = async () => {
  if (!csrfToken.value) return
  loadingAudit.value = true
  try {
    const response = await $fetch<{ success: boolean; entries: Array<any> }>('/api/admin/audit', {
      headers: {
        'x-csrf-token': csrfToken.value
      }
    })

    auditEntries.value = (Array.isArray(response?.entries) ? response.entries : []).map((entry) => ({
      id: Number(entry.id || 0),
      createdAt: String(entry.created_at || ''),
      actor: String(entry.actor || ''),
      action: String(entry.action || ''),
      targetType: entry.target_type ? String(entry.target_type) : '',
      targetId: entry.target_id ? String(entry.target_id) : ''
    }))
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    loadingAudit.value = false
  }
}

const saveInventory = async (productId: string) => {
  const row = inventoryDraft[productId]
  if (!row) return

  savingInventoryId.value = productId
  try {
    const response = await $fetch<{
      success: boolean
      bySize: Record<string, Record<string, number>>
      history?: InventoryHistoryEntry[]
    }>('/api/admin/inventory', {
      method: 'PATCH',
      headers: {
        'x-csrf-token': csrfToken.value
      },
      body: {
        productId,
        sizes: {
          S: Number(row.S || 0),
          M: Number(row.M || 0),
          L: Number(row.L || 0)
        }
      }
    })

    stockBySize.value = {
      ...stockBySize.value,
      ...(response?.bySize || {})
    }
    inventoryHistory.value = Array.isArray(response?.history) ? response.history : inventoryHistory.value
    applyInventoryDraft()

    uiStore.showToast(
      locale.value === 'en'
        ? 'Stock updated'
        : locale.value === 'ro'
          ? 'Stoc actualizat'
          : 'Остатки обновлены',
      'success'
    )
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    savingInventoryId.value = ''
  }
}

const fetchOrders = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<{ success: boolean; orders: AdminOrder[] }>('/api/admin/orders', {
      headers: csrfToken.value
        ? {
            'x-csrf-token': csrfToken.value
          }
        : undefined,
      query: {
        ...(statusFilter.value ? { status: statusFilter.value } : {}),
        ...(dateFrom.value ? { from: dateFrom.value } : {}),
        ...(dateTo.value ? { to: dateTo.value } : {})
      }
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
      if (!(order.id in draftNote)) {
        draftNote[order.id] = ''
      }
    }
    const visible = new Set(orders.value.map((order) => order.id))
    selectedOrderIds.value = selectedOrderIds.value.filter((id) => visible.has(id))

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
      const loginResponse = await $fetch<{ success: boolean; actor: string; csrfToken: string }>('/api/admin/session/login', {
        method: 'POST',
        body: {
          key: adminKey.value,
          actor: adminActor.value.trim() || 'Owner'
        }
      })
      csrfToken.value = loginResponse.csrfToken || ''
      persistAdminActor()
    } catch (error) {
      errorMessage.value = resolveErrorMessage(error)
      return
    }
  }

  await fetchOrders()
  await loadInventory()
  await loadProductOverrides()
  await loadAudit()
}

const resetOrderFilters = async () => {
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  await loadOrders()
}

const applyBulkStatus = async () => {
  if (!csrfToken.value || !selectedOrderIds.value.length) return

  bulkLoading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      updatedIds: string[]
      failed: Array<{ orderId: string; reason: string }>
    }>('/api/admin/orders/bulk', {
      method: 'PATCH',
      headers: {
        'x-csrf-token': csrfToken.value
      },
      body: {
        orderIds: selectedOrderIds.value,
        status: bulkStatus.value,
        note: bulkNote.value.trim() || undefined
      }
    })

    const updatedCount = Array.isArray(response?.updatedIds) ? response.updatedIds.length : 0
    const failedCount = Array.isArray(response?.failed) ? response.failed.length : 0

    await fetchOrders()

    if (updatedCount > 0) {
      uiStore.showToast(
        locale.value === 'en'
          ? `Updated ${updatedCount} orders`
          : locale.value === 'ro'
            ? `Actualizate ${updatedCount} comenzi`
            : `Обновлено заказов: ${updatedCount}`,
        'success'
      )
    }

    if (failedCount > 0) {
      uiStore.showToast(
        locale.value === 'en'
          ? `Failed: ${failedCount}`
          : locale.value === 'ro'
            ? `Eșuate: ${failedCount}`
            : `Ошибок: ${failedCount}`,
        'error'
      )
    }

    if (updatedCount > 0 && failedCount === 0) {
      selectedOrderIds.value = []
      bulkNote.value = ''
    }
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    bulkLoading.value = false
  }
}

const updateStatus = async (orderId: string) => {
  const nextStatus = draftStatus[orderId]
  if (!nextStatus) return

  const target = orders.value.find((item) => item.id === orderId)
  const previousStatus = target?.status
  savingId.value = orderId

  try {
    const manualNote = String(draftNote[orderId] || '').trim()
    const response = await $fetch<{ success: boolean; order: AdminOrder }>(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: csrfToken.value
        ? {
            'x-csrf-token': csrfToken.value
          }
        : undefined,
      body: {
        status: nextStatus,
        note: manualNote || (previousStatus && previousStatus !== nextStatus ? `${previousStatus} -> ${nextStatus}` : undefined)
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
    draftNote[orderId] = ''
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
    await $fetch('/api/admin/session/logout', {
      method: 'POST',
      headers: csrfToken.value
        ? {
            'x-csrf-token': csrfToken.value
          }
        : undefined
    })
  } catch {
    // Ignore logout API failures.
  }

  adminKey.value = ''
  csrfToken.value = ''
  selectedOrderIds.value = []
  dateFrom.value = ''
  dateTo.value = ''
  bulkNote.value = ''
  orders.value = []
  stockBySize.value = {}
  inventoryHistory.value = []
  editableProducts.value = []
  auditEntries.value = []
  for (const key of Object.keys(inventoryDraft)) {
    delete inventoryDraft[key]
  }
  for (const key of Object.keys(draftNote)) {
    delete draftNote[key]
  }
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

  $fetch<{ success: boolean; actor?: string; csrfToken?: string }>('/api/admin/session/me')
    .then((response) => {
      if (response?.actor) {
        adminActor.value = response.actor
        persistAdminActor()
      }
      csrfToken.value = response?.csrfToken || ''
      buildDefaultEditableProducts()
      return Promise.all([fetchOrders(), loadInventory(), loadProductOverrides(), loadAudit()])
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

.orders-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.date-filter {
  min-width: 168px;
}

.inventory-card {
  padding: 16px;
}

.inventory-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.inventory-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.inventory-head h2 {
  margin: 0;
  font-size: 22px;
}

.inventory-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.inventory-item {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: #fff;
}

.inventory-item-head {
  display: grid;
  gap: 4px;
}

.inventory-item-head h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.2;
}

.inventory-item-head span {
  color: var(--muted);
  font-size: 12px;
}

.inventory-sizes {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.inventory-sizes label {
  display: grid;
  gap: 4px;
}

.inventory-sizes span {
  font-size: 13px;
  color: #3a4d63;
  font-weight: 700;
}

.inventory-sizes input {
  min-height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 10px;
  font: inherit;
  color: var(--text);
  outline: none;
}

.inventory-foot {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.inventory-history {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.low-stock-box {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.low-stock-box ul {
  margin: 8px 0 0;
  padding-left: 16px;
  display: grid;
  gap: 6px;
  color: #4a5a70;
  font-size: 13px;
}

.inventory-history-head {
  margin-bottom: 8px;
}

.inventory-history ul {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 6px;
  color: #4a5a70;
  font-size: 13px;
}

.products-card {
  padding: 16px;
}

.products-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.products-head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.products-head h2 {
  margin: 0;
  font-size: 22px;
}

.products-grid {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.csv-import-box {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed var(--border);
  border-radius: 14px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.csv-import-box p {
  margin: 6px 0 0;
  color: #5c6f86;
  font-size: 13px;
}

.csv-file-name {
  font-weight: 700;
  color: #1a2a3f !important;
}

.csv-import-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.csv-file-input {
  display: none;
}

.products-item {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: #fff;
  display: grid;
  gap: 10px;
}

.products-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.toggle-active {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.products-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.products-row.columns-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.products-row label {
  display: grid;
  gap: 4px;
}

.products-row span {
  font-size: 12px;
  font-weight: 700;
  color: #3a4d63;
}

.products-row input,
.products-row select {
  min-height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 10px;
  font: inherit;
  color: var(--text);
  outline: none;
}

.audit-card {
  padding: 16px;
}

.audit-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.audit-head h2 {
  margin: 0;
  font-size: 22px;
}

.global-audit-list {
  margin: 12px 0 0;
  padding-left: 16px;
  display: grid;
  gap: 6px;
  color: #4a5a70;
  font-size: 13px;
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

.order-select-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--muted);
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
.s-assembled { background: #f1edff; color: #4f3f86; border-color: #d8cff6; }
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

.bulk-status-card {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--border);
}

.bulk-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.bulk-row + .bulk-row {
  margin-top: 8px;
}

.bulk-check-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.status-note-input {
  min-height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 10px;
  font: inherit;
  color: var(--text);
  outline: none;
  min-width: 220px;
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

  .orders-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .inventory-grid {
    grid-template-columns: 1fr;
  }

  .inventory-actions {
    width: 100%;
  }

  .inventory-actions .btn-alt {
    flex: 1;
  }

  .inventory-foot {
    flex-direction: column;
    align-items: stretch;
  }

  .inventory-foot .btn-alt {
    width: 100%;
  }

  .update-row {
    width: 100%;
  }

  .products-row,
  .products-row.columns-3 {
    grid-template-columns: 1fr;
  }

  .csv-import-box {
    flex-direction: column;
    align-items: stretch;
  }

  .status-note-input,
  .status-select,
  .update-row .btn-alt,
  .bulk-row .btn-main,
  .csv-import-actions .btn-alt,
  .csv-import-actions .btn-main {
    width: 100%;
  }
}
</style>
