import { Router } from 'express'
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getFeaturedProducts,
} from '../controllers/product.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/products', asyncHandler(getProducts))
router.get('/products/featured', asyncHandler(getFeaturedProducts))
router.get('/products/:slug', asyncHandler(getProductBySlug))
router.get('/categories', asyncHandler(getCategories))

export default router
