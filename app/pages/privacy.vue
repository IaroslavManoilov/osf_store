<template>
  <div class="service-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card service-box">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title service-title">{{ ui.title }}</h1>
          <p class="section-text service-text">{{ ui.subtitle }}</p>

          <div class="privacy-list">
            <article class="privacy-item" v-for="item in ui.items" :key="item.title">
              <h2>{{ item.title }}</h2>
              <p>{{ item.text }}</p>
            </article>
          </div>

          <NuxtLink :to="localePath('/checkout')" class="btn-main service-cta">{{ ui.cta }}</NuxtLink>
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
      label: 'Confidențialitate',
      title: 'Politica de confidențialitate',
      subtitle: 'Folosim datele doar pentru procesarea comenzilor, suport și îmbunătățirea serviciului.',
      items: [
        { title: 'Ce date colectăm', text: 'Nume, telefon, email, adresă de livrare și datele comenzii.' },
        { title: 'Cum folosim datele', text: 'Pentru confirmare, livrare, suport client și actualizări legate de comandă.' },
        { title: 'Cu cine partajăm datele', text: 'Doar cu serviciile de livrare și procesatorii de plată necesari.' },
        { title: 'Drepturile tale', text: 'Poți solicita corectarea sau ștergerea datelor personale prin contact direct.' }
      ],
      cta: 'Mergi la checkout'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Privacy',
      title: 'Privacy policy',
      subtitle: 'We use personal data only for order processing, support, and service improvement.',
      items: [
        { title: 'What we collect', text: 'Name, phone, email, shipping address, and order details.' },
        { title: 'How we use data', text: 'For order confirmation, delivery, customer support, and order updates.' },
        { title: 'Who we share with', text: 'Only delivery partners and payment providers required to fulfill your order.' },
        { title: 'Your rights', text: 'You can request correction or deletion of personal data by contacting us directly.' }
      ],
      cta: 'Go to checkout'
    }
  }

  return {
    label: 'Конфиденциальность',
    title: 'Политика конфиденциальности',
    subtitle: 'Мы используем данные только для обработки заказов, поддержки и улучшения сервиса.',
    items: [
      { title: 'Какие данные собираем', text: 'Имя, телефон, email, адрес доставки и данные заказа.' },
      { title: 'Как используем данные', text: 'Для подтверждения, доставки, поддержки и обновлений по заказу.' },
      { title: 'Кому передаём данные', text: 'Только службам доставки и платёжным провайдерам, нужным для выполнения заказа.' },
      { title: 'Ваши права', text: 'Вы можете запросить исправление или удаление персональных данных через поддержку.' }
    ],
    cta: 'Перейти к оформлению'
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

.privacy-list {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.privacy-item {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: #fff;
  padding: 18px;
}

.privacy-item h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

.privacy-item p {
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
}
</style>
