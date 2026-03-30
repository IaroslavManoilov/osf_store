<template>
  <div class="home-page">
    <section class="section-space">
      <div class="site-container">
        <div class="intro-grid">
          <div class="surface-card intro-card">
            <div class="intro-badges">
              <span class="pill">{{ ui.badgeLocation }}</span>
              <span class="pill">{{ ui.badgeBrand }}</span>
            </div>

            <span class="section-label">{{ ui.label }}</span>

            <h1 class="section-title intro-title">
              {{ ui.title }}
            </h1>

            <p class="section-text intro-text">
              {{ ui.subtitle }}
            </p>

            <div class="intro-actions">
              <NuxtLink :to="localePath('/catalog')" class="btn-main">
                {{ ui.ctaCatalog }}
              </NuxtLink>

              <NuxtLink :to="localePath('/about')" class="btn-alt">
                {{ ui.ctaAbout }}
              </NuxtLink>
            </div>

            <div class="intro-features">
              <span class="pill">{{ ui.feature1 }}</span>
              <span class="pill">{{ ui.feature2 }}</span>
              <span class="pill">{{ ui.feature3 }}</span>
            </div>
          </div>

          <div class="surface-card intro-visual-card">
            <div class="intro-visual-main">
              <img src="/logo-preview.png" alt="ONE STYLE FOREVER" />
            </div>

            <div class="intro-quote">
              <strong>{{ ui.visualTitle }}</strong>
              <p>{{ ui.visualText }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="surface-card featured-box">
          <div class="section-head">
            <div>
              <span class="section-label">{{ ui.featuredLabel }}</span>
              <h2 class="block-title">{{ ui.featuredTitle }}</h2>
              <p class="section-text block-text">
                {{ ui.featuredText }}
              </p>
            </div>

            <NuxtLink :to="localePath('/catalog')" class="btn-alt">
              {{ ui.featuredAction }}
            </NuxtLink>
          </div>

          <div class="product-grid">
            <article
              v-for="product in featuredProducts"
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
                  @click="toggleProductWishlist(product)"
                  :aria-label="wishlistButtonLabel(product.id)"
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

                <NuxtLink :to="localePath(`/product/${product.id}`)" class="product-media-link">
                  <img :src="product.image" :alt="product.title" />
                </NuxtLink>
              </div>

              <div class="product-body">
                <div class="product-meta">
                  <span class="product-chip">{{ product.categoryLabel }}</span>
                  <span class="product-stock">{{ ui.inStock }}</span>
                </div>

                <NuxtLink :to="localePath(`/product/${product.id}`)" class="product-title-link">
                  <h3>{{ product.title }}</h3>
                </NuxtLink>

                <p>{{ product.description }}</p>

                <div class="product-options">
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
                    <NuxtLink :to="localePath(`/product/${product.id}`)" class="quick-btn">
                      {{ ui.quickView }}
                    </NuxtLink>

                    <button
                      type="button"
                      class="buy-btn"
                      :disabled="!getSelectedSize(product.id)"
                      @click="addFeaturedToCart(product)"
                    >
                      {{ getSelectedSize(product.id) ? ui.addToCart : ui.chooseSize }}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="surface-card philosophy-box">
          <div class="philosophy-content">
            <span class="section-label">{{ ui.philosophyLabel }}</span>

            <h2 class="block-title philosophy-title">
              {{ ui.philosophyTitle }}
            </h2>

            <p class="section-text philosophy-text">
              {{ ui.philosophyText }}
            </p>

            <div class="philosophy-list">
              <div class="philosophy-item">
                <strong>{{ ui.philosophyItem1Title }}</strong>
                <span>{{ ui.philosophyItem1Text }}</span>
              </div>

              <div class="philosophy-item">
                <strong>{{ ui.philosophyItem2Title }}</strong>
                <span>{{ ui.philosophyItem2Text }}</span>
              </div>

              <div class="philosophy-item">
                <strong>{{ ui.philosophyItem3Title }}</strong>
                <span>{{ ui.philosophyItem3Text }}</span>
              </div>
            </div>
          </div>

          <div class="philosophy-visual">
            <img src="/logo-mark.png" alt="ONE STYLE FOREVER mark" />
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="surface-card final-box">
          <div class="final-content">
            <span class="section-label">{{ ui.finalLabel }}</span>

            <h2 class="block-title final-title">
              {{ ui.finalTitle }}
            </h2>

            <p class="section-text final-text">
              {{ ui.finalText }}
            </p>

            <div class="intro-actions">
              <NuxtLink :to="localePath('/catalog')" class="btn-main">
                {{ ui.finalCatalog }}
              </NuxtLink>

              <NuxtLink :to="localePath('/about')" class="btn-alt">
                {{ ui.finalAbout }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProducts } from '~/data/products'
import type { ProductItem } from '~/stores/shop'

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()
const { getSelectedSize, selectSize, addProductWithSize, selectedSizes } = useProductActions()

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      badgeLocation: 'Moldova • Chișinău',
      badgeBrand: 'Brand selection',
      label: 'ONE STYLE FOREVER',
      title: 'Brand modern de haine cu prezentare curată',
      subtitle:
        'ONE STYLE FOREVER este mai mult decât haine — este stil, identitate vizuală și un mod clar de a construi un brand recognoscibil.',
      ctaCatalog: 'Vezi catalogul',
      ctaAbout: 'Despre brand',
      feature1: 'Clean style',
      feature2: 'Everyday comfort',
      feature3: 'Strong identity',
      visualTitle: 'Un stil. Pentru totdeauna.',
      visualText:
        'Construim un brand în care hainele, accesoriile și prezentarea lucrează împreună.',
      featuredLabel: 'Selecție',
      featuredTitle: 'Produse populare',
      featuredText: 'Piese alese pentru o prezentare clară și un stil ușor de purtat.',
      featuredAction: 'Tot catalogul',
      inStock: 'În stoc',
      quickView: 'Vezi rapid',
      addToCart: 'În coș',
      chooseSize: 'Alege mărimea',
      size: 'Mărime',
      philosophyLabel: 'Filosofie',
      philosophyTitle: 'ONE STYLE FOREVER înseamnă ordine, stil și continuitate',
      philosophyText:
        'Nu construim doar produse separate. Construim un brand coerent care poate crește prin haine, accesorii, ambalaj și atmosferă.',
      philosophyItem1Title: 'Design curat',
      philosophyItem1Text: 'Mai puțin zgomot vizual, mai multă claritate.',
      philosophyItem2Title: 'Stil recognoscibil',
      philosophyItem2Text: 'Fiecare piesă trebuie să întărească imaginea brandului.',
      philosophyItem3Title: 'Experiență atentă',
      philosophyItem3Text: 'De la site până la produs, totul trebuie să se simtă ordonat.',
      finalLabel: 'Următorul pas',
      finalTitle: 'Alege piesele care se potrivesc stilului tău',
      finalText: 'Intră în catalog și explorează baza vizuală ONE STYLE FOREVER.',
      finalCatalog: 'Deschide catalogul',
      finalAbout: 'Citește despre brand',
      addedToCart: 'Produsul a fost adăugat în coș'
    }
  }

  if (locale.value === 'en') {
    return {
      badgeLocation: 'Moldova • Chișinău',
      badgeBrand: 'Brand selection',
      label: 'ONE STYLE FOREVER',
      title: 'Modern clothing brand with clean presentation',
      subtitle:
        'ONE STYLE FOREVER is more than clothing — it is style, visual identity, and a clear way to build a recognizable brand.',
      ctaCatalog: 'View catalog',
      ctaAbout: 'About brand',
      feature1: 'Clean style',
      feature2: 'Everyday comfort',
      feature3: 'Strong identity',
      visualTitle: 'One style. Forever.',
      visualText:
        'We are building a brand where clothing, accessories, and presentation work together.',
      featuredLabel: 'Selection',
      featuredTitle: 'Popular products',
      featuredText: 'Selected pieces for clean presentation and easy everyday styling.',
      featuredAction: 'Full catalog',
      inStock: 'In stock',
      quickView: 'Quick view',
      addToCart: 'Add to cart',
      chooseSize: 'Choose size',
      size: 'Size',
      philosophyLabel: 'Philosophy',
      philosophyTitle: 'ONE STYLE FOREVER means order, style, and continuity',
      philosophyText:
        'We are not building separate items only. We are building a coherent brand that can grow through clothing, accessories, packaging, and atmosphere.',
      philosophyItem1Title: 'Clean design',
      philosophyItem1Text: 'Less visual noise, more clarity.',
      philosophyItem2Title: 'Recognizable style',
      philosophyItem2Text: 'Each piece should strengthen the brand image.',
      philosophyItem3Title: 'Thoughtful experience',
      philosophyItem3Text: 'From website to product, everything should feel ordered.',
      finalLabel: 'Next step',
      finalTitle: 'Choose the pieces that fit your style',
      finalText: 'Open the catalog and explore the visual base of ONE STYLE FOREVER.',
      finalCatalog: 'Open catalog',
      finalAbout: 'Read about the brand',
      addedToCart: 'Product added to cart'
    }
  }

  return {
    badgeLocation: 'Moldova • Chișinău',
    badgeBrand: 'Выбор недели',
    label: 'ONE STYLE FOREVER',
    title: 'Современный бренд одежды с чистой подачей',
    subtitle:
      'ONE STYLE FOREVER — это больше, чем одежда. Это стиль, визуальная идентичность и понятный способ строить узнаваемый бренд.',
    ctaCatalog: 'Смотреть каталог',
    ctaAbout: 'О бренде',
    feature1: 'Чистый стиль',
    feature2: 'Комфорт каждый день',
    feature3: 'Сильная идентичность',
    visualTitle: 'Один стиль. Навсегда.',
    visualText:
      'Мы строим бренд, где одежда, аксессуары и подача работают вместе.',
    featuredLabel: 'Подборка',
    featuredTitle: 'Популярные товары',
    featuredText: 'Выбранные модели с чистой подачей и понятным стилем.',
    featuredAction: 'Весь каталог',
    inStock: 'В наличии',
    quickView: 'Быстрый просмотр',
    addToCart: 'В корзину',
    chooseSize: 'Выбери размер',
    size: 'Размер',
    philosophyLabel: 'Философия',
    philosophyTitle: 'ONE STYLE FOREVER — это порядок, стиль и развитие',
    philosophyText:
      'Мы строим не набор отдельных вещей, а цельный бренд, который может развиваться через одежду, аксессуары, упаковку и атмосферу.',
    philosophyItem1Title: 'Чистый дизайн',
    philosophyItem1Text: 'Меньше визуального шума, больше ясности.',
    philosophyItem2Title: 'Узнаваемый стиль',
    philosophyItem2Text: 'Каждая вещь должна усиливать образ бренда.',
    philosophyItem3Title: 'Продуманный опыт',
    philosophyItem3Text: 'От сайта до продукта всё должно ощущаться собранно.',
    finalLabel: 'Следующий шаг',
    finalTitle: 'Выбери вещи, которые подходят твоему стилю',
    finalText: 'Открой каталог и изучи визуальную основу ONE STYLE FOREVER.',
    finalCatalog: 'Открыть каталог',
    finalAbout: 'Читать о бренде',
    addedToCart: 'Товар добавлен в корзину'
  }
})

const featuredProducts = computed(() => getProducts(locale.value).slice(0, 3))

const addFeaturedToCart = (product: ProductItem) => {
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
.home-page {
  padding-top: 18px;
}

.intro-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 22px;
}

.intro-card,
.intro-visual-card,
.featured-box,
.philosophy-box,
.final-box {
  padding: 32px;
}

.intro-badges,
.intro-features,
.intro-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.intro-badges {
  margin-bottom: 18px;
}

.intro-title {
  max-width: 640px;
  font-size: clamp(40px, 5vw, 68px);
  line-height: 0.95;
}

.intro-text {
  max-width: 560px;
  margin: 16px 0 24px;
}

.intro-features {
  margin-top: 20px;
}

.intro-visual-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.intro-visual-main {
  min-height: 320px;
  border-radius: 28px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  display: grid;
  place-items: center;
  padding: 24px;
}

.intro-visual-main img {
  width: 100%;
  max-width: 240px;
  object-fit: contain;
}

.intro-quote {
  padding: 20px 22px;
  border-radius: 24px;
  background: #dcecdf;
  border: 1px solid #cfe0d3;
}

.intro-quote strong {
  display: block;
  margin-bottom: 8px;
  font-size: 22px;
  color: #356747;
}

.intro-quote p {
  margin: 0;
  color: #4f6679;
  line-height: 1.7;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 24px;
}

.block-title {
  margin: 0;
  font-size: 44px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.block-text {
  max-width: 720px;
  margin-top: 12px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #fff;
}

.product-media {
  position: relative;
  min-height: 320px;
  background: #edf3ee;
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
  max-width: 260px;
  max-height: 280px;
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

.product-meta {
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
  line-height: 1.15;
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
  margin-top: 18px;
}

.product-bottom strong {
  font-size: 24px;
}

.product-actions {
  display: grid;
  gap: 10px;
}

.quick-btn,
.buy-btn {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
}

.quick-btn {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
}

.buy-btn {
  border: none;
  background: var(--primary);
  color: #fff;
}

.buy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.philosophy-box {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 24px;
  align-items: center;
}

.philosophy-title {
  max-width: 720px;
}

.philosophy-text {
  max-width: 760px;
  margin-top: 16px;
}

.philosophy-list {
  display: grid;
  gap: 14px;
  margin-top: 24px;
}

.philosophy-item {
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: #f8faf8;
}

.philosophy-item strong {
  display: block;
  margin-bottom: 6px;
  font-size: 18px;
}

.philosophy-item span {
  color: var(--muted);
}

.philosophy-visual {
  min-height: 260px;
  border-radius: 28px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  display: grid;
  place-items: center;
  padding: 20px;
}

.philosophy-visual img {
  width: 100%;
  max-width: 160px;
  object-fit: contain;
}

.final-title {
  max-width: 760px;
}

.final-text {
  margin-top: 16px;
  max-width: 560px;
}

@media (max-width: 1200px) {
  .intro-grid,
  .product-grid,
  .philosophy-box {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 900px) {
  .intro-card,
  .intro-visual-card,
  .featured-box,
  .philosophy-box,
  .final-box {
    padding: 24px;
  }

  .block-title {
    font-size: 36px;
  }
}

@media (max-width: 640px) {
  .home-page {
    padding-top: 12px;
  }

  .intro-card,
  .intro-visual-card,
  .featured-box,
  .philosophy-box,
  .final-box {
    padding: 18px;
  }

  .intro-title {
    font-size: 42px;
    line-height: 0.98;
  }

  .intro-text,
  .philosophy-text,
  .final-text {
    font-size: 16px;
  }

  .block-title {
    font-size: 30px;
  }

  .intro-visual-main,
  .philosophy-visual {
    min-height: 200px;
    border-radius: 22px;
  }

  .product-media {
    min-height: 240px;
  }

  .product-body {
    padding: 18px;
  }

  .product-title-link h3 {
    font-size: 20px;
  }

  .product-body p {
    font-size: 15px;
  }

  .product-bottom strong {
    font-size: 22px;
  }

  .quick-btn,
  .buy-btn {
    width: 100%;
  }
}
</style>