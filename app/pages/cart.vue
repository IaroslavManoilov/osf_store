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
                <strong>{{ ui.deliveryValue }}</strong>
              </div>
            </div>

            <div class="summary-total">
              <span>{{ ui.total }}</span>
              <strong>{{ shopStore.cartTotal }} MDL</strong>
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
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CartItem } from '~/stores/shop'

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
  total: string
  checkout: string
  continueShopping: string
  clearCart: string
  emptyTitle: string
  emptyText: string
  toCatalog: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()

const cartItems = computed(() => shopStore.cart)

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
      deliveryValue: 'Calculată la checkout',
      total: 'Total',
      checkout: 'Continuă spre checkout',
      continueShopping: 'Înapoi la catalog',
      clearCart: 'Golește coșul',
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
      deliveryValue: 'Calculated at checkout',
      total: 'Total',
      checkout: 'Continue to checkout',
      continueShopping: 'Back to catalog',
      clearCart: 'Clear cart',
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
    deliveryValue: 'Рассчитается при оформлении',
    total: 'Итого',
    checkout: 'Перейти к оформлению',
    continueShopping: 'Вернуться в каталог',
    clearCart: 'Очистить корзину',
    emptyTitle: 'Корзина пуста',
    emptyText:
      'Добавь товары из каталога и собери свою подборку ONE STYLE FOREVER.',
    toCatalog: 'Открыть каталог'
  }
})

const cartItemKey = (item: CartItem) => `${item.id}-${item.selectedSize}`

onMounted(() => {
  shopStore.sanitizeCart()
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

  .summary-total strong {
    font-size: 24px;
  }
}
</style>
