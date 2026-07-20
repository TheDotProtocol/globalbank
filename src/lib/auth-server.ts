import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { prisma } from './prisma';

export async function authenticateUserWithDatabase(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return { user: null, error: 'Invalid token' };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        kycStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user };
  } catch {
    return { user: null, error: 'Authentication failed' };
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context?: unknown) => {
    const { user, error } = await authenticateUserWithDatabase(request);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    (request as any).user = user;
    return handler(request, context);
  };
}
