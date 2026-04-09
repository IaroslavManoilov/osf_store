import { ref } from 'vue'
import type { ProductSize } from '~/stores/shop'
import type { ProductItem } from '~/stores/shop'
import { useAnalytics } from '~/composables/useAnalytics'

type SelectableProduct = ProductItem & { sizes: ProductSize[] }

export const useProductActions = () => {
  const shopStore = useShopStore()
  const uiStore = useUiStore()
  const { track } = useAnalytics()
  const selectedSizes = ref<Record<string, ProductSize | ''>>({})
  const rememberedSize = ref<ProductSize | ''>('')
  const sizeStorageKey = 'osf_last_size_global_v1'
  let rememberLoaded = false

  const ensureRememberedSize = () => {
    if (!import.meta.client || rememberLoaded) return
    rememberLoaded = true
    try {
      const stored = window.localStorage.getItem(sizeStorageKey)
      rememberedSize.value = typeof stored === 'string' ? stored as ProductSize : ''
    } catch {
      rememberedSize.value = ''
    }
  }

  const persistRememberedSize = (size: ProductSize) => {
    rememberedSize.value = size
    if (!import.meta.client) return
    try {
      window.localStorage.setItem(sizeStorageKey, size)
    } catch {
      // Ignore storage write failures.
    }
  }

  const selectSize = (productId: string, size: ProductSize) => {
    selectedSizes.value[productId] = size
    persistRememberedSize(size)
  }

  const getSelectedSize = (productId: string) => {
    return selectedSizes.value[productId] || ''
  }

  const getPreferredSize = (product: SelectableProduct): ProductSize | '' => {
    const activeSize = getSelectedSize(product.id)
    if (activeSize && product.sizes.includes(activeSize)) return activeSize

    ensureRememberedSize()
    if (rememberedSize.value && product.sizes.includes(rememberedSize.value)) {
      return rememberedSize.value as ProductSize
    }

    return ''
  }

  const addProductWithSize = (
    product: SelectableProduct,
    messages?: {
      chooseSize?: string
      added?: string
    },
    options?: {
      autoSelectLastSize?: boolean
      source?: string
    }
  ) => {
    let selectedSize: ProductSize | '' = getSelectedSize(product.id)

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

    const normalizedSize = selectedSize as ProductSize

    shopStore.addToCart({
      ...product,
      selectedSize: normalizedSize
    })

    track('add_to_cart', {
      source: options?.source || 'unknown',
      productId: product.id,
      title: product.title,
      price: product.price,
      selectedSize: normalizedSize
    })

    persistRememberedSize(normalizedSize)
    uiStore.showToast(messages?.added || 'Товар добавлен в корзину', 'success')
    return true
  }

  const canQuickBuy = (product: SelectableProduct) => Boolean(getPreferredSize(product))

  return {
    selectedSizes,
    selectSize,
    getSelectedSize,
    getPreferredSize,
    addProductWithSize,
    canQuickBuy
  }
}
