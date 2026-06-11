import type { CartItem, OrderDetail, OrderStatus, PaymentMethod, Product } from '../types/app'

const CART_KEY = 'svam-cart'
const ORDERS_KEY = 'svam-orders'

export function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function saveCart(cart: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function loadStoredOrders(): OrderDetail[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    return raw ? (JSON.parse(raw) as OrderDetail[]) : []
  } catch {
    return []
  }
}

export function getStoredOrder(orderCode: string | number) {
  const numericOrderCode = Number(orderCode)
  return loadStoredOrders().find((order) => order.orderCode === numericOrderCode) ?? null
}

export function saveStoredOrder(order: OrderDetail) {
  const orders = loadStoredOrders()
  const next = [order, ...orders.filter((entry) => entry.orderCode !== order.orderCode)]
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next.slice(0, 50)))
}

function clampQuantity(quantity: number, stock?: number) {
  if (quantity <= 0) return 0
  if (typeof stock === 'number') {
    return Math.min(quantity, Math.max(stock, 0))
  }
  return quantity
}

export function addToCart(cart: CartItem[], productId: string, stock?: number) {
  if (typeof stock === 'number' && stock <= 0) {
    return cart
  }

  const existing = cart.find((item) => item.productId === productId)
  if (existing) {
    return cart.map((item) =>
      item.productId === productId
        ? { ...item, quantity: clampQuantity(item.quantity + 1, stock) }
        : item,
    )
  }

  return [...cart, { productId, quantity: clampQuantity(1, stock) }].filter((item) => item.quantity > 0)
}

export function updateQuantity(cart: CartItem[], productId: string, quantity: number, stock?: number) {
  const nextQuantity = clampQuantity(quantity, stock)
  if (nextQuantity <= 0) {
    return cart.filter((item) => item.productId !== productId)
  }
  return cart.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
}

export function syncCartWithCatalog(cart: CartItem[], products: Product[]) {
  return cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      if (!product || product.stock <= 0) {
        return null
      }

      return {
        ...item,
        quantity: clampQuantity(item.quantity, product.stock),
      }
    })
    .filter((item): item is CartItem => Boolean(item && item.quantity > 0))
}

export function calculateSubtotal(cart: CartItem[], products: Product[]) {
  return cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId)
    return total + (product?.price ?? 0) * item.quantity
  }, 0)
}

export function paymentLabel(method: PaymentMethod) {
  if (method === 'cod') return 'COD'
  if (method === 'bank') return 'Chuyển khoản'
  return 'PayOS / QR'
}

export function orderStatusLabel(status: OrderStatus) {
  if (status === 'paid') return 'Đã thanh toán'
  if (status === 'processing') return 'Đang xử lý'
  if (status === 'payment_link_created') return 'Chờ thanh toán'
  if (status === 'cancelled') return 'Đã hủy'
  if (status === 'failed') return 'Thất bại'
  if (status === 'expired') return 'Hết hạn'
  if (status === 'completed') return 'Hoàn tất'
  return 'Chờ tạo link'
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}
