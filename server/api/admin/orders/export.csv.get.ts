import { defineEventHandler, getQuery, setHeader } from 'h3'
import { requireAdminCsrf } from '../../../utils/admin-session'
import { readOrders } from '../../../utils/order-storage'
import { writeAdminAuditLog } from '../../../utils/audit-log'
import { assertRateLimit } from '../../../utils/rate-limit'

const toCsvCell = (value: unknown) => {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export default defineEventHandler(async (event) => {
  const session = requireAdminCsrf(event)
  assertRateLimit(event, {
    namespace: 'admin-orders-export',
    limit: 20,
    windowMs: 60 * 1000
  })

  const query = getQuery(event)
  const status = String(query.status || '').trim() || undefined
  const from = String(query.from || '').trim() || undefined
  const to = String(query.to || '').trim() || undefined
  const orders = await readOrders(event, { status, from, to })

  const headers = [
    'order_id',
    'created_at',
    'status',
    'customer_name',
    'customer_phone',
    'customer_email',
    'customer_address',
    'customer_comment',
    'payment_method',
    'payment_status',
    'total',
    'items_count',
    'items'
  ]

  const rows = orders.map((order) => {
    const itemsSummary = order.items
      .map((item) => `${item.title} [${item.selectedSize || '-'}] x${item.quantity}`)
      .join('; ')

    return [
      order.id,
      order.createdAt,
      order.status,
      order.customer.name,
      order.customer.phone,
      order.customer.email || '',
      order.customer.address,
      order.customer.comment || '',
      order.payment.method,
      order.payment.status,
      order.total,
      order.items.length,
      itemsSummary
    ].map(toCsvCell).join(',')
  })

  const csv = [headers.map(toCsvCell).join(','), ...rows].join('\n')
  const filenameDate = new Date().toISOString().slice(0, 10)

  setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setHeader(event, 'content-disposition', `attachment; filename="orders-${filenameDate}.csv"`)

  await writeAdminAuditLog(event, {
    actor: session.actor,
    action: 'orders.export_csv',
    targetType: 'order',
    details: {
      status: status || 'all',
      from: from || null,
      to: to || null,
      count: orders.length
    }
  })

  return csv
})
