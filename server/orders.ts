import crypto from 'node:crypto'
import { products } from '../src/data/mockData.js'
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
import { createPaymentLink, generateOrderCode } from './payos.js'

const SHIPPING_FEE = 30000

function createId() {
  return crypto.randomUUID()
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
  return products
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

  const { items, subtotal, shipping, total } = resolveCartItems(input.cart, products)
  if (!items.length) {
    throw new Error('Không tìm thấy sản phẩm hợp lệ trong giỏ hàng.')
  }

  const id = createId()
  const orderCode = generateOrderCode()

  let paymentLinkId: string | null = null
  let checkoutUrl: string | null = null
  let qrCode: string | null = null
  let status: OrderStatus = 'pending'

  if (input.paymentMethod === 'cod') {
    status = 'processing'
  } else if (input.paymentMethod === 'bank') {
    status = 'pending'
  } else {
    const payment = await createPaymentLink({
      orderCode,
      customerName: input.customerName,
      email: input.email,
      address: input.address,
      paymentMethod: input.paymentMethod,
      total,
      items: items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    })

    paymentLinkId = payment.paymentLinkId
    checkoutUrl = payment.checkoutUrl
    qrCode = payment.qrCode
    status = payment.status
  }

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
      paymentLinkId,
      checkoutUrl,
      qrCode,
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
      { label: 'Đơn chờ xác nhận', value: String(pendingOrders), change: 'PayOS / COD / chuyển khoản' },
      { label: 'Lượt quét AR', value: '2,481', change: 'Dữ liệu mock' },
    ],
    orders,
  }
}
