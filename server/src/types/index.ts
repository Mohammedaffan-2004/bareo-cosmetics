import { Request } from 'express'
import { JwtPayload } from '../utils/jwt.js'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: string }
}

export interface ApiResponse<T = any> {
  data: T
  message: string
  status: number
}
