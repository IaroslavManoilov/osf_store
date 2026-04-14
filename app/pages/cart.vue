<template>
  <div class="cart-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card cart-intro">
          <div class="cart-intro-top">
            <div>
              <span class="section-label">{{ ui.label }}</span>
              <h1 class="section-title cart-title">{{ ui.title }}</h1>
              <p class="section-text cart-text">
                {{ ui.subtitle }}
              </p>
            </div>

            <div v-if="cartItems.length" class="cart-summary-chip">
              <strong>{{ shopStore.cartCount }}</strong>
              <span>{{ ui.items }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="cartItems.length" class="section-space">
      <div class="site-container">
        <div class="cart-layout">
          <div class="cart-list">
            <article
              v-for="item in cartItems"
              :key="cartItemKey(item)"
              class="surface-card cart-card"
            >
              <NuxtLink
                :to="localePath(`/product/${item.id}`)"
                class="cart-image-link"
              >
                <div class="cart-image-wrap">
                  <OptimizedImage :src="item.image" :alt="item.title" loading="lazy" width="700" height="700" sizes="(max-width: 900px) 42vw, 320px" />
                </div>
              </NuxtLink>

              <div class="cart-content">
                <div class="cart-top">
                  <div class="cart-info">
                    <NuxtLink
                      :to="localePath(`/product/${item.id}`)"
                      class="cart-title-link"
                    >
                      <h2>{{ item.title }}</h2>
                    </NuxtLink>

                    <div class="cart-meta">
                      <span class="meta-pill">
                        {{ ui.size }}: {{ item.selectedSize }}
                      </span>
                      <span class="meta-pill">
                        {{ ui.price }}: {{ item.price }} MDL
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="remove-btn"
                    @click="shopStore.removeCartItem(item.id, item.selectedSize)"
                  >
                    {{ ui.remove }}
                  </button>
                </div>

                <div class="cart-bottom">
                  <div class="qty-box">
                    <span class="qty-label">{{ ui.quantity }}</span>

                    <div class="qty-controls">
                      <button
                        type="button"
                        class="qty-btn"
                        @click="shopStore.decreaseCartItem(item.id, item.selectedSize)"
                      >
                        −
                      </button>

                      <span class="qty-value">{{ item.quantity }}</span>

                      <button
                        type="button"
                        class="qty-btn"
                        @click="shopStore.increaseCartItem(item.id, item.selectedSize)"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div class="line-total">
                    <span>{{ ui.totalForItem }}</span>
                    <strong>{{ item.price * item.quantity }} MDL</strong>
                  </div>
                </div>
              </div>
            </article>

            <article v-if="bundleOffers.length" class="surface-card bundle-card">
              <div class="bundle-head">
                <span class="section-label">{{ ui.bundleLabel }}</span>
                <h3>{{ ui.bundleTitle }}</h3>
                <p>{{ ui.bundleSubtitle }}</p>
              </div>

              <div class="bundle-list">
                <div v-for="offer in bundleOffers" :key="offer.id" class="bundle-offer">
                  <div class="bundle-info">
                    <strong>{{ offer.title }}</strong>
                    <span>{{ offer.subtitle }}</span>
                    <div class="bundle-products">
                      <span v-for="item in offer.items" :key="`${offer.id}-${item.id}`">
                        {{ item.title }}
                      </span>
                    </div>
                  </div>

                  <div class="bundle-price">
                    <span class="bundle-regular">{{ offer.regularTotal }} MDL</span>
                    <strong>{{ offer.bundleTotal }} MDL</strong>
                    <small>{{ ui.bundleSave }} {{ offer.savings }} MDL</small>
                  </div>

                  <button type="button" class="btn-main bundle-btn" @click="addBundleOffer(offer)">
                    {{ ui.bundleAdd }}
                  </button>
                </div>
              </div>
            </article>

            <article v-if="upsellProducts.length" class="surface-card upsell-card">
              <div class="bundle-head">
                <span class="section-label">{{ ui.upsellLabel }}</span>
                <h3>{{ ui.upsellTitle }}</h3>
                <p>{{ ui.upsellSubtitle }}</p>
              </div>

              <div class="upsell-list">
                <article v-for="item in upsellProducts" :key="`upsell-${item.id}`" class="upsell-item">
                  <NuxtLink :to="localePath(`/product/${item.id}`)" class="upsell-image">
                    <OptimizedImage :src="item.image" :alt="item.title" loading="lazy" width="360" height="360" sizes="88px" />
                  </NuxtLink>
                  <div class="upsell-info">
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.price }} MDL</span>
                  </div>
                  <button type="button" class="btn-alt upsell-btn" @click="addUpsell(item)">{{ ui.upsellAdd }}</button>
                </article>
              </div>
            </article>
          </div>

          <aside class="surface-card summary-box">
            <span class="section-label">{{ ui.summaryLabel }}</span>
            <h2 class="summary-title">{{ ui.summaryTitle }}</h2>

            <div class="summary-list">
              <div class="summary-row">
                <span>{{ ui.items }}</span>
                <strong>{{ shopStore.cartCount }}</strong>
              </div>

              <div class="summary-row">
                <span>{{ ui.subtotal }}</span>
                <strong>{{ shopStore.cartTotal }} MDL</strong>
              </div>

              <div class="summary-row muted-row">
                <span>{{ ui.delivery }}</span>
                <strong>{{ deliveryPriceLabel }}</strong>
              </div>

              <div class="summary-row promo-row">
                <span>{{ ui.promoLabel }}</span>
                <div class="promo-inline">
                  <input
                    v-model.trim="promoInput"
                    class="promo-input"
                    type="text"
                    :placeholder="ui.promoPlaceholder"
                    @keydown.enter.prevent="applyPromoCode"
                  />
                  <button type="button" class="btn-alt promo-btn" @click="applyPromoCode">
                    {{ ui.promoApply }}
                  </button>
                </div>
              </div>

              <div v-if="appliedPromoCode" class="summary-row promo-discount-row">
                <span>{{ ui.promoDiscount }} ({{ appliedPromoCode }})</span>
                <strong>-{{ promoDiscount }} MDL</strong>
              </div>

              <div v-if="promoMessage" class="promo-note" :class="{ error: promoMessageType === 'error' }">
                {{ promoMessage }}
              </div>

              <div class="summary-row city-row">
                <span>{{ ui.deliveryCityLabel }}</span>
                <input v-model.trim="deliveryCity" class="city-input" type="text" :placeholder="ui.deliveryCityPlaceholder" />
              </div>

              <div class="summary-row muted-row">
                <span>{{ ui.deliveryEstimateLabel }}</span>
                <strong>{{ deliveryEstimateLabel }}</strong>
              </div>
            </div>

            <div class="summary-total">
              <span>{{ ui.total }}</span>
              <strong>{{ checkoutTotal }} MDL</strong>
            </div>

            <div class="summary-actions">
              <NuxtLink :to="localePath('/checkout')" class="btn-main summary-btn">
                {{ ui.checkout }}
              </NuxtLink>

              <NuxtLink :to="localePath('/catalog')" class="btn-alt summary-btn">
                {{ ui.continueShopping }}
              </NuxtLink>

              <button
                type="button"
                class="clear-btn"
                @click="shopStore.clearCart()"
              >
                {{ ui.clearCart }}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section v-else class="section-space">
      <div class="site-container">
        <div class="surface-card empty-box">
          <div class="empty-icon">🛍️</div>
          <h2>{{ ui.emptyTitle }}</h2>
          <p>{{ ui.emptyText }}</p>

          <NuxtLink :to="localePath('/catalog')" class="btn-main">
            {{ ui.toCatalog }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CartItem } from '~/stores/shop'
import { getProducts, type LocalizedProduct } from '~/data/products'

type BundleOffer = {
  id: string
  title: string
  subtitle: string
  items: LocalizedProduct[]
  regularTotal: number
  bundleTotal: number
  savings: number
}

type CartPageUi = {
  label: string
  title: string
  subtitle: string
  items: string
  size: string
  price: string
  quantity: string
  remove: string
  totalForItem: string
  summaryLabel: string
  summaryTitle: string
  subtotal: string
  delivery: string
  deliveryValue: string
  deliveryCityLabel: string
  deliveryCityPlaceholder: string
  deliveryEstimateLabel: string
  total: string
  checkout: string
  continueShopping: string
  clearCart: string
  bundleLabel: string
  bundleTitle: string
  bundleSubtitle: string
  bundleSave: string
  bundleAdd: string
  upsellLabel: string
  upsellTitle: string
  upsellSubtitle: string
  upsellAdd: string
  promoLabel: string
  promoPlaceholder: string
  promoApply: string
  promoDiscount: string
  promoAppliedMessage: string
  promoInvalidMessage: string
  promoRemovedMessage: string
  emptyTitle: string
  emptyText: string
  toCatalog: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()
const uiStore = useUiStore()

const cartItems = computed(() => shopStore.cart)
const catalogProducts = computed(() => getProducts(locale.value))
const cartProductIds = computed(() => new Set(shopStore.cart.map((item) => item.id)))
const cartCategorySet = computed(() => new Set(
  catalogProducts.value
    .filter((product) => cartProductIds.value.has(product.id))
    .map((product) => product.category)
))

type PromoRule = {
  type: 'percent' | 'fixed'
  value: number
  minSubtotal?: number
}

const promoRules: Record<string, PromoRule> = {
  OSF10: { type: 'percent', value: 10, minSubtotal: 500 },
  STYLE15: { type: 'percent', value: 15, minSubtotal: 1200 },
  WELCOME50: { type: 'fixed', value: 50, minSubtotal: 600 }
}

const promoStorageKey = 'osf_cart_promo_v1'
const deliveryCityStorageKey = 'osf_cart_delivery_city_v1'
const promoInput = ref('')
const appliedPromoCode = ref('')
const promoMessage = ref('')
const promoMessageType = ref<'success' | 'error'>('success')
const deliveryCity = ref('')

const cityNormalized = computed(() => String(deliveryCity.value || '').trim().toLowerCase())
const subtotal = computed(() => shopStore.cartTotal)

const deliveryFee = computed(() => {
  if (!shopStore.cartCount) return 0
  if (subtotal.value >= 1200) return 0
  if (!cityNormalized.value) return 65
  if (cityNormalized.value.includes('chi') || cityNormalized.value.includes('кишин')) return 49
  if (cityNormalized.value.includes('tiras') || cityNormalized.value.includes('тирасп')) return 59
  return 69
})

const deliveryPriceLabel = computed(() => (deliveryFee.value === 0 ? ui.value.deliveryValue : `${deliveryFee.value} MDL`))

const promoDiscount = computed(() => {
  const code = String(appliedPromoCode.value || '').toUpperCase()
  const rule = promoRules[code]
  if (!rule) return 0
  if (rule.minSubtotal && subtotal.value < rule.minSubtotal) return 0
  if (rule.type === 'percent') {
    return Math.max(0, Math.round((subtotal.value * rule.value) / 100))
  }
  return Math.max(0, Math.round(rule.value))
})

const checkoutTotal = computed(() => Math.max(0, subtotal.value + deliveryFee.value - promoDiscount.value))

const deliveryEstimateLabel = computed(() => {
  if (!shopStore.cartCount) return ui.value.deliveryValue

  const date = new Date()
  const offset = !cityNormalized.value
    ? 3
    : (cityNormalized.value.includes('chi') || cityNormalized.value.includes('кишин') ? 2 : 3)
  date.setDate(date.getDate() + offset)
  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleDateString(localeCode, { day: 'numeric', month: 'long' })
})

const upsellProducts = computed(() =>
  catalogProducts.value
    .filter((item) => !cartProductIds.value.has(item.id))
    .slice(0, 3)
)

const bundleOffers = computed<BundleOffer[]>(() => {
  const categoryPriority = ['hoodies', 'polo', 'sweaters'] as const
  const missingCategory = categoryPriority.find((category) => !cartCategorySet.value.has(category))

  const sameCategoryItems = catalogProducts.value.filter((product) =>
    cartCategorySet.value.size ? cartCategorySet.value.has(product.category) : true
  )
  const addOnItems = catalogProducts.value.filter((product) =>
    !cartProductIds.value.has(product.id) &&
    (!missingCategory || product.category === missingCategory)
  )

  const base = sameCategoryItems[0]
  const addOn = addOnItems[0]
  if (!base || !addOn) return []

  const regularTotal = base.price + addOn.price
  const savings = Math.max(40, Math.round(regularTotal * 0.1))
  const bundleTotal = Math.max(0, regularTotal - savings)

  return [
    {
      id: `${base.id}-${addOn.id}`,
      title: `${base.categoryLabel} + ${addOn.categoryLabel}`,
      subtitle: ui.value.bundleSubtitle,
      items: [base, addOn],
      regularTotal,
      bundleTotal,
      savings
    }
  ]
})

const ui = computed<CartPageUi>(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Coș',
      title: 'Coșul tău',
      subtitle:
        'Verifică produsele selectate, ajustează cantitatea și continuă spre checkout.',
      items: 'produse',
      size: 'Mărime',
      price: 'Preț',
      quantity: 'Cantitate',
      remove: 'Șterge',
      totalForItem: 'Total produs',
      summaryLabel: 'Sumar',
      summaryTitle: 'Comanda ta',
      subtotal: 'Subtotal',
      delivery: 'Livrare',
      deliveryValue: 'Gratuit',
      deliveryCityLabel: 'Oraș livrare',
      deliveryCityPlaceholder: 'Ex: Chișinău',
      deliveryEstimateLabel: 'Data estimată',
      total: 'Total',
      checkout: 'Continuă spre checkout',
      continueShopping: 'Înapoi la catalog',
      clearCart: 'Golește coșul',
      bundleLabel: 'Set recomandat',
      bundleTitle: 'Economisește cu bundle',
      bundleSubtitle: 'Produse care se potrivesc perfect în comandă',
      bundleSave: 'Economisești',
      bundleAdd: 'Adaugă bundle',
      upsellLabel: 'Completează comanda',
      upsellTitle: 'Adaugă și aceste modele',
      upsellSubtitle: 'Produse populare care se potrivesc cu selecția ta',
      upsellAdd: 'Adaugă',
      promoLabel: 'Cod promo',
      promoPlaceholder: 'Ex: OSF10',
      promoApply: 'Aplică',
      promoDiscount: 'Reducere',
      promoAppliedMessage: 'Cod promo aplicat cu succes.',
      promoInvalidMessage: 'Cod invalid sau subtotal insuficient.',
      promoRemovedMessage: 'Cod promo eliminat automat (subtotal prea mic).',
      emptyTitle: 'Coșul este gol',
      emptyText:
        'Adaugă produse din catalog și construiește selecția ta ONE STYLE FOREVER.',
      toCatalog: 'Deschide catalogul'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Cart',
      title: 'Your cart',
      subtitle:
        'Review selected products, adjust quantity, and continue to checkout.',
      items: 'items',
      size: 'Size',
      price: 'Price',
      quantity: 'Quantity',
      remove: 'Remove',
      totalForItem: 'Line total',
      summaryLabel: 'Summary',
      summaryTitle: 'Your order',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      deliveryValue: 'Free',
      deliveryCityLabel: 'Delivery city',
      deliveryCityPlaceholder: 'e.g. Chisinau',
      deliveryEstimateLabel: 'Estimated date',
      total: 'Total',
      checkout: 'Continue to checkout',
      continueShopping: 'Back to catalog',
      clearCart: 'Clear cart',
      bundleLabel: 'Bundle offer',
      bundleTitle: 'Save with a bundle',
      bundleSubtitle: 'Products that match your current order',
      bundleSave: 'You save',
      bundleAdd: 'Add bundle',
      upsellLabel: 'Complete your order',
      upsellTitle: 'Add these picks too',
      upsellSubtitle: 'Popular products that match your cart',
      upsellAdd: 'Add',
      promoLabel: 'Promo code',
      promoPlaceholder: 'e.g. OSF10',
      promoApply: 'Apply',
      promoDiscount: 'Discount',
      promoAppliedMessage: 'Promo code applied successfully.',
      promoInvalidMessage: 'Invalid code or subtotal is too low.',
      promoRemovedMessage: 'Promo code removed automatically (subtotal too low).',
      emptyTitle: 'Your cart is empty',
      emptyText:
        'Add products from the catalog and build your ONE STYLE FOREVER selection.',
      toCatalog: 'Open catalog'
    }
  }

  return {
    label: 'Корзина',
    title: 'Твоя корзина',
    subtitle:
      'Проверь выбранные товары, измени количество и переходи к оформлению.',
    items: 'товаров',
    size: 'Размер',
    price: 'Цена',
    quantity: 'Количество',
    remove: 'Удалить',
    totalForItem: 'Сумма товара',
    summaryLabel: 'Сводка',
    summaryTitle: 'Твой заказ',
    subtotal: 'Промежуточный итог',
    delivery: 'Доставка',
    deliveryValue: 'Бесплатно',
    deliveryCityLabel: 'Город доставки',
    deliveryCityPlaceholder: 'Например: Кишинёв',
    deliveryEstimateLabel: 'Ожидаемая дата',
    total: 'Итого',
    checkout: 'Перейти к оформлению',
    continueShopping: 'Вернуться в каталог',
    clearCart: 'Очистить корзину',
    bundleLabel: 'Выгодный комплект',
    bundleTitle: 'Собери bundle и сэкономь',
    bundleSubtitle: 'Товары, которые чаще берут вместе',
    bundleSave: 'Экономия',
    bundleAdd: 'Добавить комплект',
    upsellLabel: 'Дополни заказ',
    upsellTitle: 'Добавь к заказу',
    upsellSubtitle: 'Популярные модели к твоей подборке',
    upsellAdd: 'Добавить',
    promoLabel: 'Промокод',
    promoPlaceholder: 'Например: OSF10',
    promoApply: 'Применить',
    promoDiscount: 'Скидка',
    promoAppliedMessage: 'Промокод успешно применён.',
    promoInvalidMessage: 'Промокод не подходит или сумма слишком маленькая.',
    promoRemovedMessage: 'Промокод снят автоматически (сумма стала ниже порога).',
    emptyTitle: 'Корзина пуста',
    emptyText:
      'Добавь товары из каталога и собери свою подборку ONE STYLE FOREVER.',
    toCatalog: 'Открыть каталог'
  }
})

const cartItemKey = (item: CartItem) => `${item.id}-${item.selectedSize}`

const addUpsell = (product: LocalizedProduct) => {
  const selectedSize = product.sizes[0]
  if (!selectedSize) return

  shopStore.addToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    description: product.description,
    selectedSize
  })

  uiStore.showToast(`${product.title} — ${ui.value.upsellAdd.toLowerCase()}`, 'success')
}

const applyPromoCode = () => {
  const code = String(promoInput.value || '').trim().toUpperCase()
  const rule = promoRules[code]

  if (!code || !rule || (rule.minSubtotal && subtotal.value < rule.minSubtotal)) {
    promoMessage.value = ui.value.promoInvalidMessage
    promoMessageType.value = 'error'
    appliedPromoCode.value = ''
    return
  }

  appliedPromoCode.value = code
  promoInput.value = code
  promoMessage.value = ui.value.promoAppliedMessage
  promoMessageType.value = 'success'
}

const addBundleOffer = (offer: BundleOffer) => {
  for (const product of offer.items) {
    if (cartProductIds.value.has(product.id)) continue
    const selectedSize = product.sizes[0]
    if (!selectedSize) continue
    shopStore.addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      description: product.description,
      selectedSize
    })
  }
}

onMounted(() => {
  shopStore.sanitizeCart()
  if (!import.meta.client) return

  try {
    promoInput.value = String(window.localStorage.getItem(promoStorageKey) || '')
    appliedPromoCode.value = String(window.localStorage.getItem(promoStorageKey) || '').trim().toUpperCase()
  } catch {
    promoInput.value = ''
    appliedPromoCode.value = ''
  }

  try {
    deliveryCity.value = String(window.localStorage.getItem(deliveryCityStorageKey) || '')
  } catch {
    deliveryCity.value = ''
  }
})

watch(appliedPromoCode, (value) => {
  const code = String(value || '').trim().toUpperCase()
  const rule = promoRules[code]
  if (code && (!rule || (rule.minSubtotal && subtotal.value < rule.minSubtotal))) {
    appliedPromoCode.value = ''
    promoMessage.value = ui.value.promoRemovedMessage
    promoMessageType.value = 'error'
  }

  if (!import.meta.client) return
  try {
    if (appliedPromoCode.value) {
      window.localStorage.setItem(promoStorageKey, appliedPromoCode.value)
    } else {
      window.localStorage.removeItem(promoStorageKey)
    }
  } catch {
    // Ignore storage errors.
  }
})

watch(deliveryCity, (value) => {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem(deliveryCityStorageKey, String(value || ''))
  } catch {
    // Ignore storage errors.
  }
})
</script>

<style scoped>
.cart-page {
  padding-top: 18px;
}

.cart-intro,
.cart-card,
.summary-box,
.empty-box {
  padding: 32px;
}

.cart-intro {
  padding: 22px 24px;
}

.cart-intro-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
}

.cart-title {
  font-size: clamp(34px, 3.6vw, 52px);
  line-height: 0.98;
}

.cart-text {
  max-width: 760px;
  margin-top: 10px;
  font-size: 17px;
  line-height: 1.55;
}

.cart-summary-chip {
  min-width: 140px;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: #f8faf8;
  display: grid;
  gap: 6px;
}

.cart-summary-chip strong {
  font-size: 24px;
  line-height: 1;
}

.cart-summary-chip span {
  color: var(--muted);
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 22px;
}

.cart-list {
  display: grid;
  gap: 18px;
}

.cart-card {
  display: grid;
  grid-template-columns: minmax(340px, 42%) minmax(0, 1fr);
  gap: 28px;
  align-items: center;
}

.cart-image-link {
  display: block;
}

.cart-image-wrap {
  min-height: 0;
  aspect-ratio: 1 / 1;
  border-radius: 26px;
  background: #fbfdfb;
  border: none;
  box-shadow:
    inset 0 0 0 1px rgba(196, 209, 199, 0.55),
    0 8px 22px rgba(15, 28, 20, 0.05);
  display: grid;
  place-items: center;
  padding: 8px;
  overflow: hidden;
}

.cart-image-wrap img {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  transform: scale(1.14);
}

.cart-content {
  min-width: 0;
  display: block;
}

.cart-top {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: start;
}

.cart-info {
  min-width: 0;
}

.cart-title-link {
  display: block;
  color: inherit;
}

.cart-title-link h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.08;
  transition: 0.2s ease;
}

.cart-title-link:hover h2 {
  color: #2f6c47;
}

.cart-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.meta-pill {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.remove-btn {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.remove-btn:hover {
  border-color: #e6caca;
}

.cart-bottom {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: end;
  margin-top: 22px;
}

.qty-box {
  display: grid;
  gap: 10px;
}

.qty-label {
  font-size: 14px;
  font-weight: 800;
}

.qty-controls {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: 0.2s ease;
}

.qty-value {
  min-width: 28px;
  text-align: center;
  font-weight: 800;
  font-size: 16px;
}

.line-total {
  display: grid;
  gap: 8px;
  text-align: right;
}

.line-total span {
  color: var(--muted);
  font-size: 14px;
}

.line-total strong {
  font-size: 28px;
  line-height: 1;
}

.summary-box {
  align-self: start;
}

.bundle-card {
  padding: 22px;
  display: grid;
  gap: 14px;
}

.bundle-head h3 {
  margin: 8px 0 0;
  font-size: 30px;
  line-height: 1;
}

.bundle-head p {
  margin: 10px 0 0;
  color: var(--muted);
}

.bundle-list {
  display: grid;
  gap: 12px;
}

.bundle-offer {
  border: 1px solid var(--border);
  border-radius: 20px;
  background: #fff;
  padding: 14px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) auto auto;
  gap: 14px;
  align-items: center;
}

.bundle-info {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.bundle-info strong {
  font-size: 18px;
}

.bundle-info span {
  color: var(--muted);
  font-size: 14px;
}

.bundle-products {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bundle-products span {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #48637e;
}

.bundle-price {
  text-align: right;
  display: grid;
  gap: 4px;
}

.bundle-regular {
  color: var(--muted);
  text-decoration: line-through;
}

.bundle-price strong {
  font-size: 24px;
  line-height: 1;
}

.bundle-price small {
  color: #1f6a43;
  font-weight: 700;
}

.bundle-btn {
  min-width: 180px;
}

.upsell-card {
  padding: 22px;
  display: grid;
  gap: 14px;
}

.upsell-list {
  display: grid;
  gap: 10px;
}

.upsell-item {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #fff;
  padding: 10px;
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.upsell-image {
  width: 88px;
  height: 88px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  display: grid;
  place-items: center;
  padding: 6px;
}

.upsell-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upsell-info {
  display: grid;
  gap: 3px;
}

.upsell-info strong {
  font-size: 15px;
  line-height: 1.2;
}

.upsell-info span {
  color: var(--muted);
  font-size: 13px;
}

.upsell-btn {
  min-height: 38px;
  min-width: 116px;
}

.summary-title {
  margin: 8px 0 0;
  font-size: 34px;
  line-height: 1;
}

.summary-list {
  margin-top: 24px;
  display: grid;
  gap: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}

.summary-row span {
  color: var(--muted);
}

.summary-row strong {
  font-size: 18px;
}

.muted-row strong {
  font-size: 16px;
  color: var(--muted);
  font-weight: 700;
}

.promo-row,
.city-row {
  display: grid;
  gap: 8px;
  align-items: stretch;
}

.promo-inline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.promo-input,
.city-input {
  width: 100%;
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 12px;
  font: inherit;
  color: var(--text);
}

.promo-btn {
  min-height: 42px;
  min-width: 100px;
}

.promo-discount-row strong {
  color: #1f6b43;
  font-size: 18px;
}

.promo-note {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid #c9dfcc;
  background: #f3faf4;
  color: #2f6b47;
  font-size: 12px;
  font-weight: 700;
}

.promo-note.error {
  border-color: #e3cccc;
  background: #fff5f5;
  color: #9e3232;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-top: 22px;
}

.summary-total span {
  font-size: 18px;
  font-weight: 800;
}

.summary-total strong {
  font-size: 30px;
  line-height: 1;
}

.summary-actions {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.summary-btn {
  width: 100%;
}

.clear-btn {
  min-height: 46px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.empty-box {
  text-align: center;
}

.empty-icon {
  font-size: 42px;
  margin-bottom: 10px;
}

.empty-box h2 {
  margin: 0 0 10px;
  font-size: 36px;
  line-height: 1;
}

.empty-box p {
  max-width: 620px;
  margin: 0 auto 20px;
  color: var(--muted);
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .cart-intro,
  .cart-card,
  .summary-box,
  .empty-box {
    padding: 24px;
  }

  .cart-intro {
    padding: 18px 20px;
  }

  .cart-intro-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-card {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }

  .cart-image-wrap {
    border-radius: 18px;
    padding: 6px;
    aspect-ratio: 1 / 1;
  }

  .bundle-offer {
    grid-template-columns: 1fr;
  }

  .bundle-price {
    text-align: left;
  }

  .bundle-btn {
    width: 100%;
    min-width: 0;
  }

  .upsell-item {
    grid-template-columns: 74px minmax(0, 1fr);
  }

  .upsell-btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .cart-page {
    padding-top: 12px;
  }

  .cart-intro,
  .cart-card,
  .summary-box,
  .empty-box {
    padding: 14px;
  }

  .cart-intro {
    padding: 12px;
  }

  .cart-title {
    font-size: 30px;
    line-height: 0.98;
  }

  .cart-text {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.35;
  }

  .cart-title-link h2 {
    font-size: 19px;
  }

  .cart-card {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .cart-image-wrap {
    border-radius: 14px;
    padding: 4px;
    max-height: 240px;
  }

  .cart-meta {
    margin-top: 10px;
    gap: 8px;
  }

  .meta-pill {
    min-height: 30px;
    padding: 0 9px;
    font-size: 12px;
  }

  .remove-btn {
    min-height: 34px;
    padding: 0 12px;
  }

  .cart-top,
  .cart-bottom {
    flex-direction: column;
    align-items: stretch;
  }

  .line-total {
    text-align: left;
  }

  .line-total strong {
    font-size: 24px;
  }

  .summary-title {
    font-size: 28px;
  }

  .bundle-card {
    padding: 14px;
  }

  .bundle-head h3 {
    font-size: 24px;
  }

  .upsell-card {
    padding: 14px;
  }

  .summary-total strong {
    font-size: 24px;
  }

  .promo-inline {
    grid-template-columns: 1fr;
  }

  .promo-btn {
    width: 100%;
  }
}
</style>
