import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { cartService } from '../services/cart/cart.service.js'
import { success, badRequest, notFound } from '../utils/response.js'
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator.js'

/**
 * Cart Controller — Thin HTTP Handler Layer.
 * Delegates cart persistence, product stock checks, and item calculations to CartService.
 */
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const items = await cartService.getCart(userId)
  return success(res, items, 'Cart items retrieved')
}

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  const validation = addToCartSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, validation.error.errors[0].message)
  }

  const userId = req.user!.id
  const { productId, quantity, variant } = validation.data

  try {
    const formattedItems = await cartService.addItem(userId, productId, quantity, variant)
    return success(res, formattedItems, 'Item added to cart')
  } catch (error: any) {
    const statusCode = error.statusCode || 400
    if (statusCode === 404) return notFound(res, error.message)
    return badRequest(res, error.message)
  }
}

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
  const validation = updateCartItemSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, validation.error.errors[0].message)
  }

  const userId = req.user!.id
  const { productId, quantity } = validation.data

  try {
    const formattedItems = await cartService.updateQuantity(userId, productId, quantity)
    return success(res, formattedItems, 'Cart updated successfully')
  } catch (error: any) {
    const statusCode = error.statusCode || 400
    if (statusCode === 404) return notFound(res, error.message)
    return badRequest(res, error.message)
  }
}

export const removeCartItem = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const productId = req.params.productId as string

  const formattedItems = await cartService.removeItem(userId, productId)
  return success(res, formattedItems, 'Item removed from cart')
}
