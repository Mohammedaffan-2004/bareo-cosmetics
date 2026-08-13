// Mock orders for the customer order history + admin order management.

import type { Order, OrderItem, OrderStatus } from '@/types'
import { PRODUCTS } from './productCatalog'
import { generateOrderId } from '@/utils'

const DAYS_AGO = (n: number, h = 10) => {
  const d = new Date(Date.now() - n * 86400000)
  d.setHours(h, 24 - n * 3, 0, 0)
  return d.toISOString()
}

const STATUS_META: Record<OrderStatus, { label: string; hoursAfter: number }> = {
  pending: { label: 'Placed', hoursAfter: 0 },
  confirmed: { label: 'Confirmed', hoursAfter: 2 },
  packed: { label: 'Packed', hoursAfter: 12 },
  shipped: { label: 'Shipped', hoursAfter: 30 },
  'out-for-delivery': { label: 'Out for Delivery', hoursAfter: 50 },
  delivered: { label: 'Delivered', hoursAfter: 72 },
  cancelled: { label: 'Cancelled', hoursAfter: 3 },
  refunded: { label: 'Refunded', hoursAfter: 100 },
}

function timelineFor(status: OrderStatus, placedAt: string): Order['timeline'] {
  const placed = new Date(placedAt).getTime()
  const steps: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered']
  const idx = status === 'cancelled' || status === 'refunded' ? 2 : steps.indexOf(status) + 1
  const meta = STATUS_META
  const done = steps.slice(0, idx)
  return done.map((s) => ({
    status: s,
    label: meta[s].label,
    at: new Date(placed + meta[s].hoursAfter * 3600000).toISOString(),
    note: s === 'shipped' ? 'Handed over to BlueDart courier' : undefined,
  }))
}

interface OrderSeed {
  status: OrderStatus
  paymentMethod: string
  paymentStatus: Order['paymentStatus']
  daysAgo: number
  eta?: string
  couponCode?: string
  productIndexes: number[]
  rated?: boolean
}

const ORDER_SEEDS: OrderSeed[] = [
  { status: 'delivered', paymentMethod: 'UPI (Google Pay)', paymentStatus: 'paid', daysAgo: 62, couponCode: 'WELCOME10', productIndexes: [0, 1], rated: true },
  { status: 'delivered', paymentMethod: 'Credit Card', paymentStatus: 'paid', daysAgo: 40, productIndexes: [4, 7], rated: true },
  { status: 'delivered', paymentMethod: 'Net Banking', paymentStatus: 'paid', daysAgo: 22, couponCode: 'GLOW100', productIndexes: [5, 8] },
  { status: 'out-for-delivery', paymentMethod: 'UPI (PhonePe)', paymentStatus: 'paid', daysAgo: 1, productIndexes: [2], eta: 'Today' },
  { status: 'shipped', paymentMethod: 'Credit Card', paymentStatus: 'paid', daysAgo: 2, productIndexes: [3, 6, 9] },
  { status: 'packed', paymentMethod: 'Wallet (Paytm)', paymentStatus: 'paid', daysAgo: 4, productIndexes: [10] },
  { status: 'confirmed', paymentMethod: 'UPI (Paytm)', paymentStatus: 'paid', daysAgo: 5, productIndexes: [0, 5] },
  { status: 'cancelled', paymentMethod: 'Debit Card', paymentStatus: 'refunded', daysAgo: 8, productIndexes: [11], eta: 'Refund issued' },
  { status: 'delivered', paymentMethod: 'Cash on Delivery', paymentStatus: 'paid', daysAgo: 30, productIndexes: [1, 4, 7] },
  { status: 'shipped', paymentMethod: 'UPI (Google Pay)', paymentStatus: 'paid', daysAgo: 3, productIndexes: [2, 8] },
  { status: 'out-for-delivery', paymentMethod: 'Credit Card', paymentStatus: 'paid', daysAgo: 0, productIndexes: [6], eta: 'Tomorrow' },
  { status: 'delivered', paymentMethod: 'UPI (PhonePe)', paymentStatus: 'paid', daysAgo: 14, productIndexes: [3, 9] },
]

const ADDRESS = {
  id: 'addr1',
  fullName: 'Aarav Malhotra',
  phone: '+91 98765 43210',
  email: 'aarav@example.com',
  line1: '204, Palm Residency, MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  landmark: 'Near Metro Pillar 42',
  isDefault: true,
  label: 'home' as const,
}

export const MOCK_ORDERS: Order[] = ORDER_SEEDS.map((seed, i) => {
  const placedAt = DAYS_AGO(seed.daysAgo)
  const items: OrderItem[] = seed.productIndexes.map((pi) => {
    const p = PRODUCTS[pi % PRODUCTS.length] || PRODUCTS[0]
    return {
      productId: p.id,
      name: p.name,
      image: p.images[0].url,
      quantity: 1 + (i % 2),
      price: p.offerPrice,
    }
  })
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const couponDiscount = seed.couponCode ? Math.min(200, Math.round(subtotal * 0.1)) : 0
  const discount = Math.round(subtotal * 0.05)
  const shipping = subtotal - couponDiscount - discount >= 499 ? 0 : 49
  const gst = Math.round((subtotal - couponDiscount - discount) * 0.18)
  const total = subtotal - couponDiscount - discount + shipping + gst

  return {
    id: `ord-${i + 1}`,
    orderId: generateOrderId(),
    items,
    subtotal,
    discount,
    couponDiscount,
    couponCode: seed.couponCode,
    shipping,
    gst,
    total,
    paymentMethod: seed.paymentMethod,
    paymentStatus: seed.paymentStatus,
    status: seed.status,
    address: ADDRESS,
    placedAt,
    timeline: timelineFor(seed.status, placedAt),
    eta: seed.eta ?? 'Delivered',
    rated: seed.rated,
  }
})
