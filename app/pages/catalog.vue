<template>
  <div class="catalog-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card catalog-intro">
          <div class="catalog-intro-top">
            <div>
              <span class="section-label">{{ ui.label }}</span>
              <h1 class="section-title catalog-title">{{ ui.title }}</h1>
              <p class="section-text catalog-subtitle">
                {{ ui.subtitle }}
              </p>
            </div>

            <div class="catalog-summary">
              <div class="summary-item">
                <strong>{{ filteredProducts.length }}</strong>
                <span>{{ ui.itemsCount }}</span>
              </div>

              <div class="summary-item">
                <strong>{{ ui.cleanStyleTitle }}</strong>
                <span>{{ ui.cleanStyleText }}</span>
              </div>
            </div>
          </div>

          <div class="catalog-toolbar">
            <div class="search-box">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M21 21l-4.35-4.35"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
              </svg>

              <input
                v-model="searchInput"
                type="text"
                :placeholder="ui.searchPlaceholder"
              />

              <button
                v-if="searchInput"
                type="button"
                class="search-reset-btn"
                :aria-label="ui.clearSearch"
                @click="clearSearch"
              >
                ✕
              </button>
            </div>

            <select v-model="sortBy" class="sort-select">
              <option value="default">{{ ui.sortDefault }}</option>
              <option value="price-asc">{{ ui.sortPriceAsc }}</option>
              <option value="price-desc">{{ ui.sortPriceDesc }}</option>
              <option value="name-asc">{{ ui.sortNameAsc }}</option>
              <option value="stock-desc">{{ ui.sortStockDesc }}</option>
            </select>
          </div>
        </div>

        <div class="surface-card catalog-benefits">
          <span>{{ ui.benefit1 }}</span>
          <span>{{ ui.benefit2 }}</span>
          <span>{{ ui.benefit3 }}</span>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="mobile-sticky-filters">
          <button
            type="button"
            class="mobile-filter-btn"
            :class="{ active: mobileFiltersOpen }"
            @click="mobileFiltersOpen = !mobileFiltersOpen"
          >
            {{ mobileFiltersOpen ? ui.hideFilters : ui.showFilters }}
          </button>

          <button type="button" class="mobile-filter-btn secondary" @click="resetFilters">
            {{ ui.reset }}
          </button>

          <span class="mobile-filter-count">
            {{ filteredProducts.length }} {{ ui.itemsCount }}
          </span>
        </div>

        <div class="catalog-layout">
          <aside class="surface-card filters-box" :class="{ open: mobileFiltersOpen }">
            <div class="filters-head">
              <h2>{{ ui.filters }}</h2>
              <button type="button" class="reset-btn" @click="resetFilters">
                {{ ui.reset }}
              </button>
            </div>

            <div class="filter-group">
              <span class="filter-title">{{ ui.category }}</span>
              <div class="filter-list">
                <button
                  v-for="item in categoryOptions"
                  :key="item.value"
                  type="button"
                  class="filter-chip"
                  :class="{ active: selectedCategory === item.value }"
                  @click="selectedCategory = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-title">{{ ui.color }}</span>
              <div class="filter-list">
                <button
                  v-for="item in colorOptions"
                  :key="item.value"
                  type="button"
                  class="filter-chip"
                  :class="{ active: selectedColor === item.value }"
                  @click="selectedColor = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-title">{{ ui.priceRange }}</span>
              <div class="price-range">
                <div class="price-inputs">
                  <input
                    v-model.number="minPrice"
                    type="number"
                    :placeholder="ui.minPrice"
                    class="price-input"
                    min="0"
                  />
                  <span class="price-separator">-</span>
                  <input
                    v-model.number="maxPrice"
                    type="number"
                    :placeholder="ui.maxPrice"
                    class="price-input"
                    min="0"
                  />
                </div>
                <button type="button" class="apply-price-btn" @click="applyPriceFilter">
                  {{ ui.applyPrice }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <div class="filter-list">
                <button
                  v-for="item in sizeOptions"
                  :key="item.value"
                  type="button"
                  class="filter-chip size-chip"
                  :class="{ active: selectedSize === item.value }"
                  @click="selectedSize = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-title">{{ ui.availability }}</span>
              <div class="filter-list">
                <button
                  v-for="item in availabilityOptions"
                  :key="item.value"
                  type="button"
                  class="filter-chip"
                  :class="{ active: selectedAvailability === item.value }"
                  @click="selectedAvailability = item.value"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div class="filter-note">
              <strong>{{ ui.filterNoteTitle }}</strong>
              <p>{{ ui.filterNoteText }}</p>
            </div>
          </aside>

          <div class="catalog-content">
            <div class="catalog-meta">
              <div class="catalog-tabs">
                <button
                  v-for="item in categoryOptions"
                  :key="`tab-${item.value}`"
                  type="button"
                  class="tab-chip"
                  :class="{ active: selectedCategory === item.value }"
                  @click="selectedCategory = item.value"
                >
                  {{ item.label }}
                </button>
              </div>

              <span class="results-count">
                {{ filteredProducts.length }} {{ ui.itemsCount }}
              </span>
            </div>

            <template v-if="filteredProducts.length">
              <div class="product-grid">
                <article
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="product-card"
                >
                <div class="product-media">
                  <span class="product-badge" :class="{ hot: product.badge === 'HOT' }">
                    {{ product.badge }}
                  </span>

                  <button
                    type="button"
                    class="wishlist-toggle"
                    :class="{ active: isWishlisted(product.id) }"
                    :aria-label="wishlistButtonLabel(product.id)"
                    @click="toggleProductWishlist(product)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 21s-6.5-4.35-8.5-8.02C1.94 9.98 3.58 6 7.45 6c1.93 0 3.17 1.02 4.05 2.3C12.38 7.02 13.62 6 15.55 6c3.87 0 5.51 3.98 3.95 6.98C18.5 16.65 12 21 12 21Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>

                  <NuxtLink
                    :to="localePath(`/product/${product.id}`)"
                    class="product-media-link"
                  >
                    <OptimizedImage
                      :src="product.image"
                      :alt="product.title"
                      loading="lazy"
                      width="900"
                      height="900"
                      sizes="(max-width: 640px) 46vw, (max-width: 1200px) 38vw, 320px"
                    />
                  </NuxtLink>
                </div>

                <div class="product-body">
                  <div class="product-meta-row">
                    <span class="product-chip">{{ product.categoryLabel }}</span>
                    <span class="product-stock">
                      {{ getStockLeftValue(product.id, product.badge, product.sizes.length) > 0
                        ? `${ui.inStock} · ${ui.leftLabel} ${getStockLeftLabel(product)}`
                        : ui.outOfStock }}
                    </span>
                  </div>

                  <NuxtLink
                    :to="localePath(`/product/${product.id}`)"
                    class="product-title-link"
                  >
                    <h3>{{ product.title }}</h3>
                  </NuxtLink>

                  <p>{{ product.description }}</p>

                  <div class="product-options">
                    <div class="option-row">
                      <span class="option-label">{{ ui.color }}</span>
                      <span class="option-value">{{ product.colorLabel }}</span>
                    </div>

                    <div class="option-row">
                      <span class="option-label">{{ ui.size }}</span>

                      <div class="size-list">
                        <button
                          v-for="size in product.sizes"
                          :key="`${product.id}-${size}`"
                          type="button"
                          class="size-pill"
                          :class="{ active: getSelectedSize(product.id) === size }"
                          @click="selectSize(product.id, size)"
                        >
                          {{ size }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="product-delivery-note">{{ ui.deliverByPrefix }} {{ getDeliveryDateLabel(product) }}</div>

                  <div class="product-bottom">
                    <strong>{{ product.price }} MDL</strong>

                    <div class="product-actions">
                      <button
                        type="button"
                        class="auto-size-note auto-size-trigger"
                        :class="{ ready: getAutoSize(product) }"
                        :aria-expanded="openQuickSizeFor === product.id"
                        @click="toggleQuickSizePicker(product.id)"
                      >
                        {{ getAutoSize(product) ? `${ui.autoSize}: ${getAutoSize(product)}` : ui.autoSizeEmpty }}
                      </button>

                      <div v-if="openQuickSizeFor === product.id" class="mini-size-picker">
                        <span class="mini-size-title">{{ ui.quickSizeTitle }}</span>
                        <div class="mini-size-list">
                          <button
                            v-for="size in product.sizes"
                            :key="`${product.id}-mini-${size}`"
                            type="button"
                            class="mini-size-btn"
                            :class="{ active: getSelectedSize(product.id) === size || getAutoSize(product) === size }"
                            @click="applyQuickSize(product.id, size)"
                          >
                            {{ size }}
                          </button>
                        </div>
                      </div>

                      <NuxtLink
                        :to="localePath(`/product/${product.id}`)"
                        class="quick-btn"
                      >
                        {{ ui.quickView }}
                      </NuxtLink>

                      <button
                        type="button"
                        class="buy-now-btn"
                        :disabled="!getSelectedSize(product.id) || !hasStockForSelectedSize(product)"
                        @click="buyNowFromCatalog(product)"
                      >
                        {{ ui.buyNow }}
                      </button>

                      <button
                        type="button"
                        class="buy-btn"
                        :disabled="!getSelectedSize(product.id) || !hasStockForSelectedSize(product)"
                        @click="addProductToCart(product)"
                      >
                        {{ getSelectedSize(product.id) ? ui.addToCart : ui.chooseSize }}
                      </button>

                      <div class="card-trust-row">
                        <span>{{ ui.trustDelivery }}</span>
                        <span>{{ ui.trustReturn }}</span>
                        <span>{{ ui.trustPayment }}</span>
                        <span>{{ ui.trustGuarantee }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </article>
              </div>

              <div
                v-if="smartRows.length"
                class="smart-sections"
              >
                <section
                  v-for="row in smartRows"
                  :key="row.key"
                  class="surface-card smart-row"
                >
                  <div class="smart-head">
                    <h3>{{ row.title }}</h3>
                    <span>{{ row.subtitle }}</span>
                  </div>

                  <div class="smart-grid">
                    <article v-for="item in row.items" :key="`${row.key}-${item.id}`" class="smart-card">
                      <NuxtLink :to="localePath(`/product/${item.id}`)" class="smart-image-link">
                        <OptimizedImage
                          :src="item.image"
                          :alt="item.title"
                          loading="lazy"
                          width="520"
                          height="520"
                          sizes="(max-width: 640px) 44vw, 200px"
                        />
                      </NuxtLink>
                      <div class="smart-body">
                        <NuxtLink :to="localePath(`/product/${item.id}`)" class="smart-title-link">{{ item.title }}</NuxtLink>
                        <span class="smart-meta">{{ item.categoryLabel }} · {{ item.colorLabel }}</span>
                        <div class="smart-bottom">
                          <strong>{{ item.price }} MDL</strong>
                          <button type="button" class="smart-add-btn" @click="quickAddFromSmart(item)">
                            {{ ui.quickAdd }}
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                </section>
              </div>
            </template>

            <div v-else class="surface-card empty-box">
              <h3>{{ ui.emptyTitle }}</h3>
              <p>{{ ui.emptyText }}</p>

              <button type="button" class="btn-main" @click="resetFilters">
                {{ ui.reset }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="catalog-sticky-cart" v-if="shopStore.cartCount">
      <div class="sticky-meta">
        <strong>{{ shopStore.cartTotal }} MDL</strong>
        <span>{{ shopStore.cartCount }} {{ ui.itemsCount }}</span>
      </div>

      <NuxtLink :to="localePath('/checkout')" class="btn-main sticky-checkout">
        {{ ui.goCheckout }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '~/composables/useAnalytics'
import { getRecentlyViewedIds } from '~/composables/useRecentlyViewed'
import {
  getProducts,
  type LocalizedProduct,
  type ProductColor,
  type ProductSize,
  type ProductCategory
} from '~/data/products'

type CategoryValue = 'all' | ProductCategory
type ColorValue = 'all' | ProductColor
type SizeValue = 'all' | ProductSize
type AvailabilityValue = 'all' | 'in-stock' | 'out-of-stock'
type SortValue = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'stock-desc'

type FilterOption<T extends string> = {
  value: T
  label: string
}

type SmartRow = {
  key: string
  title: string
  subtitle: string
  items: LocalizedProduct[]
}

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const shopStore = useShopStore()
const uiStore = useUiStore()
const { track } = useAnalytics()
const { getSelectedSize, selectSize, addProductWithSize, selectedSizes, getPreferredSize } = useProductActions()

definePageMeta({
  pageTransition: {
    name: 'catalog-product'
  }
})

const searchInput = ref('')
const searchQuery = ref('')
const selectedCategory = ref<CategoryValue>('all')
const selectedColor = ref<ColorValue>('all')
const selectedSize = ref<SizeValue>('all')
const selectedAvailability = ref<AvailabilityValue>('all')
const sortBy = ref<SortValue>('default')
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const mobileFiltersOpen = ref(false)
const openQuickSizeFor = ref('')
const stockTotals = ref<Record<string, number>>({})
const stockBySize = ref<Record<string, Record<string, number>>>({})
const recentlyViewedIds = ref<string[]>([])
const serverTogetherIds = ref<string[]>([])
const serverRecommendIds = ref<string[]>([])
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let focusRefreshHandler: (() => void) | null = null
const isApplyingRouteQuery = ref(false)

const applyPriceFilter = () => {
  if (minPrice.value !== null && minPrice.value <= 0) {
    minPrice.value = null
  }

  if (maxPrice.value !== null && maxPrice.value <= 0) {
    maxPrice.value = null
  }

  if (minPrice.value !== null && maxPrice.value !== null && minPrice.value > maxPrice.value) {
    const currentMin = minPrice.value
    minPrice.value = maxPrice.value
    maxPrice.value = currentMin
  }
}

const clearSearch = () => {
  searchInput.value = ''
  searchQuery.value = ''
}

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Catalog',
      title: 'Produse populare',
      subtitle:
        'Selecție curată ONE STYLE FOREVER, cu accent pe stil, prezentare și alegere ușoară.',
      searchPlaceholder: 'Caută produs...',
      sortDefault: 'Sortare implicită',
      sortPriceAsc: 'Preț crescător',
      sortPriceDesc: 'Preț descrescător',
      sortNameAsc: 'Nume A-Z',
      sortStockDesc: 'Mai întâi în stoc',
      filters: 'Filtre',
      reset: 'Resetează',
      category: 'Categorie',
      color: 'Culoare',
      size: 'Mărime',
      availability: 'Disponibilitate',
      availabilityAll: 'Toate',
      availabilityInStock: 'În stoc',
      availabilityOutOfStock: 'Epuizat',
      priceRange: 'Interval preț',
      minPrice: 'Min',
      maxPrice: 'Max',
      applyPrice: 'Aplică',
      itemsCount: 'produse',
      inStock: 'În stoc',
      leftLabel: 'rămase',
      deliverByPrefix: 'Livrare până la',
      addToCart: 'În coș',
      buyNow: 'Cumpără acum',
      quickView: 'Vezi rapid',
      chooseSize: 'Alege mărimea',
      goCheckout: 'Finalizează comanda',
      showFilters: 'Filtre',
      hideFilters: 'Ascunde',
      autoSize: 'Mărime auto',
      autoSizeEmpty: 'Alege mărimea pentru 1-click',
      quickSizeTitle: 'Alege rapid',
      trustDelivery: 'Livrare 2-3 zile',
      trustReturn: 'Retur 14 zile',
      trustPayment: 'Plată sigură',
      trustGuarantee: 'Garanție',
      benefit1: 'Livrare în 2-3 zile',
      benefit2: 'Retur simplu în 14 zile',
      benefit3: 'Checkout securizat',
      emptyTitle: 'Niciun produs găsit',
      emptyText: 'Încearcă alte filtre sau resetează selecția.',
      all: 'Toate',
      sweaters: 'Pulovere',
      hoodies: 'Hanorace',
      polo: 'Polo',
      white: 'Alb',
      black: 'Negru',
      cleanStyleTitle: 'Stil curat',
      cleanStyleText: 'Selecție simplă',
      filterNoteTitle: 'Navigare clară',
      filterNoteText:
        'Alege categoria, culoarea și mărimea fără pași inutili.',
      addedToCart: 'Produsul a fost adăugat în coș',
      quickCheckoutAdded: 'Produs adăugat. Te redirecționăm la checkout.',
      outOfStock: 'Stoc epuizat',
      outOfStockToast: 'Produsul nu mai este în stoc.',
      clearSearch: 'Șterge căutarea',
      quickAdd: 'Adaugă rapid',
      withItemTitle: 'Cu acest produs cumpără',
      withItemSubtitle: 'Completează comanda într-un singur clic',
      viewedTitle: 'Văzute recent',
      viewedSubtitle: 'Revino rapid la modelele verificate',
      recommendTitle: 'Recomandat pentru tine',
      recommendSubtitle: 'Selectat după mărimea și categoriile tale'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Catalog',
      title: 'Popular products',
      subtitle:
        'A clean ONE STYLE FOREVER selection focused on style, presentation, and easy choice.',
      searchPlaceholder: 'Search product...',
      sortDefault: 'Default sorting',
      sortPriceAsc: 'Price ascending',
      sortPriceDesc: 'Price descending',
      sortNameAsc: 'Name A-Z',
      sortStockDesc: 'In-stock first',
      filters: 'Filters',
      reset: 'Reset',
      category: 'Category',
      color: 'Color',
      size: 'Size',
      availability: 'Availability',
      availabilityAll: 'All',
      availabilityInStock: 'In stock',
      availabilityOutOfStock: 'Out of stock',
      priceRange: 'Price Range',
      minPrice: 'Min',
      maxPrice: 'Max',
      applyPrice: 'Apply',
      itemsCount: 'items',
      inStock: 'In stock',
      leftLabel: 'left',
      deliverByPrefix: 'Delivered by',
      addToCart: 'Add to cart',
      buyNow: 'Buy now',
      quickView: 'Quick view',
      chooseSize: 'Choose size',
      goCheckout: 'Go to checkout',
      showFilters: 'Filters',
      hideFilters: 'Hide',
      autoSize: 'Auto size',
      autoSizeEmpty: 'Choose size for 1-click',
      quickSizeTitle: 'Choose quickly',
      trustDelivery: '2-3 day delivery',
      trustReturn: '14-day returns',
      trustPayment: 'Secure payment',
      trustGuarantee: 'Guarantee',
      benefit1: 'Delivery in 2-3 days',
      benefit2: 'Easy 14-day returns',
      benefit3: 'Secure checkout',
      emptyTitle: 'No products found',
      emptyText: 'Try other filters or reset selection.',
      all: 'All',
      sweaters: 'Sweaters',
      hoodies: 'Hoodies',
      polo: 'Polo',
      white: 'White',
      black: 'Black',
      cleanStyleTitle: 'Clean style',
      cleanStyleText: 'Easy selection',
      filterNoteTitle: 'Clear browsing',
      filterNoteText:
        'Choose category, color, and size without visual noise.',
      addedToCart: 'Product added to cart',
      quickCheckoutAdded: 'Added to cart. Redirecting to checkout.',
      outOfStock: 'Out of stock',
      outOfStockToast: 'This product is currently out of stock.',
      clearSearch: 'Clear search',
      quickAdd: 'Quick add',
      withItemTitle: 'Frequently bought together',
      withItemSubtitle: 'Complete the look in one click',
      viewedTitle: 'Recently viewed',
      viewedSubtitle: 'Jump back to products you checked',
      recommendTitle: 'Recommended for you',
      recommendSubtitle: 'Picked by your size and category'
    }
  }

  return {
    label: 'Каталог',
    title: 'Популярные товары',
    subtitle:
      'Чистая подборка ONE STYLE FOREVER с акцентом на стиль, подачу и удобный выбор.',
    searchPlaceholder: 'Поиск товара...',
    sortDefault: 'По умолчанию',
    sortPriceAsc: 'Сначала дешевле',
    sortPriceDesc: 'Сначала дороже',
    sortNameAsc: 'По названию',
    sortStockDesc: 'Сначала в наличии',
    filters: 'Фильтры',
    reset: 'Сбросить',
    category: 'Категория',
    color: 'Цвет',
    size: 'Размер',
    availability: 'Наличие',
    availabilityAll: 'Все',
    availabilityInStock: 'В наличии',
    availabilityOutOfStock: 'Нет в наличии',
    priceRange: 'Ценовой диапазон',
    minPrice: 'Мин',
    maxPrice: 'Макс',
    applyPrice: 'Применить',
    itemsCount: 'товаров',
    inStock: 'В наличии',
    leftLabel: 'осталось',
    deliverByPrefix: 'Доставим до',
    addToCart: 'В корзину',
    buyNow: 'Купить сейчас',
    quickView: 'Быстрый просмотр',
    chooseSize: 'Выбери размер',
    goCheckout: 'Перейти к оформлению',
    showFilters: 'Фильтры',
    hideFilters: 'Скрыть',
    autoSize: 'Авторазмер',
    autoSizeEmpty: 'Выбери размер для 1-click',
    quickSizeTitle: 'Быстрый выбор',
    trustDelivery: 'Доставка 2-3 дня',
    trustReturn: 'Возврат 14 дней',
    trustPayment: 'Безопасная оплата',
    trustGuarantee: 'Гарантия',
    benefit1: 'Доставка за 2-3 дня',
    benefit2: 'Лёгкий возврат за 14 дней',
    benefit3: 'Безопасный checkout',
    emptyTitle: 'Товары не найдены',
    emptyText: 'Попробуй другие фильтры или сбрось текущую выборку.',
    all: 'Все',
    sweaters: 'Свитеры',
    hoodies: 'Худи',
    polo: 'Поло',
    white: 'Белый',
    black: 'Черный',
    cleanStyleTitle: 'Чистый стиль',
    cleanStyleText: 'Легкий выбор',
    filterNoteTitle: 'Простой просмотр',
    filterNoteText:
      'Выбирай категорию, цвет и размер без лишнего визуального шума.',
    addedToCart: 'Товар добавлен в корзину',
    quickCheckoutAdded: 'Товар добавлен. Переходим к оформлению.',
    outOfStock: 'Нет в наличии',
    outOfStockToast: 'Товар закончился на складе.',
    clearSearch: 'Очистить поиск',
    quickAdd: 'Быстро добавить',
    withItemTitle: 'С этим товаром покупают',
    withItemSubtitle: 'Дополните заказ в один клик',
    viewedTitle: 'Недавно смотрели',
    viewedSubtitle: 'Быстро вернитесь к просмотренным моделям',
    recommendTitle: 'Рекомендовано для вас',
    recommendSubtitle: 'Подобрано по размеру и любимой категории'
  }
})

const products = computed(() => getProducts(locale.value))

const categoryOptions = computed<FilterOption<CategoryValue>[]>(() => [
  { value: 'all', label: ui.value.all },
  { value: 'sweaters', label: ui.value.sweaters },
  { value: 'hoodies', label: ui.value.hoodies },
  { value: 'polo', label: ui.value.polo }
])

const colorOptions = computed<FilterOption<ColorValue>[]>(() => [
  { value: 'all', label: ui.value.all },
  { value: 'white', label: ui.value.white },
  { value: 'black', label: ui.value.black }
])

const sizeOptions: FilterOption<SizeValue>[] = [
  { value: 'all', label: 'all' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' }
]

const availabilityOptions = computed<FilterOption<AvailabilityValue>[]>(() => [
  { value: 'all', label: ui.value.availabilityAll },
  { value: 'in-stock', label: ui.value.availabilityInStock },
  { value: 'out-of-stock', label: ui.value.availabilityOutOfStock }
])

const toSingleQueryValue = (value: string | string[] | null | undefined) => {
  if (Array.isArray(value)) return String(value[0] || '')
  return String(value || '')
}

const toPositiveNumberOrNull = (value: string | string[] | null | undefined) => {
  const raw = Number(toSingleQueryValue(value))
  if (!Number.isFinite(raw) || raw <= 0) return null
  return Math.floor(raw)
}

const isCategoryValue = (value: string): value is CategoryValue => (
  value === 'all' || value === 'sweaters' || value === 'hoodies' || value === 'polo'
)

const isColorValue = (value: string): value is ColorValue => (
  value === 'all' || value === 'white' || value === 'black'
)

const isSizeValue = (value: string): value is SizeValue => (
  value === 'all' || value === 'S' || value === 'M' || value === 'L'
)

const isAvailabilityValue = (value: string): value is AvailabilityValue => (
  value === 'all' || value === 'in-stock' || value === 'out-of-stock'
)

const isSortValue = (value: string): value is SortValue => (
  value === 'default' || value === 'price-asc' || value === 'price-desc' || value === 'name-asc' || value === 'stock-desc'
)

const applyFiltersFromQuery = (query: Record<string, any>) => {
  const q = toSingleQueryValue(query.q)
  const category = toSingleQueryValue(query.category)
  const color = toSingleQueryValue(query.color)
  const size = toSingleQueryValue(query.size)
  const availability = toSingleQueryValue(query.availability)
  const sort = toSingleQueryValue(query.sort)
  const min = toPositiveNumberOrNull(query.minPrice)
  const max = toPositiveNumberOrNull(query.maxPrice)

  searchInput.value = q
  searchQuery.value = q
  selectedCategory.value = isCategoryValue(category) ? category : 'all'
  selectedColor.value = isColorValue(color) ? color : 'all'
  selectedSize.value = isSizeValue(size) ? size : 'all'
  selectedAvailability.value = isAvailabilityValue(availability) ? availability : 'all'
  sortBy.value = isSortValue(sort) ? sort : 'default'
  minPrice.value = min
  maxPrice.value = max
  applyPriceFilter()
}

const buildFiltersQuery = () => {
  const query: Record<string, string> = {}
  const normalizedSearch = searchQuery.value.trim()

  if (normalizedSearch) query.q = normalizedSearch
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (selectedColor.value !== 'all') query.color = selectedColor.value
  if (selectedSize.value !== 'all') query.size = selectedSize.value
  if (selectedAvailability.value !== 'all') query.availability = selectedAvailability.value
  if (sortBy.value !== 'default') query.sort = sortBy.value
  if (minPrice.value !== null && minPrice.value > 0) query.minPrice = String(minPrice.value)
  if (maxPrice.value !== null && maxPrice.value > 0) query.maxPrice = String(maxPrice.value)

  return query
}

const areQueriesEqual = (nextQuery: Record<string, string>, currentQuery: Record<string, any>) => {
  const currentKeys = Object.keys(currentQuery).filter((key) => key in nextQuery || [
    'q',
    'category',
    'color',
    'size',
    'availability',
    'sort',
    'minPrice',
    'maxPrice'
  ].includes(key))

  const nextKeys = Object.keys(nextQuery)
  if (nextKeys.length !== currentKeys.length) return false

  return nextKeys.every((key) => toSingleQueryValue(currentQuery[key]) === nextQuery[key])
}

const getProductAvailableQuantity = (product: LocalizedProduct) => {
  const liveValue = stockTotals.value[product.id]
  if (typeof liveValue === 'number') return Math.max(0, liveValue)
  return getStockLeftValue(product.id, product.badge, product.sizes.length)
}

const searchableProducts = computed(() =>
  products.value.map((item) => ({
    product: item,
    searchableText: `${item.title} ${item.description} ${item.categoryLabel} ${item.colorLabel}`.toLowerCase()
  }))
)

const filteredProducts = computed(() => {
  let result = searchableProducts.value.map((entry) => entry.product)
  const search = searchQuery.value.trim().toLowerCase()

  if (search) {
    result = searchableProducts.value
      .filter((entry) => entry.searchableText.includes(search))
      .map((entry) => entry.product)
  }

  if (selectedCategory.value !== 'all') {
    result = result.filter((item) => item.category === selectedCategory.value)
  }

  if (selectedColor.value !== 'all') {
    result = result.filter((item) => item.color === selectedColor.value)
  }

  if (selectedSize.value !== 'all') {
    const activeSize = selectedSize.value as ProductSize
    result = result.filter((item) => item.sizes.includes(activeSize))
  }

  if (selectedAvailability.value !== 'all') {
    result = result.filter((item) => {
      const availableQty = getProductAvailableQuantity(item)
      return selectedAvailability.value === 'in-stock' ? availableQty > 0 : availableQty === 0
    })
  }

  if (minPrice.value !== null && minPrice.value > 0) {
    result = result.filter((item) => item.price >= minPrice.value!)
  }

  if (maxPrice.value !== null && maxPrice.value > 0) {
    result = result.filter((item) => item.price <= maxPrice.value!)
  }

  if (sortBy.value === 'price-asc') {
    result.sort((a, b) => a.price - b.price)
  }

  if (sortBy.value === 'price-desc') {
    result.sort((a, b) => b.price - a.price)
  }

  if (sortBy.value === 'name-asc') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  }

  if (sortBy.value === 'stock-desc') {
    result.sort((a, b) => getProductAvailableQuantity(b) - getProductAvailableQuantity(a))
  }

  return result
})

const cartProductIds = computed(() => new Set(shopStore.cart.map((item) => item.id)))
const productsById = computed(() => new Map(products.value.map((item) => [item.id, item])))

const dominantCategory = computed<ProductCategory | null>(() => {
  const score = new Map<ProductCategory, number>()
  for (const item of shopStore.cart) {
    const product = products.value.find((entry) => entry.id === item.id)
    if (!product) continue
    score.set(product.category, (score.get(product.category) || 0) + Math.max(1, item.quantity))
  }
  if (!score.size) return null
  return Array.from(score.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null
})

const dominantSize = computed<ProductSize | null>(() => {
  const score = new Map<ProductSize, number>()
  for (const item of shopStore.cart) {
    const size = String(item.selectedSize || '') as ProductSize
    if (size !== 'S' && size !== 'M' && size !== 'L') continue
    score.set(size, (score.get(size) || 0) + Math.max(1, item.quantity))
  }
  if (!score.size) return null
  return Array.from(score.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null
})

const recentlyViewedProducts = computed(() => {
  if (!recentlyViewedIds.value.length) return [] as LocalizedProduct[]
  const map = new Map(products.value.map((item) => [item.id, item]))
  return recentlyViewedIds.value
    .map((id) => map.get(id))
    .filter((item): item is LocalizedProduct => !!item)
    .filter((item) => !cartProductIds.value.has(item.id))
    .slice(0, 6)
})

const mapIdsToProducts = (ids: string[], limit = 6) => {
  const result: LocalizedProduct[] = []
  for (const id of ids) {
    const product = productsById.value.get(id)
    if (!product) continue
    if (cartProductIds.value.has(product.id)) continue
    if (result.some((item) => item.id === product.id)) continue
    result.push(product)
    if (result.length >= limit) break
  }
  return result
}

const frequentlyBoughtTogetherProducts = computed(() => {
  const serverBased = mapIdsToProducts(serverTogetherIds.value, 4)
  if (serverBased.length) return serverBased

  const firstCart = shopStore.cart[0]
  if (!firstCart) return [] as LocalizedProduct[]
  const base = products.value.find((item) => item.id === firstCart.id)
  if (!base) return [] as LocalizedProduct[]
  return products.value
    .filter((item) => item.id !== base.id && !cartProductIds.value.has(item.id))
    .sort((a, b) => {
      const aScore = (a.category === base.category ? 2 : 0) + (a.color !== base.color ? 1 : 0) + (a.badge === 'HOT' ? 1 : 0)
      const bScore = (b.category === base.category ? 2 : 0) + (b.color !== base.color ? 1 : 0) + (b.badge === 'HOT' ? 1 : 0)
      return bScore - aScore
    })
    .slice(0, 4)
})

const personalizedProducts = computed(() => {
  const serverBased = mapIdsToProducts(serverRecommendIds.value, 4)
  if (serverBased.length) return serverBased

  return products.value
    .filter((item) => !cartProductIds.value.has(item.id))
    .sort((a, b) => {
      const aSize = dominantSize.value && a.sizes.includes(dominantSize.value) ? 2 : 0
      const bSize = dominantSize.value && b.sizes.includes(dominantSize.value) ? 2 : 0
      const aCategory = dominantCategory.value && a.category === dominantCategory.value ? 2 : 0
      const bCategory = dominantCategory.value && b.category === dominantCategory.value ? 2 : 0
      const aHot = a.badge === 'HOT' ? 1 : 0
      const bHot = b.badge === 'HOT' ? 1 : 0
      return (bSize + bCategory + bHot) - (aSize + aCategory + aHot)
    })
    .slice(0, 4)
})

const smartRows = computed<SmartRow[]>(() => {
  const rows: SmartRow[] = []
  if (frequentlyBoughtTogetherProducts.value.length) {
    rows.push({
      key: 'together',
      title: ui.value.withItemTitle,
      subtitle: ui.value.withItemSubtitle,
      items: frequentlyBoughtTogetherProducts.value
    })
  }
  if (recentlyViewedProducts.value.length) {
    rows.push({
      key: 'recent',
      title: ui.value.viewedTitle,
      subtitle: ui.value.viewedSubtitle,
      items: recentlyViewedProducts.value
    })
  }
  if (personalizedProducts.value.length) {
    rows.push({
      key: 'recommended',
      title: ui.value.recommendTitle,
      subtitle: ui.value.recommendSubtitle,
      items: personalizedProducts.value
    })
  }
  return rows
})

const resetFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedColor.value = 'all'
  selectedSize.value = 'all'
  selectedAvailability.value = 'all'
  sortBy.value = 'default'
  minPrice.value = null
  maxPrice.value = null
  mobileFiltersOpen.value = false
  openQuickSizeFor.value = ''
}

const getAutoSize = (product: LocalizedProduct) => getPreferredSize(product)

const getStockLeftValue = (id: string, badge: string, sizesCount: number) => {
  const liveValue = stockTotals.value[id]
  if (typeof liveValue === 'number') return Math.max(0, liveValue)

  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const base = badge === 'HOT' ? 3 : 5
  const variance = hash % 4
  return Math.max(2, base + variance - Math.max(0, 3 - sizesCount))
}

const resolveInventoryFallbackMeta = (id: string) => {
  const source = products.value.find((item) => item.id === id)
  return {
    badge: source?.badge || 'NEW',
    sizesCount: Array.isArray(source?.sizes) ? source.sizes.length : 3
  }
}

const getStockLeftLabel = (product: { id: string; badge?: string; sizes?: string[] }) => {
  const meta = resolveInventoryFallbackMeta(product.id)
  return String(
    getStockLeftValue(
      product.id,
      product.badge || meta.badge,
      Array.isArray(product.sizes) ? product.sizes.length : meta.sizesCount
    )
  )
}

const hasStockForSelectedSize = (product: { id: string; badge?: string; sizes?: string[] }) => {
  const selected = getSelectedSize(product.id)
  if (!selected) return false

  const productSizeMap = stockBySize.value[product.id]
  if (productSizeMap && typeof productSizeMap[selected] === 'number') {
    return productSizeMap[selected] > 0
  }

  const meta = resolveInventoryFallbackMeta(product.id)
  return getStockLeftValue(
    product.id,
    product.badge || meta.badge,
    Array.isArray(product.sizes) ? product.sizes.length : meta.sizesCount
  ) > 0
}

const loadLiveInventory = async () => {
  try {
    const response = await $fetch<{
      success: boolean
      totals?: Record<string, number>
      bySize?: Record<string, Record<string, number>>
    }>('/api/inventory')

    stockTotals.value = response?.totals || {}
    stockBySize.value = response?.bySize || {}
  } catch {
    stockTotals.value = {}
    stockBySize.value = {}
  }
}

const loadServerRecommendations = async () => {
  try {
    const response = await $fetch<{
      success: boolean
      togetherIds?: string[]
      recommendIds?: string[]
    }>('/api/recommendations/catalog', {
      method: 'POST',
      body: {
        cartIds: Array.from(new Set(shopStore.cart.map((item) => item.id))).slice(0, 10),
        viewedIds: recentlyViewedIds.value.slice(0, 10)
      }
    })

    serverTogetherIds.value = Array.isArray(response?.togetherIds)
      ? response.togetherIds.map((id) => String(id || '').trim()).filter(Boolean)
      : []

    serverRecommendIds.value = Array.isArray(response?.recommendIds)
      ? response.recommendIds.map((id) => String(id || '').trim()).filter(Boolean)
      : []
  } catch {
    serverTogetherIds.value = []
    serverRecommendIds.value = []
  }
}

const getDeliveryDateLabel = (product: { badge: string }) => {
  const date = new Date()
  const offset = product.badge === 'HOT' ? 2 : 3
  date.setDate(date.getDate() + offset)

  const localeCode = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleDateString(localeCode, { day: 'numeric', month: 'long' })
}
const toggleQuickSizePicker = (productId: string) => {
  openQuickSizeFor.value = openQuickSizeFor.value === productId ? '' : productId
}

const applyQuickSize = (productId: string, size: ProductSize) => {
  selectSize(productId, size)
  openQuickSizeFor.value = ''
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!openQuickSizeFor.value) return

  const target = event.target as HTMLElement | null
  if (!target) return

  if (target.closest('.auto-size-trigger') || target.closest('.mini-size-picker')) {
    return
  }

  openQuickSizeFor.value = ''
}

onMounted(() => {
  isApplyingRouteQuery.value = true
  applyFiltersFromQuery(route.query as Record<string, any>)
  nextTick(() => {
    isApplyingRouteQuery.value = false
  })

  loadLiveInventory()
  recentlyViewedIds.value = getRecentlyViewedIds()
  void loadServerRecommendations()
  if (!import.meta.client) return
  focusRefreshHandler = () => {
    recentlyViewedIds.value = getRecentlyViewedIds()
    void loadServerRecommendations()
  }
  window.addEventListener('focus', focusRefreshHandler)
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
  if (!import.meta.client) return
  if (focusRefreshHandler) {
    window.removeEventListener('focus', focusRefreshHandler)
    focusRefreshHandler = null
  }
  document.removeEventListener('click', handleDocumentClick)
})

watch(searchInput, (value) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchQuery.value = value.trim()
  }, 120)
})

watch(
  () => route.query,
  (query) => {
    if (isApplyingRouteQuery.value) return
    isApplyingRouteQuery.value = true
    applyFiltersFromQuery(query as Record<string, any>)
    nextTick(() => {
      isApplyingRouteQuery.value = false
    })
  }
)

watch(
  () => shopStore.cart.map((item) => item.id).sort().join('|'),
  () => {
    void loadServerRecommendations()
  }
)

watch(
  [
    searchQuery,
    selectedCategory,
    selectedColor,
    selectedSize,
    selectedAvailability,
    sortBy,
    minPrice,
    maxPrice
  ],
  () => {
    if (isApplyingRouteQuery.value) return
    const nextQuery = buildFiltersQuery()
    if (areQueriesEqual(nextQuery, route.query as Record<string, any>)) return
    router.replace({ query: nextQuery })
  }
)

const addProductToCart = (product: LocalizedProduct) => {
  if (!hasStockForSelectedSize(product)) {
    uiStore.showToast(ui.value.outOfStockToast, 'error')
    return
  }

  const added = addProductWithSize(product, {
    chooseSize: ui.value.chooseSize,
    added: ui.value.addedToCart
  }, {
    source: 'catalog'
  })

  if (added) {
    selectedSizes.value[product.id] = ''
  }
}

const quickAddFromSmart = (product: LocalizedProduct) => {
  const size = getAutoSize(product) || product.sizes[0]
  if (!size) {
    uiStore.showToast(ui.value.chooseSize, 'error')
    return
  }
  selectSize(product.id, size)
  addProductToCart(product)
}

const buyNowFromCatalog = async (product: LocalizedProduct) => {
  if (!hasStockForSelectedSize(product)) {
    uiStore.showToast(ui.value.outOfStockToast, 'error')
    return
  }

  const added = addProductWithSize(product, {
    chooseSize: ui.value.chooseSize,
    added: ui.value.quickCheckoutAdded
  }, {
    source: 'catalog_buy_now'
  })

  if (!added) return

  track('buy_now', {
    source: 'catalog',
    productId: product.id,
    title: product.title,
    price: product.price,
    selectedSize: getSelectedSize(product.id)
  })

  selectedSizes.value[product.id] = ''
  await navigateTo(localePath('/checkout'))
}

const toggleProductWishlist = (product: LocalizedProduct) => {
  shopStore.toggleWishlist(product)
}

const isWishlisted = (productId: string) => {
  return shopStore.isInWishlist(productId)
}

const wishlistButtonLabel = (productId: string) => {
  const active = isWishlisted(productId)

  if (locale.value === 'ro') {
    return active ? 'Elimină din favorite' : 'Adaugă la favorite'
  }

  if (locale.value === 'en') {
    return active ? 'Remove from wishlist' : 'Add to wishlist'
  }

  return active ? 'Убрать из избранного' : 'Добавить в избранное'
}

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://onestyleforever.com').replace(/\/+$/, '')
const previewImage = `${siteUrl}/logo-preview.png`
const catalogPath = computed(() => localePath('/catalog'))
const catalogUrl = computed(() => {
  const path = catalogPath.value === '/' ? '/' : String(catalogPath.value).replace(/\/+$/, '')
  return `${siteUrl}${path}`
})
const breadcrumbLabels = computed(() => {
  if (locale.value === 'ro') return { home: 'Acasă', catalog: 'Catalog' }
  if (locale.value === 'en') return { home: 'Home', catalog: 'Catalog' }
  return { home: 'Главная', catalog: 'Каталог' }
})

useSeoMeta({
  title: () => `ONE STYLE FOREVER | ${ui.value.title}`,
  description: () => ui.value.subtitle,
  ogTitle: () => `ONE STYLE FOREVER | ${ui.value.title}`,
  ogDescription: () => ui.value.subtitle,
  ogImage: previewImage,
  ogType: 'website',
  ogUrl: () => catalogUrl.value,
  twitterCard: 'summary_large_image',
  twitterImage: previewImage,
  twitterTitle: () => `ONE STYLE FOREVER | ${ui.value.title}`,
  twitterDescription: () => ui.value.subtitle
})

useHead(
  computed(() => ({
    link: [
      {
        rel: 'canonical',
        href: catalogUrl.value
      }
    ],
    script: [
      {
        key: 'catalog-collection-schema',
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: ui.value.title,
          url: catalogUrl.value,
          description: ui.value.subtitle,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: filteredProducts.value.slice(0, 24).map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${siteUrl}${localePath(`/product/${product.id}`)}`,
              name: product.title
            }))
          }
        })
      },
      {
        key: 'catalog-breadcrumb-schema',
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: breadcrumbLabels.value.home,
              item: `${siteUrl}${localePath('/')}`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: breadcrumbLabels.value.catalog,
              item: catalogUrl.value
            }
          ]
        })
      }
    ]
  }))
)
</script>

<style scoped>
.catalog-page {
  padding-top: 18px;
  padding-bottom: 84px;
}

.catalog-benefits {
  margin-top: 12px;
  padding: 14px 18px;
  border-radius: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.catalog-benefits span {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #42556d;
}

.smart-sections {
  margin-top: 18px;
  display: grid;
  gap: 14px;
}

.smart-row {
  padding: 18px;
}

.smart-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.smart-head h3 {
  margin: 0;
  font-size: clamp(20px, 2vw, 28px);
}

.smart-head span {
  color: var(--muted);
  font-size: 13px;
}

.smart-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.smart-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.smart-image-link {
  display: block;
  aspect-ratio: 1 / 1;
  background: #fff;
}

.smart-image-link :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.smart-body {
  padding: 10px;
  display: grid;
  gap: 6px;
}

.smart-title-link {
  font-weight: 800;
  color: var(--text);
  text-decoration: none;
  line-height: 1.25;
}

.smart-meta {
  color: var(--muted);
  font-size: 12px;
}

.smart-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.smart-add-btn {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid #bdd4c0;
  border-radius: 999px;
  background: #eff8f1;
  color: #1f5e3b;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.catalog-intro {
  padding: 32px;
}

.catalog-intro-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: end;
}

.catalog-title {
  font-size: clamp(38px, 4vw, 64px);
  line-height: 0.95;
}

.catalog-subtitle {
  max-width: 760px;
  margin-top: 14px;
}

.catalog-summary {
  display: grid;
  gap: 12px;
}

.summary-item {
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: #fff;
}

.summary-item strong {
  display: block;
  margin-bottom: 6px;
  font-size: 22px;
  line-height: 1.1;
}

.summary-item span {
  color: var(--muted);
  line-height: 1.5;
}

.catalog-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 14px;
  margin-top: 24px;
}

.search-box {
  min-height: 58px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.search-box svg {
  width: 20px;
  height: 20px;
  color: var(--muted);
  flex-shrink: 0;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: var(--text);
}

.search-reset-btn {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.sort-select {
  min-height: 58px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: #fff;
  padding: 0 16px;
  font: inherit;
  color: var(--text);
  outline: none;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 22px;
}

.mobile-sticky-filters {
  display: none;
}

.filters-box {
  padding: 24px;
  align-self: start;
  position: static;
  top: auto;
}

.filters-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.filters-head h2 {
  margin: 0;
  font-size: 24px;
}

.reset-btn {
  border: none;
  background: transparent;
  font: inherit;
  color: var(--primary);
  font-weight: 800;
  cursor: pointer;
}

.filter-group + .filter-group {
  margin-top: 20px;
}

.filter-title {
  display: block;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
}

.filter-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-chip,
.tab-chip {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font: inherit;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  transition: 0.2s ease;
}

.filter-chip.active,
.tab-chip.active {
  background: #f1f7f2;
  border-color: #bfd5c4;
  color: #2f6c47;
}

.size-chip {
  min-width: 44px;
  justify-content: center;
}

.filter-note {
  margin-top: 24px;
  padding: 18px 20px;
  border-radius: 22px;
  background: #f8faf8;
  border: 1px solid var(--border);
}

.filter-note strong {
  display: block;
  margin-bottom: 8px;
}

.filter-note p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.catalog-content {
  min-width: 0;
}

.catalog-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.catalog-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.results-count {
  color: var(--muted);
  font-weight: 700;
  white-space: nowrap;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #fff;
  box-shadow: 0 10px 24px rgba(18, 30, 22, 0.07);
  transition: 0.22s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(24, 39, 27, 0.08);
}

.product-media {
  position: relative;
  min-height: 0;
  aspect-ratio: 1 / 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  overflow: hidden;
}

.product-media-link {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  padding: 56px 12px 12px;
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
}

.product-media img {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  transform: scale(1.05);
  filter: drop-shadow(0 8px 14px rgba(13, 27, 18, 0.08));
}

.product-badge {
  position: absolute;
  top: 14px;
  left: 16px;
  z-index: 7;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--border);
  font-size: 13px;
  line-height: 1.1;
  font-weight: 800;
}

.product-badge.hot {
  color: #9a4b3d;
}

.wishlist-toggle {
  position: absolute;
  top: 14px;
  right: 16px;
  z-index: 7;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s ease;
}

.wishlist-toggle svg {
  width: 20px;
  height: 20px;
}

.wishlist-toggle.active {
  border-color: #bfd5c4;
  background: #f1f7f2;
  color: #2f6c47;
}

.product-body {
  padding: 22px;
  background: #fff;
}

.product-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.product-chip {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #b8d5bc;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.product-stock {
  color: var(--primary);
  font-size: 14px;
  font-weight: 800;
}

.product-title-link {
  display: block;
  color: inherit;
}

.product-title-link h3 {
  margin: 0 0 12px;
  font-size: 22px;
  line-height: 1.12;
  transition: 0.2s ease;
}

.product-title-link:hover h3 {
  color: #2f6c47;
}

.product-body p {
  margin: 0;
  color: #4a5a70;
  line-height: 1.7;
}

.product-options {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.product-delivery-note {
  margin-top: 10px;
  color: #2f6c47;
  font-size: 12px;
  font-weight: 700;
}

.option-row {
  display: grid;
  gap: 8px;
}

.option-label {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
}

.option-value {
  color: var(--muted);
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.size-pill {
  min-width: 42px;
  height: 42px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.size-pill.active {
  background: #2f6c47;
  color: #fff;
  border-color: #2f6c47;
}

.product-bottom {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.product-bottom strong {
  font-size: 26px;
  line-height: 1;
}

.product-actions {
  display: grid;
  gap: 10px;
}

.auto-size-note {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #d6e2d6;
  background: #f9fbf9;
  color: #5d6f84;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.auto-size-trigger {
  width: max-content;
  cursor: pointer;
}

.auto-size-note.ready {
  border-color: #b8d8c2;
  background: #eef8f0;
  color: #1f5d3b;
}

.mini-size-picker {
  padding: 10px;
  border: 1px solid #d8e4d8;
  border-radius: 14px;
  background: #fbfdfb;
  display: grid;
  gap: 8px;
}

.mini-size-title {
  font-size: 11px;
  font-weight: 700;
  color: #5d6f84;
}

.mini-size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mini-size-btn {
  min-width: 36px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 12px;
  font-weight: 800;
  color: #2f3f54;
}

.mini-size-btn.active {
  background: #2f6c47;
  border-color: #2f6c47;
  color: #fff;
}

.card-trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-trust-row span {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid #d8e4d8;
  background: #f9fbf8;
  color: #4f6478;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.quick-btn,
.buy-btn {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.buy-now-btn {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid #d8bf98;
  background: #f4e8d7;
  color: #6f4720;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.buy-now-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-btn {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
}

.buy-btn {
  border: none;
  background: linear-gradient(180deg, #7fb08f 0%, #6ca37e 100%);
  color: #fff;
}

.buy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-box {
  padding: 32px;
}

.empty-box h3 {
  margin: 0 0 10px;
  font-size: 28px;
}

.empty-box p {
  margin: 0 0 18px;
  color: var(--muted);
  line-height: 1.7;
}

.catalog-sticky-cart {
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

.sticky-meta {
  display: grid;
  gap: 2px;
}

.sticky-meta strong {
  font-size: 18px;
  line-height: 1;
}

.sticky-meta span {
  font-size: 12px;
  color: var(--muted);
}

.sticky-checkout {
  min-height: 44px;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .catalog-intro-top,
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .filters-box {
    position: static;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .smart-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .mobile-sticky-filters {
    position: static;
    top: auto;
    z-index: 1;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: #fff;
    backdrop-filter: none;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mobile-filter-btn {
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: #fff;
    font-size: 12px;
    font-weight: 800;
    color: #2f3f54;
  }

  .mobile-filter-btn.active {
    background: #e9f5eb;
    border-color: #b7d7bf;
    color: #1f5b3a;
  }

  .mobile-filter-btn.secondary {
    background: #f9fbf8;
  }

  .mobile-filter-count {
    margin-left: auto;
    font-size: 12px;
    font-weight: 700;
    color: #58697f;
    white-space: nowrap;
    flex: 1 0 100%;
    text-align: right;
    margin-left: 0;
  }

  .filters-box {
    display: none;
  }

  .filters-box.open {
    display: block;
  }

  .catalog-intro,
  .filters-box,
  .empty-box {
    padding: 20px;
  }

  .catalog-intro-top {
    gap: 14px;
  }

  .catalog-title {
    font-size: clamp(34px, 7vw, 46px);
    line-height: 0.98;
  }

  .catalog-subtitle {
    margin-top: 10px;
    font-size: 17px;
  }

  .catalog-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .summary-item {
    padding: 12px 14px;
    border-radius: 16px;
  }

  .summary-item strong {
    margin-bottom: 3px;
    font-size: 18px;
  }

  .summary-item span {
    font-size: 14px;
    line-height: 1.35;
  }

  .catalog-toolbar {
    margin-top: 14px;
    gap: 10px;
  }

  .search-box,
  .sort-select {
    min-height: 50px;
    border-radius: 16px;
    padding-left: 14px;
    padding-right: 14px;
  }

  .catalog-benefits {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 16px;
    gap: 6px;
  }

  .catalog-benefits span {
    min-height: 30px;
    padding: 0 10px;
    font-size: 11px;
  }

  .catalog-toolbar {
    grid-template-columns: 1fr;
  }

  .catalog-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .product-card {
    border-radius: 18px;
  }

  .product-body {
    padding: 12px;
  }

  .product-meta-row {
    margin-bottom: 8px;
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .product-chip {
    min-height: 28px;
    padding: 0 9px;
    font-size: 11px;
  }

  .product-stock {
    font-size: 12px;
  }

  .product-title-link h3 {
    margin-bottom: 6px;
    font-size: 16px;
  }

  .product-body p,
  .product-options,
  .product-delivery-note,
  .auto-size-note,
  .mini-size-picker,
  .card-trust-row,
  .quick-btn {
    display: none;
  }

  .product-bottom {
    margin-top: 10px;
    gap: 8px;
  }

  .product-bottom strong {
    font-size: 20px;
  }

  .product-actions {
    gap: 8px;
  }

  .buy-now-btn,
  .buy-btn {
    min-height: 36px;
    border-radius: 12px;
    font-size: 12px;
    padding: 0 8px;
  }

  .catalog-sticky-cart {
    display: flex;
  }

  .smart-row {
    padding: 14px;
  }

  .smart-head {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 10px;
  }

  .smart-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .catalog-page {
    padding-top: 12px;
  }

  .catalog-intro,
  .filters-box,
  .empty-box {
    padding: 12px;
  }

  .catalog-intro-top {
    gap: 10px;
  }

  .catalog-title {
    font-size: clamp(28px, 9vw, 34px);
    line-height: 0.96;
  }

  .catalog-subtitle {
    margin-top: 8px;
    font-size: 14px;
  }

  .catalog-summary {
    gap: 6px;
  }

  .summary-item {
    padding: 8px 10px;
    border-radius: 12px;
  }

  .summary-item strong {
    margin-bottom: 2px;
    font-size: 15px;
  }

  .summary-item span {
    font-size: 12px;
  }

  .catalog-toolbar {
    margin-top: 10px;
    gap: 8px;
  }

  .search-box,
  .sort-select {
    min-height: 44px;
    border-radius: 14px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .search-box svg {
    width: 18px;
    height: 18px;
  }

  .catalog-benefits {
    margin-top: 8px;
    padding: 8px 10px;
    border-radius: 14px;
  }

  .catalog-benefits span {
    min-height: 28px;
    font-size: 10px;
    padding: 0 9px;
  }

  .smart-grid {
    gap: 8px;
  }

  .smart-body {
    padding: 8px;
  }

  .smart-title-link {
    font-size: 14px;
  }

  .smart-add-btn {
    min-height: 30px;
    padding: 0 8px;
    font-size: 11px;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .product-card {
    display: block;
    border-radius: 16px;
  }

  .product-media {
    min-height: 0;
    aspect-ratio: 1 / 1;
    padding: 6px;
  }

  .product-media-link {
    width: 100%;
    height: 100%;
    min-height: 0;
    aspect-ratio: 1 / 1;
    padding: 50px 6px 6px;
    border-radius: 14px;
  }

  .product-media img {
    transform: scale(1.12);
    transform-origin: center;
  }

  .product-badge {
    top: 8px;
    left: 8px;
  }

  .wishlist-toggle {
    top: 8px;
    right: 8px;
  }

  .product-body {
    padding: 10px;
  }

  .product-meta-row {
    margin-bottom: 6px;
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .product-options {
    display: block;
    margin-top: 6px;
  }

  .product-options .option-row:first-child {
    display: none;
  }

  .option-label {
    font-size: 12px;
  }

  .size-list {
    gap: 6px;
  }

  .product-title-link h3 {
    font-size: 15px;
  }

  .product-bottom strong {
    font-size: 18px;
  }

  .buy-btn,
  .buy-now-btn {
    min-height: 34px;
  }
}
</style>
