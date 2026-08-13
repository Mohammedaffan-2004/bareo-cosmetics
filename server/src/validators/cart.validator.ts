import { z } from 'zod'

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'ProductId is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional().default(1),
  variant: z.string().optional(),
})

export const updateCartItemSchema = z.object({
  productId: z.string().min(1, 'ProductId is required'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
