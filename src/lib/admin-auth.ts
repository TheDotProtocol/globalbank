import bcrypt from 'bcryptjs';

// Hardcoded admin credentials - NEVER CHANGE
const ADMIN_CREDENTIALS = {
  username: 'admingdb',
  password: 'GlobalBank2024!@#$%^&*()_+SecureAdmin', // Strong password with special characters
  email: 'admin@globalbank.com',
  role: 'SUPER_ADMIN'
};

// Admin session management
const adminSessions = new Map<string, { username: string; lastActivity: Date }>();

export class AdminAuth {
  // Verify admin credentials
  static async verifyCredentials(username: string, password: string): Promise<{
    success: boolean;
    message: string;
    sessionToken?: string;
  }> {
    try {
      // Check username
      if (username !== ADMIN_CREDENTIALS.username) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Check password
      const isValidPassword = password === ADMIN_CREDENTIALS.password;
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Generate session token
      const sessionToken = this.generateSessionToken();
      adminSessions.set(sessionToken, {
        username: ADMIN_CREDENTIALS.username,
        lastActivity: new Date()
      });

      return {
        success: true,
        message: 'Login successful',
        sessionToken
      };
    } catch (error) {
      console.error('Admin auth error:', error);
      return {
        success: false,
        message: 'Authentication failed'
      };
    }
  }

  // Verify admin session
  static verifySession(sessionToken: string): boolean {
    const session = adminSessions.get(sessionToken);
    if (!session) {
      return false;
    }

    // Check session expiry (24 hours)
    const now = new Date();
    const sessionAge = now.getTime() - session.lastActivity.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      adminSessions.delete(sessionToken);
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    return true;
  }

  // Get admin info
  static getAdminInfo(): {
    username: string;
    email: string;
    role: string;
  } {
    return {
      username: ADMIN_CREDENTIALS.username,
      email: ADMIN_CREDENTIALS.email,
      role: ADMIN_CREDENTIALS.role
    };
  }

  // Logout admin
  static logout(sessionToken: string): boolean {
    return adminSessions.delete(sessionToken);
  }

  // Generate session token
  private static generateSessionToken(): string {
    return Math.random().toString(36).substr(2, 15) + 
           Date.now().toString(36) + 
           Math.random().toString(36).substr(2, 15);
  }

  // Cleanup expired sessions
  static cleanupExpiredSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [token, session] of adminSessions.entries()) {
      const sessionAge = now.getTime() - session.lastActivity.getTime();
      if (sessionAge > maxAge) {
        adminSessions.delete(token);
      }
    }
  }

  // Get active sessions count
  static getActiveSessionsCount(): number {
    return adminSessions.size;
  }
}

// Admin middleware for API routes
export function requireAdminAuth(handler: Function) {
  return async function (request: NextRequest) {
    try {
      const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return NextResponse.json(
          { error: 'Admin authentication required' },
          { status: 401 }
        );
      }

      if (!AdminAuth.verifySession(sessionToken)) {
        return NextResponse.json(
          { error: 'Invalid or expired admin session' },
          { status: 401 }
        );
      }

      // Add admin info to request
      (request as any).admin = AdminAuth.getAdminInfo();
      
      return handler(request);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return NextResponse.json(
        { error: 'Admin authentication failed' },
        { status: 500 }
      );
    }
  };
} 