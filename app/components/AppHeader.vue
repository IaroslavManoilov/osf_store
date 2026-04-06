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

    <div class="site-container">
      <div class="header-box">
        <NuxtLink :to="localePath('/')" class="brand" @click="closeMobileMenu">
          <span class="brand-mark">
            <img src="/logo-mark.png" alt="ONE STYLE FOREVER" />
          </span>

          <span class="brand-text">
            <strong>ONE STYLE</strong>
            <span>FOREVER</span>
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
import { computed, onMounted, ref, watch } from 'vue'

type LocaleCode = 'ru' | 'ro' | 'en'

const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const shopStore = useShopStore()
const uiStore = useUiStore()
const mobileMenuOpen = ref(false)
const notificationsEnabled = ref(false)
const notificationsStorageKey = 'osf_stock_notifications_v1'

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
})
</script>

<style scoped>
.header-wrap {
  position: sticky;
  top: 0;
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
}

.topline-link {
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.55);
}

.header-box {
  margin-top: 12px;
  min-height: 74px;
  padding: 12px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: color-mix(in srgb, #fff 90%, #eef5ee);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-mark {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: 1px solid #c8d6c8;
  background: #ffffff;
  display: grid;
  place-items: center;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.9);
}

.brand-mark img {
  width: 52px;
  height: 52px;
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

.brand-text span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.24em;
  color: var(--muted);
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 8px;
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
  gap: 10px;
}

.icon-btn,
.cart-btn,
.notify-btn {
  min-height: 44px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
}

.icon-btn {
  width: 44px;
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
  width: 44px;
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
  min-width: 36px;
  min-height: 36px;
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
  padding: 0 16px;
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
  padding: 10px;
  cursor: pointer;
}

.burger-btn span {
  width: 100%;
  height: 2px;
  display: block;
  background: #2f3c4f;
  margin: 4px 0;
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

@media (max-width: 1160px) {
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
    width: 44px;
    min-height: 44px;
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
    display: inline-block;
  }
}

@media (max-width: 680px) {
  .header-box {
    border-radius: 22px;
    padding: 10px;
    gap: 8px;
  }

  .brand {
    gap: 8px;
  }

  .brand-mark {
    width: 56px;
    height: 56px;
  }

  .brand-mark img {
    width: 46px;
    height: 46px;
  }

  .brand-text strong {
    font-size: 14px;
    letter-spacing: 0.05em;
  }

  .brand-text span {
    display: none;
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
    min-width: 30px;
    min-height: 30px;
    font-size: 11px;
  }

  .topline-inner {
    min-height: 34px;
    font-size: 12px;
  }
}
</style>
