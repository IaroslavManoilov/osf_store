<template>
  <div class="service-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card service-box">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title service-title">{{ ui.title }}</h1>
          <p class="section-text service-text">{{ ui.subtitle }}</p>

          <div class="service-grid">
            <article class="service-card">
              <h2>{{ ui.processingTitle }}</h2>
              <p>{{ ui.processingText }}</p>
            </article>

            <article class="service-card">
              <h2>{{ ui.deliveryTitle }}</h2>
              <p>{{ ui.deliveryText }}</p>
            </article>

            <article class="service-card">
              <h2>{{ ui.paymentTitle }}</h2>
              <p>{{ ui.paymentText }}</p>
            </article>

            <article class="service-card">
              <h2>{{ ui.supportTitle }}</h2>
              <p>{{ ui.supportText }}</p>
            </article>
          </div>

          <NuxtLink :to="localePath('/catalog')" class="btn-main service-cta">
            {{ ui.cta }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Livrare',
      title: 'Informații despre livrare',
      subtitle: 'Livrăm rapid în toată Moldova cu comunicare clară la fiecare etapă.',
      processingTitle: 'Procesare comandă',
      processingText: 'Comenzile sunt confirmate în aceeași zi sau în următoarea zi lucrătoare.',
      deliveryTitle: 'Termen de livrare',
      deliveryText: 'Livrare standard: 2-3 zile lucrătoare. În perioade aglomerate, termenul poate crește.',
      paymentTitle: 'Cost și plată',
      paymentText: 'Costul livrării este calculat la checkout. Poți plăti online sau la livrare.',
      supportTitle: 'Suport',
      supportText: 'Îți oferim actualizări despre comandă prin telefon, email sau Telegram.',
      cta: 'Mergi la catalog'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Shipping',
      title: 'Shipping information',
      subtitle: 'We deliver quickly across Moldova with clear communication at every step.',
      processingTitle: 'Order processing',
      processingText: 'Orders are confirmed on the same day or next business day.',
      deliveryTitle: 'Delivery timeline',
      deliveryText: 'Standard delivery is 2-3 business days. During peak periods it may take longer.',
      paymentTitle: 'Cost and payment',
      paymentText: 'Shipping cost is calculated at checkout. You can pay online or on delivery.',
      supportTitle: 'Support',
      supportText: 'We provide updates via phone, email, or Telegram.',
      cta: 'Go to catalog'
    }
  }

  return {
    label: 'Доставка',
    title: 'Информация о доставке',
    subtitle: 'Доставляем быстро по всей Молдове и держим в курсе на каждом этапе.',
    processingTitle: 'Обработка заказа',
    processingText: 'Заказы подтверждаются в тот же день или в ближайший рабочий день.',
    deliveryTitle: 'Срок доставки',
    deliveryText: 'Стандартная доставка: 2-3 рабочих дня. В периоды высокой нагрузки сроки могут увеличиться.',
    paymentTitle: 'Стоимость и оплата',
    paymentText: 'Стоимость доставки рассчитывается на checkout. Доступна онлайн-оплата и оплата при получении.',
    supportTitle: 'Поддержка',
    supportText: 'Мы информируем о статусе заказа по телефону, email и в Telegram.',
    cta: 'Перейти в каталог'
  }
})

useSeoMeta({
  title: () => `${ui.value.title} | ONE STYLE FOREVER`,
  description: () => ui.value.subtitle,
  ogTitle: () => `${ui.value.title} | ONE STYLE FOREVER`,
  ogDescription: () => ui.value.subtitle,
  twitterCard: 'summary_large_image'
})
</script>

<style scoped>
.service-page {
  padding-top: 18px;
}

.service-box {
  padding: 32px;
}

.service-title {
  font-size: clamp(34px, 4vw, 54px);
  line-height: 0.97;
}

.service-text {
  margin-top: 14px;
  max-width: 760px;
}

.service-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.service-card {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: #fff;
  padding: 20px;
}

.service-card h2 {
  margin: 0 0 10px;
  font-size: 22px;
}

.service-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.service-cta {
  margin-top: 24px;
}

@media (max-width: 780px) {
  .service-box {
    padding: 20px;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }
}
</style>
