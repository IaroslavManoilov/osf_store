import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export type ToastItem = {
  id: number
  message: string
  type: ToastType
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as ToastItem[]
  }),

  actions: {
    showToast(message: string, type: ToastType = 'success') {
      const id = Date.now() + Math.floor(Math.random() * 1000)

      this.toasts.push({
        id,
        message,
        type
      })

      setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id)
      }, 2600)
    },

    removeToast(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    }
  }
})