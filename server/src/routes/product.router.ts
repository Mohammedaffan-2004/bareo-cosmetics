import { Router } from 'express'
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getFeaturedProducts,
  addReview,
} from '../controllers/product.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { authGuard } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/products', asyncHandler(getProducts))
router.get('/products/featured', asyncHandler(getFeaturedProducts))
router.get('/products/:slug', asyncHandler(getProductBySlug))
router.post('/products/:id/reviews', authGuard, asyncHandler(addReview))
router.get('/categories', asyncHandler(getCategories))

export default router
