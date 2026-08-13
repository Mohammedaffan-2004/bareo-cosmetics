import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string
  gender?: string
  skinType?: string
  concerns?: string[]
  role: 'USER' | 'ADMIN'
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    gender: { type: String },
    skinType: { type: String },
    concerns: [{ type: String }],
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString()
        delete ret._id
        delete ret.__v
        delete ret.password
        return ret
      },
    },
  }
)

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
