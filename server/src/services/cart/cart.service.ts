import { Cart } from '../../models/Cart.model.js'
import { productService } from '../product/product.service.js'
import { isValidObjectId } from '../../utils/validation.js'
import { Product } from '../../models/Product.model.js'

export class CartService {
  /**
   * Formats cart item documents into full API responses by populating product metadata.
   */
  async formatCartItems(cartItems: any[]) {
    if (!cartItems || !cartItems.length) return []

    const productIds = cartItems.map((i: any) => i.productId)
    const products = await Product.find({
      $or: [{ _id: { $in: productIds.filter(isValidObjectId) } }, { slug: { $in: productIds } }],
    }).lean()

    return cartItems
      .map((item: any) => {
        const p: any = products.find(
          (prod: any) => prod._id.toString() === item.productId || prod.slug === item.productId
        )
        if (!p) return null
        return {
          product: {
            ...p,
            id: p._id?.toString() || p.id,
            skinTypes: Array.isArray(p.skinTypes) ? p.skinTypes : JSON.parse(p.skinTypes || '[]'),
            concerns: Array.isArray(p.concerns) ? p.concerns : JSON.parse(p.concerns || '[]'),
            benefits: Array.isArray(p.benefits) ? p.benefits : JSON.parse(p.benefits || '[]'),
            usage: Array.isArray(p.usage) ? p.usage : JSON.parse(p.usage || '[]'),
            keyFacts: Array.isArray(p.keyFacts) ? p.keyFacts : JSON.parse(p.keyFacts || '[]'),
            tags: Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags || '[]'),
          },
          quantity: item.quantity,
          variant: item.variant || undefined,
        }
      })
      .filter(Boolean)
  }

  /** Retrieve user cart items populated with product metadata. */
  async getCart(userId: string) {
    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = await Cart.create({ userId, items: [] })
    }
    return this.formatCartItems(cart.items)
  }

  /** Add item to user cart with stock & quantity limit validation. */
  async addItem(userId: string, productId: string, quantity: number = 1, variant?: string) {
    if (!productId) {
      const error: any = new Error('ProductId is required')
      error.statusCode = 400
      throw error
    }

    // 1. Validate Product Existence & Stock via ProductService
    let product: any
    try {
      product = await productService.getProductBySlug(productId)
    } catch {
      const error: any = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    if (product.status !== 'active' || product.stock <= 0) {
      const error: any = new Error('Product is currently unavailable')
      error.statusCode = 400
      throw error
    }

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = await Cart.create({ userId, items: [] })
    }

    const existingIndex = cart.items.findIndex(
      (i: any) => i.productId === String(productId) || i.productId === product.id || i.productId === product._id?.toString()
    )
    const currentQty = existingIndex > -1 ? cart.items[existingIndex].quantity : 0
    const requestedQty = Number(quantity)
    const newQty = currentQty + requestedQty

    // 2. Maximum Quantity Check (10 units per product)
    if (newQty > 10) {
      const error: any = new Error('Maximum quantity per item is 10')
      error.statusCode = 400
      throw error
    }

    // 3. Stock Availability Check
    if (newQty > product.stock) {
      const error: any = new Error('Requested quantity exceeds available stock')
      error.statusCode = 400
      throw error
    }

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = newQty
    } else {
      cart.items.push({ productId: String(productId), quantity: newQty, variant })
    }

    await cart.save()
    return this.formatCartItems(cart.items)
  }

  /** Update quantity of existing item in cart. */
  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (!productId) {
      const error: any = new Error('ProductId is required')
      error.statusCode = 400
      throw error
    }

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      const error: any = new Error('Cart not found')
      error.statusCode = 404
      throw error
    }

    const targetQty = Number(quantity)

    if (targetQty <= 0) {
      cart.items = cart.items.filter((i: any) => i.productId !== String(productId))
    } else {
      let product: any
      try {
        product = await productService.getProductBySlug(productId)
      } catch {
        const error: any = new Error('Product not found')
        error.statusCode = 404
        throw error
      }

      if (product.status !== 'active' || product.stock <= 0) {
        const error: any = new Error('Product is currently unavailable')
        error.statusCode = 400
        throw error
      }

      if (targetQty > 10) {
        const error: any = new Error('Maximum quantity per item is 10')
        error.statusCode = 400
        throw error
      }

      if (targetQty > product.stock) {
        const error: any = new Error('Requested quantity exceeds available stock')
        error.statusCode = 400
        throw error
      }

      const item = cart.items.find(
        (i: any) => i.productId === String(productId) || i.productId === product.id || i.productId === product._id?.toString()
      )
      if (item) {
        item.quantity = targetQty
      } else {
        cart.items.push({ productId: String(productId), quantity: targetQty })
      }
    }

    await cart.save()
    return this.formatCartItems(cart.items)
  }

  /** Remove specific item from cart. */
  async removeItem(userId: string, productId: string) {
    const cart = await Cart.findOne({ userId })
    if (cart) {
      cart.items = cart.items.filter((i: any) => i.productId !== String(productId))
      await cart.save()
      return this.formatCartItems(cart.items)
    }
    return []
  }

  /** Clear all items from cart. */
  async clearCart(userId: string) {
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } })
    return []
  }

  /** Calculate cart totals helper. */
  async calculateCartTotals(cartItems: any[]) {
    let subtotal = 0
    let totalItems = 0

    for (const item of cartItems) {
      const price = item.product?.offerPrice || item.product?.mrp || 0
      const qty = item.quantity || 1
      subtotal += price * qty
      totalItems += qty
    }

    const shipping = subtotal >= 499 ? 0 : 39
    const total = subtotal + shipping

    return {
      subtotal,
      shipping,
      total,
      totalItems,
    }
  }

  /** Validate array of cart items against product catalog. */
  async validateCartItems(items: any[]) {
    const formatted = await this.formatCartItems(items)
    return {
      valid: formatted.length === items.length,
      items: formatted,
    }
  }
}

export const cartService = new CartService()
