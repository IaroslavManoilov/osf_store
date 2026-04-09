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
                <label class="field" :class="{ invalid: !!fieldErrors.name }">
                  <span>{{ ui.name }}</span>
                  <input v-model.trim="form.name" type="text" autocomplete="name" required />
                  <small v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</small>
                </label>

                <label class="field" :class="{ invalid: !!fieldErrors.phone }">
                  <span>{{ ui.phone }}</span>
                  <div class="phone-group">
                    <select v-model="form.phoneCode" :aria-label="ui.phoneCode">
                      <option v-for="code in phoneCodes" :key="code.value" :value="code.value">{{ code.label }}</option>
                    </select>
                    <input
                      v-model.trim="form.phoneLocal"
                      type="tel"
                      autocomplete="tel-national"
                      :placeholder="phonePlaceholderByCode"
                      @input="onPhoneInput"
                      required
                    />
                  </div>
                  <small v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</small>
                </label>

                <label class="field field-full">
                  <span>{{ ui.deliveryType }}</span>
                  <select v-model="form.deliveryType">
                    <option v-for="option in deliveryTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="field" :class="{ invalid: !!fieldErrors.city }">
                  <span>{{ ui.city }}</span>
                  <input
                    v-model.trim="form.city"
                    type="text"
                    list="checkout-city-list"
                    autocomplete="address-level2"
                    @change="onCitySuggestionSelected"
                    required
                  />
                  <datalist id="checkout-city-list">
                    <option v-for="city in citySuggestions" :key="`city-${city}`" :value="city" />
                  </datalist>
                  <small v-if="fieldErrors.city" class="field-error">{{ fieldErrors.city }}</small>
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field" :class="{ invalid: !!fieldErrors.street }">
                  <span>{{ ui.street }}</span>
                  <input
                    v-model.trim="form.street"
                    type="text"
                    list="checkout-street-list"
                    autocomplete="street-address"
                    @change="onStreetSuggestionSelected"
                    required
                  />
                  <datalist id="checkout-street-list">
                    <option v-for="street in streetSuggestions" :key="`street-${street}`" :value="street" />
                  </datalist>
                  <small v-if="fieldErrors.street" class="field-error">{{ fieldErrors.street }}</small>
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field" :class="{ invalid: !!fieldErrors.house }">
                  <span>{{ ui.house }}</span>
                  <input v-model.trim="form.house" type="text" autocomplete="address-line1" required />
                  <small v-if="fieldErrors.house" class="field-error">{{ fieldErrors.house }}</small>
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field">
                  <span>{{ ui.apartment }}</span>
                  <input v-model.trim="form.apartment" type="text" autocomplete="address-line2" />
                </label>

                <label class="field">
                  <span>{{ ui.postalCode }}</span>
                  <input v-model.trim="form.postalCode" type="text" autocomplete="postal-code" />
                </label>

                <label v-if="form.deliveryType !== 'courier'" class="field field-full" :class="{ invalid: !!fieldErrors.pickupPoint }">
                  <span>{{ ui.pickupPoint }}</span>
                  <input v-model.trim="form.pickupPoint" type="text" :placeholder="ui.pickupPoint" list="checkout-pickup-list" required />
                  <datalist id="checkout-pickup-list">
                    <option v-for="point in pickupPointSuggestions" :key="`pickup-${point}`" :value="point" />
                  </datalist>
                  <small v-if="fieldErrors.pickupPoint" class="field-error">{{ fieldErrors.pickupPoint }}</small>
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
              <p v-if="draftSavedAtLabel" class="draft-note">{{ ui.draftSaved }} {{ draftSavedAtLabel }}</p>
            </form>

            <div v-if="successMessage" class="success-wrap">
              <p class="success-text">
                {{ successMessage }}
              </p>
              <NuxtLink v-if="ordersTrackLink" :to="ordersTrackLink" class="btn-alt success-orders-link">
                {{ ui.openMyOrders }}
              </NuxtLink>
            </div>

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
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProducts } from '~/data/products'

type OrderResponse = {
  success: boolean
  orderId: string
  trackToken?: string
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
  openMyOrders: string
  fallbackError: string
  summaryLabel: string
  summaryTitle: string
  total: string
  size: string
  backToCart: string
  emptyTitle: string
  emptyText: string
  toCatalog: string
  draftSaved: string
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

type GeoSuggestionEntry = {
  value: string
  city?: string
  street?: string
  postalCode?: string
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
const draftStorageKey = 'osf_checkout_draft_v1'
const orderTracksStorageKey = 'osf_order_tracks_v1'

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const draftSavedAt = ref('')
const checkoutCsrfToken = ref('')
const lastOrderId = ref('')
const lastTrackToken = ref('')
const fieldErrors = reactive<Record<'name' | 'phone' | 'city' | 'street' | 'house' | 'pickupPoint', string>>({
  name: '',
  phone: '',
  city: '',
  street: '',
  house: '',
  pickupPoint: ''
})

const ordersTrackLink = computed(() => {
  if (!lastOrderId.value || !lastTrackToken.value) return ''
  return localePath({
    path: '/orders',
    query: {
      orderId: lastOrderId.value,
      trackToken: lastTrackToken.value
    }
  })
})

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
      openMyOrders: 'Deschide comenzile mele',
      fallbackError: 'A apărut o eroare la trimiterea comenzii.',
      summaryLabel: 'Sumar',
      summaryTitle: 'Produse în comandă',
      total: 'Total',
      size: 'Mărime',
      backToCart: 'Înapoi la coș',
      emptyTitle: 'Nu există produse pentru checkout',
      emptyText: 'Adaugă produse în coș pentru a continua.',
      toCatalog: 'Mergi la catalog',
      draftSaved: 'Ciornă salvată:'
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
      openMyOrders: 'Open my orders',
      fallbackError: 'An error occurred while submitting the order.',
      summaryLabel: 'Summary',
      summaryTitle: 'Products in order',
      total: 'Total',
      size: 'Size',
      backToCart: 'Back to cart',
      emptyTitle: 'No products for checkout',
      emptyText: 'Add products to your cart to continue.',
      toCatalog: 'Go to catalog',
      draftSaved: 'Draft saved:'
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
    openMyOrders: 'Открыть мои заказы',
    fallbackError: 'Произошла ошибка при отправке заказа.',
    summaryLabel: 'Сводка',
    summaryTitle: 'Товары в заказе',
    total: 'Итого',
    size: 'Размер',
    backToCart: 'Вернуться в корзину',
    emptyTitle: 'Нет товаров для оформления',
    emptyText: 'Добавь товары в корзину, чтобы продолжить.',
    toCatalog: 'Перейти в каталог',
    draftSaved: 'Черновик сохранён:'
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
  clearFieldErrors()
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

const loadCheckoutDraft = () => {
  if (!import.meta.client) return
  try {
    const raw = window.localStorage.getItem(draftStorageKey)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') return
    const draft = parsed as Partial<CheckoutForm> & { savedAt?: string }
    if (typeof draft.name === 'string') form.name = draft.name
    if (typeof draft.phoneCode === 'string') form.phoneCode = draft.phoneCode
    if (typeof draft.phoneLocal === 'string') form.phoneLocal = draft.phoneLocal
    if (typeof draft.email === 'string') form.email = draft.email
    if (draft.deliveryType === 'courier' || draft.deliveryType === 'post_office' || draft.deliveryType === 'postamat') {
      form.deliveryType = draft.deliveryType
    }
    if (typeof draft.city === 'string') form.city = draft.city
    if (typeof draft.street === 'string') form.street = draft.street
    if (typeof draft.house === 'string') form.house = draft.house
    if (typeof draft.apartment === 'string') form.apartment = draft.apartment
    if (typeof draft.postalCode === 'string') form.postalCode = draft.postalCode
    if (typeof draft.pickupPoint === 'string') form.pickupPoint = draft.pickupPoint
    if (typeof draft.mapQuery === 'string') form.mapQuery = draft.mapQuery
    if (typeof draft.comment === 'string') form.comment = draft.comment
    if (typeof draft.savedAt === 'string') draftSavedAt.value = draft.savedAt
  } catch {
    // Ignore malformed draft payload.
  }
}

const saveCheckoutDraft = () => {
  if (!import.meta.client) return
  const savedAt = new Date().toISOString()
  try {
    window.localStorage.setItem(draftStorageKey, JSON.stringify({
      ...form,
      savedAt
    }))
    draftSavedAt.value = savedAt
  } catch {
    // Ignore localStorage write errors.
  }
}

const clearCheckoutDraft = () => {
  if (!import.meta.client) return
  try {
    window.localStorage.removeItem(draftStorageKey)
  } catch {
    // Ignore remove errors.
  }
  draftSavedAt.value = ''
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

const saveOrderTrack = (orderId: string, token: string) => {
  if (!import.meta.client || !orderId || !token) return

  type SavedTrack = {
    id: string
    token: string
    createdAt: string
  }

  let tracks: SavedTrack[] = []

  try {
    const raw = window.localStorage.getItem(orderTracksStorageKey)
    const parsed = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed)) {
      tracks = parsed.filter((item): item is SavedTrack =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as SavedTrack).id === 'string' &&
        typeof (item as SavedTrack).token === 'string'
      )
    }
  } catch {
    tracks = []
  }

  const next = [
    {
      id: orderId,
      token,
      createdAt: new Date().toISOString()
    },
    ...tracks.filter((item) => item.id !== orderId)
  ].slice(0, 30)

  try {
    window.localStorage.setItem(orderTracksStorageKey, JSON.stringify(next))
  } catch {
    // Ignore storage failures.
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

const countryPhoneRules: Record<string, { min: number; max: number; groups: number[]; placeholder: string }> = {
  '+373': { min: 8, max: 8, groups: [2, 3, 3], placeholder: '68 123 456' },
  '+40': { min: 9, max: 9, groups: [3, 3, 3], placeholder: '712 345 678' },
  '+380': { min: 9, max: 9, groups: [2, 3, 2, 2], placeholder: '67 123 45 67' },
  '+7': { min: 10, max: 10, groups: [3, 3, 2, 2], placeholder: '999 123 45 67' },
  '+49': { min: 10, max: 11, groups: [3, 3, 2, 2], placeholder: '151 234 56 78' }
}
const defaultPhoneRule = countryPhoneRules['+373']!
const remoteCitySuggestions = ref<GeoSuggestionEntry[]>([])
const remoteStreetSuggestions = ref<GeoSuggestionEntry[]>([])
let citySuggestTimer: ReturnType<typeof setTimeout> | null = null
let streetSuggestTimer: ReturnType<typeof setTimeout> | null = null

const countryCitySuggestions: Record<string, string[]> = {
  '+373': ['Chișinău', 'Bălți', 'Tiraspol', 'Bender', 'Cahul', 'Comrat', 'Orhei', 'Ungheni'],
  '+40': ['Bucharest', 'Iași', 'Cluj-Napoca', 'Timișoara', 'Brașov', 'Constanța'],
  '+380': ['Kyiv', 'Odesa', 'Lviv', 'Dnipro', 'Kharkiv'],
  '+7': ['Moscow', 'Saint Petersburg', 'Kazan', 'Novosibirsk', 'Almaty', 'Astana'],
  '+49': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt']
}

const defaultStreetSuggestions = [
  'Stefan cel Mare',
  'Alba Iulia',
  'Independentei',
  'Decebal',
  'Dacia',
  'Trandafirilor',
  'Puskin',
  'Mihai Eminescu'
]

const cityStreetSuggestions: Record<string, string[]> = {
  'chișinău': ['Stefan cel Mare', 'Alba Iulia', 'Dacia', 'Bulevardul Moscova', 'Trandafirilor'],
  'bălți': ['Independentei', 'Stefan cel Mare', 'Calea Ieșilor'],
  'tiraspol': ['25 Octombrie', 'Mira', 'Karl Liebknecht'],
  'bender': ['Lenin', 'Suvorov', 'Dzerjinski']
}

const pickupPointBase: Record<string, string[]> = {
  '+373': ['Poșta Moldovei • Chișinău Centru', 'Poșta Moldovei • Botanica', 'Poștomat Nova Poshta'],
  '+40': ['Post Office • City Center', 'Easybox • Main Station'],
  '+380': ['Nova Poshta • Branch 1', 'Nova Poshta • Parcel Locker'],
  '+7': ['PickPoint • Center', 'CDEK • Pickup point'],
  '+49': ['DHL Packstation', 'Hermes PaketShop']
}

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

const phoneRule = computed(() => countryPhoneRules[form.phoneCode] || defaultPhoneRule)
const phonePlaceholderByCode = computed(() => phoneRule.value.placeholder || ui.value.phoneNumber)

const formatPhoneLocalByRule = (value: string, groups: number[]) => {
  const digits = digitsOnly(value)
  const chunks: string[] = []
  let pointer = 0
  for (const size of groups) {
    if (pointer >= digits.length) break
    chunks.push(digits.slice(pointer, pointer + size))
    pointer += size
  }
  if (pointer < digits.length) chunks.push(digits.slice(pointer))
  return chunks.join(' ')
}

const onPhoneInput = () => {
  const rule = phoneRule.value
  const clean = digitsOnly(form.phoneLocal).slice(0, rule.max)
  form.phoneLocal = formatPhoneLocalByRule(clean, rule.groups)
}

const mergeUnique = (items: string[]) =>
  Array.from(new Set(items.map((item) => String(item || '').trim()).filter(Boolean))).slice(0, 10)

const findEntryByValue = (entries: GeoSuggestionEntry[], value: string) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return null
  return entries.find((entry) => String(entry.value || '').trim().toLowerCase() === normalized) || null
}

const applySuggestionData = (entry: GeoSuggestionEntry | null, kind: 'city' | 'street') => {
  if (!entry) return

  if (kind === 'city' && entry.city) {
    form.city = entry.city
  }

  if (kind === 'street' && entry.street) {
    form.street = entry.street
  }

  if (!form.city && entry.city) {
    form.city = entry.city
  }

  if (!form.postalCode && entry.postalCode) {
    form.postalCode = entry.postalCode
  }
}

const citySuggestions = computed(() => {
  const local = countryCitySuggestions[form.phoneCode] || countryCitySuggestions['+373']
  return mergeUnique([...remoteCitySuggestions.value.map((item) => item.value), ...local])
})

const streetSuggestions = computed(() => {
  const city = String(form.city || '').trim().toLowerCase()
  const local = !city ? defaultStreetSuggestions : (cityStreetSuggestions[city] || defaultStreetSuggestions)
  return mergeUnique([...remoteStreetSuggestions.value.map((item) => item.value), ...local])
})

const pickupPointSuggestions = computed(() => pickupPointBase[form.phoneCode] || pickupPointBase['+373'])

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

const draftSavedAtLabel = computed(() => {
  if (!draftSavedAt.value) return ''
  const date = new Date(draftSavedAt.value)
  if (Number.isNaN(date.getTime())) return ''
  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
})

const clearFieldErrors = () => {
  fieldErrors.name = ''
  fieldErrors.phone = ''
  fieldErrors.city = ''
  fieldErrors.street = ''
  fieldErrors.house = ''
  fieldErrors.pickupPoint = ''
}

const validateCheckoutContact = () => {
  clearFieldErrors()
  const name = String(form.name || '').trim()
  const phone = digitsOnly(form.phoneLocal)
  const rule = phoneRule.value

  if (name.length < 2) {
    fieldErrors.name = locale.value === 'en'
      ? 'Enter your name'
      : locale.value === 'ro'
        ? 'Introdu numele tău'
        : 'Введи имя'
  }

  if (phone.length < rule.min || phone.length > rule.max) {
    fieldErrors.phone = locale.value === 'en'
      ? `Enter valid phone (${rule.min}-${rule.max} digits)`
      : locale.value === 'ro'
        ? `Introdu telefon valid (${rule.min}-${rule.max} cifre)`
        : `Введи корректный номер (${rule.min}-${rule.max} цифр)`
  }

  if (form.deliveryType === 'courier') {
    if (!form.city) fieldErrors.city = locale.value === 'en' ? 'Enter city' : locale.value === 'ro' ? 'Completează orașul' : 'Заполни город'
    if (!form.street) fieldErrors.street = locale.value === 'en' ? 'Enter street' : locale.value === 'ro' ? 'Completează strada' : 'Заполни улицу'
    if (!form.house) fieldErrors.house = locale.value === 'en' ? 'Enter house/building' : locale.value === 'ro' ? 'Completează casa/blocul' : 'Заполни дом/блок'
  } else {
    if (!form.city) fieldErrors.city = locale.value === 'en' ? 'Enter city' : locale.value === 'ro' ? 'Completează orașul' : 'Заполни город'
    if (!form.pickupPoint) {
      fieldErrors.pickupPoint = locale.value === 'en'
        ? 'Select pickup point'
        : locale.value === 'ro'
          ? 'Alege punctul de ridicare'
          : 'Выбери пункт выдачи'
    }
  }

  const firstError = fieldErrors.name || fieldErrors.phone || fieldErrors.city || fieldErrors.street || fieldErrors.house || fieldErrors.pickupPoint
  return firstError || ''
}

const openMapSearch = () => {
  if (!import.meta.client) return
  const query = encodeURIComponent(form.mapQuery || [form.city, form.street, form.house].filter(Boolean).join(' '))
  const url = `https://www.google.com/maps/search/?api=1&query=${query || 'Moldova'}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const onCitySuggestionSelected = () => {
  const entry = findEntryByValue(remoteCitySuggestions.value, form.city)
  applySuggestionData(entry, 'city')
}

const onStreetSuggestionSelected = () => {
  const entry = findEntryByValue(remoteStreetSuggestions.value, form.street)
  applySuggestionData(entry, 'street')
}

const fetchGeoSuggestions = async (kind: 'city' | 'street', query: string) => {
  const q = String(query || '').trim()
  if (q.length < 2) {
    if (kind === 'city') remoteCitySuggestions.value = []
    if (kind === 'street') remoteStreetSuggestions.value = []
    return
  }

  try {
    const response = await $fetch<{ success: boolean; entries?: GeoSuggestionEntry[]; items?: string[] }>('/api/geo/suggest', {
      method: 'GET',
      query: {
        kind,
        q,
        city: form.city,
        phoneCode: form.phoneCode
      }
    })
    const entries = Array.isArray(response?.entries)
      ? response.entries
          .filter((item): item is GeoSuggestionEntry => !!item && typeof item.value === 'string')
          .map((item) => ({
            value: String(item.value || '').trim(),
            city: item.city ? String(item.city).trim() : undefined,
            street: item.street ? String(item.street).trim() : undefined,
            postalCode: item.postalCode ? String(item.postalCode).trim() : undefined
          }))
      : []
    if (kind === 'city') {
      remoteCitySuggestions.value = entries
      return
    }
    remoteStreetSuggestions.value = entries
  } catch {
    if (kind === 'city') remoteCitySuggestions.value = []
    if (kind === 'street') remoteStreetSuggestions.value = []
  }
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
  clearFieldErrors()
  lastOrderId.value = ''
  lastTrackToken.value = ''

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
      headers: checkoutCsrfToken.value
        ? {
            'x-checkout-csrf': checkoutCsrfToken.value
          }
        : undefined,
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
    lastOrderId.value = response.orderId
    if (response.trackToken) {
      lastTrackToken.value = response.trackToken
      saveOrderTrack(response.orderId, response.trackToken)
    }
    markPurchasedProducts(purchasedIds)
    saveCheckoutProfile()
    clearCheckoutDraft()
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
  loadCheckoutDraft()
  onPhoneInput()
  $fetch<{ success: boolean; csrfToken?: string }>('/api/checkout/csrf')
    .then((response) => {
      checkoutCsrfToken.value = String(response?.csrfToken || '')
    })
    .catch(() => {
      checkoutCsrfToken.value = ''
    })
})

let draftTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => ({
    name: form.name,
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
    mapQuery: form.mapQuery,
    comment: form.comment
  }),
  () => {
    if (draftTimer) clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      saveCheckoutDraft()
    }, 260)
  },
  { deep: true }
)

watch(() => form.phoneCode, () => {
  onPhoneInput()
  fieldErrors.phone = ''
  remoteCitySuggestions.value = []
  remoteStreetSuggestions.value = []

  if (citySuggestTimer) clearTimeout(citySuggestTimer)
  citySuggestTimer = setTimeout(() => {
    fetchGeoSuggestions('city', form.city)
  }, 260)
})

watch(() => form.phoneLocal, () => {
  fieldErrors.phone = ''
})

watch(() => form.name, () => {
  fieldErrors.name = ''
})

watch(() => form.city, () => {
  fieldErrors.city = ''

  if (citySuggestTimer) clearTimeout(citySuggestTimer)
  citySuggestTimer = setTimeout(() => {
    fetchGeoSuggestions('city', form.city)
  }, 260)
})

watch(() => form.street, () => {
  fieldErrors.street = ''

  if (streetSuggestTimer) clearTimeout(streetSuggestTimer)
  streetSuggestTimer = setTimeout(() => {
    fetchGeoSuggestions('street', form.street)
  }, 260)
})

watch(() => form.house, () => {
  fieldErrors.house = ''
})

watch(() => form.pickupPoint, () => {
  fieldErrors.pickupPoint = ''
})

onBeforeUnmount(() => {
  if (draftTimer) {
    clearTimeout(draftTimer)
    draftTimer = null
  }
  if (citySuggestTimer) {
    clearTimeout(citySuggestTimer)
    citySuggestTimer = null
  }
  if (streetSuggestTimer) {
    clearTimeout(streetSuggestTimer)
    streetSuggestTimer = null
  }
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

.field.invalid input,
.field.invalid select,
.field.invalid textarea {
  border-color: #e39e9e;
  box-shadow: 0 0 0 3px #fff3f3;
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

.field-error {
  color: #b42318;
  font-size: 12px;
  font-weight: 700;
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

.draft-note {
  margin: 10px 0 0;
  color: #5f7187;
  font-size: 12px;
  font-weight: 700;
}

.success-text {
  margin: 16px 0 0;
  color: var(--primary);
  font-weight: 700;
}

.success-wrap {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.success-wrap .success-text {
  margin: 0;
}

.success-orders-link {
  width: fit-content;
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
