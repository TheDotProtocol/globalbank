import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { getRequiredAdminJwtSecret } from '@/lib/regulatory/secrets';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'COMPLIANCE';

export interface AdminUser {
  username: string;
  password: string;
  email: string;
  role: AdminRole;
}

function loadAdminUsers(): AdminUser[] {
  const users: AdminUser[] = [];

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (adminUser && adminPass) {
    users.push({
      username: adminUser,
      password: adminPass,
      email: process.env.ADMIN_EMAIL || 'admin@globaldotbank.com',
      role: 'SUPER_ADMIN',
    });
  } else if (process.env.NODE_ENV !== 'production') {
    users.push({
      username: 'admingdb',
      password: 'GdbAdmin2024!Secure#Portal',
      email: 'admin@globaldotbank.com',
      role: 'SUPER_ADMIN',
    });
  }

  const complianceUser = process.env.COMPLIANCE_USERNAME;
  const compliancePass = process.env.COMPLIANCE_PASSWORD;
  if (complianceUser && compliancePass) {
    users.push({
      username: complianceUser,
      password: compliancePass,
      email: process.env.COMPLIANCE_EMAIL || 'compliance@globaldotbank.com',
      role: 'COMPLIANCE',
    });
  } else if (process.env.NODE_ENV !== 'production') {
    users.push({
      username: 'compliancegdb',
      password: 'GdbCompliance2024!Secure#',
      email: 'compliance@globaldotbank.com',
      role: 'COMPLIANCE',
    });
  }

  return users;
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
    const ADMIN_USERS = loadAdminUsers();
    if (ADMIN_USERS.length === 0) {
      return { success: false, message: 'Admin authentication not configured' };
    }

    const admin = ADMIN_USERS.find((u) => u.username === username);
    if (!admin || admin.password !== password) {
      return { success: false, message: 'Invalid credentials' };
    }

    const sessionToken = jwt.sign(
      { username: admin.username, role: admin.role, type: 'admin' } satisfies AdminTokenPayload,
      getRequiredAdminJwtSecret(),
      { expiresIn: '8h' }
    );

    return { success: true, message: 'Login successful', sessionToken, role: admin.role };
  }

  static verifySession(sessionToken: string): { valid: boolean; role?: AdminRole; username?: string } {
    try {
      const decoded = jwt.verify(sessionToken, getRequiredAdminJwtSecret()) as AdminTokenPayload;
      if (decoded.type !== 'admin') return { valid: false };
      return { valid: true, role: decoded.role, username: decoded.username };
    } catch {
      return { valid: false };
    }
  }

  static getAdminInfo(sessionToken?: string): { username: string; email: string; role: AdminRole } {
    const ADMIN_USERS = loadAdminUsers();
    if (sessionToken) {
      const session = this.verifySession(sessionToken);
      if (session.valid && session.username) {
        const user = ADMIN_USERS.find((u) => u.username === session.username);
        return {
          username: session.username,
          email: user?.email || 'admin@globaldotbank.com',
          role: session.role || 'SUPER_ADMIN',
        };
      }
    }
    const fallback = ADMIN_USERS[0];
    return {
      username: fallback?.username || 'admin',
      email: fallback?.email || 'admin@globaldotbank.com',
      role: fallback?.role || 'SUPER_ADMIN',
    };
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

/** Maker-checker: creator cannot approve their own manual entry */
export function assertMakerChecker(createdBy: string, approverUsername: string): boolean {
  return createdBy !== approverUsername;
}
