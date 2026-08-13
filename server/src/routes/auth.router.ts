import { Router } from 'express'
import {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/auth.controller.js'
import { authGuard, authRateLimiter } from '../middlewares/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Rate-limited Auth Endpoints (5 attempts per 15 mins per IP)
router.post('/register', authRateLimiter, asyncHandler(register))
router.post('/login', authRateLimiter, asyncHandler(login))

// Authenticated User Session
router.get('/me', authGuard, asyncHandler(getMe))

// Password Reset Pipeline (Forgot Password Rate Limited)
router.post('/forgot-password', authRateLimiter, asyncHandler(forgotPassword))
router.post('/verify-otp', asyncHandler(verifyOtp))
router.post('/reset-password', asyncHandler(resetPassword))

export default router
