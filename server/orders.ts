import crypto from 'node:crypto'
import { getShowcaseProducts, products } from '../src/data/mockData.js'
import type {
  CartItem,
  CheckoutRequest,
  DashboardData,
  Order,
  OrderDetail,
  OrderItem,
  OrderStatus,
  Product,
} from '../src/types/app.js'
import {
  findOrderByCode,
  insertOrder,
  listStoredOrders,
  listStoredOrdersByUser,
  updateStoredOrderStatus,
  type StoredOrder,
  type StoredOrderItem,
} from './db.js'

const SHIPPING_FEE = 30000
const TPBANK_BIN = '970423'
const TPBANK_NAME = 'TPBank'
const TPBANK_ACCOUNT_NO = '00000802077'

function createId() {
  return crypto.randomUUID()
}

function generateOrderCode() {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  return Number(seed.slice(-12))
}

function buildTransferNote(orderCode: number) {
  return `DH${orderCode}`
}

function buildVietQrImageUrl(orderCode: number, amount: number) {
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: buildTransferNote(orderCode),
  })

  return `https://img.vietqr.io/image/${TPBANK_BIN}-${TPBANK_ACCOUNT_NO}-compact2.png?${params.toString()}`
}

function formatTimestamp(date: string | Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

function mapStoredOrder(row: StoredOrder): Order {
  return {
    id: row.id,
    userId: row.userId,
    orderCode: row.orderCode,
    customerName: row.customerName,
    email: row.email,
    address: row.address,
    paymentMethod: row.paymentMethod,
    status: row.status,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    createdAt: formatTimestamp(row.createdAt),
    checkoutUrl: row.checkoutUrl,
    paymentLinkId: row.paymentLinkId,
    qrCode: row.qrCode,
    bankName: row.bankName ?? null,
    bankAccountNo: row.bankAccountNo ?? null,
    transferNote: row.transferNote ?? null,
    cardModeUnlockedAt: row.cardModeUnlockedAt ? formatTimestamp(row.cardModeUnlockedAt) : null,
  }
}

function mapStoredItems(items: StoredOrderItem[]): OrderItem[] {
  return items.map(({ orderId: _orderId, ...item }) => item)
}

function mapStoredOrderDetail(record: { order: StoredOrder; items: StoredOrderItem[] }): OrderDetail {
  return {
    ...mapStoredOrder(record.order),
    items: mapStoredItems(record.items),
  }
}

export function getCatalogProducts() {
  return getShowcaseProducts(products)
}

export function resolveCartItems(cart: CartItem[], catalog: Product[]) {
  const items: OrderItem[] = []

  for (const item of cart) {
    const product = catalog.find((entry) => entry.id === item.productId)
    if (!product) {
      throw new Error(`Sản phẩm ${item.productId} không còn tồn tại.`)
    }

    if (item.quantity <= 0) {
      throw new Error(`Số lượng của ${product.name} không hợp lệ.`)
    }

    if (item.quantity > product.stock) {
      throw new Error(`${product.name} chỉ còn ${product.stock} sản phẩm.`)
    }

    items.push({
      id: createId(),
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    })
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const shipping = items.length > 0 ? SHIPPING_FEE : 0
  return { items, subtotal, shipping, total: subtotal + shipping }
}

export async function createOrder(input: CheckoutRequest, userId?: string | null): Promise<OrderDetail> {
  if (!input.customerName || !input.email || !input.address) {
    throw new Error('Thiếu thông tin người nhận hàng.')
  }

  if (!input.cart.length) {
    throw new Error('Giỏ hàng đang trống.')
  }

  if (input.paymentMethod !== 'bank') {
    throw new Error('Shop hiện chỉ hỗ trợ chuyển khoản VietQR TPBank.')
  }

  const { items, subtotal, shipping, total } = resolveCartItems(input.cart, products)
  if (!items.length) {
    throw new Error('Không tìm thấy sản phẩm hợp lệ trong giỏ hàng.')
  }

  const id = createId()
  const orderCode = generateOrderCode()
  const transferNote = buildTransferNote(orderCode)
  const qrCode = buildVietQrImageUrl(orderCode, total)
  const status: OrderStatus = 'pending'

  const order = await insertOrder(
    {
      id,
      userId: userId ?? null,
      orderCode,
      customerName: input.customerName,
      email: input.email,
      address: input.address,
      paymentMethod: input.paymentMethod,
      status,
      subtotal,
      shipping,
      total,
      paymentLinkId: null,
      checkoutUrl: null,
      qrCode,
      bankName: TPBANK_NAME,
      bankAccountNo: TPBANK_ACCOUNT_NO,
      transferNote,
    },
    items,
  )

  return mapStoredOrderDetail(order)
}

export async function getOrderByCode(orderCode: number): Promise<OrderDetail> {
  const record = await findOrderByCode(orderCode)
  if (!record) {
    throw new Error('Không tìm thấy đơn hàng.')
  }

  return mapStoredOrderDetail(record)
}

export async function listOrders(limit = 10) {
  const orders = await listStoredOrders(limit)
  return orders.map(mapStoredOrder)
}

export async function listAllOrders() {
  const orders = await listStoredOrders()
  return orders.map(mapStoredOrder)
}

export async function listOrdersByUser(userId: string) {
  const orders = await listStoredOrdersByUser(userId)
  return orders.map(mapStoredOrder)
}

export async function updateOrderStatus(orderCode: number, status: OrderStatus, eventType: string, payload: unknown) {
  const record = await updateStoredOrderStatus(orderCode, status, eventType, payload, createId())
  return mapStoredOrderDetail(record)
}

export async function getDashboardData(): Promise<DashboardData> {
  const allOrders = await listAllOrders()
  const orders = allOrders.slice(0, 8)
  const paidRevenue = allOrders.filter((order) => order.status === 'paid').reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = allOrders.filter((order) => order.status === 'pending' || order.status === 'payment_link_created' || order.status === 'processing').length

  return {
    metrics: [
      { label: 'Doanh thu đơn đã thanh toán', value: `${(paidRevenue / 1000000).toFixed(1)}M`, change: `${allOrders.filter((order) => order.status === 'paid').length} đơn` },
      { label: 'Tổng đơn hàng', value: String(allOrders.length), change: 'Toàn bộ hệ thống' },
      { label: 'Đơn chờ xác nhận', value: String(pendingOrders), change: 'Chuyển khoản thủ công qua dashboard' },
      { label: 'Lượt làm quiz', value: '2,481', change: 'Dữ liệu mock' },
    ],
    orders,
  }
}
