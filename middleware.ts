import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers (temporarily removing CSP for testing)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Temporarily commenting out CSP to test
  // const cspHeader = [
  //   "default-src 'self'",
  //   "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'strict-dynamic' https: http:",
  //   "style-src 'self' 'unsafe-inline' https: http:",
  //   "img-src 'self' data: blob: https: http:",
  //   "font-src 'self' https: http:",
  //   "connect-src 'self' https: http: wss: ws:",
  //   "frame-src 'self' https: http:",
  //   "object-src 'none'",
  //   "base-uri 'self'",
  //   "form-action 'self' https:",
  //   "worker-src 'self' blob:",
  //   "child-src 'self' https: http:",
  //   "media-src 'self' https: http:",
  //   "manifest-src 'self'",
  //   "prefetch-src 'self'"
  // ].join('; ');
  
  // response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 