import { Router } from 'express'
import { validateCoupon, createPaymentIntent } from '../controllers/checkout.controller.js'
import { authGuard } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(authGuard)

router.post('/validate-coupon', asyncHandler(validateCoupon))
router.post('/create-payment-intent', asyncHandler(createPaymentIntent))

export default router
