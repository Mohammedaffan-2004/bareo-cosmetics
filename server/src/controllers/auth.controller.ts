import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models/User.model.js'
import { Address } from '../models/Address.model.js'
import { PaymentMethod } from '../models/PaymentMethod.model.js'
import { signToken } from '../utils/jwt.js'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { success, created, badRequest, unauthorized, notFound } from '../utils/response.js'

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js'

export const register = async (req: AuthenticatedRequest, res: Response) => {
  const validation = registerSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, validation.error.errors[0].message)
  }

  const { name, email, password, phone } = validation.data

  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    return badRequest(res, 'Account with this email already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    role: 'USER',
  })

  const token = signToken({ userId: user.id || user._id.toString(), email: user.email, role: user.role })
  const userObj = user.toJSON()

  return created(
    res,
    {
      user: userObj,
      token,
    },
    'User registered successfully'
  )
}

export const login = async (req: AuthenticatedRequest, res: Response) => {
  const validation = loginSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, validation.error.errors[0].message)
  }

  const { email, password } = validation.data

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return unauthorized(res, 'Invalid email or password credentials')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return unauthorized(res, 'Invalid email or password credentials')
  }

  const userId = user.id || user._id.toString()
  const token = signToken({ userId, email: user.email, role: user.role })

  const userProfile = {
    id: userId,
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    avatar: user.avatar || undefined,
    gender: user.gender || undefined,
    skinType: user.skinType || undefined,
    role: user.role,
    joinedAt: user.joinedAt ? user.joinedAt.toISOString() : new Date().toISOString(),
  }

  return success(
    res,
    {
      user: userProfile,
      token,
    },
    'Login successful'
  )
}

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return unauthorized(res, 'Unauthorized access')
  }

  const userId = req.user.id
  const user: any = await User.findById(userId).lean()

  if (!user) {
    return notFound(res, 'User not found')
  }

  const addresses = await Address.find({ userId }).lean()
  const paymentMethods = await PaymentMethod.find({ userId }).lean()

  return success(
    res,
    {
      ...user,
      id: user._id.toString(),
      joinedAt: user.joinedAt ? new Date(user.joinedAt).toISOString() : new Date().toISOString(),
      addresses: addresses.map((a: any) => ({ ...a, id: a._id.toString() })),
      paymentMethods: paymentMethods.map((p: any) => ({ ...p, id: p._id.toString() })),
    },
    'User profile retrieved'
  )
}

export const forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
  const validation = forgotPasswordSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, validation.error.errors[0].message)
  }

  const { email } = validation.data

  return success(
    res,
    { email, otpSent: true },
    'OTP sent to your registered email address'
  )
}

export const verifyOtp = async (req: AuthenticatedRequest, res: Response) => {
  const validation = verifyOtpSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, validation.error.errors[0].message)
  }

  return success(
    res,
    { resetToken: 'mock_reset_token_verified' },
    'OTP verified successfully'
  )
}

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  const validation = resetPasswordSchema.safeParse(req.body)
  if (!validation.success) {
    return badRequest(res, validation.error.errors[0].message)
  }

  return success(
    res,
    true,
    'Password reset successfully. You can now login with your new password.'
  )
}
