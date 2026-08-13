import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { recommendationService } from '../services/ai/recommendation.service.js'
import { success, badRequest } from '../utils/response.js'

export const getRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const category = req.query.category as string | undefined
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6

  const items = await recommendationService.getRecommendations(userId, { category, limit })
  return success(res, { items }, 'Recommendations generated successfully')
}

export const getProductCompatibility = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id
  const productId = req.params.productId as string

  if (!productId) {
    return badRequest(res, 'Product ID or slug is required')
  }

  const compatibility = await recommendationService.getProductCompatibility(productId, userId)
  return success(res, compatibility, 'Product compatibility evaluated successfully')
}
