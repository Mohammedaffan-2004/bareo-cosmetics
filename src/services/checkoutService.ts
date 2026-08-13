// Checkout & payment service — simulates a payment gateway round-trip.

import { DELIVERY_OPTIONS } from '@/constants'
import { mockError, mockFetch } from './mockApi'

export type DeliveryOption = typeof DELIVERY_OPTIONS[number]

export type PaymentOutcome = 'success' | 'failed' | 'cancelled'

export interface PaymentResult {
  outcome: PaymentOutcome
  referenceId: string
  message: string
}

export interface PaymentRequest {
  method: string
  amount: number
  // In a real integration you would pass a token / card object here.
  detail?: Record<string, string>
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
function referenceId(): string {
  let out = ''
  for (let i = 0; i < 12; i++) out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
  return out
}

export function checkoutService() {
  return {
    async getDeliveryOptions(): Promise<DeliveryOption[]> {
      return mockFetch(DELIVERY_OPTIONS).then((r) => r.data)
    },

    /**
     * Simulate the gateway. Passing a forced outcome is useful for demos
     * ("simulate failure" button). Default behaviour is a weighted random.
     */
    async processPayment(req: PaymentRequest, forced?: PaymentOutcome): Promise<PaymentResult> {
      if (req.amount <= 0) mockError('Invalid amount', 422)
      await mockFetch({ ok: true }, { delay: 1800 })

      const roll = forced ?? (Math.random() < 0.85 ? 'success' : Math.random() < 0.6 ? 'failed' : 'cancelled')
      const results: Record<PaymentOutcome, PaymentResult> = {
        success: { outcome: 'success', referenceId: `GATE-${referenceId()}`, message: 'Payment successful' },
        failed: { outcome: 'failed', referenceId: '', message: 'Transaction declined by your bank' },
        cancelled: { outcome: 'cancelled', referenceId: '', message: 'Payment cancelled by user' },
      }
      return results[roll]
    },
  }
}
