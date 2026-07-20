import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/regulatory/audit-log';

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
      await writeAuditLog({
        actorType: 'ADMIN',
        actorId: username,
        actorEmail: username,
        action: 'ADMIN_LOGIN_SUCCESS',
        entityType: 'AdminSession',
        entityId: null,
        request,
      });
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        sessionToken: result.sessionToken,
        role: result.role,
        admin: AdminAuth.getAdminInfo(result.sessionToken)
      });
    } else {
      await writeAuditLog({
        actorType: 'ADMIN',
        actorId: username,
        action: 'ADMIN_LOGIN_FAILED',
        entityType: 'AdminSession',
        entityId: null,
        request,
      });
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