import { createError, readBody } from 'h3'
import { Resend } from 'resend'
import { saveOrder } from '../utils/order-storage'
import { getSupabaseAdmin } from '../utils/supabase-admin'
import { assertRateLimit } from '../utils/rate-limit'
import { reserveInventory, restoreInventory } from '../utils/inventory'
import { createOrderTrackToken } from '../utils/order-track-token'
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
  items: OrderItem[]
  total: number
}

const catalogById = new Map(
  getProducts('ru').map((product) => [
    product.id,
    {
      id: product.id,
      title: product.title,
      price: product.price,
      sizes: product.sizes
    }
  ])
)

export default defineEventHandler(async (event) => {
  assertRateLimit(event, {
    namespace: 'create-order',
    limit: 6,
    windowMs: 60 * 1000
  })

  const config = useRuntimeConfig(event)
  const body = await readBody<OrderPayload>(event)

  const { customer, items } = body

  if (!customer?.name || !customer?.phone || !customer?.address) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid customer data'
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

  const inventoryItems = normalizedItems.map((item) => ({
    productId: item.id,
    size: String(item.selectedSize || ''),
    quantity: item.quantity
  }))

  await reserveInventory(event, inventoryItems)

  try {
    await saveOrder(event, {
      id: orderId,
      createdAt: nowIso,
      customer,
      items: normalizedItems,
      total: serverTotal,
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
    await restoreInventory(event, inventoryItems)
    throw error
  }

  let telegramSent = false
  let emailSent = false
  const warnings: string[] = []

  if (config.telegramBotToken && config.telegramChatId) {
    const telegramMessage = `
🧾 Новый заказ

ID: ${orderId}

👤 Клиент:
Имя: ${customer.name}
Телефон: ${customer.phone}
Email: ${customer.email || '-'}
Адрес: ${customer.address}
Комментарий: ${customer.comment || '-'}

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
      <p><b>Name:</b> ${customer.name}</p>
      <p><b>Phone:</b> ${customer.phone}</p>
      <p><b>Email:</b> ${customer.email || '-'}</p>
      <p><b>Address:</b> ${customer.address}</p>
      <p><b>Comment:</b> ${customer.comment || '-'}</p>

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

Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || '-'}
Address: ${customer.address}
Comment: ${customer.comment || '-'}

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
    trackToken: createOrderTrackToken(
      config.orderTrackSecret || config.adminKey || 'osf-order-track-secret',
      orderId,
      customer.phone
    ),
    total: serverTotal,
    notifications: {
      telegramSent,
      emailSent
    },
    warnings
  }
})
