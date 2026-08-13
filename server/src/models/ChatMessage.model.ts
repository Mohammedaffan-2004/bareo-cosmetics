import mongoose, { Schema, Document } from 'mongoose'

export interface IChatMessage extends Document {
  id: string
  userId: string
  role: 'user' | 'assistant'
  text?: string
  type: string
  products?: any[]
  timestamp: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String },
    type: { type: String, default: 'text' },
    products: [{ type: Schema.Types.Mixed }],
    timestamp: { type: Date, default: Date.now },
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

ChatMessageSchema.index({ userId: 1, timestamp: 1 })

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)
export default ChatMessage
