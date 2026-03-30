// app/stores/shop.ts
import { defineStore } from 'pinia'

export type ProductSize = 'S' | 'M' | 'L'

export interface ProductItem {
  id: string
  title: string
  price: number
  image: string
  description: string
}

export interface CartItem extends ProductItem {
  quantity: number
  selectedSize: ProductSize
}

export const useShopStore = defineStore('shop', {
  state: () => ({
    cart: [] as CartItem[],
    wishlist: [] as ProductItem[]
  }),

  getters: {
    cartCount: (state): number =>
      state.cart.reduce((sum, item) => sum + item.quantity, 0),

    wishlistCount: (state): number => state.wishlist.length,

    cartTotal: (state): number =>
      state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  actions: {
    addToCart(product: ProductItem & { selectedSize: ProductSize }) {
      const existingItem = this.cart.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize
      )

      if (existingItem) {
        existingItem.quantity += 1
        return
      }

      this.cart.push({
        ...product,
        quantity: 1
      })
    },

    removeCartItem(id: string, selectedSize: ProductSize) {
      this.cart = this.cart.filter(
        (item) =>
          !(item.id === id && item.selectedSize === selectedSize)
      )
    },

    increaseCartItem(id: string, selectedSize: ProductSize) {
      const item = this.cart.find(
        (cartItem) =>
          cartItem.id === id &&
          cartItem.selectedSize === selectedSize
      )

      if (item) {
        item.quantity += 1
      }
    },

    decreaseCartItem(id: string, selectedSize: ProductSize) {
      const item = this.cart.find(
        (cartItem) =>
          cartItem.id === id &&
          cartItem.selectedSize === selectedSize
      )

      if (!item) return

      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        this.removeCartItem(id, selectedSize)
      }
    },

    clearCart() {
      this.cart = []
    },

    toggleWishlist(product: ProductItem) {
      const exists = this.wishlist.some((item) => item.id === product.id)

      if (exists) {
        this.wishlist = this.wishlist.filter((item) => item.id !== product.id)
      } else {
        this.wishlist.push(product)
      }
    },

    removeFromWishlist(id: string) {
      this.wishlist = this.wishlist.filter((item) => item.id !== id)
    },

    isInWishlist(id: string): boolean {
      return this.wishlist.some((item) => item.id === id)
    }
  },

  persist: true
})