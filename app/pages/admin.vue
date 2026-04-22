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
        <div class="surface-card launch-card">
          <div class="launch-head">
            <h2>{{ launchHeaderText }}</h2>
            <button type="button" class="btn-alt" :disabled="readinessLoading" @click="loadReadiness">
              {{ readinessLoading ? ui.loading : launchRefreshText }}
            </button>
          </div>

          <p v-if="readinessUpdatedAt" class="launch-updated">
            {{ launchUpdatedText }}: {{ formatDate(readinessUpdatedAt) }}
          </p>

          <div class="launch-grid" v-if="launchSteps.length">
            <article v-for="step in launchSteps" :key="step.id" class="launch-item">
              <div class="launch-item-head">
                <strong>{{ step.title }}</strong>
                <span class="launch-status" :class="`st-${step.status}`">{{ launchStatusLabel(step.status) }}</span>
              </div>
              <p>{{ step.description }}</p>
              <ul>
                <li v-for="point in step.points" :key="point">{{ point }}</li>
              </ul>
            </article>
          </div>

          <div class="launch-env">
            <button type="button" class="btn-alt launch-env-toggle" @click="showEnvChecklist = !showEnvChecklist">
              {{ showEnvChecklist ? envHideText : envShowText }}
            </button>

            <div v-if="showEnvChecklist" class="launch-env-panel">
              <div class="launch-env-head">
                <strong>{{ envHeaderText }}</strong>
                <div class="launch-env-head-actions">
                  <button type="button" class="btn-alt" :disabled="readinessLoading" @click="checkEnvNow">
                    {{ readinessLoading ? ui.loading : envCheckNowText }}
                  </button>
                  <a class="btn-alt" :href="vercelEnvUrl" target="_blank" rel="noopener noreferrer">
                    {{ envOpenVercelText }}
                  </a>
                  <button type="button" class="btn-alt" @click="downloadEnvTemplate">{{ envDownloadText }}</button>
                  <button type="button" class="btn-alt" @click="copyAllEnvSnippet">{{ envCopyAllText }}</button>
                </div>
              </div>

              <p class="launch-env-note">{{ envHintText }}</p>

              <div class="env-grid">
                <article v-for="item in envChecklistItems" :key="item.key" class="env-item">
                  <div class="env-item-head">
                    <code>{{ item.key }}</code>
                    <span class="launch-status" :class="`st-${item.status}`">{{ launchStatusLabel(item.status) }}</span>
                  </div>
                  <p>{{ item.help }}</p>
                  <div class="env-item-actions">
                    <button type="button" class="btn-alt" @click="copyEnvSnippet(item)">{{ envCopyText }}</button>
                  </div>
                </article>
              </div>

              <div class="env-missing" v-if="envMissingItems.length">
                <strong>{{ envMissingTitleText }}</strong>
                <ul>
                  <li v-for="item in envMissingItems" :key="`missing-${item.key}`">
                    <code>{{ item.key }}</code> - {{ item.fix }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
              <button type="button" class="btn-alt" :disabled="csvImportBusy || !editableProducts.length" @click="exportCurrentProductsCsv">
                {{ ui.csvExportCurrent }}
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
        <div class="kpi-grid">
          <article class="kpi-item">
            <span>{{ ui.kpiTotal }}</span>
            <strong>{{ adminKpis.total }}</strong>
          </article>
          <article class="kpi-item">
            <span>{{ ui.kpiNew }}</span>
            <strong>{{ adminKpis.newOrders }}</strong>
          </article>
          <article class="kpi-item">
            <span>{{ ui.kpiProgress }}</span>
            <strong>{{ adminKpis.progress }}</strong>
          </article>
          <article class="kpi-item">
            <span>{{ ui.kpiDelivered }}</span>
            <strong>{{ adminKpis.delivered }}</strong>
          </article>
          <article class="kpi-item">
            <span>{{ ui.kpiPendingPayment }}</span>
            <strong>{{ adminKpis.pendingPayment }}</strong>
          </article>
          <article class="kpi-item">
            <span>{{ ui.kpiPaid }}</span>
            <strong>{{ adminKpis.paid }}</strong>
          </article>
          <article
            class="kpi-item"
            :class="{ active: quickFilter === 'attention' }"
            role="button"
            tabindex="0"
            @click="applyQuickFilter('attention')"
            @keydown.enter.prevent="applyQuickFilter('attention')"
            @keydown.space.prevent="applyQuickFilter('attention')"
          >
            <span>{{ ui.kpiAttention }}</span>
            <strong>{{ adminKpis.attention }}</strong>
          </article>
          <article class="kpi-item kpi-wide">
            <span>{{ ui.kpiRevenue }}</span>
            <strong>{{ Math.round(adminKpis.revenue) }} MDL</strong>
          </article>
        </div>

        <div class="admin-topbar">
          <div class="orders-filters">
            <strong>{{ ui.ordersCount }}: {{ sortedOrders.length }} / {{ orders.length }}</strong>
            <input
              v-model.trim="orderSearch"
              class="status-filter orders-search"
              type="search"
              :placeholder="ui.searchOrders"
            />
            <select v-model="sortBy" class="status-filter sort-filter">
              <option value="newest">{{ ui.sortNewest }}</option>
              <option value="oldest">{{ ui.sortOldest }}</option>
              <option value="total_desc">{{ ui.sortTotalDesc }}</option>
              <option value="total_asc">{{ ui.sortTotalAsc }}</option>
              <option value="priority">{{ ui.sortPriority }}</option>
            </select>
            <select v-model.number="pageSize" class="status-filter page-size-filter">
              <option v-for="size in pageSizeOptions" :key="`ps-${size}`" :value="size">{{ ui.perPage }}: {{ size }}</option>
            </select>
            <select v-model="statusFilter" class="status-filter" @change="loadOrders">
              <option value="">{{ ui.statusAll }}</option>
              <option v-for="status in statuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
            </select>
            <select v-model="paymentFilter" class="status-filter" @change="loadOrders">
              <option v-for="filter in paymentFilters" :key="`pay-${filter.value}`" :value="filter.value">{{ paymentFilterLabel(filter.value) }}</option>
            </select>
            <input v-model="dateFrom" type="date" class="status-filter date-filter" />
            <input v-model="dateTo" type="date" class="status-filter date-filter" />
            <button type="button" class="btn-alt" @click="loadOrders">{{ ui.applyFilters }}</button>
            <button type="button" class="btn-alt" @click="resetOrderFilters">{{ ui.resetFilters }}</button>
          </div>
        </div>

        <div class="surface-card ai-insights-card">
          <div class="ai-insights-head">
            <h2>{{ ui.aiTitle }}</h2>
            <button type="button" class="btn-main" :disabled="aiLoading" @click="generateAiInsights">
              {{ aiLoading ? ui.loading : ui.aiRun }}
            </button>
          </div>
          <p class="ai-insights-subtitle">{{ ui.aiSubtitle }}</p>
          <p v-if="aiError" class="admin-error">{{ aiError }}</p>

          <template v-if="aiInsights">
            <p class="ai-summary">
              <strong>{{ ui.aiSummary }}:</strong> {{ aiInsights.summary }}
              <span class="ai-source" :class="`src-${aiInsights.source}`">
                {{ aiInsights.source === 'ai' ? ui.aiSourceAi : ui.aiSourceFallback }}
              </span>
            </p>
            <div class="ai-columns">
              <div>
                <strong>{{ ui.aiRisks }}</strong>
                <ul>
                  <li v-for="(risk, index) in aiInsights.topRisks" :key="`risk-${index}`">{{ risk }}</li>
                </ul>
              </div>
              <div>
                <strong>{{ ui.aiActions }}</strong>
                <ul>
                  <li v-for="(action, index) in aiInsights.actions" :key="`action-${index}`">{{ action }}</li>
                </ul>
              </div>
            </div>
            <div v-if="aiInsights.priorityOrderIds.length" class="ai-priority-row">
              <strong>{{ ui.aiPriority }}</strong>
              <div class="ai-priority-chips">
                <span v-for="id in aiInsights.priorityOrderIds" :key="`prio-${id}`" class="priority-pill priority-high">{{ id }}</span>
              </div>
              <button type="button" class="btn-main" :disabled="savingId !== ''" @click="applyAiPriorityQueue">
                {{ ui.aiTakePriority }}
              </button>
            </div>
          </template>
        </div>

        <div class="quick-filters">
          <button
            v-for="filter in quickFilters"
            :key="`quick-${filter.value}`"
            type="button"
            class="quick-filter-btn"
            :class="{ active: quickFilter === filter.value }"
            @click="applyQuickFilter(filter.value as 'all' | 'new' | 'progress' | 'delivered' | 'pending_payment' | 'paid' | 'attention')"
          >
            {{ filter.label }}
          </button>
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

        <div class="orders-grid" v-if="pagedOrders.length">
          <article v-for="order in pagedOrders" :key="order.id" class="surface-card order-card" :class="{ 'order-card-risk': isAttentionOrder(order) }">
            <div class="order-head">
              <div>
                <label class="order-select-row">
                  <input type="checkbox" :checked="isOrderSelected(order.id)" @change="toggleOrderSelection(order.id, $event)" />
                  <span>{{ ui.selectOrder }}</span>
                </label>
                <h2>{{ order.id }}</h2>
                <p>{{ formatDate(order.createdAt) }}</p>
              </div>
              <div class="order-head-statuses">
                <span v-if="isAttentionOrder(order)" class="attention-pill">{{ ui.attentionLabel }}</span>
                <span class="priority-pill" :class="`priority-${orderPriority(order)}`">{{ orderPriorityLabel(order) }}</span>
                <span class="sla-pill" :class="`sla-${slaState(order).level}`">{{ slaState(order).label }}</span>
                <span class="status-pill" :class="`s-${order.status}`">{{ statusLabel(order.status) }}</span>
              </div>
            </div>

            <div class="order-meta">
              <p><strong>{{ ui.customer }}</strong> {{ order.customer.name }}</p>
              <p><strong>{{ ui.phone }}</strong> {{ order.customer.phone }}</p>
              <p><strong>{{ ui.address }}</strong> {{ order.customer.address }}</p>
              <p v-if="order.customer.email"><strong>Email:</strong> {{ order.customer.email }}</p>
              <p v-if="order.customer.comment"><strong>{{ ui.comment }}</strong> {{ order.customer.comment }}</p>
              <p>
                <strong>{{ ui.payment }}</strong>
                <span class="payment-pill" :class="paymentBadgeClass(order.payment.status)">
                  {{ paymentStatusLabel(order.payment.status) }}
                </span>
                <span class="payment-method-text">· {{ paymentMethodLabel(order.payment.method) }}</span>
              </p>
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

            <div class="order-quick-actions">
              <button
                v-if="canTakeInWork(order)"
                type="button"
                class="btn-main"
                :disabled="savingId === order.id"
                @click="takeInWork(order)"
              >
                {{ savingId === order.id ? ui.saving : ui.takeInWork }}
              </button>
              <button type="button" class="btn-alt" @click="applyQuickStatus(order, 'confirmed')">{{ ui.quickConfirm }}</button>
              <button type="button" class="btn-alt" @click="applyQuickStatus(order, 'shipped')">{{ ui.quickShip }}</button>
              <button type="button" class="btn-alt" @click="applyQuickStatus(order, 'delivered')">{{ ui.quickDeliver }}</button>
              <button type="button" class="btn-alt danger" @click="applyQuickStatus(order, 'cancelled')">{{ ui.quickCancel }}</button>
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
                <button
                  v-if="canConfirmPayment(order)"
                  type="button"
                  class="btn-main"
                  :disabled="confirmingPaymentId === order.id"
                  @click="confirmPayment(order.id)"
                >
                  {{ confirmingPaymentId === order.id ? ui.saving : ui.confirmPaymentManually }}
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

        <div v-if="sortedOrders.length" class="orders-pagination">
          <span class="orders-pagination-info">{{ paginationText }}</span>
          <div class="orders-pagination-actions">
            <button type="button" class="btn-alt" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
              {{ ui.prevPage }}
            </button>
            <button type="button" class="btn-alt" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
              {{ ui.nextPage }}
            </button>
          </div>
        </div>

        <div v-else class="surface-card empty-box">
          <h2>{{ ui.noMatchesTitle }}</h2>
          <p>{{ ui.noMatchesText }}</p>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
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
  payment: {
    method: 'card_online' | 'phone_transfer' | 'cash_on_delivery'
    status: 'pending' | 'paid' | 'cash_on_delivery'
  }
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

type ReadinessChecks = {
  payment: {
    hasStripe: boolean
    isStripeLive: boolean
    hasStripeWebhook: boolean
    hasMaib: boolean
    ready: boolean
  }
  legal: {
    contacts: boolean
    shipping: boolean
    returns: boolean
    privacy: boolean
    faq: boolean
    ready: boolean
  }
  customerTracking: {
    hasTrackSecret: boolean
    hasOtpSecret: boolean
    hasTelegram: boolean
    ready: boolean
  }
  reliability: {
    hasSupabase: boolean
    dbPingOk: boolean
    hasAdminKey: boolean
    hasCleanupSecret: boolean
    ready: boolean
  }
  trust: {
    trustedMetrics: boolean
    reviewsCount: number
    orders30d: number
    ready: boolean
  }
}

type EnvChecklistItem = {
  key: string
  sample: string
  status: 'done' | 'partial' | 'todo'
  help: string
}

type EnvMissingItem = {
  key: string
  fix: string
}

type AdminAiInsights = {
  source: 'ai' | 'heuristic'
  summary: string
  topRisks: string[]
  actions: string[]
  priorityOrderIds: string[]
}

const { locale } = useI18n()
const uiStore = useUiStore()
const runtimeConfig = useRuntimeConfig()

const statuses: OrderStatus[] = ['new', 'confirmed', 'assembled', 'shipped', 'delivered', 'cancelled', 'returned']
const adminActorStorageKey = 'osf_admin_actor_v1'
const adminFiltersStorageKey = 'osf_admin_filters_v1'

const adminKey = ref('')
const adminActor = ref('Owner')
const loading = ref(false)
const loaded = ref(false)
const savingId = ref('')
const statusFilter = ref('')
const paymentFilter = ref<'all' | 'pending' | 'paid' | 'cash_on_delivery'>('all')
const quickFilter = ref<'all' | 'new' | 'progress' | 'delivered' | 'pending_payment' | 'paid' | 'attention'>('all')
const orderSearch = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sortBy = ref<'newest' | 'oldest' | 'total_desc' | 'total_asc' | 'priority'>('newest')
const pageSize = ref(12)
const currentPage = ref(1)
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
const confirmingPaymentId = ref('')
const loadingAudit = ref(false)
const auditEntries = ref<AuditEntry[]>([])
const csvInputEl = ref<HTMLInputElement | null>(null)
const csvContent = ref('')
const csvFileName = ref('')
const csvImportBusy = ref(false)
const readinessLoading = ref(false)
const readinessUpdatedAt = ref('')
const readinessData = ref<ReadinessChecks | null>(null)
const showEnvChecklist = ref(false)
const aiLoading = ref(false)
const aiError = ref('')
const aiInsights = ref<AdminAiInsights | null>(null)
const paymentFilters = [
  { value: 'all' },
  { value: 'pending' },
  { value: 'paid' },
  { value: 'cash_on_delivery' }
] as const
const pageSizeOptions = [12, 24, 48] as const

const selectedCount = computed(() => selectedOrderIds.value.length)
const allVisibleSelected = computed(() => !!pagedOrders.value.length && pagedOrders.value.every((order) => selectedOrderIds.value.includes(order.id)))
const launchHeaderText = computed(() => locale.value === 'en' ? 'Go-live checklist 1-5' : locale.value === 'ro' ? 'Checklist lansare 1-5' : 'Боевой запуск 1-5')
const launchRefreshText = computed(() => locale.value === 'en' ? 'Refresh checklist' : locale.value === 'ro' ? 'Reîncarcă checklist' : 'Обновить чеклист')
const launchUpdatedText = computed(() => locale.value === 'en' ? 'Updated' : locale.value === 'ro' ? 'Actualizat' : 'Обновлено')
const envShowText = computed(() => locale.value === 'en' ? 'Show Vercel ENV checklist' : locale.value === 'ro' ? 'Arată checklist Vercel ENV' : 'Показать чеклист Vercel ENV')
const envHideText = computed(() => locale.value === 'en' ? 'Hide Vercel ENV checklist' : locale.value === 'ro' ? 'Ascunde checklist Vercel ENV' : 'Скрыть чеклист Vercel ENV')
const envHeaderText = computed(() => locale.value === 'en' ? 'What to set in Vercel' : locale.value === 'ro' ? 'Ce trebuie setat în Vercel' : 'Что включить в Vercel')
const envHintText = computed(() => locale.value === 'en' ? 'Project Settings -> Environment Variables. Add all keys below for Production.' : locale.value === 'ro' ? 'Project Settings -> Environment Variables. Adaugă toate cheile de mai jos pentru Production.' : 'Project Settings -> Environment Variables. Добавь все ключи ниже для Production.')
const envCopyText = computed(() => locale.value === 'en' ? 'Copy line' : locale.value === 'ro' ? 'Copiază linia' : 'Копировать строку')
const envCopyAllText = computed(() => locale.value === 'en' ? 'Copy all' : locale.value === 'ro' ? 'Copiază tot' : 'Копировать всё')
const envDownloadText = computed(() => locale.value === 'en' ? 'Download .env template' : locale.value === 'ro' ? 'Descarcă .env template' : 'Скачать .env template')
const envCheckNowText = computed(() => locale.value === 'en' ? 'Check ENV now' : locale.value === 'ro' ? 'Verifică ENV acum' : 'Проверить ENV сейчас')
const envOpenVercelText = computed(() => locale.value === 'en' ? 'Open Vercel ENV' : locale.value === 'ro' ? 'Deschide Vercel ENV' : 'Открыть Vercel ENV')
const envMissingTitleText = computed(() => locale.value === 'en' ? 'What is missing' : locale.value === 'ro' ? 'Ce lipsește' : 'Чего не хватает')
const vercelEnvUrl = computed(() => {
  const value = String(runtimeConfig.public.vercelEnvUrl || '').trim()
  return value || 'https://vercel.com/dashboard'
})

const launchStatusLabel = (status: string) => {
  if (locale.value === 'en') {
    if (status === 'done') return 'Done'
    if (status === 'partial') return 'In progress'
    return 'To do'
  }
  if (locale.value === 'ro') {
    if (status === 'done') return 'Gata'
    if (status === 'partial') return 'În progres'
    return 'De făcut'
  }
  if (status === 'done') return 'Готово'
  if (status === 'partial') return 'В работе'
  return 'Нужно сделать'
}

const launchSteps = computed(() => {
  const checks = readinessData.value
  if (!checks) return []

  const paymentStatus: 'done' | 'partial' | 'todo' = checks.payment.ready ? 'done' : (checks.payment.hasStripe || checks.payment.hasMaib ? 'partial' : 'todo')
  const trackingStatus: 'done' | 'partial' | 'todo' = checks.customerTracking.ready ? 'done' : (checks.customerTracking.hasTrackSecret || checks.customerTracking.hasOtpSecret || checks.customerTracking.hasTelegram ? 'partial' : 'todo')
  const reliabilityStatus: 'done' | 'partial' | 'todo' = checks.reliability.ready ? 'done' : (checks.reliability.hasSupabase || checks.reliability.hasAdminKey || checks.reliability.hasCleanupSecret ? 'partial' : 'todo')
  const trustStatus: 'done' | 'partial' | 'todo' = checks.trust.ready ? 'done' : ((checks.trust.orders30d > 0 || checks.trust.reviewsCount > 0) ? 'partial' : 'todo')

  if (locale.value === 'en') {
    return [
      {
        id: 'payment',
        title: '1. Live payments',
        description: 'Accept real card payments, not only test/COD.',
        status: paymentStatus,
        points: [
          `MAIB configured: ${checks.payment.hasMaib ? 'yes' : 'no'}`,
          `Stripe live: ${checks.payment.isStripeLive ? 'yes' : 'no'}`,
          `Stripe webhook: ${checks.payment.hasStripeWebhook ? 'yes' : 'no'}`
        ]
      },
      {
        id: 'legal',
        title: '2. Legal pages',
        description: 'Store policy pages available to increase trust.',
        status: checks.legal.ready ? 'done' : 'todo',
        points: ['Contacts, Shipping, Returns, Privacy, FAQ']
      },
      {
        id: 'tracking',
        title: '3. Customer tracking',
        description: 'Customer sees order state and receives updates.',
        status: trackingStatus,
        points: [
          `Track secret: ${checks.customerTracking.hasTrackSecret ? 'ok' : 'missing'}`,
          `OTP secret: ${checks.customerTracking.hasOtpSecret ? 'ok' : 'missing'}`,
          `Telegram enabled: ${checks.customerTracking.hasTelegram ? 'ok' : 'missing'}`
        ]
      },
      {
        id: 'reliability',
        title: '4. Reliability and security',
        description: 'Critical backend and admin safety checks.',
        status: reliabilityStatus,
        points: [
          `Supabase: ${checks.reliability.hasSupabase ? 'ok' : 'missing'}`,
          `Database ping: ${checks.reliability.dbPingOk ? 'ok' : 'failed'}`,
          `Admin key: ${checks.reliability.hasAdminKey ? 'ok' : 'weak/missing'}`,
          `Cleanup secret: ${checks.reliability.hasCleanupSecret ? 'ok' : 'weak/missing'}`
        ]
      },
      {
        id: 'trust',
        title: '5. Trust and conversion',
        description: 'Real social proof from delivered orders.',
        status: trustStatus,
        points: [
          `Reviews: ${checks.trust.reviewsCount}`,
          `Orders 30d: ${checks.trust.orders30d}`
        ]
      }
    ]
  }

  if (locale.value === 'ro') {
    return [
      {
        id: 'payment',
        title: '1. Plăți live',
        description: 'Plată reală cu card, nu doar test/ramburs.',
        status: paymentStatus,
        points: [
          `MAIB configurat: ${checks.payment.hasMaib ? 'da' : 'nu'}`,
          `Stripe live: ${checks.payment.isStripeLive ? 'da' : 'nu'}`,
          `Stripe webhook: ${checks.payment.hasStripeWebhook ? 'da' : 'nu'}`
        ]
      },
      {
        id: 'legal',
        title: '2. Pagini legale',
        description: 'Pagini de politici publicate pentru încredere.',
        status: checks.legal.ready ? 'done' : 'todo',
        points: ['Contacte, Livrare, Returnare, Confidențialitate, FAQ']
      },
      {
        id: 'tracking',
        title: '3. Tracking client',
        description: 'Clientul vede statusul comenzii și primește update.',
        status: trackingStatus,
        points: [
          `Secret tracking: ${checks.customerTracking.hasTrackSecret ? 'ok' : 'lipsă'}`,
          `Secret OTP: ${checks.customerTracking.hasOtpSecret ? 'ok' : 'lipsă'}`,
          `Telegram activ: ${checks.customerTracking.hasTelegram ? 'ok' : 'lipsă'}`
        ]
      },
      {
        id: 'reliability',
        title: '4. Fiabilitate și securitate',
        description: 'Verificări critice pentru backend și admin.',
        status: reliabilityStatus,
        points: [
          `Supabase: ${checks.reliability.hasSupabase ? 'ok' : 'lipsă'}`,
          `Ping DB: ${checks.reliability.dbPingOk ? 'ok' : 'eșuat'}`,
          `Cheie admin: ${checks.reliability.hasAdminKey ? 'ok' : 'slabă/lipsă'}`,
          `Secret cleanup: ${checks.reliability.hasCleanupSecret ? 'ok' : 'slab/lipsă'}`
        ]
      },
      {
        id: 'trust',
        title: '5. Încredere și conversie',
        description: 'Social proof real din comenzi livrate.',
        status: trustStatus,
        points: [
          `Recenzii: ${checks.trust.reviewsCount}`,
          `Comenzi 30 zile: ${checks.trust.orders30d}`
        ]
      }
    ]
  }

  return [
    {
      id: 'payment',
      title: '1. Живая оплата',
      description: 'Реальная оплата картой, не только тест/наложка.',
      status: paymentStatus,
      points: [
        `MAIB настроен: ${checks.payment.hasMaib ? 'да' : 'нет'}`,
        `Stripe live: ${checks.payment.isStripeLive ? 'да' : 'нет'}`,
        `Stripe webhook: ${checks.payment.hasStripeWebhook ? 'да' : 'нет'}`
      ]
    },
    {
      id: 'legal',
      title: '2. Юридические страницы',
      description: 'Политики и контакты опубликованы для доверия.',
      status: checks.legal.ready ? 'done' : 'todo',
      points: ['Контакты, Доставка, Возврат, Конфиденциальность, FAQ']
    },
    {
      id: 'tracking',
      title: '3. Трекинг клиента',
      description: 'Клиент видит статус заказа и получает обновления.',
      status: trackingStatus,
      points: [
        `Track secret: ${checks.customerTracking.hasTrackSecret ? 'ok' : 'нет'}`,
        `OTP secret: ${checks.customerTracking.hasOtpSecret ? 'ok' : 'нет'}`,
        `Telegram включен: ${checks.customerTracking.hasTelegram ? 'ok' : 'нет'}`
      ]
    },
    {
      id: 'reliability',
      title: '4. Надёжность и безопасность',
      description: 'Критичные проверки бэкенда и админки.',
      status: reliabilityStatus,
      points: [
        `Supabase: ${checks.reliability.hasSupabase ? 'ok' : 'нет'}`,
        `Пинг БД: ${checks.reliability.dbPingOk ? 'ok' : 'ошибка'}`,
        `Admin key: ${checks.reliability.hasAdminKey ? 'ok' : 'слабый/нет'}`,
        `Cleanup secret: ${checks.reliability.hasCleanupSecret ? 'ok' : 'слабый/нет'}`
      ]
    },
    {
      id: 'trust',
      title: '5. Доверие и конверсия',
      description: 'Реальный social proof из заказов.',
      status: trustStatus,
      points: [
        `Отзывов: ${checks.trust.reviewsCount}`,
        `Заказов за 30 дней: ${checks.trust.orders30d}`
      ]
    }
  ]
})

const envChecklistItems = computed<EnvChecklistItem[]>(() => {
  const checks = readinessData.value
  if (!checks) return []

  const statusByBoolean = (ok: boolean): 'done' | 'todo' => (ok ? 'done' : 'todo')

  const t = (ru: string, ro: string, en: string) => {
    if (locale.value === 'en') return en
    if (locale.value === 'ro') return ro
    return ru
  }

  return [
    {
      key: 'NUXT_SUPABASE_URL',
      sample: 'https://your-project-ref.supabase.co',
      status: statusByBoolean(checks.reliability.hasSupabase),
      help: t('URL проекта Supabase (server)', 'URL proiect Supabase (server)', 'Supabase project URL (server)')
    },
    {
      key: 'NUXT_SUPABASE_SERVICE_ROLE_KEY',
      sample: 'eyJhbGciOi...',
      status: statusByBoolean(checks.reliability.hasSupabase),
      help: t('Service Role ключ Supabase', 'Cheie Service Role Supabase', 'Supabase Service Role key')
    },
    {
      key: 'NUXT_PUBLIC_SUPABASE_URL',
      sample: 'https://your-project-ref.supabase.co',
      status: statusByBoolean(checks.reliability.hasSupabase),
      help: t('Публичный URL Supabase', 'URL public Supabase', 'Public Supabase URL')
    },
    {
      key: 'NUXT_PUBLIC_SUPABASE_ANON_KEY',
      sample: 'sb_publishable_...',
      status: statusByBoolean(checks.reliability.hasSupabase),
      help: t('Публичный anon/publishable ключ', 'Cheie publică anon/publishable', 'Public anon/publishable key')
    },
    {
      key: 'NUXT_ADMIN_KEY',
      sample: 'change_this_to_a_long_secure_key',
      status: statusByBoolean(checks.reliability.hasAdminKey),
      help: t('Ключ входа в /admin', 'Cheie acces /admin', 'Admin login key for /admin')
    },
    {
      key: 'NUXT_CLEANUP_SECRET',
      sample: 'change_this_to_cleanup_secret',
      status: statusByBoolean(checks.reliability.hasCleanupSecret),
      help: t('Секрет для /api/system/cleanup', 'Secret pentru /api/system/cleanup', 'Secret for /api/system/cleanup')
    },
    {
      key: 'NUXT_ORDER_TRACK_SECRET',
      sample: 'change_this_to_another_long_secure_key',
      status: statusByBoolean(checks.customerTracking.hasTrackSecret),
      help: t('Секрет трекинга заказов', 'Secret tracking comenzi', 'Order tracking secret')
    },
    {
      key: 'NUXT_ORDER_OTP_SECRET',
      sample: 'change_this_to_yet_another_long_secure_key',
      status: statusByBoolean(checks.customerTracking.hasOtpSecret),
      help: t('Секрет одноразовых кодов', 'Secret coduri OTP', 'One-time code secret')
    },
    {
      key: 'NUXT_TELEGRAM_BOT_TOKEN',
      sample: '123456:ABCDEF...',
      status: statusByBoolean(checks.customerTracking.hasTelegram),
      help: t('Токен Telegram бота', 'Token bot Telegram', 'Telegram bot token')
    },
    {
      key: 'NUXT_TELEGRAM_BOT_USERNAME',
      sample: 'your_bot_username',
      status: statusByBoolean(checks.customerTracking.hasTelegram),
      help: t('Username бота без @', 'Username bot fără @', 'Bot username without @')
    },
    {
      key: 'NUXT_TELEGRAM_CHAT_ID',
      sample: '123456789',
      status: statusByBoolean(checks.customerTracking.hasTelegram),
      help: t('Chat ID для уведомлений', 'Chat ID pentru notificări', 'Chat ID for notifications')
    },
    {
      key: 'NUXT_STRIPE_SECRET_KEY',
      sample: 'sk_live_or_test_key',
      status: checks.payment.isStripeLive ? 'done' : (checks.payment.hasStripe ? 'partial' : 'todo'),
      help: t('Secret key Stripe', 'Cheie secretă Stripe', 'Stripe secret key')
    },
    {
      key: 'NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      sample: 'pk_live_or_test_key',
      status: checks.payment.isStripeLive ? 'done' : (checks.payment.hasStripe ? 'partial' : 'todo'),
      help: t('Публичный ключ Stripe', 'Cheie publică Stripe', 'Stripe publishable key')
    },
    {
      key: 'NUXT_STRIPE_WEBHOOK_SECRET',
      sample: 'whsec_from_stripe_webhooks',
      status: statusByBoolean(checks.payment.hasStripeWebhook),
      help: t('Секрет Stripe webhook', 'Secret webhook Stripe', 'Stripe webhook secret')
    },
    {
      key: 'NUXT_MAIB_PROJECT_ID',
      sample: 'your_maib_project_id',
      status: statusByBoolean(checks.payment.hasMaib),
      help: t('MAIB project id', 'MAIB project id', 'MAIB project id')
    },
    {
      key: 'NUXT_MAIB_PROJECT_SECRET',
      sample: 'your_maib_project_secret',
      status: statusByBoolean(checks.payment.hasMaib),
      help: t('MAIB project secret', 'MAIB project secret', 'MAIB project secret')
    },
    {
      key: 'NUXT_MAIB_SIGNATURE_KEY',
      sample: 'your_maib_signature_key',
      status: statusByBoolean(checks.payment.hasMaib),
      help: t('MAIB подпись callback', 'Semnătură callback MAIB', 'MAIB callback signature key')
    }
  ]
})

const envFixByKey = (key: string) => {
  const t = (ru: string, ro: string, en: string) => {
    if (locale.value === 'en') return en
    if (locale.value === 'ro') return ro
    return ru
  }

  const k = String(key || '')
  if (k.startsWith('NUXT_SUPABASE_') || k.startsWith('NUXT_PUBLIC_SUPABASE_')) {
    return t('Скопируй из Supabase -> Project Settings -> API Keys/URL.', 'Copiază din Supabase -> Project Settings -> API Keys/URL.', 'Copy from Supabase -> Project Settings -> API Keys/URL.')
  }
  if (k.startsWith('NUXT_STRIPE_') || k.startsWith('NUXT_PUBLIC_STRIPE_')) {
    return t('Добавь ключи из Stripe Dashboard -> Developers.', 'Adaugă cheile din Stripe Dashboard -> Developers.', 'Add keys from Stripe Dashboard -> Developers.')
  }
  if (k.startsWith('NUXT_MAIB_')) {
    return t('Добавь данные мерчанта MAIB из eCommerce кабинета.', 'Adaugă datele merchant MAIB din cabinetul eCommerce.', 'Add MAIB merchant credentials from eCommerce cabinet.')
  }
  if (k.startsWith('NUXT_TELEGRAM_')) {
    return t('Укажи токен бота и chat id из BotFather/Telegram.', 'Setează token bot și chat id din BotFather/Telegram.', 'Set bot token and chat id from BotFather/Telegram.')
  }
  if (k.includes('SECRET') || k.includes('KEY')) {
    return t('Сгенерируй длинное случайное значение (минимум 24 символа).', 'Generează o valoare random lungă (minim 24 caractere).', 'Generate a long random value (minimum 24 chars).')
  }
  return t('Добавь значение в Vercel ENV и redeploy.', 'Adaugă valoarea în Vercel ENV și redeploy.', 'Set this value in Vercel ENV and redeploy.')
}

const envMissingItems = computed<EnvMissingItem[]>(() => {
  return envChecklistItems.value
    .filter((item) => item.status !== 'done')
    .map((item) => ({
      key: item.key,
      fix: envFixByKey(item.key)
    }))
})

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
      paymentAll: 'Toate plățile',
      paymentPending: 'În așteptare plată',
      paymentPaid: 'Plătit',
      paymentCod: 'Ramburs',
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
      payment: 'Plată:',
      paymentMethodCard: 'Card online',
      paymentMethodPhone: 'Transfer telefonic',
      paymentMethodCod: 'Plată la livrare',
      confirmPaymentManually: 'Confirmă plata manual',
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
      csvExportCurrent: 'Export curent CSV',
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
      kpiTotal: 'Total comenzi',
      kpiNew: 'Noi',
      kpiProgress: 'În lucru',
      kpiDelivered: 'Livrate',
      kpiPendingPayment: 'Plată în așteptare',
      kpiPaid: 'Plătite',
      kpiAttention: 'Necesită atenție',
      kpiRevenue: 'Venit (filtru curent)',
      quickAll: 'Toate',
      quickNew: 'Noi',
      quickProgress: 'În lucru',
      quickDelivered: 'Livrate',
      quickPendingPayment: 'Așteaptă plată',
      quickPaid: 'Plătite',
      quickAttention: 'Necesită atenție',
      attentionLabel: 'Atenție',
      searchOrders: 'Caută după ID, telefon, email, nume',
      sortNewest: 'Mai noi primele',
      sortOldest: 'Mai vechi primele',
      sortTotalDesc: 'Suma: mare -> mic',
      sortTotalAsc: 'Suma: mic -> mare',
      sortPriority: 'Prioritate',
      perPage: 'Pe pagină',
      prevPage: 'Pagina anterioară',
      nextPage: 'Pagina următoare',
      noMatchesTitle: 'Nu există rezultate pentru acest filtru',
      noMatchesText: 'Schimbă filtrul rapid sau resetează căutarea.',
      quickConfirm: 'Confirmă',
      quickShip: 'Expediază',
      quickDeliver: 'Livrează',
      quickCancel: 'Anulează',
      takeInWork: 'Preia în lucru',
      priorityHigh: 'Prioritate mare',
      priorityMedium: 'Prioritate medie',
      priorityNormal: 'Normal',
      aiTitle: 'AI operațional',
      aiSubtitle: 'Analiză automată a comenzilor: riscuri SLA, blocaje și acțiuni recomandate.',
      aiRun: 'Rulează analiză AI',
      aiSummary: 'Sumar',
      aiRisks: 'Riscuri cheie',
      aiActions: 'Acțiuni recomandate',
      aiPriority: 'Coada AI prioritară',
      aiTakePriority: 'Preia top-risc în lucru',
      aiSourceAi: 'Sursă: AI',
      aiSourceFallback: 'Sursă: fallback',
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
      paymentAll: 'All payments',
      paymentPending: 'Awaiting payment',
      paymentPaid: 'Paid',
      paymentCod: 'Cash on delivery',
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
      payment: 'Payment:',
      paymentMethodCard: 'Card online',
      paymentMethodPhone: 'Phone transfer',
      paymentMethodCod: 'Cash on delivery',
      confirmPaymentManually: 'Confirm payment manually',
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
      csvExportCurrent: 'Export current CSV',
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
      kpiTotal: 'Total orders',
      kpiNew: 'New',
      kpiProgress: 'In progress',
      kpiDelivered: 'Delivered',
      kpiPendingPayment: 'Pending payment',
      kpiPaid: 'Paid',
      kpiAttention: 'Needs attention',
      kpiRevenue: 'Revenue (current filter)',
      quickAll: 'All',
      quickNew: 'New',
      quickProgress: 'In progress',
      quickDelivered: 'Delivered',
      quickPendingPayment: 'Pending pay',
      quickPaid: 'Paid',
      quickAttention: 'Needs attention',
      attentionLabel: 'Attention',
      searchOrders: 'Search by ID, phone, email, customer',
      sortNewest: 'Newest first',
      sortOldest: 'Oldest first',
      sortTotalDesc: 'Amount: high to low',
      sortTotalAsc: 'Amount: low to high',
      sortPriority: 'Priority',
      perPage: 'Per page',
      prevPage: 'Previous',
      nextPage: 'Next',
      noMatchesTitle: 'No matches for this filter',
      noMatchesText: 'Change quick filter or reset search.',
      quickConfirm: 'Confirm',
      quickShip: 'Ship',
      quickDeliver: 'Deliver',
      quickCancel: 'Cancel',
      takeInWork: 'Take in work',
      priorityHigh: 'High priority',
      priorityMedium: 'Medium priority',
      priorityNormal: 'Normal',
      aiTitle: 'AI operations',
      aiSubtitle: 'Automatic order analysis for SLA risk, bottlenecks, and next best actions.',
      aiRun: 'Run AI insights',
      aiSummary: 'Summary',
      aiRisks: 'Top risks',
      aiActions: 'Recommended actions',
      aiPriority: 'AI priority queue',
      aiTakePriority: 'Take top-risk in work',
      aiSourceAi: 'Source: AI',
      aiSourceFallback: 'Source: fallback',
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
    paymentAll: 'Все оплаты',
    paymentPending: 'Ожидает оплату',
    paymentPaid: 'Оплачено',
    paymentCod: 'Наложка',
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
    payment: 'Оплата:',
    paymentMethodCard: 'Картой онлайн',
    paymentMethodPhone: 'Перевод по телефону',
    paymentMethodCod: 'Наложенный платеж',
    confirmPaymentManually: 'Подтвердить оплату вручную',
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
    csvExportCurrent: 'Экспорт текущего CSV',
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
    kpiTotal: 'Всего заказов',
    kpiNew: 'Новые',
    kpiProgress: 'В работе',
    kpiDelivered: 'Доставлены',
    kpiPendingPayment: 'Ожидают оплату',
    kpiPaid: 'Оплачены',
    kpiAttention: 'Требуют внимания',
    kpiRevenue: 'Выручка (текущий фильтр)',
    quickAll: 'Все',
    quickNew: 'Новые',
    quickProgress: 'В работе',
    quickDelivered: 'Доставлены',
    quickPendingPayment: 'К оплате',
    quickPaid: 'Оплачены',
    quickAttention: 'Требуют внимания',
    attentionLabel: 'Внимание',
    searchOrders: 'Поиск по ID, телефону, email, имени',
    sortNewest: 'Сначала новые',
    sortOldest: 'Сначала старые',
    sortTotalDesc: 'Сумма: больше -> меньше',
    sortTotalAsc: 'Сумма: меньше -> больше',
    sortPriority: 'По приоритету',
    perPage: 'На странице',
    prevPage: 'Назад',
    nextPage: 'Вперёд',
    noMatchesTitle: 'По этому фильтру ничего не найдено',
    noMatchesText: 'Смени быстрый фильтр или сбрось поиск.',
    quickConfirm: 'Подтвердить',
    quickShip: 'Отправить',
    quickDeliver: 'Доставлен',
    quickCancel: 'Отменить',
    takeInWork: 'Взять в работу',
    priorityHigh: 'Высокий приоритет',
    priorityMedium: 'Средний приоритет',
    priorityNormal: 'Нормальный',
    aiTitle: 'AI-оператор',
    aiSubtitle: 'Автоанализ заказов: SLA-риск, узкие места и конкретные действия.',
    aiRun: 'Запустить AI-анализ',
    aiSummary: 'Сводка',
    aiRisks: 'Ключевые риски',
    aiActions: 'Рекомендованные действия',
    aiPriority: 'Приоритетная очередь AI',
    aiTakePriority: 'Взять top-risk в работу',
    aiSourceAi: 'Источник: AI',
    aiSourceFallback: 'Источник: fallback',
    emptyTitle: 'Заказов пока нет',
    emptyText: 'После checkout заказы появятся здесь.',
    sessionExpired: 'Сессия админа истекла. Войдите снова.'
  }
})

const orderSearchNormalized = computed(() => orderSearch.value.trim().toLowerCase())

const orderAgeHours = (order: AdminOrder) => {
  const ageMs = Date.now() - new Date(order.createdAt).getTime()
  return Math.max(0, ageMs / (1000 * 60 * 60))
}

const statusSlaHours = (status: OrderStatus) => {
  if (status === 'new') return 2
  if (status === 'confirmed' || status === 'assembled') return 24
  if (status === 'shipped') return 72
  return Number.POSITIVE_INFINITY
}

const formatSlaHours = (hours: number) => {
  if (locale.value === 'en') return `${Math.round(hours)}h`
  if (locale.value === 'ro') return `${Math.round(hours)}h`
  return `${Math.round(hours)}ч`
}

const slaState = (order: AdminOrder) => {
  const maxHours = statusSlaHours(order.status)
  if (!Number.isFinite(maxHours)) {
    return {
      level: 'done' as const,
      label: locale.value === 'en' ? 'SLA completed' : locale.value === 'ro' ? 'SLA finalizat' : 'SLA завершен'
    }
  }
  const ageHours = orderAgeHours(order)
  const remaining = maxHours - ageHours

  if (remaining <= 0) {
    return {
      level: 'risk' as const,
      label: locale.value === 'en' ? `SLA overdue ${formatSlaHours(Math.abs(remaining))}` : locale.value === 'ro' ? `SLA depășit ${formatSlaHours(Math.abs(remaining))}` : `SLA просрочен ${formatSlaHours(Math.abs(remaining))}`
    }
  }

  const ratio = ageHours / maxHours
  if (ratio >= 0.75) {
    return {
      level: 'warn' as const,
      label: locale.value === 'en' ? `SLA left ${formatSlaHours(remaining)}` : locale.value === 'ro' ? `SLA rămas ${formatSlaHours(remaining)}` : `До SLA ${formatSlaHours(remaining)}`
    }
  }

  return {
    level: 'ok' as const,
    label: locale.value === 'en' ? `SLA ${formatSlaHours(remaining)} left` : locale.value === 'ro' ? `SLA ${formatSlaHours(remaining)} rămas` : `SLA: ${formatSlaHours(remaining)}`
  }
}

const isAttentionOrder = (order: AdminOrder) => {
  const ageHours = orderAgeHours(order)
  if (order.status === 'cancelled' || order.status === 'returned' || order.status === 'delivered') return false
  if (order.status === 'new' && ageHours >= 2) return true
  if (order.payment.status === 'pending' && ageHours >= 6) return true
  if ((order.status === 'confirmed' || order.status === 'assembled') && ageHours >= 24) return true
  if (order.status === 'shipped' && ageHours >= 72) return true
  return false
}

const matchesQuickFilter = (order: AdminOrder) => {
  if (quickFilter.value === 'all') return true
  if (quickFilter.value === 'new') return order.status === 'new'
  if (quickFilter.value === 'progress') return order.status === 'confirmed' || order.status === 'assembled' || order.status === 'shipped'
  if (quickFilter.value === 'delivered') return order.status === 'delivered'
  if (quickFilter.value === 'pending_payment') return order.payment.status === 'pending'
  if (quickFilter.value === 'paid') return order.payment.status === 'paid'
  if (quickFilter.value === 'attention') return isAttentionOrder(order)
  return true
}

const matchesSearch = (order: AdminOrder) => {
  const query = orderSearchNormalized.value
  if (!query) return true
  const haystack = [
    order.id,
    order.customer.name,
    order.customer.phone,
    order.customer.email || '',
    order.customer.address
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

const displayOrders = computed(() => orders.value.filter((order) => matchesQuickFilter(order) && matchesSearch(order)))

const sortRank = (order: AdminOrder) => {
  const value = orderPriority(order)
  if (value === 'high') return 3
  if (value === 'medium') return 2
  return 1
}

const sortedOrders = computed(() => {
  const list = [...displayOrders.value]
  if (sortBy.value === 'oldest') {
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
  if (sortBy.value === 'total_desc') {
    return list.sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
  }
  if (sortBy.value === 'total_asc') {
    return list.sort((a, b) => Number(a.total || 0) - Number(b.total || 0))
  }
  if (sortBy.value === 'priority') {
    return list.sort((a, b) => {
      const diff = sortRank(b) - sortRank(a)
      if (diff !== 0) return diff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedOrders.value.length / pageSize.value)))

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedOrders.value.slice(start, start + pageSize.value)
})

const paginationText = computed(() => {
  const total = sortedOrders.value.length
  if (!total) return ''
  const from = (currentPage.value - 1) * pageSize.value + 1
  const to = Math.min(total, from + pageSize.value - 1)
  if (locale.value === 'en') return `${from}-${to} of ${total} · Page ${currentPage.value}/${totalPages.value}`
  if (locale.value === 'ro') return `${from}-${to} din ${total} · Pagina ${currentPage.value}/${totalPages.value}`
  return `${from}-${to} из ${total} · Страница ${currentPage.value}/${totalPages.value}`
})

const adminKpis = computed(() => {
  const list = displayOrders.value
  const progress = list.filter((order) => order.status === 'confirmed' || order.status === 'assembled' || order.status === 'shipped').length
  const revenue = list.reduce((sum, order) => sum + Number(order.total || 0), 0)
  return {
    total: list.length,
    newOrders: list.filter((order) => order.status === 'new').length,
    progress,
    delivered: list.filter((order) => order.status === 'delivered').length,
    pendingPayment: list.filter((order) => order.payment.status === 'pending').length,
    paid: list.filter((order) => order.payment.status === 'paid').length,
    attention: list.filter((order) => isAttentionOrder(order)).length,
    revenue
  }
})

const quickFilters = computed(() => [
  { value: 'all', label: ui.value.quickAll },
  { value: 'new', label: ui.value.quickNew },
  { value: 'progress', label: ui.value.quickProgress },
  { value: 'delivered', label: ui.value.quickDelivered },
  { value: 'pending_payment', label: ui.value.quickPendingPayment },
  { value: 'paid', label: ui.value.quickPaid },
  { value: 'attention', label: ui.value.quickAttention }
])

const orderPriority = (order: AdminOrder): 'high' | 'medium' | 'normal' => {
  if (isAttentionOrder(order)) return 'high'
  if (order.payment.status === 'pending' || order.status === 'new') return 'medium'
  return 'normal'
}

const orderPriorityLabel = (order: AdminOrder) => {
  const value = orderPriority(order)
  if (value === 'high') return ui.value.priorityHigh
  if (value === 'medium') return ui.value.priorityMedium
  return ui.value.priorityNormal
}

const canTakeInWork = (order: AdminOrder) => {
  if (['cancelled', 'returned', 'delivered'].includes(order.status)) return false
  return orderPriority(order) === 'high'
}

const takeInWork = async (order: AdminOrder) => {
  const nextStatus: OrderStatus =
    order.status === 'new'
      ? 'confirmed'
      : order.status === 'confirmed'
        ? 'assembled'
        : order.status

  if (nextStatus === order.status) return

  draftStatus[order.id] = nextStatus
  draftNote[order.id] =
    locale.value === 'en'
      ? 'Taken in work from priority queue'
      : locale.value === 'ro'
        ? 'Preluată în lucru din coada prioritară'
        : 'Взято в работу из приоритетной очереди'
  await updateStatus(order.id)
}

const applyQuickFilter = (value: 'all' | 'new' | 'progress' | 'delivered' | 'pending_payment' | 'paid' | 'attention') => {
  quickFilter.value = value
  currentPage.value = 1
}

const applyQuickStatus = async (order: AdminOrder, nextStatus: OrderStatus) => {
  if (order.status === nextStatus) return
  draftStatus[order.id] = nextStatus
  const from = statusLabel(order.status)
  const to = statusLabel(nextStatus)
  draftNote[order.id] = `${from} -> ${to}`
  await updateStatus(order.id)
}

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

const paymentFilterLabel = (value: 'all' | 'pending' | 'paid' | 'cash_on_delivery') => {
  if (value === 'pending') return ui.value.paymentPending
  if (value === 'paid') return ui.value.paymentPaid
  if (value === 'cash_on_delivery') return ui.value.paymentCod
  return ui.value.paymentAll
}

const paymentStatusLabel = (value: 'pending' | 'paid' | 'cash_on_delivery') => {
  if (value === 'pending') return ui.value.paymentPending
  if (value === 'paid') return ui.value.paymentPaid
  return ui.value.paymentCod
}

const paymentMethodLabel = (value: 'card_online' | 'phone_transfer' | 'cash_on_delivery') => {
  if (value === 'card_online') return ui.value.paymentMethodCard
  if (value === 'phone_transfer') return ui.value.paymentMethodPhone
  return ui.value.paymentMethodCod
}

const paymentBadgeClass = (value: 'pending' | 'paid' | 'cash_on_delivery') => {
  if (value === 'paid') return 'p-paid'
  if (value === 'cash_on_delivery') return 'p-cod'
  return 'p-pending'
}

const canConfirmPayment = (order: AdminOrder) => {
  return order.payment.method === 'phone_transfer' && order.payment.status !== 'paid'
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
    selectedOrderIds.value = Array.from(new Set([...selectedOrderIds.value, ...pagedOrders.value.map((item) => item.id)]))
  } else {
    const visible = new Set(pagedOrders.value.map((item) => item.id))
    selectedOrderIds.value = selectedOrderIds.value.filter((id) => !visible.has(id))
  }
}

const goToPage = (page: number) => {
  currentPage.value = Math.min(totalPages.value, Math.max(1, Math.floor(page || 1)))
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

const csvEscape = (value: unknown) => {
  const raw = String(value ?? '')
  if (!raw.includes(',') && !raw.includes('"') && !raw.includes('\n')) return raw
  return `"${raw.replaceAll('"', '""')}"`
}

const exportCurrentProductsCsv = () => {
  if (!import.meta.client || !editableProducts.value.length) return

  const header = [
    'product_id',
    'price',
    'badge',
    'is_active',
    'stock_s',
    'stock_m',
    'stock_l',
    'title_ru',
    'title_ro',
    'title_en',
    'short_ru',
    'short_ro',
    'short_en'
  ]

  const lines = [header.join(',')]
  for (const product of editableProducts.value) {
    const stock = inventoryDraft[product.id] || { S: 0, M: 0, L: 0 }
    const row = [
      product.id,
      Number(product.price || 0),
      product.badge || '',
      product.isActive ? 1 : 0,
      Number(stock.S || 0),
      Number(stock.M || 0),
      Number(stock.L || 0),
      product.titleRu || '',
      product.titleRo || '',
      product.titleEn || '',
      product.shortRu || '',
      product.shortRo || '',
      product.shortEn || ''
    ].map(csvEscape)

    lines.push(row.join(','))
  }

  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `osf-products-current-${new Date().toISOString().slice(0, 10)}.csv`
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

const loadReadiness = async () => {
  if (!csrfToken.value) return
  readinessLoading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      updatedAt: string
      checks: ReadinessChecks
    }>('/api/admin/readiness', {
      headers: {
        'x-csrf-token': csrfToken.value
      }
    })

    readinessData.value = response?.checks || null
    readinessUpdatedAt.value = String(response?.updatedAt || '')
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    readinessLoading.value = false
  }
}

const checkEnvNow = async () => {
  showEnvChecklist.value = true
  await loadReadiness()
  const missing = envMissingItems.value.length
  if (missing > 0) {
    uiStore.showToast(
      locale.value === 'en'
        ? `Missing ENV: ${missing}`
        : locale.value === 'ro'
          ? `ENV lipsă: ${missing}`
          : `Не хватает ENV: ${missing}`,
      'info'
    )
  } else {
    uiStore.showToast(
      locale.value === 'en'
        ? 'All required ENV values are set'
        : locale.value === 'ro'
          ? 'Toate valorile ENV necesare sunt setate'
          : 'Все нужные ENV значения заполнены',
      'success'
    )
  }
}

const copyText = async (text: string) => {
  if (!import.meta.client) return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fallback below.
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.focus()
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

const copyEnvSnippet = async (item: EnvChecklistItem) => {
  const line = `${item.key}=${item.sample}`
  const ok = await copyText(line)
  uiStore.showToast(
    ok
      ? (locale.value === 'en' ? 'Copied' : locale.value === 'ro' ? 'Copiat' : 'Скопировано')
      : (locale.value === 'en' ? 'Copy failed' : locale.value === 'ro' ? 'Copiere eșuată' : 'Не удалось скопировать'),
    ok ? 'success' : 'error'
  )
}

const copyAllEnvSnippet = async () => {
  const lines = envChecklistItems.value.map((item) => `${item.key}=${item.sample}`).join('\n')
  if (!lines) return
  const ok = await copyText(lines)
  uiStore.showToast(
    ok
      ? (locale.value === 'en' ? 'All ENV lines copied' : locale.value === 'ro' ? 'Toate liniile ENV au fost copiate' : 'Все ENV строки скопированы')
      : (locale.value === 'en' ? 'Copy failed' : locale.value === 'ro' ? 'Copiere eșuată' : 'Не удалось скопировать'),
    ok ? 'success' : 'error'
  )
}

const downloadEnvTemplate = () => {
  if (!import.meta.client) return
  const lines = envChecklistItems.value.map((item) => `${item.key}=${item.sample}`)
  if (!lines.length) return

  const header = [
    '# ONE STYLE FOREVER',
    '# Generated from /admin go-live checklist',
    '# Set these values in Vercel -> Project Settings -> Environment Variables',
    ''
  ]
  const content = [...header, ...lines, ''].join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '.env.template'
  a.click()
  URL.revokeObjectURL(url)
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
        ...(paymentFilter.value !== 'all' ? { payment: paymentFilter.value } : {}),
        ...(dateFrom.value ? { from: dateFrom.value } : {}),
        ...(dateTo.value ? { to: dateTo.value } : {})
      }
    })

    orders.value = response.orders.map((order) => ({
      ...order,
      payment: {
        method: order.payment?.method || 'cash_on_delivery',
        status: order.payment?.status || 'cash_on_delivery'
      },
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
  await loadReadiness()
}

const generateAiInsights = async () => {
  aiLoading.value = true
  aiError.value = ''
  try {
    const response = await $fetch<{
      success: boolean
      source: 'ai' | 'heuristic'
      summary: string
      topRisks: string[]
      actions: string[]
      priorityOrderIds?: string[]
    }>('/api/admin/ai/orders-insights', {
      method: 'POST',
      headers: csrfToken.value
        ? {
            'x-csrf-token': csrfToken.value
          }
        : undefined,
      body: {
        locale: locale.value === 'en' || locale.value === 'ro' ? locale.value : 'ru',
        orders: displayOrders.value.map((order) => ({
          id: order.id,
          createdAt: order.createdAt,
          total: order.total,
          status: order.status,
          payment: {
            status: order.payment.status
          },
          customer: {
            phone: order.customer.phone,
            address: order.customer.address
          },
          items: order.items.map((item) => ({
            quantity: item.quantity
          }))
        }))
      }
    })

    aiInsights.value = {
      source: response.source,
      summary: response.summary,
      topRisks: Array.isArray(response.topRisks) ? response.topRisks.filter(Boolean).slice(0, 3) : [],
      actions: Array.isArray(response.actions) ? response.actions.filter(Boolean).slice(0, 3) : [],
      priorityOrderIds: Array.isArray(response.priorityOrderIds) ? response.priorityOrderIds.filter(Boolean).slice(0, 3) : []
    }
  } catch (error) {
    aiError.value = resolveErrorMessage(error)
  } finally {
    aiLoading.value = false
  }
}

const applyAiPriorityQueue = async () => {
  const ids = (aiInsights.value?.priorityOrderIds || []).filter(Boolean)
  if (!ids.length) return

  const map = new Map(orders.value.map((order) => [order.id, order]))
  for (const id of ids) {
    const order = map.get(id)
    if (!order) continue
    if (!canTakeInWork(order)) continue
    await takeInWork(order)
  }
}

const resetOrderFilters = async () => {
  statusFilter.value = ''
  paymentFilter.value = 'all'
  quickFilter.value = 'all'
  orderSearch.value = ''
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

const confirmPayment = async (orderId: string) => {
  confirmingPaymentId.value = orderId
  try {
    const response = await $fetch<{
      success: boolean
      paymentStatus: 'pending' | 'paid' | 'cash_on_delivery'
    }>(`/api/admin/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: csrfToken.value
        ? {
            'x-csrf-token': csrfToken.value
          }
        : undefined,
      body: {
        status: 'paid'
      }
    })

    const target = orders.value.find((item) => item.id === orderId)
    if (target) {
      target.payment.status = response.paymentStatus
    }

    uiStore.showToast(
      locale.value === 'en'
        ? 'Payment confirmed'
        : locale.value === 'ro'
          ? 'Plată confirmată'
          : 'Оплата подтверждена',
      'success'
    )
  } catch (error) {
    uiStore.showToast(resolveErrorMessage(error), 'error')
  } finally {
    confirmingPaymentId.value = ''
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

const persistAdminFilters = () => {
  if (!import.meta.client) return
  const payload = {
    statusFilter: statusFilter.value,
    paymentFilter: paymentFilter.value,
    quickFilter: quickFilter.value,
    orderSearch: orderSearch.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    sortBy: sortBy.value,
    pageSize: pageSize.value
  }
  window.localStorage.setItem(adminFiltersStorageKey, JSON.stringify(payload))
}

const loadPersistedAdminFilters = () => {
  if (!import.meta.client) return
  try {
    const raw = window.localStorage.getItem(adminFiltersStorageKey)
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<{
      statusFilter: string
      paymentFilter: 'all' | 'pending' | 'paid' | 'cash_on_delivery'
      quickFilter: 'all' | 'new' | 'progress' | 'delivered' | 'pending_payment' | 'paid' | 'attention'
      orderSearch: string
      dateFrom: string
      dateTo: string
      sortBy: 'newest' | 'oldest' | 'total_desc' | 'total_asc' | 'priority'
      pageSize: number
    }>
    statusFilter.value = typeof parsed.statusFilter === 'string' ? parsed.statusFilter : ''
    paymentFilter.value = parsed.paymentFilter && paymentFilters.some((item) => item.value === parsed.paymentFilter) ? parsed.paymentFilter : 'all'
    quickFilter.value = parsed.quickFilter || 'all'
    orderSearch.value = typeof parsed.orderSearch === 'string' ? parsed.orderSearch : ''
    dateFrom.value = typeof parsed.dateFrom === 'string' ? parsed.dateFrom : ''
    dateTo.value = typeof parsed.dateTo === 'string' ? parsed.dateTo : ''
    sortBy.value = parsed.sortBy || 'newest'
    pageSize.value = pageSizeOptions.includes(Number(parsed.pageSize) as 12 | 24 | 48) ? Number(parsed.pageSize) : 12
  } catch {
    // Ignore corrupted localStorage.
  }
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
  paymentFilter.value = 'all'
  quickFilter.value = 'all'
  orderSearch.value = ''
  sortBy.value = 'newest'
  pageSize.value = 12
  currentPage.value = 1
  orders.value = []
  stockBySize.value = {}
  inventoryHistory.value = []
  editableProducts.value = []
  auditEntries.value = []
  readinessUpdatedAt.value = ''
  readinessData.value = null
  aiInsights.value = null
  aiError.value = ''
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
  loadPersistedAdminFilters()

  $fetch<{ success: boolean; actor?: string; csrfToken?: string }>('/api/admin/session/me')
    .then((response) => {
      if (response?.actor) {
        adminActor.value = response.actor
        persistAdminActor()
      }
      csrfToken.value = response?.csrfToken || ''
      buildDefaultEditableProducts()
      return Promise.all([fetchOrders(), loadInventory(), loadProductOverrides(), loadAudit(), loadReadiness()])
    })
    .catch(() => {
      loaded.value = false
    })
})

onBeforeUnmount(() => {
  persistAdminActor()
  persistAdminFilters()
})

watch([statusFilter, paymentFilter, quickFilter, orderSearch, dateFrom, dateTo, sortBy, pageSize], () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
  }
  persistAdminFilters()
})

watch([totalPages, sortedOrders], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
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
  margin-top: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.ai-insights-card {
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  background: #fff;
}

.ai-insights-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.ai-insights-head h2 {
  margin: 0;
  font-size: 20px;
}

.ai-insights-subtitle {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.ai-summary {
  margin: 10px 0 0;
  font-size: 14px;
  color: #2d3f53;
}

.ai-source {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 700;
}

.src-ai {
  background: #edf9f0;
  color: #1f6f41;
  border-color: #bfe0c9;
}

.src-heuristic {
  background: #eef3ff;
  color: #2e4f90;
  border-color: #cad8f4;
}

.ai-columns {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ai-columns strong {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
}

.ai-columns ul {
  margin: 0;
  padding-left: 16px;
  color: #334b62;
  font-size: 13px;
  display: grid;
  gap: 4px;
}

.ai-priority-row {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.ai-priority-row strong {
  font-size: 14px;
}

.ai-priority-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.kpi-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 10px 12px;
  display: grid;
  gap: 6px;
}

.kpi-item[role="button"] {
  cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease;
}

.kpi-item[role="button"]:hover {
  border-color: #b7d7bf;
  box-shadow: 0 10px 24px rgba(35, 56, 80, .08);
  transform: translateY(-1px);
}

.kpi-item.active {
  background: #edf7ef;
  border-color: #b7d7bf;
}

.kpi-item span {
  color: #5f7188;
  font-size: 12px;
  font-weight: 700;
}

.kpi-item strong {
  font-size: 20px;
  line-height: 1;
}

.kpi-item.kpi-wide {
  grid-column: span 2;
}

.orders-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.orders-search {
  min-width: 290px;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
}

.quick-filter-btn {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all .18s ease;
}

.quick-filter-btn.active {
  background: #edf7ef;
  border-color: #bcdac4;
  color: #1f6f41;
}

.date-filter {
  min-width: 168px;
}

.sort-filter,
.page-size-filter {
  min-width: 188px;
}

.inventory-card {
  padding: 16px;
}

.launch-card {
  padding: 16px;
}

.launch-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.launch-head h2 {
  margin: 0;
  font-size: 22px;
}

.launch-updated {
  margin: 8px 0 0;
  color: #5b6f86;
  font-size: 13px;
}

.launch-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.launch-env {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.launch-env-toggle {
  width: fit-content;
}

.launch-env-panel {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: #fbfdfb;
  display: grid;
  gap: 10px;
}

.launch-env-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.launch-env-head-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.launch-env-head strong {
  font-size: 15px;
}

.launch-env-note {
  margin: 0;
  color: #51657d;
  font-size: 13px;
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.env-item {
  border: 1px solid #dbe7dd;
  border-radius: 14px;
  padding: 10px;
  background: #fff;
  display: grid;
  gap: 8px;
}

.env-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.env-item-head code {
  font-size: 12px;
  font-weight: 700;
  color: #1c3047;
}

.env-item p {
  margin: 0;
  color: #4b6078;
  font-size: 12px;
}

.env-item-actions {
  display: flex;
  justify-content: flex-end;
}

.env-missing {
  border: 1px solid #edd7bb;
  background: #fff7eb;
  border-radius: 14px;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.env-missing strong {
  font-size: 14px;
  color: #6f4a1f;
}

.env-missing ul {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 6px;
  color: #6a4f30;
  font-size: 13px;
}

.env-missing code {
  font-size: 12px;
  font-weight: 700;
  color: #20344a;
}

.launch-item {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: #fff;
  display: grid;
  gap: 8px;
}

.launch-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.launch-item-head strong {
  font-size: 16px;
}

.launch-status {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.launch-item p {
  margin: 0;
  color: #445973;
  font-size: 13px;
}

.launch-item ul {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 4px;
  color: #3f5269;
  font-size: 13px;
}

.st-done { background: #edf9f0; color: #1f6f41; border-color: #bfe0c9; }
.st-partial { background: #fff7eb; color: #80511f; border-color: #edd7bb; }
.st-todo { background: #fff1f1; color: #8a2a2a; border-color: #efcaca; }

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

.orders-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.orders-pagination-info {
  color: #4b6078;
  font-size: 13px;
  font-weight: 600;
}

.orders-pagination-actions {
  display: flex;
  gap: 8px;
}

.order-card {
  padding: 16px;
}

.order-card-risk {
  border-color: #e6d2a8;
  box-shadow: 0 8px 22px rgba(146, 98, 0, 0.08);
}

.order-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.order-head-statuses {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.attention-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #f1d49a;
  background: #fff9ec;
  color: #966100;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .01em;
}

.sla-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 800;
}

.sla-risk {
  background: #fff1f1;
  color: #8a2a2a;
  border-color: #efcaca;
}

.sla-warn {
  background: #fff7eb;
  color: #80511f;
  border-color: #edd7bb;
}

.sla-ok {
  background: #edf9f0;
  color: #1f6f41;
  border-color: #bfe0c9;
}

.sla-done {
  background: #edf4fb;
  color: #2a5678;
  border-color: #c7d9ec;
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

.priority-pill {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.priority-high { background: #fff1f1; color: #8a2a2a; border-color: #efcaca; }
.priority-medium { background: #fff7eb; color: #80511f; border-color: #edd7bb; }
.priority-normal { background: #edf4fb; color: #2a5678; border-color: #c7d9ec; }

.payment-pill {
  margin-left: 6px;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.payment-method-text {
  margin-left: 6px;
  color: var(--muted);
}

.p-pending { background: #fff7eb; color: #80511f; border-color: #edd7bb; }
.p-paid { background: #edf9f0; color: #1f6f41; border-color: #bfe0c9; }
.p-cod { background: #eef3ff; color: #2e4f90; border-color: #cad8f4; }

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

.order-quick-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.order-quick-actions .btn-alt {
  min-height: 34px;
  padding-inline: 12px;
}

.order-quick-actions .btn-alt.danger {
  border-color: #e8c8c8;
  color: #8a2a2a;
  background: #fff6f6;
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
  position: sticky;
  top: 88px;
  z-index: 5;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.95);
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

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kpi-item.kpi-wide {
    grid-column: span 2;
  }

  .orders-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .orders-search {
    min-width: 0;
  }

  .ai-columns {
    grid-template-columns: 1fr;
  }

  .inventory-grid {
    grid-template-columns: 1fr;
  }

  .launch-grid {
    grid-template-columns: 1fr;
  }

  .env-grid {
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

  .bulk-status-card {
    position: static;
    top: auto;
  }

  .order-head-statuses {
    align-items: flex-start;
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
  .order-quick-actions .btn-alt,
  .update-row .btn-alt,
  .bulk-row .btn-main,
  .csv-import-actions .btn-alt,
  .csv-import-actions .btn-main {
    width: 100%;
  }
}
</style>
