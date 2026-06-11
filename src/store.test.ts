import { beforeEach, describe, expect, it } from 'vitest'
import {
  calculateSubtotal,
  orderStatusLabel,
  paymentLabel,
} from './utils/store'

describe('store helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('calculates subtotal from cart and products', () => {
    const total = calculateSubtotal(
      [{ productId: 'a', quantity: 2 }],
      [{ id: 'a', slug: 'a', name: 'A', subtitle: '', price: 1000, grade: 'Lớp 6', period: 'X', type: 'Vua', stock: 1, image: '', description: '', features: [], characterIds: [], arEnabled: true }],
    )

    expect(total).toBe(2000)
  })

  it('maps payment and order status labels', () => {
    expect(paymentLabel('momo')).toBe('PayOS / QR')
    expect(orderStatusLabel('pending')).toBe('Chờ tạo link')
    expect(orderStatusLabel('payment_link_created')).toBe('Chờ thanh toán')
  })
})
