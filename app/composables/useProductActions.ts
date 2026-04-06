import { ref } from 'vue'
import type { ProductItem } from '~/stores/shop'
import { useAnalytics } from '~/composables/useAnalytics'

export const useProductActions = () => {
  const shopStore = useShopStore()
  const uiStore = useUiStore()
  const { track } = useAnalytics()
  const selectedSizes = ref<Record<string, string>>({})
  const rememberedSize = ref('')
  const sizeStorageKey = 'osf_last_size_global_v1'
  let rememberLoaded = false

  const ensureRememberedSize = () => {
    if (!import.meta.client || rememberLoaded) return
    rememberLoaded = true
    try {
      const stored = window.localStorage.getItem(sizeStorageKey)
      rememberedSize.value = typeof stored === 'string' ? stored : ''
    } catch {
      rememberedSize.value = ''
    }
  }

  const persistRememberedSize = (size: string) => {
    rememberedSize.value = size
    if (!import.meta.client) return
    try {
      window.localStorage.setItem(sizeStorageKey, size)
    } catch {
      // Ignore storage write failures.
    }
  }

  const selectSize = (productId: string, size: string) => {
    selectedSizes.value[productId] = size
    persistRememberedSize(size)
  }

  const getSelectedSize = (productId: string) => {
    return selectedSizes.value[productId] || ''
  }

  const getPreferredSize = (product: ProductItem) => {
    const activeSize = getSelectedSize(product.id)
    if (activeSize && product.sizes.includes(activeSize)) return activeSize

    ensureRememberedSize()
    if (rememberedSize.value && product.sizes.includes(rememberedSize.value)) {
      return rememberedSize.value
    }

    return ''
  }

  const addProductWithSize = (
    product: ProductItem,
    messages?: {
      chooseSize?: string
      added?: string
    },
    options?: {
      autoSelectLastSize?: boolean
      source?: string
    }
  ) => {
    let selectedSize = getSelectedSize(product.id)

    if (!selectedSize && options?.autoSelectLastSize) {
      selectedSize = getPreferredSize(product)
      if (selectedSize) {
        selectedSizes.value[product.id] = selectedSize
      }
    }

    if (!selectedSize) {
      uiStore.showToast(messages?.chooseSize || 'Выбери размер', 'error')
      return false
    }

    shopStore.addToCart({
      ...product,
      selectedSize
    })

    track('add_to_cart', {
      source: options?.source || 'unknown',
      productId: product.id,
      title: product.title,
      price: product.price,
      selectedSize
    })

    persistRememberedSize(selectedSize)
    uiStore.showToast(messages?.added || 'Товар добавлен в корзину', 'success')
    return true
  }

  const canQuickBuy = (product: ProductItem) => Boolean(getPreferredSize(product))

  return {
    selectedSizes,
    selectSize,
    getSelectedSize,
    getPreferredSize,
    addProductWithSize,
    canQuickBuy
  }
}
