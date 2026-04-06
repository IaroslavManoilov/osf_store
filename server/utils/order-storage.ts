import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export type AdminOrderStatus =
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type AdminOrderHistoryEntry = {
  status: AdminOrderStatus
  changedAt: string
  note?: string
  actor?: string
}

export type AdminOrder = {
  id: string
  createdAt: string
  customer: {
    name: string
    phone: string
    email?: string
    address: string
    comment?: string
  }
  items: Array<{
    id: string
    title: string
    price: number
    quantity: number
    selectedSize?: string
  }>
  total: number
  status: AdminOrderStatus
  source: 'web'
  notifications: {
    telegramSent: boolean
    emailSent: boolean
  }
  statusHistory: AdminOrderHistoryEntry[]
}

const ordersFile = join(process.cwd(), 'server', 'data', 'orders.json')

async function ensureStorage() {
  await mkdir(dirname(ordersFile), { recursive: true })

  try {
    await readFile(ordersFile, 'utf8')
  } catch {
    await writeFile(ordersFile, '[]', 'utf8')
  }
}

export async function readOrders(): Promise<AdminOrder[]> {
  await ensureStorage()

  try {
    const raw = await readFile(ordersFile, 'utf8')
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is AdminOrder => {
        return !!item && typeof item === 'object' && typeof item.id === 'string'
      })
      .map((order) => {
        const normalizedHistory: AdminOrderHistoryEntry[] = Array.isArray(order.statusHistory)
          ? order.statusHistory
              .filter(
                (entry): entry is AdminOrderHistoryEntry =>
                  !!entry &&
                  typeof entry === 'object' &&
                  typeof entry.status === 'string' &&
                  typeof entry.changedAt === 'string'
              )
              .map((entry) => ({
                ...entry,
                actor:
                  typeof entry.actor === 'string' && entry.actor.trim()
                    ? entry.actor.trim()
                    : 'admin'
              }))
          : []

        return {
          ...order,
          statusHistory: normalizedHistory
        }
      })
  } catch {
    return []
  }
}

async function writeOrders(value: AdminOrder[]) {
  await ensureStorage()
  await writeFile(ordersFile, JSON.stringify(value, null, 2), 'utf8')
}

export async function saveOrder(order: AdminOrder) {
  const orders = await readOrders()
  orders.unshift(order)
  await writeOrders(orders)
}

export async function patchOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
  note?: string,
  actor = 'admin'
) {
  const orders = await readOrders()
  const target = orders.find((item) => item.id === orderId)

  if (!target) {
    return null
  }

  target.status = status
  target.statusHistory.unshift({
    status,
    changedAt: new Date().toISOString(),
    note: note?.trim() || undefined,
    actor: actor.trim() || 'admin'
  })

  await writeOrders(orders)
  return target
}
