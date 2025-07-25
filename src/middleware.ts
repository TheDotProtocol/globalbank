import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'th', 'fr', 'hi', 'ta', 'zh', 'ja'];
const defaultLocale = 'en';

// Get the preferred locale from the request
function getLocale(request: NextRequest): string {
  // Check for locale in URL path
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameLocale) {
    return pathnameLocale;
  }
  
  // Check for locale in Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => locales.includes(lang.split('-')[0]));
    
    if (preferredLocale) {
      return preferredLocale.split('-')[0];
    }
  }
  
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) {
    return NextResponse.next();
  }
  
  // For now, just pass through and let client-side handle locale detection
  // This prevents 404 errors since we don't have separate locale directories
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|static|.*\\..*).*)',
  ],
}; 