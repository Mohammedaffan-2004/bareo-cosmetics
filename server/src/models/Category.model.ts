import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  id: string
  name: string
  slug: string
  image: string
  description?: string
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, required: true },
    description: { type: String },
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

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
export default Category
