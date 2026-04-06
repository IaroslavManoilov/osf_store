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
                v-model="searchQuery"
                type="text"
                :placeholder="ui.searchPlaceholder"
              />
            </div>

            <select v-model="sortBy" class="sort-select">
              <option value="default">{{ ui.sortDefault }}</option>
              <option value="price-asc">{{ ui.sortPriceAsc }}</option>
              <option value="price-desc">{{ ui.sortPriceDesc }}</option>
              <option value="name-asc">{{ ui.sortNameAsc }}</option>
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

            <div v-if="filteredProducts.length" class="product-grid">
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
                    <img :src="product.image" :alt="product.title" />
                  </NuxtLink>
                </div>

                <div class="product-body">
                  <div class="product-meta-row">
                    <span class="product-chip">{{ product.categoryLabel }}</span>
                    <span class="product-stock">{{ ui.inStock }} · {{ ui.leftLabel }} {{ getStockLeftLabel(product) }}</span>
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
                        :disabled="!canQuickBuy(product)"
                        @click="buyNowFromCatalog(product)"
                      >
                        {{ ui.buyNow }}
                      </button>

                      <button
                        type="button"
                        class="buy-btn"
                        :disabled="!getSelectedSize(product.id)"
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '~/composables/useAnalytics'
import {
  getProducts,
  type ProductColor,
  type ProductSize,
  type ProductCategory
} from '~/data/products'
import type { ProductItem } from '~/stores/shop'

type CategoryValue = 'all' | ProductCategory
type ColorValue = 'all' | ProductColor
type SizeValue = 'all' | ProductSize
type SortValue = 'default' | 'price-asc' | 'price-desc' | 'name-asc'

type FilterOption<T extends string> = {
  value: T
  label: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()
const { track } = useAnalytics()
const { getSelectedSize, selectSize, addProductWithSize, selectedSizes, canQuickBuy, getPreferredSize } = useProductActions()

definePageMeta({
  pageTransition: {
    name: 'catalog-product'
  }
})

const searchQuery = ref('')
const selectedCategory = ref<CategoryValue>('all')
const selectedColor = ref<ColorValue>('all')
const selectedSize = ref<SizeValue>('all')
const sortBy = ref<SortValue>('default')
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const mobileFiltersOpen = ref(false)
const openQuickSizeFor = ref('')

const applyPriceFilter = () => {
  if (minPrice.value !== null && minPrice.value < 0) {
    minPrice.value = 0
  }

  if (maxPrice.value !== null && maxPrice.value < 0) {
    maxPrice.value = 0
  }

  if (minPrice.value !== null && maxPrice.value !== null && minPrice.value > maxPrice.value) {
    const currentMin = minPrice.value
    minPrice.value = maxPrice.value
    maxPrice.value = currentMin
  }
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
      filters: 'Filtre',
      reset: 'Resetează',
      category: 'Categorie',
      color: 'Culoare',
      size: 'Mărime',
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
      quickCheckoutAdded: 'Produs adăugat. Te redirecționăm la checkout.'
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
      filters: 'Filters',
      reset: 'Reset',
      category: 'Category',
      color: 'Color',
      size: 'Size',
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
      quickCheckoutAdded: 'Added to cart. Redirecting to checkout.'
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
    filters: 'Фильтры',
    reset: 'Сбросить',
    category: 'Категория',
    color: 'Цвет',
    size: 'Размер',
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
    quickCheckoutAdded: 'Товар добавлен. Переходим к оформлению.'
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

const filteredProducts = computed(() => {
  let result = [...products.value]
  const search = searchQuery.value.trim().toLowerCase()

  if (search) {
    result = result.filter((item) => {
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
      )
    })
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

  if (minPrice.value !== null) {
    result = result.filter((item) => item.price >= minPrice.value!)
  }

  if (maxPrice.value !== null) {
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

  return result
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  selectedColor.value = 'all'
  selectedSize.value = 'all'
  sortBy.value = 'default'
  minPrice.value = null
  maxPrice.value = null
  mobileFiltersOpen.value = false
  openQuickSizeFor.value = ''
}

const getAutoSize = (product: ProductItem) => getPreferredSize(product)

const getStockLeftValue = (id: string, badge: string, sizesCount: number) => {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const base = badge === 'HOT' ? 3 : 5
  const variance = hash % 4
  return Math.max(2, base + variance - Math.max(0, 3 - sizesCount))
}

const getStockLeftLabel = (product: { id: string; badge: string; sizes: string[] }) => {
  return String(getStockLeftValue(product.id, product.badge, product.sizes.length))
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

const applyQuickSize = (productId: string, size: string) => {
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
  if (!import.meta.client) return
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.removeEventListener('click', handleDocumentClick)
})

const addProductToCart = (product: ProductItem) => {
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

const buyNowFromCatalog = async (product: ProductItem) => {
  const added = addProductWithSize(product, {
    chooseSize: ui.value.chooseSize,
    added: ui.value.quickCheckoutAdded
  }, {
    autoSelectLastSize: true,
    source: 'catalog_buy_now'
  })

  if (!added) return

  track('buy_now', {
    source: 'catalog',
    productId: product.id,
    title: product.title,
    price: product.price,
    selectedSize: getAutoSize(product)
  })

  selectedSizes.value[product.id] = ''
  await navigateTo(localePath('/checkout'))
}

const toggleProductWishlist = (product: ProductItem) => {
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

const siteUrl = 'https://onestyleforever.com'
const previewImage = `${siteUrl}/logo-preview.png`

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

useHead(
  computed(() => ({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: ui.value.title,
          url: `${siteUrl}/catalog`,
          description: ui.value.subtitle
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
  padding: 58px 12px 12px;
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
}

.product-media img {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: contain;
  object-position: center;
  display: block;
  transform: scale(1.03);
  filter: drop-shadow(0 8px 14px rgba(13, 27, 18, 0.08));
}

.product-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--border);
  font-size: 13px;
  font-weight: 800;
}

.product-badge.hot {
  color: #9a4b3d;
}

.wishlist-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
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
    padding: 24px;
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
}

@media (max-width: 640px) {
  .catalog-page {
    padding-top: 12px;
  }

  .catalog-intro,
  .filters-box,
  .empty-box {
    padding: 18px;
  }

  .catalog-title {
    font-size: 40px;
    line-height: 1;
  }

  .catalog-subtitle {
    font-size: 16px;
  }

  .product-media {
    padding: 10px;
  }

  .product-media-link {
    width: 100%;
    padding: 52px 8px 8px;
    border-radius: 16px;
  }

  .product-body {
    padding: 10px;
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
