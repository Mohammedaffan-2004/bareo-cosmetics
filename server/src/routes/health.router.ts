import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'Lumina Skin API',
        environment: process.env.NODE_ENV || 'development',
      },
      message: 'Server is healthy',
      status: 200,
    })
  })
)

export default router
