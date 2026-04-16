<template>
  <header class="header-wrap">
    <div class="header-topline">
      <div class="site-container topline-inner">
        <span>{{ $t('nav.topline') }}</span>
        <NuxtLink :to="localePath('/catalog')" class="topline-link">
          {{ $t('nav.explore') }}
        </NuxtLink>
      </div>
    </div>

      <div ref="headerRootRef" class="site-container">
      <div class="header-box">
        <NuxtLink :to="localePath('/')" class="brand" @click="closeMobileMenu">
          <span class="brand-mark">
            <OptimizedImage
              src="/logo-mark.png"
              alt="ONE STYLE FOREVER"
              loading="eager"
              fetchpriority="high"
              width="160"
              height="160"
            />
          </span>

          <span class="brand-text">
            <strong class="brand-full">ONE STYLE</strong>
            <span class="brand-forever">FOREVER</span>
            <strong class="brand-mobile">OSF</strong>
          </span>
        </NuxtLink>

        <nav class="desktop-nav">
          <NuxtLink
            :to="localePath('/')"
            class="nav-link"
            :class="{ active: isActiveRoute('/') }"
          >
            {{ $t('nav.home') }}
          </NuxtLink>

          <NuxtLink
            :to="localePath('/catalog')"
            class="nav-link"
            :class="{ active: isActiveRoute('/catalog') }"
          >
            {{ $t('nav.catalog') }}
          </NuxtLink>

          <NuxtLink
            :to="localePath('/about')"
            class="nav-link"
            :class="{ active: isActiveRoute('/about') }"
          >
            {{ $t('nav.about') }}
          </NuxtLink>

          <NuxtLink
            :to="localePath('/orders')"
            class="nav-link"
            :class="{ active: isActiveRoute('/orders') }"
          >
            {{ $t('nav.orders') }}
          </NuxtLink>
        </nav>

        <div class="header-actions">
          <button
            type="button"
            class="notify-btn"
            :class="{ active: notificationsEnabled }"
            :aria-label="notifyLabel"
            @click="toggleNotifications"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3a5 5 0 0 0-5 5v2.8c0 .8-.32 1.56-.88 2.12L5 14.02V16h14v-1.98l-1.12-1.1A3 3 0 0 1 17 10.8V8a5 5 0 0 0-5-5Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
              <path
                d="M9.5 18a2.5 2.5 0 0 0 5 0"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div class="lang-switch" :aria-label="$t('nav.language')">
            <NuxtLink
              v-for="item in localeItems"
              :key="item.code"
              :to="switchLocalePath(item.code)"
              class="lang-link"
              :class="{ active: locale === item.code }"
            >
              {{ item.label }}
            </NuxtLink>
          </div>

          <NuxtLink :to="localePath('/wishlist')" class="icon-btn" :aria-label="$t('nav.wishlist')">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 21s-6.5-4.35-8.5-8.02C1.94 9.98 3.58 6 7.45 6c1.93 0 3.17 1.02 4.05 2.3C12.38 7.02 13.62 6 15.55 6c3.87 0 5.51 3.98 3.95 6.98C18.5 16.65 12 21 12 21Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="shopStore.wishlistCount" class="icon-count">{{ shopStore.wishlistCount }}</span>
          </NuxtLink>

          <NuxtLink :to="localePath('/cart')" class="cart-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 4h2l2.1 10.2a1 1 0 0 0 .98.8h8.95a1 1 0 0 0 .97-.76L21 7H7"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="10" cy="19" r="1.5" fill="currentColor" />
              <circle cx="18" cy="19" r="1.5" fill="currentColor" />
            </svg>
            <span class="cart-text">{{ $t('nav.cart') }} · {{ shopStore.cartCount }}</span>
            <span v-if="shopStore.cartCount" class="icon-count cart-count">{{ shopStore.cartCount }}</span>
          </NuxtLink>

          <button
            type="button"
            class="burger-btn"
            :class="{ active: mobileMenuOpen }"
            :aria-label="$t('nav.menu')"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="mobile-menu surface-card">
          <nav class="mobile-nav">
            <NuxtLink
              :to="localePath('/')"
              class="mobile-nav-link"
              :class="{ active: isActiveRoute('/') }"
              @click="closeMobileMenu"
            >
              {{ $t('nav.home') }}
            </NuxtLink>

            <NuxtLink
              :to="localePath('/catalog')"
              class="mobile-nav-link"
              :class="{ active: isActiveRoute('/catalog') }"
              @click="closeMobileMenu"
            >
              {{ $t('nav.catalog') }}
            </NuxtLink>

            <NuxtLink
              :to="localePath('/about')"
              class="mobile-nav-link"
              :class="{ active: isActiveRoute('/about') }"
              @click="closeMobileMenu"
            >
              {{ $t('nav.about') }}
            </NuxtLink>

            <NuxtLink
              :to="localePath('/orders')"
              class="mobile-nav-link"
              :class="{ active: isActiveRoute('/orders') }"
              @click="closeMobileMenu"
            >
              {{ $t('nav.orders') }}
            </NuxtLink>

            <NuxtLink
              :to="localePath('/wishlist')"
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              {{ $t('nav.wishlist') }} · {{ shopStore.wishlistCount }}
            </NuxtLink>

            <NuxtLink
              :to="localePath('/cart')"
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              {{ $t('nav.cart') }} · {{ shopStore.cartCount }}
            </NuxtLink>
          </nav>

          <div class="mobile-menu-bottom">
            <NuxtLink :to="localePath('/catalog')" class="btn-main mobile-cta" @click="closeMobileMenu">
              {{ $t('nav.explore') }}
            </NuxtLink>

            <div class="mobile-lang-switch">
              <NuxtLink
                v-for="item in localeItems"
                :key="`mobile-${item.code}`"
                :to="switchLocalePath(item.code)"
                class="lang-link"
                :class="{ active: locale === item.code }"
                @click="closeMobileMenu"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getProducts } from '~/data/products'

type LocaleCode = 'ru' | 'ro' | 'en'

const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const shopStore = useShopStore()
const uiStore = useUiStore()
const mobileMenuOpen = ref(false)
const headerRootRef = ref<HTMLElement | null>(null)
const notificationsEnabled = ref(false)
const notificationsStorageKey = 'osf_stock_notifications_v1'
const marketingSnapshotKey = 'osf_marketing_snapshot_v1'
const marketingSeenKey = 'osf_marketing_alerts_seen_v1'
const cartLastActivityKey = 'osf_cart_last_activity_v1'
const cartReminderAtKey = 'osf_cart_reminder_at_v1'
let marketingTimer: ReturnType<typeof setInterval> | null = null

const { locale } = useI18n()

const localeItems = computed((): { code: LocaleCode; label: string }[] => [
  { code: 'ru', label: 'RU' },
  { code: 'ro', label: 'RO' },
  { code: 'en', label: 'EN' }
])

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/'

const isActiveRoute = (path: string) => {
  const current = normalizePath(route.path)
  const target = normalizePath(localePath(path))
  return current === target
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleOutsideTap = (event: Event) => {
  if (!mobileMenuOpen.value) return
  const targetNode = event.target as Node | null
  const root = headerRootRef.value
  if (!targetNode || !root) return
  if (!root.contains(targetNode)) {
    closeMobileMenu()
  }
}

const notifyLabel = computed(() => {
  if (locale.value === 'ro') return 'Notificări despre stoc'
  if (locale.value === 'en') return 'Stock notifications'
  return 'Уведомления о поступлении'
})

const toggleNotifications = async () => {
  if (!import.meta.client) return

  let enabled = false

  if ('Notification' in window) {
    if (window.Notification.permission === 'granted') {
      enabled = true
    } else if (window.Notification.permission !== 'denied') {
      const permission = await window.Notification.requestPermission()
      enabled = permission === 'granted'
    }
  }

  if (!enabled) {
    if (locale.value === 'ro') uiStore.showToast('Notificările sunt oprite. Le poți activa mai târziu.', 'info')
    else if (locale.value === 'en') uiStore.showToast('Notifications are off. You can enable them later.', 'info')
    else uiStore.showToast('Уведомления выключены. Включишь позже, если захочешь.', 'info')
    return
  }

  notificationsEnabled.value = true
  try {
    window.localStorage.setItem(notificationsStorageKey, 'enabled')
  } catch {
    // Ignore storage write failures.
  }

  if (locale.value === 'ro') uiStore.showToast('Notificările au fost activate.', 'success')
  else if (locale.value === 'en') uiStore.showToast('Notifications are enabled.', 'success')
  else uiStore.showToast('Уведомления включены.', 'success')
}

const readJsonObject = <T extends Record<string, any>>(key: string): T => {
  if (!import.meta.client) return {} as T
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {} as T
    return parsed as T
  } catch {
    return {} as T
  }
}

const writeJsonObject = (key: string, value: Record<string, any>) => {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage write failures.
  }
}

const marketingMessage = (kind: 'price-drop' | 'back-in-stock', title: string, price = 0) => {
  if (kind === 'price-drop') {
    if (locale.value === 'ro') return `Preț redus: ${title} · ${price} MDL`
    if (locale.value === 'en') return `Price drop: ${title} · ${price} MDL`
    return `Цена снижена: ${title} · ${price} MDL`
  }
  if (locale.value === 'ro') return `Din nou în stoc: ${title}`
  if (locale.value === 'en') return `Back in stock: ${title}`
  return `Снова в наличии: ${title}`
}

const remindAbandonedCart = () => {
  if (!import.meta.client || !notificationsEnabled.value) return
  if (!shopStore.cartCount) return

  const now = Date.now()
  const lastActivity = Number(window.localStorage.getItem(cartLastActivityKey) || now)
  const lastReminder = Number(window.localStorage.getItem(cartReminderAtKey) || 0)
  const idleMs = now - lastActivity
  const canRemind = now - lastReminder > 12 * 60 * 60 * 1000

  if (idleMs < 45 * 60 * 1000 || !canRemind) return

  if (locale.value === 'ro') uiStore.showToast('Ai produse în coș. Finalizează comanda cât timp mărimea e în stoc.', 'info')
  else if (locale.value === 'en') uiStore.showToast('You still have items in cart. Complete the order while your size is in stock.', 'info')
  else uiStore.showToast('У тебя есть товары в корзине. Оформи заказ, пока размер в наличии.', 'info')

  window.localStorage.setItem(cartReminderAtKey, String(now))
}

const runMarketingSignals = async () => {
  if (!import.meta.client || !notificationsEnabled.value) return
  const trackedIds = Array.from(new Set([
    ...shopStore.wishlist.map((item) => item.id),
    ...shopStore.cart.map((item) => item.id)
  ])).filter(Boolean)

  if (!trackedIds.length) return

  try {
    const [overridesResp, inventoryResp] = await Promise.all([
      $fetch<{ success: boolean; overrides?: Record<string, { price?: number | null }> }>('/api/catalog-overrides'),
      $fetch<{ success: boolean; totals?: Record<string, number> }>('/api/inventory')
    ])

    const base = getProducts(locale.value)
    const baseById = new Map(base.map((item) => [item.id, item]))
    const overrides = overridesResp?.overrides || {}
    const totals = inventoryResp?.totals || {}

    const previous = readJsonObject<Record<string, { price: number; stock: number }>>(marketingSnapshotKey)
    const seen = readJsonObject<Record<string, number>>(marketingSeenKey)
    const nextSnapshot: Record<string, { price: number; stock: number }> = { ...previous }

    for (const id of trackedIds) {
      const product = baseById.get(id)
      if (!product) continue
      const overridePrice = Number(overrides?.[id]?.price)
      const currentPrice = Number.isFinite(overridePrice) && overridePrice > 0 ? Math.round(overridePrice) : product.price
      const currentStock = Math.max(0, Number(totals[id] || 0))
      const prev = previous[id]

      if (prev && currentPrice < prev.price) {
        const key = `${id}:price:${currentPrice}`
        if (!seen[key]) {
          uiStore.showToast(marketingMessage('price-drop', product.title, currentPrice), 'success')
          seen[key] = Date.now()
        }
      }

      if (prev && prev.stock <= 0 && currentStock > 0) {
        const key = `${id}:restock:${currentStock}`
        if (!seen[key]) {
          uiStore.showToast(marketingMessage('back-in-stock', product.title), 'success')
          seen[key] = Date.now()
        }
      }

      nextSnapshot[id] = {
        price: currentPrice,
        stock: currentStock
      }
    }

    const trimmedSeen = Object.fromEntries(Object.entries(seen).slice(-220))
    writeJsonObject(marketingSnapshotKey, nextSnapshot)
    writeJsonObject(marketingSeenKey, trimmedSeen)
  } catch {
    // Ignore background signal errors.
  }
}

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  }
)

onMounted(() => {
  if (!import.meta.client) return

  try {
    notificationsEnabled.value = window.localStorage.getItem(notificationsStorageKey) === 'enabled'
  } catch {
    notificationsEnabled.value = false
  }

  try {
    window.localStorage.setItem(cartLastActivityKey, String(Date.now()))
  } catch {
    // Ignore localStorage write failures.
  }

  window.addEventListener('pointerdown', handleOutsideTap)
  void runMarketingSignals()
  remindAbandonedCart()
  marketingTimer = setInterval(() => {
    void runMarketingSignals()
    remindAbandonedCart()
  }, 90_000)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('pointerdown', handleOutsideTap)
  if (marketingTimer) {
    clearInterval(marketingTimer)
    marketingTimer = null
  }
})

watch(
  () => `${shopStore.cartCount}:${shopStore.cartTotal}`,
  () => {
    if (!import.meta.client) return
    try {
      window.localStorage.setItem(cartLastActivityKey, String(Date.now()))
    } catch {
      // Ignore localStorage write failures.
    }
    remindAbandonedCart()
  }
)

watch(
  () => `${shopStore.wishlist.map((item) => item.id).sort().join('|')}|${shopStore.cart.map((item) => item.id).sort().join('|')}`,
  () => {
    void runMarketingSignals()
  }
)
</script>

<style scoped>
.header-wrap {
  position: relative;
  z-index: 60;
  backdrop-filter: blur(10px);
}

.header-topline {
  border-bottom: 1px solid #dbe3d7;
  background: linear-gradient(90deg, #1f5f3c, #2b7b4f);
  color: #e9f8ee;
}

.topline-inner {
  min-height: 36px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
}

.topline-inner span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topline-link {
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-box {
  margin-top: 10px;
  min-height: 68px;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, #fff 90%, #eef5ee);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  position: relative;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-mark {
  width: 58px;
  height: 58px;
  border-radius: 999px;
  border: 1px solid #c8d6c8;
  background: #ffffff;
  display: grid;
  place-items: center;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.9);
}

.brand-mark img {
  width: 46px;
  height: 46px;
  object-fit: contain;
  object-position: center;
  filter: contrast(1.15) saturate(1.1);
}

.brand-text {
  display: grid;
  line-height: 0.95;
}

.brand-text strong {
  font-size: 16px;
  letter-spacing: 0.08em;
}

.brand-forever {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.24em;
  color: var(--muted);
}

.brand-mobile {
  display: none;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 981px) {
  .desktop-nav {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

.nav-link {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 800;
  color: #334155;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text);
  background: #edf4ec;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  min-width: 0;
}

.icon-btn,
.cart-btn,
.notify-btn {
  min-height: 42px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
}

.icon-btn {
  width: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #334155;
  position: relative;
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

.notify-btn {
  width: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #334155;
}

.notify-btn svg {
  width: 20px;
  height: 20px;
}

.notify-btn.active {
  color: #1f6b43;
  border-color: #b8d8c3;
  background: #f2fbf5;
}

.icon-count {
  min-width: 19px;
  height: 19px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -6px;
  right: -4px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: var(--primary);
}

.lang-switch,
.mobile-lang-switch {
  display: flex;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 999px;
  padding: 3px;
}

.lang-link {
  min-width: 34px;
  min-height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #5f6d82;
}

.lang-link.active {
  background: #ecf3ea;
  color: #18301f;
}

.cart-btn {
  position: relative;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
}

.cart-count {
  display: none;
}

.cart-btn svg {
  width: 19px;
  height: 19px;
}

.burger-btn {
  display: none;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
}

.burger-btn span {
  width: 16px;
  height: 2px;
  display: block;
  background: #2f3c4f;
  margin: 0;
  border-radius: 999px;
  transition: 0.25s ease;
}

.mobile-menu {
  margin-top: 12px;
  padding: 16px;
  border-radius: 24px;
}

.mobile-nav {
  display: grid;
  gap: 8px;
}

.mobile-nav-link {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  font-size: 15px;
  font-weight: 700;
  color: #334155;
}

.mobile-nav-link.active,
.mobile-nav-link:hover {
  background: #edf4ec;
  color: #132e1f;
}

.mobile-menu-bottom {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.mobile-cta {
  width: 100%;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 980px) {
  .desktop-nav {
    display: none;
  }

  .notify-btn,
  .lang-switch,
  .icon-btn,
  .cart-btn {
    display: inline-flex;
  }

  .cart-btn {
    width: 42px;
    min-height: 42px;
    padding: 0;
    justify-content: center;
  }

  .cart-text {
    display: none;
  }

  .cart-count {
    display: inline-flex;
  }

  .burger-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
}

@media (min-width: 980px) and (max-width: 1100px) {
  .header-box {
    min-height: 62px;
    padding: 8px 12px;
    gap: 10px;
  }

  .brand-mark {
    width: 50px;
    height: 50px;
  }

  .brand-mark img {
    width: 38px;
    height: 38px;
  }

  .brand-text strong {
    font-size: 14px;
  }

  .brand-forever {
    font-size: 10px;
    letter-spacing: 0.18em;
  }

  .desktop-nav {
    gap: 6px;
  }

  .nav-link {
    min-height: 38px;
    padding: 0 12px;
    font-size: 13px;
  }

  .header-actions {
    gap: 6px;
  }

  .icon-btn,
  .notify-btn,
  .cart-btn {
    min-height: 38px;
  }

  .icon-btn,
  .notify-btn {
    width: 38px;
  }

  .lang-link {
    min-width: 30px;
    min-height: 30px;
  }
}

@media (max-width: 680px) {
  .header-box {
    margin-top: 6px;
    border-radius: 18px;
    padding: 6px;
    min-height: 56px;
    gap: 6px;
  }

  .brand {
    gap: 8px;
  }

  .brand-mark {
    width: 44px;
    height: 44px;
  }

  .brand-mark img {
    width: 34px;
    height: 34px;
  }

  .brand-full {
    display: none;
  }

  .brand-forever {
    display: none;
  }

  .brand-mobile {
    display: block;
    font-size: 13px;
    letter-spacing: 0.08em;
  }

  .header-actions {
    gap: 6px;
  }

  .icon-btn,
  .notify-btn,
  .cart-btn,
  .burger-btn {
    width: 34px;
    height: 34px;
    min-height: 34px;
  }

  .lang-switch {
    padding: 2px;
  }

  .lang-link {
    min-width: 28px;
    min-height: 28px;
    font-size: 10px;
  }

  .topline-inner {
    min-height: 30px;
    font-size: 11px;
  }
}

@media (max-width: 980px) {
  .header-box {
    padding: 8px 10px;
    gap: 10px;
  }

  .brand {
    gap: 8px;
  }

  .brand-mark {
    width: 54px;
    height: 54px;
  }

  .brand-mark img {
    width: 42px;
    height: 42px;
  }

  .brand-full,
  .brand-mobile {
    font-size: 14px;
    letter-spacing: 0.06em;
  }

  .header-actions {
    gap: 6px;
  }

  .icon-btn,
  .notify-btn,
  .cart-btn,
  .burger-btn {
    width: 40px;
    height: 40px;
    min-height: 40px;
  }

  .lang-switch {
    padding: 2px;
  }

  .lang-link {
    min-width: 32px;
    min-height: 32px;
  }
}

@media (max-width: 680px) {
  .header-box {
    margin-top: 4px;
    border-radius: 16px;
    padding: 5px;
    min-height: 52px;
    gap: 5px;
  }

  .brand-mark {
    width: 40px;
    height: 40px;
  }

  .brand-mark img {
    width: 30px;
    height: 30px;
  }

  .icon-btn,
  .notify-btn,
  .cart-btn,
  .burger-btn {
    width: 34px;
    height: 34px;
    min-height: 34px;
  }

  .burger-btn {
    border-color: #bccbbd;
    background: #ffffff;
  }

  .burger-btn span {
    width: 18px;
    height: 2.4px;
    background: #1b2a3e;
  }

  .lang-link {
    min-width: 26px;
    min-height: 26px;
    font-size: 10px;
  }

  .brand-mobile {
    font-size: 12px;
  }

  .topline-inner {
    min-height: 28px;
    font-size: 10px;
  }
}

/* Final mobile/desktop stability overrides */
.header-wrap {
  position: sticky;
  top: 0;
  z-index: 120;
}

.header-box,
.header-actions,
.brand,
.brand-text {
  min-width: 0;
}

.brand-text strong {
  white-space: nowrap;
}

.burger-btn {
  gap: 0;
}

.burger-btn span {
  margin: 2px 0;
}

.burger-btn.active span:nth-child(1) {
  transform: translateY(4px) rotate(45deg);
}

.burger-btn.active span:nth-child(2) {
  opacity: 0;
}

.burger-btn.active span:nth-child(3) {
  transform: translateY(-4px) rotate(-45deg);
}

@media (max-width: 680px) {
  .header-topline {
    position: relative;
    z-index: 2;
  }

  .header-box {
    margin-top: 4px;
    border-radius: 16px;
    padding: 4px 6px;
    min-height: 50px;
    gap: 4px;
  }

  .brand {
    gap: 6px;
    flex: 1 1 auto;
  }

  .brand-mark {
    width: 38px;
    height: 38px;
  }

  .brand-mark img {
    width: 27px;
    height: 27px;
  }

  .brand-mobile {
    font-size: 10px;
    letter-spacing: 0.04em;
  }

  .header-actions {
    gap: 4px;
    margin-left: 0;
  }

  .icon-btn,
  .notify-btn,
  .cart-btn,
  .burger-btn {
    width: 32px;
    height: 32px;
    min-height: 32px;
  }

  .icon-btn svg,
  .notify-btn svg,
  .cart-btn svg {
    width: 17px;
    height: 17px;
  }

  .lang-switch {
    padding: 1px;
  }

  .lang-link {
    min-width: 24px;
    min-height: 24px;
    font-size: 9px;
  }

  .topline-inner {
    min-height: 28px;
    font-size: 10px;
  }

  .topline-link {
    max-width: 42%;
  }
}

@media (max-width: 420px) {
  .notify-btn,
  .icon-btn {
    display: none;
  }
}
</style>
