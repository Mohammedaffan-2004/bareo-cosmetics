import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  productId: string
  name: string
  image: string
  quantity: number
  price: number
}

export interface IOrderTimeline {
  status: string
  label: string
  at: Date
  note?: string
}

export interface IOrder extends Document {
  id: string
  orderId: string
  userId: string
  items: IOrderItem[]
  subtotal: number
  discount: number
  shipping: number
  gst: number
  couponCode?: string
  couponDiscount: number
  total: number
  paymentMethod: string
  paymentStatus: string
  status: string
  address: any
  placedAt: Date
  eta: string
  timeline: IOrderTimeline[]
  rated: boolean
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'pending' },
    status: { type: String, default: 'pending' },
    address: { type: Schema.Types.Mixed, required: true },
    placedAt: { type: Date, default: Date.now },
    eta: { type: String, required: true },
    rated: { type: Boolean, default: false },
    timeline: [
      {
        status: { type: String, required: true },
        label: { type: String, required: true },
        at: { type: Date, default: Date.now },
        note: { type: String },
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

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order
