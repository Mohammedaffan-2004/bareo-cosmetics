import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { aiService } from '../services/ai/ai.service.js'
import { success, created, badRequest } from '../utils/response.js'

export const submitConsultation = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const { answers } = req.body

  if (!answers) {
    return badRequest(res, 'Consultation answers are required')
  }

  const result = await aiService.createConsultation(userId, req.body)

  return created(res, result, 'AI Consultation generated successfully!')
}

export const getConsultations = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const consultations = await aiService.getUserConsultations(userId)

  return success(res, consultations, 'Consultation history retrieved')
}

export const sendChatMessage = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const { message } = req.body

  if (!message) {
    return badRequest(res, 'Message text is required')
  }

  const reply = await aiService.generateChatReply(userId, message)

  return success(res, reply, 'Response generated')
}

export const getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id
  const history = await aiService.getChatHistory(userId)

  return success(res, history, 'Chat history retrieved')
}
