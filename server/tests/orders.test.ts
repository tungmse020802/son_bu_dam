import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderItem, OrderStatus, PaymentMethod } from '../../src/types/app'

const mockInsertOrder = vi.fn()
const mockCreatePaymentLink = vi.fn(async () => ({
  paymentLinkId: 'mock-123',
  checkoutUrl: 'http://localhost:5173/checkout/success?orderCode=123',
  qrCode: null,
  status: 'pending',
}))

vi.mock('../db', () => ({
  findOrderByCode: vi.fn(),
  insertOrder: mockInsertOrder,
  listStoredOrders: vi.fn(async () => []),
  listStoredOrdersByUser: vi.fn(async () => []),
  updateStoredOrderStatus: vi.fn(),
}))

vi.mock('../payos', () => ({
  createPaymentLink: mockCreatePaymentLink,
  generateOrderCode: vi.fn(() => 123456),
}))

function mockStoredOrder(input: {
  userId?: string | null
  paymentMethod: PaymentMethod
  status: OrderStatus
  items: OrderItem[]
}) {
  mockInsertOrder.mockImplementationOnce(async (order, items) => ({
    order: {
      ...order,
      provider: 'payos',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt: null,
      userId: input.userId ?? order.userId,
      paymentMethod: input.paymentMethod,
      status: input.status,
    },
    items: items.map((item: OrderItem) => ({ ...item, orderId: order.id })),
  }))
}

describe('orders service', () => {
  beforeEach(() => {
    mockInsertOrder.mockReset()
    mockCreatePaymentLink.mockClear()
  })

  it('rejects empty carts', async () => {
    const { createOrder } = await import('../orders')
    await expect(
      createOrder({
        customerName: 'A',
        email: 'a@example.com',
        address: 'HN',
        paymentMethod: 'momo',
        cart: [],
      }),
    ).rejects.toThrow('Giỏ hàng đang trống.')
  })

  it('builds line items from catalog', async () => {
    const { resolveCartItems } = await import('../orders')
    const { items, subtotal, shipping, total } = resolveCartItems([{ productId: 'combo-lop-6', quantity: 1 }], [
      {
        id: 'combo-lop-6',
        slug: 'combo',
        name: 'Combo',
        subtitle: '',
        price: 299000,
        grade: 'Lớp 6',
        period: 'Tổng hợp',
        type: 'Anh hùng',
        stock: 10,
        image: '',
        description: '',
        features: [],
        characterIds: [],
        arEnabled: true,
      },
    ])

    expect(items).toHaveLength(1)
    expect(subtotal).toBe(299000)
    expect(shipping).toBe(30000)
    expect(total).toBe(329000)
  })

  it('rejects cart items that exceed stock', async () => {
    const { resolveCartItems } = await import('../orders')

    expect(() =>
      resolveCartItems([{ productId: 'combo-lop-6', quantity: 5 }], [
        {
          id: 'combo-lop-6',
          slug: 'combo',
          name: 'Combo',
          subtitle: '',
          price: 299000,
          grade: 'Lớp 6',
          period: 'Tổng hợp',
          type: 'Anh hùng',
          stock: 2,
          image: '',
          description: '',
          features: [],
          characterIds: [],
          arEnabled: true,
        },
      ]),
    ).toThrow('Combo chỉ còn 2 sản phẩm.')
  })

  it('rejects unsupported payment methods', async () => {
    const { createOrder } = await import('../orders')
    await expect(
      createOrder({
        customerName: 'A',
        email: 'a@example.com',
        address: 'HN',
        paymentMethod: 'cod',
        cart: [{ productId: 'combo-lop-6', quantity: 1 }],
      }),
    ).rejects.toThrow('Shop hiện chỉ hỗ trợ chuyển khoản VietQR TPBank.')

    expect(mockCreatePaymentLink).not.toHaveBeenCalled()
  })

  it('stores user id when checkout comes from an authenticated account', async () => {
    mockStoredOrder({ userId: 'user-1', paymentMethod: 'bank', status: 'pending', items: [] })

    const { createOrder } = await import('../orders')
    const order = await createOrder(
      {
        customerName: 'A',
        email: 'a@example.com',
        address: 'HN',
        paymentMethod: 'bank',
        cart: [{ productId: 'combo-lop-6', quantity: 1 }],
      },
      'user-1',
    )

    expect(mockInsertOrder).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }), expect.any(Array))
    expect(order.userId).toBe('user-1')
  })
})
