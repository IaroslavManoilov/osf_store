<template>
  <div class="contacts-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card hero-box">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title hero-title">{{ ui.title }}</h1>
          <p class="section-text hero-text">{{ ui.subtitle }}</p>

          <div class="hero-actions">
            <NuxtLink :to="localePath('/catalog')" class="btn-main">{{ ui.ctaCatalog }}</NuxtLink>
            <NuxtLink :to="localePath('/faq')" class="btn-alt">{{ ui.ctaFaq }}</NuxtLink>
          </div>

          <div class="trust-row">
            <span>{{ ui.trust1 }}</span>
            <span>{{ ui.trust2 }}</span>
            <span>{{ ui.trust3 }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="contacts-grid">
          <a class="surface-card contact-card" href="tel:+37368514544">
            <strong>{{ ui.phoneLabel }}</strong>
            <span>+373 68 514 544</span>
            <small>{{ ui.phoneHint }}</small>
          </a>

          <a class="surface-card contact-card" href="mailto:iarosalv2003manoilov@gmail.com">
            <strong>{{ ui.emailLabel }}</strong>
            <span>iarosalv2003manoilov@gmail.com</span>
            <small>{{ ui.emailHint }}</small>
          </a>

          <a
            class="surface-card contact-card"
            href="https://t.me/iaroslav_manoilov"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>Telegram</strong>
            <span>@iaroslav_manoilov</span>
            <small>{{ ui.telegramHint }}</small>
          </a>

          <a
            class="surface-card contact-card"
            href="https://www.instagram.com/iaroslav_manoilov_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>Instagram</strong>
            <span>@iaroslav_manoilov_</span>
            <small>{{ ui.instagramHint }}</small>
          </a>
        </div>
      </div>
    </section>

    <section class="section-space">
      <div class="site-container">
        <div class="legal-grid">
          <div class="surface-card legal-card">
            <h2 class="block-title">{{ ui.legalTitle }}</h2>
            <ul class="legal-list">
              <li><strong>{{ ui.brandLabel }}</strong><span>ONE STYLE FOREVER</span></li>
              <li><strong>{{ ui.regionLabel }}</strong><span>Moldova, Chișinău</span></li>
              <li><strong>{{ ui.workHoursLabel }}</strong><span>{{ ui.workHoursValue }}</span></li>
              <li><strong>{{ ui.responseLabel }}</strong><span>{{ ui.responseValue }}</span></li>
              <li><strong>{{ ui.returnsLabel }}</strong><span>{{ ui.returnsValue }}</span></li>
            </ul>
          </div>

          <div class="surface-card legal-card accent">
            <h2 class="block-title">{{ ui.requisitesTitle }}</h2>
            <p class="section-text legal-text">{{ ui.requisitesText }}</p>
            <NuxtLink :to="localePath('/privacy')" class="btn-alt">{{ ui.ctaPrivacy }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const siteUrl = 'https://onestyleforever.com'

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Contacte',
      title: 'Contacte oficiale și detalii brand',
      subtitle: 'Suntem disponibili pentru comenzi, suport, colaborări și întrebări despre produse.',
      ctaCatalog: 'Mergi la catalog',
      ctaFaq: 'Vezi FAQ',
      trust1: 'Răspuns rapid',
      trust2: 'Comunicare directă',
      trust3: 'Brand verificabil',
      phoneLabel: 'Telefon',
      phoneHint: 'Comenzi și suport',
      emailLabel: 'Email',
      emailHint: 'Întrebări generale și colaborări',
      telegramHint: 'Răspuns rapid în chat',
      instagramHint: 'Noutăți, stories, drop-uri',
      legalTitle: 'Date publice',
      brandLabel: 'Brand',
      regionLabel: 'Regiune',
      workHoursLabel: 'Program suport',
      workHoursValue: 'Luni-Vineri, 09:00-19:00',
      responseLabel: 'Timp mediu răspuns',
      responseValue: 'În aceeași zi',
      returnsLabel: 'Retur',
      returnsValue: '14 zile calendaristice',
      requisitesTitle: 'Rechizite și documente',
      requisitesText: 'La solicitare oferim detalii pentru facturare, retur și informații suplimentare de identificare a magazinului.',
      ctaPrivacy: 'Politica de confidențialitate'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Contacts',
      title: 'Official contacts and brand details',
      subtitle: 'Reach us for orders, support, collaborations, and product questions.',
      ctaCatalog: 'Go to catalog',
      ctaFaq: 'Open FAQ',
      trust1: 'Fast response',
      trust2: 'Direct communication',
      trust3: 'Verifiable brand',
      phoneLabel: 'Phone',
      phoneHint: 'Orders and support',
      emailLabel: 'Email',
      emailHint: 'General questions and collaborations',
      telegramHint: 'Quick chat support',
      instagramHint: 'Drops and new arrivals',
      legalTitle: 'Public details',
      brandLabel: 'Brand',
      regionLabel: 'Region',
      workHoursLabel: 'Support hours',
      workHoursValue: 'Mon-Fri, 09:00-19:00',
      responseLabel: 'Average response time',
      responseValue: 'Within the same day',
      returnsLabel: 'Returns',
      returnsValue: '14 calendar days',
      requisitesTitle: 'Requisites and documents',
      requisitesText: 'Upon request, we provide details for invoicing, returns, and additional store identification information.',
      ctaPrivacy: 'Privacy policy'
    }
  }

  return {
    label: 'Контакты',
    title: 'Официальные контакты и данные бренда',
    subtitle: 'Мы на связи по заказам, поддержке, сотрудничеству и вопросам по товарам.',
    ctaCatalog: 'Перейти в каталог',
    ctaFaq: 'Открыть FAQ',
    trust1: 'Быстрый ответ',
    trust2: 'Прямая связь',
    trust3: 'Проверяемый бренд',
    phoneLabel: 'Телефон',
    phoneHint: 'Заказы и поддержка',
    emailLabel: 'Email',
    emailHint: 'Общие вопросы и сотрудничество',
    telegramHint: 'Быстрый ответ в чате',
    instagramHint: 'Новинки и дропы',
    legalTitle: 'Публичные данные',
    brandLabel: 'Бренд',
    regionLabel: 'Регион',
    workHoursLabel: 'График поддержки',
    workHoursValue: 'Пн-Пт, 09:00-19:00',
    responseLabel: 'Среднее время ответа',
    responseValue: 'В течение дня',
    returnsLabel: 'Возврат',
    returnsValue: '14 календарных дней',
    requisitesTitle: 'Реквизиты и документы',
    requisitesText: 'По запросу предоставляем данные для оформления документов, возврата и дополнительной идентификации магазина.',
    ctaPrivacy: 'Политика конфиденциальности'
  }
})

useSeoMeta({
  title: () => `${ui.value.title} | ONE STYLE FOREVER`,
  description: () => ui.value.subtitle,
  ogTitle: () => `${ui.value.title} | ONE STYLE FOREVER`,
  ogDescription: () => ui.value.subtitle,
  ogImage: `${siteUrl}/logo-preview.png`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterImage: `${siteUrl}/logo-preview.png`
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ONE STYLE FOREVER',
        url: siteUrl,
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+37368514544',
            contactType: 'customer support',
            areaServed: 'MD'
          }
        ],
        sameAs: [
          'https://www.instagram.com/iaroslav_manoilov_/',
          'https://t.me/iaroslav_manoilov'
        ]
      })
    }
  ]
})
</script>

<style scoped>
.contacts-page {
  padding-top: 18px;
}

.hero-box {
  padding: 32px;
}

.hero-title {
  font-size: clamp(34px, 4vw, 58px);
  line-height: 0.96;
}

.hero-text {
  margin-top: 14px;
  max-width: 760px;
}

.hero-actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.trust-row {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.trust-row span {
  min-height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #bfd7c5;
  background: #f3fbf5;
  color: #1f5d3b;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.contact-card {
  padding: 18px;
  display: grid;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(18, 30, 22, 0.08);
}

.contact-card strong {
  font-size: 14px;
}

.contact-card span {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.contact-card small {
  color: var(--muted);
  font-size: 13px;
}

.legal-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;
}

.legal-card {
  padding: 24px;
}

.legal-card.accent {
  background: linear-gradient(180deg, #fff 0%, #f8fbf9 100%);
}

.legal-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.legal-list li {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.legal-list strong {
  font-size: 13px;
}

.legal-list span {
  font-size: 14px;
  color: #2d4258;
  font-weight: 700;
}

.legal-text {
  margin: 12px 0 18px;
}

@media (max-width: 980px) {
  .legal-grid,
  .contacts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .hero-box,
  .legal-card {
    padding: 18px;
  }

  .contact-card span {
    font-size: 18px;
  }
}
</style>
