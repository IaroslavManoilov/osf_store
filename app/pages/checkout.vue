<template>
  <div class="checkout-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card checkout-intro" :class="{ compact: shopStore.cart.length > 0 }">
          <span class="section-label">{{ ui.label }}</span>
          <h1 v-if="!shopStore.cart.length" class="section-title checkout-title">{{ ui.title }}</h1>
          <p v-if="!shopStore.cart.length" class="section-text checkout-text">
            {{ ui.subtitle }}
          </p>

          <div class="checkout-steps" v-if="shopStore.cart.length">
            <div
              v-for="(step, index) in progressSteps"
              :key="step"
              class="step-pill"
              :class="{ active: index <= activeStep }"
            >
              <span>{{ index + 1 }}</span>
              <strong>{{ step }}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="shopStore.cart.length" class="section-space">
      <div class="site-container">
        <div class="checkout-layout">
          <div class="surface-card checkout-form-box">
            <h2>{{ ui.formTitle }}</h2>

            <div class="checkout-trust">
              <span>{{ ui.trust1 }}</span>
              <span>{{ ui.trust2 }}</span>
              <span>{{ ui.trust3 }}</span>
            </div>

            <form id="checkoutForm" class="checkout-form" @submit.prevent="submitOrder">
              <div class="form-grid">
                <label class="field">
                  <span>{{ ui.name }}</span>
                  <input v-model.trim="form.name" type="text" autocomplete="name" required />
                </label>

                <label class="field">
                  <span>{{ ui.phone }}</span>
                  <div class="phone-group">
                    <select v-model="form.phoneCode" :aria-label="ui.phoneCode">
                      <option v-for="code in phoneCodes" :key="code.value" :value="code.value">{{ code.label }}</option>
                    </select>
                    <input
                      v-model.trim="form.phoneLocal"
                      type="tel"
                      autocomplete="tel-national"
                      :placeholder="ui.phoneNumber"
                      required
                    />
                  </div>
                </label>

                <label class="field field-full">
                  <span>{{ ui.deliveryType }}</span>
                  <select v-model="form.deliveryType">
                    <option v-for="option in deliveryTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>{{ ui.city }}</span>
                  <input v-model.trim="form.city" type="text" autocomplete="address-level2" required />
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field">
                  <span>{{ ui.street }}</span>
                  <input v-model.trim="form.street" type="text" autocomplete="street-address" required />
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field">
                  <span>{{ ui.house }}</span>
                  <input v-model.trim="form.house" type="text" autocomplete="address-line1" required />
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field">
                  <span>{{ ui.apartment }}</span>
                  <input v-model.trim="form.apartment" type="text" autocomplete="address-line2" />
                </label>

                <label class="field">
                  <span>{{ ui.postalCode }}</span>
                  <input v-model.trim="form.postalCode" type="text" autocomplete="postal-code" />
                </label>

                <label v-if="form.deliveryType !== 'courier'" class="field field-full">
                  <span>{{ ui.pickupPoint }}</span>
                  <input v-model.trim="form.pickupPoint" type="text" :placeholder="ui.pickupPoint" required />
                </label>

                <label class="field field-full">
                  <span>{{ ui.mapQuery }}</span>
                  <div class="map-row">
                    <input v-model.trim="form.mapQuery" type="text" :placeholder="ui.mapQuery" />
                    <button type="button" class="btn-alt map-btn" @click="openMapSearch">
                      {{ ui.mapOpen }}
                    </button>
                    <a class="btn-alt map-btn" href="https://www.posta.md/ro/oficii-postale" target="_blank" rel="noopener noreferrer">
                      {{ ui.postOfficeOpen }}
                    </a>
                  </div>
                </label>
              </div>

              <details class="optional-fields">
                <summary>{{ ui.optionalTitle }}</summary>

                <div class="form-grid optional-grid">
                  <label class="field field-full">
                    <span>{{ ui.email }}</span>
                    <input v-model.trim="form.email" type="email" autocomplete="email" />
                  </label>

                  <label class="field field-full">
                    <span>{{ ui.comment }}</span>
                    <textarea v-model.trim="form.comment" rows="5" />
                  </label>
                </div>
              </details>

              <button
                type="submit"
                class="btn-main submit-btn cta-pulse"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? ui.submitting : ui.submit }}
              </button>

              <div class="mini-trust">
                <span>{{ ui.miniTrust1 }}</span>
                <span>{{ ui.miniTrust2 }}</span>
                <span>{{ ui.miniTrust3 }}</span>
              </div>
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

            <div class="checkout-guarantee">
              <strong>{{ ui.guaranteeTitle }}</strong>
              <p>{{ ui.guaranteeText }}</p>
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

    <div class="checkout-sticky-bar" v-if="shopStore.cart.length">
      <div class="sticky-total">
        <span>{{ ui.total }}</span>
        <strong>{{ shopStore.cartTotal }} MDL</strong>
      </div>

      <button form="checkoutForm" type="submit" class="btn-main sticky-submit cta-pulse" :disabled="isSubmitting">
        {{ isSubmitting ? ui.submitting : ui.submit }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProducts } from '~/data/products'

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
  phoneCode: string
  phoneNumber: string
  email: string
  deliveryType: string
  city: string
  street: string
  house: string
  apartment: string
  postalCode: string
  pickupPoint: string
  mapQuery: string
  mapOpen: string
  postOfficeOpen: string
  comment: string
  optionalTitle: string
  submit: string
  submitting: string
  trust1: string
  trust2: string
  trust3: string
  stepCart: string
  stepDetails: string
  stepConfirm: string
  guaranteeTitle: string
  guaranteeText: string
  miniTrust1: string
  miniTrust2: string
  miniTrust3: string
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
  phoneCode: string
  phoneLocal: string
  email: string
  deliveryType: 'courier' | 'post_office' | 'postamat'
  city: string
  street: string
  house: string
  apartment: string
  postalCode: string
  pickupPoint: string
  mapQuery: string
  comment: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()

const form = reactive<CheckoutForm>({
  name: '',
  phoneCode: '+373',
  phoneLocal: '',
  email: '',
  deliveryType: 'courier',
  city: '',
  street: '',
  house: '',
  apartment: '',
  postalCode: '',
  pickupPoint: '',
  mapQuery: '',
  comment: ''
})

const profileStorageKey = 'osf_checkout_profile_v1'

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
      phoneCode: 'Cod',
      phoneNumber: 'Număr local',
      email: 'Email',
      deliveryType: 'Tip livrare',
      city: 'Oraș',
      street: 'Stradă',
      house: 'Casă/Bloc',
      apartment: 'Apartament',
      postalCode: 'Cod poștal',
      pickupPoint: 'Oficiu/poștomat',
      mapQuery: 'Caută adresă pe hartă',
      mapOpen: 'Deschide harta',
      postOfficeOpen: 'Oficii Poșta Moldovei',
      comment: 'Comentariu',
      optionalTitle: 'Câmpuri opționale',
      submit: 'Trimite comanda',
      submitting: 'Se trimite...',
      trust1: 'Plată sigură',
      trust2: 'Retur în 14 zile',
      trust3: 'Confirmare rapidă',
      stepCart: 'Coș',
      stepDetails: 'Un singur pas',
      stepConfirm: 'Finalizare',
      guaranteeTitle: 'Garanție de cumpărare sigură',
      guaranteeText: 'Datele comenzii sunt procesate confidențial. Te contactăm rapid pentru confirmare.',
      miniTrust1: 'Comandă securizată',
      miniTrust2: 'Livrare 2-3 zile',
      miniTrust3: 'Suport Telegram',
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
      phoneCode: 'Code',
      phoneNumber: 'Local number',
      email: 'Email',
      deliveryType: 'Delivery type',
      city: 'City',
      street: 'Street',
      house: 'House/Building',
      apartment: 'Apartment',
      postalCode: 'Postal code',
      pickupPoint: 'Post office/locker',
      mapQuery: 'Find address on map',
      mapOpen: 'Open map',
      postOfficeOpen: 'Posta Moldovei offices',
      comment: 'Comment',
      optionalTitle: 'Optional fields',
      submit: 'Submit order',
      submitting: 'Submitting...',
      trust1: 'Secure payment',
      trust2: '14-day returns',
      trust3: 'Fast confirmation',
      stepCart: 'Cart',
      stepDetails: 'One step',
      stepConfirm: 'Complete',
      guaranteeTitle: 'Safe purchase guarantee',
      guaranteeText: 'Your order details are processed securely. Our team contacts you quickly for confirmation.',
      miniTrust1: 'Secure order',
      miniTrust2: '2-3 day delivery',
      miniTrust3: 'Telegram support',
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
    phoneCode: 'Код',
    phoneNumber: 'Локальный номер',
    email: 'Email',
    deliveryType: 'Тип доставки',
    city: 'Город',
    street: 'Улица',
    house: 'Дом/Блок',
    apartment: 'Квартира',
    postalCode: 'Почтовый индекс',
    pickupPoint: 'Отделение/поштомат',
    mapQuery: 'Найти адрес на карте',
    mapOpen: 'Открыть карту',
    postOfficeOpen: 'Отделения Poșta Moldovei',
    comment: 'Комментарий',
    optionalTitle: 'Дополнительные поля',
    submit: 'Отправить заказ',
    submitting: 'Отправка...',
    trust1: 'Безопасная оплата',
    trust2: 'Возврат 14 дней',
    trust3: 'Быстрое подтверждение',
    stepCart: 'Корзина',
    stepDetails: 'Один шаг',
    stepConfirm: 'Готово',
    guaranteeTitle: 'Гарантия безопасной покупки',
    guaranteeText: 'Данные заказа обрабатываются конфиденциально. Мы быстро связываемся для подтверждения.',
    miniTrust1: 'Безопасный заказ',
    miniTrust2: 'Доставка 2-3 дня',
    miniTrust3: 'Поддержка в Telegram',
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
  form.phoneCode = '+373'
  form.phoneLocal = ''
  form.email = ''
  form.deliveryType = 'courier'
  form.city = ''
  form.street = ''
  form.house = ''
  form.apartment = ''
  form.postalCode = ''
  form.pickupPoint = ''
  form.mapQuery = ''
  form.comment = ''
}

const loadCheckoutProfile = () => {
  if (!import.meta.client) return

  try {
    const raw = window.localStorage.getItem(profileStorageKey)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') return

    const profile = parsed as Partial<CheckoutForm>
    if (typeof profile.phoneCode === 'string') form.phoneCode = profile.phoneCode
    if (typeof profile.phoneLocal === 'string') form.phoneLocal = profile.phoneLocal
    if (typeof profile.email === 'string') form.email = profile.email
    if (profile.deliveryType === 'courier' || profile.deliveryType === 'post_office' || profile.deliveryType === 'postamat') {
      form.deliveryType = profile.deliveryType
    }
    if (typeof profile.city === 'string') form.city = profile.city
    if (typeof profile.street === 'string') form.street = profile.street
    if (typeof profile.house === 'string') form.house = profile.house
    if (typeof profile.apartment === 'string') form.apartment = profile.apartment
    if (typeof profile.postalCode === 'string') form.postalCode = profile.postalCode
    if (typeof profile.pickupPoint === 'string') form.pickupPoint = profile.pickupPoint
    if (typeof profile.mapQuery === 'string') form.mapQuery = profile.mapQuery
    if (typeof profile.comment === 'string') form.comment = profile.comment
  } catch {
    // Ignore invalid persisted profile.
  }

  // Name should always be entered manually at checkout.
  form.name = ''
}

const saveCheckoutProfile = () => {
  if (!import.meta.client) return

  try {
    window.localStorage.setItem(profileStorageKey, JSON.stringify({
      phoneCode: form.phoneCode,
      phoneLocal: form.phoneLocal,
      email: form.email,
      deliveryType: form.deliveryType,
      city: form.city,
      street: form.street,
      house: form.house,
      apartment: form.apartment,
      postalCode: form.postalCode,
      pickupPoint: form.pickupPoint,
      mapQuery: form.mapQuery
    }))
  } catch {
    // Ignore storage write failures.
  }
}

const markPurchasedProducts = (ids: string[]) => {
  if (!import.meta.client || !ids.length) return

  const storageKey = 'osf_purchased_products_v1'
  let parsed: string[] = []

  try {
    const raw = window.localStorage.getItem(storageKey)
    const data = raw ? JSON.parse(raw) : []
    parsed = Array.isArray(data) ? data.filter((item): item is string => typeof item === 'string') : []
  } catch {
    parsed = []
  }

  const merged = Array.from(new Set([...parsed, ...ids]))

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(merged))
  } catch {
    // Ignore storage write failures to avoid checkout crashes.
  }
}

const progressSteps = computed(() => [ui.value.stepDetails])

const activeStep = computed(() => {
  if (successMessage.value) return 0
  if (isSubmitting.value) return 0
  return 0
})

const phoneCodes = [
  { value: '+373', label: '+373 Moldova / PMR' },
  { value: '+40', label: '+40 Romania' },
  { value: '+380', label: '+380 Ukraine' },
  { value: '+7', label: '+7 Russia / KZ' },
  { value: '+49', label: '+49 Germany' }
]

const deliveryTypeOptions = computed(() => {
  if (locale.value === 'en') {
    return [
      { value: 'courier', label: 'Courier delivery' },
      { value: 'post_office', label: 'Post office pickup' },
      { value: 'postamat', label: 'Parcel locker' }
    ]
  }

  if (locale.value === 'ro') {
    return [
      { value: 'courier', label: 'Livrare curier' },
      { value: 'post_office', label: 'Ridicare oficiu poștal' },
      { value: 'postamat', label: 'Poștomat' }
    ]
  }

  return [
    { value: 'courier', label: 'Курьером' },
    { value: 'post_office', label: 'Самовывоз из отделения' },
    { value: 'postamat', label: 'Поштомат' }
  ]
})

const digitsOnly = (value: string) => value.replace(/\D/g, '')

const fullPhone = computed(() => `${form.phoneCode} ${digitsOnly(form.phoneLocal)}`.trim())

const fullAddress = computed(() => {
  if (form.deliveryType === 'courier') {
    return [
      'Courier',
      form.city,
      form.street,
      form.house,
      form.apartment ? `apt ${form.apartment}` : '',
      form.postalCode ? `ZIP ${form.postalCode}` : ''
    ]
      .filter(Boolean)
      .join(', ')
  }

  if (form.deliveryType === 'post_office') {
    return [
      'Post office',
      form.pickupPoint,
      form.city,
      form.postalCode ? `ZIP ${form.postalCode}` : ''
    ]
      .filter(Boolean)
      .join(', ')
  }

  return [
    'Postamat',
    form.pickupPoint,
    form.city
  ]
    .filter(Boolean)
    .join(', ')
})

const validateCheckoutContact = () => {
  const phone = digitsOnly(form.phoneLocal)
  if (phone.length < 6 || phone.length > 12) {
    return locale.value === 'en'
      ? 'Enter valid phone number'
      : locale.value === 'ro'
        ? 'Introdu un număr valid'
        : 'Введи корректный номер телефона'
  }

  if (form.deliveryType === 'courier') {
    if (!form.city || !form.street || !form.house) {
      return locale.value === 'en'
        ? 'Fill city, street and house for courier'
        : locale.value === 'ro'
          ? 'Completează orașul, strada și casa pentru curier'
          : 'Для курьера заполни город, улицу и дом'
    }
  } else if (!form.pickupPoint || !form.city) {
    return locale.value === 'en'
      ? 'Fill pickup point and city'
      : locale.value === 'ro'
        ? 'Completează punctul de ridicare și orașul'
        : 'Заполни пункт выдачи и город'
  }

  return ''
}

const openMapSearch = () => {
  if (!import.meta.client) return
  const query = encodeURIComponent(form.mapQuery || [form.city, form.street, form.house].filter(Boolean).join(' '))
  const url = `https://www.google.com/maps/search/?api=1&query=${query || 'Moldova'}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const catalogSizesById = computed(() => {
  const map = new Map<string, string[]>()
  for (const product of getProducts(locale.value)) {
    map.set(product.id, Array.isArray(product.sizes) ? product.sizes : [])
  }
  return map
})

const resolveValidSize = (item: { id: string; selectedSize?: string }) => {
  const allowedSizes = catalogSizesById.value.get(item.id) || []
  if (!allowedSizes.length) return ''

  const selected = String(item.selectedSize || '').trim()
  if (selected && allowedSizes.includes(selected)) {
    return selected
  }

  return allowedSizes[0] || ''
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

  const contactValidationError = validateCheckoutContact()
  if (contactValidationError) {
    errorMessage.value = contactValidationError
    return
  }

  isSubmitting.value = true

  try {
    const normalizedItems = shopStore.cart.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      selectedSize: resolveValidSize(item)
    }))

    const invalidItem = normalizedItems.find((item) => !item.selectedSize)
    if (invalidItem) {
      throw new Error(
        locale.value === 'en'
          ? 'Some cart items have invalid size. Please re-add product from catalog.'
          : locale.value === 'ro'
            ? 'Unele produse din coș au mărime invalidă. Adaugă produsul din nou din catalog.'
            : 'У некоторых товаров в корзине невалидный размер. Добавь товар заново из каталога.'
      )
    }

    const purchasedIds = normalizedItems.map((item) => item.id)

    const response = await $fetch<OrderResponse>('/api/order', {
      method: 'POST',
      body: {
        customer: {
          name: form.name,
          phone: fullPhone.value,
          email: form.email,
          address: fullAddress.value,
          comment: form.comment
        },
        items: normalizedItems,
        total: shopStore.cartTotal
      }
    })

    successMessage.value = `${ui.value.successPrefix} ${response.orderId}`
    markPurchasedProducts(purchasedIds)
    saveCheckoutProfile()
    resetForm()
    shopStore.clearCart()
  } catch (error: unknown) {
    const message = getErrorMessage(error)
    if (message.toLowerCase().includes('invalid size')) {
      errorMessage.value =
        locale.value === 'en'
          ? 'Invalid size in cart item. Re-add product from catalog and choose size.'
          : locale.value === 'ro'
            ? 'Mărime invalidă în coș. Adaugă produsul din nou din catalog și alege mărimea.'
            : 'Некорректный размер в корзине. Добавь товар заново из каталога и выбери размер.'
    } else {
      errorMessage.value = message
    }
  } finally {
    isSubmitting.value = false
  }
}

const siteUrl = 'https://onestyleforever.com'
const previewImage = `${siteUrl}/logo-preview.png`

onMounted(() => {
  shopStore.sanitizeCart()
  loadCheckoutProfile()
})

useSeoMeta({
  title: () => `ONE STYLE FOREVER | ${ui.value.title}`,
  description: () => ui.value.subtitle,
  ogTitle: () => `ONE STYLE FOREVER | ${ui.value.title}`,
  ogDescription: () => ui.value.subtitle,
  ogImage: previewImage,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterImage: previewImage
})
</script>

<style scoped>
.checkout-page {
  padding-top: 18px;
  padding-bottom: 84px;
}

.checkout-intro,
.checkout-form-box,
.checkout-summary-box,
.empty-box {
  padding: 32px;
}

.checkout-intro.compact {
  padding-top: 12px;
  padding-bottom: 12px;
}

.checkout-title {
  font-size: clamp(36px, 4vw, 58px);
  line-height: 0.96;
}

.checkout-text {
  max-width: 720px;
  margin-top: 14px;
}

.checkout-steps {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.step-pill {
  min-height: 38px;
  padding: 0 12px 0 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5f6d82;
}

.step-pill span {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.step-pill strong {
  font-size: 12px;
  font-weight: 800;
}

.step-pill.active {
  border-color: #bed8c4;
  background: #eef8f0;
  color: #1f5e3b;
}

.step-pill.active span {
  border-color: #9fc2a8;
  background: #dff0e4;
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

.optional-fields {
  margin-top: 14px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #fff;
  padding: 12px 14px;
}

.optional-fields summary {
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  color: #445972;
}

.optional-grid {
  margin-top: 12px;
}

.checkout-trust {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.checkout-trust span {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  color: #42576f;
  display: inline-flex;
  align-items: center;
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
.field select,
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

.phone-group {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 10px;
}

.map-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
}

.map-btn {
  min-height: 44px;
  white-space: nowrap;
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

.mini-trust {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mini-trust span {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #d4e2d4;
  background: #f8fbf8;
  font-size: 11px;
  font-weight: 700;
  color: #41586c;
  display: inline-flex;
  align-items: center;
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

.checkout-guarantee {
  margin-top: 18px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #dbe6d7;
  background: #f4f8f3;
}

.checkout-guarantee strong {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
}

.checkout-guarantee p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
  font-size: 14px;
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

.checkout-sticky-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid var(--border);
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sticky-total {
  display: grid;
  gap: 2px;
}

.sticky-total span {
  font-size: 12px;
  color: var(--muted);
}

.sticky-total strong {
  font-size: 18px;
  line-height: 1;
}

.sticky-submit {
  min-height: 44px;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 980px) and (max-width: 1100px) {
  .checkout-layout {
    grid-template-columns: minmax(0, 1fr) 340px;
  }
}

@media (max-width: 980px) {
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

  .phone-group,
  .map-row {
    grid-template-columns: 1fr;
  }

  .summary-product {
    flex-direction: column;
    align-items: flex-start;
  }

  .checkout-sticky-bar {
    display: flex;
  }
}
</style>
