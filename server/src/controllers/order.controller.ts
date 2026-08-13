import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { orderService } from '../services/order/order.service.js'
import { success, created, badRequest } from '../utils/response.js'
import { createOrderSchema } from '../validators/order.validator.js'

/**
 * Order Controller — Thin HTTP Handler Layer.
 * Delegates all business logic, calculations, and persistence to OrderService.
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const validation = createOrderSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, 'Invalid order parameters. Items array and delivery address are required.')
  }

  const userId = req.user!.id
  const formattedOrder = await orderService.createVerifiedOrder({
    ...validation.data,
    userId,
  })

  return created(res, formattedOrder, 'Order created successfully with server-verified totals')
}

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const formattedOrders = await orderService.getUserOrders(userId)

  return success(res, formattedOrders, 'Orders retrieved successfully')
}

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  const orderId = req.params.orderId as string
  const userId = req.user!.id
  const role = req.user?.role

  const formattedOrder = await orderService.getOrderById(orderId, userId, role)

  return success(res, formattedOrder, 'Order retrieved successfully')
}
