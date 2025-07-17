import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy - Comprehensive policy for third-party libraries
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://m.stripe.com https://b.stripecdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://js.stripe.com https://b.stripecdn.com",
    "img-src 'self' data: blob: https: https://js.stripe.com https://checkout.stripe.com https://m.stripe.com https://b.stripecdn.com",
    "font-src 'self' https://fonts.gstatic.com https://b.stripecdn.com",
    "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://m.stripe.com https://b.stripecdn.com wss://m.stripe.com",
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://m.stripe.com https://b.stripecdn.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "worker-src 'self' blob:",
    "child-src 'self' https://js.stripe.com https://checkout.stripe.com https://m.stripe.com",
    "media-src 'self'",
    "manifest-src 'self'",
    "prefetch-src 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);

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