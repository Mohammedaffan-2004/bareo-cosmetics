import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { couponService } from '../services/coupon/coupon.service.js'
import { success, badRequest, notFound } from '../utils/response.js'
import { validateCouponSchema } from '../validators/coupon.validator.js'

export const validateCoupon = async (req: AuthenticatedRequest, res: Response) => {
  const validation = validateCouponSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, 'Coupon code is required')
  }

  const { code, subtotal } = validation.data
  const result = await couponService.validateCoupon(code, subtotal)

  if (!result.valid) {
    if (result.message.includes('Minimum order')) {
      return badRequest(res, result.message)
    }
    return notFound(res, result.message)
  }

  return success(
    res,
    {
      coupon: result.appliedCoupon,
      discountAmount: result.discount,
    },
    result.message
  )
}

export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
  const { amount, currency = 'INR', paymentMethod } = req.body

  if (!amount || amount <= 0) {
    return badRequest(res, 'Invalid amount')
  }

  const paymentOrderId = `pay_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`

  return success(
    res,
    {
      orderId: paymentOrderId,
      amount,
      currency,
      paymentMethod,
      clientSecret: `secret_${paymentOrderId}`,
      status: 'created',
    },
    'Payment order created'
  )
}
