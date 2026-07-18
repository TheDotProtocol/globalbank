import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'COMPLIANCE';

export interface AdminUser {
  username: string;
  password: string;
  email: string;
  role: AdminRole;
}

const ADMIN_USERS: AdminUser[] = [
  {
    username: process.env.ADMIN_USERNAME || 'admingdb',
    password: process.env.ADMIN_PASSWORD || 'GdbAdmin2024!Secure#Portal',
    email: 'admin@globaldotbank.org',
    role: 'SUPER_ADMIN',
  },
  {
    username: process.env.COMPLIANCE_USERNAME || 'compliancegdb',
    password: process.env.COMPLIANCE_PASSWORD || 'GdbCompliance2024!Secure#',
    email: 'compliance@globaldotbank.org',
    role: 'COMPLIANCE',
  },
];

function getAdminJwtSecret(): string {
  return process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'change-admin-jwt-secret-in-production';
}

interface AdminTokenPayload {
  username: string;
  role: AdminRole;
  type: 'admin';
}

export class AdminAuth {
  static async verifyCredentials(username: string, password: string): Promise<{
    success: boolean;
    message: string;
    sessionToken?: string;
    role?: AdminRole;
  }> {
    const admin = ADMIN_USERS.find((u) => u.username === username);
    if (!admin || admin.password !== password) {
      return { success: false, message: 'Invalid credentials' };
    }

    const sessionToken = jwt.sign(
      { username: admin.username, role: admin.role, type: 'admin' } satisfies AdminTokenPayload,
      getAdminJwtSecret(),
      { expiresIn: '24h' }
    );

    return { success: true, message: 'Login successful', sessionToken, role: admin.role };
  }

  static verifySession(sessionToken: string): { valid: boolean; role?: AdminRole; username?: string } {
    try {
      const decoded = jwt.verify(sessionToken, getAdminJwtSecret()) as AdminTokenPayload;
      if (decoded.type !== 'admin') return { valid: false };
      return { valid: true, role: decoded.role, username: decoded.username };
    } catch {
      return { valid: false };
    }
  }

  static getAdminInfo(sessionToken?: string): { username: string; email: string; role: AdminRole } {
    if (sessionToken) {
      const session = this.verifySession(sessionToken);
      if (session.valid && session.username) {
        const user = ADMIN_USERS.find((u) => u.username === session.username);
        return {
          username: session.username,
          email: user?.email || 'admin@globaldotbank.org',
          role: session.role || 'SUPER_ADMIN',
        };
      }
    }
    return { username: ADMIN_USERS[0].username, email: ADMIN_USERS[0].email, role: 'SUPER_ADMIN' };
  }

  static logout(_sessionToken: string): boolean {
    return true;
  }

  static hasRole(role: AdminRole, allowed: AdminRole[]): boolean {
    return allowed.includes(role);
  }
}

function extractToken(request: NextRequest): string | null {
  return request.headers.get('authorization')?.replace('Bearer ', '') || null;
}

export function requireAdminAuth(handler: Function, allowedRoles: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'COMPLIANCE']) {
  return async function (request: NextRequest, context?: unknown) {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
    }

    const session = AdminAuth.verifySession(token);
    if (!session.valid || !session.role || !AdminAuth.hasRole(session.role, allowedRoles)) {
      return NextResponse.json({ error: 'Invalid or expired admin session' }, { status: 401 });
    }

    (request as any).admin = AdminAuth.getAdminInfo(token);
    (request as any).adminToken = token;
    return handler(request, context);
  };
}

export function requireSuperAdmin(handler: Function) {
  return requireAdminAuth(handler, ['SUPER_ADMIN']);
}

export function requireComplianceAccess(handler: Function) {
  return requireAdminAuth(handler, ['SUPER_ADMIN', 'COMPLIANCE']);
}

export function isDemoRouteAllowed(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.ALLOW_DEMO_ROUTES === 'true';
}

export function blockDemoInProduction() {
  if (!isDemoRouteAllowed()) {
    return NextResponse.json({ error: 'Route disabled in production' }, { status: 403 });
  }
  return null;
}
