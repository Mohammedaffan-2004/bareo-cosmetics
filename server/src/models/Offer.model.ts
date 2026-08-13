import mongoose, { Schema, Document } from 'mongoose'

export interface IOffer extends Document {
  id: string
  title: string
  subtitle: string
  code?: string
  badge: string
  background: string
  image?: string
  discountLabel: string
  type: string
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    code: { type: String },
    badge: { type: String, required: true },
    background: { type: String, required: true },
    image: { type: String },
    discountLabel: { type: String, required: true },
    type: { type: String, required: true },
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

export const Offer = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema)
export default Offer
