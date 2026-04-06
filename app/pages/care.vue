<template>
  <div class="service-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card service-box">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title service-title">{{ ui.title }}</h1>
          <p class="section-text service-text">{{ ui.subtitle }}</p>

          <div class="care-grid">
            <article class="care-card" v-for="item in ui.items" :key="item.title">
              <h2>{{ item.title }}</h2>
              <p>{{ item.text }}</p>
            </article>
          </div>

          <NuxtLink :to="localePath('/catalog')" class="btn-main service-cta">{{ ui.cta }}</NuxtLink>
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
      label: 'Îngrijire',
      title: 'Cum îngrijești produsele',
      subtitle: 'Reguli simple pentru a păstra forma, culoarea și confortul cât mai mult timp.',
      items: [
        { title: 'Spălare', text: 'Spală pe dos, la 30°C, cu culori similare.' },
        { title: 'Uscare', text: 'Evită uscătorul. Lasă produsul la uscat natural.' },
        { title: 'Călcare', text: 'Calcă la temperatură redusă, fără a atinge direct printul/logo-ul.' },
        { title: 'Depozitare', text: 'Păstrează produsele pliate sau pe umeraș, în spațiu uscat.' }
      ],
      cta: 'Mergi la catalog'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Care',
      title: 'How to care for your products',
      subtitle: 'Simple instructions to keep fit, color, and comfort for longer.',
      items: [
        { title: 'Washing', text: 'Wash inside out at 30°C with similar colors.' },
        { title: 'Drying', text: 'Avoid tumble drying. Let the product air dry naturally.' },
        { title: 'Ironing', text: 'Use low heat and avoid direct ironing on print or logo.' },
        { title: 'Storage', text: 'Store folded or on a hanger in a dry place.' }
      ],
      cta: 'Go to catalog'
    }
  }

  return {
    label: 'Уход',
    title: 'Как ухаживать за вещами',
    subtitle: 'Простые правила, чтобы дольше сохранить посадку, цвет и комфорт.',
    items: [
      { title: 'Стирка', text: 'Стирай наизнанку при 30°C с похожими цветами.' },
      { title: 'Сушка', text: 'Не используй сушильную машину. Суши естественным способом.' },
      { title: 'Глажка', text: 'Гладь на низкой температуре, не касаясь напрямую принта/логотипа.' },
      { title: 'Хранение', text: 'Храни сложенными или на вешалке в сухом месте.' }
    ],
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

.care-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.care-card {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: #fff;
  padding: 20px;
}

.care-card h2 {
  margin: 0 0 10px;
  font-size: 22px;
}

.care-card p {
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

  .care-grid {
    grid-template-columns: 1fr;
  }
}
</style>
