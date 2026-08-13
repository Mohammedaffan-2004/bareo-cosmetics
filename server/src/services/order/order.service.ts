import { Order } from '../../models/Order.model.js'
import { Cart } from '../../models/Cart.model.js'
import { Product } from '../../models/Product.model.js'
import { Coupon } from '../../models/Coupon.model.js'
import { isValidObjectId } from '../../utils/validation.js'
import { couponService } from '../coupon/coupon.service.js'

export interface CreateOrderPayload {
  userId: string
  items: Array<{ productId?: string; product?: { id?: string; _id?: string }; quantity: number }>
  shipping?: number
  gst?: number
  couponCode?: string
  paymentMethod?: string
  address?: any
}

export class OrderService {
  /**
   * Encapsulates complete Order Creation domain logic:
   * 1. Product existence & server-side price lookup from MongoDB
   * 2. Server subtotal calculation using db.offerPrice
   * 3. Coupon discount verification against active coupons
   * 4. Server-verified total calculation
   * 5. Random Order ID & ETA generation
   * 6. Immutable snapshot creation & order persistence
   * 7. Automatic cart clearing
   */
  async createVerifiedOrder(payload: CreateOrderPayload) {
    const {
      userId,
      items,
      shipping = 0,
      gst = 0,
      couponCode,
      paymentMethod = 'cod',
      address,
    } = payload

    // 1. Fetch product documents from MongoDB
    const productIds = items.map((item) =>
      String(item.productId || item.product?.id || item.product?._id || '')
    )

    const products = await Product.find({
      $or: [
        { _id: { $in: productIds.filter(isValidObjectId) } },
        { slug: { $in: productIds } },
      ],
    }).lean()

    // 2. Calculate subtotal & construct immutable snapshot items
    let serverSubtotal = 0
    const orderItems = []

    for (const item of items) {
      const targetId = String(item.productId || item.product?.id || item.product?._id || '')
      const product: any = products.find(
        (p: any) => p._id?.toString() === targetId || p.slug === targetId || p.id === targetId
      )

      if (!product) {
        const error: any = new Error(`Product with ID ${targetId} not found`)
        error.statusCode = 404
        throw error
      }

      if (product.status && product.status !== 'active') {
        const error: any = new Error(`Product "${product.name}" is currently unavailable`)
        error.statusCode = 400
        throw error
      }

      const quantity = Math.max(1, Number(item.quantity) || 1)

      if (product.stock !== undefined && product.stock < quantity) {
        const error: any = new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}`)
        error.statusCode = 400
        throw error
      }

      const price = product.offerPrice || product.mrp
      const itemTotal = price * quantity
      serverSubtotal += itemTotal

      orderItems.push({
        productId: product._id?.toString() || product.id,
        name: product.name,
        image:
          (Array.isArray(product.images) && product.images[0]?.url) ||
          (typeof product.images?.[0] === 'string' ? product.images[0] : ''),
        quantity,
        price,
      })
    }

    // 3. Coupon discount verification delegated to CouponService
    let serverCouponDiscount = 0
    let validCouponCode: string | null = null

    if (couponCode) {
      const couponResult = await couponService.validateCoupon(couponCode, serverSubtotal)
      if (couponResult.valid) {
        serverCouponDiscount = couponResult.discount
        validCouponCode = couponResult.appliedCoupon.code
      }
    }

    // 4. Server-verified total calculation
    const shippingFee = Number(shipping) || 0
    const gstFee = Number(gst) || 0
    const serverTotal = Math.max(0, serverSubtotal - serverCouponDiscount + shippingFee + gstFee)

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const eta = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    // 5. Persist Order document
    const order = await Order.create({
      orderId,
      userId,
      subtotal: Math.round(serverSubtotal),
      discount: serverCouponDiscount,
      shipping: shippingFee,
      gst: gstFee,
      couponCode: validCouponCode,
      couponDiscount: serverCouponDiscount,
      total: Math.round(serverTotal),
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: 'confirmed',
      address,
      eta,
      items: orderItems,
      timeline: [
        { status: 'placed', label: 'Order Placed', note: 'Order successfully placed by customer', at: new Date() },
        { status: 'confirmed', label: 'Order Confirmed', note: 'Payment verified & sent to warehouse', at: new Date() },
      ],
    })

    // 6. Deduct product stock atomically in MongoDB
    for (const item of orderItems) {
      if (item.productId && isValidObjectId(item.productId)) {
        await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity, soldCount: item.quantity } }
        )
      }
    }

    // 7. Clear user cart
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } })

    return {
      ...order.toObject(),
      id: order._id.toString(),
      placedAt: order.placedAt ? order.placedAt.toISOString() : new Date().toISOString(),
    }
  }

  /** Fetch customer order history. */
  async getUserOrders(userId: string) {
    const orders = await Order.find({ userId }).sort({ placedAt: -1 }).lean()

    return orders.map((order: any) => ({
      ...order,
      id: order._id?.toString() || order.id,
      placedAt: order.placedAt ? new Date(order.placedAt).toISOString() : new Date().toISOString(),
      timeline: (order.timeline || []).map((t: any) => ({
        status: t.status,
        label: t.label,
        at: t.at ? new Date(t.at).toISOString() : new Date().toISOString(),
        note: t.note || undefined,
      })),
    }))
  }

  /** Fetch single order by ID with user/role security check. */
  async getOrderById(orderId: string, userId: string, role?: string) {
    const query: any = {
      $or: [{ _id: isValidObjectId(orderId) ? orderId : undefined }, { orderId }],
    }

    if (role !== 'ADMIN') {
      query.userId = userId
    }

    const order: any = await Order.findOne(query).lean()

    if (!order) {
      const error: any = new Error('Order not found')
      error.statusCode = 404
      throw error
    }

    return {
      ...order,
      id: order._id?.toString() || order.id,
      placedAt: order.placedAt ? new Date(order.placedAt).toISOString() : new Date().toISOString(),
      timeline: (order.timeline || []).map((t: any) => ({
        status: t.status,
        label: t.label,
        at: t.at ? new Date(t.at).toISOString() : new Date().toISOString(),
        note: t.note || undefined,
      })),
    }
  }
}

export const orderService = new OrderService()
