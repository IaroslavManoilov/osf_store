<template>
  <div class="wishlist-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card wishlist-intro">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title wishlist-title">{{ ui.title }}</h1>
          <p class="section-text wishlist-text">
            {{ ui.subtitle }}
          </p>
        </div>
      </div>
    </section>

    <section v-if="wishlistItems.length" class="section-space">
      <div class="site-container">
        <div class="wishlist-grid">
          <article
            v-for="item in wishlistItems"
            :key="item.id"
            class="surface-card wishlist-card"
          >
            <NuxtLink
              :to="localePath(`/product/${item.id}`)"
              class="wishlist-image-link"
            >
              <div class="wishlist-image">
                <OptimizedImage :src="item.image" :alt="item.title" loading="lazy" width="700" height="700" sizes="(max-width: 900px) 88vw, 220px" />
              </div>
            </NuxtLink>

            <div class="wishlist-body">
              <NuxtLink
                :to="localePath(`/product/${item.id}`)"
                class="wishlist-title-link"
              >
                <h2>{{ item.title }}</h2>
              </NuxtLink>

              <p class="wishlist-price">{{ item.price }} MDL</p>

              <div class="wishlist-sizes">
                <span class="sizes-label">{{ ui.size }}</span>

                <div class="size-list">
                  <button
                    v-for="size in availableSizes"
                    :key="`${item.id}-${size}`"
                    type="button"
                    class="size-btn"
                    :class="{ active: selectedSizes[item.id] === size }"
                    @click="selectSize(item.id, size)"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <div class="wishlist-actions">
                <button
                  type="button"
                  class="btn-main"
                  :disabled="!selectedSizes[item.id]"
                  @click="addWishlistItemToCart(item)"
                >
                  {{
                    selectedSizes[item.id]
                      ? ui.addToCart
                      : ui.selectSizeFirst
                  }}
                </button>

                <button
                  type="button"
                  class="btn-alt"
                  @click="shopStore.removeFromWishlist(item.id)"
                >
                  {{ ui.remove }}
                </button>
              </div>
            </div>
          </article>
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
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProductItem, ProductSize } from '~/stores/shop'

type WishlistUi = {
  label: string
  title: string
  subtitle: string
  size: string
  addToCart: string
  selectSizeFirst: string
  remove: string
  emptyTitle: string
  emptyText: string
  toCatalog: string
}

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()

const wishlistItems = computed(() => shopStore.wishlist)
const availableSizes: ProductSize[] = ['S', 'M', 'L']

const selectedSizes = reactive<Record<string, ProductSize | null>>({})

const selectSize = (productId: string, size: ProductSize) => {
  selectedSizes[productId] = size
}

const addWishlistItemToCart = (item: ProductItem) => {
  const selectedSize = selectedSizes[item.id]

  if (!selectedSize) return

  shopStore.addToCart({
    ...item,
    selectedSize
  })

  shopStore.removeFromWishlist(item.id)
  delete selectedSizes[item.id]
}

const ui = computed<WishlistUi>(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Favorite',
      title: 'Produse salvate',
      subtitle: 'Păstrează selecția ta și mută rapid produsele în coș.',
      size: 'Mărime',
      addToCart: 'În coș',
      selectSizeFirst: 'Alege mărimea',
      remove: 'Șterge',
      emptyTitle: 'Nu ai produse salvate',
      emptyText: 'Adaugă produse în favorite din catalog.',
      toCatalog: 'Mergi la catalog'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Wishlist',
      title: 'Saved products',
      subtitle: 'Keep your selection and move products to cart quickly.',
      size: 'Size',
      addToCart: 'Add to cart',
      selectSizeFirst: 'Choose size',
      remove: 'Remove',
      emptyTitle: 'You have no saved products',
      emptyText: 'Add products to wishlist from the catalog.',
      toCatalog: 'Go to catalog'
    }
  }

  return {
    label: 'Избранное',
    title: 'Сохраненные товары',
    subtitle: 'Сохраняй понравившиеся вещи и быстро переноси их в корзину.',
    size: 'Размер',
    addToCart: 'В корзину',
    selectSizeFirst: 'Выбери размер',
    remove: 'Удалить',
    emptyTitle: 'У тебя нет сохраненных товаров',
    emptyText: 'Добавляй товары в избранное из каталога.',
    toCatalog: 'Перейти в каталог'
  }
})
</script>

<style scoped>
.wishlist-page {
  padding-top: 18px;
}

.wishlist-intro,
.wishlist-card,
.empty-box {
  padding: 32px;
}

.wishlist-title {
  font-size: clamp(36px, 4vw, 58px);
  line-height: 0.96;
}

.wishlist-text {
  max-width: 720px;
  margin-top: 14px;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.wishlist-image {
  min-height: 260px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
  padding: 20px;
}

.wishlist-image img {
  width: 100%;
  max-width: 220px;
  max-height: 220px;
  object-fit: contain;
}

.wishlist-body {
  margin-top: 18px;
}

.wishlist-title-link {
  display: block;
  color: inherit;
}

.wishlist-title-link h2 {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.1;
}

.wishlist-price {
  margin: 0;
  color: var(--muted);
}

.wishlist-sizes {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.sizes-label {
  font-size: 14px;
  font-weight: 800;
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.size-btn {
  min-width: 44px;
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.size-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.wishlist-actions {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.btn-main:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .wishlist-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .wishlist-intro,
  .wishlist-card,
  .empty-box {
    padding: 18px;
  }

  .wishlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>
