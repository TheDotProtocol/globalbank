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

    const result = await AdminAuth.verifyCredentials(username, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      sessionToken: result.sessionToken,
      admin: AdminAuth.getAdminInfo()
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 