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
                  <input id="checkout-name" v-model.trim="form.name" type="text" autocomplete="name" required />
                  <small v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</small>
                </label>

                <label class="field" :class="{ invalid: !!fieldErrors.phone }">
                  <span>{{ ui.phone }}</span>
                  <div class="phone-group">
                    <select v-model="form.phoneCode" :aria-label="ui.phoneCode">
                      <option v-for="code in phoneCodes" :key="code.value" :value="code.value">{{ code.label }}</option>
                    </select>
                    <input
                      id="checkout-phone-local"
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

                <label class="field field-full">
                  <span>{{ ui.paymentMethod }}</span>
                  <select v-model="form.paymentMethod">
                    <option v-for="option in paymentMethodOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <small class="payment-hint">{{ paymentMethodHint }}</small>
                </label>

                <label class="field" :class="{ invalid: !!fieldErrors.city }">
                  <span>{{ ui.city }}</span>
                  <div ref="citySuggestRef" class="suggest-wrap">
                    <input
                      id="checkout-city"
                      v-model.trim="form.city"
                      type="text"
                      autocomplete="address-level2"
                      @focus="openSuggest('city')"
                      @input="openSuggest('city')"
                      @keydown.esc.prevent="closeSuggest"
                      @keydown="onCityKeydown"
                      required
                    />
                    <div v-if="showCitySuggest" class="suggest-menu">
                      <div v-if="citySuggestLoading" class="suggest-state">{{ ui.suggestLoading }}</div>
                      <div v-else-if="!citySuggestEntries.length" class="suggest-state">{{ ui.suggestEmpty }}</div>
                      <button
                        v-for="entry in citySuggestEntries"
                        :key="`city-${entry.value}`"
                        type="button"
                        class="suggest-item"
                        :class="{ active: citySuggestEntries[citySuggestIndex]?.value === entry.value }"
                        @mousedown.prevent="selectCitySuggestion(entry)"
                      >
                        <span class="suggest-main" v-html="highlightSuggestion(entry.value, form.city)"></span>
                        <small v-if="entry.postalCode">{{ ui.postalCode }}: {{ entry.postalCode }}</small>
                      </button>
                    </div>
                  </div>
                  <small v-if="fieldErrors.city" class="field-error">{{ fieldErrors.city }}</small>
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field" :class="{ invalid: !!fieldErrors.street }">
                  <span>{{ ui.street }}</span>
                  <div ref="streetSuggestRef" class="suggest-wrap">
                    <input
                      id="checkout-street"
                      v-model.trim="form.street"
                      type="text"
                      autocomplete="street-address"
                      @focus="openSuggest('street')"
                      @input="openSuggest('street')"
                      @keydown.esc.prevent="closeSuggest"
                      @keydown="onStreetKeydown"
                      required
                    />
                    <div v-if="showStreetSuggest" class="suggest-menu">
                      <div v-if="streetSuggestLoading" class="suggest-state">{{ ui.suggestLoading }}</div>
                      <div v-else-if="!streetSuggestEntries.length" class="suggest-state">{{ ui.suggestEmpty }}</div>
                      <button
                        v-for="entry in streetSuggestEntries"
                        :key="`street-${entry.value}`"
                        type="button"
                        class="suggest-item"
                        :class="{ active: streetSuggestEntries[streetSuggestIndex]?.value === entry.value }"
                        @mousedown.prevent="selectStreetSuggestion(entry)"
                      >
                        <span class="suggest-main" v-html="highlightSuggestion(entry.value, form.street)"></span>
                        <small v-if="entry.city || entry.postalCode">
                          {{ entry.city || '' }}<template v-if="entry.city && entry.postalCode"> · </template>{{ entry.postalCode || '' }}
                        </small>
                      </button>
                    </div>
                  </div>
                  <small v-if="fieldErrors.street" class="field-error">{{ fieldErrors.street }}</small>
                </label>

                <label v-if="form.deliveryType === 'courier'" class="field" :class="{ invalid: !!fieldErrors.house }">
                  <span>{{ ui.house }}</span>
                  <input id="checkout-house" v-model.trim="form.house" type="text" autocomplete="address-line1" required />
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
                  <input id="checkout-pickup-point" v-model.trim="form.pickupPoint" type="text" :placeholder="ui.pickupPoint" list="checkout-pickup-list" required />
                  <datalist id="checkout-pickup-list">
                    <option v-for="point in pickupPointSuggestions" :key="`pickup-${point}`" :value="point" />
                  </datalist>
                  <small v-if="fieldErrors.pickupPoint" class="field-error">{{ fieldErrors.pickupPoint }}</small>
                </label>

                <label class="field field-full">
                  <span>{{ ui.mapQuery }}</span>
                  <div class="map-row">
                    <div ref="mapSuggestRef" class="suggest-wrap">
                      <input
                        v-model.trim="form.mapQuery"
                        type="text"
                        :placeholder="ui.mapQuery"
                        @focus="openSuggest('map')"
                        @input="openSuggest('map')"
                        @keydown.esc.prevent="closeSuggest"
                        @keydown="onMapKeydown"
                      />
                      <div v-if="showMapSuggest" class="suggest-menu">
                        <div v-if="mapRecentEntries.length" class="suggest-group-title">
                          {{ ui.quickAddressFromHistory }}
                        </div>
                        <button
                          v-for="item in mapRecentEntries"
                          :key="`map-recent-${item.id}`"
                          type="button"
                          class="suggest-item suggest-item-recent"
                          @mousedown.prevent="selectRecentMapAddress(item)"
                        >
                          <span class="suggest-main">{{ mapRecentLabel(item) }}</span>
                          <small>{{ quickAddressDateLabel(item.createdAt) }}</small>
                        </button>
                        <div v-if="mapRecentEntries.length && (mapSuggestLoading || mapSuggestEntries.length)" class="suggest-divider" />
                        <div v-if="mapSuggestLoading" class="suggest-state">{{ ui.suggestLoading }}</div>
                        <div v-else-if="!mapSuggestEntries.length" class="suggest-state">{{ ui.suggestEmpty }}</div>
                        <button
                          v-for="entry in mapSuggestEntries"
                          :key="`map-${entry.value}`"
                          type="button"
                          class="suggest-item"
                          :class="{ active: mapSuggestEntries[mapSuggestIndex]?.value === entry.value }"
                          @mousedown.prevent="selectMapSuggestion(entry)"
                        >
                          <span class="suggest-main" v-html="highlightSuggestion(entry.value, form.mapQuery)"></span>
                          <small v-if="entry.city || entry.street || entry.postalCode">
                            {{ entry.city || '' }}
                            <template v-if="entry.city && entry.street"> · </template>
                            {{ entry.street || '' }}
                            <template v-if="(entry.city || entry.street) && entry.postalCode"> · </template>
                            {{ entry.postalCode || '' }}
                          </small>
                        </button>
                      </div>
                    </div>
                    <button type="button" class="btn-alt map-btn" @click="openMapSearch">
                      {{ ui.mapOpen }}
                    </button>
                    <a class="btn-alt map-btn" href="https://www.posta.md/ro/oficii-postale" target="_blank" rel="noopener noreferrer">
                      {{ ui.postOfficeOpen }}
                    </a>
                  </div>
                </label>

                <div class="quick-addresses field-full">
                  <div class="quick-addresses-head">
                    <span class="quick-addresses-title">{{ ui.quickAddressTitle }}</span>
                    <small v-if="quickAddressEntries.length">{{ ui.quickAddressFromHistory }}</small>
                  </div>

                  <div v-if="quickAddressEntries.length" class="quick-addresses-list">
                    <article v-for="item in quickAddressEntries" :key="item.id" class="quick-address-card">
                      <div class="quick-address-meta">
                        <strong>{{ quickAddressLabel(item) }}</strong>
                        <span>{{ quickAddressDateLabel(item.createdAt) }}</span>
                      </div>
                      <button type="button" class="btn-alt quick-address-use" @click="applyQuickAddress(item)">
                        {{ ui.quickAddressApply }}
                      </button>
                    </article>
                  </div>

                  <p v-else class="quick-address-empty">{{ ui.quickAddressEmpty }}</p>
                </div>
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
                :disabled="!isCheckoutReady"
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
              <div v-if="receiptData" class="receipt-box">
                <strong>{{ ui.receiptTitle }}</strong>
                <span>{{ receiptData.orderId }} · {{ receiptData.total }} MDL</span>
                <span>{{ paymentMethodLabel(receiptData.paymentMethod) }}</span>
              </div>
              <div v-if="receiptData" class="receipt-actions">
                <button type="button" class="btn-alt" @click="printReceipt">{{ ui.receiptPrint }}</button>
                <button type="button" class="btn-alt" @click="downloadReceipt">{{ ui.receiptDownload }}</button>
              </div>
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

            <div class="summary-payment">
              <span>{{ ui.paymentMethod }}</span>
              <strong>{{ paymentMethodLabel(form.paymentMethod) }}</strong>
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

      <button form="checkoutForm" type="submit" class="btn-main sticky-submit cta-pulse" :disabled="!isCheckoutReady">
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
  total?: number
  payment?: {
    method: 'card_online' | 'phone_transfer' | 'cash_on_delivery'
    status: 'pending' | 'paid' | 'cash_on_delivery'
    checkoutUrl?: string
  }
  receipt?: ReceiptData
  message?: string
}

type ReceiptData = {
  orderId: string
  createdAt: string
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentMethod: 'card_online' | 'phone_transfer' | 'cash_on_delivery'
  paymentStatus: 'pending' | 'paid' | 'cash_on_delivery'
  items: Array<{
    title: string
    quantity: number
    selectedSize?: string
    price: number
    lineTotal: number
  }>
  total: number
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
  paymentMethod: string
  paymentCard: string
  paymentPhone: string
  paymentCash: string
  paymentHintCard: string
  paymentHintPhone: string
  paymentHintCash: string
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
  quickAddressTitle: string
  quickAddressEmpty: string
  quickAddressApply: string
  quickAddressFromHistory: string
  summaryLabel: string
  summaryTitle: string
  total: string
  size: string
  backToCart: string
  emptyTitle: string
  emptyText: string
  toCatalog: string
  draftSaved: string
  suggestLoading: string
  suggestEmpty: string
  receiptTitle: string
  receiptPrint: string
  receiptDownload: string
}

type CheckoutForm = {
  name: string
  phoneCode: string
  phoneLocal: string
  email: string
  deliveryType: 'courier' | 'post_office' | 'postamat'
  paymentMethod: 'card_online' | 'phone_transfer' | 'cash_on_delivery'
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
  house?: string
  postalCode?: string
}

type QuickAddress = {
  id: string
  phoneCode: string
  deliveryType: CheckoutForm['deliveryType']
  city: string
  street: string
  house: string
  apartment: string
  postalCode: string
  pickupPoint: string
  createdAt: string
}

type CheckoutDraftPayload = Partial<CheckoutForm> & { savedAt?: string }

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const shopStore = useShopStore()

const form = reactive<CheckoutForm>({
  name: '',
  phoneCode: '+373',
  phoneLocal: '',
  email: '',
  deliveryType: 'courier',
  paymentMethod: 'cash_on_delivery',
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
const quickAddressesStorageKey = 'osf_checkout_quick_addresses_v1'

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const draftSavedAt = ref('')
const checkoutCsrfToken = ref('')
const lastOrderId = ref('')
const lastTrackToken = ref('')
const receiptData = ref<ReceiptData | null>(null)
const quickAddresses = ref<QuickAddress[]>([])
const isHydratingFromDraft = ref(false)
const lastServerDraftLoadedPhone = ref('')
let draftServerSyncTimer: ReturnType<typeof setTimeout> | null = null
let phoneDraftSyncTimer: ReturnType<typeof setTimeout> | null = null
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
      paymentMethod: 'Metodă de plată',
      paymentCard: 'Card online',
      paymentPhone: 'Transfer prin telefon',
      paymentCash: 'Numerar la livrare',
      paymentHintCard: 'Plătești cu cardul după confirmarea comenzii.',
      paymentHintPhone: 'Primești detalii de transfer pe telefon.',
      paymentHintCash: 'Plătești cash la primirea coletului.',
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
      quickAddressTitle: 'Adrese recente',
      quickAddressEmpty: 'După prima comandă, adresele vor apărea aici.',
      quickAddressApply: 'Folosește',
      quickAddressFromHistory: 'Istoric',
      summaryLabel: 'Sumar',
      summaryTitle: 'Produse în comandă',
      total: 'Total',
      size: 'Mărime',
      backToCart: 'Înapoi la coș',
      emptyTitle: 'Nu există produse pentru checkout',
      emptyText: 'Adaugă produse în coș pentru a continua.',
      toCatalog: 'Mergi la catalog',
      draftSaved: 'Ciornă salvată:',
      suggestLoading: 'Se caută adrese...',
      suggestEmpty: 'Nu am găsit variante',
      receiptTitle: 'Bon comandă',
      receiptPrint: 'Printează bonul',
      receiptDownload: 'Descarcă bonul'
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
      paymentMethod: 'Payment method',
      paymentCard: 'Card online',
      paymentPhone: 'Phone transfer',
      paymentCash: 'Cash on delivery',
      paymentHintCard: 'Pay by card after order confirmation.',
      paymentHintPhone: 'You will get transfer details to your phone.',
      paymentHintCash: 'Pay in cash when courier delivers your order.',
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
      quickAddressTitle: 'Recent addresses',
      quickAddressEmpty: 'After your first order, addresses will appear here.',
      quickAddressApply: 'Use address',
      quickAddressFromHistory: 'History',
      summaryLabel: 'Summary',
      summaryTitle: 'Products in order',
      total: 'Total',
      size: 'Size',
      backToCart: 'Back to cart',
      emptyTitle: 'No products for checkout',
      emptyText: 'Add products to your cart to continue.',
      toCatalog: 'Go to catalog',
      draftSaved: 'Draft saved:',
      suggestLoading: 'Searching addresses...',
      suggestEmpty: 'No suggestions found',
      receiptTitle: 'Order receipt',
      receiptPrint: 'Print receipt',
      receiptDownload: 'Download receipt'
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
    paymentMethod: 'Способ оплаты',
    paymentCard: 'Картой онлайн',
    paymentPhone: 'Перевод по телефону',
    paymentCash: 'Наличными при доставке',
    paymentHintCard: 'Оплата картой после подтверждения заказа.',
    paymentHintPhone: 'Реквизиты для перевода придут на телефон.',
    paymentHintCash: 'Оплата наличными при получении.',
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
    quickAddressTitle: 'Недавние адреса',
    quickAddressEmpty: 'После первого заказа адреса появятся здесь.',
    quickAddressApply: 'Использовать',
    quickAddressFromHistory: 'История',
    summaryLabel: 'Сводка',
    summaryTitle: 'Товары в заказе',
    total: 'Итого',
    size: 'Размер',
    backToCart: 'Вернуться в корзину',
    emptyTitle: 'Нет товаров для оформления',
    emptyText: 'Добавь товары в корзину, чтобы продолжить.',
    toCatalog: 'Перейти в каталог',
    draftSaved: 'Черновик сохранён:',
    suggestLoading: 'Ищем адрес...',
    suggestEmpty: 'Ничего не найдено',
    receiptTitle: 'Чек заказа',
    receiptPrint: 'Печать чека',
    receiptDownload: 'Скачать чек'
  }
})

const resetForm = () => {
  form.name = ''
  form.phoneCode = '+373'
  form.phoneLocal = ''
  form.email = ''
  form.deliveryType = 'courier'
  form.paymentMethod = 'cash_on_delivery'
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
    if (profile.paymentMethod === 'card_online' || profile.paymentMethod === 'phone_transfer' || profile.paymentMethod === 'cash_on_delivery') {
      form.paymentMethod = profile.paymentMethod
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
      paymentMethod: form.paymentMethod,
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

const applyCheckoutDraftPayload = (draft: CheckoutDraftPayload) => {
  isHydratingFromDraft.value = true
  try {
    if (typeof draft.name === 'string') form.name = draft.name
    if (typeof draft.phoneCode === 'string') form.phoneCode = draft.phoneCode
    if (typeof draft.phoneLocal === 'string') form.phoneLocal = draft.phoneLocal
    if (typeof draft.email === 'string') form.email = draft.email
    if (draft.deliveryType === 'courier' || draft.deliveryType === 'post_office' || draft.deliveryType === 'postamat') {
      form.deliveryType = draft.deliveryType
    }
    if (draft.paymentMethod === 'card_online' || draft.paymentMethod === 'phone_transfer' || draft.paymentMethod === 'cash_on_delivery') {
      form.paymentMethod = draft.paymentMethod
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
  } finally {
    setTimeout(() => {
      isHydratingFromDraft.value = false
    }, 0)
  }
}

const extractCheckoutDraftPayload = (savedAt = new Date().toISOString()): CheckoutDraftPayload => ({
  name: form.name,
  phoneCode: form.phoneCode,
  phoneLocal: form.phoneLocal,
  email: form.email,
  deliveryType: form.deliveryType,
  paymentMethod: form.paymentMethod,
  city: form.city,
  street: form.street,
  house: form.house,
  apartment: form.apartment,
  postalCode: form.postalCode,
  pickupPoint: form.pickupPoint,
  mapQuery: form.mapQuery,
  comment: form.comment,
  savedAt
})

const normalizeDraftPhone = () => `${String(form.phoneCode || '').trim()}${digitsOnly(form.phoneLocal)}`

const loadCheckoutDraft = () => {
  if (!import.meta.client) return
  try {
    const raw = window.localStorage.getItem(draftStorageKey)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') return
    applyCheckoutDraftPayload(parsed as CheckoutDraftPayload)
  } catch {
    // Ignore malformed draft payload.
  }
}

const loadCheckoutDraftFromServer = async (phoneNorm = '') => {
  try {
    const response = await $fetch<{
      success: boolean
      draft?: CheckoutDraftPayload | null
      savedAt?: string | null
    }>('/api/checkout/draft', {
      method: 'GET',
      query: phoneNorm ? { phoneNorm } : undefined
    })

    if (!response?.draft || typeof response.draft !== 'object') return
    const serverSavedAt = String(response.savedAt || response.draft.savedAt || '')
    const localSavedAt = String(draftSavedAt.value || '')
    const serverTs = Number.isFinite(new Date(serverSavedAt).getTime()) ? new Date(serverSavedAt).getTime() : 0
    const localTs = Number.isFinite(new Date(localSavedAt).getTime()) ? new Date(localSavedAt).getTime() : 0

    if (serverTs >= localTs) {
      applyCheckoutDraftPayload({
        ...response.draft,
        savedAt: serverSavedAt || response.draft.savedAt
      })
      if (import.meta.client) {
        try {
          window.localStorage.setItem(draftStorageKey, JSON.stringify({
            ...response.draft,
            savedAt: serverSavedAt || response.draft.savedAt || new Date().toISOString()
          }))
        } catch {
          // Ignore localStorage sync errors.
        }
      }
    }
  } catch {
    // Ignore server draft read errors.
  }
}

const queueCheckoutDraftServerSync = (payload: CheckoutDraftPayload) => {
  if (draftServerSyncTimer) clearTimeout(draftServerSyncTimer)
  draftServerSyncTimer = setTimeout(() => {
    void $fetch('/api/checkout/draft', {
      method: 'POST',
      body: {
        draft: payload,
        savedAt: payload.savedAt,
        phoneNorm: normalizeDraftPhone()
      }
    }).catch(() => undefined)
  }, 900)
}

const saveCheckoutDraft = () => {
  if (!import.meta.client) return
  const savedAt = new Date().toISOString()
  const payload = extractCheckoutDraftPayload(savedAt)
  try {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(payload))
    draftSavedAt.value = savedAt
  } catch {
    // Ignore localStorage write errors.
  }
  queueCheckoutDraftServerSync(payload)
}

const clearCheckoutDraft = () => {
  if (!import.meta.client) return
  if (draftServerSyncTimer) {
    clearTimeout(draftServerSyncTimer)
    draftServerSyncTimer = null
  }
  try {
    window.localStorage.removeItem(draftStorageKey)
  } catch {
    // Ignore remove errors.
  }
  draftSavedAt.value = ''
  void $fetch('/api/checkout/draft', {
    method: 'DELETE'
  }).catch(() => undefined)
}

const loadQuickAddresses = () => {
  if (!import.meta.client) return
  try {
    const raw = window.localStorage.getItem(quickAddressesStorageKey)
    const parsed = raw ? JSON.parse(raw) : []
    quickAddresses.value = Array.isArray(parsed)
      ? parsed
          .filter((item): item is QuickAddress =>
            !!item &&
            typeof item === 'object' &&
            typeof (item as QuickAddress).id === 'string' &&
            typeof (item as QuickAddress).deliveryType === 'string'
          )
          .slice(0, 8)
      : []
  } catch {
    quickAddresses.value = []
  }
}

const saveQuickAddresses = () => {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem(
      quickAddressesStorageKey,
      JSON.stringify(quickAddresses.value.slice(0, 8))
    )
  } catch {
    // Ignore localStorage write failures.
  }
}

const quickAddressLabel = (item: QuickAddress) => {
  if (item.deliveryType === 'courier') {
    const main = [item.city, item.street, item.house].filter(Boolean).join(', ')
    const apt = item.apartment ? `apt ${item.apartment}` : ''
    return [main, apt].filter(Boolean).join(' · ')
  }
  return [item.pickupPoint, item.city].filter(Boolean).join(' · ')
}

const quickAddressDateLabel = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleDateString(localeCode, {
    day: '2-digit',
    month: '2-digit'
  })
}

const rememberQuickAddress = () => {
  const payload: QuickAddress = {
    id: `qa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    phoneCode: form.phoneCode,
    deliveryType: form.deliveryType,
    city: String(form.city || '').trim(),
    street: String(form.street || '').trim(),
    house: String(form.house || '').trim(),
    apartment: String(form.apartment || '').trim(),
    postalCode: String(form.postalCode || '').trim(),
    pickupPoint: String(form.pickupPoint || '').trim(),
    createdAt: new Date().toISOString()
  }

  if (!payload.city) return
  if (payload.deliveryType === 'courier' && (!payload.street || !payload.house)) return
  if (payload.deliveryType !== 'courier' && !payload.pickupPoint) return

  const dedupeKey =
    payload.deliveryType === 'courier'
      ? `${payload.phoneCode}|${payload.deliveryType}|${payload.city}|${payload.street}|${payload.house}|${payload.apartment}|${payload.postalCode}`
      : `${payload.phoneCode}|${payload.deliveryType}|${payload.city}|${payload.pickupPoint}|${payload.postalCode}`

  quickAddresses.value = [
    payload,
    ...quickAddresses.value.filter((item) => {
      const existingKey =
        item.deliveryType === 'courier'
          ? `${item.phoneCode}|${item.deliveryType}|${item.city}|${item.street}|${item.house}|${item.apartment}|${item.postalCode}`
          : `${item.phoneCode}|${item.deliveryType}|${item.city}|${item.pickupPoint}|${item.postalCode}`
      return existingKey !== dedupeKey
    })
  ].slice(0, 8)

  saveQuickAddresses()
}

const applyQuickAddress = (item: QuickAddress) => {
  form.phoneCode = item.phoneCode || form.phoneCode
  form.deliveryType = item.deliveryType
  form.city = item.city || ''
  form.street = item.street || ''
  form.house = item.house || ''
  form.apartment = item.apartment || ''
  form.postalCode = item.postalCode || ''
  form.pickupPoint = item.pickupPoint || ''
  quickAddresses.value = [
    item,
    ...quickAddresses.value.filter((entry) => entry.id !== item.id)
  ].slice(0, 8)
  saveQuickAddresses()
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
const remoteMapSuggestions = ref<GeoSuggestionEntry[]>([])
const citySuggestRef = ref<HTMLElement | null>(null)
const streetSuggestRef = ref<HTMLElement | null>(null)
const mapSuggestRef = ref<HTMLElement | null>(null)
const activeSuggest = ref<'city' | 'street' | 'map' | null>(null)
const citySuggestIndex = ref(-1)
const streetSuggestIndex = ref(-1)
const mapSuggestIndex = ref(-1)
const citySuggestLoading = ref(false)
const streetSuggestLoading = ref(false)
const mapSuggestLoading = ref(false)
let citySuggestTimer: ReturnType<typeof setTimeout> | null = null
let streetSuggestTimer: ReturnType<typeof setTimeout> | null = null
let mapSuggestTimer: ReturnType<typeof setTimeout> | null = null

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

const paymentMethodOptions = computed(() => ([
  { value: 'card_online' as const, label: ui.value.paymentCard },
  { value: 'phone_transfer' as const, label: ui.value.paymentPhone },
  { value: 'cash_on_delivery' as const, label: ui.value.paymentCash }
]))

const paymentMethodLabel = (method: CheckoutForm['paymentMethod'] | ReceiptData['paymentMethod']) => {
  if (method === 'card_online') return ui.value.paymentCard
  if (method === 'phone_transfer') return ui.value.paymentPhone
  return ui.value.paymentCash
}

const paymentMethodHint = computed(() => {
  if (form.paymentMethod === 'card_online') return ui.value.paymentHintCard
  if (form.paymentMethod === 'phone_transfer') return ui.value.paymentHintPhone
  return ui.value.paymentHintCash
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

const mergeUniqueEntries = (items: GeoSuggestionEntry[]) => {
  const byValue = new Map<string, GeoSuggestionEntry>()
  for (const item of items) {
    const value = String(item.value || '').trim()
    if (!value || byValue.has(value.toLowerCase())) continue
    byValue.set(value.toLowerCase(), {
      value,
      city: item.city,
      street: item.street,
      house: item.house,
      postalCode: item.postalCode
    })
  }
  return Array.from(byValue.values()).slice(0, 10)
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const highlightSuggestion = (value: string, query: string) => {
  const safeValue = String(value || '')
  const q = String(query || '').trim()
  if (!q) return escapeHtml(safeValue)

  const idx = safeValue.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return escapeHtml(safeValue)

  const before = escapeHtml(safeValue.slice(0, idx))
  const match = escapeHtml(safeValue.slice(idx, idx + q.length))
  const after = escapeHtml(safeValue.slice(idx + q.length))
  return `${before}<mark>${match}</mark>${after}`
}

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

  if (!form.house && entry.house) {
    form.house = entry.house
  }
}

const citySuggestions = computed(() => {
  const local = countryCitySuggestions[form.phoneCode] ?? countryCitySuggestions['+373'] ?? []
  return mergeUnique([...remoteCitySuggestions.value.map((item) => item.value), ...local])
})

const streetSuggestions = computed(() => {
  const city = String(form.city || '').trim().toLowerCase()
  const local = !city ? defaultStreetSuggestions : (cityStreetSuggestions[city] || defaultStreetSuggestions)
  return mergeUnique([...remoteStreetSuggestions.value.map((item) => item.value), ...local])
})

const citySuggestEntries = computed(() =>
  mergeUniqueEntries([
    ...remoteCitySuggestions.value,
    ...citySuggestions.value.map((value) => ({ value }))
  ]).filter((item) => String(item.value || '').toLowerCase().includes(String(form.city || '').trim().toLowerCase()))
)

const streetSuggestEntries = computed(() =>
  mergeUniqueEntries([
    ...remoteStreetSuggestions.value,
    ...streetSuggestions.value.map((value) => ({ value, city: form.city || undefined }))
  ]).filter((item) => String(item.value || '').toLowerCase().includes(String(form.street || '').trim().toLowerCase()))
)

const mapSuggestEntries = computed(() =>
  mergeUniqueEntries(remoteMapSuggestions.value).filter((item) =>
    String(item.value || '').toLowerCase().includes(String(form.mapQuery || '').trim().toLowerCase())
  )
)

const mapRecentEntries = computed(() =>
  quickAddressEntries.value
    .filter((item) => !!item.city)
    .slice(0, 4)
)

const showCitySuggest = computed(() =>
  activeSuggest.value === 'city' &&
  String(form.city || '').trim().length >= 1 &&
  (citySuggestEntries.value.length > 0 || citySuggestLoading.value)
)

const showStreetSuggest = computed(() =>
  activeSuggest.value === 'street' &&
  String(form.street || '').trim().length >= 1 &&
  (streetSuggestEntries.value.length > 0 || streetSuggestLoading.value)
)

const showMapSuggest = computed(() =>
  activeSuggest.value === 'map' &&
  (
    mapRecentEntries.value.length > 0 ||
    (
      String(form.mapQuery || '').trim().length >= 1 &&
      (mapSuggestEntries.value.length > 0 || mapSuggestLoading.value)
    )
  )
)

const closeSuggest = () => {
  activeSuggest.value = null
  citySuggestIndex.value = -1
  streetSuggestIndex.value = -1
  mapSuggestIndex.value = -1
}

const openSuggest = (kind: 'city' | 'street' | 'map') => {
  activeSuggest.value = kind
  if (kind === 'city') citySuggestIndex.value = citySuggestEntries.value.length ? 0 : -1
  if (kind === 'street') streetSuggestIndex.value = streetSuggestEntries.value.length ? 0 : -1
  if (kind === 'map') mapSuggestIndex.value = mapSuggestEntries.value.length ? 0 : -1
}

const selectCitySuggestion = (entry: GeoSuggestionEntry) => {
  form.city = entry.city || entry.value
  applySuggestionData(entry, 'city')
  closeSuggest()
}

const selectStreetSuggestion = (entry: GeoSuggestionEntry) => {
  form.street = entry.street || entry.value
  applySuggestionData(entry, 'street')
  closeSuggest()
}

const selectMapSuggestion = (entry: GeoSuggestionEntry) => {
  form.mapQuery = entry.value
  if (entry.city) form.city = entry.city
  if (entry.street) form.street = entry.street
  if (entry.house) form.house = entry.house
  if (entry.postalCode && !form.postalCode) form.postalCode = entry.postalCode
  closeSuggest()
}

const mapRecentLabel = (item: QuickAddress) => {
  if (item.deliveryType === 'courier') {
    return [item.city, item.street, item.house].filter(Boolean).join(', ')
  }
  return [item.pickupPoint, item.city].filter(Boolean).join(' · ')
}

const selectRecentMapAddress = (item: QuickAddress) => {
  applyQuickAddress(item)
  form.mapQuery = mapRecentLabel(item)
  closeSuggest()
}

const onCityKeydown = (event: KeyboardEvent) => {
  if (!showCitySuggest.value) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const size = citySuggestEntries.value.length
    if (!size) return
    citySuggestIndex.value = citySuggestIndex.value < size - 1 ? citySuggestIndex.value + 1 : 0
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    const size = citySuggestEntries.value.length
    if (!size) return
    citySuggestIndex.value = citySuggestIndex.value > 0 ? citySuggestIndex.value - 1 : size - 1
    return
  }
  if (event.key === 'Enter' && citySuggestIndex.value >= 0) {
    event.preventDefault()
    const target = citySuggestEntries.value[citySuggestIndex.value]
    if (target) selectCitySuggestion(target)
  }
}

const onStreetKeydown = (event: KeyboardEvent) => {
  if (!showStreetSuggest.value) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const size = streetSuggestEntries.value.length
    if (!size) return
    streetSuggestIndex.value = streetSuggestIndex.value < size - 1 ? streetSuggestIndex.value + 1 : 0
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    const size = streetSuggestEntries.value.length
    if (!size) return
    streetSuggestIndex.value = streetSuggestIndex.value > 0 ? streetSuggestIndex.value - 1 : size - 1
    return
  }
  if (event.key === 'Enter' && streetSuggestIndex.value >= 0) {
    event.preventDefault()
    const target = streetSuggestEntries.value[streetSuggestIndex.value]
    if (target) selectStreetSuggestion(target)
  }
}

const onMapKeydown = (event: KeyboardEvent) => {
  if (!showMapSuggest.value) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const size = mapSuggestEntries.value.length
    if (!size) return
    mapSuggestIndex.value = mapSuggestIndex.value < size - 1 ? mapSuggestIndex.value + 1 : 0
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    const size = mapSuggestEntries.value.length
    if (!size) return
    mapSuggestIndex.value = mapSuggestIndex.value > 0 ? mapSuggestIndex.value - 1 : size - 1
    return
  }
  if (event.key === 'Enter' && mapSuggestIndex.value >= 0) {
    event.preventDefault()
    const target = mapSuggestEntries.value[mapSuggestIndex.value]
    if (target) selectMapSuggestion(target)
  }
}

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

const quickAddressEntries = computed(() =>
  quickAddresses.value.filter((item) =>
    item.phoneCode === form.phoneCode && item.deliveryType === form.deliveryType
  )
)

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

type CheckoutFieldKey = keyof typeof fieldErrors

const buildCheckoutErrors = () => {
  const name = String(form.name || '').trim()
  const phone = digitsOnly(form.phoneLocal)
  const rule = phoneRule.value

  const errors: Record<CheckoutFieldKey, string> = {
    name: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    pickupPoint: ''
  }

  if (name.length < 2) {
    errors.name = locale.value === 'en'
      ? 'Enter your name'
      : locale.value === 'ro'
        ? 'Introdu numele tău'
        : 'Введи имя'
  }

  if (phone.length < rule.min || phone.length > rule.max) {
    errors.phone = locale.value === 'en'
      ? `Enter valid phone (${rule.min}-${rule.max} digits)`
      : locale.value === 'ro'
        ? `Introdu telefon valid (${rule.min}-${rule.max} cifre)`
        : `Введи корректный номер (${rule.min}-${rule.max} цифр)`
  }

  if (form.deliveryType === 'courier') {
    if (!form.city) errors.city = locale.value === 'en' ? 'Enter city' : locale.value === 'ro' ? 'Completează orașul' : 'Заполни город'
    if (!form.street) errors.street = locale.value === 'en' ? 'Enter street' : locale.value === 'ro' ? 'Completează strada' : 'Заполни улицу'
    if (!form.house) errors.house = locale.value === 'en' ? 'Enter house/building' : locale.value === 'ro' ? 'Completează casa/blocul' : 'Заполни дом/блок'
  } else {
    if (!form.city) errors.city = locale.value === 'en' ? 'Enter city' : locale.value === 'ro' ? 'Completează orașul' : 'Заполни город'
    if (!form.pickupPoint) {
      errors.pickupPoint = locale.value === 'en'
        ? 'Select pickup point'
        : locale.value === 'ro'
          ? 'Alege punctul de ridicare'
          : 'Выбери пункт выдачи'
    }
  }

  return errors
}

const checkoutFirstErrorKey = (errors: Record<CheckoutFieldKey, string>) => {
  const order: CheckoutFieldKey[] = ['name', 'phone', 'city', 'street', 'house', 'pickupPoint']
  return order.find((key) => !!errors[key]) || null
}

const focusFieldByError = (field: CheckoutFieldKey | null) => {
  if (!import.meta.client || !field) return
  const selectorByField: Record<CheckoutFieldKey, string> = {
    name: '#checkout-name',
    phone: '#checkout-phone-local',
    city: '#checkout-city',
    street: '#checkout-street',
    house: '#checkout-house',
    pickupPoint: '#checkout-pickup-point'
  }

  const target = document.querySelector<HTMLInputElement>(selectorByField[field])
  target?.focus()
}

const isCheckoutContactReady = computed(() => {
  const errors = buildCheckoutErrors()
  return !checkoutFirstErrorKey(errors)
})

const isCheckoutReady = computed(() => {
  return !!shopStore.cart.length && !isSubmitting.value && isCheckoutContactReady.value
})

const validateLiveFields = () => {
  const name = String(form.name || '').trim()
  const phone = digitsOnly(form.phoneLocal)
  const rule = phoneRule.value

  if (name && name.length < 2) {
    fieldErrors.name = locale.value === 'en'
      ? 'Enter at least 2 characters'
      : locale.value === 'ro'
        ? 'Introdu cel puțin 2 caractere'
        : 'Введите минимум 2 символа'
  } else if (fieldErrors.name) {
    fieldErrors.name = ''
  }

  if (phone && (phone.length < rule.min || phone.length > rule.max)) {
    fieldErrors.phone = locale.value === 'en'
      ? `Enter valid phone (${rule.min}-${rule.max} digits)`
      : locale.value === 'ro'
        ? `Introdu telefon valid (${rule.min}-${rule.max} cifre)`
        : `Введи корректный номер (${rule.min}-${rule.max} цифр)`
  } else if (fieldErrors.phone) {
    fieldErrors.phone = ''
  }
}

const validateCheckoutContact = () => {
  const errors = buildCheckoutErrors()
  for (const key of Object.keys(errors) as CheckoutFieldKey[]) {
    fieldErrors[key] = errors[key]
  }

  const firstKey = checkoutFirstErrorKey(errors)
  if (!firstKey) return ''
  focusFieldByError(firstKey)
  return errors[firstKey] || ''
}

const openMapSearch = () => {
  if (!import.meta.client) return
  const query = encodeURIComponent(form.mapQuery || [form.city, form.street, form.house].filter(Boolean).join(' '))
  const url = `https://www.google.com/maps/search/?api=1&query=${query || 'Moldova'}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const fetchGeoSuggestions = async (kind: 'city' | 'street' | 'address', query: string) => {
  const q = String(query || '').trim()
  if (q.length < 2) {
    if (kind === 'city') remoteCitySuggestions.value = []
    if (kind === 'street') remoteStreetSuggestions.value = []
    if (kind === 'address') remoteMapSuggestions.value = []
    return
  }

  if (kind === 'city') citySuggestLoading.value = true
  if (kind === 'street') streetSuggestLoading.value = true
  if (kind === 'address') mapSuggestLoading.value = true

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
            house: item.house ? String(item.house).trim() : undefined,
            postalCode: item.postalCode ? String(item.postalCode).trim() : undefined
          }))
      : []
    if (kind === 'city') {
      remoteCitySuggestions.value = entries
      return
    }
    if (kind === 'street') {
      remoteStreetSuggestions.value = entries
      return
    }
    remoteMapSuggestions.value = entries
  } catch {
    if (kind === 'city') remoteCitySuggestions.value = []
    if (kind === 'street') remoteStreetSuggestions.value = []
    if (kind === 'address') remoteMapSuggestions.value = []
  } finally {
    if (kind === 'city') citySuggestLoading.value = false
    if (kind === 'street') streetSuggestLoading.value = false
    if (kind === 'address') mapSuggestLoading.value = false
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
  receiptData.value = null
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
        payment: {
          method: form.paymentMethod
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
    const builtReceipt = response.receipt || {
      orderId: response.orderId,
      createdAt: new Date().toISOString(),
      customerName: form.name,
      customerPhone: fullPhone.value,
      customerAddress: fullAddress.value,
      paymentMethod: form.paymentMethod,
      paymentStatus: response.payment?.status || (form.paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'pending'),
      items: normalizedItems.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        price: item.price,
        lineTotal: item.price * item.quantity
      })),
      total: Number(response.total || shopStore.cartTotal)
    }
    receiptData.value = builtReceipt

    const checkoutUrl = String(response.payment?.checkoutUrl || '').trim()
    if (checkoutUrl) {
      if (import.meta.client) {
        try {
          window.localStorage.setItem(`osf_receipt_${response.orderId}`, JSON.stringify(builtReceipt))
        } catch {
          // Ignore localStorage write failures.
        }
      }
      window.location.href = checkoutUrl
      return
    }

    rememberQuickAddress()
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

const receiptText = computed(() => {
  if (!receiptData.value) return ''
  const r = receiptData.value
  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  const created = new Date(r.createdAt).toLocaleString(localeCode)
  const lines = [
    'ONE STYLE FOREVER',
    `Order: ${r.orderId}`,
    `Date: ${created}`,
    `Customer: ${r.customerName}`,
    `Phone: ${r.customerPhone}`,
    `Address: ${r.customerAddress}`,
    `Payment: ${paymentMethodLabel(r.paymentMethod)}`,
    '',
    'Items:'
  ]

  for (const item of r.items) {
    lines.push(`- ${item.title} [${item.selectedSize || '-'}] x${item.quantity} = ${item.lineTotal} MDL`)
  }

  lines.push('')
  lines.push(`Total: ${r.total} MDL`)
  return lines.join('\n')
})

const printReceipt = () => {
  if (!import.meta.client || !receiptData.value) return
  const popup = window.open('', '_blank', 'width=560,height=780')
  if (!popup) return
  popup.document.write(`<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 20px; white-space: pre-wrap;">${receiptText.value.replace(/</g, '&lt;')}</pre>`)
  popup.document.close()
  popup.focus()
  popup.print()
}

const downloadReceipt = () => {
  if (!import.meta.client || !receiptData.value) return
  const blob = new Blob([receiptText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-${receiptData.value.orderId}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const siteUrl = 'https://onestyleforever.com'
const previewImage = `${siteUrl}/logo-preview.png`

const handleDocumentPointerDown = (event: Event) => {
  const target = event.target as Node | null
  const cityRoot = citySuggestRef.value
  const streetRoot = streetSuggestRef.value
  const mapRoot = mapSuggestRef.value

  if (activeSuggest.value === 'city' && cityRoot && target && !cityRoot.contains(target)) {
    closeSuggest()
    return
  }

  if (activeSuggest.value === 'street' && streetRoot && target && !streetRoot.contains(target)) {
    closeSuggest()
    return
  }

  if (activeSuggest.value === 'map' && mapRoot && target && !mapRoot.contains(target)) {
    closeSuggest()
  }
}

onMounted(() => {
  shopStore.sanitizeCart()
  loadCheckoutProfile()
  loadCheckoutDraft()
  void loadCheckoutDraftFromServer()
  loadQuickAddresses()
  onPhoneInput()
  if (import.meta.client) {
    window.addEventListener('pointerdown', handleDocumentPointerDown)
  }
  $fetch<{ success: boolean; csrfToken?: string }>('/api/checkout/csrf')
    .then((response) => {
      checkoutCsrfToken.value = String(response?.csrfToken || '')
    })
    .catch(() => {
      checkoutCsrfToken.value = ''
    })

  if (String(route.query.paymentCanceled || '') === '1') {
    errorMessage.value =
      locale.value === 'en'
        ? 'Card payment was canceled. You can try again or choose another payment method.'
        : locale.value === 'ro'
          ? 'Plata cu cardul a fost anulată. Poți încerca din nou sau alege altă metodă.'
          : 'Оплата картой была отменена. Можешь попробовать снова или выбрать другой способ.'
  }
})

let draftTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => ({
    name: form.name,
    phoneCode: form.phoneCode,
    phoneLocal: form.phoneLocal,
    email: form.email,
    deliveryType: form.deliveryType,
    paymentMethod: form.paymentMethod,
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
    if (isHydratingFromDraft.value) return
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
  remoteMapSuggestions.value = []

  if (citySuggestTimer) clearTimeout(citySuggestTimer)
  citySuggestTimer = setTimeout(() => {
    fetchGeoSuggestions('city', form.city)
  }, 260)

  if (phoneDraftSyncTimer) clearTimeout(phoneDraftSyncTimer)
  phoneDraftSyncTimer = setTimeout(() => {
    const phoneNorm = normalizeDraftPhone()
    if (phoneNorm.length < 8 || phoneNorm === lastServerDraftLoadedPhone.value) return
    lastServerDraftLoadedPhone.value = phoneNorm
    void loadCheckoutDraftFromServer(phoneNorm)
  }, 700)
})

watch(() => form.phoneLocal, () => {
  validateLiveFields()

  if (phoneDraftSyncTimer) clearTimeout(phoneDraftSyncTimer)
  phoneDraftSyncTimer = setTimeout(() => {
    const phoneNorm = normalizeDraftPhone()
    if (phoneNorm.length < 8 || phoneNorm === lastServerDraftLoadedPhone.value) return
    lastServerDraftLoadedPhone.value = phoneNorm
    void loadCheckoutDraftFromServer(phoneNorm)
  }, 700)
})

watch(() => form.name, () => {
  validateLiveFields()
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

watch(() => form.mapQuery, () => {
  if (mapSuggestTimer) clearTimeout(mapSuggestTimer)
  mapSuggestTimer = setTimeout(() => {
    fetchGeoSuggestions('address', form.mapQuery)
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
  if (draftServerSyncTimer) {
    clearTimeout(draftServerSyncTimer)
    draftServerSyncTimer = null
  }
  if (phoneDraftSyncTimer) {
    clearTimeout(phoneDraftSyncTimer)
    phoneDraftSyncTimer = null
  }
  if (mapSuggestTimer) {
    clearTimeout(mapSuggestTimer)
    mapSuggestTimer = null
  }
  if (import.meta.client) {
    window.removeEventListener('pointerdown', handleDocumentPointerDown)
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
  padding: 26px;
}

.checkout-intro.compact {
  padding-top: 8px;
  padding-bottom: 8px;
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

.suggest-wrap {
  position: relative;
}

.suggest-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 30;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(13, 24, 17, 0.12);
  max-height: 250px;
  overflow: auto;
  padding: 6px;
  display: grid;
  gap: 4px;
}

.suggest-item {
  border: 0;
  background: transparent;
  text-align: left;
  width: 100%;
  border-radius: 10px;
  padding: 8px 10px;
  display: grid;
  gap: 2px;
  cursor: pointer;
}

.suggest-item:hover {
  background: #f3f8f5;
}

.suggest-item.active {
  background: #edf6f0;
}

.suggest-item-recent {
  border: 1px solid #e1eade;
  background: #fbfdfb;
}

.suggest-item-recent:hover {
  background: #f3f8f4;
}

.suggest-group-title {
  padding: 4px 10px 2px;
  color: #5b6f86;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.suggest-divider {
  height: 1px;
  background: var(--border);
  margin: 2px 4px;
}

.suggest-main {
  color: #20344a;
  font-weight: 700;
}

.suggest-main :deep(mark) {
  background: #dff0e5;
  color: #1b5d3a;
  border-radius: 4px;
  padding: 0 2px;
}

.suggest-item small {
  color: #61748a;
  font-size: 12px;
}

.suggest-state {
  padding: 10px 12px;
  color: #61748a;
  font-size: 13px;
  font-weight: 700;
}

.field-error {
  color: #b42318;
  font-size: 12px;
  font-weight: 700;
}

.payment-hint {
  color: #5f7187;
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

.quick-addresses {
  margin-top: 2px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #fbfdfb;
}

.quick-addresses-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.quick-addresses-title {
  font-size: 14px;
  font-weight: 800;
  color: #20344a;
}

.quick-addresses-head small {
  font-size: 12px;
  font-weight: 700;
  color: #5d6f84;
}

.quick-addresses-list {
  display: grid;
  gap: 8px;
}

.quick-address-card {
  border: 1px solid #dbe7dd;
  border-radius: 14px;
  background: #fff;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.quick-address-meta {
  display: grid;
  gap: 4px;
}

.quick-address-meta strong {
  font-size: 13px;
  color: #1d3147;
}

.quick-address-meta span {
  font-size: 12px;
  color: #62758b;
}

.quick-address-use {
  min-height: 36px;
  padding: 0 12px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 800;
}

.quick-address-empty {
  margin: 0;
  font-size: 13px;
  color: #5f7187;
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

.receipt-box {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fbfdfb;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
}

.receipt-box strong {
  font-size: 14px;
}

.receipt-box span {
  color: #45586e;
  font-size: 13px;
  font-weight: 700;
}

.receipt-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.summary-payment {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #4f6279;
  font-weight: 700;
}

.summary-payment strong {
  color: #0f1e36;
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
  .checkout-intro,
  .checkout-form-box,
  .checkout-summary-box,
  .empty-box {
    padding: 22px;
  }

  .checkout-title {
    font-size: clamp(34px, 4.3vw, 44px);
  }

  .checkout-text {
    margin-top: 10px;
    font-size: 16px;
  }

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

  .quick-address-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .quick-address-use {
    width: 100%;
  }

  .summary-product {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-payment {
    font-size: 14px;
  }

  .checkout-sticky-bar {
    display: flex;
  }
}

@media (max-width: 389px) {
  .checkout-intro,
  .checkout-form-box,
  .checkout-summary-box,
  .empty-box {
    padding: 12px;
  }

  .checkout-title {
    font-size: clamp(28px, 7.2vw, 34px);
  }

  .checkout-text {
    font-size: 14px;
  }

  .payment-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 390px) and (max-width: 429px) {
  .checkout-intro,
  .checkout-form-box,
  .checkout-summary-box,
  .empty-box {
    padding: 14px;
  }
}

@media (min-width: 430px) and (max-width: 479px) {
  .checkout-intro,
  .checkout-form-box,
  .checkout-summary-box,
  .empty-box {
    padding: 16px;
  }
}
</style>
