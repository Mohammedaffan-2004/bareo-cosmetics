import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt.js'
import { User } from '../models/User.model.js'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: string }
}

// In-Memory Authentication Rate Limiter (5 attempts per 15 minute window per IP)
interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

export const authRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    'unknown-ip'

  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5

  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    })
    return next()
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      data: null,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      status: 429,
    })
  }

  record.count += 1
  return next()
}

export const authGuard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        data: null,
        message: 'Authentication token missing or invalid',
        status: 401,
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const userDoc: any = await User.findById(decoded.userId).select('id email role').lean()

    if (!userDoc) {
      return res.status(401).json({
        data: null,
        message: 'User session no longer valid',
        status: 401,
      })
    }

    const userId = userDoc._id?.toString() || userDoc.id

    req.user = {
      id: userId,
      userId: userId,
      email: userDoc.email,
      role: userDoc.role,
    }

    next()
  } catch (error) {
    return res.status(401).json({
      data: null,
      message: 'Invalid or expired authentication token',
      status: 401,
    })
  }
}

export const adminGuard = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      data: null,
      message: 'Access denied: Admin privileges required',
      status: 403,
    })
  }
  next()
}

export const optionalAuthGuard = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      if (token && !token.startsWith('mock-')) {
        const decoded = verifyToken(token)
        const userDoc: any = await User.findById(decoded.userId).select('id email role').lean()
        if (userDoc) {
          const userId = userDoc._id?.toString() || userDoc.id
          req.user = {
            id: userId,
            userId: userId,
            email: userDoc.email,
            role: userDoc.role,
          }
        }
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next()
}
