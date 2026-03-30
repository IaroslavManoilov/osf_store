<template>
  <header class="header-wrap">
    <div class="site-container">
      <div class="header-box">
        <NuxtLink :to="localePath('/')" class="brand">
          <span class="brand-mark">
            <img src="/logo-mark.png" alt="ONE STYLE FOREVER" />
          </span>

          <span class="brand-text">
            <strong>ONE_STYLE</strong>
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
          <NuxtLink :to="localePath('/wishlist')" class="icon-btn wishlist-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 21s-6.5-4.35-8.5-8.02C1.94 9.98 3.58 6 7.45 6c1.93 0 3.17 1.02 4.05 2.3C12.38 7.02 13.62 6 15.55 6c3.87 0 5.51 3.98 3.95 6.98C18.5 16.65 12 21 12 21Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>

            <span v-if="shopStore.wishlistCount" class="icon-count">
              {{ shopStore.wishlistCount }}
            </span>
          </NuxtLink>

          <div class="lang-switch">
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

            <span>{{ $t('nav.cart') }} • {{ shopStore.cartCount }}</span>
          </NuxtLink>

          <button
            type="button"
            class="burger-btn"
            :class="{ active: mobileMenuOpen }"
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
              Wishlist • {{ shopStore.wishlistCount }}
            </NuxtLink>

            <NuxtLink
              :to="localePath('/cart')"
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              {{ $t('nav.cart') }} • {{ shopStore.cartCount }}
            </NuxtLink>
          </nav>

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
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type LocaleCode = 'ru' | 'ro' | 'en'

const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const shopStore = useShopStore()
const mobileMenuOpen = ref(false)

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

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  }
)
</script>

<style scoped>
.header-wrap {
  padding: 14px 0 0;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(243, 246, 243, 0.82);
  backdrop-filter: blur(10px);
}

.header-box {
  min-height: 76px;
  padding: 12px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: inherit;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #f8faf8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-mark img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.brand-text {
  display: grid;
  line-height: 1;
}

.brand-text strong {
  font-size: 18px;
  letter-spacing: -0.03em;
}

.brand-text span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 14px;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-link,
.lang-link {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--text);
  transition: 0.2s ease;
}

.nav-link.active,
.lang-link.active {
  background: #f1f7f2;
  border-color: #bfd5c4;
  color: #2f6c47;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  position: relative;
  flex-shrink: 0;
}

.icon-btn svg {
  width: 20px;
  height: 20px;
}

.icon-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lang-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-link {
  min-width: 42px;
  padding: 0 14px;
}

.cart-btn {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  box-shadow: 0 14px 28px rgba(86, 151, 101, 0.2);
}

.cart-btn svg {
  width: 19px;
  height: 19px;
}

.burger-btn {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.burger-btn span {
  width: 18px;
  height: 2px;
  background: var(--text);
  border-radius: 999px;
  transition: 0.2s ease;
}

.burger-btn.active span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.burger-btn.active span:nth-child(2) {
  opacity: 0;
}

.burger-btn.active span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.mobile-menu {
  margin-top: 12px;
  padding: 18px;
}

.mobile-nav {
  display: grid;
  gap: 10px;
}

.mobile-nav-link {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  font-weight: 800;
  color: var(--text);
}

.mobile-nav-link.active {
  background: #f1f7f2;
  border-color: #bfd5c4;
  color: #2f6c47;
}

.mobile-lang-switch {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1100px) {
  .desktop-nav {
    display: none;
  }

  .burger-btn {
    display: inline-flex;
  }
}

@media (max-width: 820px) {
  .header-box {
    min-height: auto;
    border-radius: 34px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .brand {
    width: 100%;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .cart-btn {
    flex: 1 1 auto;
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .header-wrap {
    padding-top: 10px;
  }

  .header-box {
    padding: 12px;
  }

  .brand-text strong {
    font-size: 16px;
  }

  .brand-text span {
    font-size: 13px;
  }

  .lang-switch {
    order: 2;
  }

  .wishlist-btn {
    order: 1;
  }

  .cart-btn {
    order: 3;
  }

  .burger-btn {
    order: 4;
  }
}
</style>