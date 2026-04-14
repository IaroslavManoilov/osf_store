<template>
  <div class="checkout-success-page">
    <section class="section-space">
      <div class="site-container">
        <div class="surface-card success-card">
          <span class="section-label">{{ ui.label }}</span>
          <h1 class="section-title success-title">{{ ui.title }}</h1>
          <p class="section-text success-text">{{ ui.subtitle }}</p>

          <div v-if="receipt" class="receipt-box">
            <div class="receipt-head">
              <strong>{{ receipt.orderId }}</strong>
              <span>{{ receipt.total }} MDL</span>
            </div>
            <p>{{ ui.payment }}: {{ paymentLabel(receipt.paymentMethod) }}</p>
            <p>{{ ui.date }}: {{ formatDate(receipt.createdAt) }}</p>
            <ul>
              <li v-for="(item, idx) in receipt.items" :key="`${receipt.orderId}-${idx}`">
                {{ item.title }} · {{ item.selectedSize || '-' }} · x{{ item.quantity }} = {{ item.lineTotal }} MDL
              </li>
            </ul>
          </div>

          <div class="actions">
            <button v-if="receipt" type="button" class="btn-alt" @click="printReceipt">
              {{ ui.print }}
            </button>
            <button v-if="receipt" type="button" class="btn-alt" @click="downloadReceipt">
              {{ ui.download }}
            </button>
            <NuxtLink v-if="ordersLink" :to="ordersLink" class="btn-main">
              {{ ui.openOrders }}
            </NuxtLink>
            <NuxtLink :to="localePath('/catalog')" class="btn-alt">
              {{ ui.toCatalog }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type ReceiptData = {
  orderId: string
  createdAt: string
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentMethod: 'card_online' | 'phone_transfer' | 'cash_on_delivery'
  paymentStatus: 'pending' | 'paid' | 'cash_on_delivery'
  items: Array<{
    title: string
    quantity: number
    selectedSize?: string
    price: number
    lineTotal: number
  }>
  total: number
}

const { locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const receipt = ref<ReceiptData | null>(null)
const orderId = computed(() => String(route.query.orderId || '').trim())
const trackToken = computed(() => String(route.query.trackToken || '').trim())
const ordersLink = computed(() => {
  if (!orderId.value || !trackToken.value) return ''
  return localePath({
    path: '/orders',
    query: {
      orderId: orderId.value,
      trackToken: trackToken.value
    }
  })
})

const ui = computed(() => {
  if (locale.value === 'ro') {
    return {
      label: 'Plată',
      title: 'Plata a fost finalizată',
      subtitle: 'Comanda este confirmată. Poți descărca sau printa bonul.',
      payment: 'Plată',
      date: 'Data',
      print: 'Printează bonul',
      download: 'Descarcă bonul',
      openOrders: 'Deschide comenzile mele',
      toCatalog: 'Mergi la catalog',
      card: 'Card online',
      phone: 'Transfer telefon',
      cash: 'Numerar la livrare'
    }
  }
  if (locale.value === 'en') {
    return {
      label: 'Payment',
      title: 'Payment completed',
      subtitle: 'Your order is confirmed. You can print or download the receipt.',
      payment: 'Payment',
      date: 'Date',
      print: 'Print receipt',
      download: 'Download receipt',
      openOrders: 'Open my orders',
      toCatalog: 'Go to catalog',
      card: 'Card online',
      phone: 'Phone transfer',
      cash: 'Cash on delivery'
    }
  }
  return {
    label: 'Оплата',
    title: 'Оплата успешно завершена',
    subtitle: 'Заказ подтверждён. Можешь распечатать или скачать чек.',
    payment: 'Оплата',
    date: 'Дата',
    print: 'Печать чека',
    download: 'Скачать чек',
    openOrders: 'Открыть мои заказы',
    toCatalog: 'Перейти в каталог',
    card: 'Картой онлайн',
    phone: 'Перевод по телефону',
    cash: 'Наличными при доставке'
  }
})

const paymentLabel = (method: ReceiptData['paymentMethod']) => {
  if (method === 'card_online') return ui.value.card
  if (method === 'phone_transfer') return ui.value.phone
  return ui.value.cash
}

const formatDate = (value: string) => {
  const code = locale.value === 'ro' ? 'ro-RO' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return new Date(value).toLocaleString(code)
}

const receiptText = computed(() => {
  if (!receipt.value) return ''
  const r = receipt.value
  const lines = [
    'ONE STYLE FOREVER',
    `Order: ${r.orderId}`,
    `Date: ${formatDate(r.createdAt)}`,
    `Payment: ${paymentLabel(r.paymentMethod)}`,
    '',
    'Items:'
  ]
  for (const item of r.items) {
    lines.push(`- ${item.title} [${item.selectedSize || '-'}] x${item.quantity} = ${item.lineTotal} MDL`)
  }
  lines.push('')
  lines.push(`Total: ${r.total} MDL`)
  return lines.join('\n')
})

const printReceipt = () => {
  if (!import.meta.client || !receipt.value) return
  const popup = window.open('', '_blank', 'width=560,height=780')
  if (!popup) return
  popup.document.write(`<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 20px; white-space: pre-wrap;">${receiptText.value.replace(/</g, '&lt;')}</pre>`)
  popup.document.close()
  popup.focus()
  popup.print()
}

const downloadReceipt = () => {
  if (!import.meta.client || !receipt.value) return
  const blob = new Blob([receiptText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt-${receipt.value.orderId}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  if (!import.meta.client || !orderId.value) return
  try {
    const raw = window.localStorage.getItem(`osf_receipt_${orderId.value}`)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed === 'object') {
      receipt.value = parsed as ReceiptData
    }
  } catch {
    receipt.value = null
  }
})
</script>

<style scoped>
.checkout-success-page {
  padding-top: 18px;
  padding-bottom: 84px;
}

.success-card {
  padding: 30px;
  display: grid;
  gap: 16px;
}

.success-title {
  font-size: clamp(34px, 4.2vw, 56px);
  line-height: 0.95;
}

.success-text {
  margin-top: 8px;
}

.receipt-box {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #fff;
  padding: 14px;
  display: grid;
  gap: 8px;
}

.receipt-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.receipt-head strong {
  font-size: 16px;
}

.receipt-box p {
  margin: 0;
  color: #4b5f76;
  font-weight: 700;
}

.receipt-box ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;
  color: #31485f;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
