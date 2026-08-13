import { Product } from '../../models/Product.model.js'
import { User } from '../../models/User.model.js'
import { AiConsultation } from '../../models/AiConsultation.model.js'
import { isValidObjectId } from '../../utils/validation.js'
import { evaluateProductSuitability, type UserSkinProfileInput, type RecommendationEngineResult } from '../../utils/recommendationEngine.js'

export class RecommendationService {
  /**
   * Constructs normalized UserSkinProfile by combining User document and latest AiConsultation.
   */
  async getUserSkinProfile(userId?: string): Promise<UserSkinProfileInput> {
    if (!userId) {
      return { hasProfile: false }
    }

    const [user, latestConsultation]: [any, any] = await Promise.all([
      User.findById(userId).lean(),
      AiConsultation.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    ])

    const skinType = user?.skinType || latestConsultation?.answers?.skinType
    const concerns = user?.concerns?.length
      ? user.concerns
      : (latestConsultation?.answers?.concerns || [])

    const isConsultationValid = latestConsultation?.report?.isComplete !== false && latestConsultation?.report?.skinScore !== null

    const metrics = isConsultationValid && latestConsultation?.report
      ? {
          hydration: latestConsultation.report.hydration?.score,
          oilBalance: latestConsultation.report.oilBalance?.score,
          sensitivity: latestConsultation.report.sensitivity?.score,
          barrier: latestConsultation.report.barrier?.score || (latestConsultation.report as any).acneRisk?.score,
          pigmentation: latestConsultation.report.pigmentation?.score,
          elasticity: latestConsultation.report.elasticity?.score,
        }
      : undefined

    const hasProfile = Boolean(skinType || (concerns && concerns.length > 0) || metrics)

    if (!hasProfile) {
      return { hasProfile: false }
    }

    return {
      hasProfile: true,
      skinType,
      concerns,
      metrics,
    }
  }

  /**
   * Generates dynamic ranked product recommendations for a user.
   */
  async getRecommendations(userId?: string, options: { category?: string; limit?: number } = {}) {
    const { category, limit = 6 } = options
    const profile = await this.getUserSkinProfile(userId)

    const query: any = { status: 'active', stock: { $gt: 0 } }
    if (category && category !== 'all' && category !== 'all-products') {
      query.$or = [{ categorySlug: category }, { categoryId: category }]
    }

    const products = await Product.find(query).lean()

    const evaluated = products.map((p: any) => {
      const evaluation = evaluateProductSuitability(p, profile)
      return {
        product: {
          ...p,
          id: p._id?.toString() || p.id,
        },
        ...evaluation,
      }
    })

    // Sort by matchPercent descending (handling nulls safely)
    evaluated.sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0))

    return evaluated.slice(0, limit)
  }

  /**
   * Calculates compatibility score and dynamic rationale for a single product.
   */
  async getProductCompatibility(productId: string, userId?: string) {
    const product: any = await Product.findOne({
      $or: [{ slug: productId }, { _id: isValidObjectId(productId) ? productId : undefined }],
    }).lean()

    if (!product) {
      const error: any = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    const profile = await this.getUserSkinProfile(userId)
    const evaluation = evaluateProductSuitability(product, profile)

    return {
      product: {
        ...product,
        id: product._id?.toString() || product.id,
      },
      ...evaluation,
    }
  }
}

export const recommendationService = new RecommendationService()
