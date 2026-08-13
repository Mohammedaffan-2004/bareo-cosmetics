import mongoose, { Schema, Document } from 'mongoose'

export interface IAddress extends Document {
  id: string
  userId: string
  fullName: string
  phone: string
  email: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
  isDefault: boolean
  label: string
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
    label: { type: String, default: 'home' },
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

export const Address = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema)
export default Address
