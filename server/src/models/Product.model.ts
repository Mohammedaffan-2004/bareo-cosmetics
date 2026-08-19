import mongoose, { Schema, Document } from 'mongoose'

export interface IProductImage {
  id?: string
  url: string
  publicId?: string
  alt?: string
  type?: 'primary' | 'gallery' | 'lifestyle' | 'detail'
}

export interface IIngredient {
  name: string
  description: string
  concentration?: string
}

export interface IReview {
  id?: string
  userId?: string
  userName: string
  rating: number
  title?: string
  comment: string
  date: string
  verified: boolean
  helpful: number
}

export interface IFAQ {
  question: string
  answer: string
}

export interface IProduct extends Document {
  id: string
  sku?: string
  slug: string
  name: string
  brand: string
  categoryId: string
  categoryName: string
  categorySlug: string
  shortDescription: string
  description: string
  images: IProductImage[]
  mrp: number
  offerPrice: number
  discount: number
  rating: number
  ratingCount: number
  stock: number
  isBestSeller: boolean
  isTrending: boolean
  isDoctorRecommended: boolean
  isNewProduct: boolean
  isAiRecommended?: boolean
  skinTypes: string[]
  concerns: string[]
  ingredients: IIngredient[]
  benefits: string[]
  usage: string[]
  keyFacts: string[]
  faqs: IFAQ[]
  tags: string[]
  reviews: IReview[]
  soldCount: number
  status: 'active' | 'inactive' | 'out-of-stock'
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    brand: { type: String, required: true, default: 'Bareo' },
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    categorySlug: { type: String, required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String },
        type: { type: String, default: 'primary' },
      },
    ],
    mrp: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    ratingCount: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isDoctorRecommended: { type: Boolean, default: false },
    isNewProduct: { type: Boolean, default: true },
    isAiRecommended: { type: Boolean, default: false },
    skinTypes: [{ type: String }],
    concerns: [{ type: String }],
    ingredients: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        concentration: { type: String },
      },
    ],
    benefits: [{ type: String }],
    usage: [{ type: String }],
    keyFacts: [{ type: String }],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    tags: [{ type: String }],
    reviews: [
      {
        userId: { type: String },
        userName: { type: String, required: true },
        rating: { type: Number, required: true },
        title: { type: String },
        comment: { type: String, required: true },
        date: { type: String, default: () => new Date().toISOString() },
        verified: { type: Boolean, default: true },
        helpful: { type: Number, default: 0 },
      },
    ],
    soldCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'out-of-stock'], default: 'active' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

// Approved Performance & Query Indexes
ProductSchema.index({ categoryId: 1 })
ProductSchema.index({ categorySlug: 1 })
ProductSchema.index({ brand: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ offerPrice: 1 })
ProductSchema.index({ isBestSeller: 1, isTrending: 1, isDoctorRecommended: 1 })

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
export default Product
