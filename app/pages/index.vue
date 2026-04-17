<template>
  <div class="home-page">
    <section class="section-space">
      <div class="site-container">
        <div class="intro-grid">
          <div class="surface-card intro-card">
            <div class="intro-badges">
              <span class="pill">{{ ui.badgeLocation }}</span>
              <span class="pill">{{ ui.badgeBrand }}</span>
              <span class="pill">{{ ui.abBadge }}</span>
            </div>

            <span class="section-label">{{ ui.label }}</span>
            <h1 class="section-title intro-title">{{ ui.title }}</h1>
            <p class="section-text intro-text">{{ ui.subtitle }}</p>

            <div class="intro-actions">
              <NuxtLink :to="localePath('/catalog')" class="btn-main cta-pulse">{{ ui.ctaCatalog }}</NuxtLink>
              <NuxtLink :to="localePath('/about')" class="btn-alt">{{ ui.ctaAbout }}</NuxtLink>
            </div>

            <div class="intro-features">
              <span class="pill">{{ ui.feature1 }}</span>
              <span class="pill">{{ ui.feature2 }}</span>
              <span class="pill">{{ ui.feature3 }}</span>
            </div>
          </div>

          <div class="surface-card intro-visual-card">
            <div class="intro-visual-main">
              <OptimizedImage
                src="/logo-preview.png"
                alt="ONE STYLE FOREVER"
                loading="eager"
                fetchpriority="high"
                width="1200"
                height="1200"
                sizes="(max-width: 900px) 90vw, 360px"
              />
            </div>

            <div class="intro-quote">
              <strong>{{ ui.visualTitle }}</strong>
              <p>{{ ui.visualText }}</p>
            </div>
          </div>
        </div>

        <div class="surface-card stats-strip">
          <div class="stat-item">
            <strong>{{ featuredProducts.length }}</strong>
            <span>{{ ui.stat1 }}</span>
          </div>
          <div class="stat-item">
            <strong>2-3</strong>
            <span>{{ ui.stat2 }}</span>
          </div>
          <div class="stat-item">
            <strong>14</strong>
            <span>{{ ui.stat3 }}</span>
          </div>
          <div class="stat-item">
            <strong>24/7</strong>
            <span>{{ ui.stat4 }}</span>
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
              <p class="section-text block-text">{{ ui.featuredText }}</p>
            </div>

            <NuxtLink :to="localePath('/catalog')" class="btn-alt">{{ ui.featuredAction }}</NuxtLink>
          </div>

          <div class="product-grid">
            <article v-for="product in featuredProducts" :key="product.id" class="product-card">
              <div class="product-media">
                <span class="product-badge" :class="{ hot: product.badge === 'HOT' }">{{ product.badge }}</span>
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

                <NuxtLink :to="localePath(`/product/${product.id}`)" class="product-media-link">
                  <OptimizedImage
                    :src="product.image"
                    :alt="product.title"
                    loading="lazy"
                    width="900"
                    height="900"
                    sizes="(max-width: 900px) 45vw, 320px"
                  />
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

                <p>{{ product.shortDescription }}</p>
                <div class="product-proof-row">
                  <span class="product-proof" v-if="getWeeklyOrders(product.id) > 0">
                    {{ ui.socialProofPrefix }} {{ getWeeklyOrders(product.id) }}
                  </span>
                  <span v-else class="product-proof muted">{{ ui.socialProofEmpty }}</span>
                </div>

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

                <div class="product-bottom">
                  <strong>{{ product.price }} MDL</strong>

                  <div class="product-actions">
                    <NuxtLink :to="localePath(`/product/${product.id}`)" class="quick-btn">{{ ui.quickView }}</NuxtLink>
                    <button type="button" class="buy-btn" :disabled="!getSelectedSize(product.id)" @click="addFeaturedToCart(product)">
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
            <h2 class="block-title philosophy-title">{{ ui.philosophyTitle }}</h2>
            <p class="section-text philosophy-text">{{ ui.philosophyText }}</p>

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
            <OptimizedImage
              src="/logo-mark.png"
              alt="ONE STYLE FOREVER mark"
              loading="lazy"
              width="800"
              height="800"
              sizes="(max-width: 900px) 52vw, 320px"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="site-container">
        <div class="features-grid">
          <article class="feature-card">
            <h3>{{ $t('home.features.quality.title') }}</h3>
            <p>{{ $t('home.features.quality.text') }}</p>
          </article>
          <article class="feature-card">
            <h3>{{ $t('home.features.delivery.title') }}</h3>
            <p>{{ $t('home.features.delivery.text') }}</p>
          </article>
          <article class="feature-card">
            <h3>{{ $t('home.features.support.title') }}</h3>
            <p>{{ $t('home.features.support.text') }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="rating-section">
      <div class="site-container">
        <div class="rating-panel">
          <div>
            <span class="section-label">{{ ui.ratingLabel }}</span>
            <h2 class="block-title">{{ ui.ratingTitle }}</h2>
            <p class="section-text">{{ ui.ratingText }}</p>
          </div>

          <div class="rating-score">
            <div class="rating-stars" aria-hidden="true">
              <span v-for="star in 5" :key="`home-rating-${star}`" :class="{ active: star <= 5 }">★</span>
            </div>
            <strong>0.0 / 5</strong>
            <span>{{ ui.ratingEmpty }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="surface-card final-box">
          <div class="final-content">
            <span class="section-label">{{ ui.finalLabel }}</span>
            <h2 class="block-title final-title">{{ ui.finalTitle }}</h2>
            <p class="section-text final-text">{{ ui.finalText }}</p>

            <div class="intro-actions">
              <NuxtLink :to="localePath('/catalog')" class="btn-main cta-pulse">{{ ui.finalCatalog }}</NuxtLink>
              <NuxtLink :to="localePath('/about')" class="btn-alt">{{ ui.finalAbout }}</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProducts, type LocalizedProduct } from '~/data/products'

const { locale } = useI18n()
const localePath = useLocalePath()
const shopStore = useShopStore()
const { getSelectedSize, selectSize, addProductWithSize, selectedSizes } = useProductActions()

const abVariant = ref<'A' | 'B'>('A')

onMounted(() => {
  const key = 'osf_home_ab_v1'
  let stored: string | null = null

  try {
    stored = window.localStorage.getItem(key)
  } catch {
    stored = null
  }

  if (stored === 'A' || stored === 'B') {
    abVariant.value = stored
    void loadSocialProofForIds(featuredProducts.value.map((item) => item.id))
    return
  }

  abVariant.value = Math.random() > 0.5 ? 'B' : 'A'
  try {
    window.localStorage.setItem(key, abVariant.value)
  } catch {
    // Ignore storage write failures.
  }

  void loadSocialProofForIds(featuredProducts.value.map((item) => item.id))
})

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      badgeLocation: 'Moldova • Chișinău',
      badgeBrand: 'Hit de sezon',
      abBadge: abVariant.value === 'B' ? 'Cumperi și porți' : 'Ia-l acum',
      label: 'ONE STYLE FOREVER',
      title: abVariant.value === 'B' ? 'Stil premium zilnic' : 'Stil pe care-l alegi',
      subtitle: abVariant.value === 'B'
        ? 'Alegi rapid. Porți cu plăcere.'
        : 'Piese curate, confort real, alegere simplă.',
      ctaCatalog: abVariant.value === 'B' ? 'Cumpără acum' : 'Vezi catalogul',
      ctaAbout: 'Despre brand',
      feature1: 'Material premium',
      feature2: 'Livrare rapidă',
      feature3: 'Retur simplu',
      stat1: 'produse recomandate',
      stat2: 'zile livrare',
      stat3: 'zile retur',
      stat4: 'suport clienți',
      visualTitle: 'Un stil. Pentru totdeauna.',
      visualText: 'Construim un brand în care produsul, prezentarea și serviciile funcționează împreună.',
      featuredLabel: 'Selecție',
      featuredTitle: 'Produse populare',
      featuredText: 'Top produse pe care clienții le aleg primele.',
      featuredAction: 'Tot catalogul',
      inStock: 'În stoc',
      quickView: 'Vezi produs',
      addToCart: 'În coș',
      chooseSize: 'Alege mărimea',
      socialProofPrefix: 'Comenzi în 7 zile:',
      socialProofEmpty: 'Model nou',
      philosophyLabel: 'Filosofie',
      philosophyTitle: 'ONE STYLE FOREVER înseamnă claritate, stil și dezvoltare',
      philosophyText: 'De la prima vizită pe site până la comandă, experiența trebuie să fie simplă și memorabilă.',
      philosophyItem1Title: 'Design coerent',
      philosophyItem1Text: 'Toate elementele păstrează aceeași direcție vizuală.',
      philosophyItem2Title: 'Selecție practică',
      philosophyItem2Text: 'Produse esențiale, ușor de combinat în garderobă.',
      philosophyItem3Title: 'Serviciu profesionist',
      philosophyItem3Text: 'Livrare rapidă, suport clar și retur simplu.',
      finalLabel: 'Următorul pas',
      finalTitle: abVariant.value === 'B' ? 'Comandă în câteva click-uri și poartă stilul tău zilnic' : 'Alege piesele care se potrivesc stilului tău',
      finalText: 'Intră în catalog și creează-ți selecția ONE STYLE FOREVER.',
      finalCatalog: abVariant.value === 'B' ? 'Merg la cumpărare' : 'Deschide catalogul',
      finalAbout: 'Citește despre brand',
      ratingLabel: 'Rating real',
      ratingTitle: 'Recenzii reale după cumpărare',
      ratingText: 'Doar evaluări reale după cumpărare.',
      ratingEmpty: 'Încă fără review-uri',
      addedToCart: 'Produs adăugat în coș'
    }
  }

  if (locale.value === 'en') {
    return {
      badgeLocation: 'Moldova • Chisinau',
      badgeBrand: 'Season favorite',
      abBadge: abVariant.value === 'B' ? 'Buy and wear' : 'Get it now',
      label: 'ONE STYLE FOREVER',
      title: abVariant.value === 'B' ? 'Premium style daily' : 'Style you choose',
      subtitle: abVariant.value === 'B'
        ? 'Choose fast. Wear with confidence.'
        : 'Clean pieces, real comfort, simple shopping.',
      ctaCatalog: abVariant.value === 'B' ? 'Buy now' : 'View catalog',
      ctaAbout: 'About brand',
      feature1: 'Premium fabric',
      feature2: 'Fast delivery',
      feature3: 'Easy return',
      stat1: 'featured products',
      stat2: 'delivery days',
      stat3: 'return days',
      stat4: 'customer support',
      visualTitle: 'One style. Forever.',
      visualText: 'We build a brand where product, presentation, and service work together.',
      featuredLabel: 'Selection',
      featuredTitle: 'Popular products',
      featuredText: 'Top picks customers choose first.',
      featuredAction: 'Full catalog',
      inStock: 'In stock',
      quickView: 'View product',
      addToCart: 'Add to cart',
      chooseSize: 'Choose size',
      socialProofPrefix: 'Ordered in 7 days:',
      socialProofEmpty: 'New arrival',
      philosophyLabel: 'Philosophy',
      philosophyTitle: 'ONE STYLE FOREVER means clarity, style, and growth',
      philosophyText: 'From first visit to checkout, the experience should feel simple and memorable.',
      philosophyItem1Title: 'Consistent design',
      philosophyItem1Text: 'Every element follows the same visual direction.',
      philosophyItem2Title: 'Practical selection',
      philosophyItem2Text: 'Essential pieces that are easy to combine.',
      philosophyItem3Title: 'Professional service',
      philosophyItem3Text: 'Fast delivery, clear support, and simple returns.',
      finalLabel: 'Next step',
      finalTitle: abVariant.value === 'B' ? 'Checkout in minutes and wear your signature style' : 'Choose the pieces that fit your style',
      finalText: 'Open the catalog and build your ONE STYLE FOREVER selection.',
      finalCatalog: abVariant.value === 'B' ? 'Start shopping now' : 'Open catalog',
      finalAbout: 'Read about brand',
      ratingLabel: 'Real rating',
      ratingTitle: 'Only verified reviews after purchase',
      ratingText: 'Only verified reviews after purchase.',
      ratingEmpty: 'No reviews yet',
      addedToCart: 'Product added to cart'
    }
  }

  return {
    badgeLocation: 'Молдова • Кишинёв',
    badgeBrand: 'Хит сезона',
    abBadge: abVariant.value === 'B' ? 'Купи и носи' : 'Бери сейчас',
    label: 'ONE STYLE FOREVER',
    title: abVariant.value === 'B' ? 'Премиум стиль каждый день' : 'Стиль, который выбирают',
    subtitle: abVariant.value === 'B'
      ? 'Выбери быстро. Носи с удовольствием.'
      : 'Чистые модели, реальный комфорт, простой выбор.',
    ctaCatalog: abVariant.value === 'B' ? 'Купить сейчас' : 'Смотреть каталог',
    ctaAbout: 'О бренде',
    feature1: 'Премиум ткань',
    feature2: 'Быстрая доставка',
    feature3: 'Лёгкий возврат',
    stat1: 'товаров в подборке',
    stat2: 'дня доставка',
    stat3: 'дней на возврат',
    stat4: 'поддержка клиентов',
    visualTitle: 'Один стиль. Навсегда.',
    visualText: 'Мы строим бренд, где товар, подача и сервис работают вместе.',
    featuredLabel: 'Подборка',
    featuredTitle: 'Популярные товары',
    featuredText: 'Топ-модели, которые выбирают первыми.',
    featuredAction: 'Весь каталог',
    inStock: 'В наличии',
    quickView: 'Смотреть товар',
    addToCart: 'В корзину',
    chooseSize: 'Выбери размер',
    socialProofPrefix: 'За 7 дней заказали:',
    socialProofEmpty: 'Новая модель',
    philosophyLabel: 'Философия',
    philosophyTitle: 'ONE STYLE FOREVER — это ясность, стиль и рост бренда',
    philosophyText: 'От первого посещения сайта до оформления заказа всё должно быть простым и запоминающимся.',
    philosophyItem1Title: 'Цельный дизайн',
    philosophyItem1Text: 'Все элементы поддерживают единый визуальный язык.',
    philosophyItem2Title: 'Практичная подборка',
    philosophyItem2Text: 'Базовые модели, которые легко сочетать.',
    philosophyItem3Title: 'Профессиональный сервис',
    philosophyItem3Text: 'Быстрая доставка, понятная поддержка и лёгкий возврат.',
    finalLabel: 'Следующий шаг',
    finalTitle: abVariant.value === 'B' ? 'Оформи заказ за пару минут и носи свой лучший образ' : 'Выбери вещи, которые подходят твоему стилю',
    finalText: 'Открой каталог и собери свою подборку ONE STYLE FOREVER.',
    finalCatalog: abVariant.value === 'B' ? 'Начать покупку' : 'Открыть каталог',
    finalAbout: 'Читать о бренде',
    ratingLabel: 'Честный рейтинг',
    ratingTitle: 'Только реальные отзывы после покупки',
    ratingText: 'Только реальные оценки после покупки.',
    ratingEmpty: 'Пока без отзывов',
    addedToCart: 'Товар добавлен в корзину'
  }
})

const featuredProducts = computed(() => getProducts(locale.value).slice(0, 3))
const weeklyOrdersByProduct = ref<Record<string, number>>({})
const loadedSocialProofIds = new Set<string>()
const loadingSocialProofIds = new Set<string>()

const getWeeklyOrders = (productId: string) => {
  const value = weeklyOrdersByProduct.value[productId]
  return Number.isFinite(value) ? Math.max(0, Number(value)) : 0
}

const loadSocialProofForIds = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.map((id) => String(id || '').trim()).filter(Boolean)))
  const toLoad = uniqueIds.filter((id) => !loadedSocialProofIds.has(id) && !loadingSocialProofIds.has(id))
  if (!toLoad.length) return

  toLoad.forEach((id) => loadingSocialProofIds.add(id))
  await Promise.all(toLoad.map(async (id) => {
    try {
      const response = await $fetch<{ success: boolean; orders7d?: number }>(`/api/social-proof/${id}`)
      weeklyOrdersByProduct.value[id] = Math.max(0, Number(response?.orders7d || 0))
    } catch {
      weeklyOrdersByProduct.value[id] = 0
    } finally {
      loadedSocialProofIds.add(id)
      loadingSocialProofIds.delete(id)
    }
  }))
}

const addFeaturedToCart = (product: LocalizedProduct) => {
  const added = addProductWithSize(product, {
    chooseSize: ui.value.chooseSize,
    added: ui.value.addedToCart
  }, {
    source: 'home'
  })

  if (added) {
    selectedSizes.value[product.id] = ''
  }
}

const toggleProductWishlist = (product: LocalizedProduct) => {
  shopStore.toggleWishlist(product)
}

const isWishlisted = (productId: string) => shopStore.isInWishlist(productId)

const wishlistButtonLabel = (productId: string) => {
  const active = isWishlisted(productId)

  if (locale.value === 'ro') return active ? 'Elimină din favorite' : 'Adaugă la favorite'
  if (locale.value === 'en') return active ? 'Remove from wishlist' : 'Add to wishlist'
  return active ? 'Убрать из избранного' : 'Добавить в избранное'
}

const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || 'https://onestyleforever.com').replace(/\/+$/, '')
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
    link: [
      {
        rel: 'preload',
        as: 'image',
        href: '/logo-preview.avif',
        type: 'image/avif',
        fetchpriority: 'high'
      },
      {
        rel: 'preload',
        as: 'image',
        href: '/logo-preview.webp',
        type: 'image/webp',
        fetchpriority: 'high'
      }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'ONE STYLE FOREVER',
          url: siteUrl,
          description: ui.value.subtitle,
          hasPart: featuredProducts.value.map((p) => ({
            '@type': 'Product',
            name: p.title,
            image: `${siteUrl}${p.image}`,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'MDL',
              price: p.price,
              availability: 'https://schema.org/InStock'
            }
          }))
        })
      }
    ]
  }))
)
</script>

<style scoped>
.home-page {
  padding-top: 18px;
}

.intro-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 22px;
  align-items: start;
}

.intro-card,
.intro-visual-card,
.featured-box,
.philosophy-box,
.final-box {
  padding: 32px;
}

.featured-box {
  overflow: hidden;
}

.intro-card {
  background: linear-gradient(165deg, #ffffff, #fbfdfb);
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
  margin: 8px 0 0;
  font-size: clamp(40px, 4.6vw, 62px);
  line-height: 1.06;
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
  background: #fff;
  display: grid;
  place-items: center;
  padding: 24px;
}

.intro-visual-main img {
  width: 100%;
  max-width: 360px;
  object-fit: contain;
}

.intro-quote {
  padding: 20px 22px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #dbe4da;
}

.intro-quote strong {
  display: block;
  margin-bottom: 8px;
  font-size: 22px;
  color: #275339;
}

.intro-quote p {
  margin: 0;
  color: #3f5568;
  line-height: 1.6;
}

.stats-strip {
  margin-top: 16px;
  padding: 18px;
  border-radius: 24px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.stat-item {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: #fff;
  display: grid;
  gap: 6px;
}

.stat-item strong {
  font-size: 26px;
  line-height: 1;
}

.stat-item span {
  color: var(--muted);
  font-size: 13px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: end;
  margin-bottom: 18px;
}

.block-title {
  margin: 0;
  font-size: clamp(30px, 3.4vw, 42px);
  line-height: 1;
}

.block-text {
  margin: 12px 0 0;
  max-width: 720px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  min-width: 0;
  max-width: 100%;
}

.product-card {
  border: 1px solid var(--border);
  border-radius: 24px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(18, 30, 22, 0.07);
  min-width: 0;
  max-width: 100%;
}

.product-media {
  min-height: 250px;
  background: #fff;
  position: relative;
  display: grid;
  place-items: center;
  padding: 12px;
  overflow: hidden;
  min-width: 0;
}

.product-media-link {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 52px 12px 12px;
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
  min-width: 0;
}

.product-media img {
  width: 100%;
  height: 100%;
  max-width: 220px;
  max-height: 220px;
  object-fit: contain;
  object-position: center;
  display: block;
}

.product-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 5;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--primary);
  font-size: 11px;
  line-height: 1.1;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.product-badge.hot {
  color: #9a4b3d;
}

.wishlist-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 5;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  color: #4b5d73;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wishlist-toggle.active {
  color: #c03a4a;
}

.wishlist-toggle svg {
  width: 17px;
  height: 17px;
}

.product-body {
  padding: 16px;
  display: grid;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.product-chip,
.product-stock {
  font-size: 12px;
  font-weight: 700;
}

.product-chip {
  color: var(--primary);
}

.product-stock {
  color: #58708b;
  white-space: nowrap;
}

.product-title-link h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.06;
}

.product-body p {
  margin: 0;
  color: #4a5a70;
  line-height: 1.6;
}

.product-proof-row {
  min-height: 24px;
}

.product-proof {
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid #cfe2d2;
  background: #f3faf4;
  color: #1f6f41;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.product-proof.muted {
  border-color: #dbe6dc;
  background: #f8fbf8;
  color: #607183;
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-pill {
  min-width: 44px;
  min-height: 36px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 12px;
  font-weight: 800;
}

.size-pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
}

.product-bottom strong {
  font-size: 22px;
  line-height: 1.05;
  white-space: nowrap;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.quick-btn,
.buy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 800;
  background: #fff;
}

.buy-btn {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.buy-btn:disabled {
  opacity: 0.5;
}

.philosophy-box {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
}

.philosophy-text {
  margin-top: 12px;
}

.philosophy-list {
  margin-top: 20px;
  display: grid;
  gap: 10px;
}

.philosophy-item {
  padding: 16px;
  border-radius: 16px;
  background: #f5f8f4;
  border: 1px solid var(--border);
}

.philosophy-item strong {
  display: block;
  margin-bottom: 4px;
}

.philosophy-item span {
  color: var(--muted);
  line-height: 1.6;
}

.philosophy-visual {
  border-radius: 24px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, #f5faf4, #ebf2e8);
  display: grid;
  place-items: center;
  padding: 20px;
}

.philosophy-visual img {
  max-width: 140px;
}

.features-section,
.rating-section {
  padding: 48px 0;
}

.features-grid,
.rating-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.feature-card {
  border: 1px solid var(--border);
  border-radius: 20px;
  background: #fff;
  padding: 20px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.feature-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.rating-panel {
  grid-template-columns: minmax(0, 1fr) 280px;
  align-items: center;
  border: 1px solid #d3dfd5;
  border-radius: 24px;
  background: linear-gradient(160deg, #ffffff, #f6faf6);
  padding: 24px;
}

.rating-score {
  border: 1px solid #d3dfd5;
  border-radius: 20px;
  background: #fff;
  padding: 18px;
  display: grid;
  gap: 8px;
}

.rating-stars {
  display: flex;
  gap: 5px;
}

.rating-stars span {
  font-size: 22px;
  color: #9cb2a1;
  line-height: 1;
}

.rating-stars span.active {
  color: #2b7b4f;
}

.rating-score strong {
  font-size: 28px;
  line-height: 1;
}

.rating-score span {
  color: #4f6757;
  font-size: 13px;
}

.final-box {
  background: linear-gradient(165deg, #ffffff, #f4f8f4);
}

.final-text {
  margin: 12px 0 20px;
  max-width: 700px;
}

@media (max-width: 1200px) {
  .intro-grid,
  .philosophy-box,
  .features-grid,
  .rating-panel,
  .stats-strip {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .product-card {
    display: block;
  }

  .product-media {
    min-height: 220px;
  }
}

@media (min-width: 980px) and (max-width: 1100px) {
  .intro-card,
  .intro-visual-card,
  .featured-box,
  .philosophy-box,
  .final-box {
    padding: 22px;
  }

  .intro-title {
    font-size: clamp(34px, 4.4vw, 44px);
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .product-card {
    display: block;
  }

  .product-media {
    min-height: 220px;
  }

  .product-media img {
    max-width: 220px;
    max-height: 220px;
    transform: none;
  }

  .product-title-link h3 {
    font-size: 20px;
  }

  .product-body p {
    font-size: 15px;
  }

  .product-bottom strong {
    font-size: 24px;
  }
}

@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .product-card {
    display: grid;
    grid-template-columns: minmax(0, 42%) minmax(0, 58%);
    border-radius: 18px;
  }

  .product-media {
    min-height: 0;
    padding: 6px;
  }

  .product-media-link {
    padding: 36px 8px 8px;
    border-radius: 14px;
  }

  .product-media img {
    max-width: 100%;
    max-height: 100%;
    transform: scale(1.08);
  }

  .product-body {
    padding: 12px;
    gap: 8px;
  }

  .product-title-link h3 {
    font-size: 20px;
  }

  .product-body p {
    font-size: 15px;
  }

  .product-bottom strong {
    font-size: 24px;
  }
}

@media (max-width: 760px) {
  .home-page {
    padding-top: 12px;
  }

  .intro-grid {
    gap: 10px;
  }

  .intro-card,
  .intro-visual-card,
  .featured-box,
  .philosophy-box,
  .final-box {
    padding: 12px;
  }

  .intro-badges,
  .intro-features,
  .intro-actions {
    gap: 8px;
  }

  .intro-badges {
    margin-bottom: 6px;
  }

  .intro-title {
    margin-top: 6px;
    font-size: clamp(24px, 8.4vw, 32px);
    line-height: 1.11;
  }

  .intro-text {
    margin: 6px 0 10px;
    font-size: 14px;
  }

  .intro-features {
    margin-top: 8px;
  }

  .intro-actions .btn-main,
  .intro-actions .btn-alt {
    min-height: 44px;
    padding: 0 16px;
    font-size: 14px;
  }

  .intro-features .pill,
  .intro-badges .pill {
    min-height: 34px;
    padding: 0 12px;
    font-size: 11px;
  }

  .intro-visual-card {
    gap: 10px;
  }

  .intro-visual-main {
    min-height: 200px;
    border-radius: 20px;
    padding: 12px;
  }

  .intro-visual-main img {
    max-width: 340px;
  }

  .intro-quote {
    padding: 14px 16px;
    border-radius: 18px;
  }

  .intro-quote strong {
    margin-bottom: 6px;
    font-size: 18px;
  }

  .intro-quote p {
    font-size: 15px;
    line-height: 1.45;
  }

  .stats-strip {
    margin-top: 10px;
    padding: 10px;
    border-radius: 16px;
    gap: 6px;
  }

  .stat-item {
    padding: 10px;
    border-radius: 12px;
    gap: 4px;
  }

  .stat-item strong {
    font-size: 16px;
  }

  .stat-item span {
    font-size: 11px;
    line-height: 1.25;
  }

  .section-head {
    align-items: start;
    flex-direction: column;
    margin-bottom: 12px;
  }

  .product-card {
    width: 100%;
    max-width: 100%;
    grid-template-columns: minmax(0, 45%) minmax(0, 55%);
    border-radius: 16px;
  }

  .product-media {
    min-height: 0;
    padding: 4px;
  }

  .product-media-link {
    min-height: 0;
    height: 100%;
    padding: 24px 4px 4px;
    border-radius: 12px;
  }

  .product-media img {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    transform: scale(1.18);
  }

  .product-badge {
    top: 8px;
    left: 8px;
    min-height: 26px;
    padding: 0 8px;
    font-size: 10px;
  }

  .wishlist-toggle {
    top: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
  }

  .wishlist-toggle svg {
    width: 14px;
    height: 14px;
  }

  .product-title-link h3 {
    font-size: 16px;
    line-height: 1.06;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-body {
    padding: 10px;
  }

  .product-body p {
    font-size: 13px;
    margin-bottom: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-meta {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px;
    align-items: center;
  }

  .product-stock {
    margin-left: 0;
    font-size: 11px;
    white-space: normal;
    text-align: right;
  }

  .product-bottom strong {
    font-size: 17px;
  }

  .size-list {
    gap: 6px;
  }

  .size-pill {
    min-width: 36px;
    min-height: 30px;
    font-size: 11px;
  }

  .product-actions,
  .product-bottom {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-btn,
  .buy-btn {
    width: 100%;
    min-height: 32px;
    font-size: 11px;
    padding: 0 8px;
  }
}

@media (max-width: 420px) {
  .intro-card,
  .intro-visual-card,
  .featured-box,
  .philosophy-box,
  .final-box {
    padding: 10px;
  }

  .intro-title {
    font-size: clamp(22px, 8.2vw, 28px);
  }

  .intro-text {
    margin: 6px 0 8px;
    font-size: 13px;
  }

  .intro-visual-main {
    min-height: 170px;
  }

  .product-card {
    grid-template-columns: minmax(0, 46%) minmax(0, 54%);
  }

  .product-media-link {
    padding-top: 20px;
  }

  .product-media img {
    transform: scale(1.2);
  }
}

@media (max-width: 389px) {
  .intro-title {
    font-size: clamp(20px, 8vw, 24px);
  }

  .intro-visual-main {
    min-height: 156px;
  }

  .product-card {
    grid-template-columns: minmax(0, 47%) minmax(0, 53%);
  }

  .product-media-link {
    padding-top: 18px;
  }

  .product-media img {
    transform: scale(1.22);
  }

  .product-body {
    padding: 8px;
  }
}
</style>
