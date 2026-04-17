<template>
  <div class="page-shell">
    <AppHeader class="app-header-fixed" :class="{ 'mobile-hidden': mobileHeaderHidden }" />
    <main class="page-main">
      <slot />
    </main>
    <ScrollTopButton />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const route = useRoute()
const mobileHeaderHidden = ref(false)
const lastScrollY = ref(0)
let scrollRaf = 0

const isMobileViewport = () =>
  import.meta.client && window.matchMedia('(max-width: 980px)').matches

const updateHeaderVisibility = () => {
  const currentY = window.scrollY || 0
  const delta = currentY - lastScrollY.value

  if (!isMobileViewport()) {
    mobileHeaderHidden.value = false
    lastScrollY.value = currentY
    return
  }

  if (currentY <= 24) {
    mobileHeaderHidden.value = false
    lastScrollY.value = currentY
    return
  }

  if (delta > 6 && currentY > 90) {
    mobileHeaderHidden.value = true
  } else if (delta < -4) {
    mobileHeaderHidden.value = false
  }

  lastScrollY.value = currentY
}

const onScroll = () => {
  if (scrollRaf) return
  scrollRaf = window.requestAnimationFrame(() => {
    updateHeaderVisibility()
    scrollRaf = 0
  })
}

const onResize = () => {
  if (!isMobileViewport()) mobileHeaderHidden.value = false
  lastScrollY.value = window.scrollY || 0
}

onMounted(() => {
  if (!import.meta.client) return
  lastScrollY.value = window.scrollY || 0
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
})

watch(
  () => route.fullPath,
  () => {
    if (!import.meta.client) return
    mobileHeaderHidden.value = false
    lastScrollY.value = window.scrollY || 0
  }
)

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (scrollRaf) {
    window.cancelAnimationFrame(scrollRaf)
    scrollRaf = 0
  }
})
</script>

<style scoped>
.app-header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
}

.page-main {
  padding-top: 118px;
}

@media (max-width: 980px) {
  .app-header-fixed {
    transition: transform 0.24s ease, opacity 0.2s ease;
    will-change: transform;
  }

  .app-header-fixed.mobile-hidden {
    transform: translateY(calc(-100% - 8px));
    opacity: 0.98;
    pointer-events: none;
  }

  .page-main {
    padding-top: 108px;
  }
}

@media (max-width: 680px) {
  .page-main {
    padding-top: 86px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-header-fixed {
    transition: none;
  }
}
</style>
