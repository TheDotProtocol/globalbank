import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    console.log('🧪 International transfer test endpoint called');
    console.log('User:', { id: user.id, email: user.email });
    
    return NextResponse.json({
      success: true,
      message: 'International transfer API is working',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Test endpoint failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const body = await request.json();
    
    console.log('🧪 International transfer test POST called');
    console.log('User:', { id: user.id, email: user.email });
    console.log('Body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'International transfer POST test successful',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      },
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test POST endpoint error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Test POST endpoint failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
});
