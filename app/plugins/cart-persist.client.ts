type PersistedShopState = {
  cart?: unknown
  wishlist?: unknown
  cartTouchedAt?: string
}

const SHOP_STORAGE_KEY = 'osf_shop_state_v1'
const CART_REMINDER_SEEN_AT_KEY = 'osf_cart_reminder_seen_at_v1'
const REMINDER_DELAY_MS = 2 * 60 * 60 * 1000
const REMINDER_SEEN_COOLDOWN_MS = 18 * 60 * 60 * 1000

export default defineNuxtPlugin(() => {
  const shopStore = useShopStore()
  const uiStore = useUiStore()
  let cartTouchedAt = ''

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

      cartTouchedAt = String(parsed.cartTouchedAt || '')
    }
  } catch {
    // Ignore malformed localStorage payload.
  }

  shopStore.sanitizeCart()

  const locale = String(document.documentElement.lang || '').toLowerCase()
  const reminderText = locale.startsWith('ro')
    ? 'Ai produse în coș. Finalizează comanda cât timp mărimile sunt disponibile.'
    : locale.startsWith('en')
      ? 'You still have items in cart. Complete checkout while your size is in stock.'
      : 'У вас есть товары в корзине. Оформите заказ, пока размер в наличии.'

  if (shopStore.cart.length && cartTouchedAt) {
    const touchedMs = new Date(cartTouchedAt).getTime()
    const seenMs = new Date(window.localStorage.getItem(CART_REMINDER_SEEN_AT_KEY) || '').getTime()
    const now = Date.now()
    const canShowByAge = Number.isFinite(touchedMs) && now - touchedMs >= REMINDER_DELAY_MS
    const canShowByCooldown = !Number.isFinite(seenMs) || now - seenMs >= REMINDER_SEEN_COOLDOWN_MS

    if (canShowByAge && canShowByCooldown) {
      uiStore.showToast(reminderText, 'info')
      window.localStorage.setItem(CART_REMINDER_SEEN_AT_KEY, new Date(now).toISOString())
    }
  }

  shopStore.$subscribe((_mutation, state) => {
    const nextTouchedAt = Array.isArray(state.cart) && state.cart.length ? new Date().toISOString() : ''
    try {
      window.localStorage.setItem(
        SHOP_STORAGE_KEY,
        JSON.stringify({
          cart: state.cart,
          wishlist: state.wishlist,
          cartTouchedAt: nextTouchedAt
        })
      )
    } catch {
      // Ignore localStorage write failures.
    }
  })
})
