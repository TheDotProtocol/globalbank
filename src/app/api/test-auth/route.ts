import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    return NextResponse.json({
      success: true,
      message: 'Authentication working',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Authentication test failed' },
      { status: 500 }
    );
  }
}); 