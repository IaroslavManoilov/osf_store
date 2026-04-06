<template>
  <div class="product-page">
    <section class="section-space">
      <div class="site-container">
        <nav class="breadcrumbs">
          <NuxtLink :to="localePath('/')">{{ $t('nav.home') }}</NuxtLink>
          <span>/</span>
          <NuxtLink :to="localePath('/catalog')">{{ $t('nav.catalog') }}</NuxtLink>
          <span>/</span>
          <span>{{ product?.title || ui.notFoundTitle }}</span>
        </nav>
      </div>
    </section>

    <section v-if="product" class="section-space">
      <div class="site-container">
        <div class="surface-card product-box">
          <div class="product-layout">
            <div class="gallery">
              <div
                ref="mainImageRef"
                class="main-image"
                @mousemove="onGalleryMove"
                @mouseleave="resetGalleryMotion"
              >
                <img :src="selectedImage" :alt="product.title" class="main-image-media" :style="mainImageStyle" />
                <div class="main-image-glow" :style="mainImageGlowStyle" aria-hidden="true"></div>
                <span class="product-badge" :class="{ hot: product.badge === 'HOT' }">{{ product.badge }}</span>
                <span class="gallery-counter">{{ selectedImageIndex + 1 }}/{{ galleryImages.length }}</span>
                <button type="button" class="zoom-hint-btn" @click="openLightbox">
                  {{ ui.photoZoom }}
                </button>
              </div>

              <div class="thumbs" v-if="galleryImages.length > 1">
                <button
                  v-for="image in galleryImages"
                  :key="image"
                  type="button"
                  class="thumb-btn"
                  :class="{ active: selectedImage === image }"
                  @click="selectedImage = image"
                >
                  <img :src="image" :alt="product.title" />
                </button>
              </div>
            </div>

            <div class="product-content">
              <span class="section-label">{{ product.categoryLabel }}</span>
              <h1 class="product-title">{{ product.title }}</h1>
              <p class="product-description">{{ product.description }}</p>
              <div class="urgency-note">{{ ui.stockLeftPrefix }} {{ stockLeftValue }} {{ ui.stockLeftSuffix }}</div>
              <div class="delivery-note">{{ ui.deliverByPrefix }} {{ deliveryDateLabel }}</div>

              <div class="rating-summary">
                <div class="stars-row" aria-hidden="true">
                  <span v-for="star in 5" :key="`summary-star-${star}`" class="star" :class="{ active: star <= roundedAverageRating }">★</span>
                </div>
                <strong>{{ averageRatingLabel }}</strong>
                <span>{{ reviewsMetaLabel }}</span>
              </div>

              <div class="meta-grid">
                <div class="meta-card">
                  <span>{{ ui.color }}</span>
                  <strong>{{ product.colorLabel }}</strong>
                </div>

                <div class="meta-card">
                  <span>{{ ui.stock }}</span>
                  <strong>{{ ui.inStock }}</strong>
                </div>
              </div>

              <div class="size-section">
                <span class="size-title">{{ ui.size }}</span>
                <div class="size-list">
                  <button
                    v-for="size in product.sizes"
                    :key="size"
                    type="button"
                    class="size-pill"
                    :class="{ active: selectedSize === size }"
                    @click="selectedSize = size"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <div class="actions-row">
                <div class="price-box">
                  <span>{{ ui.price }}</span>
                  <strong>{{ product.price }} MDL</strong>
                </div>

                <div class="action-buttons">
                  <button type="button" class="btn-main action-btn" @click="addToCart">
                    {{ ui.addToCart }}
                  </button>

                  <button type="button" class="btn-main action-btn buy-now-btn cta-pulse" @click="buyNow">
                    {{ ui.buyNow }}
                  </button>

                  <button type="button" class="btn-alt action-btn" @click="toggleWishlist">
                    {{ isWishlisted ? ui.removeWishlist : ui.addWishlist }}
                  </button>
                </div>
              </div>

              <div class="benefits-row">
                <span>{{ ui.trustDelivery }}</span>
                <span>{{ ui.trustReturn }}</span>
                <span>{{ ui.trustPayment }}</span>
                <span>{{ ui.trustGuarantee }}</span>
              </div>

              <div class="proof-row">
                <div class="proof-card">
                  <strong>{{ ui.proofTitle1 }}</strong>
                  <span>{{ ui.proofText1 }}</span>
                </div>
                <div class="proof-card">
                  <strong>{{ ui.proofTitle2 }}</strong>
                  <span>{{ ui.proofText2 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="product" class="section-space">
      <div class="site-container">
        <div class="surface-card faq-box">
          <h2 class="block-title">{{ ui.faqTitle }}</h2>
          <div class="faq-list">
            <details class="faq-item" v-for="item in faqItems" :key="item.q">
              <summary>{{ item.q }}</summary>
              <p>{{ item.a }}</p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <section v-if="product" class="section-space">
      <div class="site-container">
        <div class="surface-card reviews-box">
          <div class="reviews-head">
            <h2 class="block-title">{{ ui.reviewsTitle }}</h2>
            <p>{{ ui.reviewsSubtitle }}</p>
          </div>

          <div class="reviews-form-box">
            <p class="review-form-title">{{ ui.reviewFormTitle }}</p>

            <div class="review-stars" role="radiogroup" :aria-label="ui.reviewStarsAria">
              <button
                v-for="star in 5"
                :key="`pick-${star}`"
                type="button"
                class="review-star-btn"
                :class="{ active: reviewDraft.rating >= star }"
                :aria-checked="reviewDraft.rating === star"
                @click="reviewDraft.rating = star"
              >
                ★
              </button>
            </div>

            <textarea
              v-model.trim="reviewDraft.text"
              class="review-textarea"
              rows="4"
              :placeholder="ui.reviewPlaceholder"
              :disabled="!canLeaveReview"
            />

            <div class="review-upload">
              <input
                ref="reviewPhotoInputRef"
                type="file"
                accept="image/*"
                multiple
                :disabled="!canLeaveReview || reviewPhotoDraft.length >= 2"
                @change="onReviewPhotoChange"
              />
              <span>{{ ui.reviewPhotoHint }}</span>
            </div>

            <div v-if="reviewPhotoDraft.length" class="review-draft-photos">
              <button
                v-for="(photo, index) in reviewPhotoDraft"
                :key="`draft-photo-${index}`"
                type="button"
                class="review-photo-thumb"
                @click="removeDraftPhoto(index)"
              >
                <img :src="photo" :alt="`${ui.reviewPhotoAlt} ${index + 1}`" />
              </button>
            </div>

            <div class="review-actions">
              <button type="button" class="btn-main" :disabled="!canLeaveReview" @click="submitReview">
                {{ ui.reviewSubmit }}
              </button>
              <span v-if="!canLeaveReview" class="review-note">{{ ui.reviewOnlyAfterPurchase }}</span>
            </div>
          </div>

          <div v-if="reviews.length" class="reviews-list">
            <article class="review-item" v-for="item in reviews" :key="item.createdAt">
              <div class="stars-row">
                <span v-for="star in 5" :key="`${item.createdAt}-${star}`" class="star" :class="{ active: star <= item.rating }">★</span>
              </div>
              <p>{{ item.text }}</p>
              <div v-if="item.photos?.length" class="review-photos">
                <button
                  v-for="(photo, index) in item.photos"
                  :key="`${item.createdAt}-photo-${index}`"
                  type="button"
                  class="review-photo-thumb"
                  @click="openReviewLightbox(photo)"
                >
                  <img :src="photo" :alt="`${ui.reviewPhotoAlt} ${index + 1}`" />
                </button>
              </div>
              <time>{{ formatReviewDate(item.createdAt) }}</time>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section v-if="product && relatedProducts.length" class="section-space">
      <div class="site-container">
        <div class="surface-card related-box">
          <div class="section-head">
            <span class="section-label">{{ ui.relatedLabel }}</span>
            <h2 class="block-title">{{ ui.relatedTitle }}</h2>
          </div>

          <div class="related-grid">
            <article
              v-for="item in relatedProducts"
              :key="item.id"
              class="related-card"
            >
              <NuxtLink :to="localePath(`/product/${item.id}`)" class="related-link">
                <div class="related-image">
                  <img :src="item.image" :alt="item.title" />
                </div>

                <div class="related-body">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.shortDescription }}</p>
                  <strong>{{ item.price }} MDL</strong>
                </div>
              </NuxtLink>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="!product" class="section-space">
      <div class="site-container">
        <div class="surface-card not-found-box">
          <h1>{{ ui.notFoundTitle }}</h1>
          <p>{{ ui.notFoundText }}</p>
          <NuxtLink :to="localePath('/catalog')" class="btn-main">{{ ui.toCatalog }}</NuxtLink>
        </div>
      </div>
    </section>

    <div v-if="product" class="mobile-sticky-bar">
      <div class="mobile-price">
        <span>{{ ui.price }}</span>
        <strong>{{ product.price }} MDL</strong>
      </div>
      <button type="button" class="btn-main mobile-buy cta-pulse" @click="buyNow">{{ ui.buyNow }}</button>
    </div>

    <div v-if="product && isLightboxOpen" class="lightbox" role="dialog" aria-modal="true" @click.self="closeLightbox">
      <button type="button" class="lightbox-close" :aria-label="ui.lightboxCloseLabel" @click="closeLightbox">✕</button>

      <button
        v-if="galleryImages.length > 1"
        type="button"
        class="lightbox-nav prev"
        :aria-label="ui.lightboxPrevLabel"
        @click.stop="showPrevImage"
      >
        ‹
      </button>

      <img :src="selectedImage" :alt="product.title" class="lightbox-image" />

      <button
        v-if="galleryImages.length > 1"
        type="button"
        class="lightbox-nav next"
        :aria-label="ui.lightboxNextLabel"
        @click.stop="showNextImage"
      >
        ›
      </button>

      <div class="lightbox-meta">
        <strong>{{ product.title }}</strong>
        <span>{{ selectedImageIndex + 1 }} / {{ galleryImages.length }} · {{ ui.photoRealLabel }}</span>
      </div>
    </div>

    <div v-if="reviewLightboxImage" class="lightbox" role="dialog" aria-modal="true" @click.self="closeReviewLightbox">
      <button type="button" class="lightbox-close" :aria-label="ui.lightboxCloseLabel" @click="closeReviewLightbox">✕</button>
      <img :src="reviewLightboxImage" :alt="ui.reviewPhotoAlt" class="lightbox-image" />
      <div class="lightbox-meta">
        <strong>{{ ui.reviewPhotoLabel }}</strong>
        <span>{{ ui.photoRealLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProductById, getProducts } from '~/data/products'
import type { ProductSize } from '~/stores/shop'
type ProductReview = {
  rating: number
  text: string
  createdAt: string
  photos?: string[]
}

const route = useRoute()
const localePath = useLocalePath()
const shopStore = useShopStore()
const uiStore = useUiStore()
const { locale } = useI18n()

definePageMeta({
  pageTransition: {
    name: 'catalog-product'
  }
})

const productId = computed(() => String(route.params.id || ''))

const product = computed(() => getProductById(productId.value, locale.value))

const relatedProducts = computed(() => {
  if (!product.value) return []

  return getProducts(locale.value)
    .filter((item) => item.id !== product.value!.id && item.category === product.value!.category)
    .slice(0, 3)
})

const selectedSize = ref<ProductSize | ''>('')
const selectedImage = ref('')
const mainImageRef = ref<HTMLElement | null>(null)
const motionX = ref(0)
const motionY = ref(0)
const motionZoom = ref(1)
const reduceMotion = ref(false)
const isLightboxOpen = ref(false)
const reviews = ref<ProductReview[]>([])
const canLeaveReview = ref(false)
const reviewPhotoInputRef = ref<HTMLInputElement | null>(null)
const reviewPhotoDraft = ref<string[]>([])
const reviewLightboxImage = ref('')
const reviewDraft = ref({
  rating: 5,
  text: ''
})

watch(
  product,
  (nextProduct) => {
    selectedSize.value = ''
    selectedImage.value = nextProduct?.images[0] || nextProduct?.image || ''
    reviewDraft.value = { rating: 5, text: '' }
    reviewPhotoDraft.value = []
    reviewLightboxImage.value = ''
    reviews.value = []
    canLeaveReview.value = false
    loadReviewState()
  },
  { immediate: true }
)

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('keydown', onLightboxKeydown)
  loadReviewState()
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onLightboxKeydown)
})

const onGalleryMove = (event: MouseEvent) => {
  if (reduceMotion.value || !mainImageRef.value) return

  const rect = mainImageRef.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5

  motionX.value = x * 14
  motionY.value = y * 14
  motionZoom.value = 1.045
}

const resetGalleryMotion = () => {
  motionX.value = 0
  motionY.value = 0
  motionZoom.value = 1
}

const mainImageStyle = computed(() => ({
  transform: `translate3d(${motionX.value}px, ${motionY.value}px, 0) scale(${motionZoom.value})`
}))

const mainImageGlowStyle = computed(() => ({
  transform: `translate3d(${motionX.value * -0.75}px, ${motionY.value * -0.75}px, 0)`
}))

const galleryImages = computed<string[]>(() => {
  if (!product.value) return [] as string[]
  const rawImages = product.value.images?.length ? product.value.images : [product.value.image]
  return [...new Set(rawImages.filter((image): image is string => typeof image === 'string' && image.length > 0))]
})

const selectedImageIndex = computed(() => {
  const index = galleryImages.value.indexOf(selectedImage.value)
  return index < 0 ? 0 : index
})

const openLightbox = () => {
  if (!product.value) return
  if (!selectedImage.value && galleryImages.value.length) {
    selectedImage.value = galleryImages.value[0] || ''
  }
  isLightboxOpen.value = true
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}

const showPrevImage = () => {
  if (galleryImages.value.length < 2) return
  const nextIndex = (selectedImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
  selectedImage.value = galleryImages.value[nextIndex] || selectedImage.value
}

const showNextImage = () => {
  if (galleryImages.value.length < 2) return
  const nextIndex = (selectedImageIndex.value + 1) % galleryImages.value.length
  selectedImage.value = galleryImages.value[nextIndex] || selectedImage.value
}

const onLightboxKeydown = (event: KeyboardEvent) => {
  if (!isLightboxOpen.value) return

  if (event.key === 'Escape') {
    closeLightbox()
    return
  }

  if (event.key === 'ArrowLeft') {
    showPrevImage()
    return
  }

  if (event.key === 'ArrowRight') {
    showNextImage()
  }
}

function readReviewsMap() {
  if (!import.meta.client) return {} as Record<string, ProductReview[]>

  try {
    const raw = window.localStorage.getItem('osf_reviews_v1')
    const parsed = raw ? JSON.parse(raw) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, ProductReview[]>
  } catch {
    return {}
  }
}

function writeReviewsMap(value: Record<string, ProductReview[]>) {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem('osf_reviews_v1', JSON.stringify(value))
  } catch {
    // Ignore storage write failures to avoid runtime crashes.
  }
}

function loadReviewState() {
  if (!import.meta.client || !product.value) return

  let purchasedIds: string[] = []

  try {
    const purchasedRaw = window.localStorage.getItem('osf_purchased_products_v1')
    const parsed = purchasedRaw ? JSON.parse(purchasedRaw) : []
    purchasedIds = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    purchasedIds = []
  }

  canLeaveReview.value = purchasedIds.includes(product.value.id)

  const map = readReviewsMap()
  const rawReviews = map[product.value.id] || []
  reviews.value = rawReviews.map((item) => ({
    ...item,
    photos: Array.isArray(item.photos) ? item.photos.filter((photo): photo is string => typeof photo === 'string') : []
  }))
}

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const total = reviews.value.reduce((acc, item) => acc + item.rating, 0)
  return Number((total / reviews.value.length).toFixed(1))
})

const roundedAverageRating = computed(() => Math.round(averageRating.value))
const averageRatingLabel = computed(() => (reviews.value.length ? `${averageRating.value}/5` : ui.value.noRatingLabel))
const reviewsMetaLabel = computed(() => (reviews.value.length ? `${reviews.value.length} ${ui.value.reviewsCountSuffix}` : ui.value.noReviewsYet))

const submitReview = () => {
  if (!product.value) return

  if (!canLeaveReview.value) {
    uiStore.showToast(ui.value.reviewOnlyAfterPurchase, 'info')
    return
  }

  if (reviewDraft.value.rating < 1 || reviewDraft.value.rating > 5) {
    uiStore.showToast(ui.value.reviewStarsError, 'error')
    return
  }

  if (!reviewDraft.value.text) {
    uiStore.showToast(ui.value.reviewTextError, 'error')
    return
  }

  const map = readReviewsMap()
  const productReviews = map[product.value.id] || []

  productReviews.unshift({
    rating: reviewDraft.value.rating,
    text: reviewDraft.value.text,
    createdAt: new Date().toISOString(),
    photos: [...reviewPhotoDraft.value]
  })

  map[product.value.id] = productReviews
  writeReviewsMap(map)
  reviews.value = productReviews

  reviewDraft.value = { rating: 5, text: '' }
  reviewPhotoDraft.value = []
  if (reviewPhotoInputRef.value) {
    reviewPhotoInputRef.value.value = ''
  }
  uiStore.showToast(ui.value.reviewSuccess, 'success')
}

const openReviewLightbox = (photo: string) => {
  reviewLightboxImage.value = photo
}

const closeReviewLightbox = () => {
  reviewLightboxImage.value = ''
}

const removeDraftPhoto = (index: number) => {
  reviewPhotoDraft.value.splice(index, 1)
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

const onReviewPhotoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || !files.length) return

  const incoming = Array.from(files)
  const restSlots = Math.max(0, 2 - reviewPhotoDraft.value.length)

  if (!restSlots) {
    uiStore.showToast(ui.value.reviewPhotoLimitError, 'info')
    target.value = ''
    return
  }

  const candidates = incoming.slice(0, restSlots)

  try {
    for (const file of candidates) {
      if (!file.type.startsWith('image/')) {
        uiStore.showToast(ui.value.reviewPhotoTypeError, 'error')
        continue
      }

      if (file.size > 2 * 1024 * 1024) {
        uiStore.showToast(ui.value.reviewPhotoSizeError, 'error')
        continue
      }

      const dataUrl = await readFileAsDataUrl(file)
      if (dataUrl) {
        reviewPhotoDraft.value.push(dataUrl)
      }
    }
  } finally {
    target.value = ''
  }
}

const formatReviewDate = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleDateString(locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU')
}

const isWishlisted = computed(() => {
  if (!product.value) return false
  return shopStore.isInWishlist(product.value.id)
})

const getStockLeft = (id: string, badge: string, sizesCount: number) => {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const base = badge === 'HOT' ? 3 : 5
  const variance = hash % 4
  return Math.max(2, base + variance - Math.max(0, 3 - sizesCount))
}

const stockLeftValue = computed(() => {
  if (!product.value) return ''
  return String(getStockLeft(product.value.id, product.value.badge, product.value.sizes.length))
})

const deliveryDateLabel = computed(() => {
  if (!product.value) return ''

  const date = new Date()
  const offset = product.value.badge === 'HOT' ? 2 : 3
  date.setDate(date.getDate() + offset)

  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleDateString(localeCode, { day: 'numeric', month: 'long' })
})

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      color: 'Culoare',
      stock: 'Stoc',
      inStock: 'În stoc',
      size: 'Mărime',
      price: 'Preț',
      addToCart: 'Adaugă în coș',
      buyNow: 'Cumpără acum',
      addWishlist: 'Adaugă la favorite',
      removeWishlist: 'Elimină din favorite',
      relatedLabel: 'Selecție',
      relatedTitle: 'Produse similare',
      faqTitle: 'Întrebări despre produs',
      stockLeftPrefix: 'Au rămas:',
      stockLeftSuffix: 'buc.',
      deliverByPrefix: 'Livrare până la',
      shipping: 'Livrare în 2-3 zile',
      returns: 'Schimb/retur 14 zile',
      support: 'Suport WhatsApp/Telegram',
      trustDelivery: 'Livrare 2-3 zile',
      trustReturn: 'Retur 14 zile',
      trustPayment: 'Plată sigură',
      trustGuarantee: 'Garanție calitate',
      proofTitle1: 'Verificat de clienți',
      proofText1: 'Evaluat pozitiv pentru croială și confort zilnic.',
      proofTitle2: 'Garanție de încredere',
      proofText2: 'Retur simplu în 14 zile dacă mărimea nu se potrivește.',
      photoProof1: 'Foto HD',
      photoProof2: 'Culori reale',
      photoProof3: 'Fundal alb curat',
      photoZoom: 'Deschide foto',
      photoRealLabel: 'Fără filtre',
      lightboxCloseLabel: 'Închide foto',
      lightboxPrevLabel: 'Foto anterioară',
      lightboxNextLabel: 'Foto următoare',
      reviewsTitle: 'Stele și recenzii',
      reviewsSubtitle: 'Momentan nu publicăm review-uri demo. Recenziile apar după comenzi reale.',
      reviewFormTitle: 'Evaluează produsul (1-5 stele)',
      reviewStarsAria: 'Alege rating',
      reviewPlaceholder: 'Scrie pe scurt cum ți s-a potrivit produsul.',
      reviewPhotoLabel: 'Foto cumpărător',
      reviewPhotoHint: 'Adaugă până la 2 poze reale (max 2MB fiecare).',
      reviewPhotoAlt: 'Foto recenzie',
      reviewPhotoLimitError: 'Poți încărca maximum 2 fotografii.',
      reviewPhotoTypeError: 'Poți încărca doar imagini.',
      reviewPhotoSizeError: 'Fiecare imagine trebuie să fie sub 2MB.',
      reviewSubmit: 'Trimite recenzia',
      reviewOnlyAfterPurchase: 'Poți lăsa recenzie doar după cumpărarea acestui produs.',
      reviewStarsError: 'Alege un rating între 1 și 5 stele.',
      reviewTextError: 'Scrie câteva cuvinte despre produs înainte de trimitere.',
      reviewSuccess: 'Recenzia a fost salvată.',
      noReviewsYet: 'Încă nu există recenzii',
      noRatingLabel: '0.0/5',
      reviewsCountSuffix: 'recenzii',
      selectSizeError: 'Alege mărimea înainte de a continua.',
      addedToCart: 'Produs adăugat în coș.',
      quickCheckout: 'Produs adăugat. Te mutăm la checkout.',
      addedWishlist: 'Produs adăugat la favorite.',
      removedWishlist: 'Produs eliminat din favorite.',
      notFoundTitle: 'Produsul nu a fost găsit',
      notFoundText: 'Se pare că acest produs nu mai este disponibil.',
      toCatalog: 'Înapoi la catalog'
    }
  }

  if (locale.value === 'en') {
    return {
      color: 'Color',
      stock: 'Availability',
      inStock: 'In stock',
      size: 'Size',
      price: 'Price',
      addToCart: 'Add to cart',
      buyNow: 'Buy now',
      addWishlist: 'Add to wishlist',
      removeWishlist: 'Remove from wishlist',
      relatedLabel: 'Selection',
      relatedTitle: 'Related products',
      faqTitle: 'Product questions',
      stockLeftPrefix: 'Only',
      stockLeftSuffix: 'left',
      deliverByPrefix: 'Delivered by',
      shipping: 'Delivery in 2-3 days',
      returns: '14-day return or exchange',
      support: 'WhatsApp/Telegram support',
      trustDelivery: '2-3 day delivery',
      trustReturn: '14-day returns',
      trustPayment: 'Secure payment',
      trustGuarantee: 'Quality guarantee',
      proofTitle1: 'Customer verified',
      proofText1: 'Highly rated for fit and all-day comfort.',
      proofTitle2: 'Risk-free purchase',
      proofText2: 'Easy 14-day return if the size does not fit.',
      photoProof1: 'HD photo',
      photoProof2: 'True color',
      photoProof3: 'Clean white background',
      photoZoom: 'Open photo',
      photoRealLabel: 'No filters',
      lightboxCloseLabel: 'Close photo',
      lightboxPrevLabel: 'Previous photo',
      lightboxNextLabel: 'Next photo',
      reviewsTitle: 'Stars and reviews',
      reviewsSubtitle: 'No demo reviews are shown. Ratings appear after real purchases.',
      reviewFormTitle: 'Rate this product (1-5 stars)',
      reviewStarsAria: 'Choose rating',
      reviewPlaceholder: 'Write a short note about fit and quality.',
      reviewPhotoLabel: 'Buyer photo',
      reviewPhotoHint: 'Add up to 2 real photos (max 2MB each).',
      reviewPhotoAlt: 'Review photo',
      reviewPhotoLimitError: 'You can upload up to 2 photos.',
      reviewPhotoTypeError: 'Only image files are allowed.',
      reviewPhotoSizeError: 'Each image must be under 2MB.',
      reviewSubmit: 'Submit review',
      reviewOnlyAfterPurchase: 'You can leave a review only after buying this product.',
      reviewStarsError: 'Choose a rating between 1 and 5 stars.',
      reviewTextError: 'Please write a short review before submitting.',
      reviewSuccess: 'Review saved successfully.',
      noReviewsYet: 'No reviews yet',
      noRatingLabel: '0.0/5',
      reviewsCountSuffix: 'reviews',
      selectSizeError: 'Please select a size first.',
      addedToCart: 'Product added to cart.',
      quickCheckout: 'Added to cart. Redirecting to checkout.',
      addedWishlist: 'Product added to wishlist.',
      removedWishlist: 'Product removed from wishlist.',
      notFoundTitle: 'Product not found',
      notFoundText: 'Looks like this product is no longer available.',
      toCatalog: 'Back to catalog'
    }
  }

  return {
    color: 'Цвет',
    stock: 'Наличие',
    inStock: 'В наличии',
    size: 'Размер',
    price: 'Цена',
    addToCart: 'Добавить в корзину',
    buyNow: 'Купить сейчас',
    addWishlist: 'В избранное',
    removeWishlist: 'Убрать из избранного',
    relatedLabel: 'Подборка',
    relatedTitle: 'Похожие товары',
    faqTitle: 'Вопросы по товару',
    stockLeftPrefix: 'Осталось:',
    stockLeftSuffix: 'шт.',
    deliverByPrefix: 'Доставим до',
    shipping: 'Доставка 2-3 дня',
    returns: 'Обмен/возврат 14 дней',
    support: 'Поддержка в WhatsApp/Telegram',
    trustDelivery: 'Доставка 2-3 дня',
    trustReturn: 'Возврат 14 дней',
    trustPayment: 'Безопасная оплата',
    trustGuarantee: 'Гарантия качества',
    proofTitle1: 'Проверено клиентами',
    proofText1: 'Высокие оценки за посадку и комфорт каждый день.',
    proofTitle2: 'Покупка без риска',
    proofText2: 'Лёгкий возврат за 14 дней, если размер не подошёл.',
    photoProof1: 'Фото HD',
    photoProof2: 'Реальные цвета',
    photoProof3: 'Чистый белый фон',
    photoZoom: 'Открыть фото',
    photoRealLabel: 'Без фильтров',
    lightboxCloseLabel: 'Закрыть фото',
    lightboxPrevLabel: 'Предыдущее фото',
    lightboxNextLabel: 'Следующее фото',
    reviewsTitle: 'Рейтинг и отзывы',
    reviewsSubtitle: 'Пока не показываем вымышленные отзывы. Оценки появляются после реальных покупок.',
    reviewFormTitle: 'Оцените товар (1-5 звёзд)',
    reviewStarsAria: 'Выберите оценку',
    reviewPlaceholder: 'Напишите коротко, как сел товар и как качество.',
    reviewPhotoLabel: 'Фото покупателя',
    reviewPhotoHint: 'Добавьте до 2 реальных фото (до 2MB каждое).',
    reviewPhotoAlt: 'Фото отзыва',
    reviewPhotoLimitError: 'Можно загрузить максимум 2 фото.',
    reviewPhotoTypeError: 'Можно загружать только изображения.',
    reviewPhotoSizeError: 'Каждое изображение должно быть меньше 2MB.',
    reviewSubmit: 'Отправить отзыв',
    reviewOnlyAfterPurchase: 'Оставить отзыв можно только после покупки этого товара.',
    reviewStarsError: 'Выберите оценку от 1 до 5 звёзд.',
    reviewTextError: 'Напишите короткий отзыв перед отправкой.',
    reviewSuccess: 'Отзыв сохранён.',
    noReviewsYet: 'Пока нет отзывов',
    noRatingLabel: '0.0/5',
    reviewsCountSuffix: 'отзывов',
    selectSizeError: 'Сначала выберите размер.',
    addedToCart: 'Товар добавлен в корзину.',
    quickCheckout: 'Товар добавлен. Переходим к оформлению.',
    addedWishlist: 'Товар добавлен в избранное.',
    removedWishlist: 'Товар убран из избранного.',
    notFoundTitle: 'Товар не найден',
    notFoundText: 'Похоже, этот товар больше не доступен.',
    toCatalog: 'Вернуться в каталог'
  }
})

const addToCart = () => {
  if (!product.value) return false

  if (!selectedSize.value) {
    uiStore.showToast(ui.value.selectSizeError, 'error')
    return false
  }

  shopStore.addToCart({
    id: product.value.id,
    title: product.value.title,
    price: product.value.price,
    image: product.value.image,
    description: product.value.description,
    selectedSize: selectedSize.value
  })

  uiStore.showToast(ui.value.addedToCart, 'success')
  return true
}

const buyNow = async () => {
  const added = addToCart()
  if (!added) return

  uiStore.showToast(ui.value.quickCheckout, 'info')
  await navigateTo(localePath('/checkout'))
}

const toggleWishlist = () => {
  if (!product.value) return

  const wasWishlisted = shopStore.isInWishlist(product.value.id)

  shopStore.toggleWishlist({
    id: product.value.id,
    title: product.value.title,
    price: product.value.price,
    image: product.value.image,
    description: product.value.description
  })

  uiStore.showToast(wasWishlisted ? ui.value.removedWishlist : ui.value.addedWishlist, 'info')
}

const faqItems = computed(() => {
  if (locale.value === 'ro') {
    return [
      { q: 'Cum aleg mărimea corectă?', a: 'Alege mărimea pe care o porți de obicei. Dacă eziți între două mărimi, contactează suportul nostru.' },
      { q: 'Când se expediază comanda?', a: 'Comanda este confirmată rapid și trimisă în aceeași zi sau în următoarea zi lucrătoare.' },
      { q: 'Pot returna produsul?', a: 'Da. Ai 14 zile pentru retur sau schimb, dacă produsul este în starea originală.' }
    ]
  }

  if (locale.value === 'en') {
    return [
      { q: 'How do I choose the right size?', a: 'Pick your regular size. If you are between sizes, contact support and we will guide you.' },
      { q: 'When is the order shipped?', a: 'Orders are confirmed quickly and shipped the same day or next business day.' },
      { q: 'Can I return the product?', a: 'Yes. You have 14 days for return or exchange if the item stays in original condition.' }
    ]
  }

  return [
    { q: 'Как выбрать правильный размер?', a: 'Выбирайте размер, который обычно носите. Если сомневаетесь между двумя, напишите в поддержку.' },
    { q: 'Когда отправляется заказ?', a: 'Заказ подтверждается быстро и отправляется в тот же день или на следующий рабочий день.' },
    { q: 'Можно ли вернуть товар?', a: 'Да. У вас есть 14 дней на возврат или обмен при сохранении исходного состояния.' }
  ]
})

const siteUrl = 'https://onestyleforever.com'
const defaultImage = `${siteUrl}/logo-preview.png`

useSeoMeta({
  title: () => (product.value ? `${product.value.title} | ONE STYLE FOREVER` : `ONE STYLE FOREVER | ${ui.value.notFoundTitle}`),
  description: () => (product.value ? product.value.description : ui.value.notFoundText),
  ogTitle: () => (product.value ? `${product.value.title} | ONE STYLE FOREVER` : `ONE STYLE FOREVER`),
  ogDescription: () => (product.value ? product.value.description : ui.value.notFoundText),
  ogImage: () => (product.value ? `${siteUrl}${product.value.image}` : defaultImage),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterImage: () => (product.value ? `${siteUrl}${product.value.image}` : defaultImage)
})

useHead(
  computed(() => {
    if (!product.value) {
      return {}
    }

    return {
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.value.title,
            image: [`${siteUrl}${product.value.image}`],
            description: product.value.description,
            sku: product.value.id,
            brand: {
              '@type': 'Brand',
              name: 'ONE STYLE FOREVER'
            },
            offers: {
              '@type': 'Offer',
              url: `${siteUrl}/product/${product.value.id}`,
              priceCurrency: 'MDL',
              price: product.value.price,
              availability: 'https://schema.org/InStock'
            }
          })
        }
      ]
    }
  })
)
</script>

<style scoped>
.product-page {
  padding-top: 12px;
}

.breadcrumbs {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}

.breadcrumbs a {
  color: #2f4858;
}

.product-box,
.related-box,
.not-found-box {
  padding: 32px;
}

.product-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
}

.gallery {
  display: grid;
  gap: 12px;
}

.main-image {
  min-height: 520px;
  border-radius: 28px;
  border: 1px solid var(--border);
  background: #fff;
  display: grid;
  place-items: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  perspective: 1000px;
}

.main-image-media {
  width: 100%;
  max-width: 440px;
  max-height: 480px;
  object-fit: contain;
  will-change: transform;
  transition: transform 0.2s ease;
}

.main-image-glow {
  position: absolute;
  inset: 12% 10%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(16, 24, 40, 0.06), transparent 68%);
  filter: blur(12px);
  pointer-events: none;
  transition: transform 0.2s ease;
}

.product-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #1f8f54;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.product-badge.hot {
  background: #d95b32;
}

.thumbs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.gallery-counter {
  position: absolute;
  top: 16px;
  right: 16px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 11px;
  font-weight: 800;
  color: #3f556f;
  display: inline-flex;
  align-items: center;
}

.zoom-hint-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #b8d5bc;
  background: #f3fbf5;
  color: #205d3c;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.thumb-btn {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 6px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.thumb-btn.active {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-content {
  display: grid;
  align-content: start;
}

.product-title {
  margin: 0;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.product-description {
  margin: 14px 0 0;
  color: #4a5a70;
  font-size: 16px;
  line-height: 1.7;
}

.urgency-note {
  margin-top: 12px;
  min-height: 34px;
  width: fit-content;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #d4e2d5;
  background: #f5fbf6;
  color: #1f5e3b;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.delivery-note {
  margin-top: 8px;
  color: #2f6c47;
  font-size: 13px;
  font-weight: 700;
}

.meta-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.meta-card {
  min-height: 74px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: #fff;
  display: grid;
  align-content: center;
  gap: 4px;
}

.meta-card span {
  color: var(--muted);
  font-size: 13px;
}

.meta-card strong {
  font-size: 15px;
}

.size-section {
  margin-top: 20px;
  display: grid;
  gap: 10px;
}

.size-title {
  font-size: 14px;
  font-weight: 800;
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-pill {
  min-width: 48px;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.size-pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.actions-row {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
}

.price-box {
  display: grid;
  gap: 5px;
}

.price-box span {
  color: var(--muted);
  font-size: 13px;
}

.price-box strong {
  font-size: 34px;
  line-height: 1;
}

.action-buttons {
  display: grid;
  gap: 10px;
}

.action-btn {
  min-width: 220px;
}

.buy-now-btn {
  background: linear-gradient(135deg, #2c8d56, #216640);
  border-color: #216640;
  color: #fff;
}

.benefits-row {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.benefits-row span {
  min-height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  color: #43566f;
  display: inline-flex;
  align-items: center;
}

.proof-row {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.proof-card {
  border-radius: 14px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 12px;
  display: grid;
  gap: 4px;
}

.proof-card strong {
  font-size: 13px;
}

.proof-card span {
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
}

.section-head {
  margin-bottom: 16px;
}

.block-title {
  margin: 0;
  font-size: clamp(28px, 3.2vw, 40px);
  line-height: 1;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.related-card {
  border-radius: 24px;
  border: 1px solid var(--border);
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(18, 30, 22, 0.07);
}

.related-link {
  display: grid;
}

.related-image {
  min-height: 240px;
  display: grid;
  place-items: center;
  background: #fff;
  padding: 20px;
}

.related-image img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.related-body {
  padding: 14px;
  display: grid;
  gap: 8px;
}

.related-body h3 {
  margin: 0;
  font-size: 19px;
  line-height: 1.1;
}

.related-body p {
  margin: 0;
  color: #4a5a70;
  font-size: 14px;
  line-height: 1.6;
}

.related-body strong {
  font-size: 18px;
}

.faq-box {
  padding: 24px;
}

.faq-list {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.faq-item {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #fff;
  padding: 12px 14px;
}

.rating-summary {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid #d3dfd5;
  background: #fff;
  display: grid;
  gap: 4px;
  max-width: 320px;
}

.stars-row {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 18px;
  line-height: 1;
  color: #a7bbad;
}

.star.active {
  color: #2c8d56;
}

.rating-summary strong {
  font-size: 15px;
}

.rating-summary span {
  color: #5f6d82;
  font-size: 13px;
}

.reviews-box {
  padding: 24px;
}

.reviews-head p {
  margin: 10px 0 0;
  color: var(--muted);
  line-height: 1.6;
}

.reviews-form-box {
  margin-top: 16px;
  padding: 18px;
  border: 1px solid #d3dfd5;
  border-radius: 16px;
  background: #fff;
}

.review-form-title {
  margin: 0 0 10px;
  font-weight: 800;
}

.review-stars {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.review-star-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #d3dfd5;
  background: #fff;
  color: #9db2a3;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.review-star-btn.active {
  color: #2c8d56;
  border-color: #8ab79a;
  background: #f3fbf5;
}

.review-textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid #d3dfd5;
  background: #fff;
  padding: 12px 14px;
  color: var(--text);
  resize: vertical;
}

.review-upload {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.review-upload input {
  max-width: 320px;
}

.review-upload span {
  color: #5e7766;
  font-size: 12px;
}

.review-draft-photos,
.review-photos {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.review-photo-thumb {
  width: 68px;
  height: 68px;
  border-radius: 12px;
  border: 1px solid #d3dfd5;
  padding: 0;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
}

.review-photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.review-note {
  color: #4e6655;
  font-size: 13px;
}

.reviews-list {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.review-item {
  border: 1px solid #d3dfd5;
  border-radius: 14px;
  background: #fff;
  padding: 12px;
}

.review-item p {
  margin: 8px 0 6px;
  color: #324c3a;
  line-height: 1.6;
}

.review-item time {
  color: #5e7766;
  font-size: 12px;
}

.faq-item summary {
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.faq-item p {
  margin: 8px 0 0;
  color: var(--muted);
  line-height: 1.6;
}

.mobile-sticky-bar {
  display: none;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 160;
  background: rgba(10, 18, 29, 0.9);
  display: grid;
  place-items: center;
  padding: 24px;
}

.lightbox-image {
  width: min(100%, 980px);
  max-height: calc(100vh - 140px);
  object-fit: contain;
  border-radius: 20px;
  background: #fff;
  padding: 18px;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.lightbox-nav.prev {
  left: 16px;
}

.lightbox-nav.next {
  right: 16px;
}

.lightbox-meta {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  min-width: 260px;
  max-width: calc(100% - 32px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: rgba(6, 12, 21, 0.5);
  color: #fff;
  padding: 10px 14px;
  display: grid;
  gap: 2px;
  text-align: center;
}

.lightbox-meta strong {
  font-size: 14px;
}

.lightbox-meta span {
  font-size: 12px;
  color: rgba(237, 244, 255, 0.9);
}

.not-found-box {
  text-align: center;
}

.not-found-box h1 {
  margin: 0;
  font-size: 42px;
}

.not-found-box p {
  margin: 12px auto 18px;
  max-width: 520px;
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .main-image-media,
  .main-image-glow,
  .thumb-btn {
    transition: none;
  }

  .thumb-btn.active {
    transform: none;
  }
}

@media (max-width: 1100px) {
  .product-layout,
  .related-grid {
    grid-template-columns: 1fr;
  }

  .main-image {
    min-height: 420px;
  }
}

@media (max-width: 640px) {
  .product-box,
  .related-box,
  .not-found-box {
    padding: 18px;
  }

  .main-image {
    min-height: 310px;
    border-radius: 18px;
  }

  .gallery-counter {
    top: 12px;
    right: 12px;
  }

  .zoom-hint-btn {
    right: 12px;
    bottom: 12px;
  }

  .actions-row {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    min-width: 0;
    width: 100%;
  }

  .proof-row {
    grid-template-columns: 1fr;
  }

  .faq-box {
    padding: 18px;
  }

  .reviews-box {
    padding: 18px;
  }

  .mobile-sticky-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    background: rgba(255, 255, 255, 0.98);
    border-top: 1px solid var(--border);
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .mobile-price {
    display: grid;
    gap: 2px;
  }

  .mobile-price span {
    font-size: 12px;
    color: var(--muted);
  }

  .mobile-price strong {
    font-size: 18px;
    line-height: 1;
  }

  .mobile-buy {
    min-height: 44px;
    padding: 0 16px;
  }

  .product-page {
    padding-bottom: 78px;
  }

  .lightbox {
    padding: 14px;
  }

  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .lightbox-nav.prev {
    left: 8px;
  }

  .lightbox-nav.next {
    right: 8px;
  }
}
</style>
