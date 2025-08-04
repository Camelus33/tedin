import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { APIError } from './errorHandler';

/**
 * Rate limiting for API endpoints
 */
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Specific rate limiter for search endpoints
 */
export const searchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: '검색 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for embedding generation
 */
export const embeddingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour
  message: {
    error: '임베딩 생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Input validation middleware
 */
export const validateSearchInput = (req: Request, res: Response, next: NextFunction) => {
  const { query, userId } = req.body;

  if (!query || typeof query !== 'string') {
    throw new APIError('검색 쿼리가 필요합니다.', 400);
  }

  if (query.length > 1000) {
    throw new APIError('검색 쿼리가 너무 깁니다. (최대 1000자)', 400);
  }

  if (!userId || typeof userId !== 'string') {
    throw new APIError('사용자 ID가 필요합니다.', 400);
  }

  // Sanitize query (basic XSS prevention)
  const sanitizedQuery = query.replace(/[<>]/g, '');
  req.body.query = sanitizedQuery;

  next();
};

/**
 * Content security middleware
 */
export const contentSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

/**
 * API key validation middleware
 */
export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

  if (!apiKey) {
    throw new APIError('API 키가 필요합니다.', 401);
  }

  // Basic API key validation (you might want to implement more sophisticated validation)
  if (typeof apiKey !== 'string' || apiKey.length < 10) {
    throw new APIError('유효하지 않은 API 키입니다.', 401);
  }

  next();
};

/**
 * Request size limiter
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');

  if (contentLength > 1024 * 1024) { // 1MB limit
    throw new APIError('요청 크기가 너무 큽니다. (최대 1MB)', 413);
  }

  next();
};

/**
 * CORS configuration for specific origins
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'https://habitus33.vercel.app',
      'http://localhost:3000',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400, // 24 hours
}; 