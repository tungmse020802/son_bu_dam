import 'dotenv/config'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import type { Lesson, OrderItem, OrderStatus, PaymentMethod, Product, QuizBestTime, UserRole } from '../src/types/app.js'
import { getAdminEmails } from './admin.js'

export type StoredUser = {
  id: string
  fullName: string
  email: string
  passwordHash: string
  role: UserRole
  googleId?: string | null
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
  bankName: string | null
  bankAccountNo: string | null
  transferNote: string | null
  cardModeUnlockedAt: string | null
  provider: string
  createdAt: string
  updatedAt: string
  paidAt: string | null
}

export type StoredOrderItem = OrderItem & {
  orderId: string
}

type StoredPasswordReset = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  usedAt: string | null
  createdAt: string
}

type StoredQuizBestTime = {
  id: string
  userId: string
  quizSlug: string
  quizTitle: string
  bestSeconds: number
  score: number
  questionCount: number
  updatedAt: string
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
  passwordResets: StoredPasswordReset[]
  adminLessons: Lesson[]
  adminProducts: Product[]
  lessonOverrides: Lesson[]
  productOverrides: Product[]
  quizBestTimes: StoredQuizBestTime[]
}

const emptyStore: JsonStore = {
  users: [],
  orders: [],
  orderItems: [],
  webhookEvents: [],
  passwordResets: [],
  adminLessons: [],
  adminProducts: [],
  lessonOverrides: [],
  productOverrides: [],
  quizBestTimes: [],
}
const DEFAULT_ADMIN_FULL_NAME = 'Admin'
const DEFAULT_ADMIN_PASSWORD_HASH = '$2b$10$eqfnMuotx0jHzExNTsziLOySghQlLtriG818Ehy.Jvaf238WQH0M6'

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
  passwordResets: parsed.passwordResets ?? [],
  adminLessons: parsed.adminLessons ?? [],
  adminProducts: parsed.adminProducts ?? [],
  lessonOverrides: parsed.lessonOverrides ?? [],
  productOverrides: parsed.productOverrides ?? [],
  quizBestTimes: parsed.quizBestTimes ?? [],
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
    store.passwordResets ??= []
    store.adminLessons ??= []
    store.adminProducts ??= []
    store.lessonOverrides ??= []
    store.productOverrides ??= []
    store.quizBestTimes ??= []
    // ... phần còn lại giữ nguyên
    // ... phần còn lại giữ nguyên

    if (store.users.some((user) => user.role === 'admin')) {
      return
    }

    const adminEmails = getAdminEmails()
    if (adminEmails.size === 0) {
      return
    }

    const now = new Date().toISOString()
    let foundAdmin = false

    for (const user of store.users) {
      const normalizedEmail = user.email.trim().toLowerCase()
      if (adminEmails.has(normalizedEmail)) {
        foundAdmin = true
        if (user.role !== 'admin') {
          user.role = 'admin'
          user.updatedAt = now
        }
      }
    }

    if (!foundAdmin) {
      const primaryAdminEmail = [...adminEmails][0]
      store.users.push({
        id: randomUUID(),
        fullName: DEFAULT_ADMIN_FULL_NAME,
        email: primaryAdminEmail,
        passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      })
    }
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

export async function insertOrder(order: Omit<StoredOrder, 'createdAt' | 'updatedAt' | 'paidAt' | 'provider' | 'cardModeUnlockedAt'>, items: OrderItem[]) {
  return updateStore((store) => {
    if (store.orders.some((entry) => entry.orderCode === order.orderCode)) {
      throw new Error('Mã đơn hàng đã tồn tại, vui lòng thử lại.')
    }

    const now = new Date().toISOString()
    const storedOrder: StoredOrder = {
      ...order,
      provider: 'manual_bank_transfer',
      createdAt: now,
      updatedAt: now,
      paidAt: null,
      cardModeUnlockedAt: null,
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
    if (status === 'paid' || status === 'completed') {
      order.paidAt = now
      order.cardModeUnlockedAt = order.cardModeUnlockedAt ?? now
    }

    const items = store.orderItems
      .filter((item) => item.orderId === order.id)
      .sort((left, right) => left.productName.localeCompare(right.productName))

    return { order, items }
  })
}


export async function findUserByGoogleId(googleId: string) {
  const store = await readStore()
  return store.users.find((user) => user.googleId === googleId) ?? null
}

export async function linkGoogleId(userId: string, googleId: string) {
  return updateStore((store) => {
    const user = store.users.find((entry) => entry.id === userId)
    if (!user) {
      throw new Error('Không tìm thấy tài khoản.')
    }
    user.googleId = googleId
    user.updatedAt = new Date().toISOString()
    return user
  })
}

export async function insertGoogleUser(input: {
  id: string
  fullName: string
  email: string
  googleId: string
  passwordHash: string
  role: UserRole
}) {
  return updateStore((store) => {
    if (store.users.some((user) => user.email === input.email)) {
      throw new Error('Email này đã được sử dụng.')
    }
    const now = new Date().toISOString()
    const user: StoredUser = { ...input, createdAt: now, updatedAt: now }
    store.users.push(user)
    return user
  })
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  return updateStore((store) => {
    const user = store.users.find((entry) => entry.id === userId)
    if (!user) {
      throw new Error('Không tìm thấy tài khoản.')
    }
    user.passwordHash = passwordHash
    user.updatedAt = new Date().toISOString()
    return user
  })
}

export async function insertPasswordResetToken(input: {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
}) {
  return updateStore((store) => {
    store.passwordResets ??= []
    const record: StoredPasswordReset = { ...input, usedAt: null, createdAt: new Date().toISOString() }
    store.passwordResets.push(record)
    return record
  })
}

export async function findValidPasswordReset(tokenHash: string) {
  const store = await readStore()
  return (
    store.passwordResets?.find(
      (entry) => entry.tokenHash === tokenHash && !entry.usedAt && new Date(entry.expiresAt).getTime() > Date.now(),
    ) ?? null
  )
}

export async function markPasswordResetUsed(id: string) {
  return updateStore((store) => {
    const record = store.passwordResets?.find((entry) => entry.id === id)
    if (record) {
      record.usedAt = new Date().toISOString()
    }
  })
}

export async function deleteStoredUser(userId: string, cascadeOrders: boolean) {
  return updateStore((store) => {
    const userIndex = store.users.findIndex((entry) => entry.id === userId)
    if (userIndex === -1) {
      throw new Error('Không tìm thấy tài khoản.')
    }

    const [removedUser] = store.users.splice(userIndex, 1)

    if (cascadeOrders) {
      // Xóa luôn toàn bộ đơn hàng của tài khoản này -> doanh thu tự động giảm
      // vì getDashboardData() tính lại từ store.orders mỗi lần gọi.
      const orderIdsToRemove = store.orders.filter((order) => order.userId === userId).map((order) => order.id)
      store.orders = store.orders.filter((order) => order.userId !== userId)
      store.orderItems = store.orderItems.filter((item) => !orderIdsToRemove.includes(item.orderId))
    } else {
      // Giữ lại đơn hàng (vẫn tính vào doanh thu), chỉ gỡ liên kết với tài khoản đã xóa.
      store.orders.forEach((order) => {
        if (order.userId === userId) {
          order.userId = null
        }
      })
    }

    return removedUser
  })
}

export async function deleteStoredOrder(orderCode: number) {
  return updateStore((store) => {
    const order = store.orders.find((entry) => entry.orderCode === orderCode)
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng.')
    }

    store.orders = store.orders.filter((entry) => entry.orderCode !== orderCode)
    store.orderItems = store.orderItems.filter((item) => item.orderId !== order.id)
    store.webhookEvents = store.webhookEvents.filter((event) => event.orderCode !== orderCode)

    return order
  })
}

export async function insertAdminLesson(lesson: Lesson) {
  return updateStore((store) => {
    store.adminLessons ??= []
    store.adminLessons.push(lesson)
    return lesson
  })
}

export async function listAdminLessons() {
  const store = await readStore()
  return store.adminLessons ?? []
}

export async function insertAdminProduct(product: Product) {
  return updateStore((store) => {
    store.adminProducts ??= []
    store.adminProducts.push(product)
    return product
  })
}

export async function listAdminProducts() {
  const store = await readStore()
  return store.adminProducts ?? []
}


export async function upsertLessonOverride(lesson: Lesson) {
  return updateStore((store) => {
    store.lessonOverrides ??= []
    const idx = store.lessonOverrides.findIndex((entry) => entry.id === lesson.id)
    if (idx >= 0) store.lessonOverrides[idx] = lesson
    else store.lessonOverrides.push(lesson)
    return lesson
  })
}

export async function listLessonOverrides() {
  const store = await readStore()
  return store.lessonOverrides ?? []
}

export async function updateAdminLesson(id: string, lesson: Lesson) {
  return updateStore((store) => {
    store.adminLessons ??= []
    const idx = store.adminLessons.findIndex((entry) => entry.id === id)
    if (idx === -1) throw new Error('Không tìm thấy bài học trong danh sách bài học do admin thêm.')
    store.adminLessons[idx] = lesson
    return lesson
  })
}

export async function upsertProductOverride(product: Product) {
  return updateStore((store) => {
    store.productOverrides ??= []
    const idx = store.productOverrides.findIndex((entry) => entry.id === product.id)
    if (idx >= 0) store.productOverrides[idx] = product
    else store.productOverrides.push(product)
    return product
  })
}

export async function listProductOverrides() {
  const store = await readStore()
  return store.productOverrides ?? []
}

export async function updateAdminProduct(id: string, product: Product) {
  return updateStore((store) => {
    store.adminProducts ??= []
    const idx = store.adminProducts.findIndex((entry) => entry.id === id)
    if (idx === -1) throw new Error('Không tìm thấy sản phẩm trong danh sách sản phẩm do admin thêm.')
    store.adminProducts[idx] = product
    return product
  })
}

export async function upsertQuizBestTime(input: {
  userId: string
  quizSlug: string
  quizTitle: string
  seconds: number
  score: number
  questionCount: number
}) {
  return updateStore((store) => {
    store.quizBestTimes ??= []
    const existing = store.quizBestTimes.find(
      (entry) => entry.userId === input.userId && entry.quizSlug === input.quizSlug,
    )

    // Chỉ cập nhật khi CHƯA có kỷ lục, hoặc lần này NHANH HƠN kỷ lục cũ.
    if (!existing) {
      const record: StoredQuizBestTime = {
        id: randomUUID(),
        userId: input.userId,
        quizSlug: input.quizSlug,
        quizTitle: input.quizTitle,
        bestSeconds: input.seconds,
        score: input.score,
        questionCount: input.questionCount,
        updatedAt: new Date().toISOString(),
      }
      store.quizBestTimes.push(record)
      return record
    }

    if (input.seconds < existing.bestSeconds) {
      existing.bestSeconds = input.seconds
      existing.score = input.score
      existing.questionCount = input.questionCount
      existing.quizTitle = input.quizTitle
      existing.updatedAt = new Date().toISOString()
    }

    return existing
  })
}

export async function listQuizBestTimesByUser(userId: string) {
  const store = await readStore()
  return (store.quizBestTimes ?? []).filter((entry) => entry.userId === userId)
}