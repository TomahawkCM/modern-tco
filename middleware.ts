import { type NextRequest, NextResponse } from 'next/server';

/**
 * Security: CORS Configuration
 * Explicit whitelist of allowed origins for API routes
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'https://modern-tco.vercel.app',
  'https://www.modern-tco.com',
  // Development origins
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];

/**
 * Middleware: Route rewrites and security headers
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin') || '';

  // Root path rewrite to /welcome
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/welcome';
    return NextResponse.rewrite(url);
  }

  // Security: CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    // Preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400', // 24 hours
        },
      });
    }

    // Regular API request
    const response = NextResponse.next();

    // Only set CORS headers if origin is whitelisted
    if (ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
    }

    // Security headers for all API responses
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|.*\\..*).*)'],
};
