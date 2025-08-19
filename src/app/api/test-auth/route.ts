import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization');
    
    console.log('🔍 Test Auth - Headers received:', {
      authorization: authHeader ? 'Present' : 'Missing',
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type')
    });

    return NextResponse.json({
      success: true,
      message: 'Test auth endpoint working',
      headers: {
        authorization: authHeader ? 'Present' : 'Missing',
        userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...',
        contentType: request.headers.get('content-type')
      }
    });

  } catch (error: any) {
    console.error('❌ Test auth error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}; 