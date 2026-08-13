import { Router } from 'express'
import { createOrder, getOrders, getOrderById } from '../controllers/order.controller.js'
import { authGuard } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// All order routes require authentication
router.use(authGuard)

router.post('/', asyncHandler(createOrder))
router.get('/', asyncHandler(getOrders))
router.get('/:orderId', asyncHandler(getOrderById))

export default router
