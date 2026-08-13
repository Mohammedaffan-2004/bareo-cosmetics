import { Router } from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/cart.controller.js'
import { authGuard } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// All cart routes require authentication
router.use(authGuard)

router.get('/', asyncHandler(getCart))
router.post('/items', asyncHandler(addToCart))
router.put('/items', asyncHandler(updateCartItem))
router.delete('/items/:productId', asyncHandler(removeCartItem))

export default router
