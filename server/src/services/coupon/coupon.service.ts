import { Coupon } from '../../models/Coupon.model.js'

export interface CouponValidationResult {
  valid: boolean
  discount: number
  appliedCoupon: any | null
  message: string
}

export class CouponService {
  /**
   * Encapsulates complete Coupon validation logic:
   * 1. Uppercase code lookup in MongoDB
   * 2. Active status check
   * 3. Expiry date check
   * 4. Minimum order value threshold check
   * 5. Percentage vs Flat discount calculation
   * 6. Maximum discount cap application
   * 7. Final rounded discount amount
   */
  async validateCoupon(couponCode: string, subtotal: number): Promise<CouponValidationResult> {
    if (!couponCode || !couponCode.trim()) {
      return {
        valid: false,
        discount: 0,
        appliedCoupon: null,
        message: 'Coupon code is required',
      }
    }

    const code = couponCode.trim().toUpperCase()
    const coupon: any = await Coupon.findOne({ code }).lean()

    if (!coupon || !coupon.active) {
      return {
        valid: false,
        discount: 0,
        appliedCoupon: null,
        message: 'Invalid or expired coupon code',
      }
    }

    // Expiry Date Validation
    if (coupon.validTill && new Date(coupon.validTill).getTime() < Date.now()) {
      return {
        valid: false,
        discount: 0,
        appliedCoupon: null,
        message: 'Coupon code has expired',
      }
    }

    // Minimum Order Threshold Validation
    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        discount: 0,
        appliedCoupon: null,
        message: `Minimum order value for ${coupon.code} is ₹${coupon.minOrder}`,
      }
    }

    // Calculate Discount Amount
    let discountAmount = 0
    if (coupon.discountType === 'percent') {
      discountAmount = (subtotal * coupon.value) / 100
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else {
      discountAmount = coupon.value
    }

    const finalDiscount = Math.round(discountAmount)
    const formattedCoupon = {
      ...coupon,
      id: coupon._id?.toString() || coupon.id,
      maxDiscount: coupon.maxDiscount || undefined,
    }

    return {
      valid: true,
      discount: finalDiscount,
      appliedCoupon: formattedCoupon,
      message: 'Coupon applied successfully!',
    }
  }

  /** Coupon CRUD operations for Admin Console */
  async getCouponsAdmin() {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    return coupons.map((c: any) => ({
      ...c,
      id: c._id?.toString() || c.id,
    }))
  }

  async createCouponAdmin(data: any) {
    const { code, description, discountType, value, minOrder, maxDiscount, validTill, active } = data

    if (!code || !code.trim()) {
      const error: any = new Error('Coupon code is required')
      error.statusCode = 400
      throw error
    }
    if (!discountType || !['percent', 'flat'].includes(discountType)) {
      const error: any = new Error('Valid discount type (percent or flat) is required')
      error.statusCode = 400
      throw error
    }
    const numVal = Number(value)
    if (isNaN(numVal) || numVal <= 0) {
      const error: any = new Error('Discount value must be greater than 0')
      error.statusCode = 400
      throw error
    }
    if (discountType === 'percent' && numVal > 100) {
      const error: any = new Error('Percentage discount cannot exceed 100%')
      error.statusCode = 400
      throw error
    }
    if (minOrder !== undefined && Number(minOrder) < 0) {
      const error: any = new Error('Minimum order cannot be negative')
      error.statusCode = 400
      throw error
    }
    if (maxDiscount !== undefined && Number(maxDiscount) < 0) {
      const error: any = new Error('Max discount cannot be negative')
      error.statusCode = 400
      throw error
    }

    const normalizedCode = code.trim().toUpperCase()
    const existing = await Coupon.findOne({ code: normalizedCode })
    if (existing) {
      const error: any = new Error(`Coupon code '${normalizedCode}' already exists`)
      error.statusCode = 409
      throw error
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      description: description || `${normalizedCode} promotional discount`,
      discountType,
      value: numVal,
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      validTill: validTill || new Date(Date.now() + 30 * 86400000).toISOString(),
      active: active !== undefined ? Boolean(active) : true,
    })

    return { ...coupon.toObject(), id: coupon._id.toString() }
  }

  async updateCouponAdmin(id: string, updates: any) {
    const coupon = await Coupon.findById(id)
    if (!coupon) {
      const error: any = new Error('Coupon not found')
      error.statusCode = 404
      throw error
    }

    if (updates.code) {
      const normalized = updates.code.trim().toUpperCase()
      const duplicate = await Coupon.findOne({ code: normalized, _id: { $ne: id } })
      if (duplicate) {
        const error: any = new Error(`Coupon code '${normalized}' already exists`)
        error.statusCode = 409
        throw error
      }
      coupon.code = normalized
    }
    if (updates.description !== undefined) coupon.description = updates.description
    if (updates.discountType !== undefined) coupon.discountType = updates.discountType
    if (updates.value !== undefined) coupon.value = Number(updates.value)
    if (updates.minOrder !== undefined) coupon.minOrder = Number(updates.minOrder)
    if (updates.maxDiscount !== undefined) coupon.maxDiscount = updates.maxDiscount ? Number(updates.maxDiscount) : undefined
    if (updates.validTill !== undefined) coupon.validTill = updates.validTill
    if (updates.active !== undefined) coupon.active = Boolean(updates.active)

    await coupon.save()
    return { ...coupon.toObject(), id: coupon._id.toString() }
  }

  async deleteCouponAdmin(id: string) {
    const deleted = await Coupon.findByIdAndDelete(id)
    if (!deleted) {
      const error: any = new Error('Coupon not found')
      error.statusCode = 404
      throw error
    }
    return { success: true }
  }
}

export const couponService = new CouponService()
