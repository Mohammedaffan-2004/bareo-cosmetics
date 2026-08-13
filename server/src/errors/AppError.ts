import { ErrorCode, ErrorCodes } from './ErrorCodes.js'

/**
 * Custom Operational Application Error Class.
 * Extends native JavaScript Error supporting HTTP status codes, domain error codes,
 * and operational flags.
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly errorCode: ErrorCode
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 400,
    errorCode: ErrorCode = ErrorCodes.BAD_REQUEST,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }

  // Factory Helper Methods for Express Controllers & Services
  static badRequest(message: string, errorCode: ErrorCode = ErrorCodes.BAD_REQUEST): AppError {
    return new AppError(message, 400, errorCode)
  }

  static unauthorized(message: string = 'Unauthorized access', errorCode: ErrorCode = ErrorCodes.AUTH_UNAUTHORIZED): AppError {
    return new AppError(message, 401, errorCode)
  }

  static forbidden(message: string = 'Forbidden access', errorCode: ErrorCode = ErrorCodes.AUTH_FORBIDDEN): AppError {
    return new AppError(message, 403, errorCode)
  }

  static notFound(message: string = 'Resource not found', errorCode: ErrorCode = ErrorCodes.BAD_REQUEST): AppError {
    return new AppError(message, 404, errorCode)
  }

  static conflict(message: string = 'Resource conflict', errorCode: ErrorCode = ErrorCodes.BAD_REQUEST): AppError {
    return new AppError(message, 409, errorCode)
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR, false)
  }
}
