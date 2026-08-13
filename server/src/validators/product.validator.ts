import { z } from 'zod'

export const productInputSchema = z.object({
  name: z.string().min(2, 'Product Name is required'),
  brand: z.string().optional().default('Lumina Skin'),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  categorySlug: z.string().optional(),
  categoryName: z.string().optional(),
  shortDescription: z.string().min(5, 'Short description is required'),
  description: z.string().min(10, 'Full description is required'),
  mrp: z.number().gt(0, 'MRP must be greater than 0'),
  offerPrice: z.number().gt(0, 'Offer Price must be greater than 0'),
  stock: z.number().min(0, 'Stock must be 0 or greater'),
  isBestSeller: z.boolean().optional().default(false),
  isTrending: z.boolean().optional().default(false),
  isDoctorRecommended: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(true),
  isAiRecommended: z.boolean().optional().default(false),
  skinTypes: z.array(z.string()).optional().default([]),
  concerns: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  usage: z.array(z.string()).optional().default([]),
  keyFacts: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  images: z
    .array(
      z.union([
        z.string(),
        z.object({
          url: z.string(),
          id: z.string().optional(),
          alt: z.string().optional(),
        }),
      ])
    )
    .min(1, 'At least one product image is required'),
  ingredients: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        concentration: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional()
    .default([]),
  status: z.enum(['active', 'inactive', 'out-of-stock']).optional().default('active'),
})

export type ProductInput = z.infer<typeof productInputSchema>
