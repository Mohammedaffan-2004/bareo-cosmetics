import mongoose, { Schema, Document } from 'mongoose'

export interface ICartItem {
  productId: string
  quantity: number
  variant?: string
}

export interface ICart extends Document {
  id: string
  userId: string
  items: ICartItem[]
  createdAt: Date
  updatedAt: Date
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        variant: { type: String },
      },
    ],
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

export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
export default Cart
