<template>
  <div class="service-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card service-box">
          <span class="section-label">FAQ</span>
          <h1 class="section-title service-title">{{ ui.title }}</h1>
          <p class="section-text service-text">{{ ui.subtitle }}</p>

          <div class="faq-list">
            <details v-for="item in ui.items" :key="item.q" class="faq-item">
              <summary>{{ item.q }}</summary>
              <p>{{ item.a }}</p>
            </details>
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
      title: 'Întrebări frecvente',
      subtitle: 'Cele mai importante răspunsuri despre produse, comenzi, livrare și retur.',
      items: [
        { q: 'Cum aleg mărimea potrivită?', a: 'Pe fiecare produs poți alege S, M sau L. Dacă nu ești sigur, scrie-ne și te ajutăm rapid.' },
        { q: 'În cât timp ajunge comanda?', a: 'În general, livrarea durează 2-3 zile lucrătoare în Moldova.' },
        { q: 'Pot modifica comanda după plasare?', a: 'Da, dacă nu a fost deja expediată. Contactează-ne cât mai repede.' },
        { q: 'Cum fac un retur?', a: 'Ne trimiți ID-ul comenzii și motivul returului, iar noi te ghidăm pas cu pas.' }
      ],
      cta: 'Contactează echipa'
    }
  }

  if (locale.value === 'en') {
    return {
      title: 'Frequently asked questions',
      subtitle: 'Key answers about products, orders, shipping, and returns.',
      items: [
        { q: 'How do I choose the right size?', a: 'Each product includes S, M, and L options. If unsure, contact us and we will help.' },
        { q: 'How long does delivery take?', a: 'Delivery across Moldova usually takes 2-3 business days.' },
        { q: 'Can I change my order after placement?', a: 'Yes, as long as it has not been shipped yet. Contact us as soon as possible.' },
        { q: 'How do I request a return?', a: 'Send us your order ID and return reason, and our team will guide you step by step.' }
      ],
      cta: 'Contact the team'
    }
  }

  return {
    title: 'Часто задаваемые вопросы',
    subtitle: 'Ключевые ответы о товарах, заказах, доставке и возврате.',
    items: [
      { q: 'Как выбрать размер?', a: 'На каждой карточке доступны размеры S, M и L. Если не уверены, напишите нам — поможем подобрать.' },
      { q: 'Сколько занимает доставка?', a: 'Обычно доставка по Молдове занимает 2-3 рабочих дня.' },
      { q: 'Можно ли изменить заказ после оформления?', a: 'Да, если заказ ещё не отправлен. Свяжитесь с нами как можно раньше.' },
      { q: 'Как сделать возврат?', a: 'Отправьте номер заказа и причину возврата, и мы пошагово подскажем, что делать.' }
    ],
    cta: 'Связаться с командой'
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

.faq-list {
  margin-top: 22px;
  display: grid;
  gap: 10px;
}

.faq-item {
  border: 1px solid var(--border);
  border-radius: 20px;
  background: #fff;
  padding: 14px 16px;
}

.faq-item summary {
  cursor: pointer;
  font-weight: 800;
  font-size: 17px;
}

.faq-item p {
  margin: 10px 0 0;
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
