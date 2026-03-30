import { ref } from 'vue'
import type { ProductItem } from '~/stores/shop'

export const useProductActions = () => {
  const shopStore = useShopStore()
  const uiStore = useUiStore()
  const selectedSizes = ref<Record<string, string>>({})

  const selectSize = (productId: string, size: string) => {
    selectedSizes.value[productId] = size
  }

  const getSelectedSize = (productId: string) => {
    return selectedSizes.value[productId] || ''
  }

  const addProductWithSize = (
    product: ProductItem,
    messages?: {
      chooseSize?: string
      added?: string
    }
  ) => {
    const selectedSize = getSelectedSize(product.id)

    if (!selectedSize) {
      uiStore.showToast(messages?.chooseSize || 'Выбери размер', 'error')
      return false
    }

    shopStore.addToCart({
      ...product,
      selectedSize
    })

    uiStore.showToast(messages?.added || 'Товар добавлен в корзину', 'success')
    return true
  }

  return {
    selectedSizes,
    selectSize,
    getSelectedSize,
    addProductWithSize
  }
}