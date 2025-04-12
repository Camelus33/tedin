import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Type definition for auth result
interface AuthResult {
  success: boolean;
  userId?: string;
  message?: string;
}

/**
 * Verifies user authentication from request headers
 * 
 * @param req Next.js request object
 * @returns AuthResult object with authentication status
 */
export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        message: '유효한 인증 토큰이 없습니다.' 
      };
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return { 
        success: false, 
        message: '인증 토큰이 제공되지 않았습니다.' 
      };
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    
    if (!decoded || !decoded.userId) {
      return { 
        success: false, 
        message: '토큰이 유효하지 않습니다.' 
      };
    }

    // Return success with the user ID
    return {
      success: true,
      userId: decoded.userId
    };
  } catch (error) {
    console.error('Authentication error:', error);
    
    return { 
      success: false, 
      message: '인증 처리 중 오류가 발생했습니다.' 
    };
  }
} 