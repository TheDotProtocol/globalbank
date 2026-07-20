import jwt from 'jsonwebtoken';
import { getRequiredJwtSecret } from '@/lib/regulatory/secrets';

const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, getRequiredJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getRequiredJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}
