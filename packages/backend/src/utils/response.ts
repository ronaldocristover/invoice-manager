import { Response } from 'express'
import logger from '../lib/logger.js'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  }
  res.status(statusCode).json(response)
}

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500
): void => {
  const response: ApiResponse = {
    success: false,
    error
  }
  res.status(statusCode).json(response)
}

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  }
): void => {
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1
    }
  }
  res.status(200).json(response)
}

export const handleAsync = <T>(
  fn: (req: any, res: any, next: any) => Promise<T>
) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

