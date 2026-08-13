import mongoose, { Schema, Document } from 'mongoose'

export interface IStoreSettings extends Document {
  storeName: string
  supportEmail: string
  supportPhone: string
  freeShippingThreshold: number
  gstRate: number
  lowStockThreshold: number
  maintenanceMode: boolean
  aiAssistantEnabled: boolean
  updatedAt: Date
}

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: {
      type: String,
      required: true,
      default: 'Bareo Cosmetics',
      trim: true,
    },
    supportEmail: {
      type: String,
      required: true,
      default: 'care@bareo.in',
      trim: true,
      lowercase: true,
    },
    supportPhone: {
      type: String,
      required: true,
      default: '+91 1800 300 3000',
      trim: true,
    },
    freeShippingThreshold: {
      type: Number,
      required: true,
      default: 499,
      min: 0,
    },
    gstRate: {
      type: Number,
      required: true,
      default: 18,
      min: 0,
      max: 100,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
    },
    maintenanceMode: {
      type: Boolean,
      required: true,
      default: false,
    },
    aiAssistantEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export const StoreSettings = mongoose.model<IStoreSettings>(
  'StoreSettings',
  storeSettingsSchema
)
