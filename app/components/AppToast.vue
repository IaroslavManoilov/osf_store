<template>
  <div class="toast-stack">
    <transition-group name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-${toast.type}`"
      >
        <span>{{ toast.message }}</span>

        <button
          type="button"
          class="toast-close"
          @click="uiStore.removeToast(toast.id)"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
const uiStore = useUiStore()
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 2000;
  display: grid;
  gap: 12px;
  width: min(360px, calc(100vw - 24px));
}

.toast-item {
  min-height: 58px;
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  font-weight: 700;
}

.toast-success {
  border-color: #bfd5c4;
  background: #f4fbf6;
  color: #2f6c47;
}

.toast-error {
  border-color: #efc9c9;
  background: #fff6f6;
  color: #9a3d3d;
}

.toast-info {
  border-color: #d8e2f3;
  background: #f6f9ff;
  color: #38527a;
}

.toast-close {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .toast-stack {
    top: 12px;
    right: 12px;
    left: 12px;
    width: auto;
  }
}
</style>