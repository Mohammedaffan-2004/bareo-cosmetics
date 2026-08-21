// Order service — order placement, history, invoice and coupon validation.

import type { Address, CartItem, Coupon, Order, OrderStatus } from '@/types'
import type { ShippingAddress } from './addressService'
import { MOCK_ORDERS } from '@/mocks/orders'
import { COUPONS } from '@/mocks/static'
import { generateOrderId, uid } from '@/utils'
import { mockError, mockFetch } from './mockApi'

export interface PlaceOrderInput {
  items: CartItem[]
  address: Address | ShippingAddress
  deliveryId: string
  paymentMethod: string
  couponCode?: string
  totals: { subtotal: number; discount: number; couponDiscount: number; shipping: number; gst: number; total: number }
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

function orderTimeline(status: OrderStatus, placedAt: string): Order['timeline'] {
  const base = new Date(placedAt).getTime()
  const steps: { status: OrderStatus; label: string; hours: number }[] = [
    { status: 'pending', label: 'Placed', hours: 0 },
    { status: 'confirmed', label: 'Confirmed', hours: 1 },
    { status: 'packed', label: 'Packed', hours: 10 },
    { status: 'shipped', label: 'Shipped', hours: 26 },
    { status: 'out-for-delivery', label: 'Out for Delivery', hours: 48 },
    { status: 'delivered', label: 'Delivered', hours: 70 },
  ]
  const endIdx = status === 'cancelled' || status === 'refunded' ? 3 : steps.findIndex((s) => s.status === status)
  return steps.slice(0, endIdx + 1).map((s) => ({
    status: s.status,
    label: s.label,
    at: new Date(base + s.hours * 3600000).toISOString(),
  }))
}

import { apiFetch } from './apiClient'

let placedOrders: Order[] = []

export function orderService() {
  return {
    async placeOrder(input: PlaceOrderInput): Promise<Order> {
      if (!input.address.line1 || !input.address.pincode) {
        mockError('Please provide a complete shipping address', 422)
      }
      if (input.items.length === 0) mockError('Your cart is empty', 422)

      const payload = {
        items: input.items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        })),
        address: input.address,
        paymentMethod: input.paymentMethod,
        couponCode: input.couponCode,
        shipping: input.totals.shipping,
        gst: input.totals.gst,
      }

      try {
        const res = await apiFetch<Order>('/orders', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        if (res.data) {
          placedOrders = [res.data, ...placedOrders]
          return res.data
        }
      } catch (err) {
        console.warn('[Order Service] Backend placeOrder fallback:', err)
      }

      const placedAt = new Date().toISOString()
      const order: Order = {
        id: uid('ord'),
        orderId: generateOrderId(),
        items: input.items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          image: it.product.images?.[0]?.url || '',
          quantity: it.quantity,
          price: it.product.offerPrice,
        })),
        subtotal: input.totals.subtotal,
        discount: input.totals.discount,
        couponCode: input.couponCode,
        couponDiscount: input.totals.couponDiscount,
        shipping: input.totals.shipping,
        gst: input.totals.gst,
        total: input.totals.total,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'paid',
        status: 'pending',
        address: input.address,
        placedAt,
        timeline: orderTimeline('pending', placedAt),
        eta: '3 – 5 business days',
      }
      placedOrders = [order, ...placedOrders]
      return mockFetch(order).then((r) => r.data)
    },

    async getOrders(): Promise<Order[]> {
      try {
        const res = await apiFetch<Order[]>('/orders')
        if (Array.isArray(res.data)) {
          return res.data
        }
      } catch (err) {
        console.warn('[Order Service] Backend getOrders fallback:', err)
      }
      return mockFetch([...placedOrders].sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))).then(
        (r) => r.data
      )
    },

    async getOrderById(orderId: string): Promise<Order> {
      try {
        const res = await apiFetch<Order>(`/orders/${orderId}`)
        if (res.data) return res.data
      } catch (err) {
        console.warn('[Order Service] Backend getOrderById fallback:', err)
      }
      const order = [...placedOrders, ...MOCK_ORDERS].find((o) => o.orderId === orderId || o.id === orderId)
      if (!order) mockError('Order not found', 404)
      return mockFetch(order!).then((res) => res.data)
    },

    async cancelOrder(orderId: string): Promise<Order> {
      const order = [...placedOrders, ...MOCK_ORDERS].find((o) => o.orderId === orderId)
      if (!order) mockError('Order not found', 404)
      const updated: Order = { ...order, status: 'cancelled', timeline: orderTimeline('cancelled', order.placedAt) }
      return mockFetch(updated).then((r) => r.data)
    },

    async rateProduct(_productId: string, input: { rating: number; review?: string }): Promise<{ success: boolean }> {
      if (input.rating < 1 || input.rating > 5) mockError('Rating must be between 1 and 5', 422)
      return mockFetch({ success: true }).then((r) => r.data)
    },

    async applyCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discount: number }> {      const coupon = COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase())
      if (!coupon) mockError('Invalid coupon code', 400)
      const minRequired = (coupon as any).minOrderValue ?? (coupon as any).minOrder ?? 0
      if (subtotal < minRequired) mockError(`Add items worth ₹${minRequired} to use this coupon`, 400)
      let discount = coupon.discountType === 'percent' || coupon.discountType === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
      return mockFetch({ coupon, discount: Math.round(discount) }).then((r) => r.data)
    },

    async generateInvoice(order: Order): Promise<{ html: string; order: Order }> {
      return mockFetch({ html: `<invoice>${order.orderId}</invoice>`, order }, { delay: 400 }).then((r) => r.data)
    },
  }
}

export { STATUS_LABELS }
