<template>
  <button
    v-show="visible"
    type="button"
    class="scroll-top-btn"
    :class="{ 'with-sticky': hasStickyBottom }"
    :aria-label="label"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const route = useRoute()
const visible = ref(false)
let scrollRaf = 0

const label = computed(() => {
  const locale = String(route.params?.locale || '').toLowerCase()
  if (locale === 'ro') return 'Sus'
  if (locale === 'en') return 'Back to top'
  return 'Наверх'
})

const hasStickyBottom = computed(() => {
  const path = route.path || ''
  return path.includes('/catalog') || path.includes('/checkout') || path.includes('/product/')
})

const updateVisibility = () => {
  const threshold = Math.max(280, Math.floor(window.innerHeight * 0.5))
  visible.value = window.scrollY > threshold
}

const onScroll = () => {
  if (scrollRaf) return
  scrollRaf = window.requestAnimationFrame(() => {
    updateVisibility()
    scrollRaf = 0
  })
}

const onResize = () => {
  updateVisibility()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (!import.meta.client) return
  updateVisibility()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
})

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
.scroll-top-btn {
  position: fixed;
  right: 16px;
  bottom: 18px;
  z-index: 110;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid #c3d6c8;
  background: linear-gradient(135deg, #216640, #2b7b4f);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 24px rgba(18, 43, 28, 0.3);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.scroll-top-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(18, 43, 28, 0.34);
}

.scroll-top-btn:active {
  transform: translateY(0);
}

@media (max-width: 980px) {
  .scroll-top-btn {
    right: 12px;
    width: 40px;
    height: 40px;
    font-size: 20px;
    bottom: calc(12px + env(safe-area-inset-bottom));
  }

  .scroll-top-btn.with-sticky {
    bottom: calc(88px + env(safe-area-inset-bottom));
  }
}
</style>
