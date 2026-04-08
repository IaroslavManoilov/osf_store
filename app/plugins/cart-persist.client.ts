type PersistedShopState = {
  cart?: unknown
  wishlist?: unknown
}

const SHOP_STORAGE_KEY = 'osf_shop_state_v1'

export default defineNuxtPlugin(() => {
  const shopStore = useShopStore()

  try {
    const raw = window.localStorage.getItem(SHOP_STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as PersistedShopState) : null

    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.cart)) {
        shopStore.cart = parsed.cart as typeof shopStore.cart
      }

      if (Array.isArray(parsed.wishlist)) {
        shopStore.wishlist = parsed.wishlist as typeof shopStore.wishlist
      }
    }
  } catch {
    // Ignore malformed localStorage payload.
  }

  shopStore.sanitizeCart()

  shopStore.$subscribe((_mutation, state) => {
    try {
      window.localStorage.setItem(
        SHOP_STORAGE_KEY,
        JSON.stringify({
          cart: state.cart,
          wishlist: state.wishlist
        })
      )
    } catch {
      // Ignore localStorage write failures.
    }
  })
})
