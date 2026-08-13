import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'

export interface ApiError extends Error {
  statusCode?: number
  errorCode?: string
  isOperational?: boolean
}

export const errorHandler = (
  err: ApiError | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  const isOperational = 'isOperational' in err ? err.isOperational : false

  if (!isOperational) {
    console.error(`[CRITICAL ERROR] ${req.method} ${req.url} - ${statusCode}: ${message}`)
    if (err.stack) console.error(err.stack)
  } else {
    console.warn(`[Operational Warning] ${req.method} ${req.url} - ${statusCode}: ${message}`)
  }

  const responsePayload: Record<string, any> = {
    data: null,
    message,
    status: statusCode,
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    responsePayload.stack = err.stack
  }

  res.status(statusCode).json(responsePayload)
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    data: null,
    message: `Route not found - ${req.originalUrl}`,
    status: 404,
  })
}
