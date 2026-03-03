import { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../models/types';
import logger from '../logger';

/**
 * 自定义API错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

/**
 * 常见错误工厂函数
 */
export const createError = {
  badRequest: (message: string, details?: unknown) =>
    new AppError(message, 400, 'BAD_REQUEST', details),

  notFound: (message: string = 'Resource not found') =>
    new AppError(message, 404, 'NOT_FOUND'),

  internal: (message: string = 'Internal server error', details?: unknown) =>
    new AppError(message, 500, 'INTERNAL_ERROR', details),

  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    new AppError(message, 503, 'SERVICE_UNAVAILABLE'),
};

/**
 * 错误处理中间件
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 记录错误日志
  logger.error(`Error on ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    ...(err instanceof AppError && { code: err.code, details: err.details }),
  });

  // 构建错误响应
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorResponse: { error: ApiError } = {
    error: {
      code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
      message: err.message,
    },
  };

  // 开发环境下包含详细信息
  if (process.env.NODE_ENV !== 'production' && err instanceof AppError && err.details) {
    errorResponse.error.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404处理中间件
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

export default { errorHandler, notFoundHandler, AppError, createError };
