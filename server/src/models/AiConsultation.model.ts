import mongoose, { Schema, Document } from 'mongoose'

export interface IAiMetric {
  label: string
  score: number | null
  level?: 'good' | 'fair' | 'low' | 'insufficient-data'
  evidence?: 'measured' | 'inferred' | 'insufficient-data'
  status?: 'good' | 'fair' | 'low' | 'measured' | 'inferred' | 'insufficient-data'
  detail: string
  confidence?: number
  source?: string[]
}

export interface IAiFocusArea {
  key: string
  label: string
  reasoning: string
}

export interface IAiDataQuality {
  questionnaireScore: number
  selfieScore: number
  overallConfidence: number
  imageQualityReason?: string
}

export interface IAiReport {
  analysisVersion?: string
  skinScore: number | null
  confidence?: number
  analysisSource?: 'questionnaire+selfie' | 'questionnaire' | 'selfie' | 'insufficient-data'
  isComplete?: boolean
  primaryFocus?: IAiFocusArea
  secondaryFocus?: IAiFocusArea
  dataQuality?: IAiDataQuality
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
  hasPhotoAnalysis?: boolean
  dermalMetrics?: Record<string, any>
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
    score: { type: Number, default: null },
    level: { type: String, enum: ['good', 'fair', 'low', 'insufficient-data'], default: 'insufficient-data' },
    evidence: { type: String, enum: ['measured', 'inferred', 'insufficient-data'], default: 'insufficient-data' },
    status: { type: String, enum: ['good', 'fair', 'low', 'measured', 'inferred', 'insufficient-data'], default: 'insufficient-data' },
    detail: { type: String, required: true },
    confidence: { type: Number },
    source: [{ type: String }],
  },
  { _id: false }
)

const FocusAreaSchema = new Schema<IAiFocusArea>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    reasoning: { type: String, required: true },
  },
  { _id: false }
)

const DataQualitySchema = new Schema<IAiDataQuality>(
  {
    questionnaireScore: { type: Number, default: 0 },
    selfieScore: { type: Number, default: 0 },
    overallConfidence: { type: Number, default: 0 },
    imageQualityReason: { type: String },
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
    hasPhotoAnalysis: { type: Boolean, default: false },
    dermalMetrics: { type: Schema.Types.Mixed },
    report: {
      analysisVersion: { type: String, default: '1.0' },
      skinScore: { type: Number, default: null },
      confidence: { type: Number, default: 0 },
      analysisSource: { type: String, enum: ['questionnaire+selfie', 'questionnaire', 'selfie', 'insufficient-data'], default: 'insufficient-data' },
      isComplete: { type: Boolean, default: true },
      primaryFocus: FocusAreaSchema,
      secondaryFocus: FocusAreaSchema,
      dataQuality: DataQualitySchema,
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
