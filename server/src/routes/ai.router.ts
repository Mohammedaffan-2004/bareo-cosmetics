import { Router } from 'express'
import {
  submitConsultation,
  getConsultations,
  sendChatMessage,
  getChatHistory,
} from '../controllers/ai.controller.js'
import { authGuard } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(authGuard)

router.post('/consultation', asyncHandler(submitConsultation))
router.get('/consultations', asyncHandler(getConsultations))
router.post('/chat', asyncHandler(sendChatMessage))
router.get('/chat', asyncHandler(getChatHistory))

export default router
