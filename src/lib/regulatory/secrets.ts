const INSECURE_JWT_SECRETS = new Set([
  'your-super-secret-jwt-key-change-in-production',
  'change-admin-jwt-secret-in-production',
]);

export function getRequiredJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-only-jwt-secret-not-for-production';
  }
  if (process.env.NODE_ENV === 'production' && INSECURE_JWT_SECRETS.has(secret)) {
    throw new Error('JWT_SECRET must not use default value in production');
  }
  return secret;
}

export function getRequiredAdminJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_JWT_SECRET or JWT_SECRET must be set in production');
    }
    return 'dev-only-admin-jwt-secret';
  }
  if (process.env.NODE_ENV === 'production' && INSECURE_JWT_SECRETS.has(secret)) {
    throw new Error('Admin JWT secret must not use default value in production');
  }
  return secret;
}

export function validateProductionSecrets(): string[] {
  const warnings: string[] = [];
  if (process.env.NODE_ENV !== 'production') return warnings;

  if (!process.env.JWT_SECRET) warnings.push('JWT_SECRET is missing');
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    warnings.push('ADMIN_USERNAME and ADMIN_PASSWORD must be set (no defaults in production)');
  }
  if (!process.env.COMPLIANCE_USERNAME || !process.env.COMPLIANCE_PASSWORD) {
    warnings.push('COMPLIANCE_USERNAME and COMPLIANCE_PASSWORD must be set');
  }
  if (!process.env.DATABASE_URL) warnings.push('DATABASE_URL is missing');
  return warnings;
}
