import { Request, Response } from 'express'
import { productService } from '../services/product/product.service.js'
import { success } from '../utils/response.js'

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
