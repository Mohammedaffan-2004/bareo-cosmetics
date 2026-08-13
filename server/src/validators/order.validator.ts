import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  product: z
    .object({
      id: z.string().optional(),
      _id: z.string().optional(),
    })
    .optional(),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Items array is required and cannot be empty'),
  address: z.any({ required_error: 'Delivery address is required' }),
  shipping: z.number().optional().default(0),
  gst: z.number().optional().default(0),
  couponCode: z.string().optional(),
  paymentMethod: z.string().optional().default('cod'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
