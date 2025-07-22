import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { prisma } from './prisma';

export async function authenticateUser(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Auth header received:', authHeader ? 'Present' : 'Missing');
    
    const token = extractTokenFromHeader(authHeader);
    console.log('🔍 Token extracted:', token ? 'Success' : 'Failed');

    if (!token) {
      console.log('❌ No token provided in request');
      return { user: null, error: 'No token provided' };
    }

    console.log('🔍 Verifying token...');
    const payload = verifyToken(token);
    console.log('🔍 Token verification result:', payload ? 'Valid' : 'Invalid');
    
    if (!payload) {
      console.log('❌ Invalid token provided');
      return { user: null, error: 'Invalid token' };
    }

    console.log('🔍 Token payload:', { userId: payload.userId, email: payload.email });

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

    console.log('🔍 User found in database:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('❌ User not found in database');
      return { user: null, error: 'User not found' };
    }

    console.log('✅ Authentication successful for user:', user.email);
    return { user };
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    console.log('🔍 requireAuth middleware called for:', request.url);
    
    const { user, error } = await authenticateUser(request);
    
    if (error || !user) {
      console.log('❌ Authentication failed:', error);
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful, proceeding to handler');
    // Add user to request context
    (request as any).user = user;
    return handler(request);
  };
} 