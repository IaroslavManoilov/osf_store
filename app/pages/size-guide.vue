<template>
  <div class="service-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card service-box">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title service-title">{{ ui.title }}</h1>
          <p class="section-text service-text">{{ ui.subtitle }}</p>

          <div class="table-wrap">
            <table class="size-table">
              <thead>
                <tr>
                  <th>{{ ui.size }}</th>
                  <th>{{ ui.chest }}</th>
                  <th>{{ ui.length }}</th>
                  <th>{{ ui.shoulders }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in ui.rows" :key="row.size">
                  <td>{{ row.size }}</td>
                  <td>{{ row.chest }}</td>
                  <td>{{ row.length }}</td>
                  <td>{{ row.shoulders }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="service-note">{{ ui.note }}</p>
          <NuxtLink :to="localePath('/catalog')" class="btn-main service-cta">{{ ui.cta }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

type SizeRow = {
  size: 'S' | 'M' | 'L'
  chest: string
  length: string
  shoulders: string
}

const rows: SizeRow[] = [
  { size: 'S', chest: '52 cm', length: '68 cm', shoulders: '44 cm' },
  { size: 'M', chest: '55 cm', length: '70 cm', shoulders: '46 cm' },
  { size: 'L', chest: '58 cm', length: '72 cm', shoulders: '48 cm' }
]

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Mărimi',
      title: 'Ghid de mărimi',
      subtitle: 'Tabel orientativ pentru alegerea rapidă a mărimii potrivite.',
      size: 'Mărime',
      chest: 'Piept',
      length: 'Lungime',
      shoulders: 'Umeri',
      rows,
      note: 'Dacă ești între două mărimi, recomandăm mărimea mai mare pentru un fit relaxat.',
      cta: 'Alege produs'
    }
  }

  if (locale.value === 'en') {
    return {
      label: 'Sizing',
      title: 'Size guide',
      subtitle: 'Reference measurements to help you choose your fit quickly.',
      size: 'Size',
      chest: 'Chest',
      length: 'Length',
      shoulders: 'Shoulders',
      rows,
      note: 'If you are between sizes, choose the larger size for a relaxed fit.',
      cta: 'Choose product'
    }
  }

  return {
    label: 'Размеры',
    title: 'Размерная сетка',
    subtitle: 'Ориентировочная таблица, чтобы быстро выбрать подходящий размер.',
    size: 'Размер',
    chest: 'Грудь',
    length: 'Длина',
    shoulders: 'Плечи',
    rows,
    note: 'Если сомневаешься между двумя размерами, бери больший для более свободной посадки.',
    cta: 'Выбрать товар'
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

.table-wrap {
  margin-top: 24px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: #fff;
  overflow-x: auto;
}

.size-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 460px;
}

.size-table th,
.size-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e5ece4;
  text-align: left;
}

.size-table th {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4d5e76;
}

.size-table td {
  font-weight: 700;
  color: #1d2c3d;
}

.size-table tr:last-child td {
  border-bottom: 0;
}

.service-note {
  margin: 16px 0 0;
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
