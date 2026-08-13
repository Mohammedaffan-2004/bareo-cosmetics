import { Response } from 'express'

/**
 * Standardized API Response Helper Utilities.
 * Guarantees uniform HTTP response envelopes matching { data, message, status }.
 */

export function success<T = any>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    data,
    message,
    status: statusCode,
  })
}

export function created<T = any>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response {
  return res.status(201).json({
    data,
    message,
    status: 201,
  })
}

export function badRequest(
  res: Response,
  message: string = 'Bad request'
): Response {
  return res.status(400).json({
    data: null,
    message,
    status: 400,
  })
}

export function unauthorized(
  res: Response,
  message: string = 'Unauthorized access'
): Response {
  return res.status(401).json({
    data: null,
    message,
    status: 401,
  })
}

export function forbidden(
  res: Response,
  message: string = 'Forbidden access'
): Response {
  return res.status(403).json({
    data: null,
    message,
    status: 403,
  })
}

export function notFound(
  res: Response,
  message: string = 'Resource not found'
): Response {
  return res.status(404).json({
    data: null,
    message,
    status: 404,
  })
}

export function conflict(
  res: Response,
  message: string = 'Resource already exists'
): Response {
  return res.status(409).json({
    data: null,
    message,
    status: 409,
  })
}

export function serverError(
  res: Response,
  message: string = 'Internal server error'
): Response {
  return res.status(500).json({
    data: null,
    message,
    status: 500,
  })
}
