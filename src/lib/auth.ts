import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { prisma } from './prisma';

export async function authenticateUser(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth: Authorization header present:', !!authHeader);
    
    const token = extractTokenFromHeader(authHeader);
    console.log('Auth: Token extracted:', !!token);

    if (!token) {
      console.log('Auth: No token provided');
      return { user: null, error: 'No token provided' };
    }

    const payload = verifyToken(token);
    console.log('Auth: Token verified:', !!payload);
    console.log('Auth: Payload user ID:', payload?.userId);
    
    if (!payload) {
      console.log('Auth: Invalid token');
      return { user: null, error: 'Invalid token' };
    }

    // Verify user still exists in database
    console.log('Auth: Looking up user in database...');
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

    console.log('Auth: User found in database:', !!user);
    console.log('Auth: User email:', user?.email);

    if (!user) {
      console.log('Auth: User not found in database');
      return { user: null, error: 'User not found' };
    }

    console.log('Auth: Authentication successful');
    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    console.error('Auth error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
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