import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify admin credentials
    const result = await AdminAuth.verifyCredentials(username, password);

    if (result.success && result.sessionToken) {
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        sessionToken: result.sessionToken,
        admin: AdminAuth.getAdminInfo()
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid credentials',
          message: result.message 
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Login failed',
        message: 'An error occurred during login'
      },
      { status: 500 }
    );
  }
} 