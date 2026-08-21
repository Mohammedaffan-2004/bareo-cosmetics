import { AiConsultation } from '../../models/AiConsultation.model.js'
import { ChatMessage } from '../../models/ChatMessage.model.js'
import { User } from '../../models/User.model.js'
import { Product } from '../../models/Product.model.js'

export class AiService {
  /**
   * Helper to format raw consultation document to JSON response structure.
   * STRICT POSITIVE GATE: Photo analysis is enabled ONLY if eligible === true strictly.
   */
  private formatConsultation(c: any) {
    const rawReport = c.report || {}

    const hasValidPhoto = Boolean(
      c.hasPhotoAnalysis === true &&
      c.dermalMetrics &&
      c.dermalMetrics.imageQuality?.usable === true &&
      c.dermalMetrics.eligibility?.eligible === true
    )

    const report = {
      ...rawReport,
      analysisVersion: rawReport.analysisVersion || '2.5',
      analysisSource: hasValidPhoto ? (rawReport.analysisSource || 'questionnaire+selfie') : 'questionnaire',
      barrier: rawReport.barrier || rawReport.acneRisk || { label: 'Barrier Resilience', score: 75, status: 'good', detail: 'Lipid barrier integrity intact.' },
    }

    return {
      id: c._id?.toString() || c.id,
      userId: c.userId,
      date: c.date ? new Date(c.date).toISOString() : (c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()),
      answers: c.answers || {},
      hasPhotoAnalysis: hasValidPhoto,
      dermalMetrics: hasValidPhoto ? c.dermalMetrics : undefined,
      report,
      routine: c.routine || { morning: { name: 'Morning Routine', time: '5 min', products: [] }, night: { name: 'Night Routine', time: '6 min', products: [] } },
      lifestyleTips: c.lifestyleTips || [],
      recommendedProductIds: c.recommendedProductIds || [],
    }
  }

  /**
   * Helper to format raw ChatMessage document.
   */
  private formatChatMessage(m: any) {
    return {
      id: m._id?.toString() || m.id,
      role: m.role,
      text: m.text || '',
      type: m.type || 'text',
      products: m.products || undefined,
      timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
    }
  }

  /**
   * Persist user consultation and update user skin profile (skinType & concerns).
   * STRICT POSITIVE GATE: Photo analysis is activated ONLY when payload.dermalMetrics.eligibility.eligible === true strictly.
   */
  async createConsultation(userId: string, payload: any) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid consultation payload')
    }

    const {
      answers = {},
      hasPhotoAnalysis,
      dermalMetrics,
      report = {},
      routine = {},
      lifestyleTips = [],
      recommendedProductIds = [],
    } = payload

    const clampScore = (val: any, fallback: number | null = null): number | null => {
      if (val === null || val === undefined) return fallback
      const num = Number(val)
      if (isNaN(num)) return fallback
      return Math.min(100, Math.max(0, Math.round(num)))
    }

    const hasQuestionnaire = Boolean(
      answers.skinType ||
      (answers.concerns && Array.isArray(answers.concerns) && answers.concerns.length > 0) ||
      answers.age ||
      answers.oilySkin || answers.drySkin || answers.hasSensitiveSkin
    )

    // STRICT POSITIVE GATE (Must be true boolean primitive, not truthy string or object or missing)
    const hasSelfie = Boolean(
      hasPhotoAnalysis === true &&
      dermalMetrics &&
      dermalMetrics.imageQuality?.usable === true &&
      dermalMetrics.eligibility?.eligible === true
    )

    const isComplete = report.isComplete !== false && (hasQuestionnaire || hasSelfie)

    const validatedSkinScore = isComplete ? clampScore(report.skinScore, 75) : null
    const validatedConfidence = isComplete ? clampScore(report.confidence, 80) : 0

    const sanitizeMetric = (m: any, defaultLabel: string) => {
      if (!m || typeof m !== 'object') {
        return {
          label: defaultLabel,
          score: hasSelfie || hasQuestionnaire ? 75 : null,
          level: (hasSelfie || hasQuestionnaire ? 'good' : 'insufficient-data') as any,
          evidence: (hasSelfie ? 'measured' : hasQuestionnaire ? 'inferred' : 'insufficient-data') as any,
          status: (hasSelfie || hasQuestionnaire ? 'good' : 'insufficient-data') as any,
          detail: 'Metric derived from skin assessment.',
          confidence: validatedConfidence,
          source: hasSelfie ? ['questionnaire', 'selfie'] : ['questionnaire'],
        }
      }

      const scoreVal = clampScore(m.score, null)
      const level = m.level || (m.status && ['good', 'fair', 'low'].includes(m.status) ? m.status : 'good')
      const evidence = hasSelfie ? 'measured' : (hasQuestionnaire ? 'inferred' : 'insufficient-data')

      return {
        label: m.label || defaultLabel,
        score: scoreVal,
        level,
        evidence,
        status: level,
        detail: m.detail || 'Metric derived from skin assessment.',
        confidence: clampScore(m.confidence, validatedConfidence),
        source: hasSelfie ? ['questionnaire', 'selfie'] : ['questionnaire'],
      }
    }

    const sanitizedReport = {
      analysisVersion: report.analysisVersion || '2.5',
      skinScore: validatedSkinScore,
      confidence: validatedConfidence,
      analysisSource: hasSelfie ? 'questionnaire+selfie' : (hasQuestionnaire ? 'questionnaire' : 'insufficient-data'),
      isComplete,
      dataQuality: {
        questionnaireScore: clampScore(report.dataQuality?.questionnaireScore, hasQuestionnaire ? 80 : 0),
        selfieScore: clampScore(report.dataQuality?.selfieScore, hasSelfie ? 85 : 0),
        overallConfidence: validatedConfidence,
        imageQualityReason: hasSelfie ? (report.dataQuality?.imageQualityReason || 'Optimal lighting and facial detail.') : 'Derived from survey responses.',
      },
      primaryFocus: report.primaryFocus && typeof report.primaryFocus === 'object' ? {
        key: report.primaryFocus.key || 'hydration',
        label: report.primaryFocus.label || 'Deep Hydration Support',
        reasoning: report.primaryFocus.reasoning || 'Targeted hydration is your primary skin focus.',
      } : undefined,
      secondaryFocus: report.secondaryFocus && typeof report.secondaryFocus === 'object' ? {
        key: report.secondaryFocus.key || 'barrier',
        label: report.secondaryFocus.label || 'Lipid Barrier Repair',
        reasoning: report.secondaryFocus.reasoning || 'Reinforcing ceramides locks in hydration.',
      } : undefined,
      hydration: sanitizeMetric(report.hydration, 'Hydration Index'),
      oilBalance: sanitizeMetric(report.oilBalance, 'Oil Balance'),
      sensitivity: sanitizeMetric(report.sensitivity, 'Sensitivity Threshold'),
      barrier: sanitizeMetric(report.barrier || report.acneRisk, 'Lipid Barrier Resilience'),
      pigmentation: sanitizeMetric(report.pigmentation, 'Pigmentation Uniformity'),
      elasticity: sanitizeMetric(report.elasticity, 'Elasticity & Collagen Index'),
      summary: Array.isArray(report.summary) && report.summary.length > 0 ? report.summary : ['Skin profile derived from assessment signals.'],
    }

    const consultation = await AiConsultation.create({
      userId: userId || undefined,
      date: new Date(),
      answers,
      hasPhotoAnalysis: hasSelfie,
      dermalMetrics: hasSelfie ? dermalMetrics : undefined,
      report: sanitizedReport,
      routine: routine || {},
      lifestyleTips: Array.isArray(lifestyleTips) ? lifestyleTips : [],
      recommendedProductIds: Array.isArray(recommendedProductIds) ? recommendedProductIds : [],
    })

    if (userId) {
      try {
        const updateDoc: any = {}
        if (answers.skinType) {
          updateDoc.skinType = answers.skinType
        }
        if (answers.concerns && Array.isArray(answers.concerns) && answers.concerns.length > 0) {
          updateDoc.skinConcerns = answers.concerns
        }
        if (Object.keys(updateDoc).length > 0) {
          await User.findByIdAndUpdate(userId, { $set: updateDoc })
        }
      } catch (err) {
        console.warn('[AI Service] Failed to update user skin profile:', err)
      }
    }

    return this.formatConsultation(consultation)
  }

  /**
   * Get all saved consultations for a user.
   */
  async getUserConsultations(userId: string) {
    if (!userId) return []
    const consultations = await AiConsultation.find({ userId }).sort({ createdAt: -1 }).exec()
    return consultations.map((c) => this.formatConsultation(c))
  }

  /**
   * Get chat history for user.
   */
  async getChatHistory(userId: string) {
    if (!userId) return []
    const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 }).exec()
    return messages.map((m) => this.formatChatMessage(m))
  }

  /**
   * Post chat message and save assistant reply.
   */
  async handleChatMessage(userId: string, text: string) {
    if (!text || typeof text !== 'string') {
      throw new Error('Message text is required')
    }

    const userMessage = await ChatMessage.create({
      userId: userId || undefined,
      role: 'user',
      text: text.trim(),
      type: 'text',
      timestamp: new Date(),
    })

    const q = text.toLowerCase()
    let replyText = 'Our dermal intelligence system formulates routines based on barrier support and hydration. Here are recommended formulations:'
    let matchingConcerns: string[] = []

    if (q.includes('acne') || q.includes('pimple') || q.includes('breakout')) {
      replyText = 'For active acne, look for salicylic acid or azelaic acid. Here are formulations matching your profile:'
      matchingConcerns = ['acne']
    } else if (q.includes('pigment') || q.includes('dark spot') || q.includes('tan')) {
      replyText = 'Pigmentation needs vitamin C in the AM and broad-spectrum SPF. Try these brightening formulations:'
      matchingConcerns = ['pigmentation']
    } else if (q.includes('dry') || q.includes('flaky') || q.includes('hydrat')) {
      replyText = 'Dehydration is under the surface. Pair a hydrating toner with a hyaluronic serum and seal with ceramides:'
      matchingConcerns = ['dryness']
    } else if (q.includes('oily') || q.includes('shine') || q.includes('pore')) {
      replyText = 'Oil control starts with niacinamide and lightweight gel hydrators:'
      matchingConcerns = ['oiliness']
    }

    let recommendedProducts: any[] = []
    if (matchingConcerns.length > 0) {
      recommendedProducts = await Product.find({
        concerns: { $in: matchingConcerns },
        status: 'active',
        stock: { $gt: 0 },
      })
        .sort({ rating: -1 })
        .limit(3)
        .exec()
    }

    if (recommendedProducts.length === 0) {
      recommendedProducts = await Product.find({ status: 'active', stock: { $gt: 0 } })
        .sort({ rating: -1 })
        .limit(3)
        .exec()
    }

    const productIds = recommendedProducts.map((p) => p._id)

    const assistantMessage = await ChatMessage.create({
      userId: userId || undefined,
      role: 'assistant',
      text: replyText,
      type: 'product_recommendation',
      products: productIds,
      timestamp: new Date(),
    })

    return {
      userMessage: this.formatChatMessage(userMessage),
      assistantMessage: this.formatChatMessage(assistantMessage),
    }
  }
}

export const aiService = new AiService()
