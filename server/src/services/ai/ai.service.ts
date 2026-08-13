import { AiConsultation } from '../../models/AiConsultation.model.js'
import { ChatMessage } from '../../models/ChatMessage.model.js'
import { User } from '../../models/User.model.js'
import { Product } from '../../models/Product.model.js'

export class AiService {
  /**
   * Helper to format raw consultation document to JSON response structure.
   */
  private formatConsultation(c: any) {
    const rawReport = c.report || {}
    const report = {
      ...rawReport,
      barrier: rawReport.barrier || rawReport.acneRisk || { label: 'Barrier Resilience', score: 75, status: 'good', detail: 'Lipid barrier integrity intact.' },
    }

    return {
      id: c._id?.toString() || c.id,
      userId: c.userId,
      date: c.date ? new Date(c.date).toISOString() : (c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()),
      answers: c.answers || {},
      selfie: c.selfie || undefined,
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
   */
  async createConsultation(userId: string, payload: any) {
    const { answers = {}, selfie, report = {}, routine = {}, lifestyleTips = [], recommendedProductIds = [] } = payload

    const hasQuestionnaire = Boolean(
      answers.skinType ||
      (answers.concerns && answers.concerns.length > 0) ||
      answers.age ||
      answers.oilySkin || answers.drySkin || answers.hasSensitiveSkin
    )
    const hasSelfie = Boolean(selfie)
    const isComplete = report.isComplete !== false && (hasQuestionnaire || hasSelfie)

    const normalizedReport = {
      ...report,
      skinScore: isComplete ? (report.skinScore ?? null) : null,
      confidence: isComplete ? (report.confidence ?? (hasSelfie ? 90 : 72)) : 0,
      analysisSource: isComplete
        ? (report.analysisSource || (hasSelfie && hasQuestionnaire ? 'questionnaire+selfie' : hasSelfie ? 'selfie' : 'questionnaire'))
        : 'insufficient-data',
      isComplete,
    }

    const consultation = await AiConsultation.create({
      userId,
      answers,
      selfie: selfie || undefined,
      report: normalizedReport,
      routine,
      lifestyleTips,
      recommendedProductIds,
    })

    // Synchronize User Skin Profile ONLY when valid questionnaire data exists
    if (isComplete && (answers.skinType || (answers.concerns && Array.isArray(answers.concerns)))) {
      const user = await User.findById(userId)
      if (user) {
        if (answers.skinType) user.skinType = answers.skinType
        if (answers.concerns && Array.isArray(answers.concerns) && answers.concerns.length > 0) {
          user.concerns = answers.concerns
        }
        await user.save()
      }
    }

    return this.formatConsultation(consultation.toObject())
  }

  /**
   * Fetch user's consultation history from MongoDB.
   */
  async getUserConsultations(userId: string) {
    const consultations = await AiConsultation.find({ userId }).sort({ createdAt: -1 }).lean()
    return consultations.map((c) => this.formatConsultation(c))
  }

  /**
   * Fetch single consultation by ID.
   */
  async getConsultationById(userId: string, consultationId: string) {
    const consultation = await AiConsultation.findOne({ _id: consultationId, userId }).lean()
    if (!consultation) {
      throw new Error('Consultation not found')
    }
    return this.formatConsultation(consultation)
  }

  /**
   * Save a chat message to MongoDB.
   */
  async saveChatMessage(userId: string, role: 'user' | 'assistant', text: string, products?: any[]) {
    const msg = await ChatMessage.create({
      userId,
      role,
      text,
      products: products || undefined,
      timestamp: new Date(),
    })
    return this.formatChatMessage(msg.toObject())
  }

  /**
   * Retrieve chat conversation history for user from MongoDB.
   */
  async getChatHistory(userId: string) {
    const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 }).lean()
    return messages.map((m) => this.formatChatMessage(m))
  }

  /**
   * Generate assistant reply text & matched products based on query keywords.
   */
  async generateChatReply(userId: string, message: string) {
    const query = message.toLowerCase()
    
    // Save user's incoming message first
    await this.saveChatMessage(userId, 'user', message)

    const products = await Product.find({ status: 'active' }).limit(3).lean()
    const formattedProducts = products.map((p: any) => ({
      ...p,
      id: p._id?.toString() || p.id,
    }))

    let replyText = 'For optimal skin health, we recommend maintaining a consistent pH-balanced cleanser, target serum, and non-comedogenic SPF 50+ sunscreen daily.'
    let matchedProducts = formattedProducts.slice(0, 2)

    if (query.includes('acne') || query.includes('pimple') || query.includes('blackhead') || query.includes('breakout')) {
      replyText = 'For active acne, look for salicylic acid or azelaic acid. Here are the ones our community rates highest:'
      matchedProducts = formattedProducts
    } else if (query.includes('dry') || query.includes('flaky') || query.includes('hydration') || query.includes('barrier')) {
      replyText = 'Dehydration is under the surface. Pair a hydrating toner with a hyaluronic serum and seal with ceramides:'
      matchedProducts = formattedProducts
    } else if (query.includes('sun') || query.includes('spf') || query.includes('uv')) {
      replyText = 'Our Ultra-Light Invisible Sunscreen SPF 50+ PA++++ provides zero white-cast broad spectrum defense.'
      matchedProducts = formattedProducts.slice(0, 1)
    } else if (query.includes('wrinkle') || query.includes('aging') || query.includes('fine line')) {
      replyText = 'For early aging, introduce a gentle retinal night serum and peptides. Gradual, gentle, consistent application works best.'
      matchedProducts = formattedProducts
    }

    // Save assistant's reply message
    const assistantMsg = await this.saveChatMessage(userId, 'assistant', replyText, matchedProducts)
    return assistantMsg
  }
}

export const aiService = new AiService()
