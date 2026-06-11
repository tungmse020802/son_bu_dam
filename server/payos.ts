import crypto from 'node:crypto'
import PayOS from '@payos/node'
import type { CartItem, OrderDetail, OrderStatus, PaymentMethod, Product } from '../src/types/app.js'

const clientId = process.env.PAYOS_CLIENT_ID
const apiKey = process.env.PAYOS_API_KEY
const checksumKey = process.env.PAYOS_CHECKSUM_KEY
const mockMode = process.env.PAYOS_MOCK === 'true' || !clientId || !apiKey || !checksumKey

if (process.env.PAYOS_MOCK === 'false' && (!clientId || !apiKey || !checksumKey)) {
  throw new Error('PAYOS_CLIENT_ID, PAYOS_API_KEY và PAYOS_CHECKSUM_KEY là bắt buộc khi PAYOS_MOCK=false.')
}

const payos = mockMode
  ? null
  : new PayOS.PayOS({
      clientId,
      apiKey,
      checksumKey,
    })

function statusFromPayos(status: string): OrderStatus {
  if (status === 'PAID') return 'paid'
  if (status === 'CANCELLED') return 'cancelled'
  if (status === 'FAILED') return 'failed'
  if (status === 'EXPIRED') return 'expired'
  if (status === 'PENDING') return 'payment_link_created'
  return 'pending'
}

export function generateOrderCode() {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  return Number(seed.slice(-12))
}

export type CreatePaymentPayload = {
  orderCode: number
  customerName: string
  email: string
  address: string
  paymentMethod: PaymentMethod
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
}

export type PaymentCreationResult = {
  paymentLinkId: string
  checkoutUrl: string
  qrCode: string | null
  status: OrderStatus
}

export async function createPaymentLink(payload: CreatePaymentPayload): Promise<PaymentCreationResult> {
  const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5173'
  const returnUrl = process.env.PAYOS_RETURN_URL ?? `${appBaseUrl}/checkout/success`
  const cancelUrl = process.env.PAYOS_CANCEL_URL ?? `${appBaseUrl}/checkout/cancel`

  if (mockMode || !payos) {
    return {
      paymentLinkId: `mock-${payload.orderCode}`,
      checkoutUrl: `${appBaseUrl}/checkout/success?orderCode=${payload.orderCode}&mock=1`,
      qrCode: null,
      status: payload.paymentMethod === 'cod' ? 'processing' : 'payment_link_created',
    }
  }

  const response = await payos.paymentRequests.create({
    orderCode: payload.orderCode,
    amount: payload.total,
    description: `SVAM ${payload.orderCode}`.slice(0, 25),
    cancelUrl,
    returnUrl: `${returnUrl}?orderCode=${payload.orderCode}`,
    buyerName: payload.customerName,
    buyerEmail: payload.email,
    buyerAddress: payload.address,
    items: payload.items,
  })

  return {
    paymentLinkId: response.paymentLinkId,
    checkoutUrl: response.checkoutUrl,
    qrCode: response.qrCode,
    status: statusFromPayos(response.status),
  }
}

export async function verifyWebhookPayload(payload: unknown) {
  if (mockMode || !payos) {
    const body = payload as { data?: { orderCode?: number; code?: string } }
    return {
      orderCode: body.data?.orderCode ?? 0,
      code: body.data?.code ?? '00',
      eventType: body.data?.code === '00' ? 'payment.paid' : 'payment.updated',
      raw: payload,
    }
  }

  const verified = await payos.webhooks.verify(payload as Parameters<typeof payos.webhooks.verify>[0])
  return {
    orderCode: verified.orderCode,
    code: verified.code,
    eventType: verified.code === '00' ? 'payment.paid' : 'payment.updated',
    raw: payload,
  }
}

export function deriveStatusFromWebhook(code: string, currentStatus: OrderStatus): OrderStatus {
  if (code === '00') return 'paid'
  if (currentStatus === 'paid') return currentStatus
  return 'failed'
}

export function createMockWebhook(orderCode: number) {
  return {
    code: '00',
    desc: 'success',
    success: true,
    data: {
      orderCode,
      amount: 0,
      description: `SVAM ${orderCode}`,
      accountNumber: '123456789',
      reference: crypto.randomUUID(),
      transactionDateTime: new Date().toISOString(),
      currency: 'VND',
      paymentLinkId: `mock-${orderCode}`,
      code: '00',
      desc: 'success',
    },
    signature: 'mock-signature',
  }
}
