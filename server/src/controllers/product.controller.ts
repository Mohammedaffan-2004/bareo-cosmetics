import { Request, Response } from 'express'
import { productService } from '../services/product/product.service.js'
import { success } from '../utils/response.js'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { User } from '../models/User.model.js'

/**
 * Product Controller — Thin HTTP Handler Layer.
 * Delegates all catalog queries, search filtering, and category aggregations to ProductService.
 */
export const getProducts = async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query)
  return success(res, result, 'Products retrieved successfully')
}

export const getProductBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug as string
  const formatted = await productService.getProductBySlug(slug)
  return success(res, formatted, 'Product details retrieved')
}

export const getCategories = async (req: Request, res: Response) => {
  const categories = await productService.getCategories()
  return success(res, categories, 'Categories retrieved successfully')
}

export const getFeaturedProducts = async (req: Request, res: Response) => {
  const products = await productService.getFeaturedProducts()
  return success(res, products, 'Featured products retrieved')
}

export const addReview = async (req: AuthenticatedRequest, res: Response) => {
  const productIdOrSlug = req.params.id || req.params.slug
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ data: null, message: 'Authentication required', status: 401 })
  }

  const userDoc: any = await User.findById(userId).lean()
  const userName = userDoc?.name || userDoc?.email?.split('@')[0] || 'Bareo Customer'

  const updatedProduct = await productService.addReview(productIdOrSlug, userId, userName, req.body)
  return success(res, updatedProduct, 'Review submitted successfully')
}
