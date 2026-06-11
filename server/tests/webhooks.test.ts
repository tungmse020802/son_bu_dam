import { describe, expect, it } from 'vitest'
import { createMockWebhook, deriveStatusFromWebhook } from '../payos'

describe('payos helpers', () => {
  it('creates a mock paid webhook', () => {
    const webhook = createMockWebhook(123456)
    expect(webhook.data.orderCode).toBe(123456)
    expect(webhook.data.code).toBe('00')
  })

  it('maps webhook codes to statuses', () => {
    expect(deriveStatusFromWebhook('00', 'pending')).toBe('paid')
    expect(deriveStatusFromWebhook('01', 'pending')).toBe('failed')
    expect(deriveStatusFromWebhook('01', 'paid')).toBe('paid')
  })
})
