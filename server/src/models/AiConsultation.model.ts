import mongoose, { Schema, Document } from 'mongoose'

export interface IAiMetric {
  label: string
  score: number
  status: 'good' | 'fair' | 'low'
  detail: string
}

export interface IAiReport {
  skinScore: number | null
  confidence?: number
  analysisSource?: 'questionnaire+selfie' | 'questionnaire' | 'selfie' | 'insufficient-data'
  isComplete?: boolean
  hydration: IAiMetric
  oilBalance: IAiMetric
  sensitivity: IAiMetric
  barrier: IAiMetric
  acneRisk?: IAiMetric
  pigmentation: IAiMetric
  elasticity: IAiMetric
  summary: string[]
}

export interface IAiRoutineStep {
  name: string
  time: string
  products: any[]
}

export interface IAiConsultationAnswers {
  age?: number
  gender?: string
  skinType?: string
  concerns?: string[]
  sleepHours?: string
  waterIntake?: string
  sunExposure?: string
  oilySkin?: boolean
  drySkin?: boolean
  hasSensitiveSkin?: boolean
  hasDarkCircles?: boolean
}

export interface IAiConsultation extends Document {
  id: string
  userId: string
  date: Date
  answers: IAiConsultationAnswers
  selfie?: string
  report: IAiReport
  routine: {
    morning: IAiRoutineStep
    night: IAiRoutineStep
  }
  lifestyleTips: string[]
  recommendedProductIds: string[]
  createdAt: Date
  updatedAt: Date
}

const MetricSchema = new Schema<IAiMetric>(
  {
    label: { type: String, required: true },
    score: { type: Number, required: true },
    status: { type: String, enum: ['good', 'fair', 'low'], required: true },
    detail: { type: String, required: true },
  },
  { _id: false }
)

const RoutineStepSchema = new Schema<IAiRoutineStep>(
  {
    name: { type: String, required: true },
    time: { type: String, required: true },
    products: [{ type: Schema.Types.Mixed }],
  },
  { _id: false }
)

const AiConsultationSchema = new Schema<IAiConsultation>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now },
    answers: {
      age: Number,
      gender: String,
      skinType: String,
      concerns: [String],
      sleepHours: String,
      waterIntake: String,
      sunExposure: String,
      oilySkin: Boolean,
      drySkin: Boolean,
      hasSensitiveSkin: Boolean,
      hasDarkCircles: Boolean,
    },
    selfie: { type: String },
    report: {
      skinScore: { type: Number, default: null },
      confidence: { type: Number, default: 0 },
      analysisSource: { type: String, enum: ['questionnaire+selfie', 'questionnaire', 'selfie', 'insufficient-data'], default: 'insufficient-data' },
      isComplete: { type: Boolean, default: true },
      hydration: MetricSchema,
      oilBalance: MetricSchema,
      sensitivity: MetricSchema,
      barrier: MetricSchema,
      acneRisk: MetricSchema,
      pigmentation: MetricSchema,
      elasticity: MetricSchema,
      summary: [{ type: String }],
    },
    routine: {
      morning: RoutineStepSchema,
      night: RoutineStepSchema,
    },
    lifestyleTips: [{ type: String }],
    recommendedProductIds: [{ type: String }],
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

AiConsultationSchema.index({ userId: 1, createdAt: -1 })

export const AiConsultation = mongoose.models.AiConsultation || mongoose.model<IAiConsultation>('AiConsultation', AiConsultationSchema)
export default AiConsultation
