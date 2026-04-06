<template>
  <div class="service-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card service-box">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title service-title">{{ ui.title }}</h1>
          <p class="section-text service-text">{{ ui.subtitle }}</p>

          <div class="steps-list">
            <div class="step-item" v-for="(step, index) in ui.steps" :key="step.title">
              <span class="step-index">{{ index + 1 }}</span>
              <div>
                <h2>{{ step.title }}</h2>
                <p>{{ step.text }}</p>
              </div>
            </div>
          </div>

          <NuxtLink :to="localePath('/contacts')" class="btn-main service-cta">
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
      label: 'Retur',
      title: 'Schimb și retur produse',
      subtitle: 'Dacă produsul nu ți se potrivește, te ajutăm rapid cu schimb sau retur.',
      steps: [
        { title: 'Perioadă de retur', text: 'Poți solicita retur în termen de 14 zile calendaristice de la primirea comenzii.' },
        { title: 'Starea produsului', text: 'Produsul trebuie să fie nepurtat, fără urme de utilizare și cu etichetele intacte.' },
        { title: 'Contact pentru retur', text: 'Trimite-ne ID-ul comenzii și motivul returului prin telefon, email sau Telegram.' },
        { title: 'Rambursare', text: 'După verificare, rambursarea se face prin metoda de plată inițială în 3-7 zile.' }
      ],
      cta: 'Contactează suportul'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Returns',
      title: 'Returns and exchanges',
      subtitle: 'If an item does not fit, we will help you with a quick exchange or return.',
      steps: [
        { title: 'Return window', text: 'You can request a return within 14 calendar days after receiving your order.' },
        { title: 'Item condition', text: 'Items must be unworn, unused, and returned with original tags.' },
        { title: 'How to request', text: 'Send your order ID and return reason via phone, email, or Telegram.' },
        { title: 'Refund', text: 'After inspection, refund is issued to the original payment method within 3-7 days.' }
      ],
      cta: 'Contact support'
    }
  }

  return {
    label: 'Возврат',
    title: 'Обмен и возврат товара',
    subtitle: 'Если товар не подошёл, мы поможем быстро оформить обмен или возврат.',
    steps: [
      { title: 'Срок возврата', text: 'Вы можете оформить возврат в течение 14 календарных дней после получения заказа.' },
      { title: 'Состояние товара', text: 'Товар должен быть без следов носки, с сохранёнными бирками и в исходном состоянии.' },
      { title: 'Как оформить', text: 'Отправьте номер заказа и причину возврата по телефону, email или в Telegram.' },
      { title: 'Возврат средств', text: 'После проверки мы вернём деньги тем же способом оплаты в течение 3-7 дней.' }
    ],
    cta: 'Связаться с поддержкой'
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

.steps-list {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.step-item {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: #fff;
  padding: 18px;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 14px;
}

.step-index {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #cbd8cb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #224836;
}

.step-item h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

.step-item p {
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

  .step-item {
    grid-template-columns: 1fr;
  }
}
</style>
