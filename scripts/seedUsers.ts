import 'dotenv/config'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { products as catalogProducts } from '../src/data/mockData.js'
import type { OrderItem, OrderStatus, PaymentMethod, UserRole } from '../src/types/app.js'

type StoredUser = {
  id: string
  fullName: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

type StoredOrder = {
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

type StoredOrderItem = OrderItem & { orderId: string }

type Store = {
  users: StoredUser[]
  orders: StoredOrder[]
  orderItems: StoredOrderItem[]
  webhookEvents: unknown[]
}

const SHIPPING_FEE = 30000
const TPBANK_BIN = '970423'
const TPBANK_ACCOUNT_NO = '00000802077'
const TPBANK_NAME = 'TPBank'

const databaseFile =
  process.env.JSON_DB_PATH ?? path.join(process.cwd(), 'data', 'db.json')

const seededAccounts: Array<{
  fullName: string
  email: string
  password: string
  comboGrade: 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9'
  status: OrderStatus
  daysAgo: number
  quantity: number
  city: string
}> = [
  { fullName: 'Nguyễn Minh Anh', email: 'minhanh@example.com', password: 'password123', comboGrade: 'Lớp 6', status: 'paid', daysAgo: 1, quantity: 1, city: 'Hà Nội' },
  { fullName: 'Trần Quốc Bảo', email: 'quocbao@example.com', password: 'password123', comboGrade: 'Lớp 6', status: 'paid', daysAgo: 2, quantity: 2, city: 'TP. Hồ Chí Minh' },
  { fullName: 'Lê Khánh Chi', email: 'khanhchi@example.com', password: 'password123', comboGrade: 'Lớp 6', status: 'paid', daysAgo: 3, quantity: 1, city: 'Đà Nẵng' },
  { fullName: 'Phạm Hoàng Dũng', email: 'hoangdung@example.com', password: 'password123', comboGrade: 'Lớp 7', status: 'paid', daysAgo: 4, quantity: 1, city: 'Hải Phòng' },
  { fullName: 'Hoàng Mai Linh', email: 'mailinh@example.com', password: 'password123', comboGrade: 'Lớp 7', status: 'paid', daysAgo: 5, quantity: 1, city: 'Cần Thơ' },
  { fullName: 'Vũ Đức Phát', email: 'ducphat@example.com', password: 'password123', comboGrade: 'Lớp 8', status: 'paid', daysAgo: 6, quantity: 1, city: 'Huế' },
  { fullName: 'Đỗ Thanh Hà', email: 'thanhha@example.com', password: 'password123', comboGrade: 'Lớp 8', status: 'paid', daysAgo: 7, quantity: 2, city: 'Bắc Ninh' },
  { fullName: 'Bùi Tuấn Kiệt', email: 'tuankiet@example.com', password: 'password123', comboGrade: 'Lớp 9', status: 'paid', daysAgo: 8, quantity: 1, city: 'Nghệ An' },
  { fullName: 'Ngô Phương Thảo', email: 'phuongthao@example.com', password: 'password123', comboGrade: 'Lớp 6', status: 'pending', daysAgo: 0, quantity: 1, city: 'Hà Nội' },
  { fullName: 'Đinh Gia Hưng', email: 'giahung@example.com', password: 'password123', comboGrade: 'Lớp 6', status: 'pending', daysAgo: 0, quantity: 1, city: 'TP. Hồ Chí Minh' },
  { fullName: 'Lý Bảo Trân', email: 'baotran@example.com', password: 'password123', comboGrade: 'Lớp 7', status: 'completed', daysAgo: 12, quantity: 1, city: 'Đà Lạt' },
  { fullName: 'Trương Anh Khoa', email: 'anhkhoa@example.com', password: 'password123', comboGrade: 'Lớp 9', status: 'completed', daysAgo: 15, quantity: 1, city: 'Vũng Tàu' },
  { fullName: 'Phan Quỳnh Như', email: 'quynhnhu@example.com', password: 'password123', comboGrade: 'Lớp 8', status: 'cancelled', daysAgo: 9, quantity: 1, city: 'Bình Dương' },
  { fullName: 'Nguyễn Thái Sơn', email: 'thaison@example.com', password: 'password123', comboGrade: 'Lớp 6', status: 'paid', daysAgo: 10, quantity: 3, city: 'Quảng Ninh' },
  { fullName: 'Cao Tường Vy', email: 'tuongvy@example.com', password: 'password123', comboGrade: 'Lớp 7', status: 'paid', daysAgo: 11, quantity: 1, city: 'Khánh Hòa' },
]

function createId() {
  return crypto.randomUUID()
}

function generateOrderCode(seedIndex: number) {
  const base = 100000000000 + seedIndex * 173 + Math.floor(Math.random() * 9999)
  return Number(String(base).slice(-12))
}

function buildTransferNote(orderCode: number) {
  return `DH${orderCode}`
}

function buildVietQrImageUrl(orderCode: number, amount: number) {
  const params = new URLSearchParams({ amount: String(amount), addInfo: buildTransferNote(orderCode) })
  return `https://img.vietqr.io/image/${TPBANK_BIN}-${TPBANK_ACCOUNT_NO}-compact2.png?${params.toString()}`
}

function isoDaysAgo(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  date.setUTCHours(9 + (days % 8), 30 + (days % 25), 0, 0)
  return date.toISOString()
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(databaseFile, 'utf8')
    const parsed = JSON.parse(raw) as Partial<Store>
    return {
      users: parsed.users ?? [],
      orders: parsed.orders ?? [],
      orderItems: parsed.orderItems ?? [],
      webhookEvents: parsed.webhookEvents ?? [],
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { users: [], orders: [], orderItems: [], webhookEvents: [] }
    }
    throw error
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(databaseFile), { recursive: true })
  await fs.writeFile(databaseFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

async function main() {
  const store = await readStore()
  const passwordHash = await bcrypt.hash('password123', 10)
  let createdUsers = 0
  let createdOrders = 0

  for (const [index, account] of seededAccounts.entries()) {
    const email = account.email.toLowerCase()
    let user = store.users.find((entry) => entry.email === email)

    if (!user) {
      const createdAt = isoDaysAgo(account.daysAgo + 1)
      user = {
        id: createId(),
        fullName: account.fullName,
        email,
        passwordHash,
        role: 'customer',
        createdAt,
        updatedAt: createdAt,
      }
      store.users.push(user)
      createdUsers += 1
    }

    const product = catalogProducts.find(
      (entry) => entry.grade === account.comboGrade && entry.slug.startsWith('combo-the-bai-'),
    )
    if (!product) {
      console.warn(`Skip ${email}: chưa có combo cho ${account.comboGrade}`)
      continue
    }

    const orderCode = generateOrderCode(index)
    if (store.orders.some((order) => order.orderCode === orderCode)) {
      continue
    }

    const subtotal = product.price * account.quantity
    const shipping = SHIPPING_FEE
    const total = subtotal + shipping
    const createdAt = isoDaysAgo(account.daysAgo)
    const paidAt = account.status === 'paid' || account.status === 'completed' ? createdAt : null
    const cardModeUnlockedAt = paidAt
    const orderId = createId()

    const order: StoredOrder = {
      id: orderId,
      userId: user.id,
      orderCode,
      customerName: user.fullName,
      email: user.email,
      address: `${index + 1} Phố Mẫu, ${account.city}`,
      paymentMethod: 'bank',
      status: account.status,
      subtotal,
      shipping,
      total,
      paymentLinkId: null,
      checkoutUrl: null,
      qrCode: buildVietQrImageUrl(orderCode, total),
      bankName: TPBANK_NAME,
      bankAccountNo: TPBANK_ACCOUNT_NO,
      transferNote: buildTransferNote(orderCode),
      cardModeUnlockedAt,
      provider: 'manual_bank_transfer',
      createdAt,
      updatedAt: paidAt ?? createdAt,
      paidAt,
    }

    const orderItem: StoredOrderItem = {
      id: createId(),
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: account.quantity,
      lineTotal: subtotal,
      orderId,
    }

    store.orders.push(order)
    store.orderItems.push(orderItem)
    createdOrders += 1
  }

  await writeStore(store)

  console.log(`Seed xong: thêm ${createdUsers} user mới và ${createdOrders} đơn hàng.`)
  console.log(`Database: ${databaseFile}`)
  console.log(`Tổng số user: ${store.users.length} | tổng số đơn: ${store.orders.length}`)
  console.log('Mật khẩu mặc định cho mọi user mới: password123')
}

main().catch((error) => {
  console.error('Seed thất bại:', error)
  process.exit(1)
})
