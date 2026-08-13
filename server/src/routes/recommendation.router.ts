import { Router } from 'express'
import { getRecommendations, getProductCompatibility } from '../controllers/recommendation.controller.js'
import { optionalAuthGuard } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(optionalAuthGuard)

router.get('/recommendations', asyncHandler(getRecommendations))
router.get('/compatibility/:productId', asyncHandler(getProductCompatibility))

export default router
