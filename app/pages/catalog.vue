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
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="catalog-layout">
          <aside class="surface-card filters-box">
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
              <span class="filter-title">{{ ui.size }}</span>
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
                    <span class="product-stock">{{ ui.inStock }}</span>
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

                  <div class="product-bottom">
                    <strong>{{ product.price }} MDL</strong>

                    <div class="product-actions">
                      <NuxtLink
                        :to="localePath(`/product/${product.id}`)"
                        class="quick-btn"
                      >
                        {{ ui.quickView }}
                      </NuxtLink>

                      <button
                        type="button"
                        class="buy-btn"
                        :disabled="!getSelectedSize(product.id)"
                        @click="addProductToCart(product)"
                      >
                        {{ getSelectedSize(product.id) ? ui.addToCart : ui.chooseSize }}
                      </button>
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { getSelectedSize, selectSize, addProductWithSize, selectedSizes } = useProductActions()

const searchQuery = ref('')
const selectedCategory = ref<CategoryValue>('all')
const selectedColor = ref<ColorValue>('all')
const selectedSize = ref<SizeValue>('all')
const sortBy = ref<SortValue>('default')

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
      itemsCount: 'produse',
      inStock: 'În stoc',
      addToCart: 'În coș',
      quickView: 'Vezi rapid',
      chooseSize: 'Alege mărimea',
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
      addedToCart: 'Produsul a fost adăugat în coș'
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
      itemsCount: 'items',
      inStock: 'In stock',
      addToCart: 'Add to cart',
      quickView: 'Quick view',
      chooseSize: 'Choose size',
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
      addedToCart: 'Product added to cart'
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
    itemsCount: 'товаров',
    inStock: 'В наличии',
    addToCart: 'В корзину',
    quickView: 'Быстрый просмотр',
    chooseSize: 'Выбери размер',
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
    addedToCart: 'Товар добавлен в корзину'
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
}

const addProductToCart = (product: ProductItem) => {
  const added = addProductWithSize(product, {
    chooseSize: ui.value.chooseSize,
    added: ui.value.addedToCart
  })

  if (added) {
    selectedSizes.value[product.id] = ''
  }
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
</script>

<style scoped>
.catalog-page {
  padding-top: 18px;
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
  background: #f8faf8;
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

.filters-box {
  padding: 24px;
  align-self: start;
  position: sticky;
  top: 16px;
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
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #fff;
  transition: 0.22s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(24, 39, 27, 0.08);
}

.product-media {
  position: relative;
  min-height: 340px;
  background: #eef4ef;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.product-media-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.product-media img {
  width: 100%;
  max-width: 270px;
  max-height: 300px;
  object-fit: contain;
}

.product-badge {
  position: absolute;
  top: 16px;
  left: 16px;
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
  border: 1px solid var(--border);
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
  color: var(--muted);
  line-height: 1.7;
}

.product-options {
  display: grid;
  gap: 14px;
  margin-top: 18px;
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
    grid-template-columns: 1fr;
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
    min-height: 250px;
  }

  .product-body {
    padding: 18px;
  }

  .product-title-link h3 {
    font-size: 20px;
  }

  .product-bottom strong {
    font-size: 22px;
  }

  .quick-btn,
  .buy-btn {
    min-height: 44px;
  }
}
</style>