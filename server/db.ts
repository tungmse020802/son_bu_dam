import 'dotenv/config'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { OrderItem, OrderStatus, PaymentMethod, UserRole } from '../src/types/app.js'

export type StoredUser = {
  id: string
  fullName: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type StoredOrder = {
  id: string
  userId: string | null
  orderCode: number
  customerName: string
  email: string
  address: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  subtotal: number
  shipping: number
  total: number
  paymentLinkId: string | null
  checkoutUrl: string | null
  qrCode: string | null
  provider: string
  createdAt: string
  updatedAt: string
  paidAt: string | null
}

export type StoredOrderItem = OrderItem & {
  orderId: string
}

type StoredWebhookEvent = {
  id: string
  orderCode: number
  eventType: string
  payload: unknown
  createdAt: string
}

type JsonStore = {
  users: StoredUser[]
  orders: StoredOrder[]
  orderItems: StoredOrderItem[]
  webhookEvents: StoredWebhookEvent[]
}

const emptyStore: JsonStore = {
  users: [],
  orders: [],
  orderItems: [],
  webhookEvents: [],
}

const databaseFile =
  process.env.JSON_DB_PATH ??
  (process.env.VERCEL === '1'
    ? path.join(os.tmpdir(), 'svam-db.json')
    : path.join(process.cwd(), 'data', 'db.json'))

let writeQueue = Promise.resolve()

function cloneStore(store: JsonStore): JsonStore {
  return JSON.parse(JSON.stringify(store)) as JsonStore
}

async function readStore(): Promise<JsonStore> {
  try {
    const raw = await fs.readFile(databaseFile, 'utf8')
    const parsed = JSON.parse(raw) as Partial<JsonStore>
    return {
      users: parsed.users ?? [],
      orders: parsed.orders ?? [],
      orderItems: parsed.orderItems ?? [],
      webhookEvents: parsed.webhookEvents ?? [],
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return cloneStore(emptyStore)
    }
    throw error
  }
}

async function writeStore(store: JsonStore) {
  await fs.mkdir(path.dirname(databaseFile), { recursive: true })
  await fs.writeFile(databaseFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

async function updateStore<T>(mutate: (store: JsonStore) => T): Promise<T> {
  const run = async () => {
    const store = await readStore()
    const result = mutate(store)
    await writeStore(store)
    return result
  }

  const result = writeQueue.then(run, run)
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

export async function initializeDatabase() {
  await updateStore((store) => {
    store.users ??= []
    store.orders ??= []
    store.orderItems ??= []
    store.webhookEvents ??= []
  })
}

export async function findUserByEmail(email: string) {
  const store = await readStore()
  return store.users.find((user) => user.email === email) ?? null
}

export async function findUserById(id: string) {
  const store = await readStore()
  return store.users.find((user) => user.id === id) ?? null
}

export async function listStoredUsers() {
  const store = await readStore()
  return [...store.users].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

export async function insertUser(input: {
  id: string
  fullName: string
  email: string
  passwordHash: string
  role: UserRole
}) {
  return updateStore((store) => {
    if (store.users.some((user) => user.email === input.email)) {
      throw new Error('Email này đã được sử dụng.')
    }

    const now = new Date().toISOString()
    const user: StoredUser = {
      ...input,
      createdAt: now,
      updatedAt: now,
    }

    store.users.push(user)
    return user
  })
}

export async function insertOrder(order: Omit<StoredOrder, 'createdAt' | 'updatedAt' | 'paidAt' | 'provider'>, items: OrderItem[]) {
  return updateStore((store) => {
    if (store.orders.some((entry) => entry.orderCode === order.orderCode)) {
      throw new Error('Mã đơn hàng đã tồn tại, vui lòng thử lại.')
    }

    const now = new Date().toISOString()
    const storedOrder: StoredOrder = {
      ...order,
      provider: 'payos',
      createdAt: now,
      updatedAt: now,
      paidAt: null,
    }
    const storedItems = items.map((item) => ({ ...item, orderId: order.id }))

    store.orders.push(storedOrder)
    store.orderItems.push(...storedItems)

    return { order: storedOrder, items: storedItems }
  })
}

export async function findOrderByCode(orderCode: number) {
  const store = await readStore()
  const order = store.orders.find((entry) => entry.orderCode === orderCode)
  if (!order) return null

  const items = store.orderItems
    .filter((item) => item.orderId === order.id)
    .sort((left, right) => left.productName.localeCompare(right.productName))

  return { order, items }
}

export async function listStoredOrders(limit?: number) {
  const store = await readStore()
  const orders = [...store.orders].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
  return typeof limit === 'number' ? orders.slice(0, limit) : orders
}

export async function listStoredOrdersByUser(userId: string) {
  const store = await readStore()
  return store.orders
    .filter((order) => order.userId === userId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

export async function updateStoredOrderStatus(
  orderCode: number,
  status: OrderStatus,
  eventType: string,
  payload: unknown,
  eventId: string,
) {
  return updateStore((store) => {
    const order = store.orders.find((entry) => entry.orderCode === orderCode)
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng.')
    }

    const now = new Date().toISOString()
    if (!store.webhookEvents.some((event) => event.orderCode === orderCode && event.eventType === eventType)) {
      store.webhookEvents.push({
        id: eventId,
        orderCode,
        eventType,
        payload,
        createdAt: now,
      })
    }

    order.status = status
    order.updatedAt = now
    if (status === 'paid') {
      order.paidAt = now
    }

    const items = store.orderItems
      .filter((item) => item.orderId === order.id)
      .sort((left, right) => left.productName.localeCompare(right.productName))

    return { order, items }
  })
}
