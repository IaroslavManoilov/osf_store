<template>
  <div class="checkout-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card checkout-intro">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title checkout-title">{{ ui.title }}</h1>
          <p class="section-text checkout-text">
            {{ ui.subtitle }}
          </p>
        </div>
      </div>
    </section>

    <section v-if="shopStore.cart.length" class="section-space">
      <div class="site-container">
        <div class="checkout-layout">
          <div class="surface-card checkout-form-box">
            <h2>{{ ui.formTitle }}</h2>

            <form class="checkout-form" @submit.prevent="submitOrder">
              <div class="form-grid">
                <label class="field">
                  <span>{{ ui.name }}</span>
                  <input v-model.trim="form.name" type="text" required />
                </label>

                <label class="field">
                  <span>{{ ui.phone }}</span>
                  <input v-model.trim="form.phone" type="tel" required />
                </label>

                <label class="field field-full">
                  <span>{{ ui.email }}</span>
                  <input v-model.trim="form.email" type="email" />
                </label>

                <label class="field field-full">
                  <span>{{ ui.address }}</span>
                  <input v-model.trim="form.address" type="text" required />
                </label>

                <label class="field field-full">
                  <span>{{ ui.comment }}</span>
                  <textarea v-model.trim="form.comment" rows="5" />
                </label>
              </div>

              <button
                type="submit"
                class="btn-main submit-btn"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? ui.submitting : ui.submit }}
              </button>
            </form>

            <p v-if="successMessage" class="success-text">
              {{ successMessage }}
            </p>

            <p v-if="errorMessage" class="error-text">
              {{ errorMessage }}
            </p>
          </div>

          <aside class="surface-card checkout-summary-box">
            <span class="section-label">{{ ui.summaryLabel }}</span>
            <h2 class="summary-title">{{ ui.summaryTitle }}</h2>

            <div class="summary-products">
              <div
                v-for="item in shopStore.cart"
                :key="`${item.id}-${item.selectedSize}`"
                class="summary-product"
              >
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>
                    {{ ui.size }}: {{ item.selectedSize }} ·
                    {{ item.quantity }} × {{ item.price }} MDL
                  </span>
                </div>

                <strong>{{ item.quantity * item.price }} MDL</strong>
              </div>
            </div>

            <div class="summary-total">
              <span>{{ ui.total }}</span>
              <strong>{{ shopStore.cartTotal }} MDL</strong>
            </div>

            <NuxtLink :to="localePath('/cart')" class="btn-alt summary-link">
              {{ ui.backToCart }}
            </NuxtLink>
          </aside>
        </div>
      </div>
    </section>

    <section v-else class="section-space">
      <div class="site-container">
        <div class="surface-card empty-box">
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
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type OrderResponse = {
  success: boolean
  orderId: string
  message: string
}

type CheckoutUi = {
  label: string
  title: string
  subtitle: string
  formTitle: string
  name: string
  phone: string
  email: string
  address: string
  comment: string
  submit: string
  submitting: string
  successPrefix: string
  fallbackError: string
  summaryLabel: string
  summaryTitle: string
  total: string
  size: string
  backToCart: string
  emptyTitle: string
  emptyText: string
  toCatalog: string
}

type CheckoutForm = {
  name: string
  phone: string
  email: string
  address: string
  comment: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()

const form = reactive<CheckoutForm>({
  name: '',
  phone: '',
  email: '',
  address: '',
  comment: ''
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const ui = computed<CheckoutUi>(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Checkout',
      title: 'Finalizarea comenzii',
      subtitle: 'Completează datele și confirmă următorul pas al comenzii tale.',
      formTitle: 'Date client',
      name: 'Nume',
      phone: 'Telefon',
      email: 'Email',
      address: 'Adresă',
      comment: 'Comentariu',
      submit: 'Trimite comanda',
      submitting: 'Se trimite...',
      successPrefix: 'Comanda a fost trimisă. Număr comandă:',
      fallbackError: 'A apărut o eroare la trimiterea comenzii.',
      summaryLabel: 'Sumar',
      summaryTitle: 'Produse în comandă',
      total: 'Total',
      size: 'Mărime',
      backToCart: 'Înapoi la coș',
      emptyTitle: 'Nu există produse pentru checkout',
      emptyText: 'Adaugă produse în coș pentru a continua.',
      toCatalog: 'Mergi la catalog'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Checkout',
      title: 'Complete your order',
      subtitle: 'Fill in your details and confirm the next step of your order.',
      formTitle: 'Customer details',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      comment: 'Comment',
      submit: 'Submit order',
      submitting: 'Submitting...',
      successPrefix: 'Order submitted successfully. Order ID:',
      fallbackError: 'An error occurred while submitting the order.',
      summaryLabel: 'Summary',
      summaryTitle: 'Products in order',
      total: 'Total',
      size: 'Size',
      backToCart: 'Back to cart',
      emptyTitle: 'No products for checkout',
      emptyText: 'Add products to your cart to continue.',
      toCatalog: 'Go to catalog'
    }
  }

  return {
    label: 'Оформление',
    title: 'Завершение заказа',
    subtitle: 'Заполни данные и подтверди следующий шаг своего заказа.',
    formTitle: 'Данные клиента',
    name: 'Имя',
    phone: 'Телефон',
    email: 'Email',
    address: 'Адрес',
    comment: 'Комментарий',
    submit: 'Отправить заказ',
    submitting: 'Отправка...',
    successPrefix: 'Заказ успешно отправлен. Номер заказа:',
    fallbackError: 'Произошла ошибка при отправке заказа.',
    summaryLabel: 'Сводка',
    summaryTitle: 'Товары в заказе',
    total: 'Итого',
    size: 'Размер',
    backToCart: 'Вернуться в корзину',
    emptyTitle: 'Нет товаров для оформления',
    emptyText: 'Добавь товары в корзину, чтобы продолжить.',
    toCatalog: 'Перейти в каталог'
  }
})

const resetForm = () => {
  form.name = ''
  form.phone = ''
  form.email = ''
  form.address = ''
  form.comment = ''
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      data?: { statusMessage?: string }
      statusMessage?: string
    }

    return (
      maybeError.data?.statusMessage ||
      maybeError.statusMessage ||
      ui.value.fallbackError
    )
  }

  return ui.value.fallbackError
}

const submitOrder = async () => {
  successMessage.value = ''
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await $fetch<OrderResponse>('/api/order', {
      method: 'POST',
      body: {
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          comment: form.comment
        },
        items: shopStore.cart.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize
        })),
        total: shopStore.cartTotal
      }
    })

    successMessage.value = `${ui.value.successPrefix} ${response.orderId}`
    resetForm()
    shopStore.clearCart()
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  padding-top: 18px;
}

.checkout-intro,
.checkout-form-box,
.checkout-summary-box,
.empty-box {
  padding: 32px;
}

.checkout-title {
  font-size: clamp(36px, 4vw, 58px);
  line-height: 0.96;
}

.checkout-text {
  max-width: 720px;
  margin-top: 14px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 22px;
}

.checkout-form-box h2,
.summary-title {
  margin: 0;
  font-size: 32px;
  line-height: 1;
}

.checkout-form {
  margin-top: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 14px;
  font-weight: 800;
}

.field input,
.field textarea {
  width: 100%;
  min-height: 54px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 16px;
  font: inherit;
  color: var(--text);
  outline: none;
}

.field textarea {
  min-height: 140px;
  padding: 16px;
  resize: vertical;
}

.field-full {
  grid-column: 1 / -1;
}

.submit-btn {
  margin-top: 20px;
  width: 100%;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-text {
  margin: 16px 0 0;
  color: var(--primary);
  font-weight: 700;
}

.error-text {
  margin: 16px 0 0;
  color: #b42318;
  font-weight: 700;
}

.checkout-summary-box {
  align-self: start;
}

.summary-products {
  margin-top: 22px;
  display: grid;
  gap: 16px;
}

.summary-product {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.summary-product div {
  display: grid;
  gap: 6px;
}

.summary-product span {
  color: var(--muted);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 22px;
  font-size: 18px;
}

.summary-total strong {
  font-size: 24px;
}

.summary-link {
  margin-top: 20px;
  width: 100%;
}

.empty-box h2 {
  margin: 0 0 10px;
  font-size: 34px;
}

.empty-box p {
  margin: 0 0 18px;
  color: var(--muted);
  line-height: 1.7;
}

@media (max-width: 1100px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .checkout-intro,
  .checkout-form-box,
  .checkout-summary-box,
  .empty-box {
    padding: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-full {
    grid-column: auto;
  }

  .summary-product {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>