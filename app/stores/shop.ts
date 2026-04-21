// app/stores/shop.ts
import { defineStore } from 'pinia'
import { getProducts } from '~/data/products'

export type ProductSize = 'S' | 'M' | 'L'

export interface ProductItem {
  id: string
  title: string
  price: number
  image: string
  description: string
  badge?: 'NEW' | 'HOT'
  sizes?: ProductSize[]
}

export interface CartItem extends ProductItem {
  quantity: number
  selectedSize: ProductSize
}

const catalogById = new Map(
  getProducts('ru').map((product) => [
    product.id,
    {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      description: product.description,
      badge: product.badge,
      sizes: product.sizes
    }
  ])
)

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

    sanitizeCart() {
      const merged = new Map<string, CartItem>()

      for (const raw of this.cart as Array<Partial<CartItem>>) {
        const id = String(raw?.id || '').trim()
        const catalogProduct = catalogById.get(id)
        if (!catalogProduct) continue

        const selectedSize = String(raw?.selectedSize || '').trim().toUpperCase() as ProductSize
        if (!catalogProduct.sizes.includes(selectedSize)) continue

        const rawQuantity = Number(raw?.quantity)
        if (!Number.isFinite(rawQuantity) || rawQuantity <= 0) continue
        const quantity = Math.max(1, Math.min(20, Math.floor(rawQuantity)))

        const key = `${id}-${selectedSize}`
        const existing = merged.get(key)

        if (existing) {
          existing.quantity = Math.max(1, Math.min(20, existing.quantity + quantity))
          continue
        }

        merged.set(key, {
          id,
          title: catalogProduct.title,
          price: catalogProduct.price,
          image: catalogProduct.image,
          description: catalogProduct.description,
          selectedSize,
          quantity
        })
      }

      this.cart = Array.from(merged.values())
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
  }
})
