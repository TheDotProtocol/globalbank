import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    console.log('🔍 Debug auth endpoint called');
    
    // Log all headers
    const headers: { [key: string]: string } = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    console.log('🔍 All request headers:', headers);
    
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('❌ No authorization header found');
      return NextResponse.json(
        { error: 'No authorization header', headers: Object.keys(headers) },
        { status: 401 }
      );
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header does not start with Bearer');
      return NextResponse.json(
        { error: 'Invalid authorization format', authHeader },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    console.log('🔍 Token extracted:', token ? `Length: ${token.length}` : 'No token');
    
    return NextResponse.json({
      success: true,
      message: 'Debug auth successful',
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...',
      headers: Object.keys(headers)
    });
    
  } catch (error: any) {
    console.error('❌ Debug auth error:', error);
    return NextResponse.json(
      { 
        error: 'Debug auth failed', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}; 