import { createError, readBody } from 'h3'
import { Resend } from 'resend'
import { saveOrder } from '../utils/order-storage'

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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<OrderPayload>(event)

  const { customer, items, total } = body

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

  if (!config.telegramBotToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Telegram bot token is not configured'
    })
  }

  if (!config.telegramChatId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Telegram chat id is not configured'
    })
  }

  if (!config.resendApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Resend API key is not configured'
    })
  }

  if (!config.orderEmailTo) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Order email recipient is not configured'
    })
  }

  if (!config.orderEmailFrom) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Order email sender is not configured'
    })
  }

  const orderId = `OSF-${Date.now()}`

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
${items
  .map(
    (item, index) =>
      `${index + 1}. ${item.title} ×${item.quantity} = ${item.price * item.quantity} MDL`
  )
  .join('\n')}

💰 Итого: ${total} MDL
  `

  await $fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: 'POST',
    body: {
      chat_id: config.telegramChatId,
      text: telegramMessage
    }
  })

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
      ${items
        .map(
          (item) =>
            `<p>${item.title} ×${item.quantity} = ${item.price * item.quantity} MDL</p>`
        )
        .join('')}

      <h2>Total: ${total} MDL</h2>
    `,
    text: `
New order ${orderId}

Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email || '-'}
Address: ${customer.address}
Comment: ${customer.comment || '-'}

Items:
${items
  .map(
    (item, index) =>
      `${index + 1}. ${item.title} ×${item.quantity} = ${item.price * item.quantity} MDL`
  )
  .join('\n')}

Total: ${total} MDL
    `
  })

  console.log('EMAIL RESULT:', emailResult)

  if (emailResult.error) {
    throw createError({
      statusCode: 502,
      statusMessage: emailResult.error.message || 'Email send failed'
    })
  }

  await saveOrder({
    id: orderId,
    createdAt: new Date().toISOString(),
    customer,
    items,
    total,
    status: 'new',
    source: 'web',
    notifications: {
      telegramSent: true,
      emailSent: true
    },
    statusHistory: [
      {
        status: 'new',
        changedAt: new Date().toISOString(),
        note: 'Order created from checkout',
        actor: 'system'
      }
    ]
  })

  return {
    success: true,
    orderId
  }
})
