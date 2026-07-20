import { NextResponse } from 'next/server';

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function areDemoRoutesAllowed(): boolean {
  return !isProductionEnvironment() || process.env.ALLOW_DEMO_ROUTES === 'true';
}

/** Routes that must never be reachable in production unless explicitly overridden. */
export const PRODUCTION_BLOCKED_ROUTES: string[] = [
  '/api/fix-transaction',
  '/api/kyc/update-status',
  '/api/setup-db',
  '/api/debug-auth',
  '/api/debug-kyc',
  '/api/debug-certificate',
  '/api/debug-certificate-step',
  '/api/debug-original-certificate',
  '/api/debug-fixed-deposit',
  '/api/test-auth',
  '/api/test-card',
  '/api/test-export',
  '/api/test-database',
  '/api/test-kyc-upload',
  '/api/transfers/international/demo',
  '/api/transfers/international/test',
  '/api/transfers/international/simple',
  '/api/transfers/international/working',
  '/api/admin/create-investors',
  '/api/admin/create-saleena-transfers',
  '/api/admin/add-baby-tau-transaction',
  '/api/admin/credit-ar-holdings',
  '/api/admin/test-auth',
  '/api/admin/test-dashboard',
];

export const PRODUCTION_BLOCKED_PAGE_PREFIXES = [
  '/test-transfer',
  '/test-credit',
  '/language-demo',
];

export function isProductionBlockedPath(pathname: string): boolean {
  if (!isProductionEnvironment() || areDemoRoutesAllowed()) {
    return false;
  }
  if (PRODUCTION_BLOCKED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return true;
  }
  if (PRODUCTION_BLOCKED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return true;
  }
  if (pathname.startsWith('/api/debug-') || pathname.startsWith('/api/test-')) {
    return true;
  }
  return false;
}

export function blockIfProductionDisabled(): NextResponse | null {
  if (isProductionEnvironment() && !areDemoRoutesAllowed()) {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production for regulatory compliance' },
      { status: 403 }
    );
  }
  return null;
}

export function productionBlockedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Forbidden — endpoint disabled in production' },
    { status: 403 }
  );
}
