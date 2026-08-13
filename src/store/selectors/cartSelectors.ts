import type { CartItem, Coupon } from '@/types'
import { FREE_SHIPPING_THRESHOLD } from '@/constants'
import { getActiveStoreSettings } from '@/services/storeSettingsStore'

export interface CartTotals {
  subtotal: number
  discount: number
  couponDiscount: number
  shipping: number
  gst: number
  gstPercent: number
  isGstIncluded: boolean
  total: number
  savings: number
  itemCount: number
  freeShippingEligible: boolean
  freeGiftEligible: boolean
  freeGiftRemaining: number
  giftProgressPercent: number
}

type CartStateCoupon = (Pick<Coupon, 'code' | 'discountType' | 'value' | 'maxDiscount'> & { discount: number }) | null

export const FREE_GIFT_THRESHOLD = 799
export const DEFAULT_GST_RATE = 18 // 18% GST for cosmetics/skincare

/** Config flag: toggle explicit GST addition vs inclusive GST in product MRP/price */
export const ENABLE_EXPLICIT_GST = false

/** Helper to extract finite product unit price safely */
function getProductUnitPrice(product?: CartItem['product']): number {
  if (!product) return 0
  const price = typeof product.offerPrice === 'number' && !isNaN(product.offerPrice)
    ? product.offerPrice
    : typeof product.price === 'number' && !isNaN(product.price)
    ? product.price
    : 0
  return Math.max(0, price)
}

/** Helper to extract finite product MRP safely */
function getProductMrp(product?: CartItem['product']): number {
  if (!product) return 0
  const price = getProductUnitPrice(product)
  const mrp = typeof product.mrp === 'number' && !isNaN(product.mrp) ? product.mrp : price
  return Math.max(price, mrp)
}

/**
 * Pure calculation of cart totals.
 * Calculates Subtotal, Discount, Coupon Savings, Shipping, GST, Total, and Free Gift progress safely.
 * Never outputs NaN or undefined.
 */
export function selectCartTotals(items: CartItem[] | undefined | null, coupon: CartStateCoupon | null): CartTotals {
  const safeItems = Array.isArray(items) ? items : []

  const subtotal = safeItems.reduce((sum, it) => {
    const qty = typeof it.quantity === 'number' && !isNaN(it.quantity) ? Math.max(1, it.quantity) : 1
    return sum + getProductUnitPrice(it.product) * qty
  }, 0)

  const mrpTotal = safeItems.reduce((sum, it) => {
    const qty = typeof it.quantity === 'number' && !isNaN(it.quantity) ? Math.max(1, it.quantity) : 1
    return sum + getProductMrp(it.product) * qty
  }, 0)

  const discount = Math.max(0, mrpTotal - subtotal)
  const couponDiscount = coupon ? calculateCouponDiscount(coupon, subtotal) : 0
  const net = Math.max(0, subtotal - couponDiscount)

  const { freeShippingThreshold, gstRate } = getActiveStoreSettings()
  const shippingThreshold = typeof freeShippingThreshold === 'number' ? freeShippingThreshold : FREE_SHIPPING_THRESHOLD
  const activeGstRate = typeof gstRate === 'number' ? gstRate : DEFAULT_GST_RATE

  // Shipping logic (FREE for orders >= shippingThreshold or empty cart)
  const shippingFee = 99
  const shipping = safeItems.length === 0 || net >= shippingThreshold ? 0 : shippingFee

  // GST logic: calculate explicit GST if enabled, otherwise mark as Included
  const gst = ENABLE_EXPLICIT_GST && safeItems.length > 0 ? Math.round((net * activeGstRate) / 100) : 0
  const isGstIncluded = !ENABLE_EXPLICIT_GST || gst === 0
  const gstPercent = ENABLE_EXPLICIT_GST ? activeGstRate : 0

  const total = net + shipping + gst
  const totalSavings = discount + couponDiscount

  const freeGiftRemaining = Math.max(0, FREE_GIFT_THRESHOLD - subtotal)
  const giftProgressPercent = subtotal >= FREE_GIFT_THRESHOLD
    ? 100
    : FREE_GIFT_THRESHOLD > 0
    ? Math.min(100, Math.round((subtotal / FREE_GIFT_THRESHOLD) * 100))
    : 0

  const itemCount = safeItems.reduce((sum, it) => {
    const qty = typeof it.quantity === 'number' && !isNaN(it.quantity) ? Math.max(1, it.quantity) : 1
    return sum + qty
  }, 0)

  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    couponDiscount: Math.round(couponDiscount),
    shipping: Math.round(shipping),
    gst: Math.round(gst),
    gstPercent,
    isGstIncluded,
    total: Math.round(total),
    savings: Math.round(totalSavings),
    itemCount,
    freeShippingEligible: true,
    freeGiftEligible: subtotal >= FREE_GIFT_THRESHOLD && safeItems.length > 0,
    freeGiftRemaining: Math.round(freeGiftRemaining),
    giftProgressPercent,
  }
}

export function calculateCouponDiscount(
  coupon: NonNullable<CartStateCoupon>,
  subtotal: number
): number {
  if (!coupon || subtotal <= 0) return 0
  const rawValue = typeof coupon.value === 'number' && !isNaN(coupon.value) ? coupon.value : 0
  let value = coupon.discountType === 'percent' ? (subtotal * rawValue) / 100 : rawValue
  if (typeof coupon.maxDiscount === 'number' && !isNaN(coupon.maxDiscount) && coupon.maxDiscount > 0) {
    value = Math.min(value, coupon.maxDiscount)
  }
  return Math.max(0, Math.min(Math.round(value), subtotal))
}
