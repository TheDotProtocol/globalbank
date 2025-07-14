import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticateUser(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { user: null, error: 'Invalid token' };
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        kycStatus: true,
        createdAt: true
      }
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Add user to request context
    (request as any).user = user;
    return handler(request);
  };
} 