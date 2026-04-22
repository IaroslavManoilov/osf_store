import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdminCsrf } from '../../../utils/admin-session'
import { assertRateLimit } from '../../../utils/rate-limit'

type OrderStatus = 'new' | 'confirmed' | 'assembled' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
type PaymentStatus = 'pending' | 'paid' | 'cash_on_delivery'

type InsightOrder = {
  id: string
  createdAt: string
  total: number
  status: OrderStatus
  payment: {
    status: PaymentStatus
  }
  customer: {
    phone?: string
    address?: string
  }
  items?: Array<{ quantity?: number }>
}

type BodyPayload = {
  locale?: 'ru' | 'ro' | 'en'
  orders?: InsightOrder[]
}

type AiOutput = {
  summary: string
  topRisks: string[]
  actions: string[]
  priorityOrderIds: string[]
}

const statusSlaHours = (status: OrderStatus) => {
  if (status === 'new') return 2
  if (status === 'confirmed' || status === 'assembled') return 24
  if (status === 'shipped') return 72
  return Number.POSITIVE_INFINITY
}

const buildHeuristicInsights = (orders: InsightOrder[], locale: 'ru' | 'ro' | 'en'): AiOutput => {
  const activeOrders = orders.filter((order) => !['delivered', 'cancelled', 'returned'].includes(order.status))
  const now = Date.now()
  const riskyOrders = activeOrders.filter((order) => {
    const limit = statusSlaHours(order.status)
    if (!Number.isFinite(limit)) return false
    const ageHours = Math.max(0, (now - new Date(order.createdAt).getTime()) / 3600000)
    return ageHours >= limit
  })
  const pendingPay = activeOrders.filter((order) => order.payment?.status === 'pending')
  const priorityOrderIds = [...activeOrders]
    .map((order) => {
      const ageHours = Math.max(0, (now - new Date(order.createdAt).getTime()) / 3600000)
      const slaHours = statusSlaHours(order.status)
      const overdueWeight = Number.isFinite(slaHours) ? Math.max(0, ageHours - slaHours) * 10 : 0
      const pendingWeight = order.payment?.status === 'pending' ? 2 : 0
      return {
        id: order.id,
        score: overdueWeight + pendingWeight + ageHours * 0.1
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.id)
    .filter(Boolean)

  if (locale === 'en') {
    return {
      summary: `Active: ${activeOrders.length}. In SLA risk: ${riskyOrders.length}. Pending payment: ${pendingPay.length}.`,
      topRisks: [
        riskyOrders.length ? `${riskyOrders.length} orders are over SLA and may cause delays.` : 'No overdue SLA orders detected.',
        pendingPay.length ? `${pendingPay.length} orders are still waiting for payment.` : 'No pending payment bottleneck now.',
        activeOrders.length > 40 ? 'Order queue is high, watch throughput and assign work faster.' : 'Current queue volume is moderate.'
      ],
      actions: [
        riskyOrders.length ? 'Use "Take in work" for high-priority orders right now.' : 'Keep current flow and monitor every 30 minutes.',
        pendingPay.length ? 'Prioritize payment follow-up for pending orders.' : 'Focus on fulfillment speed and packing.',
        'Re-check inventory for top-selling SKUs before next traffic spike.'
      ],
      priorityOrderIds
    }
  }

  if (locale === 'ro') {
    return {
      summary: `Active: ${activeOrders.length}. În risc SLA: ${riskyOrders.length}. În așteptare plată: ${pendingPay.length}.`,
      topRisks: [
        riskyOrders.length ? `${riskyOrders.length} comenzi au depășit SLA și pot întârzia.` : 'Nu sunt comenzi peste SLA.',
        pendingPay.length ? `${pendingPay.length} comenzi încă așteaptă plata.` : 'Nu există blocaj pe plăți în acest moment.',
        activeOrders.length > 40 ? 'Volum mare de coadă, monitorizează viteza de procesare.' : 'Volumul cozii este moderat.'
      ],
      actions: [
        riskyOrders.length ? 'Folosește "Preia în lucru" pentru comenzile cu prioritate mare.' : 'Păstrează fluxul curent și verifică la 30 min.',
        pendingPay.length ? 'Prioritizează follow-up pentru plăți în așteptare.' : 'Concentrează-te pe ambalare și expediere rapidă.',
        'Verifică stocul pentru SKU-urile cu rotație mare.'
      ],
      priorityOrderIds
    }
  }

  return {
    summary: `Активных: ${activeOrders.length}. В SLA-риске: ${riskyOrders.length}. Ожидают оплату: ${pendingPay.length}.`,
    topRisks: [
      riskyOrders.length ? `${riskyOrders.length} заказов вышли за SLA и могут дать просрочку.` : 'Просрочек по SLA сейчас нет.',
      pendingPay.length ? `${pendingPay.length} заказов ждут оплату и тормозят поток.` : 'Затыка по оплатам сейчас нет.',
      activeOrders.length > 40 ? 'Очередь высокая, нужен быстрый разбор приоритетов.' : 'Текущая нагрузка умеренная.'
    ],
    actions: [
      riskyOrders.length ? 'Нажми "Взять в работу" на high-priority заказах.' : 'Сохраняй текущий темп и контроль каждые 30 минут.',
      pendingPay.length ? 'Сначала дожми ожидающие оплату заказы.' : 'Фокус на сборке и передаче в доставку.',
      'Проверь остатки топовых товаров до следующего пика.'
    ],
    priorityOrderIds
  }
}

const callOpenAiInsights = async (apiKey: string, locale: 'ru' | 'ro' | 'en', orders: InsightOrder[]): Promise<AiOutput | null> => {
  const prompt = [
    'You are an e-commerce operations analyst.',
    'Return strict JSON only:',
    '{"summary":"...", "topRisks":["..."], "actions":["..."], "priorityOrderIds":["order_id_1","order_id_2","order_id_3"]}',
    'Rules:',
    '- summary max 1 sentence',
    '- topRisks: exactly 3 bullets, short',
    '- actions: exactly 3 concrete actions',
    '- priorityOrderIds: up to 3 order ids from provided list, most urgent first',
    '- no markdown, no extra keys',
    `Locale: ${locale}`,
    `Orders JSON: ${JSON.stringify(orders.slice(0, 120))}`
  ].join('\n')

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      input: prompt
    })
  })

  if (!response.ok) return null
  const data = await response.json() as { output_text?: string }
  const outputText = String(data?.output_text || '').trim()
  if (!outputText) return null

  const parsed = JSON.parse(outputText) as Partial<AiOutput>
  const summary = String(parsed.summary || '').trim()
  const topRisks = Array.isArray(parsed.topRisks) ? parsed.topRisks.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3) : []
  const actions = Array.isArray(parsed.actions) ? parsed.actions.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3) : []
  const priorityOrderIds = Array.isArray(parsed.priorityOrderIds)
    ? parsed.priorityOrderIds.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3)
    : []
  if (!summary || topRisks.length < 1 || actions.length < 1) return null

  return {
    summary,
    topRisks: topRisks.length === 3 ? topRisks : [...topRisks, ...Array(Math.max(0, 3 - topRisks.length)).fill('')].slice(0, 3),
    actions: actions.length === 3 ? actions : [...actions, ...Array(Math.max(0, 3 - actions.length)).fill('')].slice(0, 3),
    priorityOrderIds
  }
}

export default defineEventHandler(async (event) => {
  requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-ai-orders-insights',
    limit: 20,
    windowMs: 60 * 1000
  })

  const body = await readBody<BodyPayload>(event)
  const locale: 'ru' | 'ro' | 'en' = body?.locale === 'en' || body?.locale === 'ro' ? body.locale : 'ru'
  const orders = Array.isArray(body?.orders) ? body.orders : []

  if (!orders.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Orders are required for AI insights.'
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = String(runtimeConfig.openAiApiKey || '').trim()

  if (apiKey) {
    try {
      const ai = await callOpenAiInsights(apiKey, locale, orders)
      if (ai) {
        return {
          success: true,
          source: 'ai',
          ...ai
        }
      }
    } catch {
      // Fallback below.
    }
  }

  const heuristic = buildHeuristicInsights(orders, locale)
  return {
    success: true,
    source: 'heuristic',
    ...heuristic
  }
})
