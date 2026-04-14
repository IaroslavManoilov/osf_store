import { createError, readBody } from 'h3'
import type { H3Event } from 'h3'
import { Resend } from 'resend'
import { saveOrder } from '../utils/order-storage'
import { getSupabaseAdmin } from '../utils/supabase-admin'
import { assertRateLimit } from '../utils/rate-limit'
import { reserveInventory, restoreInventory } from '../utils/inventory'
import { createOrderTrackToken } from '../utils/order-track-token'
import { requireCheckoutCsrf } from '../utils/checkout-csrf'
import { readProductOverridesSafe } from '../utils/product-overrides'
import { getSiteUrl, getStripeClient } from '../utils/stripe'
import { getProducts } from '~/data/products'

type OrderItem = {
  id: string
  title: string
  price: number
  quantity: number
  selectedSize?: string
}

type OrderPayload = {
  customer: {
    name: string
    phone: string
    email?: string
    address: string
    comment?: string
  }
  payment?: {
    method?: string
  }
  items: OrderItem[]
  total: number
}

const buildCatalogById = async (event: H3Event) => {
  const base = getProducts('ru')
  const overrides = await readProductOverridesSafe(event)
  const overrideById = new Map(overrides.map((row) => [String(row.product_id || '').trim(), row]))

  return new Map(
    base.map((product) => {
      const override = overrideById.get(product.id)
      const overridePrice = override?.price === null || override?.price === undefined ? null : Number(override.price)
      const overrideTitle = String(override?.title_ru || '').trim()

      return [
        product.id,
        {
          id: product.id,
          title: overrideTitle || product.title,
          price: Number.isFinite(overridePrice) && overridePrice !== null ? Math.max(0, Math.round(overridePrice)) : product.price,
          sizes: product.sizes
        }
      ]
    })
  )
}

const safeText = (value: unknown, max = 255) => String(value || '').trim().slice(0, max)
const isEmailValid = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const normalizePhone = (value: string) => value.replace(/[^\d+]/g, '')
const normalizePaymentMethod = (value: unknown): 'card_online' | 'phone_transfer' | 'cash_on_delivery' => {
  const method = String(value || '').trim()
  if (method === 'card_online' || method === 'phone_transfer' || method === 'cash_on_delivery') {
    return method
  }
  return 'cash_on_delivery'
}
const paymentMethodLabelRu = (method: 'card_online' | 'phone_transfer' | 'cash_on_delivery') => {
  if (method === 'card_online') return 'Карта онлайн'
  if (method === 'phone_transfer') return 'Оплата телефоном'
  return 'Наличными при доставке'
}

export default defineEventHandler(async (event) => {
  requireCheckoutCsrf(event)

  assertRateLimit(event, {
    namespace: 'create-order',
    limit: 6,
    windowMs: 60 * 1000
  })

  const config = useRuntimeConfig(event)
  const body = await readBody<OrderPayload>(event)
  const catalogById = await buildCatalogById(event)

  const { customer, items } = body

  const customerName = safeText(customer?.name, 80)
  const customerPhone = normalizePhone(safeText(customer?.phone, 30))
  const customerAddress = safeText(customer?.address, 300)
  const customerEmail = safeText(customer?.email, 120)
  const customerComment = safeText(customer?.comment, 1200)
  const paymentMethod = normalizePaymentMethod(body?.payment?.method)
  const paymentStatus = paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'pending'

  if (!customerName || !customerPhone || !customerAddress) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid customer data'
    })
  }

  if (customerName.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Customer name is too short'
    })
  }

  if (customerPhone.length < 6 || customerPhone.length > 18) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid phone number'
    })
  }

  if (!isEmailValid(customerEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email'
    })
  }

  if (!items || !items.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No items'
    })
  }

  const normalizedItems: OrderItem[] = items.map((incomingItem, index) => {
    const product = catalogById.get(String(incomingItem.id || '').trim())
    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: `Unknown product at position ${index + 1}`
      })
    }

    const quantity = Number(incomingItem.quantity)
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 20) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid quantity for product ${product.id}`
      })
    }

    const selectedSize = String(incomingItem.selectedSize || '').trim()
    if (!selectedSize || !product.sizes.includes(selectedSize as 'S' | 'M' | 'L')) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid size for product ${product.id}`
      })
    }

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity,
      selectedSize
    }
  })

  const serverTotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const supabase = getSupabaseAdmin(event)
  const { data: nextOrderNumber, error: nextOrderNumberError } = await supabase.rpc('next_order_number')

  if (nextOrderNumberError || !Number.isFinite(Number(nextOrderNumber))) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Order number generator is not configured'
    })
  }

  const orderNumber = Number(nextOrderNumber)
  const orderId = `OSF-${String(orderNumber).padStart(6, '0')}`
  const nowIso = new Date().toISOString()
  const trackToken = createOrderTrackToken(
    config.orderTrackSecret || config.adminKey || 'osf-order-track-secret',
    orderId,
    customerPhone
  )

  const inventoryItems = normalizedItems.map((item) => ({
    productId: item.id,
    size: String(item.selectedSize || ''),
    quantity: item.quantity
  }))

  await reserveInventory(event, inventoryItems, {
    actor: 'system',
    source: 'checkout',
    reason: `reserve on order create ${orderId}`
  })

  try {
    await saveOrder(event, {
      id: orderId,
      createdAt: nowIso,
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail || undefined,
        address: customerAddress,
        comment: customerComment || undefined
      },
      items: normalizedItems,
      total: serverTotal,
      payment: {
        method: paymentMethod,
        status: paymentStatus
      },
      status: 'new',
      source: 'web',
      notifications: {
        telegramSent: false,
        emailSent: false
      },
      statusHistory: [
        {
          status: 'new',
          changedAt: nowIso,
          note: 'Order created from checkout',
          actor: 'system'
        }
      ]
    })
  } catch (error) {
    // Roll back stock if order persistence fails.
    await restoreInventory(event, inventoryItems, {
      actor: 'system',
      source: 'checkout',
      reason: `rollback reserve ${orderId}`
    })
    throw error
  }

  let telegramSent = false
  let emailSent = false
  const warnings: string[] = []
  let stripeCheckoutUrl = ''

  if (paymentMethod === 'card_online') {
    const siteUrl = getSiteUrl(event)
    const stripe = getStripeClient(event)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: orderId,
      metadata: {
        order_id: orderId
      },
      success_url: `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&trackToken=${encodeURIComponent(trackToken)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?paymentCanceled=1&orderId=${encodeURIComponent(orderId)}`,
      line_items: normalizedItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'mdl',
          product_data: {
            name: `${item.title} [${String(item.selectedSize || '-')}]`
          },
          unit_amount: Math.max(1, Math.round(item.price * 100))
        }
      }))
    })

    stripeCheckoutUrl = String(session.url || '').trim()
    if (!stripeCheckoutUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Stripe checkout URL is empty'
      })
    }
  }

  if (config.telegramBotToken && config.telegramChatId) {
    const telegramMessage = `
🧾 Новый заказ

ID: ${orderId}

👤 Клиент:
Имя: ${customerName}
Телефон: ${customerPhone}
Email: ${customerEmail || '-'}
Адрес: ${customerAddress}
Комментарий: ${customerComment || '-'}
Оплата: ${paymentMethodLabelRu(paymentMethod)}

📦 Товары:
${normalizedItems
  .map(
    (item, index) =>
      `${index + 1}. ${item.title} [${item.selectedSize}] ×${item.quantity} = ${item.price * item.quantity} MDL`
  )
  .join('\n')}

💰 Итого: ${serverTotal} MDL
  `

    try {
      await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
        method: 'POST',
        body: {
          chat_id: config.telegramChatId,
          text: telegramMessage
        }
      })
      telegramSent = true
    } catch (error) {
      warnings.push(`Telegram notification failed: ${String(error)}`)
    }
  } else {
    warnings.push('Telegram config is missing. Notification skipped.')
  }

  if (config.resendApiKey && config.orderEmailTo && config.orderEmailFrom) {
    try {
      const resend = new Resend(config.resendApiKey)
      const emailResult = await resend.emails.send({
        from: config.orderEmailFrom,
        to: [config.orderEmailTo],
        subject: `New order ${orderId}`,
        html: `
      <h2>New order ${orderId}</h2>
      <p><b>Name:</b> ${customerName}</p>
      <p><b>Phone:</b> ${customerPhone}</p>
      <p><b>Email:</b> ${customerEmail || '-'}</p>
      <p><b>Address:</b> ${customerAddress}</p>
      <p><b>Comment:</b> ${customerComment || '-'}</p>
      <p><b>Payment:</b> ${paymentMethodLabelRu(paymentMethod)}</p>

      <h3>Items:</h3>
      ${normalizedItems
        .map(
          (item) =>
            `<p>${item.title} [${item.selectedSize}] ×${item.quantity} = ${item.price * item.quantity} MDL</p>`
        )
        .join('')}

      <h2>Total: ${serverTotal} MDL</h2>
    `,
        text: `
New order ${orderId}

Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail || '-'}
Address: ${customerAddress}
Comment: ${customerComment || '-'}
Payment: ${paymentMethodLabelRu(paymentMethod)}

Items:
${normalizedItems
  .map(
    (item, index) =>
      `${index + 1}. ${item.title} [${item.selectedSize}] ×${item.quantity} = ${item.price * item.quantity} MDL`
  )
  .join('\n')}

Total: ${serverTotal} MDL
    `
      })

      if (emailResult.error) {
        warnings.push(`Email notification failed: ${emailResult.error.message || 'unknown error'}`)
      } else {
        emailSent = true
      }
    } catch (error) {
      warnings.push(`Email notification failed: ${String(error)}`)
    }
  } else {
    warnings.push('Email config is missing. Notification skipped.')
  }

  try {
    await supabase
      .from('orders')
      .update({
        telegram_sent: telegramSent,
        email_sent: emailSent
      })
      .eq('id', orderId)
  } catch {
    warnings.push('Order notification status update failed.')
  }

  return {
    success: true,
    orderId,
    trackToken,
    total: serverTotal,
    payment: {
      method: paymentMethod,
      status: paymentStatus,
      checkoutUrl: stripeCheckoutUrl || undefined
    },
    receipt: {
      orderId,
      createdAt: nowIso,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      paymentStatus,
      items: normalizedItems.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        price: item.price,
        lineTotal: item.price * item.quantity
      })),
      total: serverTotal
    },
    notifications: {
      telegramSent,
      emailSent
    },
    warnings
  }
})
