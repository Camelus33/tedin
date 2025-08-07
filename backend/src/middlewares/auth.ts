import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'habitus33_jwt_secret_key';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header or cookies and attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 토큰 소스 확인 (쿠키 또는 헤더)
    let token: string | undefined;
    
    // 쿠키에서 토큰 확인
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // 헤더에서 토큰 확인
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // 토큰 검증 및 사용자 확인
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
        
        // 개발 환경에서 admin@example.com 인증 우회 (이메일 확인)
        if (process.env.BYPASS_AUTH === 'true' && decoded.email === 'admin@example.com') {
          console.log('관리자 계정 인증 우회 - admin@example.com');
          const validObjectId = '507f1f77bcf86cd799439011';
          req.user = { 
            _id: validObjectId, 
            id: validObjectId,
            email: 'admin@example.com',
            roles: ['user', 'admin']
          };
          return next();
        }
        
        // 다른 사용자는 정상적인 인증 프로세스 진행
        const user = await User.findById(decoded.userId).lean();
        if (!user) {
          return res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
        }
        
        // 사용자 정보 요청에 추가
        req.user = user;
        next();
      } catch (error: any) {
        // 토큰 만료 처리
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: '인증이 만료되었습니다. 다시 로그인해주세요.', 
            code: 'TOKEN_EXPIRED'
          });
        }
        
        // 기타 토큰 오류
        return res.status(401).json({ error: '유효하지 않은 인증 정보입니다.' });
      }
    } else {
      // 개발 환경에서만 기본 관리자 계정으로 인증 우회 (토큰 없을 때)
      if (process.env.BYPASS_AUTH === 'true') {
        console.log('개발 환경 인증 우회 - 토큰 없음');
        // 유효한 MongoDB ObjectId 형식 사용 (24자 16진수 문자열)
        const validObjectId = '507f1f77bcf86cd799439011';
        req.user = { 
          _id: validObjectId, 
          id: validObjectId,
          email: 'admin@example.com',
          roles: ['user', 'admin']
        };
        return next();
      }
      
      // 토큰이 없는 경우 (프로덕션 및 개발 환경에서 BYPASS_AUTH가 false일 때)
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }
  } catch (error: any) {
    console.error('인증 처리 중 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

/**
 * Admin authorization middleware
 * Checks if authenticated user has admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }
  
  if (!req.user.roles.includes('admin')) {
    return res.status(403).json({ error: '접근 권한이 없습니다.' });
  }
  
  next();
}; 