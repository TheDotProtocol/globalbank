import { NextRequest, NextResponse } from 'next/server';
import { isProductionBlockedPath, productionBlockedResponse } from '@/lib/regulatory/production-guard';
import { validateProductionSecrets } from '@/lib/regulatory/secrets';

const locales = ['en', 'th', 'fr', 'hi', 'ta', 'zh', 'ja'];

// Warn once at cold start in production
if (process.env.NODE_ENV === 'production') {
  const warnings = validateProductionSecrets();
  warnings.forEach((w) => console.warn(`[REGULATORY] ${w}`));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Block debug/test/demo routes in production
  if (isProductionBlockedPath(pathname)) {
    return productionBlockedResponse();
  }

  // Skip locale handling for API and static assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
