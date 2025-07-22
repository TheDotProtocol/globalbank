import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log('🔍 Verifying JWT token...');
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('✅ JWT token verified successfully');
    return decoded;
  } catch (error) {
    console.error('❌ JWT token verification failed:', error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  console.log('🔍 Extracting token from header:', authHeader ? 'Header present' : 'Header missing');
  
  if (!authHeader) {
    console.log('❌ No authorization header');
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ Authorization header does not start with "Bearer "');
    return null;
  }
  
  const token = authHeader.substring(7);
  console.log('✅ Token extracted successfully');
  return token;
} 