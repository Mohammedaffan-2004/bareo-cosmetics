import mongoose, { Schema, Document } from 'mongoose'

export interface IPaymentMethod extends Document {
  id: string
  userId: string
  type: string
  label: string
  detail: string
  isDefault: boolean
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    label: { type: String, required: true },
    detail: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
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

export const PaymentMethod =
  mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema)
export default PaymentMethod
