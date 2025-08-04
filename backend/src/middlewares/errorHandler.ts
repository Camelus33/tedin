import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // If it's not our custom APIError, create one
  if (!(err instanceof APIError)) {
    error = new APIError(err.message, 500);
  }

  const apiError = error as APIError;

  // Log error
  console.error('API Error:', {
    message: apiError.message,
    statusCode: apiError.statusCode,
    stack: apiError.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  res.status(apiError.statusCode).json({
    success: false,
    error: {
      message: apiError.message,
      statusCode: apiError.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
    },
  });
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  throw new APIError('찾으시는 페이지가 숨어있네요. 다른 곳에서 만나요!', 404);
}; 