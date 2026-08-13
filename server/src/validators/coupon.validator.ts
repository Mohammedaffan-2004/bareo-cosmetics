import { z } from 'zod'

export const couponInputSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  description: z.string().optional(),
  discountType: z.enum(['percent', 'flat'], { required_error: 'Valid discount type (percent or flat) is required' }),
  value: z.number().gt(0, 'Discount value must be greater than 0'),
  minOrder: z.number().min(0, 'Minimum order cannot be negative').optional().default(0),
  maxDiscount: z.number().min(0, 'Max discount cannot be negative').optional(),
  validTill: z.string().optional(),
  active: z.boolean().optional().default(true),
})

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().min(0, 'Subtotal cannot be negative').optional().default(0),
})

export type CouponInput = z.infer<typeof couponInputSchema>
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>
